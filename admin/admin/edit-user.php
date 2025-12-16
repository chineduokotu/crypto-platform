<?php
session_start();
require_once '../connection.php';

// Redirect if not logged in
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit();
}

// Fetch user ID
if (!isset($_GET['id'])) {
    header("Location: manage-users.php");
    exit();
}
$adminUsername = $_SESSION['admin_username'];
$message = "";

$user_id = intval($_GET['id']);
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "<h2 style='text-align:center;color:red;margin-top:50px;'>User not found</h2>";
    exit();
}

$user = $result->fetch_assoc();

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $first_name = trim($_POST['first_name']);
    $last_name = trim($_POST['last_name']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone_number']);
    $balance = floatval($_POST['balance']);
    $address = trim($_POST['address']);
    $dob = trim($_POST['date_of_birth']);
    $kyc_status = trim($_POST['kyc_status']);
    $document_type = trim($_POST['document_type']);

    $update = $conn->prepare("UPDATE users SET first_name=?, last_name=?, email=?, phone_number=?, balance=?, address=?, date_of_birth=?, kyc_status=?, document_type=?, updated_at=NOW() WHERE id=?");
    $update->bind_param("ssssissssi", $first_name, $last_name, $email, $phone, $balance, $address, $dob, $kyc_status, $document_type, $user_id);

    if ($update->execute()) {
        header("Location: view-user.php?id=" . $user_id . "&updated=1");
        exit();
    } else {
        $error = "Error updating user.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit User - Admin Dashboard</title>
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
    .table thead {
      background: #0d1b2a;
      color: #fff;
    }
    .table tbody tr:hover {
      background-color: #f1f5f9;
    }
    .btn-action {
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 14px;
    }
    .btn-edit {
      background-color: #0d6efd;
      color: white;
    }
    .btn-delete {
      background-color: #b91c1c;
      color: white;
    }
    .btn-edit:hover, .btn-delete:hover {
      opacity: 0.85;
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

      #sidebarToggle{
        z-index: 10000;
      }
    }
  </style>
</head>
<body>

<?php include("sidebar.php"); ?>

<!-- Content -->
<div class="content">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <span id="toggleSidebar"><i class="fas fa-bars"></i></span>
        <a href="view-user.php?id=<?= $user['id'] ?>" class="btn btn-link text-decoration-none">
            <i class="fas fa-arrow-left"></i> Back to User
        </a>
    </div>

    <div class="card">
        <div class="card-header">
            <h4 class="mb-0"><i class="fas fa-user-edit me-2"></i> Edit User Information</h4>
        </div>

        <div class="card-body">
            <?php if (!empty($error)): ?>
                <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">First Name</label>
                        <input type="text" name="first_name" value="<?= htmlspecialchars($user['first_name']) ?>" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Last Name</label>
                        <input type="text" name="last_name" value="<?= htmlspecialchars($user['last_name']) ?>" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email</label>
                        <input type="email" name="email" value="<?= htmlspecialchars($user['email']) ?>" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Phone Number</label>
                        <input type="text" name="phone_number" value="<?= htmlspecialchars($user['phone_number']) ?>" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Balance ($)</label>
                        <input type="number" step="0.01" name="balance" value="<?= htmlspecialchars($user['balance']) ?>" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Date of Birth</label>
                        <input type="date" name="date_of_birth" value="<?= htmlspecialchars($user['date_of_birth']) ?>" class="form-control">
                    </div>
                    <div class="col-md-12">
                        <label class="form-label">Address</label>
                        <input type="text" name="address" value="<?= htmlspecialchars($user['address']) ?>" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Document Type</label>
                        <select name="document_type" class="form-select">
                            <option value="">Select Type</option>
                            <option value="Passport" <?= $user['document_type'] == 'Passport' ? 'selected' : '' ?>>Passport</option>
                            <option value="Driver's License" <?= $user['document_type'] == "Driver's License" ? 'selected' : '' ?>>Driver's License</option>
                            <option value="National ID" <?= $user['document_type'] == 'National ID' ? 'selected' : '' ?>>National ID</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">KYC Status</label>
                        <select name="kyc_status" class="form-select">
                            <option value="pending" <?= $user['kyc_status'] == 'pending' ? 'selected' : '' ?>>Pending</option>
                            <option value="approved" <?= $user['kyc_status'] == 'approved' ? 'selected' : '' ?>>Approved</option>
                            <option value="rejected" <?= $user['kyc_status'] == 'rejected' ? 'selected' : '' ?>>Rejected</option>
                        </select>
                    </div>

                    <!-- Only show the image -->
                    <?php if (!empty($user['document_file'])): ?>
                    <div class="col-md-12 mt-3">
                        <label class="form-label">KYC Document</label>
                        <img src="C:/xampp/htdocs/cosmic-view-frames-main/public/php/uploads/<?= htmlspecialchars($user['document_file']) ?>" 
                             alt="KYC Document" class="document-preview">
                    </div>
                    <?php endif; ?>
                </div>

                <div class="mt-4 text-end">
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Update</button>
                </div>
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
