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

// Insert into DB
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

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Exchange request submitted successfully"]);
} else {
    echo json_encode(["success" => false, "error" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
