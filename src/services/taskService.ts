// Service for updating task progress

interface TaskProgress {
  taskId: string;
  completed: boolean;
  score?: number;
  answers?: any; // Could be quiz answers or other task-specific data
}

// Update task progress
export async function updateTaskProgress(progress: TaskProgress): Promise<{ success: boolean } | { error: string }> {
  try {
    const response = await fetch('/api/tasks/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progress),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'unauthorized' };
      }
      
      const data = await response.json();
      return { error: data.error || 'Failed to update task progress' };
    }

    return { success: true };
  } catch (error) {
    console.error('Update task progress error:', error);
    return { error: 'An unexpected error occurred while updating task progress' };
  }
} 