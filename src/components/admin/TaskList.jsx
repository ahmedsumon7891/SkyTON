import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TaskList = ({ tasks, onEditClick, onDeleteTask, isEditing }) => {
  return (
    <div className="w-full">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-b border-white/10">
            <TableHead className="text-white">Title</TableHead>
            <TableHead className="text-white">Type</TableHead>
            <TableHead className="text-white">Target</TableHead>
            <TableHead className="text-white text-right">Reward</TableHead>
            <TableHead className="text-white text-center">Status</TableHead>
            <TableHead className="text-white text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TableRow key={task.id} className="border-b border-white/10">
                <TableCell className="font-medium text-white">{task.title}</TableCell>
                <TableCell className="text-xs capitalize text-muted-foreground">{task.type.replace('_', ' ')}</TableCell>
                <TableCell className="text-xs max-w-[150px] truncate text-muted-foreground">{task.target || 'N/A'}</TableCell>
                <TableCell className="text-right font-semibold text-green-400">{task.reward}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={task.active ? 'success' : 'secondary'} className={task.active ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' : ''}>
                    {task.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    onClick={() => onEditClick(task)}
                    disabled={isEditing}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 bg-red-900/20 hover:bg-red-900/30 text-red-400" 
                        disabled={isEditing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This will permanently delete "{task.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 text-white hover:bg-white/10 border-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeleteTask(task.id)}
                          className="bg-red-900/20 hover:bg-red-900/30 text-red-400"
                        >
                          Delete Task
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No tasks created yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskList;
