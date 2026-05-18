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
    <div className="flex-1 w-full min-h-screen flex flex-col font-sans bg-[#0a0a0a]">
      {/* Sticky Technical Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#0a0a0a] border-b border-[#212327] py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-[#ff7a17]" />
          <span className="caption-mono text-white text-sm">// SYNCUP</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 border border-[#212327] rounded-full px-3 py-1.5 text-xs text-[#7d8187] caption-mono-sm">
            {connStatus === "connected" && (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff7a17]"></span>
                <span className="hidden sm:inline">LIVE</span>
              </>
            )}
            {connStatus === "connecting" && (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed] animate-pulse"></span>
                <span className="hidden sm:inline">CONNECTING</span>
              </>
            )}
            {connStatus === "disconnected" && (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                <span className="hidden sm:inline text-rose-500">OFFLINE</span>
              </>
            )}
          </div>

          {/* Admin Redirect Button - Canonical Pill Outline */}
          <Link href="/admin" className="button-md border border-white/25 hover:border-white/50 text-white py-1.5 px-4 rounded-full transition-colors">
            Admin Console
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16 flex flex-col gap-10">
        
        {/* Hero Band */}
        <section className="flex flex-col gap-3">
          <div className="caption-mono text-[#7d8187]">
            // SMART REALTIME BROADCASTING SYSTEM
          </div>
          <h2 className="display-md md:display-xl text-white">
            Realtime coaching instruction feed.
          </h2>
          <p className="body-lg text-[#dadbdf] max-w-2xl">
            Receive instant, direct strategies and training adjustments from the coaching staff in realtime without refreshing.
          </p>
        </section>

        {/* Cache Status Bar */}
        {!loading && !error && feeds.length > 0 && (
          <div className="bg-[#191919] border border-[#212327] rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-[#ff7a17] flex-shrink-0" />
              <div className="text-left">
                <p className="caption-mono text-white text-xs">// CACHE-ASIDE LAYER ACTIVE</p>
                <p className="text-[12px] text-[#7d8187] mt-0.5">GET queries are accelerated using an in-memory high-speed cache.</p>
              </div>
            </div>
            <div className="caption-mono-sm border border-[#212327] bg-[#1a1c20] text-white px-3 py-1 rounded-sm">
              ACCELERATED RESPONSE
            </div>
          </div>
        )}

        {/* Loading Skeleton Panel */}
        {loading && (
          <section className="flex flex-col gap-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-[#191919] border border-[#212327] rounded-lg p-6 flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-[#1a1c20] border border-[#212327] flex-shrink-0"></div>
                <div className="flex-1 flex flex-col gap-3 mt-1">
                  <div className="h-3 w-1/4 bg-[#1a1c20] rounded-sm"></div>
                  <div className="h-3 w-full bg-[#1a1c20] rounded-sm"></div>
                  <div className="h-3 w-5/6 bg-[#1a1c20] rounded-sm"></div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Error Boundary Banner */}
        {error && (
          <section className="bg-[#191919] border border-rose-950 rounded-lg p-8 flex flex-col items-center justify-center text-center gap-4">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
            <div className="flex flex-col gap-1 max-w-md">
              <h3 className="caption-mono text-white text-sm">// CONNECTION ISSUES DETECTED</h3>
              <p className="text-sm text-[#7d8187]">{error}</p>
            </div>
            <button 
              onClick={fetchFeeds} 
              className="button-md border border-white/25 hover:border-white/50 text-white py-1.5 px-4 rounded-full transition-colors flex items-center gap-2"
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
              <div className="bg-[#191919] border border-dashed border-[#212327] rounded-lg py-16 px-6 flex flex-col items-center justify-center text-center gap-4">
                <Inbox className="h-8 w-8 text-[#7d8187]" />
                <div className="flex flex-col gap-1 max-w-sm">
                  <h3 className="caption-mono text-white text-sm">// FEED IS EMPTY</h3>
                  <p className="text-xs text-[#7d8187]">There are currently no coaching broadcasts. Access the Admin Console to post your first coach instruction!</p>
                </div>
                <Link href="/admin" className="button-md border border-white/25 hover:border-white/50 text-white py-1.5 px-4 rounded-full transition-colors">
                  Go Broadcast An Update
                </Link>
              </div>
            ) : (
              feeds.map((feed) => (
                <article 
                  key={feed._id} 
                  className="bg-[#191919] border border-[#212327] rounded-lg p-5 md:p-6 flex gap-4 md:gap-5 transition-colors duration-200 animate-xai-fade relative overflow-hidden group"
                >
                  <div className="h-10 md:h-12 w-10 md:w-12 rounded-full bg-[#1a1c20] border border-[#212327] flex-shrink-0 flex items-center justify-center text-[#ff7a17]">
                    <Megaphone className="h-4 w-4" />
                  </div>

                  <div className="flex-1 flex flex-col gap-2.5">
                    {/* Header */}
                    <div className="flex justify-between items-center gap-2">
                      <span className="caption-mono-sm text-[#ff7a17]">// HEAD COACH BROADCAST</span>
                      <div className="flex items-center gap-1 caption-mono-sm text-[#7d8187] text-[11px]">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(feed.createdAt)}</span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="body-md text-white leading-relaxed">
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
      <footer className="mt-auto w-full py-8 border-t border-[#212327] flex items-center justify-center bg-[#0a0a0a]">
        <p className="caption-mono-sm text-[#7d8187] text-[10px]">
          // SYNCUP REALTIME FEED ENGINE © 2026
        </p>
      </footer>
    </div>
  );
}
