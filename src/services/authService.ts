// Authentication service for handling user login, signup, and session management

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  points: number;
}

// Sign up a new user
export async function signUp(name: string, email: string, password: string): Promise<{ user: User } | { error: string }> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to sign up' };
    }

    return { user: data.user };
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'An unexpected error occurred during signup' };
  }
}

// Log in an existing user
export async function login(email: string, password: string): Promise<{ user: User } | { error: string }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to log in' };
    }

    return { user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred during login' };
  }
}

// Log out the current user
export async function logout(): Promise<{ success: boolean } | { error: string }> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || 'Failed to log out' };
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: 'An unexpected error occurred during logout' };
  }
}

// Get the current user's information
export async function getCurrentUser(): Promise<{ user: User } | { error: string }> {
  try {
    const response = await fetch('/api/auth/user', {
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
      return { error: data.error || 'Failed to get user information' };
    }

    const user = await response.json();
    return { user };
  } catch (error) {
    console.error('Get current user error:', error);
    return { error: 'An unexpected error occurred while fetching user information' };
  }
} 