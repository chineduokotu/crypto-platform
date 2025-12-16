<style>
.sidebar {
    height: 100vh; /* full viewport height */
    overflow-y: auto; /* enable vertical scrolling */
}
</style>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
  <div class="container-fluid">
    <button class="btn btn-outline-light me-3 d-lg-none" id="sidebarToggle">
      <i class="bi bi-list"></i>
    </button>
    <a class="navbar-brand" href="#">Admin Panel</a>
    <div class="ms-auto d-flex align-items-center">
      <span class="text-light me-3">Welcome, <?php echo htmlspecialchars($adminUsername); ?></span>
      <a href="../logout.php" class="btn btn-danger btn-sm"><i class="bi bi-box-arrow-right"></i> Logout</a>
    </div>
  </div>
</nav>

<!-- Sidebar -->
<div class="sidebar" id="sidebar">
  <a href="index.php" class="active"><i class="bi bi-speedometer2 me-2"></i><span>Dashboard</span></a>
  <a href="manage-users.php"><i class="bi bi-people me-2"></i><span>Manage Users</span></a>
  <a href="giftcard-transactions.php"><i class="bi bi-credit-card me-2"></i><span>Giftcard Transactions</span></a>
    <a href="crypto-transactions.php"><i class="bi bi-credit-card me-2"></i><span>Crypto Exchange</span></a>
    <a href="crypto-buys.php"><i class="bi bi-credit-card me-2"></i><span>Other Transactions</span></a>

  <a href="add-wallet.php"><i class="bi bi-plus me-2"></i><span>Add Wallets</span></a>
  <a href="manage-wallets.php"><i class="bi bi-pen me-2"></i><span>Manage Wallets</span></a>

  <a href="add-giftcards.php"><i class="bi bi-plus me-2"></i><span>Add Gift Cards</span></a>
  <a href="manage-giftcards.php"><i class="bi bi-pen me-2"></i><span>Manage Gift Cards</span></a>

  <a href="add-account-details.php"><i class="bi bi-plus me-2"></i><span>Add Account Details</span></a>
  <a href="manage-account-details.php"><i class="bi bi-person me-2"></i><span>My Profile</span></a>
    <a href="settings.php"><i class="bi bi-gear me-2"></i><span>Settings</span></a>

  <a href="send-notifications.php"><i class="bi bi-bell me-2"></i><span>Send Notifications</span></a>

</div>