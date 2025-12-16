<?php
session_start();
require_once '../connection.php';

// Check authentication
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

if (!isset($_GET['id'])) {
    header("Location: manage-wallets.php");
    exit();
}

$wallet_id = intval($_GET['id']);

// Delete wallet
$stmt = $conn->prepare("DELETE FROM wallets WHERE id = ?");
$stmt->bind_param("i", $wallet_id);

if ($stmt->execute()) {
    header("Location: manage-wallets.php?deleted=1");
    exit();
} else {
    echo "<h3 style='color:red;text-align:center;margin-top:50px;'>Error deleting wallet.</h3>";
}
?>
