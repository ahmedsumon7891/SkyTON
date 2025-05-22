import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Ban, CheckCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const UserManagementTab = ({ users = [], searchTerm, setSearchTerm, handleBanToggle }) => {
  const filteredUsers = users.filter(user => {
    const query = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      String(user.telegramId).includes(query) ||
      user.wallet?.toLowerCase().includes(query)
    );
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toLocaleDateString();
      } else if (timestamp?.seconds) {
        return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate().toLocaleDateString();
      }
    } catch {
      return 'Invalid';
    }
    return 'Invalid';
  };

  return (
    <div className="w-full text-white">
      <Card className="bg-white/5 border border-white/10 rounded-xl shadow-md">
        <CardHeader>
          <CardTitle className="text-white">Manage Users</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            View, search, and manage user accounts.
          </CardDescription>
          <Input
            type="text"
            placeholder="Search by ID, name, username, wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-4 bg-black/30 text-white placeholder:text-muted border-white/10"
          />
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Refs</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'N/A';
                const fallback = (user.firstName || user.username || 'U')[0]?.toUpperCase();
                return (
                  <TableRow key={user.id || user.telegramId} className={user.isBanned ? 'opacity-50 bg-destructive/10' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.profilePicUrl || `https://avatar.vercel.sh/${user.username || user.telegramId}.png?size=32`}
                            alt={user.username || user.telegramId}
                          />
                          <AvatarFallback>{fallback}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-white">{displayName}</p>
                          <p className="text-xs text-muted-foreground">@{user.username || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-mono">{user.telegramId}</TableCell>
                    <TableCell className="text-xs">{formatDate(user.joinedAt)}</TableCell>

                    <TableCell className="text-xs font-mono">
                      {user.wallet ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : 'N/A'}
                    </TableCell>

                    <TableCell className="text-right font-semibold text-sm text-green-300">
                      {user.balance?.toLocaleString() || 0}
                    </TableCell>

                    <TableCell className="text-right text-sm">{user.referrals || 0}</TableCell>

                    <TableCell className="text-center">
                      <Badge variant={user.isBanned ? 'destructive' : 'success'}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </Badge>
                      {user.isAdmin && (
                        <Badge variant="secondary" className="ml-1">Admin</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant={user.isBanned ? 'outline' : 'destructive'}
                        size="sm"
                        onClick={() => handleBanToggle(user.telegramId, user.isBanned)}
                      >
                        {user.isBanned ? (
                          <>
                            <CheckCircle className="mr-1 h-4 w-4" /> Unban
                          </>
                        ) : (
                          <>
                            <Ban className="mr-1 h-4 w-4" /> Ban
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No users found matching your search.
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

export default UserManagementTab;  
