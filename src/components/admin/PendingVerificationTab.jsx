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
  return (
    <Card className="bg-[#1a1a1a] border border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Pending Manual Verifications</CardTitle>
        <CardDescription className="text-muted-foreground">
          Review tasks submitted by users that need manual approval.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table className="text-white">
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground">User </TableHead>
              <TableHead className="text-muted-foreground">Task</TableHead>
              <TableHead className="text-muted-foreground">Target</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pendingItems.length > 0 ? (
              pendingItems.map((item) => {
                const displayName = item.username || item.firstName || `User  ${item.userId}`;
                const isHandle = item.taskTarget?.startsWith('@');
                const isLink = item.taskTarget?.startsWith('http');
                const link = isHandle
                  ? `https://t.me/${item.taskTarget.replace('@', '')}`
                  : isLink
                  ? item.taskTarget
                  : item.taskTarget
                  ? `https://${item.taskTarget}`
                  : null;

                return (
                  <TableRow key={`${item.userId}-${item.taskId}`}>
                    <TableCell className="text-sm font-medium text-white">
                      {displayName}
                    </TableCell>

                    <TableCell className="text-sm text-white">
                      {item.taskTitle || 'N/A'}
                    </TableCell>

                    <TableCell className="text-xs max-w-[150px] truncate text-white">
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline break-words"
                        >
                          {item.taskTarget}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => onApprove(item.userId, item.taskId)}
                      >
                        <Check className="mr-1 h-4 w-4" /> Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
  );
};

export default PendingVerificationTab;
                          
