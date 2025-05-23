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

const PendingVerificationTab = ({ pendingItems = [] }) => {
  const [processing, setProcessing] = useState({});
  const BOT_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN;

  const sendMessage = async (chatId, message) => {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
    } catch (error) {
      console.error(`Failed to send message to ${chatId}:`, error);
    }
  };

  const handleApprove = async (item) => {
    const userId = item.userId || item.user?.id;
    const taskTitle = item.taskTitle || item.task?.title || 'a task';
    const reward = item.taskReward || item.task?.reward || 0;

    if (!userId) return;

    setProcessing({ userId, taskId: item.taskId, action: 'approve' });

    await sendMessage(
      userId,
      `✅ <b>Task Approved!</b>\n\nYour task "<b>${taskTitle}</b>" has been verified and approved.\n\n<b>+${reward} STON</b> has been added to your balance.`
    );

    setProcessing({});
  };

  const handleReject = async (item) => {
    const userId = item.userId || item.user?.id;
    const taskTitle = item.taskTitle || item.task?.title || 'a task';

    if (!userId) return;

    setProcessing({ userId, taskId: item.taskId, action: 'reject' });

    await sendMessage(
      userId,
      `❌ <b>Task Rejected</b>\n\nYour task "<b>${taskTitle}</b>" verification request has been rejected.\n\nPlease make sure you've completed the task correctly and try again.`
    );

    setProcessing({});
  };

  return (
    <div className="w-full">
      <Card className="bg-white/10 border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Pending Manual Verifications</CardTitle>
          <CardDescription className="text-muted-foreground">
            Approve or reject user tasks via Telegram bot messages only.
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
                  const userId = item.userId || item.user?.id;
                  const displayName = item.username || item.firstName || `User ${userId}`;
                  const taskTitle = item.taskTitle || item.task?.title || 'Unknown Task';
                  const taskTarget = item.taskTarget || item.task?.target || 'N/A';

                  const isProcessing =
                    processing.userId === userId && processing.taskId === item.taskId;
                  const isApproving = isProcessing && processing.action === 'approve';
                  const isRejecting = isProcessing && processing.action === 'reject';

                  return (
                    <TableRow key={`${userId}-${item.taskId}`} className="border-b border-white/10">
                      <TableCell className="text-sm font-medium text-white">
                        {displayName}
                      </TableCell>
                      <TableCell className="text-sm text-white">{taskTitle}</TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate text-white">
                        {taskTarget}
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
                            <>
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Processing
                            </>
                          ) : (
                            <>
                              <Check className="mr-1 h-4 w-4" /> Approve
                            </>
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
                            <>
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Processing
                            </>
                          ) : (
                            <>
                              <X className="mr-1 h-4 w-4" /> Reject
                            </>
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
