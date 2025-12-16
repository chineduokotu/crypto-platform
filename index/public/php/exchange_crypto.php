<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Include DB connection
include("connection.php");

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "error" => "Invalid request method"]);
    exit;
}

// Validate required fields
$requiredFields = [
    'user_id', 'wallet_name', 'wallet_address', 
    'crypto_amount', 'naira_value', 'exchange_rate',
    'bank_name', 'account_name', 'account_number'
];

foreach ($requiredFields as $field) {
    if (empty($_POST[$field])) {
        echo json_encode(["success" => false, "error" => "Missing field: $field"]);
        exit;
    }
}

// Sanitize inputs
$user_id        = intval($_POST['user_id']);
$wallet_name    = mysqli_real_escape_string($conn, $_POST['wallet_name']);
$wallet_address = mysqli_real_escape_string($conn, $_POST['wallet_address']);
$crypto_amount  = floatval($_POST['crypto_amount']);
$naira_value    = floatval($_POST['naira_value']);
$exchange_rate  = floatval($_POST['exchange_rate']);
$bank_name      = mysqli_real_escape_string($conn, $_POST['bank_name']);
$account_name   = mysqli_real_escape_string($conn, $_POST['account_name']);
$account_number = mysqli_real_escape_string($conn, $_POST['account_number']);
$status         = "Pending";
$proof_image    = "";

// Handle proof upload
if (isset($_FILES['proof_image']) && $_FILES['proof_image']['error'] === 0) {
    $targetDir = "uploads/exchange_proofs/";
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    $fileTmpPath = $_FILES['proof_image']['tmp_name'];
    $fileName = time() . "_" . basename($_FILES['proof_image']['name']);
    $targetFilePath = $targetDir . $fileName;

    if (move_uploaded_file($fileTmpPath, $targetFilePath)) {
        $proof_image = $targetFilePath;
    } else {
        echo json_encode(["success" => false, "error" => "Failed to upload proof image"]);
        exit;
    }
} else {
    echo json_encode(["success" => false, "error" => "Proof image is required"]);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // 🔹 Step 1: Get user details including referral email
    $userQuery = "SELECT email, referral FROM users WHERE id = ?";
    $userStmt = $conn->prepare($userQuery);
    $userStmt->bind_param("i", $user_id);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    
    if (!$userRow = $userResult->fetch_assoc()) {
        throw new Exception("User not found.");
    }
    
    $user_email = $userRow['email'];
    $referrer_email = $userRow['referral'];
    $userStmt->close();

    // 🔹 Step 2: Insert data into exchange_requests table
    $sql = "INSERT INTO exchange_requests (
                user_id, wallet_name, wallet_address, crypto_amount, naira_value, exchange_rate,
                bank_name, account_name, account_number, proof_image, status, created_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
            )";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "issdddsssss",
        $user_id, $wallet_name, $wallet_address, $crypto_amount, $naira_value, $exchange_rate,
        $bank_name, $account_name, $account_number, $proof_image, $status
    );

    if (!$stmt->execute()) {
        throw new Exception("Database error: " . $stmt->error);
    }

    $request_id = $conn->insert_id;
    
    // 🔹 Step 3: Calculate and process referral commission if referrer exists
    $commission_processed = false;
    $commission_amount = 0;
    $referrer_id = 0;
    
    if (!empty($referrer_email)) {
        $commission_amount = $naira_value * 0.10; // 10% commission
        $result = processReferralCommission($conn, $user_id, $user_email, $referrer_email, $naira_value, $request_id, $commission_amount);
        $commission_processed = $result['success'];
        $referrer_id = $result['referrer_id'] ?? 0;
    }

    // Commit transaction
    $conn->commit();

    $response = [
        "success" => true, 
        "message" => "Crypto exchange request submitted successfully!",
        "request_id" => $request_id
    ];
    
    if (!empty($referrer_email)) {
        $response["referral_processed"] = $commission_processed;
        $response["commission_amount"] = number_format($commission_amount, 2);
        if (!$commission_processed) {
            $response["referral_note"] = "Referral found but commission not processed";
        }
    }
    
    echo json_encode($response);

} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

if (isset($stmt)) $stmt->close();
$conn->close();

/**
 * Function to process referral commission using referrer's email
 * Returns array with success status and referrer_id
 */
