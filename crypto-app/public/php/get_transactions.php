<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'connection.php';

$userId = $_GET['userId'] ?? null;

if (!$userId) {
    echo json_encode(["success" => false, "error" => "Missing user ID"]);
    exit;
}

// Fetch normal payments
$query1 = "SELECT id, wallet_name, amount, 'Payment' AS type, status, created_at 
           FROM payments_tb 
           WHERE user_id = '$userId'";

// Fetch exchange requests
$query2 = "SELECT id, wallet_name, naira_value AS amount, 'Exchange' AS type, status, created_at 
           FROM exchange_requests 
           WHERE user_id = '$userId'";

// Fetch gift card requests
$query3 = "SELECT id, card_type AS wallet_name, naira_value AS amount, 'GiftCard' AS type, status, created_at 
           FROM giftcard_requests 
           WHERE user_id = '$userId'";

$result1 = mysqli_query($conn, $query1);
$result2 = mysqli_query($conn, $query2);
$result3 = mysqli_query($conn, $query3);

$transactions = [];

if ($result1) {
    while ($row = mysqli_fetch_assoc($result1)) {
        $transactions[] = $row;
    }
}

if ($result2) {
    while ($row = mysqli_fetch_assoc($result2)) {
        $transactions[] = $row;
    }
}

if ($result3) {
    while ($row = mysqli_fetch_assoc($result3)) {
        $transactions[] = $row;
    }
}

// Sort by date (most recent first)
usort($transactions, function ($a, $b) {
    return strtotime($b['created_at']) - strtotime($a['created_at']);
});

if (count($transactions) > 0) {
    echo json_encode(["success" => true, "transactions" => $transactions]);
} else {
    echo json_encode(["success" => false, "error" => "No transactions found"]);
}

mysqli_close($conn);
?>
