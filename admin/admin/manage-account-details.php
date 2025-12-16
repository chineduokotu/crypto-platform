<?php
session_start();
require_once '../connection.php';

// Check admin authentication
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

$adminUsername = $_SESSION['admin_username'];

// Handle delete
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $stmt = $conn->prepare("DELETE FROM account_details WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    header("Location: manage-account-details.php?deleted=1");
    exit;
}

// Fetch all account details
$result = $conn->query("SELECT * FROM account_details ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Manage Account Details</title>
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

<div class="content">
  <div class="container-fluid">
    <br><br><br>

    <?php if (isset($_GET['deleted'])): ?>
      <div class="alert alert-success">✅ Account detail deleted successfully.</div>
    <?php endif; ?>

    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold"><i class="bi bi-bank"></i> Manage Bank Accounts</h3>
      <a href="add-account-details.php" class="btn btn-primary"><i class="bi bi-plus-circle"></i> Add Account</a>
    </div>

    <div class="card p-4">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Account Name</th>
            <th scope="col">Account Number</th>
            <th scope="col">Bank Name</th>
            <th scope="col">Created At</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php if ($result->num_rows > 0): ?>
            <?php while ($row = $result->fetch_assoc()): ?>
              <tr>
                <td><?= htmlspecialchars($row['id']); ?></td>
                <td><?= htmlspecialchars($row['account_name']); ?></td>
                <td><?= htmlspecialchars($row['account_number']); ?></td>
                <td><?= htmlspecialchars($row['bank_name']); ?></td>
                <td><?= htmlspecialchars($row['created_at']); ?></td>
                <td>
                  <a href="edit-account-details.php?id=<?= $row['id']; ?>" class="btn-edit btn-sm" style="text-decoration: none;"><i class="bi bi-pencil"></i> Edit</a>
                  <a href="manage-account-details.php?delete=<?= $row['id']; ?>" style="text-decoration: none;" class="btn-delete btn-sm" onclick="return confirm('Are you sure you want to delete this account?');"><i class="bi bi-trash"></i> Delete</a>
                </td>
              </tr>
            <?php endwhile; ?>
          <?php else: ?>
            <tr>
              <td colspan="6" class="text-center text-muted">No account details found.</td>
            </tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
</script>

</body>
</html>
