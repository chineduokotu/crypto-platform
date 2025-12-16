<?php
// admin/index.php
session_start();
require_once '../connection.php';

// Redirect if admin not logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

$adminUsername = $_SESSION['admin_username'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin Dashboard</title>
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
    <div class="col-md-4">
      <div class="card p-3">
        <div class="d-flex align-items-center">
          <div class="bg-primary text-white rounded-circle p-3 me-3">
            <i class="bi bi-people fs-4"></i>
          </div>
          <div>
            <h6 class="text-muted mb-1">Total Users</h6>
            <h4 class="mb-0">1,245</h4>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card p-3">
        <div class="d-flex align-items-center">
          <div class="bg-success text-white rounded-circle p-3 me-3">
            <i class="bi bi-currency-dollar fs-4"></i>
          </div>
          <div>
            <h6 class="text-muted mb-1">Total Transactions</h6>
            <h4 class="mb-0">$58,900</h4>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card p-3">
        <div class="d-flex align-items-center">
          <div class="bg-warning text-white rounded-circle p-3 me-3">
            <i class="bi bi-wallet2 fs-4"></i>
          </div>
          <div>
            <h6 class="text-muted mb-1">Active Wallets</h6>
            <h4 class="mb-0">385</h4>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header bg-white fw-bold">Recent Logins</div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Username</th>
              <th>Login Time</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>admin</td>
              <td>2025-10-08 13:00:00</td>
              <td>192.168.0.1</td>
            </tr>
            <tr>
              <td>superadmin</td>
              <td>2025-10-07 17:30:00</td>
              <td>192.168.0.2</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
</script>

</body>
</html>
