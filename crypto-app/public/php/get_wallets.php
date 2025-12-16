<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

include("connection.php");

$sql = "SELECT id, wallet_name, wallet_address, exchange_rate_buy, exchange_rate_sell FROM wallets";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $wallets = [];
    while ($row = $result->fetch_assoc()) {
        $wallets[] = [
            "id" => $row["id"],
            "wallet_name" => $row["wallet_name"],
            "wallet_address" => $row["wallet_address"],
            "exchange_rate_buy" => floatval($row["exchange_rate_buy"]),
            "exchange_rate_sell" => floatval($row["exchange_rate_sell"]),
        ];
    }
    echo json_encode(["success" => true, "wallets" => $wallets]);
} else {
    echo json_encode(["success" => false, "error" => "No wallets found"]);
}
$conn->close();
?>
