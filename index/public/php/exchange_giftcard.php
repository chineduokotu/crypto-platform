<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "connection.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? '';
    $card_type = $_POST['card_type'] ?? '';
    $card_value = $_POST['card_value'] ?? '';
    $naira_value = $_POST['naira_value'] ?? '';
    $exchange_rate = $_POST['exchange_rate'] ?? '';
    $bank_name = $_POST['bank_name'] ?? '';
    $account_name = $_POST['account_name'] ?? '';
    $account_number = $_POST['account_number'] ?? '';
    $proof_image = '';

    // 🔹 Validate required fields
    if (
        empty($user_id) || empty($card_type) || empty($card_value) ||
        empty($naira_value) || empty($exchange_rate) ||
        empty($bank_name) || empty($account_name) || empty($account_number)
    ) {
        echo json_encode(["success" => false, "error" => "All fields are required."]);
        exit;
    }

    // 🔹 Handle file upload
    if (isset($_FILES['proof_image']) && $_FILES['proof_image']['error'] == 0) {
        $uploadDir = "uploads/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = time() . "_" . basename($_FILES["proof_image"]["name"]);
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES["proof_image"]["tmp_name"], $targetFile)) {
            $proof_image = $targetFile;
        } else {
            echo json_encode(["success" => false, "error" => "Error uploading proof image."]);
            exit;
        }
    } else {
        echo json_encode(["success" => false, "error" => "Proof image is required."]);
        exit;
    }

    // Start transaction to ensure data consistency
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

        // 🔹 Step 2: Insert data into giftcard_requests table
        $sql = "INSERT INTO giftcard_requests 
                (user_id, card_type, card_value, naira_value, exchange_rate, bank_name, account_name, account_number, proof_image, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW(), NOW())";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "isddsssss",
            $user_id,
            $card_type,
            $card_value,
            $naira_value,
            $exchange_rate,
            $bank_name,
            $account_name,
            $account_number,
            $proof_image
        );

        if (!$stmt->execute()) {
            throw new Exception("Database error: " . $stmt->error);
        }

        $request_id = $conn->insert_id;
        
        // 🔹 Step 3: Calculate and process referral commission if referrer exists
        if (!empty($referrer_email)) {
            processReferralCommissionByEmail($conn, $user_id, $user_email, $referrer_email, $naira_value, $request_id);
        }

        // Commit transaction
        $conn->commit();

        echo json_encode([
            "success" => true, 
            "message" => "Gift card exchange request submitted successfully!",
            "referral_processed" => !empty($referrer_email)
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }

    if (isset($stmt)) $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "error" => "Invalid request method."]);
}

/**
 * Function to process referral commission using referrer's email
 */
function processReferralCommissionByEmail($conn, $user_id, $user_email, $referrer_email, $transaction_amount, $request_id) {
    // Calculate 10% commission
    $commission = $transaction_amount * 0.10;
    
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
        
        // 🔹 Credit the referrer's balance
        $updateBalanceQuery = "UPDATE users SET balance = balance + ? WHERE id = ?";
        $updateStmt = $conn->prepare($updateBalanceQuery);
        $updateStmt->bind_param("di", $commission, $referrer_id);
        $updateStmt->execute();
        
        if ($updateStmt->affected_rows > 0) {
            // 🔹 Record the commission transaction
            recordCommissionTransaction($conn, $referrer_id, $user_id, $commission, $request_id);
            
            // 🔹 Log the referral activity
            logReferralActivity($conn, $referrer_id, $user_id, $commission, $request_id);
            
            // 🔹 Optional: Send notification to referrer
            // sendCommissionNotification($referrer_email, $referrer_name, $commission, $user_email);
        } else {
            // Log the failure
            error_log("Failed to update balance for referrer ID: $referrer_id");
        }
        $updateStmt->close();
    } else {
        // Referrer email not found in users table
        error_log("Referrer email not found: $referrer_email for user ID: $user_id");
        
        // Optionally, you could store this in a separate table for manual review
        $failedRefQuery = "INSERT INTO failed_referrals 
                          (user_id, user_email, referrer_email, amount, request_id, error, created_at)
                          VALUES (?, ?, ?, ?, ?, 'Referrer email not found in system', NOW())";
        $failedStmt = $conn->prepare($failedRefQuery);
        $failedStmt->bind_param("issdi", $user_id, $user_email, $referrer_email, $commission, $request_id);
        $failedStmt->execute();
        $failedStmt->close();
    }
    $stmt->close();
}

/**
 * Function to record commission transaction
 */
function recordCommissionTransaction($conn, $referrer_id, $referred_id, $amount, $request_id) {
    $sql = "INSERT INTO referral_commissions 
            (referrer_id, referred_id, request_id, amount, status, created_at)
            VALUES (?, ?, ?, ?, 'paid', NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiid", $referrer_id, $referred_id, $request_id, $amount);
    $stmt->execute();
    $stmt->close();
}

/**
 * Function to log referral activity
 */
function logReferralActivity($conn, $referrer_id, $referred_id, $amount, $request_id) {
    $sql = "INSERT INTO referral_activity_log 
            (referrer_id, referred_id, request_id, amount, activity_type, created_at)
            VALUES (?, ?, ?, ?, 'commission_paid', NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiid", $referrer_id, $referred_id, $request_id, $amount);
    $stmt->execute();
    $stmt->close();
}

/**
 * Optional: Function to send commission notification
 */
function sendCommissionNotification($referrer_email, $referrer_name, $commission, $referred_user_email) {
    // Implement email notification
    $subject = "🎉 You've Earned a Referral Commission!";
    $message = "Hello $referrer_name,\n\n";
    $message .= "You've earned a referral commission of ₦" . number_format($commission, 2) . "\n";
    $message .= "This commission was earned from your referral: $referred_user_email\n\n";
    $message .= "The amount has been credited to your account balance.\n\n";
    $message .= "Thank you for referring others to our platform!\n";
    
    // Use mail() function or your preferred email library
    // mail($referrer_email, $subject, $message);
}
?>