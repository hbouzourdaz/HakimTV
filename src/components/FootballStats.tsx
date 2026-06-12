"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, AlertCircle, Radio, RefreshCw, ChevronDown, ChevronUp, Clock, Zap, Trophy, Calendar, Medal, Target, Users } from "lucide-react";

const ESPN = "https://site.api.espn.com/apis";

const LEAGUES = [
  { slug: "all", label: "الكل", icon: "⚽" },
  { slug: "fifa.world", label: "كأس العالم", icon: "🌍" },
  { slug: "eng.1", label: "الإنجليزي", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { slug: "esp.1", label: "الإسباني", icon: "🇪🇸" },
  { slug: "ita.1", label: "الإيطالي", icon: "🇮🇹" },
  { slug: "ger.1", label: "الألماني", icon: "🇩🇪" },
  { slug: "fra.1", label: "الفرنسي", icon: "🇫🇷" },
  { slug: "uefa.champions", label: "الأبطال", icon: "⭐" },
  { slug: "uae.1", label: "الإمارات", icon: "🇦🇪" },
  { slug: "ksa.1", label: "السعودية", icon: "🇸🇦" },
  { slug: "mor.1", label: "المغرب", icon: "🇲🇦" },
  { slug: "egy.1", label: "مصر", icon: "🇪🇬" },
  { slug: "tun.1", label: "تونس", icon: "🇹🇳" },
  { slug: "alg.1", label: "الجزائر", icon: "🇩🇿" },
];

const SCORERS_LEAGUES = ["eng.1", "esp.1", "ita.1", "ger.1", "fra.1", "uefa.champions"];

// ─── Interfaces ───────────────────────────────────────────────
interface Competitor {
  id: string;
  homeAway: string;
  score: string;
  winner?: boolean;
  team: { abbreviation: string; displayName: string; shortDisplayName: string; logo: string; color?: string };
  form?: string;
}

interface MatchEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  competitions: {
    id: string;
    status: { clock: number; displayClock: string; type: { id: string; name: string; state: string; completed: boolean; description: string; detail: string; shortDetail: string } };
    competitors: Competitor[];
    venue?: { fullName?: string; address?: { city?: string; country?: string } };
  }[];
}

interface StandingEntry {
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
    logos?: { href: string }[];
    color?: string;
  };
  note?: { color?: string; description?: string; rank?: number };
  stats: { name: string; value?: number; displayValue?: string; abbreviation?: string; summary?: string }[];
}

interface PlayerStat {
  athlete: {
    id: string;
    displayName: string;
    shortName: string;
    jersey?: string;
    headshot?: { href: string };
    team: { id: string; displayName: string; abbreviation: string; logo: string; color?: string };
  };
  value: number;
  displayValue: string;
  statistics?: { name: string; abbreviation: string; displayValue: string; value?: number }[];
}

interface StatCategory {
  name: string;
  displayName: string;
  abbreviation: string;
  leaders: PlayerStat[];
}

