import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, CheckCircle, XCircle } from 'lucide-react';

const PendingWithdrawTab = ({ pendingWithdrawals, onApprove, onReject }) => {
  return (
    <div className="space-y-4">
      {pendingWithdrawals.length === 0 ? (
        <div className="text-center py-8">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No pending withdrawals found.</p>
        </div>
      ) : (
        pendingWithdrawals.map((withdrawal) => (
          <Card key={withdrawal.id} className="bg-[#1a1a1a] border border-gray-700">
            <CardContent className="flex flex-col p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">
                  Withdrawal Request
                </h3>
                <span className={`text-sm font-medium ${withdrawal.status === 'pending' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">User  ID:</span>
                <span className="text-white">{withdrawal.userId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white">{withdrawal.amount} STON</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Wallet Address:</span>
                <span className="text-white">{withdrawal.walletAddress}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Requested At:</span>
                <span className="text-white">{new Date(withdrawal.createdAt?.toDate()).toLocaleString()}</span>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => onApprove(withdrawal.id, withdrawal.userId, withdrawal.amount)}
                >
                  <CheckCircle className="mr-1" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex items-center"
                  onClick={() => onReject(withdrawal.id)}
                >
                  <XCircle className="mr-1" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PendingWithdrawTab;
