<?php
session_start();
require_once '../connection.php';

// Check admin authentication
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

$adminUsername = $_SESSION['admin_username'];

// Fetch all wallets
$query = "SELECT * FROM wallets ORDER BY id DESC";
$result = mysqli_query($conn, $query);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Manage Wallets</title>
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
    .card {
      border: none;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .btn-edit {
      background: #00b4d8;
      color: #fff;
      border: none;
      padding: 5px 10px;
      border-radius: 5px;
    }
    .btn-edit:hover {
      background: #009ac2;
    }
    .btn-delete {
      background: #dc3545;
      color: #fff;
      border: none;
      padding: 5px 10px;
      border-radius: 5px;
    }
    .btn-delete:hover {
      background: #b52a37;
    }
    @media (max-width: 991px) {
      .sidebar {
        left: -250px;
      }
      .sidebar.active {
        left: 0;
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
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="fw-bold text-dark">💼 Manage Wallets</h2>
      <a href="add-wallet.php" class="btn btn-primary"><i class="bi bi-plus-circle"></i> Add Wallet</a>
    </div>

    <div class="card p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Wallet Name</th>
              <th scope="col">Wallet Address</th>
              <th scope="col">Buy Rate (₦)</th>
              <th scope="col">Sell Rate (₦)</th>
              <th scope="col">Created</th>
              <th scope="col" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php if (mysqli_num_rows($result) > 0): ?>
              <?php while ($wallet = mysqli_fetch_assoc($result)): ?>
                <tr>
                  <td><?= htmlspecialchars($wallet['id']); ?></td>
                  <td><?= htmlspecialchars($wallet['wallet_name']); ?></td>
                  <td><?= htmlspecialchars($wallet['wallet_address']); ?></td>
                  <td><?= number_format($wallet['exchange_rate_buy'], 2); ?></td>
                  <td><?= number_format($wallet['exchange_rate_sell'], 2); ?></td>
                  <td><?= date('Y-m-d', strtotime($wallet['created_at'])); ?></td>
                  <td class="text-center">
                    <a href="edit-wallet.php?id=<?= $wallet['id']; ?>" class="btn-edit"><i class="bi bi-pencil-square"></i></a>
                    <a href="delete-wallet.php?id=<?= $wallet['id']; ?>" class="btn-delete" onclick="return confirm('Are you sure you want to delete this wallet?');"><i class="bi bi-trash"></i></a>
                  </td>
                </tr>
              <?php endwhile; ?>
            <?php else: ?>
              <tr><td colspan="7" class="text-center text-muted">No wallets found.</td></tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
