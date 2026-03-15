import { setAuthToken, setAutoLogin, setSavedCredentials } from './auth';
import { apiFetch } from './api-client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  token: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

interface ApiResult<T> {
  code?: number;
  msg?: string;
  data?: T;
  message?: string;
}

const parseApiResult = async <T>(response: Response): Promise<ApiResult<T>> => {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as ApiResult<T>;
  } catch {
    return { message: text };
  }
};

/**
 * 用户登录
 */
export const login = async (
  username: string,
  password: string,
  rememberPassword: boolean = false,
  autoLogin: boolean = false
): Promise<LoginResponse> => {
  try {
    const response = await apiFetch('/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    const result = await parseApiResult<LoginResponse>(response);
    if (!response.ok) {
      throw new Error(result.msg || result.message || '登录失败');
    }
    if (typeof result.code === 'number' && result.code !== 1) {
      throw new Error(result.msg || '登录失败');
    }

    const loginData = result.data ?? (result as unknown as LoginResponse);

    if (!loginData.token) {
      throw new Error('未收到认证令牌');
    }

    // 保存 token
    setAuthToken(loginData.token);

    // 保存凭证（如果勾选了记住密码）
    if (rememberPassword) {
      setSavedCredentials(username, password);
    }

    // 保存自动登录标记
    if (autoLogin) {
      setAutoLogin(true);
    }

    return {
      username: loginData.username,
      token: loginData.token,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * 用户注册
 */
export const register = async (
  username: string,
  password: string,
  rememberPassword: boolean = false
): Promise<void> => {
  try {
    const response = await apiFetch('/user/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    const result = await parseApiResult<unknown>(response);
    if (!response.ok) {
      throw new Error(result.msg || result.message || '注册失败');
    }
    if (typeof result.code === 'number' && result.code !== 1) {
      throw new Error(result.msg || '注册失败');
    }

    // 注册成功后保存凭证（如果勾选了记住密码）
    if (rememberPassword) {
      setSavedCredentials(username, password);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * 验证 token 有效性
 * 这个函数可以通过调用一个需要认证的接口来验证
 * 或者通过解析 JWT token 的到期时间来检查
 * 这里我们进行简单的检查：token 存在即认为有效
 * 实际应用可以调用一个后端接口进行验证
 */
export const validateToken = async (token: string): Promise<boolean> => {
  if (!token) {
    return false;
  }

  try {
    // 简单的 JWT 有效性检查
    // JWT 格式: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded =
      typeof window !== 'undefined' && typeof window.atob === 'function'
        ? window.atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(decoded);

    // 检查过期时间
    if (payload.exp) {
      const expiresIn = payload.exp * 1000; // exp 通常是秒，需要转为毫秒
      if (Date.now() > expiresIn) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};
