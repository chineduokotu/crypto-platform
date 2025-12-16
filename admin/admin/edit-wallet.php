<?php
session_start();
require_once '../connection.php';

// Redirect if not logged in
if (!isset($_SESSION['admin_id'])) {
    header("Location: ../index.php");
    exit();
}

$adminUsername = $_SESSION['admin_username'];

// Get wallet ID
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    header("Location: manage-wallets.php");
    exit();
}

$wallet_id = intval($_GET['id']);
$stmt = $conn->prepare("SELECT * FROM wallets WHERE id = ?");
$stmt->bind_param("i", $wallet_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "<h2 style='text-align:center;color:red;margin-top:50px;'>Wallet not found</h2>";
    exit();
}

$wallet = $result->fetch_assoc();

// Handle update form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $wallet_name = trim($_POST['wallet_name']);
    $wallet_address = trim($_POST['wallet_address']);
    $exchange_rate_buy = trim($_POST['exchange_rate_buy']);
    $exchange_rate_sell = trim($_POST['exchange_rate_sell']);

    if (empty($wallet_name) || empty($wallet_address) || empty($exchange_rate_buy) || empty($exchange_rate_sell)) {
        $error = "All fields are required.";
    } else {
        $update = $conn->prepare("UPDATE wallets 
            SET wallet_name=?, wallet_address=?, exchange_rate_buy=?, exchange_rate_sell=? 
            WHERE id=?");
        $update->bind_param("ssddi", $wallet_name, $wallet_address, $exchange_rate_buy, $exchange_rate_sell, $wallet_id);

        if ($update->execute()) {
            header("Location: manage-wallets.php?updated=1");
            exit();
        } else {
            $error = "Error updating wallet.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Edit Wallet</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

<style>
  body {
    background-color: #f5f7fa;
    font-family: 'Inter', sans-serif;
  }
  .sidebar {
    height: 100vh;
    background: #0d1b2a;
    color: #fff;
    position: fixed;
    width: 250px;
    top: 0;
    left: 0;
    padding-top: 70px;
    z-index: 999;
    transition: left 0.3s ease-in-out;
  }
  .sidebar a {
    color: #adb5bd;
    display: block;
    padding: 12px 20px;
    text-decoration: none;
    font-weight: 500;
    border-left: 3px solid transparent;
  }
  .sidebar a.active, .sidebar a:hover {
    color: #fff;
    background: #1b263b;
    border-left: 3px solid #00b4d8;
  }
  .content {
    margin-left: 250px;
    padding: 30px;
    transition: all 0.3s;
  }
  .navbar {
    position: fixed;
    top: 0;
    left: 250px;
    width: calc(100% - 250px);
    z-index: 1000;
    transition: all 0.3s;
  }
  .card {
    border: none;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  }
  .btn-primary {
    background: #00b4d8;
    border: none;
  }
  .btn-primary:hover {
    background: #009ac2;
  }

  @media (max-width: 991px) {
    .sidebar {
      left: -250px;
    }
    .sidebar.active {
      left: 0;
    }
    .navbar {
      left: 0;
      width: 100%;
    }
    .content {
      margin-left: 0;
    }
  }
</style>
</head>

<body>

<?php include("sidebar.php"); ?>

<div class="content">
  <div class="container-fluid">
    <br><br><br>
    <a href="manage-wallets.php" class="btn btn-link mb-3"><i class="bi bi-arrow-left"></i> Back to Wallets</a>

    <div class="card p-4">
      <h3 class="fw-bold mb-4"><i class="bi bi-pencil-square"></i> Edit Wallet</h3>

      <?php if (!empty($error)): ?>
        <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
      <?php endif; ?>

      <form method="POST">
        <div class="mb-3">
          <label class="form-label">Wallet Name</label>
          <input type="text" name="wallet_name" value="<?= htmlspecialchars($wallet['wallet_name']) ?>" class="form-control" required>
        </div>

        <div class="mb-3">
          <label class="form-label">Wallet Address</label>
          <input type="text" name="wallet_address" value="<?= htmlspecialchars($wallet['wallet_address']) ?>" class="form-control" required>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Exchange Rate (Buy ₦)</label>
            <input type="number" step="0.01" name="exchange_rate_buy" value="<?= htmlspecialchars($wallet['exchange_rate_buy']) ?>" class="form-control" required>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Exchange Rate (Sell ₦)</label>
            <input type="number" step="0.01" name="exchange_rate_sell" value="<?= htmlspecialchars($wallet['exchange_rate_sell']) ?>" class="form-control" required>
          </div>
        </div>

        <div class="text-end">
          <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Update Wallet</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.querySelector('#sidebarToggle');
  const sidebar = document.querySelector('#sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  } else {
    console.warn('Sidebar toggle elements not found.');
  }
});
</script>

</body>
</html>
