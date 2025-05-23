import React, { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Check, X, Loader2 } from 'lucide-react';

const PendingVerificationTab = ({ pendingItems = [], onApprove, onReject }) => {
  const [processing, setProcessing] = useState({});
  const ADMIN_CHAT_ID = '5063003944';

  const sendUserNotification = async (userId, message) => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${import.meta.env.VITE_TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: userId, text: message, parse_mode: 'HTML' })
      });
      if (!res.ok) throw new Error('Failed to send user message');
      return true;
    } catch (err) {
      sendAdminLog(`Failed to send message to user ${userId}: ${err.message}`);
      return false;
    }
  };

  const sendAdminNotification = async (message) => {
    try {
      await fetch(`https://api.telegram.org/bot${import.meta.env.VITE_TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: message, parse_mode: 'HTML' })
      });
    } catch (err) {
      console.error('Admin notification failed:', err.message);
    }
  };

  const sendAdminLog = async (logMessage) => {
    await sendAdminNotification(`🔍 <b>Debug Log</b>: ${logMessage}`);
  };

  const handleApprove = async (item) => {
    const userId = item.userId || item.user?.id;
    const taskId = item.taskId || item.task?.id;
    const taskTitle = item.taskTitle || item.task?.title || 'this task';
    const reward = item.taskReward || item.task?.reward || 0;

    if (!userId || !taskId) {
      sendAdminLog(`Missing userId or taskId: userId=${userId}, taskId=${taskId}`);
      return;
    }

    setProcessing({ userId, taskId, action: 'approve' });

    try {
      const success = await onApprove(userId, taskId);
      if (success) {
        await sendUserNotification(
          userId,
          `✅ <b>Task Approved!</b>\n\nYour task "<b>${taskTitle}</b>" has been approved.\n<b>+${reward} STON</b> added to your balance.`
        );
        await sendAdminNotification(
          `✅ <b>Task Approved</b>\nUser: @${item.username || userId}\nTask: <b>${taskTitle}</b>\nReward: +${reward} STON`
        );
      } else {
        sendAdminLog(`Approval failed at backend for user ${userId}, task ${taskId}`);
      }
    } catch (err) {
      sendAdminLog(`Approval error: ${err.message}`);
    } finally {
      setProcessing({});
    }
  };

  const handleReject = async (item) => {
    const userId = item.userId || item.user?.id;
    const taskId = item.taskId || item.task?.id;
    const taskTitle = item.taskTitle || item.task?.title || 'this task';

    if (!userId || !taskId) {
      sendAdminLog(`Missing userId or taskId for rejection: userId=${userId}, taskId=${taskId}`);
      return;
    }

    setProcessing({ userId, taskId, action: 'reject' });

    try {
      const success = await onReject(userId, taskId);
      if (success) {
        await sendUserNotification(
          userId,
          `❌ <b>Task Rejected</b>\n\nYour task "<b>${taskTitle}</b>" was rejected.\nPlease make sure it's done properly and try again.`
        );
        await sendAdminNotification(
          `❌ <b>Task Rejected</b>\nUser: @${item.username || userId}\nTask: <b>${taskTitle}</b>`
        );
      } else {
        sendAdminLog(`Rejection failed at backend for user ${userId}, task ${taskId}`);
      }
    } catch (err) {
      sendAdminLog(`Rejection error: ${err.message}`);
    } finally {
      setProcessing({});
    }
  };

  return (
    <div className="w-full">
      <Card className="bg-white/10 border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Pending Manual Verifications</CardTitle>
          <CardDescription className="text-muted-foreground">
            Approve or reject tasks users submitted for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10">
                <TableHead className="text-white">User</TableHead>
                <TableHead className="text-white">Task</TableHead>
                <TableHead className="text-white">Target</TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingItems.length ? pendingItems.map(item => {
                const userId = item.userId || item.user?.id;
                const taskId = item.taskId || item.task?.id;
                const taskTitle = item.taskTitle || item.task?.title || 'Task';
                const taskTarget = item.taskTarget || item.task?.target || 'N/A';
                const isProc = processing.userId === userId && processing.taskId === taskId;
                const isApprove = isProc && processing.action === 'approve';
                const isReject = isProc && processing.action === 'reject';

                return (
                  <TableRow key={`${userId}-${taskId}`} className="border-b border-white/10">
                    <TableCell className="text-white">{item.username || userId}</TableCell>
                    <TableCell className="text-white">{taskTitle}</TableCell>
                    <TableCell className="text-white">{taskTarget}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-900/20 hover:bg-green-900/30 text-green-400 border-green-900/30"
                        onClick={() => handleApprove(item)}
                        disabled={isProc}
                      >
                        {isApprove ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Processing</> : <><Check className="mr-1 h-4 w-4" /> Approve</>}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-900/20 hover:bg-red-900/30 text-red-400"
                        onClick={() => handleReject(item)}
                        disabled={isProc}
                      >
                        {isReject ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Processing</> : <><X className="mr-1 h-4 w-4" /> Reject</>}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-white/70">
                    No tasks pending manual review.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingVerificationTab;
