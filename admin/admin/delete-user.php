<?php
session_start();
require_once '../connection.php';

// Ensure only admins can access
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

// Check if user ID is provided
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    header('Location: manage-users.php?error=InvalidUser');
    exit;
}

$user_id = intval($_GET['id']);

// Delete query using prepared statement
$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);

if ($stmt->execute()) {
    // Deletion successful
    header('Location: manage-users.php?success=UserDeleted');
} else {
    // Deletion failed
    header('Location: manage-users.php?error=DeleteFailed');
}

$stmt->close();
$conn->close();
exit;
?>
