import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_GYRO_OPTIONS, GYRO_OPTIONS_KEY, PREVIOUS_GYRO_OPTIONS_KEY, LEGACY_GYRO_OPTIONS_KEY, migrateLegacyGyroOptions, migratePreviousGyroOptions, normalizeGyroOptions } from './src/game/systems/gyroSettings';
import type { GyroOptions } from './src/game/systems/gyro';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DiagnosticsScreen } from './src/screens/DiagnosticsScreen';
import { ParkGameScreen } from './src/screens/ParkGameScreen';
import { HomeScreen, TutorialScreen, GuideScreen, StageSelectScreen } from './src/screens/AlphaScreens';
import { guideItems } from './src/data/park';
import { stages } from './src/data/stages';
import type { StageConfig } from './src/types/game';
import { GameAudioProvider } from './src/audio/GameAudio';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'diagnostics' | 'park' | 'tutorial' | 'guide' | 'stages'>('home');
  const [options, setOptions] = useState<GyroOptions>(DEFAULT_GYRO_OPTIONS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [runId, setRunId] = useState(0);
  const [stage, setStage] = useState<StageConfig>(stages[0]);
  const [saveError, setSaveError] = useState(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const savedItems = await AsyncStorage.getItem('planet-cleaner.discovered.v1');
        if (savedItems) {
          const ids: unknown = JSON.parse(savedItems);
          if (alive && Array.isArray(ids)) setDiscovered([...new Set(ids.filter((id): id is string => typeof id === 'string' && guideItems.some(item => item.id === id)))]);
        }
        const savedScore = await AsyncStorage.getItem('planet-cleaner.park-best.v1');
        if (alive && savedScore && Number.isFinite(Number(savedScore))) setHighScore(Math.max(0, Number(savedScore)));
        const raw = await AsyncStorage.getItem(GYRO_OPTIONS_KEY);
        if (raw) { if (alive) setOptions(normalizeGyroOptions(JSON.parse(raw))); }
        else {
          const previous = await AsyncStorage.getItem(PREVIOUS_GYRO_OPTIONS_KEY);
          const legacy = previous ? null : await AsyncStorage.getItem(LEGACY_GYRO_OPTIONS_KEY);
          if (previous || legacy) {
            const migrated = previous ? migratePreviousGyroOptions(JSON.parse(previous)) : migrateLegacyGyroOptions(JSON.parse(legacy!));
            if (alive) setOptions(migrated);
            await AsyncStorage.setItem(GYRO_OPTIONS_KEY, JSON.stringify(migrated));
          }
        }
      }
      catch { if (alive) setSaveError(true); }
      finally { if (alive) setSettingsLoaded(true); }
    })();
    return () => { alive = false; };
  }, []);
  const changeOptions = (value: GyroOptions) => {
    const next = normalizeGyroOptions(value); setOptions(next);
    // Storage writes are queued so rapid adjustments cannot restore an older value.
    saveQueue.current = saveQueue.current.catch(() => {}).then(() => AsyncStorage.setItem(GYRO_OPTIONS_KEY, JSON.stringify(next)))
      .then(() => setSaveError(false), () => setSaveError(true));
  };
  const finishRun = (score: number) => {
    if (stage.id !== 'park' || score <= highScore) return;
    setHighScore(score);
    AsyncStorage.setItem('planet-cleaner.park-best.v1', String(score)).catch(() => setSaveError(true));
  };
  const rememberItem = (id: string) => {
    if (discovered.includes(id)) return;
    const next = [...discovered, id]; setDiscovered(next);
    AsyncStorage.setItem('planet-cleaner.discovered.v1', JSON.stringify(next)).catch(() => setSaveError(true));
  };
  const startRun = () => { setRunId(id => id + 1); setScreen('park'); };
  return <SafeAreaProvider><GameAudioProvider musicActive={settingsLoaded}><SafeAreaView style={styles.screen}>
    <StatusBar style="dark" />
    {!settingsLoaded ? <Text>Loading settings…</Text> : screen === 'diagnostics' ? <DiagnosticsScreen options={options} onOptionsChange={changeOptions} onBack={() => setScreen('home')} /> :
      screen === 'park' ? <ParkGameScreen key={runId} options={options} onBack={() => setScreen('stages')} onRetry={startRun} stage={stage} onComplete={finishRun} onCollected={rememberItem} /> :
      screen === 'stages' ? <StageSelectScreen onBack={() => setScreen('home')} onSelect={selected => { setStage(selected); startRun(); }} /> :
      screen === 'tutorial' ? <TutorialScreen onBack={() => setScreen('home')} onStart={() => setScreen('stages')} /> :
      screen === 'guide' ? <GuideScreen discovered={discovered} onBack={() => setScreen('home')} /> : <>
        {saveError && <Text>Could not save. Changes will last only for this session.</Text>}
        <HomeScreen onStart={() => setScreen('stages')} onTutorial={() => setScreen('tutorial')} onGuide={() => setScreen('guide')} onSettings={() => setScreen('diagnostics')} highScore={highScore} />
      </>}
  </SafeAreaView></GameAudioProvider></SafeAreaProvider>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#d8f2ff', justifyContent: 'center' }, card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, gap: 12 }, title: { color: '#176b50', fontSize: 32, fontWeight: '800' }, subtitle: { color: '#195781', fontSize: 22, fontWeight: '700' }, body: { color: '#29485c', fontSize: 16, lineHeight: 25 }, note: { color: '#61798a', fontSize: 13 } });
