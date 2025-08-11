'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserRole } from '@/types';
import { User as UserIcon, Briefcase, Shield } from 'lucide-react';

interface RoleSwitcherProps {
  users: User[];
  onSelectUser: (userId: string) => void;
}

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'client':
      return <UserIcon className="h-4 w-4" />;
    case 'employee':
      return <Briefcase className="h-4 w-4" />;
    case 'admin':
      return <Shield className="h-4 w-4" />;
    default:
      return <UserIcon className="h-4 w-4" />;
  }
};

const getRoleColor = (role: UserRole) => {
  switch (role) {
    case 'client':
      return 'border-blue-200 hover:border-blue-300 hover:bg-blue-50';
    case 'employee':
      return 'border-green-200 hover:border-green-300 hover:bg-green-50';
    case 'admin':
      return 'border-purple-200 hover:border-purple-300 hover:bg-purple-50';
    default:
      return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
  }
};

export function RoleSwitcher({ users, onSelectUser }: RoleSwitcherProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Task Manager Demo</CardTitle>
          <CardDescription className="text-lg">
            Select a user role to explore the application
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Button
                key={user.id}
                variant="outline"
                className={`p-6 h-auto flex flex-col items-center gap-3 transition-all duration-200 ${getRoleColor(user.role)}`}
                onClick={() => onSelectUser(user.id)}
              >
                <div className="flex items-center gap-2">
                  {getRoleIcon(user.role)}
                  <span className="font-semibold capitalize">{user.role}</span>
                </div>
                <div className="text-center">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Demo Instructions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li><strong>Client:</strong> Upload documents and view submission status</li>
              <li><strong>Employee:</strong> Manage tasks and view client documents</li>
              <li><strong>Admin:</strong> Oversee all tasks, manage assignments, and handle reviews</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
