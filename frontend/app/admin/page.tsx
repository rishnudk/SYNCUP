"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Activity,
  User,
  Sparkles
} from "lucide-react";

export default function Admin() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || message.trim().length < 3) {
      setError("Broadcast message must be at least 3 characters long.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:5000/feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      // Success
      setSuccess(true);
      setMessage("");
      // Clear success alert after 4 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err: any) {
      console.error("Broadcast failed:", err);
      setError(err.message || "Failed to broadcast update to servers. Please verify backend state.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col font-sans bg-[#0a0a0a]">
      {/* Technical Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[#0a0a0a] border-b border-[#212327] py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-[#ff7a17]" />
          <span className="caption-mono text-white text-sm">// SYNCUP</span>
        </div>

        {/* Back Button - Canonical Pill Outline */}
        <Link href="/" className="button-md border border-white/25 hover:border-white/50 text-white py-1.5 px-4 rounded-full transition-colors flex items-center gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Feed</span>
        </Link>
      </header>

      {/* Main Composer Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-6 py-12 md:py-16 flex flex-col gap-10 justify-center">
        
        {/* Banner Section */}
        <div className="flex flex-col gap-3">
          <div className="caption-mono text-[#7d8187]">
            // COACHING CONTROL CENTER
          </div>
          <h2 className="display-sm md:display-md text-white">
            Broadcast coaching updates.
          </h2>
          <p className="body-md text-[#dadbdf]">
            Publish real-time strategies, adjustments, or alerts. Once submitted, your team's live feeds will update instantly without page refresh.
          </p>
        </div>

        {/* Composer Card */}
        <form onSubmit={handleBroadcast} className="bg-[#191919] border border-[#212327] rounded-lg p-6 md:p-8 flex flex-col gap-6">
          
          {/* Card Header Profile */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#212327]">
            <div className="h-8 w-8 rounded-full bg-[#1a1c20] border border-[#212327] flex items-center justify-center text-[#ff7a17]">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="caption-mono text-white text-[12px]">// AUTHORIZED PROFILE</p>
              <p className="text-[12px] text-[#7d8187] mt-0.5">Publishing as Head Coach / Administrator</p>
            </div>
          </div>

          {/* Form message input */}
          <div className="flex flex-col gap-2.5">
            <label htmlFor="message-input" className="caption-mono text-white text-xs flex justify-between items-center">
              <span>// INSTRUCTION MESSAGE</span>
              <span className="text-[#7d8187] lowercase text-[11px] tracking-normal font-sans">max 280 chars</span>
            </label>
            <div className="relative">
              <textarea
                id="message-input"
                rows={5}
                maxLength={280}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (e.target.value.trim().length >= 3) {
                    setError("");
                  }
                }}
                disabled={loading}
                placeholder="Enter new coaching instruction, play adjustment, or announcement..."
                className="w-full bg-[#1a1c20] border border-[#212327] rounded-lg p-4 text-white text-sm md:text-base leading-relaxed resize-none block placeholder-[#7d8187] focus:outline-none focus:border-white/50 transition-colors"
              />
              <div className="absolute bottom-3 right-3 caption-mono-sm text-[#7d8187] text-[10px]">
                {message.length} / 280
              </div>
            </div>
          </div>

          {/* Technical Hairline Alert Boards */}
          {error && (
            <div className="flex items-start gap-3 bg-[#1a1c20] border border-rose-950 text-rose-500 p-4 rounded-lg animate-xai-fade">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="caption-mono-sm text-rose-500">// BROADCAST FAILURE</span>
                <span className="text-xs md:text-sm text-[#dadbdf] mt-1 font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 bg-[#1a1c20] border border-emerald-950 text-emerald-500 p-4 rounded-lg animate-xai-fade">
              <CheckCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="caption-mono-sm text-emerald-500">// BROADCAST SUCCESS</span>
                <span className="text-xs md:text-sm text-[#dadbdf] mt-1 font-medium">Update broadcasted successfully! Realtime clients have synchronized.</span>
              </div>
            </div>
          )}

          {/* Submit Button - Canonical filled white pill on primary CTA */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 font-sans font-medium text-sm md:text-base py-3 px-6 rounded-full transition-all border ${
              loading 
                ? "bg-[#1a1c20] border-[#212327] text-[#7d8187] cursor-not-allowed" 
                : "bg-white border-white text-[#0a0a0a] hover:bg-[#fafaf7] hover:border-[#fafaf7] active:scale-[0.99] cursor-pointer"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-[#7d8187]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Broadcasting Update...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Broadcast</span>
              </>
            )}
          </button>

        </form>

        {/* Technical Help Tip Box */}
        <div className="bg-[#1a1c20] border border-[#212327] rounded-lg p-4 flex gap-3">
          <div className="h-8 w-8 rounded-full bg-[#0a0a0a] border border-[#212327] flex items-center justify-center text-[#ff7a17] flex-shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div className="text-left flex flex-col justify-center">
            <p className="caption-mono text-white text-xs">// COACH'S BRIEF</p>
            <p className="text-[12px] text-[#7d8187] mt-0.5">Recommended content: Keep plays short and actionable. Example: "Coach: switch defensive zones, watch the left flank."</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto w-full py-8 border-t border-[#212327] flex items-center justify-center bg-[#0a0a0a]">
        <p className="caption-mono-sm text-[#7d8187] text-[10px]">
          // SYNCUP REALTIME FEED ENGINE © 2026
        </p>
      </footer>
    </div>
  );
}
