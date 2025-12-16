<?php
header("Access-Control-Allow-Origin: *"); // or "http://localhost:8080" for stricter security
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// if this is an OPTIONS preflight request, stop execution
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'connection.php';

$userId = $_POST['userId'];
$walletName = $_POST['wallet_name'];
$walletAddress = $_POST['wallet_address'];
$amountNaira = $_POST['amount_naira'];
$cryptoAmount = $_POST['crypto_amount'];
$status = 'Pending';

if (!isset($_FILES['payment_proof'])) {
  echo json_encode(['success' => false, 'message' => 'No proof uploaded']);
  exit;
}

$proofName = time() . '_' . basename($_FILES['payment_proof']['name']);
$targetPath = "uploads/" . $proofName;
move_uploaded_file($_FILES['payment_proof']['tmp_name'], $targetPath);

$query = "INSERT INTO crypto_orders (user_id, wallet_name, wallet_address, amount_naira, crypto_amount, proof, status) 
          VALUES ('$userId', '$walletName', '$walletAddress', '$amountNaira', '$cryptoAmount', '$proofName', '$status')";
          
if (mysqli_query($conn, $query)) {
  echo json_encode(['success' => true, 'message' => 'Order saved successfully']);
} else {
  echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
