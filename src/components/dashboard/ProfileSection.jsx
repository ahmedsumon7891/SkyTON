import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Wallet, Link as LinkIcon, Gift, Zap, Users, CheckCircle2, Copy, Unlink, X, AlertTriangle, Send, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { connectWallet, disconnectWallet, getCurrentUser } from '@/data';
import QRCode from '@/components/ui/QRCode';

const ProfileSection = ({ user, refreshUserData }) => {
  const [walletInput, setWalletInput] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyingRef, setCopyingRef] = useState(false);
  const { toast } = useToast();

  // Get admin Telegram username from environment variable, fallback to empty string
  const adminUsername = import.meta.env.VITE_ADMIN_TG_USERNAME;

  // Check if user is banned
  const isBanned = user.isBanned;

  const handleConnectWallet = async () => {
    if (!user?.id) return;
    if (walletInput.trim()) {
      if (walletInput.length === 48 && (walletInput.startsWith('EQ') || walletInput.startsWith('UQ'))) {
        const success = await connectWallet(user.id, walletInput);
        if (success) {
          const updatedUser = await getCurrentUser(user.id);
          if (updatedUser) refreshUserData(updatedUser);
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
      const updatedUser = await getCurrentUser(user.id);
      if (updatedUser) refreshUserData(updatedUser);
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
      setCopying(true);
      toast({
        title: 'Wallet copied!',
        description: user.wallet,
        className: 'bg-[#1a1a1a] text-white break-all whitespace-pre-line',
      });
      setTimeout(() => setCopying(false), 1200);
    } catch {
      toast({
        title: "Copy failed!",
        variant: "destructive",
        className: 'bg-[#1a1a1a] text-white',
      });
    }
  };

  // Referral link logic
  const referralLink = `${window.location.origin}/ref/${user.username || user.id}`;
  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopyingRef(true);
      toast({
        title: 'Referral link copied!',
        description: referralLink,
        className: 'bg-[#1a1a1a] text-white break-all whitespace-pre-line',
      });
      setTimeout(() => setCopyingRef(false), 1200);
    } catch {
      toast({
        title: "Copy failed!",
        variant: "destructive",
        className: 'bg-[#1a1a1a] text-white',
      });
    }
  };

  const tasksDone = user.tasks ? Object.values(user.tasks).filter(Boolean).length : 0;
  const displayName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || `User ${user.id}`;
  const fallbackAvatar = displayName.substring(0, 2).toUpperCase();

  // Height of the warning bar (change if you change the warning's height)
  const warningBarHeight = isBanned ? 92 : 0; // px

  // For progress bar (assuming 10 tasks max, adjust as needed)
  const maxTasks = 10;
  const tasksPercent = Math.min(100, (tasksDone / maxTasks) * 100);

  return (
    <div className="relative w-full min-h-[100dvh] text-white overflow-x-hidden font-sans">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#24243e] animate-gradient-x" />
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease-in-out infinite;
        }
        .animate-glow {
          box-shadow: 0 0 24px 6px #38bdf8, 0 0 0 4px #0ea5e9 inset;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* Fixed warning at the top */}
      {isBanned && (
        <div
          className="fixed top-0 left-0 w-full z-50 flex justify-center"
          style={{ pointerEvents: 'auto' }}
        >
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

      {/* Main scrollable content, with padding-top for warning */}
      <div
        className="flex flex-col items-center justify-center px-2 sm:px-4 py-8 min-h-[100dvh] relative z-10"
        style={{
          paddingTop: isBanned ? '112px' : '0', // 112px = warning height + margin
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="w-full max-w-md flex flex-col items-center gap-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20"
        >
          {/* Avatar with glow */}
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-sky-500 animate-glow shadow-lg">
              <AvatarImage src={user.profilePicUrl || `https://avatar.vercel.sh/${user.username || user.id}.png`} alt={user.username || user.id} />
              <AvatarFallback>{fallbackAvatar}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-2 right-2 bg-green-400 rounded-full w-5 h-5 border-2 border-white animate-pulse" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-sm text-gray-400">@{user.username || 'telegram_user'}</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 w-full text-sm">
            <motion.div
              whileHover={{ scale: 1.07, boxShadow: "0 4px 32px #38bdf8aa" }}
              className="bg-sky-900/80 p-4 rounded-xl text-center flex flex-col items-center border border-sky-400/30 shadow-lg transition-all"
            >
              <Wallet className="h-5 w-5 text-sky-300 mb-1 animate-spin-slow" />
              <span className="text-gray-300">Balance</span>
              <p className="text-lg font-bold text-green-300">{user.balance?.toLocaleString() || '0'} STON</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, boxShadow: "0 4px 32px #fde047aa" }}
              className="bg-yellow-900/80 p-4 rounded-xl text-center flex flex-col items-center border border-yellow-300/30 shadow-lg transition-all"
            >
              <Zap className="h-5 w-5 text-yellow-300 mb-1 animate-pulse" />
              <span className="text-gray-300">Energy</span>
              <p className="text-lg font-bold text-yellow-300">{user.energy || 0}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, boxShadow: "0 4px 32px #a78bfaaa" }}
              className="bg-purple-900/80 p-4 rounded-xl text-center flex flex-col items-center border border-purple-400/30 shadow-lg transition-all"
            >
              <Users className="h-5 w-5 text-purple-300 mb-1" />
              <span className="text-gray-300">Referrals</span>
              <p className="text-lg font-bold text-purple-300">{user.referrals || 0}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.07, boxShadow: "0 4px 32px #34d399aa" }}
              className="bg-emerald-900/80 p-4 rounded-xl text-center flex flex-col items-center border border-emerald-400/30 shadow-lg transition-all"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-300 mb-1" />
              <span className="text-gray-300">Tasks Done</span>
              <p className="text-lg font-bold text-emerald-300">{tasksDone}</p>
            </motion.div>
          </div>

          {/* Progress Bar for Tasks */}
          <div className="w-full mt-2">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all"
                style={{ width: `${tasksPercent}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1 text-center">{tasksDone}/{maxTasks} Tasks Completed</div>
          </div>

          {/* Wallet Box */}
          <div className="w-full mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">TON Wallet</p>
            {user.wallet ? (
              <div className="flex items-center bg-white/10 px-4 py-3 rounded-xl text-sm w-full justify-between gap-2 border border-sky-400/20">
                <Wallet className="h-5 w-5 text-sky-400 flex-shrink-0" />
                <span
                  className="truncate font-mono px-2 text-white select-text text-base text-left w-full"
                  title={user.wallet}
                  style={{ userSelect: 'text' }}
                >
                  {user.wallet.substring(0, 10)}...{user.wallet.substring(user.wallet.length - 4)}
                </span>
                <button
                  type="button"
                  className="flex items-center p-1.5 rounded-full transition hover:bg-sky-400/20 active:scale-95"
                  aria-label="Copy Wallet Address"
                  title={copying ? "Copied!" : "Copy Wallet Address"}
                  onClick={handleCopyWallet}
                >
                  <Copy className={`h-5 w-5 ${copying ? 'text-green-400' : 'text-gray-400'} transition`} />
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

          {/* Referral Link with QR Code */}
          <div className="w-full mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Your Referral Link</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-mono text-xs bg-black/30 px-2 py-1 rounded text-white truncate max-w-[120px] sm:max-w-[200px]">{referralLink}</span>
              <button
                type="button"
                className="flex items-center p-1.5 rounded-full transition hover:bg-sky-400/20 active:scale-95"
                aria-label="Copy Referral Link"
                title={copyingRef ? "Copied!" : "Copy Referral Link"}
                onClick={handleCopyReferral}
              >
                <Copy className={`h-5 w-5 ${copyingRef ? 'text-green-400' : 'text-gray-400'} transition`} />
              </button>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Join%20me%20on%20SkyTON!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-1.5 rounded-full transition hover:bg-sky-400/20 active:scale-95"
                title="Share on Telegram"
              >
                <Share2 className="h-5 w-5 text-sky-400" />
              </a>
            </div>
            <div className="flex justify-center">
              <QRCode value={referralLink} size={80} bgColor="0f2027" fgColor="38bdf8" />
            </div>
          </div>

          <Button variant="ghost" className="mt-4 w-full opacity-60 cursor-not-allowed" disabled>
            <Gift className="mr-2 h-5 w-5" /> Claim Rewards (Coming Soon)
          </Button>
        </motion.div>

        {/* Wallet Input Dialog */}
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
              <h2 className="text-lg font-semibold mb-4">Enter your TON Wallet</h2>
              <Input
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="EQ... or UQ..."
                className="mb-4 text-white placeholder:text-gray-400 bg-[#0f0f0f] border border-gray-700"
              />
              <Button className="w-full" onClick={handleConnectWallet}>
                <LinkIcon className="w-4 h-4 mr-2" /> Connect
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
