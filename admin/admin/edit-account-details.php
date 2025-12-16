<?php
session_start();
require_once '../connection.php';

// ✅ Redirect if admin not logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}
$adminUsername = $_SESSION['admin_username'];

// ✅ Get the account ID
if (!isset($_GET['id'])) {
    header('Location: add-account-details.php');
    exit;
}

$id = intval($_GET['id']);
$message = "";

// ✅ Fetch account details
$stmt = $conn->prepare("SELECT * FROM account_details WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "<p class='text-danger text-center mt-5'>Invalid account ID.</p>";
    exit;
}

$account = $result->fetch_assoc();
$stmt->close();

// ✅ Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $account_name = trim($_POST['account_name']);
    $account_number = trim($_POST['account_number']);
    $bank_name = trim($_POST['bank_name']);

    if (!empty($account_name) && !empty($account_number) && !empty($bank_name)) {
        $update = $conn->prepare("UPDATE account_details SET account_name = ?, account_number = ?, bank_name = ? WHERE id = ?");
        $update->bind_param("sssi", $account_name, $account_number, $bank_name, $id);

        if ($update->execute()) {
            $message = '<div class="alert alert-success mt-3">✅ Account details updated successfully!</div>';
            // Refresh displayed data
            $account['account_name'] = $account_name;
            $account['account_number'] = $account_number;
            $account['bank_name'] = $bank_name;
        } else {
            $message = '<div class="alert alert-danger mt-3">❌ Error updating details. Please try again.</div>';
        }

        $update->close();
    } else {
        $message = '<div class="alert alert-warning mt-3">⚠️ All fields are required!</div>';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Edit Account Details</title>
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



<!-- ✅ Main Content -->
<div class="content my-5 pt-4">
  <div class="container">
    <?php echo $message; ?>
    <h3 class="mb-4">Edit Account Details</h3>

    <form method="POST" class="bg-white p-4 rounded shadow" style="max-width: 600px;">
      <div class="mb-3">
        <label for="account_name" class="form-label">Account Name</label>
        <input type="text" name="account_name" id="account_name" class="form-control" 
               value="<?= htmlspecialchars($account['account_name']) ?>" required>
      </div>

      <div class="mb-3">
        <label for="account_number" class="form-label">Account Number</label>
        <input type="text" name="account_number" id="account_number" class="form-control" 
               value="<?= htmlspecialchars($account['account_number']) ?>" required>
      </div>

      <div class="mb-3">
        <label for="bank_name" class="form-label">Bank Name</label>
        <input type="text" name="bank_name" id="bank_name" class="form-control" 
               value="<?= htmlspecialchars($account['bank_name']) ?>" required>
      </div>

      <button type="submit" class="btn btn-primary">Update Account</button>
      <a href="manage-account-details.php" class="btn btn-secondary">Back</a>
    </form>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.querySelector('#toggleSidebar');
  const sidebar = document.querySelector('.sidebar');
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('active');
    });
  }
});
</script>
</body>
</html>
