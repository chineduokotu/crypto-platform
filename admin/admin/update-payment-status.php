<?php
session_start();
require_once '../connection.php';

// Check if admin is logged in
if (!isset($_SESSION['admin_id'])) {
    header('Location: ../index.php');
    exit;
}

// Check if ID and status are provided
if (isset($_GET['id']) && isset($_GET['status'])) {
    $paymentId = intval($_GET['id']);
    $status = trim($_GET['status']);

    // Allow only valid statuses
    $allowedStatuses = ['Approved', 'Declined'];
    if (!in_array($status, $allowedStatuses)) {
        $_SESSION['msg'] = "❌ Invalid status provided.";
        header("Location: crypto-buys.php");
        exit;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Get payment details with user's referral info
        $checkQuery = "SELECT p.*, u.balance as user_balance, u.referral 
                       FROM payments_tb p 
                       JOIN users u ON p.user_id = u.id 
                       WHERE p.id = ?";
        $stmt = $conn->prepare($checkQuery);
        $stmt->bind_param("i", $paymentId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            throw new Exception("Payment record not found.");
        }

        $payment = $result->fetch_assoc();
        $userId = $payment['user_id'];
        $amount = floatval($payment['amount']);
        $userBalance = floatval($payment['user_balance']);
        $referrerEmail = trim($payment['referral']); // email of referrer

        // Update payment status
        $updateQuery = "UPDATE payments_tb SET status = ? WHERE id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param("si", $status, $paymentId);
        $stmt->execute();

        // If status is Approved -> process deposit
        if ($status === 'Approved') {

            // CREDIT user's balance (ADD the amount)
            $newBalance = $userBalance + $amount;
            $updateBalanceQuery = "UPDATE users SET balance = ? WHERE id = ?";
            $stmtBalance = $conn->prepare($updateBalanceQuery);
            $stmtBalance->bind_param("di", $newBalance, $userId);
            $stmtBalance->execute();

            /*
                ==========================
                REFERRAL BONUS SECTION
                ==========================
            */

            // validate referral email
            if (!empty($referrerEmail) && filter_var($referrerEmail, FILTER_VALIDATE_EMAIL)) {

                $referralBonus = $amount * 0.10;

                // find referrer by email instead of ID
                $refQuery = "SELECT id, balance FROM users WHERE email = ?";
                $refStmt = $conn->prepare($refQuery);
                $refStmt->bind_param("s", $referrerEmail);
                $refStmt->execute();
                $refResult = $refStmt->get_result();

                if ($refResult->num_rows > 0) {
                    $referrer = $refResult->fetch_assoc();
                    $referrerId = intval($referrer['id']);
                    $referrerBalance = floatval($referrer['balance']);

                    // add bonus to referrer's balance
                    $newReferrerBalance = $referrerBalance + $referralBonus;
                    $updateRefBalanceQuery = "UPDATE users SET balance = ? WHERE id = ?";
                    $updateRefStmt = $conn->prepare($updateRefBalanceQuery);
                    $updateRefStmt->bind_param("di", $newReferrerBalance, $referrerId);
                    $updateRefStmt->execute();

                    // record the bonus
                    $recordBonusQuery = "INSERT INTO referral_bonuses (referrer_id, referred_user_id, payment_id, amount, created_at) 
                                         VALUES (?, ?, ?, ?, NOW())";
                    $recordStmt = $conn->prepare($recordBonusQuery);
                    $recordStmt->bind_param("iiid", $referrerId, $userId, $paymentId, $referralBonus);
                    $recordStmt->execute();

                    $bonusMessage = " Referral bonus of " . number_format($referralBonus, 2) . " added to referrer.";
                } else {
                    $bonusMessage = " (Referrer email not found in system)";
                }

            } else {
                $bonusMessage = " (No valid referrer email for user)";
            }
        }

        // commit transaction
        $conn->commit();

        $_SESSION['msg'] = "✅ Payment #{$paymentId} has been {$status} successfully." . 
                          (isset($bonusMessage) ? $bonusMessage : "");

    } catch (Exception $e) {

        // rollback if failure
        $conn->rollback();
        $_SESSION['msg'] = "❌ Error: " . $e->getMessage();
    }

    header("Location: crypto-buys.php");
    exit;

} else {
    $_SESSION['msg'] = "⚠️ Missing payment ID or status.";
    header("Location: crypto-buys.php");
    exit;
}
?>
