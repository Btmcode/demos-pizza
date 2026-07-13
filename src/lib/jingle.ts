"use client";

import * as React from "react";

/**
 * Demos Pizza Jingle — Web Audio API ile üretilen enerjik jingle
 * 30 yaşlarında bayan sesi efekti (yüksek frekanslı tonlar)
 * Sipariş başarılı olduğunda çalar
 */
export function playOrderJingle() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    // Jingle melodisi — Demos Pizza! (enerjik, pozitif)
    // C5 → E5 → G5 → C6 → G5 → C6 (yükselen enerjik motif)
    const notes = [
      { freq: 523.25, start: 0, dur: 0.12 },    // C5
      { freq: 659.25, start: 0.12, dur: 0.12 },  // E5
      { freq: 783.99, start: 0.24, dur: 0.12 },  // G5
      { freq: 1046.50, start: 0.36, dur: 0.15 }, // C6
      { freq: 783.99, start: 0.51, dur: 0.1 },   // G5
      { freq: 1046.50, start: 0.61, dur: 0.1 },  // C6
      { freq: 1318.51, start: 0.71, dur: 0.3 },  // E6 (final, yüksek)
    ];

    // Bayan sesi efekti: sine + triangle karışımı, yüksek harmonics
    for (const note of notes) {
      // Ana ton (sine — yumuşak bayan sesi)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.value = note.freq;
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      const startTime = now + note.start;
      gain1.gain.setValueAtTime(0, startTime);
      gain1.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);
      osc1.start(startTime);
      osc1.stop(startTime + note.dur);

      // Harmonik (triangle — parlaklık)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.value = note.freq * 2;
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(0.08, startTime + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);
      osc2.start(startTime);
      osc2.stop(startTime + note.dur);
    }

    // Cleanup
    setTimeout(() => ctx.close(), 1500);
  } catch (e) {
    // AudioContext not available
  }
}
