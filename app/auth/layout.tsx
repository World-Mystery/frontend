import { ReactNode } from 'react';
import { PublicRoute } from '@/components/auth/route-protector';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PublicRoute>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
        {/* Header/Logo Area */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">AI健康助手</h1>
          <p className="text-sm text-muted-foreground mt-2">
            您的智能健康管理伙伴
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="w-full max-w-md">
          <div className="bg-card border border-input rounded-xl shadow-sm p-6 md:p-8">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© 2024 AI健康助手. 隐私政策 | 服务条款</p>
        </div>
      </div>
    </PublicRoute>
  );
}
