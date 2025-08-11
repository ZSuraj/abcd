import { Client, Document, Task, Notification, User } from '@/types';

// Mock users for role switching
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'client@example.com',
    name: 'John Client',
    role: 'client',
    assignedEmployeeId: '2'
  },
  {
    id: '2',
    email: 'employee@example.com',
    name: 'Jane Employee',
    role: 'employee',
    managedClientIds: ['1', '3']
  },
  {
    id: '3',
    email: 'client2@example.com',
    name: 'Bob Client',
    role: 'client',
    assignedEmployeeId: '2'
  },
  {
    id: '4',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '5',
    email: 'employee2@example.com',
    name: 'Mike Employee',
    role: 'employee',
    managedClientIds: ['5']
  },
  {
    id: '6',
    email: 'client3@example.com',
    name: 'Alice Smith',
    role: 'client',
    assignedEmployeeId: '5'
  }
];

// Mock clients
export const initialClients: Client[] = [
  {
    id: '1',
    name: 'John Client',
    email: 'client@example.com',
    assignedEmployeeId: '2',
    documentsCount: 3,
    tasksCount: 2
  },
  {
    id: '3',
    name: 'Bob Client',
    email: 'client2@example.com',
    assignedEmployeeId: '2',
    documentsCount: 2,
    tasksCount: 1
  },
  {
    id: '6',
    name: 'Alice Smith',
    email: 'client3@example.com',
    assignedEmployeeId: '5',
    documentsCount: 1,
    tasksCount: 1
  }
];

// Mock documents
export const initialDocuments: Document[] = [
  {
    id: '1',
    name: 'Contract_Agreement.pdf',
    type: 'application/pdf',
    size: 1024000,
    uploadedAt: new Date('2024-01-15'),
    clientId: '1',
    employeeId: '2',
    url: '/documents/contract.pdf'
  },
  {
    id: '2',
    name: 'Invoice_January.jpg',
    type: 'image/jpeg',
    size: 512000,
    uploadedAt: new Date('2024-01-16'),
    clientId: '1',
    employeeId: '2',
    url: '/documents/invoice.jpg'
  },
  {
    id: '3',
    name: 'Tax_Documents.pdf',
    type: 'application/pdf',
    size: 768000,
    uploadedAt: new Date('2024-01-17'),
    clientId: '1',
    employeeId: '2',
    url: '/documents/tax.pdf'
  },
  {
    id: '4',
    name: 'Business_License.png',
    type: 'image/png',
    size: 256000,
    uploadedAt: new Date('2024-01-18'),
    clientId: '3',
    employeeId: '2',
    url: '/documents/license.png'
  }
];

// Mock tasks
export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Review Contract Documents',
    description: 'Review and process the uploaded contract documents for John Client',
    status: 'in-progress',
    clientId: '1',
    employeeId: '2',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    dueDate: new Date('2024-01-25'),
    priority: 'high'
  },
  {
    id: '2',
    title: 'Process Invoice Documents',
    description: 'Process the invoice and tax documents submitted by John Client',
    status: 'in-review',
    clientId: '1',
    employeeId: '2',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-17'),
    dueDate: new Date('2024-01-20'),
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Business License Verification',
    description: 'Verify and process business license documentation for Bob Client',
    status: 'pending',
    clientId: '3',
    employeeId: '2',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    dueDate: new Date('2024-01-30'),
    priority: 'low'
  },
  {
    id: '4',
    title: 'Financial Review',
    description: 'Complete financial document review for Alice Smith',
    status: 'completed',
    clientId: '6',
    employeeId: '5',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-19'),
    dueDate: new Date('2024-01-22'),
    priority: 'medium'
  }
];

// Mock notifications
export const initialNotifications: Notification[] = [
  {
    id: '1',
    message: 'Task "Process Invoice Documents" is now in review',
    type: 'info',
    isRead: false,
    createdAt: new Date('2024-01-17'),
    userId: '4'
  },
  {
    id: '2',
    message: 'New documents uploaded by John Client',
    type: 'info',
    isRead: true,
    createdAt: new Date('2024-01-16'),
    userId: '4'
  }
];

// Helper functions for data management
export const generateId = () => Date.now().toString();

export const getEmployeeUsers = () => mockUsers.filter(user => user.role === 'employee');

export const getClientUser = (clientId: string) => mockUsers.find(user => user.id === clientId && user.role === 'client');