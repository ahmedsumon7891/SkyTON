import React from 'react';
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
import { Check, X } from 'lucide-react';

const PendingVerificationTab = ({ pendingItems = [], onApprove, onReject }) => {
  // Debug log to see the actual structure of pendingItems
  console.log("Pending items:", pendingItems);

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
                  // Adapt these property accesses based on your actual data structure
                  const displayName = item.username || item.firstName || item.user?.username || `User ${item.userId}`;
                  const taskTitle = item.taskTitle || item.task?.title || "Unknown Task";
                  const taskTarget = item.taskTarget || item.task?.target || "";
                  
                  const isHandle = taskTarget?.startsWith('@');
                  const isLink = taskTarget?.startsWith('http');
                  const link = isHandle
                    ? `https://t.me/${taskTarget.replace('@', '')}`
                    : isLink
                    ? taskTarget
                    : taskTarget
                    ? `https://${taskTarget}`
                    : null;

                  return (
                    <TableRow key={`${item.userId}-${item.taskId}`} className="border-b border-white/10">
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
                          onClick={() => onApprove(item.userId, item.taskId)}
                        >
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="bg-red-900/20 hover:bg-red-900/30 text-red-400"
                          onClick={() => onReject(item.userId, item.taskId)}
                        >
                          <X className="mr-1 h-4 w-4" /> Reject
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