// ─── Helpers ──────────────────────────────────────────────────
function getStatusInfo(event: MatchEvent): { text: string; color: string; isLive: boolean } {
  const comp = event.competitions?.[0];
  if (!comp) return { text: "غير معروف", color: "text-gray-400", isLive: false };
  const state = comp.status.type.state;
  if (state === "in") {
    const clock = comp.status.displayClock || `${comp.status.clock}'`;
    return { text: `${comp.status.type.shortDetail} ${clock}`, color: "text-emerald-400", isLive: true };
  }
  if (state === "post") {
    if (comp.status.type.name === "STATUS_POSTPONED") return { text: "مؤجل", color: "text-yellow-400", isLive: false };
    if (comp.status.type.name === "STATUS_CANCELED") return { text: "ملغي", color: "text-red-400", isLive: false };
    return { text: "انتهى", color: "text-gray-400", isLive: false };
  }
  return { text: new Date(event.date).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" }), color: "text-blue-400", isLive: false };
}

function groupByStatus(events: MatchEvent[]) {
  const live: MatchEvent[] = [], scheduled: MatchEvent[] = [], finished: MatchEvent[] = [];
  for (const ev of events) {
    const s = ev.competitions?.[0]?.status?.type?.state;
    if (s === "in") live.push(ev);
    else if (s === "pre") scheduled.push(ev);
    else if (s === "post") finished.push(ev);
  }
  scheduled.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  live.sort((a, b) => (b.competitions?.[0]?.status?.clock || 0) - (a.competitions?.[0]?.status?.clock || 0));
  finished.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { live, scheduled, finished };
}

function getStat(entry: StandingEntry, name: string): number {
  return entry.stats.find(s => s.name === name)?.value ?? 0;
}

function getStatDisplay(entry: StandingEntry, name: string): string {
  return entry.stats.find(s => s.name === name)?.displayValue ?? "0";
}

// ─── MatchCard ────────────────────────────────────────────────
function MatchCard({ event }: { event: MatchEvent }) {
  const [expanded, setExpanded] = useState(false);
  const comp = event.competitions?.[0];
  if (!comp) return null;
  const home = comp.competitors?.find(c => c.homeAway === "home");
  const away = comp.competitors?.find(c => c.homeAway === "away");
  const status = getStatusInfo(event);
  const isLive = status.isLive;

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${isLive ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/10"}`}>
      <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/5 transition" onClick={() => setExpanded(!expanded)}>
        {isLive && <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded animate-pulse shrink-0"><Zap size={8} />مباشر</span>}
        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
          {home?.team?.logo && <img src={home.team.logo} alt="" className="w-7 h-7 object-contain shrink-0" />}
          <span className="text-xs font-bold text-white truncate text-right">{home?.team?.shortDisplayName || "?"}</span>
        </div>
        <div className="flex flex-col items-center min-w-[70px] shrink-0 px-1">
          {comp.status.type.state === "pre" ? (
            <span className="text-sm font-black text-blue-400">{new Date(event.date).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}</span>
          ) : (
            <span className="text-lg font-black text-white">{home?.score || "0"} - {away?.score || "0"}</span>
          )}
          <span className={`text-[9px] font-bold ${status.color}`}>{status.text}</span>
        </div>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-white truncate">{away?.team?.shortDisplayName || "?"}</span>
          {away?.team?.logo && <img src={away.team.logo} alt="" className="w-7 h-7 object-contain shrink-0" />}
        </div>
        {expanded ? <ChevronUp size={12} className="text-gray-400 shrink-0" /> : <ChevronDown size={12} className="text-gray-400 shrink-0" />}
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-white/5 pt-2">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div><p className="text-gray-500 font-bold mb-0.5">التاريخ</p><p className="text-white font-bold">{new Date(event.date).toLocaleDateString("ar", { weekday: "short", month: "short", day: "numeric" })}</p></div>
            <div><p className="text-gray-500 font-bold mb-0.5">البطولة</p><p className="text-white font-bold">{event.name}</p></div>
            {comp.venue?.fullName && <div className="col-span-2"><p className="text-gray-500 font-bold mb-0.5">المكان</p><p className="text-white font-bold">{comp.venue.fullName}</p></div>}
            {home?.form && <div><p className="text-gray-500 font-bold mb-0.5">الأخيرة ({home.team.abbreviation})</p><div className="flex gap-0.5">{home.form.split("").slice(-5).map((f, i) => <span key={i} className={`w-4 h-4 rounded text-[8px] font-black flex items-center justify-center ${f === "W" ? "bg-emerald-600" : f === "D" ? "bg-yellow-600" : "bg-red-600"} text-white`}>{f}</span>)}</div></div>}
            {away?.form && <div><p className="text-gray-500 font-bold mb-0.5">الأخيرة ({away.team.abbreviation})</p><div className="flex gap-0.5">{away.form.split("").slice(-5).map((f, i) => <span key={i} className={`w-4 h-4 rounded text-[8px] font-black flex items-center justify-center ${f === "W" ? "bg-emerald-600" : f === "D" ? "bg-yellow-600" : "bg-red-600"} text-white`}>{f}</span>)}</div></div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Standings Table ──────────────────────────────────────────
function StandingsTable({ entries, isWorldCup = false }: { entries: StandingEntry[]; isWorldCup?: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const display = isWorldCup ? entries : (showAll ? entries : entries.slice(0, 10));

  const getQualColor = (idx: number) => {
    if (isWorldCup) {
      // World Cup: top 2 advance
      if (idx < 2) return "border-r-emerald-500";
      if (idx === 2) return "border-r-yellow-500";
      return "border-r-red-500";
    }
    // Regular league
    if (idx < 4) return "border-r-emerald-500";
    if (idx === 4) return "border-r-blue-500";
    if (idx >= entries.length - 3) return "border-r-red-500";
    return "";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="text-gray-400 font-bold border-b border-white/10">
            <th className="text-right py-2 px-1.5 w-6">#</th>
            <th className="text-right py-2 px-1.5">الفريق</th>
            <th className="text-center py-2 px-1">ل</th>
            <th className="text-center py-2 px-1">ف</th>
            <th className="text-center py-2 px-1">ت</th>
            <th className="text-center py-2 px-1">خ</th>
            <th className="text-center py-2 px-1">ن</th>
            <th className="text-center py-2 px-1">+/-</th>
            <th className="text-center py-2 px-1.5 font-black text-white">نق</th>
          </tr>
        </thead>
        <tbody>
          {display.map((entry, idx) => {
            const gp = getStat(entry, "gamesPlayed");
            const w = getStat(entry, "wins");
            const d = getStat(entry, "ties");
            const l = getStat(entry, "losses");
            const gf = getStat(entry, "pointsFor");
            const ga = getStat(entry, "pointsAgainst");
            const gd = getStat(entry, "pointDifferential");
            const pts = getStat(entry, "points");
            const rank = getStat(entry, "rank");
            const logo = entry.team.logos?.[0]?.href;

            return (
              <tr key={entry.team.id} className={`border-b border-white/5 hover:bg-white/5 transition border-r-2 ${getQualColor(idx)}`}>
                <td className="py-2 px-1.5 text-gray-400 font-bold text-center">{rank || idx + 1}</td>
                <td className="py-2 px-1.5">
                  <div className="flex items-center gap-1.5">
                    {logo && <img src={logo} alt="" className="w-5 h-5 object-contain shrink-0" />}
                    <span className="text-white font-bold truncate max-w-[100px]">{entry.team.shortDisplayName || entry.team.displayName}</span>
                  </div>
                </td>
                <td className="py-2 px-1 text-center text-gray-400">{gp}</td>
                <td className="py-2 px-1 text-center text-emerald-400 font-bold">{w}</td>
                <td className="py-2 px-1 text-center text-yellow-400">{d}</td>
                <td className="py-2 px-1 text-center text-red-400">{l}</td>
                <td className="py-2 px-1 text-center text-gray-400">{gf}:{ga}</td>
                <td className="py-2 px-1 text-center text-gray-400">{gd > 0 ? "+" : ""}{gd}</td>
                <td className="py-2 px-1.5 text-center font-black text-white text-xs">{pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!isWorldCup && entries.length > 10 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full py-2.5 text-center text-xs font-bold text-[var(--color-primary-custom)] hover:bg-white/5 transition rounded-b-xl">
          {showAll ? "عرض أقل" : `عرض جميع الفرق (${entries.length})`}
        </button>
      )}
      <div className="flex gap-4 mt-3 px-2 flex-wrap">
        {isWorldCup ? (
          <>
            <span className="flex items-center gap-1 text-[9px] text-gray-500"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>يتأهل</span>
            <span className="flex items-center gap-1 text-[9px] text-gray-500"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> THIRD</span>
            <span className="flex items-center gap-1 text-[9px] text-gray-500"><span className="w-2 h-2 rounded-full bg-red-500"></span>يُقصى</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1 text-[9px] text-gray-500"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>دوري الأبطال</span>
            <span className="flex items-center gap-1 text-[9px] text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-500"></span>الدوري الأوروبي</span>
            <span className="flex items-center gap-1 text-[9px] text-gray-500"><span className="w-2 h-2 rounded-full bg-red-500"></span>الهبوط</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Player List ──────────────────────────────────────────────
function PlayerList({ players, statLabel }: { players: PlayerStat[]; statLabel: string }) {
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? players : players.slice(0, 15);

  return (
    <div className="flex flex-col gap-2">
      {display.map((p, i) => {
        const appearances = p.statistics?.find(s => s.abbreviation === "APP")?.displayValue || "0";
        const goals = p.statistics?.find(s => s.abbreviation === "G")?.displayValue || "0";
        const assists = p.statistics?.find(s => s.abbreviation === "A")?.displayValue || "0";

        return (
          <div key={`${p.athlete.id}-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <span className="text-sm font-black text-gray-500 w-6 text-center shrink-0">{i + 1}</span>
            {p.athlete.headshot?.href ? (
              <img src={p.athlete.headshot.href} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 bg-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0 border border-white/10">#{p.athlete.jersey || "?"}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{p.athlete.displayName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {p.athlete.team && (
                  <span className="flex items-center gap-1 text-[9px] text-gray-500">
                    {p.athlete.team.logo && <img src={p.athlete.team.logo} alt="" className="w-3 h-3 object-contain" />}
                    {p.athlete.team.abbreviation || p.athlete.team.displayName}
                  </span>
                )}
                <span className="text-[9px] text-gray-600">{appearances} مباراة</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {statLabel === "goals" ? (
                <div className="text-center">
                  <p className="text-yellow-400 text-sm font-black">{goals}</p>
                  <p className="text-gray-600 text-[8px] font-bold">هدف</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-blue-400 text-sm font-black">{assists}</p>
                  <p className="text-gray-600 text-[8px] font-bold">تمريرة</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-gray-400 text-[10px] font-bold">{p.displayValue}</p>
              </div>
            </div>
          </div>
        );
      })}
      {players.length > 15 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full py-2.5 text-center text-xs font-bold text-[var(--color-primary-custom)] hover:bg-white/5 transition rounded-xl border border-white/10">
          {showAll ? "عرض أقل" : `عرض جميع اللاعبين (${players.length})`}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function FootballStats() {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [groups, setGroups] = useState<{ name: string; entries: StandingEntry[] }[]>([]);
  const [scorers, setScorers] = useState<PlayerStat[]>([]);
  const [assists, setAssists] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLeague, setActiveLeague] = useState("eng.1");
  const [tab, setTab] = useState<"matches" | "standings" | "scorers" | "assists">("matches");
  const [subTab, setSubTab] = useState<"live" | "scheduled" | "finished">("live");
  const [activeGroup, setActiveGroup] = useState(0);
  const refreshRef = useRef<NodeJS.Timeout | null>(null);

  const isWorldCup = activeLeague === "fifa.world";

  const fetchAll = useCallback(async (league: string) => {
    setLoading(true);
    setError(null);
    try {
      const scoreboardUrl = league === "all" ? `${ESPN}/site/v2/sports/soccer/all/scoreboard` : `${ESPN}/site/v2/sports/soccer/${league}/scoreboard`;
      const standingsUrl = league === "all" ? null : `${ESPN}/v2/sports/soccer/${league}/standings`;
      const statsUrl = (league === "all" || !SCORERS_LEAGUES.includes(league)) ? null : `${ESPN}/site/v2/sports/soccer/${league}/statistics`;

      const promises = [
        fetch(scoreboardUrl).then(r => r.ok ? r.json() : null),
        standingsUrl ? fetch(standingsUrl).then(r => r.ok ? r.json() : null) : Promise.resolve(null),
        statsUrl ? fetch(statsUrl).then(r => r.ok ? r.json() : null) : Promise.resolve(null),
      ];

      const [scoreData, standingsData, statsData] = await Promise.all(promises);

      setEvents(scoreData?.events || []);

      // Handle groups (World Cup) vs single table (leagues)
      if (standingsData?.children && standingsData.children.length > 1) {
        // World Cup or tournament with groups
        const groupsData = standingsData.children.map((child: any) => ({
          name: child.name,
          entries: child.standings?.entries || [],
        }));
        setGroups(groupsData);
        setStandings([]);
      } else if (standingsData?.children?.[0]?.standings?.entries) {
        // Single table league
        setStandings(standingsData.children[0].standings.entries);
        setGroups([]);
      } else {
        setStandings([]);
        setGroups([]);
      }

      if (statsData?.stats) {
        const goalsCat = statsData.stats.find((s: StatCategory) => s.abbreviation === "G");
        const assistsCat = statsData.stats.find((s: StatCategory) => s.abbreviation === "A");
        setScorers(goalsCat?.leaders || []);
        setAssists(assistsCat?.leaders || []);
      } else {
        setScorers([]);
        setAssists([]);
      }

      setError(null);
    } catch (e: any) {
      setError(e.message || "خطأ في تحميل البيانات");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll(activeLeague);
    setActiveGroup(0);
  }, [activeLeague, fetchAll]);

  useEffect(() => {
    const hasLive = events.some(e => e.competitions?.[0]?.status?.type?.state === "in");
    if (hasLive) refreshRef.current = setInterval(() => fetchAll(activeLeague), 60000);
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [events, activeLeague, fetchAll]);

  const { live, scheduled, finished } = groupByStatus(events);
  const currentEvents = subTab === "live" ? live : subTab === "scheduled" ? scheduled : finished;

  const mainTabs = [
    { key: "matches" as const, label: "المباريات", icon: <Radio size={12} /> },
    { key: "standings" as const, label: "الترتيب", icon: <Trophy size={12} /> },
    { key: "scorers" as const, label: "الهدافون", icon: <Target size={12} /> },
    { key: "assists" as const, label: "الممررون", icon: <Users size={12} /> },
  ];

  const matchTabs = [
    { key: "live" as const, label: "مباشر", count: live.length },
    { key: "scheduled" as const, label: "القادمة", count: scheduled.length },
    { key: "finished" as const, label: "انتهت", count: finished.length },
  ];

  return (
    <div className="view-section active px-4 lg:px-10 py-6 h-full w-full pb-20 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Medal size={28} className="text-yellow-500" />
          كرة القدم
        </h2>
        <div className="flex items-center gap-2">
          {live.length > 0 && tab === "matches" && (
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-lg animate-pulse">
              <Zap size={10} />{live.length} مباشر
            </span>
          )}
          <button onClick={() => fetchAll(activeLeague)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {LEAGUES.map(l => (
          <button key={l.slug} onClick={() => setActiveLeague(l.slug)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all border whitespace-nowrap shrink-0 ${activeLeague === l.slug ? "bg-[var(--color-primary-custom)] text-white border-transparent shadow-lg" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"}`}>
            <span>{l.icon}</span><span>{l.label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {mainTabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${tab === t.key ? "bg-[var(--color-primary-custom)] text-white border-[var(--color-primary-custom)]" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "matches" && (
        <div className="flex gap-2 mb-4">
          {matchTabs.map(t => (
            <button key={t.key} onClick={() => setSubTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${subTab === t.key ? "bg-white/15 text-white border-white/20" : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"}`}>
              {t.label}
              {t.count > 0 && <span className={`text-[8px] px-1 py-0.5 rounded-full font-black ${subTab === t.key ? "bg-white/20" : "bg-white/10"}`}>{t.count}</span>}
            </button>
          ))}
        </div>
      )}

      {/* World Cup Groups Tabs */}
      {tab === "standings" && isWorldCup && groups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {groups.map((g, idx) => (
            <button key={g.name} onClick={() => setActiveGroup(idx)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap shrink-0 ${
                activeGroup === idx
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
              }`}>
              <Trophy size={12} />
              {g.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-[var(--color-primary-custom)] mb-4" />
          <span className="text-gray-400 font-bold">جاري تحميل البيانات...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card p-8 max-w-lg mx-auto">
          <AlertCircle size={32} className="text-red-400 mb-2" />
          <p className="text-red-300 text-sm font-bold">{error}</p>
          <button onClick={() => fetchAll(activeLeague)} className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary-custom)] text-white text-xs font-bold">إعادة المحاولة</button>
        </div>
      ) : (
        <>
          {tab === "matches" && (
            currentEvents.length === 0 ? (
              <div className="text-center py-16"><Calendar size={48} className="mx-auto text-gray-600 mb-3" /><p className="text-gray-400 font-bold">{subTab === "live" ? "لا توجد مباريات مباشرة" : subTab === "scheduled" ? "لا توجد مباريات قادمة" : "لا توجد مباريات انتهت"}</p></div>
            ) : <div className="flex flex-col gap-2">{currentEvents.map(ev => <MatchCard key={ev.id} event={ev} />)}</div>
          )}

          {tab === "standings" && (
            isWorldCup ? (
              groups.length === 0 ? (
                <div className="text-center py-16"><Trophy size={48} className="mx-auto text-gray-600 mb-3" /><p className="text-gray-400 font-bold">الترتيب غير متاح</p></div>
              ) : (
                <div>
                  <div className="mb-3 text-center">
                    <span className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
                      {groups[activeGroup]?.name} — أول فريقين يتأهلان
                    </span>
                  </div>
                  <StandingsTable entries={groups[activeGroup]?.entries || []} isWorldCup />
                </div>
              )
            ) : (
              standings.length === 0 ? (
                <div className="text-center py-16"><Trophy size={48} className="mx-auto text-gray-600 mb-3" /><p className="text-gray-400 font-bold">الترتيب غير متاح لهذا الدوري</p></div>
              ) : <StandingsTable entries={standings} />
            )
          )}

          {tab === "scorers" && (
            scorers.length === 0 ? (
              <div className="text-center py-16"><Target size={48} className="mx-auto text-gray-600 mb-3" /><p className="text-gray-400 font-bold">إحصائيات الهدافين غير متاحة لهذا الدوري</p></div>
            ) : <PlayerList players={scorers} statLabel="goals" />
          )}

          {tab === "assists" && (
            assists.length === 0 ? (
              <div className="text-center py-16"><Users size={48} className="mx-auto text-gray-600 mb-3" /><p className="text-gray-400 font-bold">إحصائيات الممررين غير متاحة لهذا الدوري</p></div>
            ) : <PlayerList players={assists} statLabel="assists" />
          )}
        </>
      )}

      <div className="mt-6 text-center">
        <p className="text-[10px] text-gray-600 font-bold">
          Powered by <a href="https://www.espn.com" target="_blank" rel="noopener" className="text-[var(--color-primary-custom)] hover:underline">ESPN</a>
        </p>
      </div>
    </div>
  );
}
