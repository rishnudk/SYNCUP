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
    <div className="flex-1 w-full min-h-screen flex flex-col font-sans">
      {/* Navbar Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-600 to-cyan-500 p-2 rounded-xl shadow-lg shadow-purple-500/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              SYNC<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-medium">UP</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest -mt-0.5">Admin Console</p>
          </div>
        </div>

        {/* Return Button */}
        <Link href="/" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs md:text-sm font-semibold py-2 px-4 rounded-xl shadow-lg transition-all duration-300 border border-white/10 hover:scale-[1.02] active:scale-[0.98]">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Feed</span>
        </Link>
      </header>

      {/* Main Composer Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-6 py-12 flex flex-col gap-8 justify-center">
        
        {/* Banner Section */}
        <div className="flex flex-col gap-2.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full w-max mx-auto sm:mx-0">
            <Sparkles className="h-3 w-3" />
            <span>Coaching Control Center</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Broadcast <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Coaching Updates</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Publish real-time strategies, adjustments, or alerts. Once submitted, your team's live feeds will update instantly without refresh.
          </p>
        </div>

        {/* Composer Card */}
        <form onSubmit={handleBroadcast} className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-6 border border-white/5">
          
          {/* Card Header info */}
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <User className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-200">Authorized Broadcaster Profile</p>
              <p className="text-[10px] text-gray-500">Publishing as Head Coach / Administrator</p>
            </div>
          </div>

          {/* Form message input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="message-input" className="text-xs font-bold text-gray-300 uppercase tracking-wider flex justify-between items-center">
              <span>Instruction Message</span>
              <span className="text-[10px] font-normal text-gray-500 uppercase tracking-normal">Max 280 chars</span>
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
                className="w-full glass-input p-4 text-sm md:text-base leading-relaxed resize-none block placeholder:text-gray-600"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-semibold text-gray-600 tracking-wider">
                {message.length} / 280
              </div>
            </div>
          </div>

          {/* Alert Boards */}
          {error && (
            <div className="flex items-start gap-3 bg-rose-950/15 border border-rose-500/20 text-rose-400 p-4 rounded-xl animate-slide-down">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-xs md:text-sm font-medium leading-normal">{error}</div>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 bg-emerald-950/15 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl animate-slide-down">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs md:text-sm font-bold">Update Broadcasted Successfully!</p>
                <p className="text-[10px] text-emerald-500/70 mt-0.5">Realtime clients have successfully synchronized with the new feed card.</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 text-white font-bold text-sm md:text-base py-3 px-6 rounded-xl transition-all duration-300 border border-white/10 ${
              loading 
                ? "bg-slate-800 cursor-not-allowed opacity-50" 
                : "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 shadow-xl shadow-indigo-500/10 hover:shadow-purple-500/25 hover:scale-[1.01] active:scale-[0.99]"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Broadcasting Update...</span>
              </>
            ) : (
              <>
                <Send className="h-4.5 w-4.5" />
                <span>Submit Broadcast</span>
              </>
            )}
          </button>

        </form>

        {/* Help Tip Box */}
        <div className="glass-panel rounded-2xl p-4 flex gap-3 border border-white/5">
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="text-left flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-200">Need inspiration?</p>
            <p className="text-[10px] text-gray-500">Try posting: "Coach's instruction: focus on rapid transition plays and maintain strong defensive zones in the final quarter."</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto w-full py-6 border-t border-white/5 flex items-center justify-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
          SYNCUP REALTIME FEED ENGINE © 2026
        </p>
      </footer>
    </div>
  );
}
