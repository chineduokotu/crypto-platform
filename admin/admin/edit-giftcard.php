<?php
session_start();
require_once '../connection.php';

// Check admin authentication
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

$adminUsername = $_SESSION['admin_username'];
$message = "";

// Check if giftcard ID is provided
if (!isset($_GET['id'])) {
    $_SESSION['msg'] = "⚠️ Missing giftcard ID.";
    header("Location: manage-giftcards.php");
    exit;
}

$giftcardId = intval($_GET['id']);

// Fetch giftcard data
$stmt = $conn->prepare("SELECT * FROM giftcards WHERE id = ?");
$stmt->bind_param("i", $giftcardId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $_SESSION['msg'] = "⚠️ Giftcard not found.";
    header("Location: manage-giftcards.php");
    exit;
}

$giftcard = $result->fetch_assoc();
$stmt->close();

// Handle form submission
if (isset($_POST['update_giftcard'])) {
    $giftcard_name = trim($_POST['giftcard_name']);
    $exchange_rate = floatval($_POST['exchange_rate']);

    if ($giftcard_name === "" || $exchange_rate <= 0) {
        $message = '<div style="background:#3d0000;color:#ff7070;padding:10px;border-radius:8px;">❌ Please provide valid giftcard name and exchange rate.</div>';
    } else {
        $stmt = $conn->prepare("UPDATE giftcards SET giftcard_name = ?, exchange_rate = ? WHERE id = ?");
        $stmt->bind_param("sdi", $giftcard_name, $exchange_rate, $giftcardId);

        if ($stmt->execute()) {
            $message = '<div style="background:#062e12;color:#4cff00;padding:10px;border-radius:8px;">✅ Giftcard updated successfully.</div>';
            // Refresh giftcard data
            $giftcard['giftcard_name'] = $giftcard_name;
            $giftcard['exchange_rate'] = $exchange_rate;
        } else {
            $message = '<div style="background:#3d0000;color:#ff7070;padding:10px;border-radius:8px;">❌ Failed to update giftcard.</div>';
        }
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Edit Giftcard - Admin Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    body { background-color: #f5f7fa; font-family: 'Inter', sans-serif; }
    .sidebar { height: 100vh; background: #0d1b2a; color: #fff; position: fixed; width: 250px; top: 0; left: 0; padding-top: 70px; z-index: 999; }
    .sidebar a { color: #adb5bd; display: block; padding: 12px 20px; text-decoration: none; font-weight: 500; border-left: 3px solid transparent; }
    .sidebar a.active, .sidebar a:hover { color: #fff; background: #1b263b; border-left: 3px solid #00b4d8; }
    .content { margin-left: 250px; padding: 30px; }
    .form-container { max-width: 500px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .form-container h3 { margin-bottom: 20px; }
    @media (max-width: 991px) { .sidebar { left: -250px; } .sidebar.active { left: 0; } .content { margin-left: 0; } }
  </style>
</head>
<body>

<?php include("sidebar.php"); ?>

<div class="content">
    <div class="form-container">
        <h3>Edit Giftcard</h3>

        <?php if ($message) echo $message; ?>

        <form method="post">
            <div class="mb-3">
                <label for="giftcard_name" class="form-label">Giftcard Name</label>
                <input type="text" class="form-control" id="giftcard_name" name="giftcard_name" value="<?= htmlspecialchars($giftcard['giftcard_name']) ?>" required>
            </div>

            <div class="mb-3">
                <label for="exchange_rate" class="form-label">Exchange Rate (₦)</label>
                <input type="number" step="0.01" class="form-control" id="exchange_rate" name="exchange_rate" value="<?= htmlspecialchars($giftcard['exchange_rate']) ?>" required>
            </div>

            <button type="submit" name="update_giftcard" class="btn btn-primary"><i class="bi bi-save"></i> Update Giftcard</button>
            <a href="manage-giftcards.php" class="btn btn-secondary ms-2"><i class="bi bi-arrow-left"></i> Back</a>
        </form>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
