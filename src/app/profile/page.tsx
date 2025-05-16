'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, updateUserProfile, updateUserPassword } from '../../lib/api';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [tempSelectedAvatar, setTempSelectedAvatar] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    updates: true,
    achievement: true
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const router = useRouter();

  // Load user data when component mounts
  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
        
        if (userData) {
          setName(userData.name || '');
          setEmail(userData.email || '');
          setUsername(userData.username || `user${Math.floor(Math.random() * 10000)}`);
          
          // Set avatar if available
          if (userData.image) {
            const avatarId = parseInt(userData.image);
            if (!isNaN(avatarId) && avatarId > 0 && avatarId <= avatars.length) {
              setSelectedAvatar(avatarId);
              setTempSelectedAvatar(avatarId);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Avatar options - modern designs
  const avatars = [
    { id: 1, type: 'geometric', design: 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white', icon: 'star' },
    { id: 2, type: 'geometric', design: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white', icon: 'bolt' },
    { id: 3, type: 'geometric', design: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white', icon: 'sun' },
    { id: 4, type: 'geometric', design: 'bg-gradient-to-br from-rose-400 to-rose-600 text-white', icon: 'heart' },
    { id: 5, type: 'geometric', design: 'bg-gradient-to-br from-sky-400 to-sky-600 text-white', icon: 'cloud' },
    { id: 6, type: 'geometric', design: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white', icon: 'moon' },
    { id: 7, type: 'pattern', design: 'bg-indigo-600 bg-opacity-90 text-white', icon: 'code' },
    { id: 8, type: 'pattern', design: 'bg-emerald-600 bg-opacity-90 text-white', icon: 'check' },
    { id: 9, type: 'pattern', design: 'bg-amber-600 bg-opacity-90 text-white', icon: 'fire' }
  ];

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Save changes to the backend
      const updatedUser = await updateUserProfile({
        name,
        image: selectedAvatar.toString()
      });
      
      // Update local state with the updated user
      setUser(updatedUser);
      
      // Show success toast
      setToast({ 
        show: true, 
        message: 'Profile updated successfully!', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setToast({ 
        show: true, 
        message: 'Failed to update profile. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    
    // Validate password meets requirements
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUppercase) {
      setPasswordError("Password must contain at least one uppercase letter");
      return;
    }
    
    if (!hasNumber) {
      setPasswordError("Password must contain at least one number");
      return;
    }
    
    if (!hasSpecial) {
      setPasswordError("Password must contain at least one special character");
      return;
    }
    
    // If we got here, password is valid
    setPasswordError('');
    
    try {
      setIsLoading(true);
      
      // Get the current password from the form
      const currentPasswordInput = document.getElementById('current-password') as HTMLInputElement;
      const currentPassword = currentPasswordInput.value;
      
      // Call the API to update the password
      await updateUserPassword(currentPassword, password);
      
      // Show success toast
      setToast({ 
        show: true, 
        message: 'Password changed successfully!', 
        type: 'success' 
      });
      
      // Reset form
      setPassword('');
      setConfirmPassword('');
      currentPasswordInput.value = '';
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Check if it's a specific error like incorrect current password
      if (error instanceof Error) {
        if (error.message.includes('incorrect')) {
          setPasswordError('Current password is incorrect');
        } else {
          setPasswordError(error.message || 'Failed to change password');
        }
      } else {
        setPasswordError('Failed to change password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock implementation - would normally update notification settings
    console.log('Saving notification settings:', notifications);
    // Show success toast
    setToast({ 
      show: true, 
      message: 'Notification settings updated successfully!', 
      type: 'success' 
    });
  };

  const openAvatarModal = () => {
    setTempSelectedAvatar(selectedAvatar);
    setShowAvatarModal(true);
  };

  const handleSelectAvatar = (avatarId: number) => {
    setTempSelectedAvatar(avatarId);
  };

  const applyAvatarSelection = () => {
    setSelectedAvatar(tempSelectedAvatar);
    setShowAvatarModal(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Find the currently selected avatar
  const currentAvatar = avatars.find(avatar => avatar.id === selectedAvatar) || avatars[0];

  // Get avatar component based on type
  const getAvatarDisplay = (avatar, username, size = 'md') => {
    const sizeClasses = {
      sm: 'w-12 h-12 text-lg',
      md: 'w-16 h-16 text-xl',
      lg: 'w-20 h-20 text-2xl'
    };
    
    const icons = {
      star: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      bolt: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      sun: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      heart: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      cloud: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      moon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      code: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      check: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      fire: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      )
    };
    
    return (
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-md ${avatar.design}`}>
        {icons[avatar.icon]}
        {avatar.type === 'pattern' && (
          <div className="absolute inset-0 rounded-full opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0%,_transparent_40%,_transparent_100%)]"></div>
        )}
      </div>
    );
  };

  // If still loading, show a loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen grid grid-cols-[240px_1fr] grid-rows-[64px_1fr]">
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center p-4 mb-4 rounded-lg shadow max-w-xs ${
          toast.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        } transition-opacity duration-300 ease-in-out`}>
          <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${
            toast.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            )}
          </div>
          <div className="ml-3 text-sm font-normal">{toast.message}</div>
          <button 
            type="button" 
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-700" 
            onClick={() => setToast({ show: false, message: '', type: '' })}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      )}
      
      {/* Top Left: Logo and Brand */}
      <div className="bg-white px-6 flex items-center border-b border-r border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center mr-2">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="font-semibold text-gray-800">Kolayers</span>
        </div>
      </div>
      
      {/* Top Right: Profile Info */}
      <div className="bg-white px-6 flex items-center justify-between border-b border-gray-200 h-20">
        <div className="text-left">
          <div className="text-xl font-bold text-indigo-800">Profile Settings</div>
          <div className="text-sm text-gray-600">Manage your profile information and preferences</div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70"
        >
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
      
      {/* Left: Navigation Menu */}
      <div className="bg-white border-r border-gray-200 py-6 flex flex-col">
        <nav className="flex-1">
          <ul className="space-y-1 px-3">
            <li>
              <Link 
                href="/dashboard" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/badges" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
                Badges
              </Link>
            </li>
            <li>
              <Link 
                href="/tasks" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                Tasks
              </Link>
            </li>
            <li>
              <Link 
                href="/certificates" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
                Certificates
              </Link>
            </li>
            <li>
              <Link 
                href="/rewards" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                </svg>
                Rewards
              </Link>
            </li>
            <li>
              <Link 
                href="/profile" 
                className="flex items-center px-4 py-2.5 text-sm rounded-lg bg-indigo-50 text-indigo-600 font-medium"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Profile
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Right: Content Area */}
      <div className="bg-gray-50 overflow-auto p-6">
        {/* Settings Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'general' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'password' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('password')}
            >
              Password
            </button>
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'notifications' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
          </div>
          
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <form onSubmit={handleSaveGeneral}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col">
                    <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                      id="name"
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                      id="email"
                      type="email" 
                      value={email}
                      readOnly
                      className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                  </div>
                </div>
                
                <div className="flex flex-col mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label htmlFor="avatar-section" className="mb-1 text-sm font-medium text-gray-700">Select Your Avatar</label>
                  <div className="flex items-center mt-2">
                    <div className="relative">
                      {getAvatarDisplay(currentAvatar, username, 'md')}
                    </div>
                    <button 
                      type="button"
                      onClick={openAvatarModal}
                      className="ml-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                      Change Avatar
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">Choose an avatar that represents you</p>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
            
            {/* Password Settings */}
            {activeTab === 'password' && (
              <form onSubmit={handleSavePassword}>
                <div className="space-y-4 max-w-md">
                  <div className="flex flex-col">
                    <label htmlFor="current-password" className="mb-1 text-sm font-medium text-gray-700">Current Password</label>
                    <div className="relative">
                    <input 
                      id="current-password"
                      type="password" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="new-password" className="mb-1 text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                    <input 
                      id="new-password"
                        type={showPassword ? "text" : "password"}
                      value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError('');
                        }}
                        className={`w-full px-3 py-2 pr-10 border ${passwordError ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 ${passwordError ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                      required
                    />
                      <button 
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="confirm-password" className="mb-1 text-sm font-medium text-gray-700">Confirm New Password</label>
                    <div className="relative">
                    <input 
                      id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError('');
                        }}
                        className={`w-full px-3 py-2 pr-10 border ${passwordError ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 ${passwordError ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                      required
                    />
                      <button 
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {passwordError && (
                    <div className="mt-2 text-sm text-red-600">
                      <span className="font-medium">Error:</span> {passwordError}
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <p className="text-sm text-gray-600">Password should:</p>
                    <ul className="list-disc pl-5 text-xs text-gray-500 mt-1 space-y-1">
                      <li className={password.length >= 8 ? 'text-green-500' : ''}>
                        Be at least 8 characters long
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>
                        Contain at least one uppercase letter
                      </li>
                      <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>
                        Contain at least one number
                      </li>
                      <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-500' : ''}>
                        Contain at least one special character
                      </li>
                      <li className={password === confirmPassword && password !== '' ? 'text-green-500' : ''}>
                        New password and confirmation must match
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Change Password
                  </button>
                </div>
              </form>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSaveNotifications}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="email-notifications"
                            type="checkbox"
                            checked={notifications.email}
                            onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="email-notifications" className="text-sm font-medium text-gray-700">Email Notifications</label>
                          <p className="text-xs text-gray-500">Receive updates about your progress via email</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="browser-notifications"
                            type="checkbox"
                            checked={notifications.browser}
                            onChange={(e) => setNotifications({...notifications, browser: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="browser-notifications" className="text-sm font-medium text-gray-700">Browser Notifications</label>
                          <p className="text-xs text-gray-500">Receive real-time notifications in your browser</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Notification Types</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="updates-notifications"
                            type="checkbox"
                            checked={notifications.updates}
                            onChange={(e) => setNotifications({...notifications, updates: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="updates-notifications" className="text-sm font-medium text-gray-700">Platform Updates</label>
                          <p className="text-xs text-gray-500">Receive notifications about platform updates and new features</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="achievement-notifications"
                            type="checkbox"
                            checked={notifications.achievement}
                            onChange={(e) => setNotifications({...notifications, achievement: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="achievement-notifications" className="text-sm font-medium text-gray-700">Achievement Notifications</label>
                          <p className="text-xs text-gray-500">Get notified when you earn badges, certificates, or rewards</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Avatar Selection Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Choose Your Avatar</h3>
                <button 
                  type="button" 
                  onClick={() => setShowAvatarModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {avatars.map((avatar) => (
                  <div 
                    key={avatar.id}
                    onClick={() => handleSelectAvatar(avatar.id)}
                    className={`relative cursor-pointer transition-all rounded-lg p-2 ${
                      tempSelectedAvatar === avatar.id 
                        ? 'ring-2 ring-indigo-500 bg-indigo-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        {getAvatarDisplay(avatar, username, 'md')}
                        {tempSelectedAvatar === avatar.id && (
                          <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyAvatarSelection}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 