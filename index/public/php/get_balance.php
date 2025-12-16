<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

include("connection.php");

$userId = $_GET['userId'] ?? null;

if (!$userId) {
    echo json_encode(["success" => false, "error" => "Missing userId"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT balance FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        echo json_encode([
            "success" => true,
            "balance" => $user['balance']
        ]);
    } else {
        echo json_encode(["success" => false, "error" => "User not found"]);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
