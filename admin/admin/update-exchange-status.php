<?php
session_start();
require_once '../connection.php';

// Ensure admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

// Check if ID and status were provided
if (isset($_GET['id']) && isset($_GET['status'])) {
    $id = intval($_GET['id']);
    $status = trim($_GET['status']);

    // Only allow valid status values
    $allowed_status = ['Approved', 'Declined'];
    if (!in_array($status, $allowed_status)) {
        $_SESSION['msg'] = "⚠️ Invalid status value.";
        header("Location: crypto-transactions.php");
        exit;
    }

    // Check if the exchange request exists
    $checkQuery = mysqli_query($conn, "SELECT * FROM exchange_requests WHERE id = '$id' LIMIT 1");
    if (!$checkQuery || mysqli_num_rows($checkQuery) === 0) {
        $_SESSION['msg'] = "⚠️ Exchange request not found.";
        header("Location: crypto-transactions.php");
        exit;
    }

    // Update the status
    $updateQuery = "UPDATE exchange_requests SET status = '$status' WHERE id = '$id'";
    $update = mysqli_query($conn, $updateQuery);

    if ($update) {
        $_SESSION['msg'] = "✅ Transaction #$id has been successfully marked as $status.";
    } else {
        $_SESSION['msg'] = "❌ Failed to update transaction status. Please try again.";
    }
} else {
    $_SESSION['msg'] = "⚠️ Invalid request parameters.";
}

// Redirect back to the main transactions page
header("Location: crypto-transactions.php");
exit;
?>
