let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

export const suspendAudio = () => {
  try {
    if (sharedAudioCtx && sharedAudioCtx.state === 'running') {
      sharedAudioCtx.suspend().catch(() => {});
    }
  } catch {}
};

export const resumeAudio = () => {
  try {
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
  } catch {}
};

export const playSound = (type: 'swap' | 'match' | 'win' | 'lose' | 'click' | 'booster', enabled: boolean) => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      case 'swap':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(500, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'match':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'win':
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        osc.frequency.setValueAtTime(800, now + 0.2);
        osc.frequency.setValueAtTime(1200, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      case 'lose':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'booster':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
    }
  } catch (err) {
    // Safe catch
  }
};

/**
 * Dynamic combo chime: Plays a higher pitch for each increasing multiplier level during the combo window.
 */
export const playComboChime = (
  matchCount: number,
  comboMultiplierOrEnabled: number | boolean = 1,
  maybeEnabled: boolean = true
) => {
  let comboMultiplier = 1;
  let enabled = true;

  if (typeof comboMultiplierOrEnabled === 'boolean') {
    enabled = comboMultiplierOrEnabled;
    comboMultiplier = 1;
  } else {
    comboMultiplier = comboMultiplierOrEnabled;
    enabled = maybeEnabled;
  }

  if (!enabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Pitch increases dynamically for each increasing multiplier level during the combo window
    // Level 1: x1 (root scale ~540Hz)
    // Level 2: x2 (+2.6 semitones, ~625Hz)
    // Level 3: x3 (+5.2 semitones, ~725Hz)
    // Level 4: x4 (+7.8 semitones, ~840Hz)
    // Level 5: x5 (+10.4 semitones, ~970Hz)
    // Level 6+: increasingly radiant high celestial registers
    const multiplierLevel = Math.max(1, Math.floor(comboMultiplier));
    const multiplierPitchFactor = Math.pow(1.155, multiplierLevel - 1);

    // Extra harmonic brightness for 4-match and 5-match
    const matchBonus = matchCount >= 5 ? 1.25 : matchCount === 4 ? 1.12 : 1.0;

    const baseFreq = 540 * multiplierPitchFactor * matchBonus;

    // Dynamic arpeggio note intervals
    // For x1 & x2: 3-note ascending major triad
    // For x3 & x4: 4-note ascending chord with sparkle
    // For x5+: 5-note lightning arpeggio with high harmonic bell
    const intervals = multiplierLevel >= 5
      ? [1, 1.25, 1.5, 1.75, 2.0]
      : multiplierLevel >= 3
      ? [1, 1.25, 1.5, 1.8]
      : [1, 1.25, 1.5];

    intervals.forEach((ratio, idx) => {
      const delay = idx * (multiplierLevel >= 4 ? 0.045 : 0.06);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = idx % 2 === 1 ? 'triangle' : 'sine';
      const freq = baseFreq * ratio;
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * (1.18 + multiplierLevel * 0.03), now + delay + 0.14);

      const vol = Math.min(0.14, 0.07 + multiplierLevel * 0.012);
      gain.gain.setValueAtTime(vol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

      osc.start(now + delay);
      osc.stop(now + delay + 0.18);
    });

    // For combo multiplier >= 3, add high crystalline shimmer harmonic
    if (multiplierLevel >= 3) {
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);

      shimmerOsc.type = 'sine';
      const shimmerFreq = baseFreq * 2.4;
      shimmerOsc.frequency.setValueAtTime(shimmerFreq, now + 0.06);
      shimmerOsc.frequency.exponentialRampToValueAtTime(shimmerFreq * 1.35, now + 0.25);

      shimmerGain.gain.setValueAtTime(0.045, now + 0.06);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.28);

      shimmerOsc.start(now + 0.06);
      shimmerOsc.stop(now + 0.28);
    }
  } catch (err) {
    // Safe catch
  }
};

/**
 * Grand finish sound played when a high combo sequence ends after the combo window.
 */
export const playComboFinishSound = (finalMultiplier: number = 2, enabled: boolean = true) => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const multiplier = Math.max(2, Math.floor(finalMultiplier));
    const isEpic = multiplier >= 4;

    // 1. Ascending harp / chime fanfare flourish
    // A radiant pentatonic/major arpeggio: C5, E5, G5, B5, C6 (plus E6, G6 if epic)
    const arpeggioFreqs = isEpic
      ? [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98]
      : [523.25, 659.25, 783.99, 1046.50, 1318.51];

    arpeggioFreqs.forEach((freq, idx) => {
      const delay = idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + delay + 0.2);

      const vol = isEpic ? 0.08 : 0.065;
      gain.gain.setValueAtTime(vol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.24);

      osc.start(now + delay);
      osc.stop(now + delay + 0.24);
    });

    // 2. Grand resolving triumphal chord
    const chordStartTime = now + (arpeggioFreqs.length - 1) * 0.045;
    const chordDuration = isEpic ? 1.4 : 1.0;

    // Rich resonant chord: warm bass C3, C4, G4, C5, E5, G5, and high shimmer
    const chordTones = [
      { freq: 130.81, type: 'triangle' as OscillatorType, vol: 0.11 }, // Warm foundational C3
      { freq: 261.63, type: 'sine' as OscillatorType, vol: 0.09 },     // C4
      { freq: 392.00, type: 'triangle' as OscillatorType, vol: 0.08 }, // G4
      { freq: 523.25, type: 'sine' as OscillatorType, vol: 0.09 },     // C5
      { freq: 659.25, type: 'sine' as OscillatorType, vol: 0.08 },     // E5
      { freq: 1046.50, type: 'sine' as OscillatorType, vol: 0.06 },    // C6
    ];

    chordTones.forEach(({ freq, type, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, chordStartTime);
      osc.frequency.linearRampToValueAtTime(freq * 1.003, chordStartTime + chordDuration);

      const finalVol = isEpic ? vol * 1.25 : vol;
      gain.gain.setValueAtTime(finalVol, chordStartTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, chordStartTime + chordDuration);

      osc.start(chordStartTime);
      osc.stop(chordStartTime + chordDuration);
    });

    // 3. Shimmering celestial golden sparkle tail for higher multiplier finishes
    const sparkleCount = isEpic ? 4 : 2;
    for (let i = 0; i < sparkleCount; i++) {
      const sparkleTime = chordStartTime + 0.06 + i * 0.09;
      const sOsc = ctx.createOscillator();
      const sGain = ctx.createGain();
      sOsc.connect(sGain);
      sGain.connect(ctx.destination);

      sOsc.type = 'sine';
      const sFreq = 1567.98 * (1 + i * 0.28);
      sOsc.frequency.setValueAtTime(sFreq, sparkleTime);
      sOsc.frequency.exponentialRampToValueAtTime(sFreq * 1.25, sparkleTime + 0.35);

      sGain.gain.setValueAtTime(0.045, sparkleTime);
      sGain.gain.exponentialRampToValueAtTime(0.0005, sparkleTime + 0.38);

      sOsc.start(sparkleTime);
      sOsc.stop(sparkleTime + 0.38);
    }
  } catch (err) {
    // Safe catch
  }
};

