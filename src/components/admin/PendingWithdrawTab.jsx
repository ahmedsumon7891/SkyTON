import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Wallet, User, Calendar, Copy, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PendingWithdrawTab = ({ pendingWithdrawals, onApprove, onReject }) => {
  const [processing, setProcessing] = useState({});
  const { toast } = useToast();

  const handleApprove = async (withdrawal) => {
    if (!window.confirm(`Approve withdrawal of ${withdrawal.amount} STON (${stonToTon(withdrawal.amount)} TON) for ${withdrawal.username || withdrawal.userId}?`)) {
      return;
    }
    
    setProcessing(prev => ({ ...prev, [withdrawal.id]: 'approving' }));
    await onApprove(withdrawal.id, withdrawal.userId, withdrawal.amount);
    setProcessing(prev => ({ ...prev, [withdrawal.id]: null }));
    
    toast({
      title: 'Withdrawal Approved',
      description: `${withdrawal.amount} STON withdrawal approved for ${withdrawal.username || withdrawal.userId}`,
      variant: 'success',
      className: 'bg-[#1a1a1a] text-white',
    });
  };

  const handleReject = async (withdrawal) => {
    if (!window.confirm(`Reject withdrawal request for ${withdrawal.username || withdrawal.userId}?`)) {
      return;
    }
    
    setProcessing(prev => ({ ...prev, [withdrawal.id]: 'rejecting' }));
    await onReject(withdrawal.id);
    setProcessing(prev => ({ ...prev, [withdrawal.id]: null }));
    
    toast({
      title: 'Withdrawal Rejected',
      description: `Withdrawal request rejected for ${withdrawal.username || withdrawal.userId}`,
      variant: 'destructive',
      className: 'bg-[#1a1a1a] text-white',
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Wallet address copied to clipboard',
        className: 'bg-[#1a1a1a] text-white',
      });
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
        className: 'bg-[#1a1a1a] text-white',
      });
    }
  };

  const stonToTon = (ston) => {
    const amount = parseFloat(ston) || 0;
    return (amount / 10000000).toFixed(6);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const openTonScan = (address) => {
    window.open(`https://tonscan.org/address/${address}`, '_blank');
  };

  if (!pendingWithdrawals || pendingWithdrawals.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No pending withdrawals</p>
            <p className="text-gray-500 text-sm mt-2">All withdrawal requests have been processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Pending Withdrawals</h3>
        <Badge variant="secondary" className="bg-yellow-900 text-yellow-300">
          {pendingWithdrawals.length} pending
        </Badge>
      </div>

      <div className="grid gap-4">
        {pendingWithdrawals.map((withdrawal) => (
          <Card key={withdrawal.id} className="bg-[#1a1a1a] border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-400" />
                  {withdrawal.username ? `@${withdrawal.username}` : `User ${withdrawal.userId}`}
                </CardTitle>
                <Badge variant="outline" className="text-yellow-300 border-yellow-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">User ID</p>
                  <p className="text-white font-mono">{withdrawal.userId}</p>
                </div>
                <div>
                  <p className="text-gray-400">Request Date</p>
                  <p className="text-white flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(withdrawal.createdAt)}
                  </p>
                </div>
              </div>

              {/* Amount Info */}
              <div className="bg-[#0f0f0f] p-4 rounded-lg border border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">STON Amount</p>
                    <p className="text-green-400 font-bold text-lg flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {parseFloat(withdrawal.amount).toLocaleString()} STON
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">TON Equivalent</p>
                    <p className="text-blue-400 font-bold text-lg">
                      {stonToTon(withdrawal.amount)} TON
                    </p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-500">Rate: 10,000,000 STON = 1 TON</p>
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Withdrawal Address</p>
                <div className="bg-[#0f0f0f] p-3 rounded-lg border border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Wallet className="h-4 w-4 text-sky-400 flex-shrink-0" />
                    <span className="font-mono text-white text-sm truncate" title={withdrawal.walletAddress}>
                      {withdrawal.walletAddress}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(withdrawal.walletAddress)}
                      className="h-8 w-8 p-0 hover:bg-gray-700"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openTonScan(withdrawal.walletAddress)}
                      className="h-8 w-8 p-0 hover:bg-gray-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* User Balance Info */}
              {withdrawal.userBalance !== undefined && (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm">
                    <strong>User Balance:</strong> {withdrawal.userBalance?.toLocaleString() || 0} STON
                  </p>
                  {withdrawal.amount > (withdrawal.userBalance || 0) && (
                    <p className="text-red-400 text-xs mt-1">
                      ⚠️ Withdrawal amount exceeds user balance!
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => handleApprove(withdrawal)}
                  disabled={processing[withdrawal.id]}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {processing[withdrawal.id] === 'approving' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => handleReject(withdrawal)}
                  disabled={processing[withdrawal.id]}
                  variant="destructive"
                  className="flex-1"
                >
                  {processing[withdrawal.id] === 'rejecting' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PendingWithdrawTab;
