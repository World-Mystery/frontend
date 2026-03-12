'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">登录</TabsTrigger>
          <TabsTrigger value="register">注册</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-6">
          <LoginForm
            onSuccess={() => {
              // 登录成功后会自动跳转，这里可选添加额外逻辑
            }}
          />
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <RegisterForm
            onSuccess={() => {
              // 注册成功后会自动跳转，这里可选添加额外逻辑
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
