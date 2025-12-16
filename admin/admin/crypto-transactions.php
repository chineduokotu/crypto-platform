<?php
session_start();
require_once '../connection.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

$adminUsername = $_SESSION['admin_username'];

// Fetch all crypto exchange requests with user info
$query = "SELECT e.*, u.first_name, u.last_name, u.email 
          FROM exchange_requests e
          LEFT JOIN users u ON e.user_id = u.id
          ORDER BY e.id DESC";
$result = mysqli_query($conn, $query);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Crypto Transactions</title>
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
    .status-badge {
      font-size: 0.85rem;
      padding: 4px 8px;
      border-radius: 5px;
      display: inline-block;
    }
    .status-pending { background: #ffeeba; color: #856404; }
    .status-approved { background: #d4edda; color: #155724; }
    .status-rejected { background: #f8d7da; color: #721c24; }
    .proof-img {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 6px;
      cursor: pointer;
    }
    .action-btn {
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.875rem;
      border: none;
      color: #fff;
      margin-right: 6px;
      text-decoration: none;
    }
    .btn-approve { background: #198754; }
    .btn-decline { background: #dc3545; }
    .btn-disabled { background: #6c757d; cursor: not-allowed; }
    @media (max-width: 991px) {
      .sidebar { left: -250px; }
      .sidebar.active { left: 0; }
      .content { margin-left: 0; }
    }
  </style>
</head>
<body>

<?php include("sidebar.php"); ?>

<div class="content">
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="fw-bold text-dark">💱 Crypto Transactions</h2>
      <!-- optional add filters / search -->
    </div>

    <?php if (!empty($_SESSION['msg'])): ?>
      <div class="alert alert-info"><?= htmlspecialchars($_SESSION['msg']); unset($_SESSION['msg']); ?></div>
    <?php endif; ?>

    <div class="card p-4">
      <div class="table-responsive">
        <style>
  .table thead th {
    vertical-align: middle;
    text-align: center;
  }
  .table td {
    vertical-align: middle;
  }
  .proof-img {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid #ddd;
  }
  .status-badge {
    padding: 5px 10px;
    border-radius: 20px;
    font-weight: 600;
    text-transform: capitalize;
  }
  .status-approved {
    background-color: #d4edda;
    color: #155724;
  }
  .status-rejected {
    background-color: #f8d7da;
    color: #721c24;
  }
  .status-pending {
    background-color: #fff3cd;
    color: #856404;
  }
  .action-btn {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    text-decoration: none;
    font-weight: 500;
    margin: 2px 3px;
  }
  .btn-approve {
    background-color: #198754;
    color: #fff;
  }
  .btn-decline {
    background-color: #dc3545;
    color: #fff;
  }
  .btn-disabled {
    background-color: #6c757d;
    color: #fff;
    cursor: not-allowed;
  }
  .action-btn:hover {
    opacity: 0.9;
  }
</style>

<table class="table table-hover align-middle">
  <thead class="table-dark text-center">
    <tr>
      <th>#</th>
      <th>User</th>
      <th>Wallet</th>
      <th>Crypto Amount</th>
      <th>Rate (₦)</th>
      <th>Naira Value (₦)</th>
      <th>Bank Info</th>
      <th>Proof</th>
      <th>Status</th>
      <th>Date</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <?php if ($result && mysqli_num_rows($result) > 0): ?>
      <?php while ($row = mysqli_fetch_assoc($result)): ?>
        <?php
          $statusRaw = $row['status'] ?? 'Pending';
          $statusLower = strtolower($statusRaw);
          $badgeClass = match ($statusLower) {
            'approved' => 'status-approved',
            'rejected', 'declined' => 'status-rejected',
            default => 'status-pending'
          };

          // proof image path
          $proofPath = '';
          if (!empty($row['proof_image'])) {
              $proofPath = (strpos($row['proof_image'], 'uploads/') !== false)
                ? "../../cosmic-view-frames-main/public/php/" . $row['proof_image']
                : "../../cosmic-view-frames-main/public/php/" . $row['proof_image'];
          }
        ?>
        <tr>
          <td class="text-center">#</td>
          <td>
            <strong><?= htmlspecialchars(trim($row['first_name'] . ' ' . $row['last_name'])); ?></strong><br>
            <small class="text-muted"><?= htmlspecialchars($row['email']); ?></small>
          </td>
          <td>
            <strong><?= htmlspecialchars($row['wallet_name']); ?></strong><br>
            <small><?= htmlspecialchars($row['wallet_address']); ?></small>
          </td>
          <td class="text-center"><?= htmlspecialchars($row['crypto_amount']); ?></td>
          <td class="text-center"><?= number_format($row['exchange_rate'], 2); ?></td>
          <td class="text-center"><strong><?= number_format($row['naira_value'], 2); ?></strong></td>
          <td>
            <strong><?= htmlspecialchars($row['bank_name']); ?></strong><br>
            <?= htmlspecialchars($row['account_name']); ?><br>
            <small><?= htmlspecialchars($row['account_number']); ?></small>
          </td>
          <td class="text-center">
            <?php if (!empty($proofPath) && file_exists($proofPath)): ?>
              <a href="<?= htmlspecialchars($proofPath); ?>" target="_blank">
                <img src="<?= htmlspecialchars($proofPath); ?>" class="proof-img" alt="Proof">
              </a>
            <?php elseif (!empty($row['proof_image'])): ?>
              <a href="<?= htmlspecialchars($proofPath); ?>" target="_blank">View</a>
            <?php else: ?>
              <span class="text-muted">No Proof</span>
            <?php endif; ?>
          </td>
          <td class="text-center">
            <span class="status-badge <?= $badgeClass; ?>"><?= htmlspecialchars(ucfirst($statusLower)); ?></span>
          </td>
          <td class="text-center"><?= date('Y-m-d H:i', strtotime($row['created_at'])); ?></td>
          <td class="text-center">
            <?php if ($statusLower === 'pending'): ?>
              <a href="update-exchange-status.php?id=<?= urlencode($row['id']); ?>&status=Approved"
                 class="action-btn btn-approve"
                 onclick="return confirm('Are you sure you want to APPROVE transaction #<?= htmlspecialchars($row['id']); ?>?');">
                 <i class="bi bi-check-lg"></i> Approve
              </a>
              <a href="update-exchange-status.php?id=<?= urlencode($row['id']); ?>&status=Declined"
                 class="action-btn btn-decline"
                 onclick="return confirm('Are you sure you want to DECLINE transaction #<?= htmlspecialchars($row['id']); ?>?');">
                 <i class="bi bi-x-lg"></i> Decline
              </a>
            <?php else: ?>
              <button class="action-btn btn-disabled" disabled>No actions</button>
            <?php endif; ?>
          </td>
        </tr>
      <?php endwhile; ?>
    <?php else: ?>
      <tr>
        <td colspan="11" class="text-center text-muted py-4">
          No crypto exchange transactions found.
        </td>
      </tr>
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
