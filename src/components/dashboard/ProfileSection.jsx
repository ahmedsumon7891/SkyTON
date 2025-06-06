import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Link as LinkIcon, Gift, Zap, Users, CheckCircle2, Copy, Unlink, X, AlertTriangle, Send, History, Calendar, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { connectWallet, disconnectWallet, getCurrentUser } from '@/data';
import { createWithdrawalRequest, getUserWithdrawalHistory } from '@/data/firestore/adminActions';

const ProfileSection = ({ user, refreshUserData }) => {
  const [walletInput, setWalletInput] = useState("");
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [copying, setCopying] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { toast } = useToast();

  // Get admin Telegram username from environment variable, fallback to empty string
  const adminUsername = import.meta.env.VITE_ADMIN_TG_USERNAME;

  // Check if user is banned
  const isBanned = user.isBanned;

  const handleConnectWallet = async () => {
    if (!user?.id) return;
    if (walletInput.trim()) {
      if (
        walletInput.length === 48 &&
        (walletInput.startsWith("EQ") || walletInput.startsWith("UQ"))
      ) {
        const success = await connectWallet(user.id, walletInput);
        if (success) {
          const updatedUser = await getCurrentUser(user.id);
          if (updatedUser) refreshUserData(updatedUser);
          setWalletInput("");
          setShowWalletDialog(false);
          toast({
            title: "Wallet Connected",
            description: `Wallet ${walletInput.substring(
              0,
              6
            )}...${walletInput.substring(walletInput.length - 4)} added.`,
            variant: "success",
            className: "bg-[#1a1a1a] text-white",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to connect wallet.",
            variant: "destructive",
            className: "bg-[#1a1a1a] text-white",
          });
        }
      } else {
        toast({
          title: "Invalid Wallet",
          description:
            "TON address must be 48 characters starting with EQ or UQ.",
          variant: "destructive",
          className: "bg-[#1a1a1a] text-white",
        });
      }
    } else {
      toast({
        title: "Wallet Required",
        description: "Please enter your TON wallet address.",
        variant: "destructive",
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
        title: "Wallet Disconnected",
        variant: "default",
        className: "bg-[#1a1a1a] text-white",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to disconnect wallet.",
        variant: "destructive",
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
        title: "Wallet copied!",
        description: user.wallet,
        className: "bg-[#1a1a1a] text-white break-all whitespace-pre-line",
      });
      setTimeout(() => setCopying(false), 1200);
    } catch {
      toast({
        title: "Copy failed!",
        variant: "destructive",
        className: "bg-[#1a1a1a] text-white",
      });
    }
  };

  // Helper function to send messages to admin
  const sendAdminNotification = async (message) => {
    try {
      await fetch(
        `https://api.telegram.org/bot${
          import.meta.env.VITE_TG_BOT_TOKEN
        }/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "5063003944", // Admin chat ID
            text: message,
            parse_mode: "HTML",
          }),
        }
      );
    } catch (err) {
      console.error("Failed to send admin notification:", err);
    }
  };

  const handleWithdraw = async () => {
    if (!user?.id || !withdrawAmount) return;

    // Validate amount
    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > (user.balance || 0)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount within your balance.",
        variant: "destructive",
        className: "bg-[#1a1a1a] text-white",
      });
      return;
    }

    setVerifying(true);

    // Create withdrawal request
    const success = await createWithdrawalRequest(
      user.id,
      amount,
      user.wallet,
      user.balance,
      user.username
    );

    if (success) {
      // Send withdrawal request notification to admin
      const userMention = user.username
        ? `@${user.username}`
        : `User ${user.id}`;
      await sendAdminNotification(
        `💰 <b>Withdrawal Request</b>\n${userMention} requested to withdraw <b>${amount} STON</b>\nWallet: ${
          user.wallet
        }\nConversion: ${stonToTon(amount)} TON`
      );

      toast({
        title: "Withdrawal Requested",
        description: `You have requested to withdraw ${amount} STON.`,
        variant: "success",
        className: "bg-[#1a1a1a] text-white",
      });
      setWithdrawAmount("");
      setShowWithdrawDialog(false);
    } else {
      toast({
        title: "Withdrawal Failed",
        description:
          "Could not process your withdrawal request. Please try again later.",
        variant: "destructive",
        className: "bg-[#1a1a1a] text-white",
      });
    }
    setVerifying(false);
  };

  const handleShowHistory = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID not found",
        variant: "destructive",
        className: "bg-[#1a1a1a] text-white",
      });
      return;
    }

    setLoadingHistory(true);
    setShowHistoryDialog(true);

    try {
      console.log("Fetching withdrawal history for user:", user.id); // Debug log
      const history = await getUserWithdrawalHistory(user.id);
      console.log("Withdrawal history received:", history); // Debug log
      setWithdrawalHistory(history || []);
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal history",
        variant: "destructive",
        className: "bg-[#1a1a1a] text-white",
      });
      setWithdrawalHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleMaxClick = () => {
    setWithdrawAmount(user.balance?.toString() || "0");
  };

  const stonToTon = (ston) => {
    const amount = parseFloat(ston) || 0;
    return (amount / 10000000).toFixed(6);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-300 border-yellow-600"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="text-green-300 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-300 border-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const tasksDone = user.tasks
    ? Object.values(user.tasks).filter(Boolean).length
    : 0;
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.username || `User ${user.id}`;
  const fallbackAvatar = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="relative w-full h-[100dvh] bg-[#0f0f0f] text-white">
      {/* Fixed warning at the top */}
      {isBanned && (
        <div
          className="fixed top-0 left-0 w-full z-50 flex justify-center"
          style={{ pointerEvents: "auto" }}
        >
          <div className="flex items-start gap-3 bg-gradient-to-r from-red-700 via-red-600 to-red-500 border-2 border-red-400 rounded-xl p-4 shadow-lg mt-4 w-full max-w-md mx-auto animate-pulse">
            <div className="flex-shrink-0 mt-1">
              <AlertTriangle className="text-yellow-300 bg-red-900 rounded-full p-1 w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-white mb-1">
                Account Banned
              </div>
              <div className="text-white/90 text-sm mb-2">
                Your account has been{" "}
                <span className="font-semibold text-yellow-200">banned</span>.
                If you believe this is a mistake, please contact the admin for
                assistance.
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
        className="flex flex-col items-center justify-center px-4 overflow-y-auto"
        style={{ height: "100dvh", paddingTop: isBanned ? "112px" : "0" }}
      >
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-sky-500">
            <AvatarImage
              src={
                user.profilePicUrl ||
                `https://avatar.vercel.sh/${user.username || user.id}.png`
              }
              alt={user.username || user.id}
            />
            <AvatarFallback>{fallbackAvatar}</AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-sm text-gray-400">
              @{user.username || "telegram_user"}
            </p>
          </div>

          {/* Responsive Stat Boxes */}
          <div className="grid grid-cols-2 gap-4 w-full text-sm">
            <div className="bg-sky-900 p-4 rounded-xl text-center flex flex-col items-center transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:border-sky-400 border border-transparent">
              <div className="flex items-center justify-center mb-1">
                <Wallet className="h-5 w-5 text-sky-300 mr-1" />
                <span className="text-gray-300">Balance</span>
              </div>
              <p className="text-lg font-bold text-green-300">
                {user.balance?.toLocaleString() || "0"} STON
              </p>
            </div>
            <div className="bg-yellow-900 p-4 rounded-xl text-center flex flex-col items-center transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:border-yellow-300 border border-transparent">
              <div className="flex items-center justify-center mb-1">
                <Zap className="h-5 w-5 text-yellow-300 mr-1" />
                <span className="text-gray-300">Energy</span>
              </div>
              <p className="text-lg font-bold text-yellow-300 flex items-center justify-center">
                {user.energy || 0}
              </p>
            </div>
            <div className="bg-purple-900 p-4 rounded-xl text-center flex flex-col items-center transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:border-purple-400 border border-transparent">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-5 w-5 text-purple-300 mr-1" />
                <span className="text-gray-300">Referrals</span>
              </div>
              <p className="text-lg font-bold text-purple-300">
                {user.referrals || 0}
              </p>
            </div>
            <div className="bg-emerald-900 p-4 rounded-xl text-center flex flex-col items-center transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:border-emerald-400 border border-transparent">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 mr-1" />
                <span className="text-gray-300">Tasks Done</span>
              </div>
              <p className="text-lg font-bold text-emerald-300">{tasksDone}</p>
            </div>
          </div>

          {/* Wallet Box */}
          <div className="w-full mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">TON Wallet</p>
            {user.wallet ? (
              <div className="flex items-center bg-white/5 px-4 py-3 rounded-xl text-sm w-full justify-between gap-2">
                <Wallet className="h-5 w-5 text-sky-400 flex-shrink-0" />
                <span
                  className="truncate font-mono px-2 text-white select-text text-base text-left w-full"
                  title={user.wallet}
                  style={{ userSelect: "text" }}
                >
                  {user.wallet.substring(0, 10)}...
                  {user.wallet.substring(user.wallet.length - 4)}
                </span>
                <button
                  type="button"
                  className="flex items-center p-1.5 rounded-full transition hover:bg-sky-400/20 active:scale-95"
                  aria-label="Copy Wallet Address"
                  title={copying ? "Copied!" : "Copy Wallet Address"}
                  onClick={handleCopyWallet}
                >
                  <Copy
                    className={`h-5 w-5 ${
                      copying ? "text-green-400" : "text-gray-400"
                    } transition`}
                  />
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
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowWalletDialog(true)}
              >
                <Wallet className="mr-2 h-5 w-5" /> Connect Wallet
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowWithdrawDialog(true)}
            >
              <Gift className="mr-2 h-5 w-5" /> Claim Rewards
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleShowHistory}
            >
              <History className="mr-2 h-5 w-5" /> Withdrawal History
            </Button>
          </div>
        </div>

        {/* Wallet Input Dialog */}
        {showWalletDialog && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1c1c1c] text-white w-[90%] max-w-sm p-6 rounded-xl shadow-xl relative"
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                onClick={() => setShowWalletDialog(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold mb-4">
                Enter your TON Wallet
              </h2>
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

        {/* Withdraw Dialog */}
        {showWithdrawDialog && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1c1c1c] text-white w-[90%] max-w-sm p-6 rounded-xl shadow-xl relative"
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                onClick={() => setShowWithdrawDialog(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold mb-4">Withdraw STON</h2>

              {/* Manual Verification Notice */}
              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 mb-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ All withdrawals require manual verification by admin before
                  processing.
                </p>
              </div>

              {user.wallet ? (
                <>
                  {/* Wallet Address Display */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">
                      Withdrawal Address:
                    </p>
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-xs font-mono text-white break-all">
                        {user.wallet}
                      </p>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">
                      Amount to Withdraw:
                    </p>
                    <div className="relative">
                      <Input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter STON amount"
                        className="text-white placeholder:text-gray-400 bg-[#0f0f0f] border border-gray-700 pr-16"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute right-1 top-1 h-8 px-3 text-xs"
                        onClick={handleMaxClick}
                      >
                        Max
                      </Button>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">
                      Available Balance:{" "}
                      <span className="text-green-400 font-semibold">
                        {user.balance?.toLocaleString() || "0"} STON
                      </span>
                    </p>
                  </div>

                  {/* STON to TON Conversion */}
                  <div className="mb-6">
                    <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-3">
                      <p className="text-blue-300 text-sm mb-1">
                        Auto Conversion:
                      </p>
                      <p className="text-white font-semibold">
                        {withdrawAmount || "0"} STON ={" "}
                        {stonToTon(withdrawAmount)} TON
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Rate: 10,000,000 STON = 1 TON
                      </p>
                    </div>
                  </div>

                  {/* Withdraw Button */}
                  <Button
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={
                      verifying ||
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) <= 0 ||
                      parseFloat(withdrawAmount) > (user.balance || 0)
                    }
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Request Withdrawal"
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-500 mb-4">
                    Please set your wallet address first via the wallet
                    connection feature.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowWithdrawDialog(false);
                      setShowWalletDialog(true);
                    }}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Withdrawal History Dialog */}
        {showHistoryDialog && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1c1c1c] text-white w-[90%] max-w-lg p-6 rounded-xl shadow-xl relative max-h-[80vh] overflow-hidden"
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"
                onClick={() => setShowHistoryDialog(false)}
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <History className="mr-2 h-5 w-5" />
                Withdrawal History
              </h2>

              <div className="overflow-y-auto max-h-[60vh] pr-2">
                {loadingHistory ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-gray-400">
                      Loading history...
                    </span>
                  </div>
                ) : withdrawalHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No withdrawal history found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Your withdrawal requests will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawalHistory.map((withdrawal) => (
                      <Card
                        key={withdrawal.id}
                        className="bg-[#0f0f0f] border-gray-700"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4 text-sky-400" />
                              <span className="font-semibold text-white">
                                {withdrawal.amount?.toLocaleString()} STON
                              </span>
                            </div>
                            {getStatusBadge(withdrawal.status)}
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">TON Amount:</span>
                              <span className="text-blue-400 font-mono">
                                {stonToTon(withdrawal.amount)} TON
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-400">Date:</span>
                              <span className="text-white flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(withdrawal.createdAt)}
                              </span>
                            </div>

                            {withdrawal.walletAddress && (
                              <div className="mt-2">
                                <span className="text-gray-400 text-xs">
                                  Wallet:
                                </span>
                                <p className="text-white font-mono text-xs break-all bg-white/5 p-2 rounded mt-1">
                                  {withdrawal.walletAddress}
                                </p>
                              </div>
                            )}

                            {withdrawal.status === "approved" &&
                              withdrawal.approvedAt && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">
                                    Approved:
                                  </span>
                                  <span className="text-green-400">
                                    {formatDate(withdrawal.approvedAt)}
                                  </span>
                                </div>
                              )}

                            {withdrawal.status === "rejected" &&
                              withdrawal.rejectedAt && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">
                                    Rejected:
                                  </span>
                                  <span className="text-red-400">
                                    {formatDate(withdrawal.rejectedAt)}
                                  </span>
                                </div>
                              )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
