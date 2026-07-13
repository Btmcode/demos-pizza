"use client";

import * as React from "react";

/**
 * Sipariş ses bildirimi — premium, yüksek sesli
 * Web Audio API ile multi-tone melodi çalar
 */

const SOUND_TYPES = {
  bell: {
    label: "Restoran Çanı",
    notes: [{ freq: 880, dur: 0.15 }, { freq: 1320, dur: 0.3 }],
    volume: 0.4,
  },
  ding: {
    label: "Premium Ding",
    notes: [{ freq: 1568, dur: 0.08 }, { freq: 2093, dur: 0.15 }, { freq: 2637, dur: 0.25 }],
    volume: 0.35,
  },
  alarm: {
    label: "Acil Sipariş",
    notes: [
      { freq: 1000, dur: 0.1 }, { freq: 1000, dur: 0.1 },
      { freq: 1000, dur: 0.1 }, { freq: 1500, dur: 0.2 },
    ],
    volume: 0.45,
  },
  chime: {
    label: "Melodi",
    notes: [
      { freq: 659, dur: 0.12 }, { freq: 784, dur: 0.12 },
      { freq: 988, dur: 0.12 }, { freq: 1319, dur: 0.3 },
    ],
    volume: 0.4,
  },
  classic: {
    label: "Klasik Zil",
    notes: [{ freq: 740, dur: 0.15 }, { freq: 740, dur: 0.15 }, { freq: 1108, dur: 0.35 }],
    volume: 0.4,
  },
  cash: {
    label: "Kasa Sesi",
    notes: [{ freq: 2500, dur: 0.05 }, { freq: 2000, dur: 0.05 }, { freq: 1500, dur: 0.1 }],
    volume: 0.35,
  },
  trumpet: {
    label: "Fanfar",
    notes: [
      { freq: 392, dur: 0.12 }, { freq: 523, dur: 0.12 },
      { freq: 659, dur: 0.12 }, { freq: 784, dur: 0.4 },
    ],
    volume: 0.45,
  },
} as const;

export type SoundType = keyof typeof SOUND_TYPES;

export function useOrderSound() {
  const [lastOrderCount, setLastOrderCount] = React.useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [soundType, setSoundType] = React.useState<SoundType>("bell");

  React.useEffect(() => {
    const saved = localStorage.getItem("demos-order-sound");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSoundEnabled(parsed.enabled ?? true);
        setSoundType(parsed.type ?? "bell");
      } catch {}
    }
  }, []);

  const saveSettings = (enabled: boolean, type: SoundType) => {
    setSoundEnabled(enabled);
    setSoundType(type);
    localStorage.setItem("demos-order-sound", JSON.stringify({ enabled, type }));
  };

  const playSound = React.useCallback((type: SoundType = soundType) => {
    const config = SOUND_TYPES[type];
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      let delay = 0;

      for (const note of config.notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = note.freq;
        osc.type = "sine";
        const startTime = ctx.currentTime + delay;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(config.volume, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);
        osc.start(startTime);
        osc.stop(startTime + note.dur);
        delay += note.dur * 0.9;
      }

      // Cleanup
      setTimeout(() => ctx.close(), (delay + 0.5) * 1000);
    } catch (e) {
      // AudioContext not available
    }
  }, [soundType]);

  const checkNewOrders = React.useCallback(async (currentCount: number) => {
    if (lastOrderCount === null) {
      setLastOrderCount(currentCount);
      return;
    }
    if (currentCount > lastOrderCount && soundEnabled) {
      playSound();
    }
    setLastOrderCount(currentCount);
  }, [lastOrderCount, soundEnabled, playSound]);

  return {
    soundEnabled,
    soundType,
    saveSettings,
    playSound,
    checkNewOrders,
    soundOptions: Object.entries(SOUND_TYPES).map(([key, val]) => ({
      key: key as SoundType,
      label: val.label,
    })),
  };
}
