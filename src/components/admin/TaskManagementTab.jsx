import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TaskForm from '@/components/admin/TaskForm';
import TaskList from '@/components/admin/TaskList';

// This component orchestrates TaskForm and TaskList
const TaskManagementTab = ({
  tasks = [],
  newTask,
  editingTask,
  handleNewTaskChange,
  handleNewTaskVerificationTypeChange,
  handleAddTask,
  handleEditingTaskChange,
  handleEditingTaskActiveChange,
  handleEditingTaskVerificationTypeChange,
  handleUpdateTask,
  setEditingTask,
  handleEditClick,
  handleDeleteTask
}) => {
  return (
    <motion.div className="w-full min-h-[100dvh] px-4 pb-28 pt-6 bg-[#0f0f0f] text-white overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">Manage Tasks</h2>
          <p className="text-sm text-muted-foreground">Create and manage tasks for users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-white">{editingTask ? 'Edit Task' : 'Add New Task'}</CardTitle>
                <CardDescription>
                  {editingTask
                    ? 'Modify the details of the existing task.'
                    : 'Create a new task for users to complete.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskForm
                  taskData={editingTask || newTask}
                  isEditing={!!editingTask}
                  onChange={editingTask ? handleEditingTaskChange : handleNewTaskChange}
                  onActiveChange={handleEditingTaskActiveChange}
                  onVerificationTypeChange={
                    editingTask
                      ? handleEditingTaskVerificationTypeChange
                      : handleNewTaskVerificationTypeChange
                  }
                  onSubmit={editingTask ? handleUpdateTask : handleAddTask}
                  onCancel={editingTask ? () => setEditingTask(null) : undefined}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-white">Current Tasks</CardTitle>
                <CardDescription>Manage existing task definitions.</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList
                  tasks={tasks}
                  onEditClick={handleEditClick}
                  onDeleteTask={handleDeleteTask}
                  isEditing={!!editingTask}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskManagementTab;
