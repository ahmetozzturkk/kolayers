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
    console.log('🚀 YourGPT: Widget başlatılıyor...');
    
    // YourGPT widget configuration
    (window as any).YGC_WIDGET_ID = "0e0f84c6-1dd8-4a83-890c-4a23f40cdc7c";
    
    // Check if script is already loaded
    if (!document.getElementById('yourgpt-chatbot')) {
      console.log('📜 YourGPT: Script yükleniyor...');
      const script = document.createElement('script');
      script.src = "https://widget.yourgpt.ai/script.js";
      script.id = 'yourgpt-chatbot';
      script.async = true;
      document.body.appendChild(script);

      // Script yüklendikten sonra kullanıcı verilerini ayarla
      script.onload = () => {
        console.log('✅ YourGPT: Script yüklendi');
        
        // Widget'ın tam olarak hazır olması için birkaç farklı zamanda dene
        const trySetUserData = (attempt: number = 1, maxAttempts: number = 5) => {
          setTimeout(() => {
            console.log(`🔄 YourGPT: Kullanıcı verisi gönderme denemesi ${attempt}/${maxAttempts}`);
            checkAuthAndSetUserData();
            
            if (attempt < maxAttempts && !(window as any).$yourgptChatbot) {
              trySetUserData(attempt + 1, maxAttempts);
            }
          }, attempt * 1000); // 1s, 2s, 3s, 4s, 5s
        };
        
        trySetUserData();
      };
    } else {
      console.log('♻️ YourGPT: Script zaten yüklü');
      // Script zaten yüklü, hemen kullanıcı verilerini kontrol et
      checkAuthAndSetUserData();
    }
  }, []);

  const checkAuthAndSetUserData = async () => {
    try {
      console.log('🔍 YourGPT: Kullanıcı verisi kontrol ediliyor...');
      
      // Kullanıcının giriş yapıp yapmadığını kontrol et
      const response = await fetch('/api/yourgpt/user-data', {
        method: 'GET',
        credentials: 'include'
      });

      console.log('🌐 YourGPT API Response Status:', response.status);

      if (response.ok) {
        const userData: UserData = await response.json();
        console.log('✅ YourGPT: Kullanıcı verisi alındı:', {
          email: userData.email,
          name: userData.name,
          ext_user_id: userData.ext_user_id,
          hasHash: !!userData.user_hash
        });
        
        setIsAuthenticated(true);
        
        // YourGPT widget'ının yüklenip yüklenmediğini kontrol et
        const sendUserDataToWidget = () => {
          if ((window as any).$yourgptChatbot) {
            console.log('🎯 YourGPT: Widget bulundu, kullanıcı verisi gönderiliyor...');
            
            try {
              (window as any).$yourgptChatbot.set("contact:data", {
                email: userData.email,
                name: userData.name,
                ext_user_id: userData.ext_user_id,
                user_hash: userData.user_hash
              });
              
              console.log('✅ YourGPT: Kullanıcı verisi başarıyla gönderildi!');
              return true;
            } catch (err) {
              console.error('❌ YourGPT: Kullanıcı verisi gönderme hatası:', err);
              return false;
            }
          } else {
            console.log('⚠️ YourGPT: Widget henüz hazır değil...');
            return false;
          }
        };

        // Hemen dene
        if (!sendUserDataToWidget()) {
          // Başarısız olduysa farklı aralıklarla tekrar dene
          const retryIntervals = [1000, 3000, 5000, 10000]; // 1s, 3s, 5s, 10s
          
          retryIntervals.forEach((interval, index) => {
            setTimeout(() => {
              if (!sendUserDataToWidget()) {
                console.log(`🔄 YourGPT: ${index + 1}. deneme başarısız, ${interval}ms sonra tekrar denenecek...`);
              }
            }, interval);
          });
        }
      } else {
        console.log('❌ YourGPT: Kullanıcı authenticate değil (Status:', response.status, ')');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ YourGPT kullanıcı verisi hatası:', error);
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
