"use client";
import React, { useState, useEffect } from "react";
import { useAppContext, AppState } from "@/context/AppContext";
import { Tv, Calendar, Settings } from "lucide-react";

// المكونات المحلية للأيقونات (SVGs مخصصة لتجنب مشاكل استيراد الأيقونات المفقودة)
const PlusIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const EditIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const AlertIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const CloudIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

const CodeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const UploadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

interface ParsedChannel {
  name: string;
  url: string;
  logo: string;
  category: string;
}

export default function AdminPanel({ setView }: { setView: any }) {
  const { state, setState, syncToCloud } = useAppContext();
  const [tab, setTab] = useState('channels');
  const [syncing, setSyncing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const uploadToImgBB = async (file: File): Promise<string | null> => {
    if (!state.settings.imgbbApiKey) {
      alert("الرجاء إضافة مفتاح ImgBB API في صفحة الإعدادات لرفع الصور مباشرة.");
      return null;
    }
    const formData = new FormData();
    formData.append("image", file);
    setUploadingImg(true);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${state.settings.imgbbApiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadingImg(false);
      if (data.success) {
        return data.data.url;
      } else {
        alert("فشل الرفع: " + (data.error?.message || "خطأ غير معروف"));
        return null;
      }
    } catch (err) {
      setUploadingImg(false);
      alert("تعذر الاتصال بخادم الرفع. يرجى التحقق من اتصالك.");
      return null;
    }
  };

  const updateState = (updater: React.SetStateAction<AppState>) => {
    setState(updater);
    setHasUnsavedChanges(true);
  };

  // فورم إدارة القنوات
  const [channelForm, setChannelForm] = useState({ id: 0, name: '', url: '', logo: '', category: '' });
  const [channelSearch, setChannelSearch] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Set<number>>(new Set());

  // فورم إدارة المباريات
  const [matchForm, setMatchForm] = useState({
    id: 0,
    team1: { name: '', logo: '' },
    team2: { name: '', logo: '' },
    time: '',
    channel: '',
    commentator: '',
    league: ''
  });
  const [selectedMatches, setSelectedMatches] = useState<Set<number>>(new Set());

  // محرر JSON المباشر
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // مستورد ملف M3U
  const [m3uText, setM3uText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [parsedChannels, setParsedChannels] = useState<ParsedChannel[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [m3uSearch, setM3uSearch] = useState('');

  // مزامنة محرر JSON مع الـ state عند تغيير التبويب
  useEffect(() => {
    if (tab === 'json_editor') {
      setJsonText(JSON.stringify(state, null, 2));
      setJsonError(null);
    }
  }, [tab, state]);

  // إدارة القنوات - حفظ / تعديل
  const handleSaveChannel = () => {
    if (!channelForm.name || !channelForm.url) {
      alert("الرجاء ملء اسم القناة ورابط البث على الأقل.");
      return;
    }
    updateState(prev => {
      const channels = [...prev.channels];
      if (channelForm.id) {
        const idx = channels.findIndex(c => c.id === channelForm.id);
        if (idx > -1) channels[idx] = { ...channelForm };
      } else {
        channels.push({ ...channelForm, id: Date.now() });
      }
      return { ...prev, channels };
    });
    setChannelForm({ id: 0, name: '', url: '', logo: '', category: '' });
  };

  // إدارة المباريات - حفظ / تعديل
  const handleSaveMatch = () => {
    if (!matchForm.team1.name || !matchForm.team2.name || !matchForm.time || !matchForm.channel) {
      alert("الرجاء إدخال أسماء الفريقين، الوقت، والقناة الناقلة.");
      return;
    }
    updateState(prev => {
      const matches = [...prev.matches];
      if (matchForm.id) {
        const idx = matches.findIndex(m => m.id === matchForm.id);
        if (idx > -1) matches[idx] = { ...matchForm };
      } else {
        matches.push({ ...matchForm, id: Date.now() });
      }
      return { ...prev, matches };
    });
    setMatchForm({
      id: 0,
      team1: { name: '', logo: '' },
      team2: { name: '', logo: '' },
      time: '',
      channel: '',
      commentator: '',
      league: ''
    });
  };

  // محرر JSON - التحقق والتحديث
  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      if (!parsed.settings || !Array.isArray(parsed.channels) || !Array.isArray(parsed.matches)) {
        setJsonError("يجب أن يحتوي الـ JSON على الكائنات الرئيسية: settings و channels و matches.");
      } else {
        setJsonError(null);
      }
    } catch (err: any) {
      setJsonError(`صيغة JSON غير صالحة: ${err.message}`);
    }
  };

  const handleSaveJson = () => {
    if (jsonError) {
      alert("الرجاء إصلاح أخطاء الـ JSON أولاً.");
      return;
    }
    try {
      const parsed = JSON.parse(jsonText);
      updateState(parsed);
      alert("تم تحديث البيانات محلياً بنجاح! لا تنسَ المزامنة للسحابة.");
    } catch (err) {
      alert("فشل تحديث البيانات. يرجى التأكد من الصيغة.");
    }
  };

  // مستورد M3U - معالجة النص
  const handleParseM3U = () => {
    if (!m3uText.trim()) {
      alert("الرجاء لصق نص ملف M3U أولاً.");
      return;
    }
    const lines = m3uText.split('\n');
    const channels: ParsedChannel[] = [];
    let currentInfo: { name: string; logo: string; category: string } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('#EXTINF:')) {
        // استخراج الشعار
        const logoMatch = line.match(/tvg-logo="([^"]+)"/) || line.match(/logo="([^"]+)"/);
        const logo = logoMatch ? logoMatch[1] : '';

        // استخراج التصنيف (group-title)
        const groupMatch = line.match(/group-title="([^"]+)"/);
        const category = groupMatch ? groupMatch[1] : '';

        // استخراج الاسم
        const commaIndex = line.lastIndexOf(',');
        const name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'قناة غير معروفة';

        currentInfo = { name, logo, category };
      } else if (line.startsWith('http://') || line.startsWith('https://')) {
        if (currentInfo) {
          channels.push({
            name: currentInfo.name,
            url: line,
            logo: currentInfo.logo,
            category: currentInfo.category
          });
          currentInfo = null;
        }
      }
    }

    if (channels.length === 0) {
      alert("لم يتم العثور على أي قنوات صالحة. تأكد من احتواء الملف على وسوم #EXTINF وروابط بث صحيحة.");
      return;
    }

    setParsedChannels(channels);
    // تحديد الكل افتراضياً
    setSelectedIndices(new Set(channels.map((_, idx) => idx)));
  };

  const handleToggleSelectChannel = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedIndices(next);
  };

  const handleSelectAllM3U = () => {
    setSelectedIndices(new Set(parsedChannels.map((_, idx) => idx)));
  };

  const handleDeselectAllM3U = () => {
    setSelectedIndices(new Set());
  };

  const handleImportM3UChannels = () => {
    if (selectedIndices.size === 0) {
      alert("يرجى اختيار قناة واحدة على الأقل للاستيراد.");
      return;
    }

    const imported = parsedChannels.filter((_, idx) => selectedIndices.has(idx)).map((ch, idx) => ({
      id: Date.now() + idx,
      name: ch.name,
      url: ch.url,
      logo: ch.logo,
      category: ch.category || ''
    }));

    // استخراج التصنيفات الجديدة تلقائياً من group-title
    const newCategoryNames = Array.from(
      new Set(imported.map(ch => ch.category).filter(Boolean))
    );

    updateState(prev => {
      const existingNames = (prev.categories || []).map(c => typeof c === 'string' ? c : c.name);
      const categoriesToAdd = newCategoryNames
        .filter(name => !existingNames.includes(name))
        .map(name => ({ name, icon: '' }));

      return {
        ...prev,
        channels: [...prev.channels, ...imported],
        categories: [...(prev.categories || []), ...categoriesToAdd]
      };
    });

    const newCount = newCategoryNames.length;
    alert(`تم بنجاح استيراد ${imported.length} قناة${newCount > 0 ? ` و ${newCount} تصنيف جديد` : ''} إلى قائمتك!`);
    setParsedChannels([]);
    setM3uText('');
    setSelectedIndices(new Set());
  };

  // المزامنة الكلية للسحابة
  const handleSync = async () => {
    setSyncing(true);
    const result = await syncToCloud();
    setSyncing(false);
    if (result.success) {
      setHasUnsavedChanges(false);
      alert("تمت مزامنة جميع التغييرات بنجاح إلى قاعدة البيانات السحابية (JSONBin)!");
    } else {
      alert(`حدث خطأ أثناء المزامنة: ${result.error || "يرجى التحقق من اتصال الإنترنت."}`);
    }
  };

  // تصفية القنوات حسب البحث
  const filteredChannels = state.channels.filter(ch =>
    ch.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  // تصفية قنوات M3U المفسرة حسب البحث
  const filteredM3UChannels = parsedChannels.filter(ch =>
    ch.name.toLowerCase().includes(m3uSearch.toLowerCase())
  );

  return (
    <div className="view-section active px-4 lg:px-10 py-6 h-full w-full relative z-10 max-w-6xl mx-auto pb-24 overflow-y-auto">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-primary-custom)] flex items-center gap-3 drop-shadow-md logo-text">
          لوحة تحكم Hakim TV
        </h2>
        <button
          onClick={() => setView('channels')}
          className="bg-red-900/40 border border-red-500/30 text-red-200 text-xs px-4 py-2 rounded-xl hover:bg-red-800/60 font-bold transition flex items-center gap-2"
        >
          <span>خروج</span>
        </button>
      </div>

      {/* التبويبات */}
      <div className="flex flex-wrap gap-2 mb-6 bg-black/30 p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => setTab('channels')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
            tab === 'channels' ? 'bg-[var(--color-primary-custom)] text-white shadow-lg shadow-[var(--color-primary-custom)]/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Tv size={16} />
          إدارة القنوات
        </button>
        <button
          onClick={() => setTab('matches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
            tab === 'matches' ? 'bg-[var(--color-primary-custom)] text-white shadow-lg shadow-[var(--color-primary-custom)]/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar size={16} />
          إدارة المباريات
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
            tab === 'settings' ? 'bg-[var(--color-primary-custom)] text-white shadow-lg shadow-[var(--color-primary-custom)]/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings size={16} />
          إعدادات الواجهة
        </button>
        <button
          onClick={() => setTab('json_editor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
            tab === 'json_editor' ? 'bg-[var(--color-primary-custom)] text-white shadow-lg shadow-[var(--color-primary-custom)]/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <CodeIcon className="w-4 h-4" />
          تعديل JSON
        </button>
        <button
          onClick={() => setTab('m3u_import')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
            tab === 'm3u_import' ? 'bg-[var(--color-primary-custom)] text-white shadow-lg shadow-[var(--color-primary-custom)]/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <UploadIcon className="w-4 h-4" />
          استيراد M3U
        </button>
        <button
          onClick={() => setTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all ${
            tab === 'categories' ? 'bg-[var(--color-primary-custom)] text-white shadow-lg shadow-[var(--color-primary-custom)]/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          📂
          إدارة التصنيفات
        </button>
      </div>

      {hasUnsavedChanges && (
        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs lg:text-sm font-bold rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>لديك تعديلات غير محفوظة! يرجى الضغط على زر المزامنة السحابية في الأسفل لحفظ التغييرات نهائياً.</span>
          </div>
          <button 
            onClick={handleSync} 
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-bold transition text-xs shrink-0 cursor-pointer"
          >
            {syncing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      )}

      {/* لوحة العرض الرئيسية */}
      <div className="glass-card rounded-3xl p-5 lg:p-8 flex flex-col gap-6 border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* إدارة القنوات */}
        {tab === 'channels' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-black text-white mb-4">
                {channelForm.id ? "تعديل بيانات قناة" : "إضافة قناة جديدة"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">اسم القناة</label>
                  <input
                    type="text"
                    className="sport-input"
                    placeholder="مثال: beIN Sports 1 HD"
                    value={channelForm.name}
                    onChange={e => setChannelForm({ ...channelForm, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                    رابط البث
                    <span className="text-[10px] font-semibold bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-gray-400">HLS/m3u8</span>
                    <span className="text-[10px] font-semibold bg-red-600/15 border border-red-600/25 rounded px-1.5 py-0.5 text-red-400">YouTube</span>
                  </label>
                  <input
                    type="text"
                    className="sport-input text-left"
                    placeholder="https://...m3u8 أو https://youtube.com/watch?v=..."
                    dir="ltr"
                    value={channelForm.url}
                    onChange={e => setChannelForm({ ...channelForm, url: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">شعار القناة (رابط أو رفع صورة)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="sport-input text-left flex-1 min-w-0"
                      placeholder="https://..."
                      dir="ltr"
                      value={channelForm.logo}
                      onChange={e => setChannelForm({ ...channelForm, logo: e.target.value })}
                    />
                    <label className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition shrink-0" title="رفع صورة">
                      {uploadingImg ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <UploadIcon className="w-4 h-4 text-gray-300" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const url = await uploadToImgBB(e.target.files[0]);
                                if (url) setChannelForm(prev => ({ ...prev, logo: url }));
                              }
                            }} 
                          />
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">التصنيف</label>
                  <select
                    className="sport-input cursor-pointer"
                    value={channelForm.category}
                    onChange={e => setChannelForm({ ...channelForm, category: e.target.value })}
                  >
                    <option value="">— اختر تصنيفاً —</option>
                    {(state.categories || []).map((cat, i) => {
                      const name = typeof cat === 'string' ? cat : cat.name;
                      return <option key={`${name}-${i}`} value={name}>{name}</option>;
                    })}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveChannel}
                  className="flex-1 py-3.5 rounded-2xl bg-[var(--color-primary-custom)] hover:bg-[var(--color-primary-custom)]/80 text-white font-bold transition flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>{channelForm.id ? "حفظ التغييرات" : "إضافة للقائمة"}</span>
                </button>
                {channelForm.id !== 0 && (
                  <button
                    onClick={() => setChannelForm({ id: 0, name: '', url: '', logo: '', category: '' })}
                    className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition text-sm"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>

            {/* قائمة القنوات المضافة */}
            <div className="border-t border-white/5 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h4 className="text-lg font-black text-white">القنوات المضافة ({state.channels.length})</h4>
                
                {/* شريط الإجراءات الجماعية */}
                {selectedChannels.size > 0 && (
                  <div className="flex flex-wrap items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-bold text-blue-400">محدد ({selectedChannels.size})</span>
                    <button
                      onClick={() => {
                        const newCategory = prompt("أدخل اسم التصنيف الجديد لجميع القنوات المحددة:");
                        if (newCategory !== null) {
                          updateState(prev => ({
                            ...prev,
                            channels: prev.channels.map(ch => 
                              selectedChannels.has(ch.id) ? { ...ch, category: newCategory } : ch
                            )
                          }));
                          setSelectedChannels(new Set());
                        }
                      }}
                      className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg text-white font-bold transition"
                    >
                      تعديل التصنيف
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف ${selectedChannels.size} قناة؟`)) {
                          updateState(prev => ({
                            ...prev,
                            channels: prev.channels.filter(ch => !selectedChannels.has(ch.id))
                          }));
                          setSelectedChannels(new Set());
                        }
                      }}
                      className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded-lg text-red-200 font-bold transition"
                    >
                      حذف المحدد
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                  {state.channels.length > 0 && (
                    <button
                      onClick={() => {
                        if (selectedChannels.size === state.channels.length) {
                          setSelectedChannels(new Set());
                        } else {
                          setSelectedChannels(new Set(state.channels.map(c => c.id)));
                        }
                      }}
                      className="text-xs bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white font-bold hover:bg-white/10 transition shrink-0"
                    >
                      {selectedChannels.size === state.channels.length ? "إلغاء التحديد" : "تحديد الكل"}
                    </button>
                  )}
                  {state.channels.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm("هل أنت متأكد من حذف جميع القنوات؟!")) {
                          updateState(prev => ({ ...prev, channels: [] }));
                          setSelectedChannels(new Set());
                        }
                      }}
                      className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl font-bold hover:bg-red-500/20 transition shrink-0"
                    >
                      حذف الكل
                    </button>
                  )}
                  <div className="relative w-full md:w-64">
                    <input
                      type="text"
                      placeholder="بحث عن قناة..."
                      className="sport-input pr-10"
                      value={channelSearch}
                      onChange={e => setChannelSearch(e.target.value)}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <SearchIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {filteredChannels.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-bold text-sm bg-black/10 rounded-2xl border border-white/5">
                  لا توجد قنوات مطابقة للبحث أو القائمة فارغة.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredChannels.map(ch => (
                    <div key={ch.id} className="flex items-center justify-between p-3.5 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-[var(--color-primary-custom)] cursor-pointer shrink-0"
                          checked={selectedChannels.has(ch.id)}
                          onChange={() => {
                            const newSet = new Set(selectedChannels);
                            if (newSet.has(ch.id)) newSet.delete(ch.id);
                            else newSet.add(ch.id);
                            setSelectedChannels(newSet);
                          }}
                        />
                        {ch.logo ? (
                          <img src={ch.logo} alt={ch.name} className="w-10 h-10 object-contain rounded bg-white/5 p-1 shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23222"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23fff" font-size="10">TV</text></svg>' }} />
                        ) : (
                          <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-gray-400">TV</div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{ch.name}</p>
                          <p className="text-[10px] text-gray-400 truncate" dir="ltr">{ch.url}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0 ml-2">
                        <button
                          onClick={() => setChannelForm({ ...ch, category: ch.category || '' })}
                          className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition"
                          title="تعديل"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف قناة "${ch.name}"؟`)) {
                              setState(p => ({ ...p, channels: p.channels.filter(c => c.id !== ch.id) }));
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition"
                          title="حذف"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* إدارة المباريات */}
        {tab === 'matches' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-black text-white mb-4">
                {matchForm.id ? "تعديل مباراة اليوم" : "إضافة مباراة اليوم"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* الفريق الأول */}
                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-[var(--color-primary-custom)] uppercase tracking-wider">الفريق الأول (المستضيف)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      className="sport-input"
                      placeholder="اسم الفريق الأول"
                      value={matchForm.team1.name}
                      onChange={e => setMatchForm({ ...matchForm, team1: { ...matchForm.team1, name: e.target.value } })}
                    />
                    <div className="flex gap-2 min-w-0">
                      <input
                        type="text"
                        className="sport-input text-left flex-1 min-w-0"
                        placeholder="شعار الفريق (رابط/رفع)"
                        dir="ltr"
                        value={matchForm.team1.logo}
                        onChange={e => setMatchForm({ ...matchForm, team1: { ...matchForm.team1, logo: e.target.value } })}
                      />
                      <label className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 flex items-center justify-center cursor-pointer transition shrink-0" title="رفع صورة">
                        {uploadingImg ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <UploadIcon className="w-4 h-4 text-gray-300" />
                            <input 
                              type="file" accept="image/*" className="hidden" 
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const url = await uploadToImgBB(e.target.files[0]);
                                  if (url) setMatchForm(prev => ({ ...prev, team1: { ...prev.team1, logo: url } }));
                                }
                              }} 
                            />
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* الفريق الثاني */}
                <div className="p-4 bg-black/20 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-[var(--color-primary-custom)] uppercase tracking-wider">الفريق الثاني (الضيف)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      className="sport-input"
                      placeholder="اسم الفريق الثاني"
                      value={matchForm.team2.name}
                      onChange={e => setMatchForm({ ...matchForm, team2: { ...matchForm.team2, name: e.target.value } })}
                    />
                    <div className="flex gap-2 min-w-0">
                      <input
                        type="text"
                        className="sport-input text-left flex-1 min-w-0"
                        placeholder="شعار الفريق (رابط/رفع)"
                        dir="ltr"
                        value={matchForm.team2.logo}
                        onChange={e => setMatchForm({ ...matchForm, team2: { ...matchForm.team2, logo: e.target.value } })}
                      />
                      <label className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 flex items-center justify-center cursor-pointer transition shrink-0" title="رفع صورة">
                        {uploadingImg ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <UploadIcon className="w-4 h-4 text-gray-300" />
                            <input 
                              type="file" accept="image/*" className="hidden" 
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const url = await uploadToImgBB(e.target.files[0]);
                                  if (url) setMatchForm(prev => ({ ...prev, team2: { ...prev.team2, logo: url } }));
                                }
                              }} 
                            />
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* توقيت المباراة والقناة */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400">توقيت المباراة (مثال: 21:00)</label>
                    <input
                      type="text"
                      className="sport-input text-center"
                      placeholder="مثال: 22:00"
                      value={matchForm.time}
                      onChange={e => setMatchForm({ ...matchForm, time: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400">القناة الناقلة للمباراة</label>
                    <select
                      className="sport-input bg-[#0f0f0f] border border-white/10 rounded-xl px-4 text-white"
                      value={matchForm.channel}
                      onChange={e => setMatchForm({ ...matchForm, channel: e.target.value })}
                    >
                      <option value="">-- اختر القناة --</option>
                      {state.channels.map(ch => (
                        <option key={ch.id} value={ch.name}>{ch.name}</option>
                      ))}
                      <option value="قناة غير مدرجة">قناة غير مدرجة</option>
                    </select>
                  </div>
                </div>
                {/* المعلق والبطولة */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400">اسم البطولة / الدوري (اختياري)</label>
                    <input
                      type="text"
                      className="sport-input"
                      placeholder="مثال: دوري أبطال أوروبا"
                      value={matchForm.league || ''}
                      onChange={e => setMatchForm({ ...matchForm, league: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400">معلق المباراة (اختياري)</label>
                    <input
                      type="text"
                      className="sport-input"
                      placeholder="مثال: عصام الشوالي"
                      value={matchForm.commentator || ''}
                      onChange={e => setMatchForm({ ...matchForm, commentator: e.target.value })}
                    />
                  </div>
                </div>
              </div>


              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleSaveMatch}
                  className="flex-1 py-3.5 rounded-2xl bg-[var(--color-primary-custom)] hover:bg-[var(--color-primary-custom)]/80 text-white font-bold transition flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>{matchForm.id ? "حفظ التغييرات" : "إضافة المباراة"}</span>
                </button>
                {matchForm.id !== 0 && (
                  <button
                    onClick={() => setMatchForm({ id: 0, team1: { name: '', logo: '' }, team2: { name: '', logo: '' }, time: '', channel: '', commentator: '', league: '' })}
                    className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition text-sm"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>

            {/* عرض المباريات المضافة */}
            <div className="border-t border-white/5 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h4 className="text-lg font-black text-white">المباريات المبرمجة اليوم ({state.matches.length})</h4>
                
                {/* شريط الإجراءات الجماعية */}
                {selectedMatches.size > 0 && (
                  <div className="flex flex-wrap items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-bold text-blue-400">محدد ({selectedMatches.size})</span>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف ${selectedMatches.size} مباراة؟`)) {
                          updateState(prev => ({
                            ...prev,
                            matches: prev.matches.filter(m => !selectedMatches.has(m.id))
                          }));
                          setSelectedMatches(new Set());
                        }
                      }}
                      className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded-lg text-red-200 font-bold transition"
                    >
                      حذف المحدد
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                  {state.matches.length > 0 && (
                    <button
                      onClick={() => {
                        if (selectedMatches.size === state.matches.length) {
                          setSelectedMatches(new Set());
                        } else {
                          setSelectedMatches(new Set(state.matches.map(m => m.id)));
                        }
                      }}
                      className="text-xs bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white font-bold hover:bg-white/10 transition shrink-0"
                    >
                      {selectedMatches.size === state.matches.length ? "إلغاء التحديد" : "تحديد الكل"}
                    </button>
                  )}
                  {state.matches.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm("هل أنت متأكد من حذف جميع المباريات؟!")) {
                          updateState(prev => ({ ...prev, matches: [] }));
                          setSelectedMatches(new Set());
                        }
                      }}
                      className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl font-bold hover:bg-red-500/20 transition shrink-0"
                    >
                      حذف الكل
                    </button>
                  )}
                </div>
              </div>
              {state.matches.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-bold text-sm bg-black/10 rounded-2xl border border-white/5">
                  لا توجد مباريات مضافة اليوم.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.matches.map(m => (
                    <div key={m.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col gap-3 justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-[var(--color-primary-custom)] cursor-pointer shrink-0"
                            checked={selectedMatches.has(m.id)}
                            onChange={() => {
                              const newSet = new Set(selectedMatches);
                              if (newSet.has(m.id)) newSet.delete(m.id);
                              else newSet.add(m.id);
                              setSelectedMatches(newSet);
                            }}
                          />
                          {m.team1.logo ? (
                            <img src={m.team1.logo} alt={m.team1.name} className="w-8 h-8 object-contain" onError={e => (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23222"/></svg>'} />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 font-bold text-[10px] shrink-0">
                              {m.team1.name.substring(0,2).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-bold text-white truncate">{m.team1.name}</span>
                        </div>
                        <div className="px-2.5 py-1 bg-white/5 rounded-lg text-xs font-bold text-[var(--color-primary-custom)] shrink-0">{m.time}</div>
                        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                          <span className="text-xs font-bold text-white truncate">{m.team2.name}</span>
                          {m.team2.logo ? (
                            <img src={m.team2.logo} alt={m.team2.name} className="w-8 h-8 object-contain" onError={e => (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23222"/></svg>'} />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 font-bold text-[10px] shrink-0">
                              {m.team2.name.substring(0,2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-1">
                        <span className="text-xs text-gray-400 font-medium">القناة: <b className="text-gray-200">{m.channel}</b></span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setMatchForm({ ...m, commentator: m.commentator || '', league: m.league || '' })}
                            className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف مباراة ${m.team1.name} ضد ${m.team2.name}؟`)) {
                                setState(p => ({ ...p, matches: p.matches.filter(item => item.id !== m.id) }));
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* إعدادات الواجهة */}
        {tab === 'settings' && (
          <div>
            <h3 className="text-xl font-black text-white mb-4">تخصيص الهوية البصرية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">اسم التطبيق</label>
                <input
                  type="text"
                  className="sport-input"
                  placeholder="اسم التطبيق"
                  value={state.settings.appName}
                  onChange={e => updateState(p => ({ ...p, settings: { ...p.settings, appName: e.target.value } }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">اللون الرئيسي للهوية (سداسي عشر Hex)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-12 h-11 bg-transparent rounded cursor-pointer border border-white/10"
                    value={state.settings.primaryColor}
                    onChange={e => updateState(p => ({ ...p, settings: { ...p.settings, primaryColor: e.target.value } }))}
                  />
                  <input
                    type="text"
                    className="sport-input text-center flex-1 font-mono"
                    dir="ltr"
                    placeholder="#5E227F"
                    value={state.settings.primaryColor}
                    onChange={e => updateState(p => ({ ...p, settings: { ...p.settings, primaryColor: e.target.value } }))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">رابط قناة التليجرام</label>
                <input
                  type="text"
                  className="sport-input text-left"
                  dir="ltr"
                  placeholder="https://t.me/yourchannel"
                  value={state.settings.telegramUrl}
                  onChange={e => updateState(p => ({ ...p, settings: { ...p.settings, telegramUrl: e.target.value } }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">رابط صفحة الفيسبوك</label>
                <input
                  type="text"
                  className="sport-input text-left"
                  dir="ltr"
                  placeholder="https://facebook.com/yourpage"
                  value={state.settings.facebookUrl}
                  onChange={e => updateState(p => ({ ...p, settings: { ...p.settings, facebookUrl: e.target.value } }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">مفتاح ImgBB API (لرفع الصور)</label>
                <input
                  type="text"
                  className="sport-input text-left"
                  dir="ltr"
                  placeholder="e.g. 52c... API Key"
                  value={state.settings.imgbbApiKey || ''}
                  onChange={e => updateState(p => ({ ...p, settings: { ...p.settings, imgbbApiKey: e.target.value } }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">صورة الخلفية (رابط)</label>
                <input
                  type="text"
                  className="sport-input text-left"
                  dir="ltr"
                  placeholder="https://..."
                  value={state.settings.appBackground || ''}
                  onChange={e => updateState(p => ({ ...p, settings: { ...p.settings, appBackground: e.target.value } }))}
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-400">نص شريط الأخبار المتحرك (Marquee)</label>
                <input
                  type="text"
                  className="sport-input"
                  placeholder="مثال: تابعونا على تليجرام للحصول على أحدث التحديثات"
                  value={state.settings.marqueeText || ''}
                  onChange={e => updateState(p => ({ ...p, settings: { ...p.settings, marqueeText: e.target.value } }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">اسم مستخدم لوحة الإدارة</label>
                <input
                  type="text"
                  className="sport-input text-center"
                  dir="ltr"
                  placeholder="admin"
                  value={state.settings.adminUsername || 'admin'}
                  onChange={e => updateState(p => ({ ...p, settings: { ...p.settings, adminUsername: e.target.value } }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400">كلمة مرور لوحة الإدارة</label>
                <input
                  type="text"
                  className="sport-input text-center"
                  dir="ltr"
                  placeholder="123"
                  value={state.settings.adminPassword || '123'}
                  onChange={e => updateState(p => ({ ...p, settings: { ...p.settings, adminPassword: e.target.value } }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* محرر JSON المباشر */}
        {tab === 'json_editor' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-white">تعديل كامل البيانات بصيغة JSON</h3>
              <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 font-bold px-2.5 py-1 rounded-lg">قاعدة البيانات بالكامل</span>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              هذا القسم يتيح لك تعديل، إضافة، أو حذف القنوات والمباريات بالكامل بكود JSON مباشر. يرجى التأكد من الحفاظ على نفس بنية الكائن لتفادي المشاكل.
            </p>

            <textarea
              className="w-full h-80 bg-black/60 font-mono text-xs p-4 rounded-2xl border border-white/10 text-emerald-400 leading-relaxed focus:outline-none focus:border-emerald-500 transition"
              dir="ltr"
              value={jsonText}
              onChange={e => handleJsonChange(e.target.value)}
            ></textarea>

            {jsonError && (
              <div className="p-3.5 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertIcon className="w-4 h-4 text-red-400 shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}

            <button
              onClick={handleSaveJson}
              disabled={!!jsonError}
              className={`py-3.5 rounded-2xl font-bold transition flex items-center justify-center gap-2 text-sm shadow-md ${
                jsonError ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <CheckIcon className="w-4 h-4" />
              <span>تحديث وتطبيق كود JSON</span>
            </button>
          </div>
        )}

        {/* مستورد M3U */}
        {tab === 'm3u_import' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-black text-white">استيراد جماعي للقنوات من ملف M3U</h3>
            
            {parsedChannels.length === 0 ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  انسخ نص ملف الـ M3U الخاص بك (أو بضعة أسطر منه تحتوي على وسوم #EXTINF وروابط القنوات) والصقه أدناه لتحليله واستخراج القنوات منه تلقائياً.
                </p>
                <textarea
                  className="w-full h-64 bg-black/60 font-mono text-xs p-4 rounded-2xl border border-white/10 text-gray-300 leading-relaxed focus:outline-none focus:border-[var(--color-primary-custom)] transition"
                  dir="ltr"
                  placeholder={`#EXTM3U\n#EXTINF:-1 tvg-logo="https://i.imgur.com/LOY0rtp.png" group-title="General",1+1 International\nhttp://example.com/stream.m3u8`}
                  value={m3uText}
                  onChange={e => setM3uText(e.target.value)}
                ></textarea>
                <button
                  onClick={handleParseM3U}
                  className="py-3.5 rounded-2xl bg-[var(--color-primary-custom)] hover:bg-[var(--color-primary-custom)]/80 text-white font-bold transition flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>تحليل النص واستخراج القنوات</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">تم استخراج {parsedChannels.length} قناة صالحة</h4>
                    <p className="text-[11px] text-gray-400 mt-1">تم اختيار {selectedIndices.size} قناة للاستيراد.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSelectAllM3U} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-white font-bold hover:bg-white/10 transition">تحديد الكل</button>
                    <button onClick={handleDeselectAllM3U} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-white font-bold hover:bg-white/10 transition">إلغاء تحديد الكل</button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="بحث في القنوات المفسرة..."
                    className="sport-input pr-10"
                    value={m3uSearch}
                    onChange={e => setM3uSearch(e.target.value)}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    <SearchIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* قائمة القنوات المفسرة للتحديد */}
                <div className="max-h-72 overflow-y-auto border border-white/5 rounded-2xl bg-black/40 p-2 space-y-1.5">
                  {filteredM3UChannels.map((ch, idx) => {
                    const originalIndex = parsedChannels.findIndex(pc => pc.url === ch.url);
                    const isSelected = selectedIndices.has(originalIndex);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleSelectChannel(originalIndex)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition ${
                          isSelected ? 'bg-[var(--color-primary-custom)]/10 border-[var(--color-primary-custom)]/30' : 'bg-transparent border-transparent hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition ${
                          isSelected ? 'bg-[var(--color-primary-custom)] border-[var(--color-primary-custom)] text-white' : 'border-white/20'
                        }`}>
                          {isSelected && <CheckIcon className="w-3.5 h-3.5" />}
                        </div>
                        {ch.logo ? (
                          <img src={ch.logo} alt={ch.name} className="w-8 h-8 object-contain bg-white/5 rounded p-0.5" onError={e => (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23222"/></svg>'} />
                        ) : (
                          <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center text-[10px] font-bold text-gray-400 border border-white/10 shrink-0">TV</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{ch.name}</p>
                          <p className="text-[9px] text-gray-400 truncate" dir="ltr">{ch.url}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleImportM3UChannels}
                    className="flex-1 py-3.5 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold transition flex items-center justify-center gap-2 text-sm shadow-md"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>استيراد القنوات المحددة ({selectedIndices.size})</span>
                  </button>
                  <button
                    onClick={() => {
                      setParsedChannels([]);
                      setM3uText('');
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition text-sm"
                  >
                    إلغاء والبدء من جديد
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* إدارة التصنيفات */}
        {tab === 'categories' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-black text-white mb-4">إدارة تصنيفات القنوات</h3>
              <p className="text-sm text-gray-400 mb-4">أضف تصنيفات لتنظيم قنواتك في مجموعات مع إمكانية إضافة أيقونة لكل تصنيف.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">اسم التصنيف</label>
                  <input
                    type="text"
                    className="sport-input"
                    placeholder="مثال: beIN Sports, أفلام..."
                    id="new-category-name"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">أيقونة التصنيف (رابط صورة أو رفع)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="sport-input text-left flex-1 min-w-0"
                      placeholder="https://... أو ارفع صورة"
                      dir="ltr"
                      id="new-category-icon"
                    />
                    <label className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 flex items-center justify-center cursor-pointer transition shrink-0" title="رفع صورة">
                      {uploadingImg ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <UploadIcon className="w-4 h-4 text-gray-300" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const url = await uploadToImgBB(e.target.files[0]);
                                if (url) {
                                  const iconInput = document.getElementById('new-category-icon') as HTMLInputElement;
                                  if (iconInput) iconInput.value = url;
                                }
                              }
                            }}
                          />
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">التصنيف الأب (اختياري)</label>
                  <select id="new-category-parent" className="sport-input text-gray-300">
                    <option value="">بدون تصنيف أب (تصنيف رئيسي)</option>
                    {(state.categories || []).filter(c => !c.parent).map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  const nameInput = document.getElementById('new-category-name') as HTMLInputElement;
                  const iconInput = document.getElementById('new-category-icon') as HTMLInputElement;
                  const parentInput = document.getElementById('new-category-parent') as HTMLSelectElement;
                  const name = nameInput?.value.trim();
                  const icon = iconInput?.value.trim() || '';
                  const parent = parentInput?.value || undefined;
                  
                  if (!name) { alert('الرجاء إدخال اسم التصنيف.'); return; }
                  if ((state.categories || []).some(c => c.name === name)) {
                    alert('هذا التصنيف موجود بالفعل!');
                    return;
                  }
                  
                  updateState(prev => ({ ...prev, categories: [...(prev.categories || []), { name, icon, parent }] }));
                  nameInput.value = '';
                  iconInput.value = '';
                  if (parentInput) parentInput.value = '';
                }}
                className="w-full py-3.5 rounded-2xl bg-[var(--color-primary-custom)] hover:bg-[var(--color-primary-custom)]/80 text-white font-bold transition flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <PlusIcon className="w-4 h-4" />
                إضافة تصنيف
              </button>
            </div>

            <div className="border-t border-white/5 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h4 className="text-lg font-black text-white">التصنيفات الحالية ({(state.categories || []).length})</h4>
                
                {/* شريط الإجراءات الجماعية */}
                {selectedCategories.size > 0 && (
                  <div className="flex flex-wrap items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-bold text-blue-400">محدد ({selectedCategories.size})</span>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف ${selectedCategories.size} تصنيف؟`)) {
                          updateState(prev => ({
                            ...prev,
                            categories: (prev.categories || []).filter(c => !selectedCategories.has(c.name))
                          }));
                          setSelectedCategories(new Set());
                        }
                      }}
                      className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded-lg text-red-200 font-bold transition"
                    >
                      حذف المحدد
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                  {(state.categories || []).length > 0 && (
                    <button
                      onClick={() => {
                        if (selectedCategories.size === (state.categories || []).length) {
                          setSelectedCategories(new Set());
                        } else {
                          setSelectedCategories(new Set((state.categories || []).map(c => c.name)));
                        }
                      }}
                      className="text-xs bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white font-bold hover:bg-white/10 transition shrink-0"
                    >
                      {selectedCategories.size === (state.categories || []).length ? "إلغاء التحديد" : "تحديد الكل"}
                    </button>
                  )}
                  {(state.categories || []).length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm("هل أنت متأكد من حذف جميع التصنيفات؟!")) {
                          updateState(prev => ({ ...prev, categories: [] }));
                          setSelectedCategories(new Set());
                        }
                      }}
                      className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl font-bold hover:bg-red-500/20 transition shrink-0"
                    >
                      حذف الكل
                    </button>
                  )}
                </div>
              </div>
              {(state.categories || []).length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm font-bold">لا توجد تصنيفات بعد. أضف تصنيفاً جديداً من الأعلى.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(state.categories || []).map((cat, idx) => {
                    const count = state.channels.filter(ch => ch.category === cat.name).length;
                    const countText = count === 0 ? "لا توجد قنوات" : count === 1 ? "قناة واحدة" : count === 2 ? "قناتان" : count >= 3 && count <= 10 ? `${count}  قنوات` : `${count} قناة`;
                    return (
                      <div key={idx} className="glass-card p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-[var(--color-primary-custom)] cursor-pointer shrink-0"
                            checked={selectedCategories.has(cat.name)}
                            onChange={() => {
                              const newSet = new Set(selectedCategories);
                              if (newSet.has(cat.name)) newSet.delete(cat.name);
                              else newSet.add(cat.name);
                              setSelectedCategories(newSet);
                            }}
                          />
                          {cat.icon ? (
                            <img src={cat.icon} alt={cat.name} className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1" />
                          ) : (
                            <span className="text-2xl w-10 h-10 flex items-center justify-center">📂</span>
                          )}
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white block truncate">{cat.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                {cat.parent && (
                                  <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-bold">
                                    تابع لـ: {cat.parent}
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-400">{countText}</span>
                              </div>
                            </div>
                          </div>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف التصنيف "${cat.name}"؟`)) {
                              updateState(prev => ({
                                ...prev,
                                categories: (prev.categories || []).filter(c => c.name !== cat.name)
                              }));
                            }
                          }}
                          className="w-9 h-9 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition shrink-0"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* زر الحفظ السحابي الثابت في الأسفل */}
      <div className="mt-6">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold transition-all shadow-xl shadow-green-600/10 flex items-center justify-center gap-2 border border-green-500/20 text-sm"
        >
          <CloudIcon className={`w-5 h-5 ${syncing ? 'animate-bounce' : ''}`} />
          <span>{syncing ? 'جاري مزامنة وحفظ التعديلات...' : 'مزامنة وحفظ جميع التعديلات للسحابة (Cloud Sync)'}</span>
        </button>
      </div>

    </div>
  );
}
