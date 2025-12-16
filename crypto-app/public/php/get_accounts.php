<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

include("connection.php");

$sql = "SELECT id, account_name, account_number, bank_name FROM account_details";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $accounts = [];
    while ($row = $result->fetch_assoc()) {
        $accounts[] = $row;
    }
    echo json_encode(["success" => true, "accounts" => $accounts]);
} else {
    echo json_encode(["success" => false, "error" => "No accounts found"]);
}
$conn->close();
?>
