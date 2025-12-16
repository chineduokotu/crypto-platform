<?php
session_start();
require_once '../connection.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

$adminUsername = $_SESSION['admin_username'];

// Fetch all users
$query = "SELECT id, first_name, last_name, phone_number, balance, email, kyc_status, created_at FROM users ORDER BY id DESC";
$result = mysqli_query($conn, $query);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Manage Users</title>

  <!-- Bootstrap 5 & Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

  <style>
    body {
      background-color: #f8fafc;
      font-family: "Inter", sans-serif;
    }
    .sidebar {
      position: fixed;
      top: 0; left: 0;
      height: 100vh;
      width: 250px;
      background: #0d1b2a;
      color: #fff;
      z-index: 999;
      padding-top: 70px;
    }
    .sidebar a {
      color: #adb5bd;
      display: block;
      padding: 12px 20px;
      text-decoration: none;
      font-weight: 500;
      border-left: 3px solid transparent;
      transition: all 0.2s ease;
    }
    .sidebar a.active,
    .sidebar a:hover {
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
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .table thead {
      background-color: #0d1b2a;
      color: #fff;
    }
    .action-btn {
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    .btn-view {
      background: #00b4d8;
      color: #fff;
    }
    .btn-delete {
      background: #e63946;
      color: #fff;
    }
    .navbar {
      position: fixed;
      top: 0;
      left: 250px;
      width: calc(100% - 250px);
      z-index: 1000;
    }
    @media (max-width: 991px) {
      .sidebar {
        left: -250px;
        transition: all 0.3s;
      }
      .sidebar.active {
        left: 0;
      }
      .content {
        margin-left: 0;
      }
      .navbar {
        left: 0;
        width: 100%;
      }
    }
  </style>
</head>
<body>

<?php include("sidebar.php"); ?>

<!-- Main Content -->
<div class="content mt-5 pt-4">

<?php if (isset($_GET['success']) && $_GET['success'] === 'UserDeleted'): ?>
  <div style="background: #062e12; color: #4cff00; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
    ✅ User deleted successfully.
  </div>
<?php elseif (isset($_GET['error'])): ?>
  <div style="background: #3d0000; color: #ff7070; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
    ❌ Error: <?php echo htmlspecialchars($_GET['error']); ?>
  </div>
<?php endif; ?>


  <div class="card">
    <div class="card-header bg-primary text-white fw-bold">
      <i class="bi bi-people-fill me-2"></i> Manage Users
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table align-middle table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Balance</th>
              <th>KYC</th>
              <th>Registered</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <?php if (mysqli_num_rows($result) > 0): ?>
              <?php while ($row = mysqli_fetch_assoc($result)): ?>
                <tr>
                  <td><?php echo $row['id']; ?></td>
                  <td><?php echo htmlspecialchars($row['first_name'] . ' ' . $row['last_name']); ?></td>
                  <td><?php echo htmlspecialchars($row['email']); ?></td>
                  <td><?php echo htmlspecialchars($row['phone_number']); ?></td>
                  <td>$<?php echo number_format($row['balance'], 2); ?></td>
                  <td>
                    <?php if ($row['kyc_status'] == 'approved'): ?>
                      <span class="badge bg-success">Approved</span>
                    <?php elseif ($row['kyc_status'] == 'pending'): ?>
                      <span class="badge bg-warning text-dark">Pending</span>
                    <?php else: ?>
                      <span class="badge bg-secondary">Not Submitted</span>
                    <?php endif; ?>
                  </td>
                  <td><?php echo date('Y-m-d', strtotime($row['created_at'])); ?></td>
                  <td>
                    <button class="action-btn btn-view" onclick="viewUser(<?php echo $row['id']; ?>)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteUser(<?php echo $row['id']; ?>)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              <?php endwhile; ?>
            <?php else: ?>
              <tr><td colspan="8" class="text-center">No users found.</td></tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
  // Sidebar toggle for mobile
  document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
  });

  function viewUser(id) {
    window.location.href = 'view-user.php?id=' + id;
  }

  function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
      window.location.href = 'delete-user.php?id=' + id;
    }
  }
</script>
</body>
</html>
