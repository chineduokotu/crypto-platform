<?php
session_start();
require_once '../connection.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

$adminUsername = $_SESSION['admin_username'];

// Fetch all payments with user info
$query = "SELECT p.*, u.first_name, u.last_name, u.email 
          FROM payments_tb p
          LEFT JOIN users u ON p.user_id = u.id
          ORDER BY p.id DESC";
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
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #ddd;
    }
    .action-btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      border: none;
      color: #fff;
      text-decoration: none;
      font-weight: 500;
      display: inline-block;
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
    </div>

    <?php if (!empty($_SESSION['msg'])): ?>
      <div class="alert alert-info"><?= htmlspecialchars($_SESSION['msg']); unset($_SESSION['msg']); ?></div>
    <?php endif; ?>

    <div class="card p-4">
      <div class="table-responsive">

<table class="table table-hover align-middle text-center">
  <thead class="table-dark">
    <tr>
      <th>#</th>
      <th>User</th>
      <th>Wallet Info</th>
      <th>Payment Method</th>
      <th>Rate (₦)</th>
      <th>Amount (₦)</th>
      <th>Bank Info</th>
      <th>Proof</th>
      <th>Status</th>
      <th>Date</th>
      <th>Approve</th>
      <th>Decline</th>
    </tr>
  </thead>
  <tbody>
    <?php if ($result && mysqli_num_rows($result) > 0): $count = 1; ?>
      <?php while ($row = mysqli_fetch_assoc($result)): ?>
        <?php
          $statusRaw = $row['status'] ?? 'Pending';
          $statusLower = strtolower($statusRaw);
          $badgeClass = match ($statusLower) {
            'approved' => 'status-approved',
            'rejected', 'declined' => 'status-rejected',
            default => 'status-pending'
          };

          $proofPath = "../uploads/" . $row['payment_proof'];
        ?>
        <tr>
          <td><?= $count++; ?></td>
          <td>
            <strong><?= htmlspecialchars($row['first_name'] . ' ' . $row['last_name']); ?></strong><br>
            <small class="text-muted"><?= htmlspecialchars($row['email']); ?></small>
          </td>
          <td>
            <strong><?= htmlspecialchars($row['wallet_name']); ?></strong><br>
            <small><?= htmlspecialchars($row['wallet_address']); ?></small>
          </td>
          <td><?= htmlspecialchars($row['payment_method']); ?></td>
          <td><?= number_format($row['exchange_rate'], 2); ?></td>
          <td><strong><?= number_format($row['amount'], 2); ?></strong></td>
          <td>
            <strong><?= htmlspecialchars($row['bank_name']); ?></strong><br>
            <?= htmlspecialchars($row['account_name']); ?><br>
            <small><?= htmlspecialchars($row['account_number']); ?></small>
          </td>
          <td>
            <?php if (!empty($row['payment_proof']) && file_exists($proofPath)): ?>
              <a href="<?= htmlspecialchars($proofPath); ?>" target="_blank">
                <img src="<?= htmlspecialchars($proofPath); ?>" class="proof-img" alt="Proof">
              </a>
            <?php elseif (!empty($row['payment_proof'])): ?>
              <a href="<?= htmlspecialchars($proofPath); ?>" target="_blank">View</a>
            <?php else: ?>
              <span class="text-muted">No Proof</span>
            <?php endif; ?>
          </td>
          <td>
            <span class="status-badge <?= $badgeClass; ?>"><?= ucfirst($statusLower); ?></span>
          </td>
          <td><?= date('Y-m-d H:i', strtotime($row['created_at'])); ?></td>
          <td>
            <?php if ($statusLower === 'pending'): ?>
              <a href="update-payment-status.php?id=<?= urlencode($row['id']); ?>&status=Approved"
                 class="action-btn btn-approve"
                 onclick="return confirm('Approve payment #<?= htmlspecialchars($row['id']); ?>?');">
                 <i class="bi bi-check-lg"></i> Approve
              </a>
            <?php else: ?>
              <button class="action-btn btn-disabled" disabled>—</button>
            <?php endif; ?>
          </td>
          <td>
            <?php if ($statusLower === 'pending'): ?>
              <a href="update-payment-status.php?id=<?= urlencode($row['id']); ?>&status=Declined"
                 class="action-btn btn-decline"
                 onclick="return confirm('Decline payment #<?= htmlspecialchars($row['id']); ?>?');">
                 <i class="bi bi-x-lg"></i> Decline
              </a>
            <?php else: ?>
              <button class="action-btn btn-disabled" disabled>—</button>
            <?php endif; ?>
          </td>
        </tr>
      <?php endwhile; ?>
    <?php else: ?>
      <tr>
        <td colspan="12" class="text-center text-muted py-4">
          No payment records found.
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
