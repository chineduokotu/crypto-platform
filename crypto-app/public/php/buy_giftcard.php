<?php
// Allow requests from localhost:8080
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
include("connection.php");
// Get POST data
$user_id = $_POST['user_id'] ?? null;
$card_type = $_POST['card_type'] ?? null;
$card_value = $_POST['card_value'] ?? null;
$naira_value = $_POST['naira_value'] ?? null;
$exchange_rate = $_POST['exchange_rate'] ?? null;

if (!$user_id || !$card_type || !$card_value || !$naira_value || !$exchange_rate) {
    echo json_encode(['success' => false, 'error' => "All fields are required."]);
    exit;
}

// Insert into giftcard_requests table
$stmt = $conn->prepare("
    INSERT INTO giftcard_requests 
    (user_id, card_type, card_value, naira_value, exchange_rate, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'Pending', NOW(), NOW())
");

$stmt->bind_param("issdd", $user_id, $card_type, $card_value, $naira_value, $exchange_rate);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
