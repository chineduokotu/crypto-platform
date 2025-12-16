<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "connection.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? '';
    $card_type = $_POST['card_type'] ?? '';
    $card_value = $_POST['card_value'] ?? '';
    $naira_value = $_POST['naira_value'] ?? '';
    $exchange_rate = $_POST['exchange_rate'] ?? '';
    $bank_name = $_POST['bank_name'] ?? '';
    $account_name = $_POST['account_name'] ?? '';
    $account_number = $_POST['account_number'] ?? '';
    $proof_image = '';

    // 🔹 Validate required fields
    if (
        empty($user_id) || empty($card_type) || empty($card_value) ||
        empty($naira_value) || empty($exchange_rate) ||
        empty($bank_name) || empty($account_name) || empty($account_number)
    ) {
        echo json_encode(["success" => false, "error" => "All fields are required."]);
        exit;
    }

    // 🔹 Handle file upload
    if (isset($_FILES['proof_image']) && $_FILES['proof_image']['error'] == 0) {
        $uploadDir = "uploads/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = time() . "_" . basename($_FILES["proof_image"]["name"]);
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES["proof_image"]["tmp_name"], $targetFile)) {
            $proof_image = $targetFile;
        } else {
            echo json_encode(["success" => false, "error" => "Error uploading proof image."]);
            exit;
        }
    } else {
        echo json_encode(["success" => false, "error" => "Proof image is required."]);
        exit;
    }

    // 🔹 Insert data into giftcard_requests table
    $sql = "INSERT INTO giftcard_requests 
            (user_id, card_type, card_value, naira_value, exchange_rate, bank_name, account_name, account_number, proof_image, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW(), NOW())";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "isddsssss",
        $user_id,
        $card_type,
        $card_value,
        $naira_value,
        $exchange_rate,
        $bank_name,
        $account_name,
        $account_number,
        $proof_image
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Gift card exchange request submitted successfully!"]);
    } else {
        echo json_encode(["success" => false, "error" => "Database error: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "error" => "Invalid request method."]);
}
?>