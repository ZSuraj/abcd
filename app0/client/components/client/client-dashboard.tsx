"use client";

import { User } from "@/types";
import { DocumentUpload } from "./document-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, User as UserIcon, CheckCircle } from "lucide-react";

interface ClientDashboardProps {
  user: User;
}

export function ClientDashboard({ user }: ClientDashboardProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user.name}!
        </h2>
        <p className="text-gray-600">
          Upload your documents and track your submissions.
        </p>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documents Uploaded
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3</div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profile Status
            </CardTitle>
            <UserIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Complete</div>
            <p className="text-xs text-gray-600">All details provided</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Documents
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">2</div>
            <p className="text-xs text-gray-600">Verified this month</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Document Upload Section */}
      <div>
        <DocumentUpload
        userId={user.id}
        />

        {/* <Card>
          <CardHeader>
            <CardTitle>Upload a New Document</CardTitle>
            <CardDescription>
              Submit documents for review. Supported formats: PDF, DOCX, JPG.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload userId={user.id} />
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
