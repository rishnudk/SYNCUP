"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { 
  Wifi, 
  WifiOff, 
  Settings, 
  Megaphone, 
  Clock, 
  AlertTriangle, 
  RotateCw,
  Activity,
  Sparkles,
  TrendingUp,
  Inbox
} from "lucide-react";

interface FeedItem {
  _id: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

// Relative time formatting helper
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (isNaN(date.getTime()) || diffMs < 0) return "Just now";
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

export default function Home() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connStatus, setConnStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [timeTick, setTimeTick] = useState(0);

  // Auto-refresh relative timestamps every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick((prev) => prev + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/feed");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setFeeds(data);
    } catch (err: any) {
      console.error("Error fetching initial feeds:", err);
      setError("Unable to connect to SYNCUP backend server. Please verify the API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Fetch initial feed list from REST API (utilizing Redis cache-aside)
    fetchFeeds();

    // 2. Setup Socket.IO connection
    console.log("🔌 Initializing Socket.IO connection to http://localhost:5000...");
    const socket: Socket = io("http://localhost:5000", {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("⚡ Socket.IO connected: [Socket ID:", socket.id, "]");
      setConnStatus("connected");
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket.IO disconnected");
      setConnStatus("disconnected");
    });

    socket.on("connect_error", (err) => {
      console.warn("🔌 Socket.IO connection error:", err.message);
      setConnStatus("disconnected");
    });

    // 3. Listen for realtime update events
    socket.on("new-feed", (newFeed: FeedItem) => {
      console.log("📥 Realtime notification: Received 'new-feed' event:", newFeed);
      setFeeds((prev) => {
        // Prevent duplicate items (just in case)
        if (prev.some((item) => item._id === newFeed._id)) return prev;
        return [newFeed, ...prev];
      });
    });

    // 4. Clean up listener and connection on component unmount
    return () => {
      console.log("🔌 Disposing socket connection and events...");
      socket.off("new-feed");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col font-sans">
      {/* Dynamic Header Navbar */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-600 to-cyan-500 p-2 rounded-xl shadow-lg shadow-purple-500/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              SYNC<span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-medium">UP</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest -mt-0.5">Coaching Feed</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300">
            {connStatus === "connected" && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Realtime Live</span>
              </>
            )}
            {connStatus === "connecting" && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="hidden sm:inline">Connecting</span>
              </>
            )}
            {connStatus === "disconnected" && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="hidden sm:inline text-rose-400">Offline</span>
              </>
            )}
          </div>

          {/* Admin Redirect Button */}
          <Link href="/admin" className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs md:text-sm font-semibold py-2 px-4 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-purple-500/25 transition-all duration-300 border border-white/10 hover:scale-[1.03] active:scale-[0.98]">
            <Settings className="h-4 w-4" />
            <span>Admin Console</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
        
        {/* Banner Section */}
        <section className="flex flex-col gap-2.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full w-max mx-auto sm:mx-0">
            <Sparkles className="h-3 w-3" />
            <span>Smart Realtime Broadcasting System</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Realtime Coaching <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Instruction Feed</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-xl">
            Receive instant, direct strategies and training adjustments from the coaching staff in realtime without refreshing.
          </p>
        </section>

        {/* Caching Status Bar */}
        {!loading && !error && feeds.length > 0 && (
          <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="bg-cyan-500/15 p-1.5 rounded-lg">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </span>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-200">Cache-Aside Caching Layer Active</p>
                <p className="text-[10px] text-gray-400">GET queries are accelerated using an in-memory high-speed cache.</p>
              </div>
            </div>
            <div className="text-xs bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 px-3 py-1 rounded-full font-mono">
              🚀 Accelerated Response
            </div>
          </div>
        )}

        {/* Loading Skeleton Panel */}
        {loading && (
          <section className="flex flex-col gap-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="glass-panel rounded-2xl p-6 flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex-shrink-0"></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-1/4 bg-white/10 rounded"></div>
                  <div className="h-3 w-full bg-white/5 rounded"></div>
                  <div className="h-3 w-5/6 bg-white/5 rounded"></div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Error Boundary Banner */}
        {error && (
          <section className="glass-panel border-rose-500/20 bg-rose-950/15 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="bg-rose-500/15 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-rose-400" />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h3 className="text-lg font-bold text-white">Connection Issues Detected</h3>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <button 
              onClick={fetchFeeds} 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium text-xs py-2.5 px-5 rounded-xl border border-white/10 transition-all active:scale-[0.98]"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Try Connecting Again</span>
            </button>
          </section>
        )}

        {/* Real-time Feeds List */}
        {!loading && !error && (
          <section className="flex flex-col gap-4">
            {feeds.length === 0 ? (
              <div className="glass-panel rounded-2xl py-16 px-6 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-white/10 bg-transparent">
                <div className="bg-white/5 p-4 rounded-full">
                  <Inbox className="h-10 w-10 text-gray-500" />
                </div>
                <div className="flex flex-col gap-1 max-w-sm">
                  <h3 className="text-base font-semibold text-white">Feed is Empty</h3>
                  <p className="text-xs text-gray-500">There are currently no coaching broadcasts. Access the Admin Console to post your first coach instruction!</p>
                </div>
                <Link href="/admin" className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4">
                  Go Broadcast An Update &rarr;
                </Link>
              </div>
            ) : (
              feeds.map((feed) => (
                <article 
                  key={feed._id} 
                  className="glass-panel rounded-2xl p-5 md:p-6 flex gap-4 md:gap-5 border border-white/5 hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group animate-slide-down"
                >
                  {/* Glowing neon side line on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="h-10 md:h-12 w-10 md:w-12 rounded-xl bg-purple-500/10 border border-purple-500/15 flex-shrink-0 flex items-center justify-center text-purple-400 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <Megaphone className="h-5 w-5" />
                  </div>

                  <div className="flex-1 flex flex-col gap-2.5">
                    {/* Header */}
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Head Coach Broadcast</span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(feed.createdAt)}</span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="text-sm md:text-base text-gray-200 leading-relaxed font-medium">
                      {feed.message}
                    </p>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
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
