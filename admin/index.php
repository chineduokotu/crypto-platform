<?php
// admin_login.php
// Professional, unusual dark-theme admin login page.
// Expects $conn to be provided by connection.php (mysqli connection)

session_start();

// include the user's connection file (must define $conn)
require_once 'connection.php';

// Simple helper for flashing messages
function flash($msg = '') {
    if ($msg !== '') {
        $_SESSION['flash'] = $msg;
        return;
    }
    if (!empty($_SESSION['flash'])) {
        $m = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $m;
    }
    return null;
}

if (isset($_SESSION['admin_id'])) {
    // already logged in — redirect to dashboard
    header('Location: admin/index.php');
    exit;
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username === '' || $password === '') {
        $error = 'Please enter both username and password.';
    } else {
        // Use prepared statements to avoid SQL injection. Table assumed: `admins` with columns `id`, `username`, `password_hash`.
        $sql = "SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1";
        if ($stmt = $conn->prepare($sql)) {
            $stmt->bind_param('s', $username);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                // password_hash should be created with password_hash() in PHP
                if (password_verify($password, $row['password_hash'])) {
                    // login success
                    session_regenerate_id(true);
                    $_SESSION['admin_id'] = $row['id'];
                    $_SESSION['admin_username'] = $row['username'];
                    header('Location: admin/index.php');
                    exit;
                } else {
                    $error = 'Invalid username or password.';
                }
            } else {
                $error = 'Invalid username or password.';
            }
            $stmt->close();
        } else {
            $error = 'Database error: failed to prepare statement.';
        }
    }
}

// Page outputs below
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin Sign In</title>
  <style>
    /* Modern dark, unusual layout with glass panels and diagonal accent */
    :root{--bg1:#0b0f14;--bg2:#0f1720;--accent:#00d4ff;--glass:rgba(255,255,255,0.04);--muted:rgba(255,255,255,0.55)}
    *{box-sizing:border-box}
    html,body{height:100%;margin:0;font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;color:#e6eef6;background:linear-gradient(120deg,var(--bg1),var(--bg2));}

    /* animated geometric background */
    .stage{position:fixed;inset:0;overflow:hidden;z-index:0}
    .shape{position:absolute;border-radius:40% 60% 30% 70%/60% 30% 70% 40%;filter:blur(46px);opacity:0.12;transform:translate3d(0,0,0)}
    .s1{width:620px;height:620px;left:-120px;top:-160px;background:linear-gradient(45deg,#004e92,#00d4ff)}
    .s2{width:480px;height:480px;right:-160px;bottom:-120px;background:linear-gradient(45deg,#8a00d4,#2a00ff);opacity:0.10}

    .wrap{position:relative;min-height:100vh;display:grid;place-items:center;padding:48px;z-index:1}
    .card{width:920px;max-width:100%;display:grid;grid-template-columns:420px 1fr;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));box-shadow:0 8px 40px rgba(2,6,23,0.6);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.04)}

    /* left panel */
    .brand{padding:44px 36px;color:var(--muted);display:flex;flex-direction:column;justify-content:space-between;background-image:linear-gradient(180deg,rgba(255,255,255,0.01),transparent);position:relative}
    .logo{display:flex;align-items:center;gap:14px}
    .logo .mark{width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,var(--accent),#7b61ff);display:grid;place-items:center;box-shadow:0 6px 22px rgba(0,0,0,0.6)}
    .logo h1{font-size:18px;margin:0;color:#fff}
    .tag{font-size:13px;color:var(--muted);margin-top:6px}
    .left-ill{margin-top:28px;color:var(--muted);font-size:13px;line-height:1.5}

    /* right panel (form) */
    .formwrap{padding:44px 48px;display:flex;flex-direction:column;justify-content:center}
    .headline{display:flex;align-items:center;gap:12px}
    .head-icon{width:46px;height:46px;border-radius:10px;background:linear-gradient(135deg,#1b9cff,#5b2bff);display:grid;place-items:center;color:#041025;font-weight:700}
    .title{font-size:20px;color:#fff;margin:0}
    .subtitle{color:var(--muted);font-size:13px;margin-top:6px}

    form{margin-top:20px}
    .field{margin-bottom:14px}
    label{display:block;font-size:12px;color:var(--muted);margin-bottom:8px}
    input[type=text],input[type=password]{width:100%;padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.04);background:linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));color:#e9f6ff;font-size:15px;outline:none;transition:box-shadow .18s,transform .12s}
    input:focus{box-shadow:0 6px 30px rgba(0,212,255,0.08);transform:translateY(-2px)}

    .controls{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
    .remember{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px}
    .btn{margin-top:18px;padding:12px 18px;border-radius:12px;border:0;font-weight:700;cursor:pointer;background:linear-gradient(90deg,#00d4ff,#7b61ff);color:#041025;font-size:15px;box-shadow:0 12px 30px rgba(0,212,255,0.08)}

    .alt{margin-top:14px;font-size:13px;color:var(--muted);display:flex;gap:10px;align-items:center}
    .error{background:rgba(255,16,45,0.06);color:#ff8b9a;padding:10px;border-radius:8px;border:1px solid rgba(255,16,45,0.07);margin-bottom:12px}

    /* responsive */
    @media (max-width:880px){
      .card{grid-template-columns:1fr;max-width:520px}
      .brand{display:none}
    }

  </style>
</head>
<body>
  <div class="stage" aria-hidden="true">
    <div class="shape s1"></div>
    <div class="shape s2"></div>
  </div>
  <div class="wrap">
    <div class="card" role="main" aria-label="Admin sign in">

      <div class="brand">
        <div>
          <div class="logo">
            <div class="mark">A</div>
            <div>
              <h1>Admin Dashboard</h1>
              <div class="tag">Secure Console · Dark Mode</div>
            </div>
          </div>

          
        </div>

        <div style="font-size:12px;color:var(--muted)">Need help? Contact <a href="mailto:it@yourdomain.com" style="color:var(--accent);text-decoration:none">it@yourdomain.com</a></div>
      </div>

      <div class="formwrap">
        <div class="headline">
          <div class="head-icon">⎈</div>
          <div>
            <h2 class="title">Administrator Sign In</h2>
            <div class="subtitle">Access the secure admin console — enter your username and password.</div>
          </div>
        </div>

        <?php if (!empty($error)): ?>
          <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="post" novalidate>

          <div class="field">
            <label for="username">Username</label>
            <input id="username" name="username" type="text" autocomplete="username" required placeholder="admin" value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>">
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required placeholder="••••••••">
          </div>

          <div class="controls">
            <label class="remember"><input type="checkbox" name="remember_me"> Remember</label>
            <a href="#" style="color:var(--muted);text-decoration:none;font-size:13px">Forgot password?</a>
          </div>

          <button class="btn" type="submit">Sign in</button>

          <div class="alt">Not an admin? <span style="color:var(--muted)">Contact your system administrator.</span></div>
        </form>

      </div>
    </div>
  </div>
</body>
</html>
