<?php
// Allow requests from your React app
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/*
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
*/
include("connection.php");
// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

$userId = $data['userId'] ?? null;
$firstName = $data['firstName'] ?? '';
$lastName = $data['lastName'] ?? '';
$email = $data['email'] ?? '';
$phoneNumber = $data['phoneNumber'] ?? '';
$address = $data['address'] ?? '';
$dateOfBirth = $data['dateOfBirth'] ?? '';

if (!$userId) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "User ID is required"]);
    exit;
}

// Update user info
$stmt = $conn->prepare("
    UPDATE users 
    SET first_name=?, last_name=?, email=?, phone_number=?, address=?, date_of_birth=?, updated_at=NOW()
    WHERE id=?
");
$stmt->bind_param("ssssssi", $firstName, $lastName, $email, $phoneNumber, $address, $dateOfBirth, $userId);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Update failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
