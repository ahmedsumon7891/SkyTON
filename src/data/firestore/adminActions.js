import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc,
  increment,
  serverTimestamp
} from "firebase/firestore";
import {
  updateUser,
  completeTaskForUser,
  rejectManualVerificationForUser
} from '@/data/firestore/userActions';

// Fetch all users, ordered by join date
export const getAllUsers = async () => {
  const usersColRef = collection(db, "users");
  try {
    const q = query(usersColRef, orderBy("joinedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

// Toggle ban status for a user
export const setUserBanStatus = async (userId, isBanned) => {
  try {
    await updateUser(userId, { isBanned });
    console.log(`User ${userId} ban status set to: ${isBanned}`);
    return true;
  } catch (error) {
    console.error(`Error updating ban status for user ${userId}:`, error);
    return false;
  }
};

// Toggle admin status for a user
export const setUserAdminStatus = async (userId, isAdmin) => {
  try {
    await updateUser(userId, { isAdmin });
    console.log(`User ${userId} admin status set to: ${isAdmin}`);
    return true;
  } catch (error) {
    console.error(`Error updating admin status for user ${userId}:`, error);
    return false;
  }
};

// Fetches all users with pending manual tasks
export const getPendingVerifications = async () => {
  const usersColRef = collection(db, "users");
  try {
    const snapshot = await getDocs(query(usersColRef));
    const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const pendingItems = [];

    for (const user of allUsers) {
      if (Array.isArray(user.pendingVerificationTasks) && user.pendingVerificationTasks.length > 0) {
        for (const taskId of user.pendingVerificationTasks) {
          // --- NEW: Get details from pendingVerificationDetails if present ---
          const details = user.pendingVerificationDetails?.[taskId] || {};
          pendingItems.push({
            userId: user.id,
            username: user.username || user.firstName || `User ${user.id}`,
            taskId,
            title: details.title || '',
            target: details.target || undefined,
            reward: details.reward || undefined
          });
        }
      }
    }

    return pendingItems;
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    return [];
  }
};

// Approve a task (mark it complete and reward user)
export const approveTask = async (userId, taskId) => {
  return await completeTaskForUser(userId, taskId);
};

// Reject a task (remove it from pending list)
export const rejectTask = async (userId, taskId) => {
  return await rejectManualVerificationForUser(userId, taskId);
};

// ==================== WITHDRAWAL FUNCTIONS ====================

// Get all pending withdrawal requests
export const getPendingWithdrawals = async () => {
  try {
    const withdrawalsRef = collection(db, 'withdrawals');
    const q = query(withdrawalsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const withdrawals = [];
    querySnapshot.forEach((doc) => {
      withdrawals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('getPendingWithdrawals result:', withdrawals); // Debug log
    return withdrawals;
  } catch (error) {
    console.error('Error fetching pending withdrawals:', error);
    return [];
  }
};

// Approve a withdrawal request
export const approveWithdrawal = async (withdrawalId, userId, amount) => {
  try {
    // Update withdrawal status
    const withdrawalRef = doc(db, 'withdrawals', withdrawalId);
    await updateDoc(withdrawalRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      processedBy: 'admin'
    });

    // Deduct amount from user's balance
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      balance: increment(-parseFloat(amount))
    });

    // Send notification to admin (optional)
    try {
      const withdrawalDoc = await getDoc(withdrawalRef);
      const withdrawalData = withdrawalDoc.data();
      
      await fetch(`https://api.telegram.org/bot${import.meta.env.VITE_TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: '5063003944', // Admin chat ID
          text: `✅ <b>Withdrawal Approved</b>\nUser: ${withdrawalData.username || withdrawalData.userId}\nAmount: ${amount} STON\nWallet: ${withdrawalData.walletAddress}`,
          parse_mode: 'HTML'
        })
      });
    } catch (notificationError) {
      console.error('Failed to send approval notification:', notificationError);
    }

    console.log(`Withdrawal ${withdrawalId} approved for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    return false;
  }
};

// Reject a withdrawal request
export const rejectWithdrawal = async (withdrawalId) => {
  try {
    // Update withdrawal status
    const withdrawalRef = doc(db, 'withdrawals', withdrawalId);
    await updateDoc(withdrawalRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      processedBy: 'admin'
    });

    // Send notification to admin (optional)
    try {
      const withdrawalDoc = await getDoc(withdrawalRef);
      const withdrawalData = withdrawalDoc.data();
      
      await fetch(`https://api.telegram.org/bot${import.meta.env.VITE_TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: '5063003944', // Admin chat ID
          text: `❌ <b>Withdrawal Rejected</b>\nUser: ${withdrawalData.username || withdrawalData.userId}\nAmount: ${withdrawalData.amount} STON\nReason: Admin decision`,
          parse_mode: 'HTML'
        })
      });
    } catch (notificationError) {
      console.error('Failed to send rejection notification:', notificationError);
    }

    console.log(`Withdrawal ${withdrawalId} rejected`);
    return true;
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    return false;
  }
};

// Create a withdrawal request (to be used in ProfileSection)
export const createWithdrawalRequest = async (userId, amount, walletAddress, userBalance, username) => {
  try {
    const withdrawalsRef = collection(db, 'withdrawals');
    await addDoc(withdrawalsRef, {
      userId,
      username: username || null,
      amount: parseFloat(amount),
      walletAddress,
      userBalance: userBalance || 0,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    console.log(`Withdrawal request created for user ${userId}, amount: ${amount} STON`);
    return true;
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return false;
  }
};

// Get withdrawal history for a specific user
export const getUserWithdrawalHistory = async (userId) => {
  try {
    const withdrawalsRef = collection(db, 'withdrawals');
    const q = query(withdrawalsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const withdrawals = [];
    querySnapshot.forEach((doc) => {
      withdrawals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('getUserWithdrawalHistory result:', withdrawals); // Debug log
    return withdrawals;
  } catch (error) {
    console.error('Error fetching user withdrawal history:', error);
    return [];
  }
};
