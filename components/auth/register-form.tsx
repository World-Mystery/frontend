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
import { register as registerUser, login } from '@/lib/auth-service';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, '请输入用户名')
      .min(3, '用户名至少3个字符'),
    password: z
      .string()
      .min(1, '请输入密码')
      .min(6, '密码至少6个字符')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        '密码需要包含大小写字母和数字'
      ),
    confirmPassword: z.string().min(1, '请确认密码'),
    rememberPassword: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      rememberPassword: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.username, data.password, data.rememberPassword);
      toast.success('注册成功，正在自动登录...');

      await login(data.username, data.password, data.rememberPassword, false);

      onSuccess?.();
      router.push('/');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '注册失败，请重试';
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
          placeholder="至少6个字符，包含大小写字母和数字"
          disabled={isLoading}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          确认密码
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          disabled={isLoading}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? '注册中...' : '注册'}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>密码需要满足以下条件：</p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>至少 6 个字符</li>
          <li>包含大写字母</li>
          <li>包含小写字母</li>
          <li>包含数字</li>
        </ul>
      </div>
    </form>
  );
}
