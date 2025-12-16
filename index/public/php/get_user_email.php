<?php
// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include("connection.php");

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);
$userId = intval($data['userId'] ?? 0);

if (!$userId) {
    http_response_code(400);
    echo json_encode(["error" => "User ID is required"]);
    exit;
}

$stmt = $conn->prepare("SELECT email FROM users WHERE id=?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit;
}

$user = $result->fetch_assoc();

// Return email
echo json_encode([
    "success" => true,
    "email" => $user['email']
]);

$stmt->close();
$conn->close();
?>
