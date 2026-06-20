'use client';

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatedCharacters, type CharMode } from "./AnimatedCharacters";
import { Logo } from "./ui/logo";
import { useLoginMutation } from "../lib/services/api";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const router = useRouter();

  const [login, { isLoading }] = useLoginMutation();

  const mode: CharMode =
    submitState === "success"
      ? "success"
      : submitState === "error"
      ? "error"
      : pwFocused && !showPw
      ? "hidden"
      : email.length > 0
      ? "typing"
      : "idle";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setSubmitState("idle");

    try {
      const result = await login({ email, password }).unwrap();
      setSubmitState("success");
      
      // Store tokens
      if (result.data?.accessToken) {
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }
      
      setTimeout(() => {
        router.push('/dashboard'); // or wherever they should go post-login
      }, 1000); // give it time to show the success animation
    } catch (err: any) {
      setSubmitState("error");
      setApiError(err?.data?.error?.message || err.message || "An error occurred during login.");
      setTimeout(() => setSubmitState("idle"), 2400);
    }
  };

  return (
    <div className="h-screen w-full bg-[#000] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      <div className="w-full max-w-5xl h-full max-h-[90vh] md:max-h-[650px] grid md:grid-cols-2 rounded-3xl overflow-hidden bg-white shadow-2xl relative">
        {/* Left: illustration */}
        <div className="bg-[#ececea] hidden md:flex items-end justify-center p-8 pb-12 relative">
          <AnimatedCharacters mode={mode} />
        </div>

        {/* Right: form */}
        <div className="bg-white p-6 sm:p-6 lg:py-6 lg:px-16 flex flex-col overflow-y-auto">
          <div className="flex justify-center mb-6">
           <Logo />
          </div>

          {/* <h1 className="text-3xl font-bold text-center text-[#111]">
            Welcome back!
          </h1>
          <p className="text-sm text-center text-gray-500 mt-2">
            Please enter your details
          </p> */}

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md mb-4 text-center">
                {apiError}
              </div>
            )}
            
            <div className="relative pt-3 mt-2">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full bg-transparent border-b border-gray-300 focus:border-[#111] outline-none py-2 text-[#111] placeholder-transparent [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111]"
              />
              <label
                htmlFor="email"
                className="absolute left-0 -top-1.5 text-xs text-gray-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-[#111] peer-autofill:-top-1.5 peer-autofill:text-xs cursor-text"
              >
                Email
              </label>
            </div>

            <div className="relative pt-3 mt-2">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                placeholder=" "
                className="peer w-full bg-transparent border-b border-gray-300 focus:border-[#111] outline-none py-2 pr-8 text-[#111] placeholder-transparent [&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111]"
              />
              <label
                htmlFor="password"
                className={`absolute left-0 -top-1.5 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-1.5 peer-focus:text-xs peer-autofill:-top-1.5 peer-autofill:text-xs cursor-text ${
                  submitState === "error" ? "text-orange-500 peer-focus:text-orange-500" : "text-gray-500 peer-focus:text-[#111]"
                }`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-0 top-3 text-gray-500 hover:text-gray-800 z-10"
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" defaultChecked className="accent-[#111]" />
                Remember for 30 days
              </label>
              <a href="#" className="text-gray-500 hover:text-[#111]">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full cursor-pointer text-white rounded-full py-3 font-medium transition-colors ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#111] hover:bg-black"
              }`}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>

            <button
              type="button"
              className="w-full cursor-pointer bg-gray-100 text-[#111] rounded-full py-3 font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <GoogleG />
              Log in with Google
            </button>
          </form>

          <p className="text-xs text-center text-gray-500 mt-6">
            Don't have an account?{" "}
            <a href="http://localhost:3000/signup" className="text-[#111] font-medium">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.9 35.6 44 30.2 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
