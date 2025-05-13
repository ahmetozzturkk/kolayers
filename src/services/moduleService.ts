import { Module } from '@/src/types';

// Get all modules
export async function getAllModules(): Promise<{ modules: Module[] } | { error: string }> {
  try {
    const response = await fetch('/api/modules', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'unauthorized' };
      }
      
      const data = await response.json();
      return { error: data.error || 'Failed to fetch modules' };
    }

    const modules = await response.json();
    return { modules };
  } catch (error) {
    console.error('Get modules error:', error);
    return { error: 'An unexpected error occurred while fetching modules' };
  }
}

// Create a new module (admin only)
export async function createModule(module: Partial<Module>): Promise<{ module: Module } | { error: string }> {
  try {
    const response = await fetch('/api/modules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(module),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'unauthorized' };
      }
      
      const data = await response.json();
      return { error: data.error || 'Failed to create module' };
    }

    const createdModule = await response.json();
    return { module: createdModule };
  } catch (error) {
    console.error('Create module error:', error);
    return { error: 'An unexpected error occurred while creating the module' };
  }
} 