import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from '@react-oauth/google';
import { Button, Input, message } from 'antd';
import { useState } from 'react';
import { RiArrowRightLine } from 'react-icons/ri';

interface LoginComponentProps {
  onSuccess?: (data: any) => void;
}

const LoginComponent = ({ onSuccess }: LoginComponentProps) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get Google Client ID from environment variables
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      message.error('Google authentication failed');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement your Google authentication logic here
      // Example: Send idToken to your backend API
      message.success('Google login successful');
      onSuccess?.({ idToken });
    } catch (error) {
      message.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      message.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement your email/password authentication logic here
      // Example: Call your backend API
      message.success('Login successful');
      onSuccess?.({ email });
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center mt-10'>
      <div className='w-full max-w-md rounded-xl border border-gray-200 p-8'>
        <div className='mb-6 text-center'>
          <h1 className='text-2xl font-bold text-gray-900'>Welcome Back</h1>
          <p className='mt-2 text-sm text-gray-600'>
            Sign in to your account to continue
          </p>
        </div>

        {GOOGLE_CLIENT_ID && (
          <div className='mb-6 flex justify-center'>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => message.error('Google login failed')}
                text='continue_with'
                width={300}
              />
            </GoogleOAuthProvider>
          </div>
        )}

        <div className='space-y-4'>
          <div>
            <label className='mb-1 block text-sm font-semibold text-gray-700'>
              Email
            </label>
            <Input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              className='w-full'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-semibold text-gray-700'>
              Password
            </label>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              className='w-full'
            />
          </div>

          <Button
            type='primary'
            loading={isLoading}
            onClick={handleEmailLogin}
            className='w-full'
            icon={<RiArrowRightLine />}
            iconPosition='end'
          >
            Sign In
          </Button>
        </div>
      </div>

      <p className='mt-6 max-w-md text-center text-xs text-gray-500'>
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default LoginComponent;
