"use client";

import { useState, Suspense } from "react";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useResetPasswordMutation } from "@/lib/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const router = useRouter();

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!token) {
      setApiError("Invalid or missing reset token. Please request a new link.");
      return;
    }

    if (password.length < 6) {
      setApiError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setApiError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({ token, newPassword: password }).unwrap();
      setIsSuccess(true);
      // Wait a few seconds then redirect to login
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setApiError(
        err.data?.message ||
          "Failed to reset password. The link might have expired.",
      );
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          No reset token found. Please request a new password reset link.
        </div>
        <Link
          href="/forgot-password"
          className="inline-block w-full rounded-full bg-[#111] py-3 text-sm font-medium text-white hover:bg-black transition-colors"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Lock size={32} />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Password Reset Successfully
        </h2>
        <p className="mb-8 text-sm text-gray-500 leading-relaxed">
          Your password has been successfully updated. Redirecting you to
          login...
        </p>
        <Link
          href="/login"
          className="inline-block w-full rounded-full bg-[#111] py-3 text-sm font-medium text-white hover:bg-black transition-colors"
        >
          Go to login now
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Create new password
        </h1>
        <p className="text-sm text-gray-500">
          Please enter your new password below. Make sure it's at least 6
          characters.
        </p>
      </div>

      {apiError && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock size={18} />
          </div>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full bg-white border border-gray-300 focus:border-[#111] rounded-full outline-none py-3 pl-11 pr-12 text-sm text-[#111] placeholder-gray-400 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111] z-10 transition-colors"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock size={18} />
          </div>
          <input
            type={showConfirmPw ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full bg-white border border-gray-300 focus:border-[#111] rounded-full outline-none py-3 pl-11 pr-12 text-sm text-[#111] placeholder-gray-400 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPw((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111] z-10 transition-colors"
          >
            {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full cursor-pointer bg-primary text-white rounded-full py-3 font-medium transition-colors \${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#111] hover:bg-black"
            }`}
          >
            {isLoading ? "Resetting..." : "Reset password"}
          </button>
        </div>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 font-sans text-[#111]">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10 border border-gray-100">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Suspense
          fallback={
            <div className="text-center text-sm text-gray-500 py-10">
              Loading...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
