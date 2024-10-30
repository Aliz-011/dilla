'use client';

import { useFormState } from 'react-dom';

import { logout } from '@/actions/logout';
import { Button } from './ui/button';

export const LogoutButton = () => {
  const [_, action] = useFormState(logout, { message: '' });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};
