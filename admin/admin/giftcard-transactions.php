<?php
session_start();
require_once '../connection.php';

// 🔐 Ensure admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

$adminUsername = $_SESSION['admin_username'];

// 🔹 Fetch all gift card exchange requests
$query = "SELECT gr.*, u.first_name, u.last_name, u.email 
          FROM giftcard_requests gr
          LEFT JOIN users u ON gr.user_id = u.id
          ORDER BY gr.id DESC";
$result = mysqli_query($conn, $query);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Manage Gift Card Requests</title>
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
    }
    .card {
      border: none;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .status-badge {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-approved { background: #d4edda; color: #155724; }
    .status-declined { background: #f8d7da; color: #721c24; }
    .btn-action {
      padding: 5px 10px;
      border-radius: 5px;
      color: #fff;
      border: none;
    }
    .btn-approve { background: #198754; }
    .btn-decline { background: #dc3545; }
    .proof-thumb {
      width: 60px;
      height: 60px;
      border-radius: 5px;
      object-fit: cover;
      cursor: pointer;
    }
  </style>
</head>
<body>

<?php include("sidebar.php"); ?>

<div class="content">
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="fw-bold text-dark">🎁 Manage Gift Card Exchanges</h2>
    </div>

    <div class="card p-4">
      <div class="table-responsive">
       <table class="table table-hover align-middle">
  <thead class="table-dark">
    <tr>
      <th>#</th>
      <th>User</th>
      <th>Gift Card</th>
      <th>USD Value</th>
      <th>Rate (₦)</th>
      <th>Naira Value (₦)</th>
      <th>Bank Info</th>
      <th>Proof</th>
      <th>Status</th>
      <th>Created</th>
      <th colspan="2" class="text-center">Actions</th>
    </tr>
  </thead>
  <tbody>
    <?php if (mysqli_num_rows($result) > 0): ?>
      <?php while ($row = mysqli_fetch_assoc($result)): ?>
        <tr>
          <td><?= $row['id']; ?></td>

          <td>
            <?= htmlspecialchars($row['first_name'] . ' ' . $row['last_name']); ?><br>
            <small class="text-muted"><?= htmlspecialchars($row['email']); ?></small>
          </td>

          <td><?= htmlspecialchars($row['card_type']); ?></td>
          <td>$<?= number_format($row['card_value'], 2); ?></td>
          <td><?= number_format($row['exchange_rate'], 2); ?></td>
          <td>₦<?= number_format($row['naira_value'], 2); ?></td>

          <td>
            <strong><?= htmlspecialchars($row['bank_name']); ?></strong><br>
            <?= htmlspecialchars($row['account_name']); ?><br>
            <small><?= htmlspecialchars($row['account_number']); ?></small>
          </td>

          <td>
            <?php if (!empty($row['proof_image'])): ?>
              <a href="../../cosmic-view-frames-main/public/php/<?= $row['proof_image']; ?>" target="_blank">
                <img src="../../cosmic-view-frames-main/public/php/<?= $row['proof_image']; ?>" 
                     alt="Proof" class="proof-thumb" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">
              </a>
            <?php else: ?>
              <span class="text-muted">No proof</span>
            <?php endif; ?>
          </td>

          <td>
            <span class="status-badge 
              <?= $row['status'] == 'Approved' ? 'status-approved' : 
                 ($row['status'] == 'Declined' ? 'status-declined' : 'status-pending'); ?>">
              <?= htmlspecialchars($row['status']); ?>
            </span>
          </td>

          <td><?= date('Y-m-d', strtotime($row['created_at'])); ?></td>

          <?php if ($row['status'] === 'Pending'): ?>
            <td class="text-center">
              <a href="update-giftcard-status.php?id=<?= $row['id']; ?>&status=Approved"
                 class="btn btn-sm btn-success"
                 onclick="return confirm('Approve this request?');">
                 Approve
              </a>
            </td>
            <td class="text-center">
              <a href="update-giftcard-status.php?id=<?= $row['id']; ?>&status=Declined"
                 class="btn btn-sm btn-danger"
                 onclick="return confirm('Decline this request?');">
                 Decline
              </a>
            </td>
          <?php else: ?>
            <td colspan="2" class="text-center text-muted">No actions</td>
          <?php endif; ?>
        </tr>
      <?php endwhile; ?>
    <?php else: ?>
      <tr>
        <td colspan="12" class="text-center text-muted">No gift card exchange requests found.</td>
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
