<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow React app to communicate
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
/*
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "crypto_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed: " . $conn->connect_error]);
    exit;
}
*/
include("connection.php");

// Get POST data
$userId = $_POST['userId'] ?? null;
$firstName = $_POST['firstName'] ?? '';
$lastName = $_POST['lastName'] ?? '';
$phoneNumber = $_POST['phoneNumber'] ?? '';
$address = $_POST['address'] ?? '';
$dateOfBirth = $_POST['dateOfBirth'] ?? '';
$documentType = $_POST['documentType'] ?? '';
$documentFile = $_FILES['documentFile'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(["error" => "User ID is required"]);
    exit;
}

// Handle document upload if exists
$uploadedFilePath = null;
if ($documentFile && $documentFile['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . "/uploads/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext = pathinfo($documentFile['name'], PATHINFO_EXTENSION);
    $fileName = "kyc_{$userId}_" . time() . "." . $ext;
    $uploadedFilePath = $uploadDir . $fileName;

    if (!move_uploaded_file($documentFile['tmp_name'], $uploadedFilePath)) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to save uploaded document"]);
        exit;
    }
}

// Update the user's KYC data with correct column names
$stmt = $conn->prepare("
    UPDATE users 
    SET first_name=?, last_name=?, phone_number=?, address=?, date_of_birth=?, document_type=?, document_file=?, kyc_status=0, updated_at=NOW() 
    WHERE id=?
");
$stmt->bind_param(
    "sssssssi",
    $firstName,
    $lastName,
    $phoneNumber,
    $address,
    $dateOfBirth,
    $documentType,
    $uploadedFilePath,
    $userId
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "KYC submitted successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "KYC submission failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
