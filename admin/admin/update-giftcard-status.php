<?php
require_once '../connection.php';
session_start();

if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

$id = $_GET['id'] ?? '';
$status = $_GET['status'] ?? '';

if (empty($id) || empty($status)) {
    header('Location: giftcard-transactions.php');
    exit;
}

// 🔹 Temporary disable safe updates and foreign key checks
$conn->query("SET SESSION sql_mode=''");
$conn->query("SET FOREIGN_KEY_CHECKS=0");

// 🔹 Update status
$stmt = $conn->prepare("UPDATE giftcard_requests SET status = ?, updated_at = NOW() WHERE id = ?");
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    $_SESSION['msg'] = "Gift card request #$id has been marked as $status.";
} else {
    $_SESSION['msg'] = "Error updating request: " . $stmt->error;
}

// 🔹 Re-enable
$conn->query("SET FOREIGN_KEY_CHECKS=1");

$stmt->close();
$conn->close();

header('Location: giftcard-transactions.php');
exit;
?>