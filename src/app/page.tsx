"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import ChannelsGrid from "@/components/ChannelsGrid";
import MatchesGrid from "@/components/MatchesGrid";
import dynamic from "next/dynamic";
import AdminPanel from "@/components/AdminPanel";
import { Channel, useAppContext } from "@/context/AppContext";
import SplashScreen from "@/components/SplashScreen";

const Player = dynamic(() => import("@/components/Player"), { ssr: false });

export default function Home() {
  const [view, setView] = useState('channels');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const { state, loading } = useAppContext();

  useEffect(() => {
    const bgUrl = state.settings.appBackground;
    if (bgUrl && bgUrl.trim() !== '') {
      document.documentElement.style.backgroundImage = `url(${bgUrl})`;
      document.documentElement.style.backgroundSize = "cover";
      document.documentElement.style.backgroundPosition = "center";
      document.documentElement.style.backgroundAttachment = "fixed";
    } else {
      document.documentElement.style.backgroundImage = "";
    }
  }, [state.settings.appBackground]);

  const handlePlay = (channel: Channel) => {
    setActiveChannel(channel);
    setView('player');
  };

  return (
    <>
      <SplashScreen appName={state.settings.appName} isLoading={loading} />

      {state.settings.marqueeText && (
        <div className="w-full bg-[var(--color-primary-custom)] text-white text-sm font-bold py-1.5 overflow-hidden shadow-md z-50 relative border-b border-white/10" dir="rtl">
          <div className="animate-marquee px-4">
            {state.settings.marqueeText}
          </div>
        </div>
      )}
      <Header view={view} setView={setView} toggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} setView={setView} />
      
      {view === 'admin_auth' && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="glass-card rounded-2xl p-6 w-full max-w-sm text-center border border-[var(--color-primary-custom)]/30 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary-custom)]/20 mx-auto mb-4 flex items-center justify-center text-3xl">🛡️</div>
                <h3 className="text-xl font-bold mb-6 text-white">تسجيل الدخول للإدارة</h3>
                
                <input 
                  type="text" 
                  value={adminUsername} 
                  onChange={e => setAdminUsername(e.target.value)} 
                  className="sport-input mb-4 text-center w-full" 
                  placeholder="اسم المستخدم" 
                  dir="ltr" 
                />
                
                <input 
                  type="password" 
                  value={adminPassword} 
                  onChange={e => setAdminPassword(e.target.value)} 
                  className="sport-input mb-6 text-center text-2xl tracking-[0.5em] w-full" 
                  placeholder="••••" 
                  dir="ltr" 
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const validUsername = state.settings.adminUsername || 'admin';
                      const validPassword = state.settings.adminPassword || '123';
                      if (adminUsername === validUsername && adminPassword === validPassword) { 
                        setView('admin'); 
                        setAdminPassword(''); 
                        setAdminUsername('');
                      } else {
                        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
                      }
                    }
                  }}
                />
                
                <div className="flex gap-3">
                    <button onClick={() => setView('channels')} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition">إلغاء</button>
                    <button onClick={() => { 
                      const validUsername = state.settings.adminUsername || 'admin';
                      const validPassword = state.settings.adminPassword || '123';
                      if(adminUsername === validUsername && adminPassword === validPassword) { 
                        setView('admin'); 
                        setAdminPassword(''); 
                        setAdminUsername('');
                      } else {
                        alert('اسم المستخدم أو كلمة المرور غير صحيحة'); 
                      }
                    }} className="flex-1 py-3 rounded-xl bg-[var(--color-primary-custom)] text-white font-bold hover:bg-[var(--color-primary-custom)]/80 transition">دخول</button>
                </div>
            </div>
        </div>
      )}

      {view === 'channels' && <ChannelsGrid onPlay={handlePlay} />}
      {view === 'matches' && <MatchesGrid onPlay={handlePlay} />}
      {view === 'player' && <Player channel={activeChannel} />}
      {view === 'admin' && <AdminPanel setView={setView} />}

      <BottomNav view={view} setView={setView} />
    </>
  );
}
