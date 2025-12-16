<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("connection.php");

// Get userId from query
$userId = $_GET['userId'] ?? null;
if (!$userId) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "User ID is required"]);
    exit;
}

// Fetch user
$stmt = $conn->prepare("SELECT first_name, last_name, email, phone_number, address, date_of_birth FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user) {
    echo json_encode(["success" => true, "user" => $user]);
} else {
    echo json_encode(["success" => false, "error" => "User not found"]);
}

$stmt->close();
$conn->close();
