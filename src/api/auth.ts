import { supabase } from './supabase';

// 用户基本信息（从Supabase Auth获取）
export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
  created_at: string;
  email_confirmed_at?: string;
}

// 获取当前认证用户
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.log('获取用户失败:', error?.message || '用户未登录');
      return null;
    }
    
    return {
      id: user.id,
      email: user.email || '',
      user_metadata: {
        name: user.user_metadata?.name
      },
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at
    };
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
}

// 邮箱密码登录
export async function login(email: string, password: string): Promise<AuthUser> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // 处理邮箱未验证情况
      if (error.message.includes('not confirmed')) {
        await resendVerificationEmail(email);
        throw new Error('邮箱未验证，已重新发送验证邮件');
      }
      throw new Error(error.message || '登录失败');
    }

    if (!data.user) {
      throw new Error('登录失败，未获取到用户信息');
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      user_metadata: {
        name: data.user.user_metadata?.name
      },
      created_at: data.user.created_at,
      email_confirmed_at: data.user.email_confirmed_at
    };
  } catch (error: any) {
    console.error('登录失败:', error);
    throw new Error(error.message || '登录失败');
  }
}

// 用户注册
export async function register(user: { email: string; password: string; name: string }): Promise<void> {
  try {
    const { error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          name: user.name
        }
      }
    });

    if (error) throw error;
  } catch (error: any) {
    console.error('注册失败:', error);
    throw new Error(error.message || '注册失败');
  }
}

// 用户登出
export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('登出失败:', error);
    throw new Error(error.message || '登出失败');
  }
}

// 重新发送验证邮件
export async function resendVerificationEmail(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    
    if (error) throw error;
  } catch (error: any) {
    console.error('发送验证邮件失败:', error);
    throw new Error(error.message || '发送验证邮件失败');
  }
}

// 监听认证状态变化
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
        user_metadata: {
          name: session.user.user_metadata?.name
        },
        created_at: session.user.created_at,
        email_confirmed_at: session.user.email_confirmed_at
      });
    } else if (event === 'SIGNED_OUT') {
      callback(null);
    }
  });
}