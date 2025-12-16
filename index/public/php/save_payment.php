<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'connection.php';

// Collect form inputs safely
$user_id = $_POST['user_id'] ?? '';
$wallet_name = $_POST['wallet_name'] ?? '';
$exchange_rate = $_POST['exchange_rate'] ?? '';
$account_name = $_POST['account_name'] ?? '';
$account_number = $_POST['account_number'] ?? '';
$bank_name = $_POST['bank_name'] ?? '';
$amount = $_POST['amount'] ?? '';

if (!$user_id || !$wallet_name || !$account_name || !$account_number || !$bank_name || !$amount) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// Handle file upload
$upload_dir = __DIR__ . "/uploads/";
if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);
$proof_file = "";

if (isset($_FILES['payment_proof'])) {
    $file_name = time() . "_" . basename($_FILES['payment_proof']['name']);
    $target = $upload_dir . $file_name;

    if (move_uploaded_file($_FILES['payment_proof']['tmp_name'], $target)) {
        $proof_file = "uploads/" . $file_name;
    } else {
        echo json_encode([
            "success" => false,
            "error" => "File upload failed: " . json_encode($_FILES['payment_proof'])
        ]);
        exit;
    }
}

// Insert payment record
$stmtPayment = $conn->prepare("
    INSERT INTO payments_tb 
    (user_id, wallet_name, exchange_rate, account_name, account_number, bank_name, amount, payment_proof, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
");
$stmtPayment->bind_param(
    "issssssd",
    $user_id,
    $wallet_name,
    $exchange_rate,
    $account_name,
    $account_number,
    $bank_name,
    $amount,
    $proof_file
);

if ($stmtPayment->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmtPayment->error]);
}
?>
