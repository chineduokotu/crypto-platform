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

// Delete giftcard
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $stmt = $conn->prepare("DELETE FROM giftcards WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        $message = '<div style="background:#062e12;color:#4cff00;padding:10px;border-radius:8px;">✅ Giftcard deleted successfully.</div>';
    } else {
        $message = '<div style="background:#3d0000;color:#ff7070;padding:10px;border-radius:8px;">❌ Failed to delete giftcard.</div>';
    }
    $stmt->close();
}

// Fetch giftcards
$result = $conn->query("SELECT * FROM giftcards ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Manage Giftcards - Admin Dashboard</title>
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

<!-- Main Content -->
<div class="content">
  <div class="row g-4 my-4">
    
    <?php if ($message) echo $message; ?>

    <h3 class="mb-4">Manage Giftcards</h3>

    <div class="card shadow-sm">
      <div class="card-body table-responsive">
        <table class="table table-bordered align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Giftcard Name</th>
              <th>Exchange Rate (₦)</th>
              <th>Date Added</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <?php if ($result->num_rows > 0): ?>
              <?php while ($row = $result->fetch_assoc()): ?>
                <tr>
                  <td><?= htmlspecialchars($row['id']) ?></td>
                  <td><?= htmlspecialchars($row['giftcard_name']) ?></td>
                  <td>₦<?= number_format($row['exchange_rate'], 2) ?></td>
                  <td><?= date("M d, Y h:i A", strtotime($row['created_at'])) ?></td>
                  <td>
                    <a href="edit-giftcard.php?id=<?= $row['id'] ?>" class="btn btn-edit btn-action"><i class="bi bi-pencil"></i></a>
                    <a href="?delete=<?= $row['id'] ?>" class="btn btn-delete btn-action" onclick="return confirm('Are you sure you want to delete this giftcard?');"><i class="bi bi-trash"></i></a>
                  </td>
                </tr>
              <?php endwhile; ?>
            <?php else: ?>
              <tr>
                <td colspan="5" class="text-center py-3">No giftcards found.</td>
              </tr>
            <?php endif; ?>
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
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
</script>

</body>
</html>
