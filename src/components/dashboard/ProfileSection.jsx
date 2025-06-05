import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Wallet, Link as LinkIcon, Gift, Zap, Users, CheckCircle2, Copy, Unlink, X, AlertTriangle, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { connectWallet, disconnectWallet, getCurrentUser , requestManualVerification } from '@/data';

const ProfileSection = ({ user, refreshUserData }) => {
  const [walletInput, setWalletInput] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [verifyingTransaction, setVerifyingTransaction] = useState(false);
  const { toast } = useToast();

  const adminUsername = import.meta.env.VITE_ADMIN_TG_USERNAME;
  const isBanned = user.isBanned;

  const handleConnectWallet = async () => {
    if (!user?.id) return;
    if (walletInput.trim()) {
      if (walletInput.length === 48 && (walletInput.startsWith('EQ') || walletInput.startsWith('UQ'))) {
        const success = await connectWallet(user.id, walletInput);
        if (success) {
          const updatedUser  = await getCurrentUser (user.id);
          if (updatedUser ) refreshUserData(updatedUser );
          setWalletInput('');
          setShowDialog(false);
          toast({
            title: 'Wallet Connected',
            description: `Wallet ${walletInput.substring(0, 6)}...${walletInput.substring(walletInput.length - 4)} added.`,
            variant: 'success',
            className: "bg-[#1a1a1a] text-white",
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to connect wallet.',
            variant: 'destructive',
            className: "bg-[#1a1a1a] text-white",
          });
        }
      } else {
        toast({
          title: 'Invalid Wallet',
          description: 'TON address must be 48 characters starting with EQ or UQ.',
          variant: 'destructive',
          className: "bg-[#1a1a1a] text-white",
        });
      }
    } else {
      toast({
        title: 'Wallet Required',
        description: 'Please enter your TON wallet address.',
        variant: 'destructive',
        className: "bg-[#1a1a1a] text-white",
      });
    }
  };

  const handleDisconnectWallet = async () => {
    if (!user?.id) return;
    const success = await disconnectWallet(user.id);
    if (success) {
      const updatedUser  = await getCurrentUser (user.id);
      if (updatedUser ) refreshUser Data(updatedUser );
      toast({
        title: 'Wallet Disconnected',
        variant: 'default',
        className: "bg-[#1a1a1a] text-white",
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to disconnect wallet.',
        variant: 'destructive',
        className: "bg-[#1a1a1a] text-white",
      });
    }
  };

  const handleCopyWallet = async () => {
    if (!user.wallet) return;
    try {
      await navigator.clipboard.writeText(user.wallet);
      toast({
        title: 'Wallet copied!',
        description: user.wallet,
        className: 'bg-[#1a1a1a] text-white break-all whitespace-pre-line',
      });
    } catch {
      toast({
        title: "Copy failed!",
        variant: "destructive",
        className: 'bg-[#1a1a1a] text-white',
      });
    }
  };

  const handleWithdraw = async () => {
    // Logic to handle withdrawal
    // You can implement the withdrawal API call here
    toast({
      title: 'Withdrawal Successful',
      description: `You have withdrawn ${withdrawAmount} STON.`,
      variant: 'success',
    });
    setWithdrawAmount('');
    setShowDialog(false);
  };

  const handleMaxClick = () => {
    setWithdrawAmount(user.balance?.toString() || '0');
  };

  const stonToTon = (ston) => {
    return (ston / 10000000).toFixed(6); // Convert STON to TON
  };

  const handleTransactionVerification = async () => {
    setVerifyingTransaction(true);
    const success = await requestManualVerification(user.id, withdrawAmount);
    if (success) {
      toast({
        title: 'Verification Requested',
        description: `Verification for ${withdrawAmount} STON has been requested.`,
        variant: 'success',
      });
    } else {
      toast({
        title: 'Verification Failed',
        description: 'Could not request verification. Try again later.',
        variant: 'destructive',
      });
    }
    setVerifyingTransaction(false);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#0f0f0f] text-white">
      {/* Fixed warning at the top */}
      {isBanned && (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center">
          <div className="flex items-start gap-3 bg-gradient-to-r from-red-700 via-red-600 to-red-500 border-2 border-red-400 rounded-xl p-4 shadow-lg mt-4 w-full max-w-md mx-auto animate-pulse">
            <div className="flex-shrink-0 mt-1">
              <AlertTriangle className="text-yellow-300 bg-red-900 rounded-full p-1 w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-white mb-1">Account Banned</div>
              <div className="text-white/90 text-sm mb-2">
                Your account has been <span className="font-semibold text-yellow-200">banned</span>. If you believe this is a mistake, please contact the admin for assistance.
              </div>
              <a
                href={`https://t.me/${adminUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sky-200 font-semibold transition"
              >
                <Send className="w-4 h-4" />
                Contact Admin
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main scrollable content */}
      <div className="flex flex-col items-center justify-center px-4 overflow-y-auto" style={{ height: '100dvh', paddingTop: isBanned ? '112px' : '0' }}>
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-sky-500">
            <AvatarImage src={user.profilePicUrl || `https://avatar.vercel.sh/${user.username || user.id}.png`} alt={user.username || user.id} />
            <AvatarFallback>{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || `User  ${user.id}`}</AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || `User  ${user.id}`}</h1>
            <p className="text-sm text-gray-400">@{user.username || 'telegram_user'}</p>
          </div>

          {/* Wallet Box */}
          <div className="w-full mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">TON Wallet</p>
            {user.wallet ? (
              <div className="flex items-center bg-white/5 px-4 py-3 rounded-xl text-sm w-full justify-between gap-2">
                <Wallet className="h-5 w-5 text-sky-400 flex-shrink-0" />
                <span className="truncate font-mono px-2 text-white select-text text-base text-left w-full" title={user.wallet}>
                  {user.wallet.substring(0, 10)}...{user.wallet.substring(user.wallet.length - 4)}
                </span>
                <button
                  type="button"
                  className="flex items-center p-1.5 rounded-full transition hover:bg-sky-400/20 active:scale-95"
                  aria-label="Copy Wallet Address"
                  title="Copy Wallet Address"
                  onClick={handleCopyWallet}
                >
                  <Copy className="h-5 w-5 text-gray-400" />
                </button>
                <button
                  type="button"
                  className="flex items-center p-1.5 rounded-full transition hover:bg-red-400/20 active:scale-95 ml-1"
                  aria-label="Disconnect Wallet"
                  title="Disconnect Wallet"
                  onClick={handleDisconnectWallet}
                >
                  <Unlink className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ) : (
              <Button variant="secondary" className="w-full" onClick={() => setShowDialog(true)}>
                <Wallet className="mr-2 h-5 w-5" /> Connect Wallet
              </Button>
            )}
          </div>

          {/* Withdraw Button */}
          <Button variant="ghost" className="mt-4 w-full" onClick={() => setShowDialog(true)}>
            <Gift className="mr-2 h-5 w-5" /> Claim Rewards
          </Button>
        </div>

        {/* Withdraw Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1c1c1c] text-white w-[90%] max-w-sm p-6 rounded-xl shadow-xl relative"
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                onClick={() => setShowDialog(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold mb-4">Withdraw STON</h2>
              {user.wallet ? (
                <>
                  <p className="text-sm text-gray-400 mb-2">Your Wallet: {user.wallet}</p>
                  <Input
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount to withdraw"
                    className="mb-4 text-white placeholder:text-gray-400 bg-[#0f0f0f] border border-gray-700"
                  />
                  <div className="flex justify-between mb-4">
                    <Button onClick={handleMaxClick}>Max</Button>
                    <p className="text-sm text-gray-400">Balance: {user.balance?.toLocaleString() || '0'} STON</p>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Convert to TON: {stonToTon(withdrawAmount)} TON</p>
                  <Button className="w-full" onClick={handleWithdraw}>
                    Withdraw
                  </Button>
                  <Button className="w-full mt-2" onClick={handleTransactionVerification} disabled={verifyingTransaction}>
                    {verifyingTransaction ? 'Verifying...' : 'Request Manual Verification'}
                  </Button>
                </>
              ) : (
                <p className="text-red-500">Please connect your wallet first.</p>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