function processReferralCommission($conn, $user_id, $user_email, $referrer_email, $transaction_amount, $request_id, $commission_amount) {
    // First, ensure tables exist
    createExchangeReferralTablesIfNotExist($conn);
    
    // Find referrer by email
    $referrerQuery = "SELECT id, email, name FROM users WHERE email = ?";
    $stmt = $conn->prepare($referrerQuery);
    $stmt->bind_param("s", $referrer_email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $referrer_id = $row['id'];
        $referrer_email = $row['email'];
        $referrer_name = $row['name'];
        
        // Prevent self-referral
        if ($referrer_id == $user_id) {
            logExchangeReferralActivity($conn, $referrer_id, $user_id, $commission_amount, $request_id, 'commission_failed', 'Self-referral not allowed');
            $stmt->close();
            return ['success' => false, 'referrer_id' => $referrer_id, 'error' => 'Self-referral'];
        }
        
        // 🔹 Credit the referrer's balance
        $updateBalanceQuery = "UPDATE users SET balance = balance + ? WHERE id = ?";
        $updateStmt = $conn->prepare($updateBalanceQuery);
        $updateStmt->bind_param("di", $commission_amount, $referrer_id);
        $updateStmt->execute();
        
        if ($updateStmt->affected_rows > 0) {
            // 🔹 Record the commission transaction
            recordExchangeCommissionTransaction($conn, $referrer_id, $user_id, $commission_amount, $request_id);
            
            // 🔹 Log the referral activity
            logExchangeReferralActivity($conn, $referrer_id, $user_id, $commission_amount, $request_id, 'commission_paid', 'Commission paid successfully');
            
            $updateStmt->close();
            $stmt->close();
            return ['success' => true, 'referrer_id' => $referrer_id];
        } else {
            // Log the failure
            logExchangeReferralActivity($conn, $referrer_id, $user_id, $commission_amount, $request_id, 'commission_failed', 'Failed to update referrer balance');
            $updateStmt->close();
            $stmt->close();
            return ['success' => false, 'referrer_id' => $referrer_id, 'error' => 'Balance update failed'];
        }
    } else {
        // Referrer email not found in users table
        logExchangeReferralActivity($conn, 0, $user_id, $commission_amount, $request_id, 'commission_failed', "Referrer email not found: $referrer_email");
        
        // Store in failed referrals table
        $failedRefQuery = "INSERT INTO exchange_failed_referrals 
                          (user_id, user_email, referrer_email, amount, request_id, error, created_at)
                          VALUES (?, ?, ?, ?, ?, ?, NOW())";
        $failedStmt = $conn->prepare($failedRefQuery);
        $error_msg = "Referrer email not found in system: $referrer_email";
        $failedStmt->bind_param("issdis", $user_id, $user_email, $referrer_email, $commission_amount, $request_id, $error_msg);
        $failedStmt->execute();
        $failedStmt->close();
        
        $stmt->close();
        return ['success' => false, 'referrer_id' => 0, 'error' => 'Referrer not found'];
    }
}

/**
 * Function to record exchange commission transaction
 */
function recordExchangeCommissionTransaction($conn, $referrer_id, $referred_id, $amount, $request_id) {
    // Insert commission record
    $sql = "INSERT INTO exchange_referral_commissions 
            (referrer_id, referred_id, request_id, amount, status, created_at)
            VALUES (?, ?, ?, ?, 'paid', NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiid", $referrer_id, $referred_id, $request_id, $amount);
    $stmt->execute();
    $stmt->close();
}

/**
 * Function to log exchange referral activity
 */
function logExchangeReferralActivity($conn, $referrer_id, $referred_id, $amount, $request_id, $activity_type = 'commission_paid', $description = '') {
    // Insert activity log
    $sql = "INSERT INTO exchange_referral_activity_log 
            (referrer_id, referred_id, request_id, amount, activity_type, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiidss", $referrer_id, $referred_id, $request_id, $amount, $activity_type, $description);
    $stmt->execute();
    $stmt->close();
}

/**
 * Function to ensure exchange referral tables exist
 */
function createExchangeReferralTablesIfNotExist($conn) {
    $tables = [
        "CREATE TABLE IF NOT EXISTS exchange_referral_commissions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            referrer_id INT NOT NULL,
            referred_id INT NOT NULL,
            request_id INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status ENUM('pending', 'paid') DEFAULT 'paid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_exchange_referrer (referrer_id),
            INDEX idx_exchange_referred (referred_id),
            INDEX idx_exchange_request (request_id)
        )",
        
        "CREATE TABLE IF NOT EXISTS exchange_referral_activity_log (
            id INT PRIMARY KEY AUTO_INCREMENT,
            referrer_id INT NOT NULL,
            referred_id INT NOT NULL,
            request_id INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            activity_type ENUM('commission_paid', 'referral_signup', 'commission_failed') DEFAULT 'commission_paid',
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_exchange_activity_referrer (referrer_id),
            INDEX idx_exchange_activity_referred (referred_id),
            INDEX idx_exchange_activity_request (request_id)
        )",
        
        "CREATE TABLE IF NOT EXISTS exchange_failed_referrals (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            user_email VARCHAR(255),
            referrer_email VARCHAR(255),
            amount DECIMAL(10,2) NOT NULL,
            request_id INT NOT NULL,
            error TEXT,
            resolved BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_exchange_failed_user (user_id),
            INDEX idx_exchange_failed_request (request_id)
        )"
    ];
    
    foreach ($tables as $sql) {
        $conn->query($sql);
    }
}
?>