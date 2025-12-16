<?php
// logout.php
session_start();

// Unset all admin session variables
unset($_SESSION['admin_id']);
unset($_SESSION['admin_username']);

// Destroy the session completely
session_destroy();

// Redirect to login page
header('Location: index.php');
exit;
