"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const JSON_BIN_ID = "6a2a2c3df5f4af5e29dc6d08";
const JSON_API_KEY = "$2a$10$2.qnwRQfkI8MtHWCv4hS2.tV7V2H1Z62sMA.7mFGp0A24x3ptEJp2";
const JSON_API_URL = `https://api.jsonbin.io/v3/b/${JSON_BIN_ID}`;

export type Channel = {
  id: number;
  name: string;
  url: string;
  logo: string;
  category?: string;
};

export type Match = {
  id: number;
  team1: { name: string; logo: string };
  team2: { name: string; logo: string };
  time: string;
  channel: string;
  commentator?: string;
  league?: string;
};

export type StremioAddon = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
};

export type AppState = {
  settings: {
    appName: string;
    primaryColor: string;
    telegramUrl: string;
    facebookUrl: string;
    imgbbApiKey?: string;
    appBackground?: string;
    marqueeText?: string;
    adminUsername?: string;
    adminPassword?: string;
    hiddenTabs?: string[];
    hiddenSections?: string[];
    sectionLabels?: { [key: string]: string };
  };
  channels: Channel[];
  matches: Match[];
  categories: { name: string; icon: string; parent?: string }[];
  stremioAddons: StremioAddon[];
};

type AppContextType = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  syncToCloud: () => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
};

const defaultState: AppState = {
  settings: {
    appName: "Hakim TV",
    primaryColor: "#5E227F",
    telegramUrl: "",
    facebookUrl: "",
    imgbbApiKey: "",
    appBackground: "",
    marqueeText: "",
    adminUsername: "admin",
    adminPassword: "123",
  },
  channels: [],
  matches: [],
  categories: [],
  stremioAddons: [
    { id: '1', name: 'StreamAR (عربي مجاني)', url: 'https://2ecbbd610840-stremio-ar.baby-beamup.club/manifest.json', enabled: true },
    { id: '2', name: 'Akwam (عربي مجاني)', url: 'https://stremio-addons.net/addons/community.aymene69.akwam/manifest.json', enabled: true },
    { id: '3', name: 'Arabic Subs (ترجمة عربية)', url: 'https://dni798-arabic-subs-addon.hf.space/manifest.json', enabled: true },
    { id: '4', name: 'Cinemata (كتالوج)', url: 'https://cinemeta-catalogs.strem.io/manifest.json', enabled: true },
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStateFromCloud();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary-custom", state.settings.primaryColor);
  }, [state.settings.primaryColor]);

  const fetchStateFromCloud = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${JSON_API_URL}/latest`, {
        headers: { "X-Master-Key": JSON_API_KEY },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.record && data.record.settings) {
          const mergedState = { ...defaultState, ...data.record, stremioAddons: (data.record.stremioAddons && data.record.stremioAddons.length > 0) ? data.record.stremioAddons : defaultState.stremioAddons };
          setState(mergedState);
          localStorage.setItem("iptv_state_backup", JSON.stringify(mergedState));
        } else if (data.record && data.record.matches) {
          setState((prev) => ({ ...prev, matches: data.record.matches }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch cloud data", error);
      const backup = localStorage.getItem("iptv_state_backup");
      if (backup) {
        const backupData = JSON.parse(backup);
        setState({ ...defaultState, ...backupData, stremioAddons: (backupData.stremioAddons && backupData.stremioAddons.length > 0) ? backupData.stremioAddons : defaultState.stremioAddons });
      }
    }
    setLoading(false);
  };

  const syncToCloud = async () => {
    try {
      const response = await fetch(JSON_API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSON_API_KEY,
        },
        body: JSON.stringify(state),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("JSONBin error response:", errorText);
        let message = `Server error ${response.status}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.message) message = parsed.message;
        } catch (_) {}
        throw new Error(message);
      }
      localStorage.setItem("iptv_state_backup", JSON.stringify(state));
      return { success: true };
    } catch (error: any) {
      console.error(error);
      return { success: false, error: error.message || String(error) };
    }
  };

  return (
    <AppContext.Provider value={{ state, setState, syncToCloud, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
