'use client';

import { useEffect, useState } from 'react';

interface UserData {
  email: string;
  name: string;
  ext_user_id: string;
  user_hash: string;
}

export default function YourGPTWidget() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // YourGPT widget configuration
    (window as any).YGC_WIDGET_ID = "0e0f84c6-1dd8-4a83-890c-4a23f40cdc7c";
    
    // Check if script is already loaded
    if (!document.getElementById('yourgpt-chatbot')) {
      const script = document.createElement('script');
      script.src = "https://widget.yourgpt.ai/script.js";
      script.id = 'yourgpt-chatbot';
      script.async = true;
      document.body.appendChild(script);

      // Script yüklendikten sonra kullanıcı verilerini ayarla
      script.onload = () => {
        setTimeout(() => {
          checkAuthAndSetUserData();
        }, 1000); // Widget'ın tam yüklenmesi için bekle
      };
    } else {
      // Script zaten yüklü, hemen kullanıcı verilerini kontrol et
      checkAuthAndSetUserData();
    }
  }, []);

  const checkAuthAndSetUserData = async () => {
    try {
      // Kullanıcının giriş yapıp yapmadığını kontrol et
      const response = await fetch('/api/yourgpt/user-data', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const userData: UserData = await response.json();
        setIsAuthenticated(true);
        
        // YourGPT widget'ına kullanıcı verilerini gönder
        if ((window as any).$yourgptChatbot) {
          (window as any).$yourgptChatbot.set("contact:data", {
            email: userData.email,
            name: userData.name,
            ext_user_id: userData.ext_user_id,
            user_hash: userData.user_hash
          });
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('YourGPT kullanıcı verisi hatası:', error);
      setIsAuthenticated(false);
    }
  };

  // Auth durumu değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuthAndSetUserData();
    };

    // Cookie değişikliklerini dinlemek için interval kullan
    const authCheckInterval = setInterval(() => {
      checkAuthAndSetUserData();
    }, 5000); // 5 saniyede bir kontrol et

    // Storage event'lerini dinle (logout durumu için)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null; // This component doesn't render anything visible
}
