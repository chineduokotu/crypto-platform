<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "crypto_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "DB connection failed: " . $conn->connect_error]);
    exit;
}