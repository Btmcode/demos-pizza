"use client";

import * as React from "react";

/**
 * Sipariş ses bildirimi hook'u
 * - Polling ile yeni sipariş kontrol eder
 * - Yeni sipariş geldiğinde ses çalar
 * - Seçilen ses tipini localStorage'da saklar
 */

const SOUND_TYPES = {
  bell: { label: "Çan", freq: 880, duration: 0.3, repeat: 2 },
  ding: { label: "Ding", freq: 1200, duration: 0.15, repeat: 1 },
  alarm: { label: "Alarm", freq: 660, duration: 0.2, repeat: 4 },
  chime: { label: "Melodi", freq: 988, duration: 0.2, repeat: 3 },
  classic: { label: "Klasik", freq: 740, duration: 0.4, repeat: 2 },
} as const;

export type SoundType = keyof typeof SOUND_TYPES;

export function useOrderSound() {
  const [lastOrderCount, setLastOrderCount] = React.useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [soundType, setSoundType] = React.useState<SoundType>("bell");

  // Load settings
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

  // Save settings
  const saveSettings = (enabled: boolean, type: SoundType) => {
    setSoundEnabled(enabled);
    setSoundType(type);
    localStorage.setItem("demos-order-sound", JSON.stringify({ enabled, type }));
  };

  // Play sound using Web Audio API
  const playSound = React.useCallback((type: SoundType = soundType) => {
    const config = SOUND_TYPES[type];
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (delay: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = config.freq;
        osc.type = "sine";
        const startTime = ctx.currentTime + delay;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + config.duration);
        osc.start(startTime);
        osc.stop(startTime + config.duration);
      };
      for (let i = 0; i < config.repeat; i++) {
        playTone(i * (config.duration + 0.1));
      }
    } catch (e) {
      // AudioContext not available
    }
  }, [soundType]);

  // Check for new orders
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
