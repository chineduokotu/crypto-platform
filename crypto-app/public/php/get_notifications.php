<?php
include 'connection.php';
header("Access-Control-Allow-Origin: *"); // or "http://localhost:8080" for stricter security
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$userId = $_GET['userId'] ?? '';

if (empty($userId)) {
    echo json_encode(["success" => false, "error" => "User ID missing"]);
    exit;
}

$stmt = $conn->prepare("SELECT id, title, message_body, status, created_at FROM notifications_tb WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}

echo json_encode(["success" => true, "notifications" => $notifications]);
?>
