import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Check, X, Loader2 } from 'lucide-react';

const PendingVerificationTab = ({ pendingItems = [], onApprove, onReject }) => {
  const [processing, setProcessing] = useState({});
  const ADMIN_CHAT_ID = '5063003944'; // Replace with your admin chat ID

  const sendMessage = async (chatId, message) => {
    if (!chatId) {
      sendAdminLog("Error: Missing chat ID for notification");
      return false;
    }

    try {
      await fetch(`https://api.telegram.org/bot${import.meta.env.VITE_TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      return true;
    } catch (err) {
      sendAdminLog(`Error sending message to ${chatId}: ${err.message}`);
      return false;
    }
  };

  const sendAdminLog = async (message) => {
    try {
      await fetch(`https://api.telegram.org/bot${import.meta.env.VITE_TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: `🔍 <b>Debug Log</b>:\n${message}`,
          parse_mode: 'HTML'
        })
      });
    } catch (error) {
      console.error("Failed to send admin log:", error);
    }
  };

  const handleApprove = async (item) => {
    const userId = item.userId || item.user?.id || item.telegramId || item.user?.telegramId;
    const taskId = item.taskId || item.task?.id;

    if (!userId || !taskId) {
      sendAdminLog(`Cannot approve: Missing user ID or task ID. userId: ${userId}, taskId: ${taskId}`);
      return;
    }

    const taskTitle = item.title || item.task?.title || item.taskTitle || "Unknown Task";
    const reward = item.reward || item.task?.reward || 0;

    setProcessing({ userId, taskId, action: 'approve' });

    const message = `✅ <b>Task Approved!</b>\n\nYour task "<b>${taskTitle}</b>" has been verified and approved.\n\n<b>+${reward} STON</b> has been added to your balance.`;
    sendMessage(userId, message);

    try {
      await onApprove(userId, taskId);
      sendAdminLog(`Approval process initiated for user ${userId}`);
    } catch (error) {
      sendAdminLog(`Error during approval: ${error.message}`);
    } finally {
      setProcessing({});
    }
  };

  const handleReject = async (item) => {
    const userId = item.userId || item.user?.id || item.telegramId || item.user?.telegramId;
    const taskId = item.taskId || item.task?.id;

    if (!userId || !taskId) {
      sendAdminLog(`Cannot reject: Missing user ID or task ID. userId: ${userId}, taskId: ${taskId}`);
      return;
    }

    const taskTitle = item.title || item.task?.title || item.taskTitle || "Unknown Task";

    setProcessing({ userId, taskId, action: 'reject' });

    const message = `❌ <b>Task Rejected</b>\n\nYour task "<b>${taskTitle}</b>" verification request has been rejected.\n\nPlease make sure you've completed the task correctly and try again.`;
    sendMessage(userId, message);

    try {
      await onReject(userId, taskId);
      sendAdminLog(`Rejection process initiated for user ${userId}`);
    } catch (error) {
      sendAdminLog(`Error during rejection: ${error.message}`);
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
            Review tasks submitted by users that need manual approval.
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
              {pendingItems.length > 0 ? (
                pendingItems.map((item) => {
                  const userId = item.userId || item.user?.id || item.telegramId || item.user?.telegramId;
                  const displayName = item.username || item.user?.username || item.firstName || item.user?.firstName || `User ${userId}`;

                  const taskId = item.taskId || item.task?.id;
                  const taskTitle = item.title || item.task?.title || item.taskTitle || "Unknown Task";
                  const taskTarget = item.target || item.task?.target || item.taskTarget || "N/A";

                  const isHandle = taskTarget.startsWith('@');
                  const isLink = taskTarget.startsWith('http');
                  const link = isHandle
                    ? `https://t.me/${taskTarget.replace('@', '')}`
                    : isLink
                    ? taskTarget
                    : taskTarget
                    ? `https://${taskTarget}`
                    : null;

                  const isProcessing = processing.userId === userId && processing.taskId === taskId;
                  const isApproving = isProcessing && processing.action === 'approve';
                  const isRejecting = isProcessing && processing.action === 'reject';

                  return (
                    <TableRow key={`${userId}-${taskId}`} className="border-b border-white/10">
                      <TableCell className="text-sm font-medium text-white">
                        {displayName}
                      </TableCell>
                      <TableCell className="text-sm text-white">
                        {taskTitle}
                      </TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">
                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline break-words"
                          >
                            {taskTarget}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-900/20 hover:bg-green-900/30 text-green-400 border-green-900/30"
                          onClick={() => handleApprove(item)}
                          disabled={isProcessing}
                        >
                          {isApproving ? (
                            <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Processing</>
                          ) : (
                            <><Check className="mr-1 h-4 w-4" /> Approve</>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="bg-red-900/20 hover:bg-red-900/30 text-red-400"
                          onClick={() => handleReject(item)}
                          disabled={isProcessing}
                        >
                          {isRejecting ? (
                            <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Processing</>
                          ) : (
                            <><X className="mr-1 h-4 w-4" /> Reject</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No tasks pending manual verification.
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
    
