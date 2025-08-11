"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  return (
    <LoginForm
      onLogin={async (credentials) => {
        router.push("/");
      }}
    />
  );
}
