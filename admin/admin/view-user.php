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
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>View User - Admin Dashboard</title>
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
        <a href="manage-users.php" class="btn-back"><i class="fas fa-arrow-left"></i> Back to Users</a>
    </div>

    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h4 class="mb-0"><i class="fas fa-user-circle me-2"></i> <?= htmlspecialchars($user['first_name'] . ' ' . $user['last_name']) ?></h4>
            <span class="badge-status 
                <?= $user['kyc_status'] === 'verified' ? 'bg-success' : ($user['kyc_status'] === 'pending' ? 'bg-warning text-dark' : 'bg-danger') ?>">
                <?= ucfirst($user['kyc_status']) ?>
            </span>
        </div>

        <div class="card-body">
            <div class="row mb-3">
                <div class="col-md-6">
                    <p><span class="info-label">Email:</span> <?= htmlspecialchars($user['email']) ?></p>
                    <p><span class="info-label">Phone:</span> <?= htmlspecialchars($user['phone_number']) ?></p>
                    <p><span class="info-label">Address:</span> <?= htmlspecialchars($user['address']) ?></p>
                </div>
                <div class="col-md-6">
                    <p><span class="info-label">Date of Birth:</span> <?= htmlspecialchars($user['date_of_birth']) ?></p>
                    <p><span class="info-label">Balance:</span> <strong>$<?= number_format($user['balance'], 2) ?></strong></p>
                    <p><span class="info-label">Document Type:</span> <?php echo $user['document_type']; ?></p>
                </div>
            </div>

            <?php if (!empty($user['document_file'])): ?>
            <div class="mb-3">
                <h6 class="info-label">Uploaded Document:</h6>
                <img src="<?= htmlspecialchars($user['document_file']) ?>" alt="Document" class="document-preview mt-2">
            </div>
            <?php endif; ?>

            <div class="d-flex justify-content-end mt-4 gap-2">
                <a href="edit-user.php?id=<?= $user['id'] ?>" class="btn btn-primary btn-custom">
                    <i class="fas fa-edit"></i> Edit
                </a>
                <a href="delete-user.php?id=<?= $user['id'] ?>" 
                   onclick="return confirm('Are you sure you want to delete this user?');" 
                   class="btn btn-danger btn-custom">
                    <i class="fas fa-trash-alt"></i> Delete
                </a>
            </div>
        </div>

        <div class="card-footer text-muted text-center">
            Created: <?= date('M d, Y h:i A', strtotime($user['created_at'])) ?> | 
            Last Updated: <?= date('M d, Y h:i A', strtotime($user['updated_at'])) ?>
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
