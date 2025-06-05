import React, { useState } from 'react';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';

const PendingWithdrawTab = ({ pendingWithdrawals = [], onApprove, onReject }) => {
  const [processing, setProcessing] = useState({});

  const handleApprove = async (withdrawal) => {
    const { userId, amount } = withdrawal;
    setProcessing({ userId, action: 'approve' });

    try {
      await onApprove(userId, amount);
      // Notify user about the approval
      // You can implement a notification function here
    } catch (error) {
      console.error(`Error approving withdrawal for user ${userId}:`, error);
    } finally {
      setProcessing({});
    }
  };

  const handleReject = async (withdrawal) => {
    const { userId } = withdrawal;
    setProcessing({ userId, action: 'reject' });

    try {
      await onReject(userId);
      // Notify user about the rejection
      // You can implement a notification function here
    } catch (error) {
      console.error(`Error rejecting withdrawal for user ${userId}:`, error);
    } finally {
      setProcessing({});
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#FFD429]">Pending Withdrawals</h2>
        <p className="text-sm text-muted-foreground">Review withdrawal requests submitted by users</p>
      </div>

      {pendingWithdrawals.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No pending withdrawals.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pendingWithdrawals.map((withdrawal) => {
            const { userId, amount, walletAddress } = withdrawal;
            const isProcessing = processing.userId === userId;

            return (
              <Card 
                key={userId}
                className="bg-white/10 border-none shadow-md overflow-hidden"
              >
                <CardContent className="p-4 bg-[#483D8B] space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#FFD429]">Withdrawal Request</h3>
                    <div className="text-xs">
                      <span className="text-[#BCCCDC]">User  ID: </span>
                      <span className="text-sky-300">{userId}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[#BCCCDC]">Amount: </span>
                      <span className="text-green-400 font-semibold">{amount} STON</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[#BCCCDC]">Wallet Address: </span>
                      <span className="text-white">{walletAddress}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 bg-green-900/20 hover:bg-green-900/30 text-green-400 border-green-900/30"
                      onClick={() => handleApprove(withdrawal)}
                      disabled={isProcessing}
                    >
                      {isProcessing && processing.action === 'approve' ? (
                        <>
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Approving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-1 h-3.5 w-3.5" /> Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 h-8 bg-red-900/20 hover:bg-red-900/30 text-red-400"
                      onClick={() => handleReject(withdrawal)}
                      disabled={isProcessing}
                    >
                      {isProcessing && processing.action === 'reject' ? (
                        <>
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Rejecting...
                        </>
                      ) : (
                        <>
                          <X className="mr-1 h-3.5 w-3.5" /> Reject
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingWithdrawTab;
