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

// Fetch users for dropdown
$users = [];
$result = $conn->query("SELECT id, first_name, last_name, email FROM users ORDER BY first_name ASC");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? null;
    $title = trim($_POST['title']);
    $message_body = trim($_POST['message_body']);

    if (empty($title) || empty($message_body)) {
        $message = '<div style="background:#3d0000;color:#ff7070;padding:10px;border-radius:8px;">❌ Title and message are required.</div>';
    } else {
        if ($user_id === "all") {
            // Send to all users
            $insert_stmt = $conn->prepare("INSERT INTO notifications_tb (user_id, title, message_body, created_at) VALUES (?, ?, ?, NOW())");

            foreach ($users as $user) {
                $uid = $user['id'];
                $insert_stmt->bind_param("iss", $uid, $title, $message_body);
                $insert_stmt->execute();
            }

            $insert_stmt->close();
            $message = '<div style="background:#062e12;color:#4cff00;padding:10px;border-radius:8px;">✅ Notification sent to all users successfully.</div>';
        } else {
            // Send to selected user
            $stmt = $conn->prepare("INSERT INTO notifications_tb (user_id, title, message_body, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->bind_param("iss", $user_id, $title, $message_body);

            if ($stmt->execute()) {
                $message = '<div style="background:#062e12;color:#4cff00;padding:10px;border-radius:8px;">✅ Notification sent successfully.</div>';
            } else {
                $message = '<div style="background:#3d0000;color:#ff7070;padding:10px;border-radius:8px;">❌ Failed to send notification. Please try again.</div>';
            }

            $stmt->close();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Send Notification - Admin Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    body { background-color: #f5f7fa; font-family: 'Inter', sans-serif; }
    .sidebar { height: 100vh; background: #0d1b2a; color: #fff; position: fixed; width: 250px; top: 0; left: 0; padding-top: 70px; z-index: 999; transition: all 0.3s; }
    .sidebar a { color: #adb5bd; display: block; padding: 12px 20px; text-decoration: none; font-weight: 500; border-left: 3px solid transparent; }
    .sidebar a.active, .sidebar a:hover { color: #fff; background: #1b263b; border-left: 3px solid #00b4d8; }
    .content { margin-left: 250px; padding: 30px; transition: all 0.3s; }
    .navbar { position: fixed; top: 0; left: 250px; width: calc(100% - 250px); z-index: 1000; transition: all 0.3s; }
    .card { border: none; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .sidebar.collapsed { width: 70px; }
    .sidebar.collapsed a span { display: none; }
    .sidebar.collapsed + .content { margin-left: 70px; }
    .navbar-brand { font-weight: 600; color: #00b4d8 !important; }
    @media (max-width: 991px) { .sidebar { left: -250px; } .sidebar.active { left: 0; } .navbar { left: 0; width: 100%; } .content { margin-left: 0; } }
  </style>
</head>
<body>

<?php include("sidebar.php"); ?>

<div class="content">
  <div class="row g-4 my-4">
    
    <?php if ($message) echo $message; ?>

    <h3>Send Notification</h3>

    <form method="POST" action="">
      <div class="mb-3">
        <label for="user_id">Send To</label>
        <select class="form-select" name="user_id" id="user_id" required>
          <option value="" disabled selected>Select User or All</option>
          <option value="all">All Users</option>
          <?php foreach ($users as $user): ?>
            <option value="<?= $user['id'] ?>"><?= htmlspecialchars($user['first_name'].' '.$user['last_name'].' ('.$user['email'].')') ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="mb-3">
        <label for="title">Title</label>
        <input type="text" class="form-control" name="title" id="title" placeholder="Notification Title" required>
      </div>

      <div class="mb-3">
        <label for="message_body">Message</label>
        <textarea class="form-control" name="message_body" id="message_body" rows="5" placeholder="Enter your notification message" required></textarea>
      </div>

      <button type="submit" class="btn btn-primary">Send Notification</button>
    </form>

  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener('click', () => { sidebar.classList.toggle('active'); });
  }
</script>

</body>
</html>
