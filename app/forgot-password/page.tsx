"use client";

import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useForgotPasswordMutation } from "@/lib/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const router = useRouter();
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!email) {
      setApiError("Email is required");
      return;
    }

    try {
      const data = await forgotPassword({ email }).unwrap();
      setIsSubmitted(true);
    } catch (err: any) {
      setApiError(
        err.data?.message || "Failed to send reset link. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 font-sans text-[#111]">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10 border border-gray-100">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {isSubmitted ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Mail size={32} />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight">
              Check your email
            </h2>
            <p className="mb-8 text-sm text-gray-500 leading-relaxed">
              We sent a password reset link to{" "}
              <span className="font-semibold text-[#111]">{email}</span>. The
              link will expire in 15 minutes.
            </p>
            <Link
              href="/login"
              className="inline-block w-full rounded-full bg-gray-100 py-3 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight mb-2">
                Reset password
              </h1>
              <p className="text-sm text-gray-500">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>

            {apiError && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white border border-gray-300 focus:border-[#111] rounded-full outline-none py-3 pl-11 pr-4 text-sm text-[#111] placeholder-gray-400 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full cursor-pointer bg-primary text-white rounded-full py-3 font-medium transition-colors \${
                  isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#111] hover:bg-black"
                }`}
              >
                {isLoading ? "Sending link..." : "Send reset link"}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#111] transition-colors font-medium"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
