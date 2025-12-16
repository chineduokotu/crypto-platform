<?php
// Allow React app to communicate
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/*
// Database credentials
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "crypto_db";

// Connect to database
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed: " . $conn->connect_error]);
    exit;
}
*/

include("connection.php");

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

$fullName = trim($data['fullName'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');
$confirmPassword = trim($data['confirmPassword'] ?? '');

if (!$fullName || !$email || !$password || $password !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input or passwords do not match"]);
    exit;
}

// Check if email exists
$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkStmt->store_result();
if ($checkStmt->num_rows > 0) {
    http_response_code(400);
    echo json_encode(["error" => "Email already registered"]);
    exit;
}
$checkStmt->close();

// Parse full name into first and last names
$parts = explode(" ", $fullName);
$first_name = $parts[0];
$last_name = isset($parts[1]) ? implode(" ", array_slice($parts, 1)) : "";

// Hash the password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $conn->prepare("
    INSERT INTO users 
    (first_name, last_name, name, email, password, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
");
$stmt->bind_param("sssss", $first_name, $last_name, $fullName, $email, $hashed_password);

if ($stmt->execute()) {
    // ✅ Return the inserted user ID for KYC
    echo json_encode([
        "success" => true,
        "message" => "User registered successfully",
        "userId" => $conn->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Registration failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
