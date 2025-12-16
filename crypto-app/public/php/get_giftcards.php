<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "connection.php";

$sql = "SELECT id, giftcard_name, exchange_rate FROM giftcards";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $giftcards = [];
    while ($row = $result->fetch_assoc()) {
        $giftcards[] = $row;
    }
    echo json_encode(["success" => true, "giftcards" => $giftcards]);
} else {
    echo json_encode(["success" => false, "error" => "No giftcards found"]);
}

$conn->close();
?>
