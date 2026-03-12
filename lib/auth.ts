import CryptoJS from 'crypto-js';

// 加密密钥 - 在实际应用中应该来自环境变量
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'ai-healthy-default-key';

const AUTH_TOKEN_KEY = 'aiHealthy.token';
const SAVED_CREDENTIALS_KEY = 'aiHealthy.credentials';
const AUTO_LOGIN_KEY = 'aiHealthy.autoLogin';

/**
 * 加密密码
 */
export const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

/**
 * 解密密码
 */
export const decryptPassword = (encrypted: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt password:', error);
    return '';
  }
};

/**
 * 保存认证 token
 */
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

/**
 * 获取认证 token
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

/**
 * 清除认证 token
 */
export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

/**
 * 检查是否有有效的 token
 */
export const hasAuthToken = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * 保存记住的凭证
 */
export const setSavedCredentials = (
  username: string,
  password: string
): void => {
  if (typeof window !== 'undefined') {
    const encrypted = encryptPassword(password);
    const credentials = JSON.stringify({ username, password: encrypted });
    localStorage.setItem(SAVED_CREDENTIALS_KEY, credentials);
  }
};

/**
 * 获取已保存的凭证
 */
export const getSavedCredentials = (): { username: string; password: string } | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SAVED_CREDENTIALS_KEY);
    if (stored) {
      try {
        const credentials = JSON.parse(stored);
        return {
          username: credentials.username,
          password: decryptPassword(credentials.password),
        };
      } catch (error) {
        console.error('Failed to parse saved credentials:', error);
        return null;
      }
    }
  }
  return null;
};

/**
 * 清除已保存的凭证
 */
export const clearSavedCredentials = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SAVED_CREDENTIALS_KEY);
  }
};

/**
 * 设置自动登录标记
 */
export const setAutoLogin = (autoLogin: boolean): void => {
  if (typeof window !== 'undefined') {
    if (autoLogin) {
      localStorage.setItem(AUTO_LOGIN_KEY, 'true');
    } else {
      localStorage.removeItem(AUTO_LOGIN_KEY);
    }
  }
};

/**
 * 获取自动登录标记
 */
export const getAutoLogin = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTO_LOGIN_KEY) === 'true';
  }
  return false;
};

/**
 * 清除所有认证数据
 */
export const clearAllAuth = (): void => {
  clearAuthToken();
  clearSavedCredentials();
  setAutoLogin(false);
};
