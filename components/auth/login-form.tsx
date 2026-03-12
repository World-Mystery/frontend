'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { login } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  username: z
    .string()
    .min(1, '请输入用户名')
    .min(3, '用户名至少3个字符'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少6个字符'),
  rememberPassword: z.boolean().default(false),
  autoLogin: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberPassword: false,
      autoLogin: false,
    },
  });

  const rememberPassword = watch('rememberPassword');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(
        data.username,
        data.password,
        data.rememberPassword,
        data.autoLogin
      );
      toast.success('登录成功');
      onSuccess?.();
      router.push('/');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '登录失败，请重试';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          用户名
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="请输入用户名"
          disabled={isLoading}
          {...register('username')}
        />
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          密码
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="请输入密码"
          disabled={isLoading}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberPassword"
          disabled={isLoading}
          {...register('rememberPassword')}
        />
        <Label
          htmlFor="rememberPassword"
          className="text-sm font-normal cursor-pointer"
        >
          记住密码
        </Label>
      </div>

      {rememberPassword && (
        <div className="flex items-center space-x-2">
          <Checkbox id="autoLogin" disabled={isLoading} {...register('autoLogin')} />
          <Label
            htmlFor="autoLogin"
            className="text-sm font-normal cursor-pointer"
          >
            下次自动登录
          </Label>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? '登录中...' : '登录'}
      </Button>
    </form>
  );
}
