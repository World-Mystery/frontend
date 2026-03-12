'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuthToken,
  getSavedCredentials,
  getAutoLogin,
  setAuthToken,
  clearAllAuth,
} from '@/lib/auth';
import { validateToken, login } from '@/lib/auth-service';

/**
 * 应用启动时的认证初始化器
 * 检查已有的token，如果token有效则保持登录状态
 * 如果token无效但有记住的凭证和自动登录标记，则尝试自动登录
 */
export function AuthInitializer() {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        const autoLogin = getAutoLogin();
        const savedCredentials = getSavedCredentials();

        // 情况1: 有有效的token，保持登录状态
        if (token && (await validateToken(token))) {
          setIsInitialized(true);
          return;
        }

        // 情况2: 没有有效的token，但启用了自动登录且有保存的凭证
        if (autoLogin && savedCredentials) {
          try {
            const result = await login(
              savedCredentials.username,
              savedCredentials.password,
              true,
              true
            );
            setAuthToken(result.token);
            setIsInitialized(true);
            return;
          } catch (error) {
            // 自动登录失败，清除相关数据
            console.error('Auto login failed:', error);
            clearAllAuth();
          }
        }

        // 情况3: 无token且没有自动登录条件
        clearAllAuth();
        setIsInitialized(true);
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAllAuth();
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // 初始化完成前显示空白（避免页面闪烁）
  if (!isInitialized) {
    return null;
  }

  return null;
}
