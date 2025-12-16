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

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $wallet_name = trim($_POST['wallet_name']);
    $wallet_address = trim($_POST['wallet_address']);
    $exchange_rate_buy = trim($_POST['exchange_rate_buy']);
    $exchange_rate_sell = trim($_POST['exchange_rate_sell']);

    if (empty($wallet_name) || empty($wallet_address) || empty($exchange_rate_buy) || empty($exchange_rate_sell)) {
        $message = '<div style="background:#3d0000;color:#ff7070;padding:10px;border-radius:8px;">❌ All fields are required.</div>';
    } else {
        // ✅ Corrected SQL syntax (added missing comma before created_at)
        $stmt = $conn->prepare("INSERT INTO wallets (wallet_name, wallet_address, exchange_rate_buy, exchange_rate_sell, created_at) VALUES (?, ?, ?, ?, NOW())");
        
        // ✅ Corrected bind_param (2 strings, 2 decimals)
        $stmt->bind_param("ssdd", $wallet_name, $wallet_address, $exchange_rate_buy, $exchange_rate_sell);

        if ($stmt->execute()) {
            $message = '<div style="background:#062e12;color:#4cff00;padding:10px;border-radius:8px;">✅ Wallet added successfully.</div>';
        } else {
            $message = '<div style="background:#3d0000;color:#ff7070;padding:10px;border-radius:8px;">❌ Failed to add wallet. Please try again.</div>';
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
  <title>Add Wallet - Admin Dashboard</title>
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
      transition: all 0.3s;
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
    .sidebar.collapsed {
      width: 70px;
    }
    .sidebar.collapsed a span {
      display: none;
    }
    .sidebar.collapsed + .content {
      margin-left: 70px;
    }
    .navbar-brand {
      font-weight: 600;
      color: #00b4d8 !important;
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

<!-- Main Content -->
<div class="content">
  <div class="row g-4 my-4">
    
    <?php if ($message) echo $message; ?>

    <br>
    <h3>Add Wallets</h3>

    <form method="POST" action="">
      <div class="mb-2">
        <label for="wallet_name">Wallet Name</label>
        <input type="text" class="form-control" name="wallet_name" id="wallet_name" placeholder="e.g. Bitcoin" required>
      </div>
      <div class="mb-2">
        <label for="wallet_address">Wallet Address</label>
        <input type="text" class="form-control" name="wallet_address" id="wallet_address" placeholder="Enter wallet address" required>
      </div>
      <div class="mb-2">
        <label for="exchange_rate_buy">Exchange Rate <mark>Buy</mark> (₦)</label>
        <input type="number" class="form-control" step="0.01" name="exchange_rate_buy" id="exchange_rate_buy" placeholder="e.g. 120000" required>
      </div>
      <div class="mb-2">
        <label for="exchange_rate_sell">Exchange Rate <mark>Sell</mark> (₦)</label>
        <input type="number" class="form-control" step="0.01" name="exchange_rate_sell" id="exchange_rate_sell" placeholder="e.g. 130000" required>
      </div>

      <button type="submit" class="btn btn-primary">Add Wallet</button>
    </form>

  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
</script>

</body>
</html>
