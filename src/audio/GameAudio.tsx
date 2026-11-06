import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlaylist } from 'expo-audio';

type Effect = 'click' | 'correct' | 'wrong' | 'pickup' | 'complete';
type AudioSettings = { music: boolean; effects: boolean };
type AudioContextValue = AudioSettings & { setMusic: (enabled: boolean) => void; setEffects: (enabled: boolean) => void; playEffect: (effect: Effect) => void; error: boolean };
const Context = createContext<AudioContextValue | null>(null);
const KEY = 'planet-cleaner.audio.v1';

export function GameAudioProvider({ children, musicActive }: { children: ReactNode; musicActive: boolean }) {
  const musicPlayer = useAudioPlaylist({ sources: [require('../../assets/audio/menu-music.mp3'), require('../../assets/audio/music-overworld.mp3'), require('../../assets/audio/music-happy-menu.mp3'), require('../../assets/audio/music-wisdom.mp3'), require('../../assets/audio/music-swing.mp3')], loop: 'all' });
  const click = useAudioPlayer(require('../../assets/audio/click.wav'));
  const correct = useAudioPlayer(require('../../assets/audio/correct-confirmation.wav'));
  const pickup = useAudioPlayer(require('../../assets/audio/pickup.wav'));
  const complete = useAudioPlayer(require('../../assets/audio/complete.wav'));
  const wrong = useAudioPlayer(require('../../assets/audio/wrong.wav'));
  const [settings, setSettings] = useState<AudioSettings>({music:true, effects:true});
  const settingsRef = useRef(settings);
  const [loaded, setLoaded] = useState(false); const [error, setError] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const queue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) { const data = JSON.parse(raw); if (alive) { const restored = {music: typeof data.music === 'boolean' ? data.music : true, effects: typeof data.effects === 'boolean' ? data.effects : true}; settingsRef.current = restored; setSettings(restored); } }
        await setAudioModeAsync({ interruptionMode: 'mixWithOthers', shouldPlayInBackground: false });
      } catch { if (alive) setError(true); }
      finally { if (alive) setLoaded(true); }
    })();
    return () => { alive = false; };
  }, []);
  useEffect(() => { const sub = AppState.addEventListener('change', state => setActive(state === 'active')); return () => sub.remove(); }, []);
  useEffect(() => {
    musicPlayer.volume = 0.5;
    try { if (loaded && settings.music && musicActive && active) musicPlayer.play(); else musicPlayer.pause(); }
    catch { setError(true); }
    return () => { musicPlayer.pause(); };
  }, [musicPlayer, loaded, settings.music, musicActive, active]);
  const update = useCallback((patch: Partial<AudioSettings>) => {
    const next = { ...settingsRef.current, ...patch }; settingsRef.current = next; setSettings(next);
    queue.current = queue.current.catch(() => {}).then(() => AsyncStorage.setItem(KEY, JSON.stringify(next))).catch(() => {setError(true);});
  }, []);
  const playEffect = useCallback((effect: Effect) => {
    if (!loaded || !settings.effects || !active) return;
    const player = effect === 'click' ? click : effect === 'correct' ? correct : effect === 'pickup' ? pickup : effect === 'complete' ? complete : wrong;
    player.volume = 0.55;
    player.seekTo(0).then(() => player.play()).catch(() => setError(true));
  }, [active, click, correct, pickup, complete, loaded, settings.effects, wrong]);
  return <Context.Provider value={{...settings, setMusic: value => update({music:value}), setEffects: value => update({effects:value}), playEffect, error}}>{children}</Context.Provider>;
}
export function useGameAudio(): AudioContextValue {
  const context = useContext(Context);
  if (!context) throw new Error('GameAudioProvider missing');
  return context;
}
