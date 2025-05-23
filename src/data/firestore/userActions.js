import React from 'react';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp
} from "firebase/firestore";
import { defaultFirestoreUser  } from '@/data/defaults';
import { generateReferralLink } from '@/data/telegramUtils';
import { getTask } from '@/data/firestore/taskActions';

// Create or return existing user
export const getOrCreateUser  = async (telegramUser Data) => {
  if (!telegramUser Data || !telegramUser Data.id) {
    console.error("Missing Telegram data.");
    return null;
  }

  const userId = telegramUser Data.id;
  const userRef = doc(db, "users", userId);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const existingData = userSnap.data();
      const updates = {};

      if (!existingData.referralLink || !existingData.referralLink.includes('?start=')) {
        updates.referralLink = generateReferralLink(userId);
      }

      if (telegramUser Data.username && existingData.username !== telegramUser Data.username)
        updates.username = telegramUser Data.username;
      if (telegramUser Data.firstName && existingData.firstName !== telegramUser Data.firstName)
        updates.firstName = telegramUser Data.firstName;
      if (telegramUser Data.lastName && existingData.lastName !== telegramUser Data.lastName)
        updates.lastName = telegramUser Data.lastName;
      if (telegramUser Data.profilePicUrl && existingData.profilePicUrl !== telegramUser Data.profilePicUrl)
        updates.profilePicUrl = telegramUser Data.profilePicUrl;

      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
        return { id: userId, ...existingData, ...updates };
      }

      return { id: userId, ...existingData };
    } else {
      const newUser  = defaultFirestoreUser (
        userId,
        telegramUser Data.username,
        telegramUser Data.firstName,
        telegramUser Data.lastName,
        null
      );
      newUser .profilePicUrl = telegramUser Data.profilePicUrl;
      newUser .referralLink = generateReferralLink(userId);

      await setDoc(userRef, { ...newUser , joinedAt: serverTimestamp() });
      return { id: userId, ...newUser  };
    }
  } catch (error) {
    console.error("Error in getOrCreateUser :", error);
    return null;
  }
};

// Update user fields
export const updateUser  = async (userId, updates) => {
  if (!userId) {
    console.error("User  ID required for update.");
    return false;
  }
  try {
    await updateDoc(doc(db, "users", userId), updates);
    return true;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    return false;
  }
};

// Fetch user by ID
export const getUser  = async (userId) => {
  if (!userId) return null;
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

// Alias for clarity (same as getUser )
export const getUser ById = getUser ;

// Mark a task complete and update balance
export const completeTaskForUser  = async (userId, taskId) => {
  if (!userId || !taskId) return false;

  const userRef = doc(db, "users", userId);
  const task = await getTask(taskId);
  if (!task) return false;

  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().tasks?.[taskId]) return true;

    await updateDoc(userRef, {
      [`tasks.${taskId}`]: true,
      balance: increment(task.reward || 0),
      pendingVerificationTasks: arrayRemove(taskId)
    });
    return true;
  } catch (error) {
    console.error(`Error completing task ${taskId} for user ${userId}:`, error);
    return false;
  }
};

// Request manual task verification
export const requestManualVerificationForUser  = async (userId, taskId) => {
  if (!userId || !taskId) return false;

  const userRef = doc(db, "users", userId);
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.tasks?.[taskId]) return false; // Task already completed
      if (userData.pendingVerificationTasks?.includes(taskId)) return true; // Already pending

      // Fetch task details if needed
      const task = await getTask(taskId);
      if (!task) return false; // Task does not exist

      // Add task details to pending verification
      await updateDoc(userRef, {
        pendingVerificationTasks: arrayUnion(taskId),
        [`pendingVerificationDetails.${taskId}`]: {
          title: task.title,
          reward: task.reward,
          target: task.target
        }
      });
      return true;
    }
  } catch (error) {
    console.error(`Error requesting verification for ${taskId} by ${userId}:`, error);
    return false;
  }
};

// Reject manual verification
export const rejectManualVerificationForUser  = async (userId, taskId) => {
  if (!userId || !taskId) return false;
  try {
    await updateDoc(doc(db, "users", userId), {
      pendingVerificationTasks: arrayRemove(taskId)
    });
    return true;
  } catch (error) {
    console.error(`Error rejecting verification for ${taskId} by ${userId}:`, error);
    return false;
  }
};

// Daily check-in
export const performCheckInForUser  = async (userId) => {
  if (!userId) return { success: false, message: 'User  ID required.' };

  const userRef = doc(db, "users", userId);
  const checkInTaskId = 'task_daily_checkin';
  const task = await getTask(checkInTaskId);
  const reward = task ? task.reward : 0;

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { success: false, message: 'User  not found.' };

    const userData = userSnap.data();
    const lastCheckIn = userData.lastCheckIn;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let canCheckIn = true;
    if (lastCheckIn instanceof Timestamp) {
      const lastDate = lastCheckIn.toDate();
      lastDate.setHours(0, 0, 0, 0);
      if (lastDate.getTime() === today.getTime()) {
        canCheckIn = false;
      }
    }

    if (canCheckIn) {
      await updateDoc(userRef, {
        balance: increment(reward),
        lastCheckIn: serverTimestamp(),
        [`tasks.${checkInTaskId}`]: true
      });
      return { success: true, reward };
    } else {
      return { success: false, message: 'Already checked in today.' };
    }
  } catch (error) {
    console.error(`Check-in error for ${userId}:`, error);
    return { success: false, message: 'An error occurred.' };
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Toggle ban status
export const toggleUser BanStatus = async (telegramId, newStatus) => {
  try {
    await updateDoc(doc(db, "users", telegramId.toString()), {
      isBanned: newStatus
    });
    return true;
  } catch (error) {
    console.error(`Error updating ban status for ${telegramId}:`, error);
    return false;
  }
};
