<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

include("connection.php");

$userId = $_POST['userId'] ?? null;
$wallet_name = $_POST['wallet_name'] ?? null;
$wallet_address = $_POST['wallet_address'] ?? null;
$amount = $_POST['amount'] ?? null;

if (!$userId || !$wallet_name || !$amount) {
    echo json_encode(["success" => false, "error" => "Missing fields"]);
    exit;
}

// Handle file upload
$proof_path = "";
if (isset($_FILES['payment_proof'])) {
    $file_name = time() . "_" . basename($_FILES['payment_proof']['name']);
    $target_dir = "uploads/";
    if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);
    $target_file = $target_dir . $file_name;

    if (move_uploaded_file($_FILES['payment_proof']['tmp_name'], $target_file)) {
        $proof_path = $target_file;
    } else {
        echo json_encode(["success" => false, "error" => "File upload failed"]);
        exit;
    }
}

$sql = "INSERT INTO payments_tb (user_id, wallet_name, wallet_address, amount, payment_proof, status, created_at)
        VALUES ('$userId', '$wallet_name', '$wallet_address', '$amount', '$proof_path', 'pending', NOW())";

if ($conn->query($sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}

$conn->close();
?>
