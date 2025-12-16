<?php
// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Allow React app to communicate
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
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
    echo json_encode(["error" => "DB connection failed: " . $conn->connect_error]);
    exit;
}
*/
include("connection.php");

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required"]);
    exit;
}

// Check if user exists
$stmt = $conn->prepare("SELECT id, first_name, last_name, password, kyc_status FROM users WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit;
}

// Success: send back user info
echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "userId" => $user['id'],
    "fullName" => $user['first_name'] . " " . $user['last_name'],
    // Consider KYC completed only if approved
    "kycCompleted" => strtolower($user['kyc_status']) === 'approved'
]);


$stmt->close();
$conn->close();
