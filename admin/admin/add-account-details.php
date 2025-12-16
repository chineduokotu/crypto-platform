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
    $account_name = trim($_POST['account_name']);
    $account_number = trim($_POST['account_number']);
    $bank_name = trim($_POST['bank_name']);

    if (empty($account_name) || empty($account_number) || empty($bank_name)) {
        $message = '<div style="background:#3d0000;color:#ff7070;padding:10px;border-radius:8px;">❌ All fields are required.</div>';
    } else {
        $stmt = $conn->prepare("INSERT INTO account_details (account_name, account_number, bank_name, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->bind_param("sss", $account_name, $account_number, $bank_name);

        if ($stmt->execute()) {
            $message = '<div style="background:#062e12;color:#4cff00;padding:10px;border-radius:8px;">✅ Account details added successfully.</div>';
        } else {
            $message = '<div style="background:#3d0000;color:#ff7070;padding:10px;border-radius:8px;">❌ Failed to add account details.</div>';
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
  <title>Add Account Details - Admin Dashboard</title>
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
  <div class="row g-4 my-4">
    
    <?php if ($message) echo $message; ?>

    <h3 class="mb-4">Add Bank Account Details</h3>

    <div class="card p-4">
      <form method="POST" action="">
        <div class="mb-3">
          <label for="account_name" class="form-label">Account Name</label>
          <input type="text" class="form-control" id="account_name" name="account_name" placeholder="e.g. John Doe" required>
        </div>

        <div class="mb-3">
          <label for="account_number" class="form-label">Account Number</label>
          <input type="text" class="form-control" id="account_number" name="account_number" placeholder="e.g. 0123456789" required>
        </div>

        <div class="mb-3">
          <label for="bank_name" class="form-label">Bank Name</label>
          <input type="text" class="form-control" id="bank_name" name="bank_name" placeholder="e.g. First Bank of Nigeria" required>
        </div>

        <button type="submit" class="btn btn-primary"><i class="bi bi-plus-circle"></i> Add Account</button>
      </form>
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
