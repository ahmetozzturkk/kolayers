/**
 * API service functions for interacting with the backend
 */

// User authentication
export async function loginUser(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  
  return response.json();
}

export async function signupUser(name: string, email: string, password: string) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }
  
  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch('/api/auth/user');
  
  if (!response.ok) {
    // If 401, user is not logged in
    if (response.status === 401) {
      return null;
    }
    
    const error = await response.json();
    throw new Error(error.error || 'Failed to get current user');
  }
  
  return response.json();
}

export async function updateUserProfile(data: { name?: string; image?: string }) {
  const response = await fetch('/api/auth/user', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }
  
  return response.json();
}

export async function updateUserPassword(currentPassword: string, newPassword: string) {
  const response = await fetch('/api/auth/password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update password');
  }
  
  return response.json();
}

export async function logoutUser() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Logout failed');
  }
  
  return response.json();
}

// Modules
export async function getModules() {
  const response = await fetch('/api/modules');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch modules');
  }
  
  return response.json();
}

// Tasks
export async function updateTaskProgress(taskId: string, data: any) {
  const response = await fetch('/api/tasks/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ taskId, ...data }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task progress');
  }
  
  return response.json();
}

// Badges
export async function getBadges() {
  const response = await fetch('/api/badges');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch badges');
  }
  
  return response.json();
}

// Referrals
export async function getReferrals() {
  const response = await fetch('/api/referrals');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch referrals');
  }
  
  return response.json();
}

export async function createReferral(referredEmail: string) {
  const response = await fetch('/api/referrals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ referredEmail }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create referral');
  }
  
  return response.json();
} 