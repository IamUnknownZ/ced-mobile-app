import { useEffect, useRef, useState } from 'react';
import { AppState, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gyroscope, type GyroscopeMeasurement } from 'expo-sensors';
import { useGameAudio } from '../audio/GameAudio';
import { GameButton } from '../components/GameButton';
import { WasteIcon } from '../components/WasteIcon';
import { categories, parkItems } from '../data/park';
import { ParkScene } from '../game/scene/ParkScene';
import { pickupScore, correctScore, wrongScore, completionScore, accuracyPercent } from '../game/systems/scoring';
import { initialOrientation, integrateGyro, smoothGyro, correctGyro, type GyroOptions } from '../game/systems/gyro';
import type { StageConfig, WasteCategoryId, WasteItem } from '../types/game';

const categoryBackground: Record<WasteCategoryId, string> = { general: '#d6eafb', recyclable: '#ffedaa', organic: '#d2efcf', hazardous: '#ffdad3' };

type Step = 'scan' | 'item' | 'sort' | 'correct' | 'incorrect' | 'paused' | 'results';
export function ParkGameScreen({ onBack, onRetry, onComplete, onCollected, options, stage }: { stage: StageConfig; onBack: () => void; onRetry: () => void; onComplete: (score: number) => void; onCollected: (id: string) => void; options: GyroOptions }) {
  const optionsRef = useRef(options); optionsRef.current = options;
  const audio = useGameAudio();
  const [step,setStep] = useState<Step>('scan');
  const [remaining,setRemaining] = useState(stage.wasteItemIds);
  const [target,setTarget] = useState<string|null>(null);
  const targetRef = useRef<string|null>(null);
  const [item,setItem] = useState<WasteItem|null>(null);
  const [chosen,setChosen] = useState<WasteCategoryId|null>(null);
  const [elapsed,setElapsed] = useState(0);
  const [score,setScore] = useState(0); const [combo,setCombo] = useState(0);
  const [attempts,setAttempts] = useState(0); const [correct,setCorrect] = useState(0);
  const [penalized,setPenalized] = useState(false);
  const answerLocked = useRef(false);
  const pickupLocked = useRef(false);
  const nextLocked = useRef(false);
  const viewRef = useRef(initialOrientation);
  const previous = useRef<GyroscopeMeasurement|null>(null);
  const [sensor,setSensor] = useState('Checking gyroscope');
  const [manualOpen, setManualOpen] = useState(false);
  const [rotationHeld, setRotationHeld] = useState(false);
  const heldRef = useRef(false);
  const [wideScan, setWideScan] = useState(true);
  const wideScanRef = useRef(true);
  const [active,setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    if (!active || step === 'paused' || step === 'results') return;
    let last = Date.now();
    const timer = setInterval(() => { const now = Date.now(); setElapsed(n => n + Math.max(0, now - last)); last = now; }, 250);
    return () => { clearInterval(timer); };
  }, [active, step]);
  useEffect(() => { const s=AppState.addEventListener('change', v => setActive(v === 'active')); return () => s.remove(); }, []);
  useEffect(() => {
    let cancelled = false; let subscription: {remove:()=>void}|undefined; previous.current=null;
    if (!active || step !== 'scan') return;
    (async () => { try {
      const permission=await Gyroscope.requestPermissionsAsync(); if (cancelled) return;
      if (!permission.granted || !(await Gyroscope.isAvailableAsync())) { if(!cancelled) setSensor('Test mode (no gyroscope)'); return; }
      if (cancelled) return;
      Gyroscope.setUpdateInterval(16);
      subscription=Gyroscope.addListener(sample => {
        if (heldRef.current) { previous.current = null; return; }
        const filtered=smoothGyro(previous.current,correctGyro(sample,optionsRef.current.calibration));
        viewRef.current=integrateGyro(viewRef.current,previous.current,filtered,optionsRef.current,wideScanRef.current ? 3 : 1); previous.current=filtered;

      }); setSensor('Gyroscope ready');
    } catch { if (!cancelled) setSensor('Test mode (gyroscope unavailable)'); } })();
    return () => { cancelled=true; previous.current=null; subscription?.remove(); };
  },[active,step]);
  const turn=(delta:number) => { viewRef.current={...viewRef.current,yaw:viewRef.current.yaw+delta}; };
  const tilt=(delta:number) => { viewRef.current={...viewRef.current,pitch:Math.max(-Math.PI/3,Math.min(Math.PI/3,viewRef.current.pitch+delta))}; };
  const recenter=() => { previous.current=null; viewRef.current=initialOrientation; };
  const collectId=(id:string) => { if (step !== 'scan') return; const found=parkItems.find(x=>x.id===id && remaining.includes(x.id)); if(found){audio.playEffect('click');pickupLocked.current=false;setItem(found);setStep('item');} };
  const toggleRotation = () => { const next = !heldRef.current; heldRef.current = next; previous.current = null; setRotationHeld(next); };
  const toggleWideScan = () => { const next = !wideScanRef.current; wideScanRef.current = next; previous.current = null; setWideScan(next); };
  const choose=(id:WasteCategoryId) => {
    if (!item || step !== 'sort' || answerLocked.current) return;
    answerLocked.current = true;
    setChosen(id);
    setAttempts(n=>n+1);
    audio.playEffect(id === item.categoryId ? 'correct' : 'wrong');
    if(id===item.categoryId) { nextLocked.current=false; setCorrect(n=>n+1); setScore(correctScore); setCombo(n=>n+1); setStep('correct'); }
    else { if(!penalized) setScore(n=>wrongScore(n,false)); setPenalized(true); setCombo(0); setStep('incorrect'); }
  };
  const next=() => {
    if(!item || step!=='correct' || nextLocked.current) return;
    nextLocked.current=true;
    onCollected(item.id);
    const left=remaining.filter(id=>id!==item.id); setRemaining(left); setItem(null); setPenalized(false); targetRef.current=null; setTarget(null);
    if(left.length===0) {audio.playEffect('complete'); const finalScore=completionScore(score); setScore(finalScore); onComplete(finalScore); setStep('results');} else setStep('scan');
  };
  const timeLabel = `${Math.floor(elapsed / 60000)}:${String(Math.floor(elapsed / 1000) % 60).padStart(2, '0')}`;
  const targetName = parkItems.find(entry => entry.id === target)?.nameTh;
  return <View style={styles.page}>
    <View style={styles.header}>
      <View style={styles.titleRow}><View><Text style={styles.eyebrow}>PLANET MISSION</Text><Text style={styles.title}>{stage.titleTh}</Text><Text style={styles.eyebrow}>{stage.educationalGoalTh}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Pause game" onPress={() => setStep('paused')} disabled={step !== 'scan'} style={({pressed})=>[styles.pause, step !== 'scan' && styles.inactive,pressed&&styles.pressed]}><Text style={styles.pauseText}>Ⅱ</Text></Pressable></View>
      <View style={styles.hudRow}>
        <View style={styles.hudItem}><Text style={styles.hudLabel}>Time</Text><Text style={styles.hudValue}>{timeLabel}</Text></View>
        <View style={styles.hudItem}><Text style={styles.hudLabel}>points</Text><Text style={styles.hudValue}>★ {score}</Text></View>
        <View style={styles.hudItem}><Text style={styles.hudLabel}>Waste remaining</Text><Text style={styles.hudValue}>{remaining.length} / {stage.targetCount}</Text></View>
      </View>
    </View>
    <View style={styles.scene}>
      <ParkScene stageId={stage.id} orientationRef={viewRef} remaining={remaining} onTarget={id => { targetRef.current = id; setTarget(id); }} />
      {step === 'scan' && <Pressable accessibilityRole="button" accessibilityLabel={targetName ? `Inspect waste ${targetName}` : 'Aim at waste before tapping to inspect'} accessibilityState={{disabled: !target}} disabled={!target} onPress={() => { if (targetRef.current) collectId(targetRef.current); }} style={styles.aimLayer}>
        <View pointerEvents="none" style={[styles.reticle, target && styles.reticleReady]}><Text style={[styles.reticleSymbol, target && styles.reticleSymbolReady]}>{target ? 'View' : '＋'}</Text></View>
      </Pressable>}
    </View>
    {step==='scan' && <View style={styles.controls}>
      <Text style={styles.targetMessage} numberOfLines={2}>{targetName ? `Found ${targetName} · Tap anywhere on the planet to inspect` : 'Aim the crosshair at waste'}</Text>
      <Text style={styles.note} numberOfLines={2}>{sensor} · {options.horizontalAxis === 'roll' ? 'Tilt to aim' : 'Turn to aim'}</Text>
      <View style={styles.footerRow}><Action label={rotationHeld ? 'Resume rotation' : 'Pause rotation'} onPress={toggleRotation} secondary /><Action label="Recenter" onPress={recenter} secondary /><Action label={manualOpen ? 'Hide controls' : 'Controls'} onPress={()=>setManualOpen(!manualOpen)} secondary /></View>
      <Pressable accessibilityRole="switch" accessibilityState={{checked:wideScan}} onPress={toggleWideScan} style={({pressed})=>[styles.scanSetting,pressed&&styles.pressed]}><Text style={styles.note}>Explore the planet {wideScan ? 'Fast ×3' : 'Normal ×1'} · Tap to change</Text></Pressable>
      {rotationHeld && <Text style={styles.note}>Rotation is paused. Reposition your hands and resume when ready.</Text>}
      {manualOpen && <><Text style={styles.note}>Button test mode</Text><View style={styles.footerRow}><Action label="◀" onPress={()=>turn(-.3)} secondary /><Action label="▲" onPress={()=>tilt(-.2)} secondary /><Action label="▼" onPress={()=>tilt(.2)} secondary /><Action label="▶" onPress={()=>turn(.3)} secondary /></View></>}
    </View>}
    <Modal visible={step !== 'scan'} transparent animationType="fade" onRequestClose={() => { if (step === 'item' || step === 'paused') setStep('scan'); }}>
      <View style={[styles.scrim,step==='incorrect'&&styles.scrimWrong]}><View style={[styles.dialog,step==='incorrect'&&styles.dialogWrong]}>
        <ScrollView contentContainerStyle={styles.dialogContent} showsVerticalScrollIndicator={false}>
          {step==='paused' && <><Text style={styles.dialogKicker}>TAKE A BREAK</Text><Text style={styles.dialogTitle}>Pause game</Text><Text style={styles.dialogIntro}>Ready to continue caring for the planet?</Text><Action label="▶  Resume" onPress={()=>setStep('scan')} /><Action label="Back to map" onPress={onBack} secondary /></>}
          {step==='item' && item && <><Text style={styles.dialogKicker}>✦  WASTE FOUND</Text><View style={styles.itemBadge}><WasteIcon id={item.id} size={128} /><Text style={styles.itemBadgeCaption}>You found</Text><Text style={styles.itemBadgeTitle}>{item.nameTh}</Text></View><Text style={styles.dialogTitle}>Let's collect it!</Text><Text style={styles.dialogIntro}>Collect it, then choose the right waste category.</Text><Action label="Collect   +10 points" onPress={()=>{if(pickupLocked.current) return; pickupLocked.current=true; audio.playEffect('pickup'); setScore(pickupScore);answerLocked.current=false;setStep('sort');}} silent /><Action label="Back to exploring" onPress={()=>setStep('scan')} secondary /></>}
          {step==='sort' && item && <><Text style={styles.dialogKicker}>SORTING MISSION  ·  CHOOSE ONE</Text><Text style={styles.dialogTitle}>{item.nameTh}</Text><Text style={styles.dialogIntro}>Which category does this item belong to?</Text><View style={styles.sortItem}><WasteIcon id={item.id} size={96} /></View><Image source={require('../../assets/art/sorting-bins.png')} accessibilityLabel="Illustration of four waste bins" resizeMode="contain" style={styles.binsArtwork}/><View style={styles.binGrid}>{categories.map(c=><Pressable accessibilityRole="button" accessibilityLabel={c.nameTh} key={c.id} onPress={()=>choose(c.id)} style={({pressed})=>[styles.binCard,{backgroundColor:categoryBackground[c.id],borderColor:c.color},pressed&&styles.pressed]}><View style={[styles.binIcon,{backgroundColor:c.color}]}><Text style={styles.binSymbol}>{c.icon}</Text></View><Text style={styles.binName}>{c.nameTh}</Text><Text style={styles.binHint}>Tap to choose</Text></Pressable>)}</View><Text style={styles.disclaimer}>Bin colours and collection points may vary by location.</Text></>}
          {(step==='correct'||step==='incorrect') && item && <><View style={styles.feedbackHero}><WasteIcon id={item.id} size={86} /><View style={[styles.resultBadge,step==='incorrect'&&styles.resultBadgeWrong]}><Text style={styles.resultBadgeText}>{step==='correct'?'✓':'!'}</Text></View></View><Text style={[styles.dialogKicker,step==='incorrect'&&styles.wrongKicker]}>{step==='correct'?'Great job!':"LET'S LEARN"}</Text><Text style={[styles.dialogTitle,step==='incorrect'&&styles.wrongTitle]}>{step==='correct'?'Correct!':"Not quite. Let's learn!"}</Text><Text style={styles.dialogIntro}>{item.nameTh}</Text>{step==='incorrect' && chosen && <View style={styles.wrongChoice}><Text style={styles.wrongChoiceText}>✕  You chose {categories.find(c=>c.id===chosen)?.nameTh}</Text></View>}<View style={[styles.answerCard,{borderColor:categories.find(c=>c.id===item.categoryId)?.color}]}><Text style={styles.answerLabel}>Correct category</Text><Text style={styles.answerTitle}>{categories.find(c=>c.id===item.categoryId)?.icon}  {categories.find(c=>c.id===item.categoryId)?.nameTh}</Text></View><View style={[styles.lessonCard,step==='incorrect'&&styles.lessonCardWrong]}><Text style={[styles.lessonHeading,step==='incorrect'&&styles.lessonHeadingWrong]}>✦  Did you know?</Text><Text style={styles.lessonText}>{item.explanationTh}</Text><Text style={styles.tipText}>How to dispose: {item.disposalTipTh}</Text></View><Text style={styles.disclaimer}>Check local guidance and collection points.</Text>{step==='correct' ? <><Text style={styles.reward}>+20 points  ·  Combo x{combo}</Text><Action label="Keep exploring  →" onPress={next}/></> : <Action label="Try again" danger onPress={()=>{answerLocked.current=false;setStep('sort');}} />}</>}
          {step==='results' && <><Text style={styles.dialogKicker}>MISSION COMPLETE</Text><Text style={styles.dialogTitle}>Thanks for caring for the planet!</Text><Text style={styles.stars}>{'★'.repeat(accuracyPercent(correct,attempts) >= 90 ? 3 : accuracyPercent(correct,attempts) >= 70 ? 2 : 1)}</Text><View style={styles.lessonCard}><Text style={styles.lessonText}>points  {score}     Accuracy  {accuracyPercent(correct,attempts)}%</Text><Text style={styles.tipText}>Collected {stage.targetCount} items  ·  Time {timeLabel}</Text><Text style={styles.tipText}>Includes +50 points for collecting everything</Text></View><Action label="Play again" onPress={onRetry}/><Action label="Back to map" onPress={onBack} secondary /></>}
        </ScrollView>
      </View></View>
    </Modal>
  </View>;
}

function Action({label,onPress,disabled=false,secondary=false,silent=false,danger=false}:{label:string;onPress:()=>void;disabled?:boolean;secondary?:boolean;silent?:boolean;danger?:boolean}) {
  return <GameButton title={label} onPress={onPress} disabled={disabled} tone={danger ? 'coral' : secondary ? 'light' : 'leaf'} compact={secondary} silent={silent} />;
}
const styles=StyleSheet.create({
  page:{flex:1,backgroundColor:'#c9edfa'},
  header:{paddingHorizontal:16,paddingTop:10,paddingBottom:10,backgroundColor:'#e9f8ff',gap:8},
  titleRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  eyebrow:{fontSize:12,fontWeight:'800',color:'#257a70',letterSpacing:.3},
  title:{fontSize:23,fontWeight:'900',color:'#165e42'},
  pause:{width:48,height:48,borderRadius:15,backgroundColor:'#1d86b8',borderColor:'#8bd8f6',borderWidth:2,borderBottomWidth:5,justifyContent:'center',alignItems:'center'},
  pauseText:{color:'#fff',fontWeight:'900',fontSize:19},
  hudRow:{flexDirection:'row',gap:6},
  hudItem:{flex:1,backgroundColor:'#176f89',borderRadius:14,paddingHorizontal:9,paddingVertical:7},
  hudLabel:{color:'#def7ff',fontSize:11,fontWeight:'700'},hudValue:{color:'#fff',fontSize:15,fontWeight:'900',fontVariant:['tabular-nums']},
  scene:{flex:1,minHeight:180,backgroundColor:'#aee3f8'},
  aimLayer:{position:'absolute',top:0,bottom:0,left:0,right:0,alignItems:'center',justifyContent:'center'},
  reticle:{width:70,height:70,borderRadius:35,borderWidth:3,borderColor:'rgba(255,255,255,0.9)',backgroundColor:'rgba(18,77,85,0.22)',justifyContent:'center',alignItems:'center'},
  reticleReady:{backgroundColor:'#f49817',borderColor:'#fff3bb',borderWidth:4},
  reticleSymbol:{fontSize:28,color:'#fff',fontWeight:'500'},reticleSymbolReady:{fontSize:18,fontWeight:'900'},
  controls:{paddingHorizontal:16,paddingVertical:10,backgroundColor:'#e9f8ff',gap:6},
  targetMessage:{fontSize:16,fontWeight:'800',color:'#165e42',textAlign:'center'},
  note:{fontSize:12,lineHeight:18,color:'#315b66',textAlign:'center'},scanSetting:{minHeight:44,justifyContent:'center',alignItems:'center',backgroundColor:'#d4f3fa',borderRadius:14,borderWidth:1,borderColor:'#97d6e3'},
  footerRow:{flexDirection:'row',gap:8,justifyContent:'center'},
  button:{minHeight:46,borderRadius:14,paddingVertical:10,paddingHorizontal:18,alignItems:'center',justifyContent:'center',backgroundColor:'#c75500'},
  buttonSecondary:{backgroundColor:'#fff',borderColor:'#83bfcc',borderWidth:1},
  buttonText:{fontSize:15,color:'#fff',fontWeight:'800'},buttonTextSecondary:{color:'#165c6f'},
  inactive:{opacity:.45},pressed:{opacity:.75},
  scrimWrong:{backgroundColor:'rgba(57,23,24,0.48)'},dialogWrong:{borderColor:'#ee9c92',backgroundColor:'#fff8f4'},wrongKicker:{color:'#be4a46'},wrongTitle:{color:'#b7333d'},wrongChoice:{backgroundColor:'#ffdfd9',borderLeftWidth:5,borderColor:'#d54b47',padding:11,borderRadius:10},wrongChoiceText:{fontSize:15,fontWeight:'900',color:'#a73635'},lessonCardWrong:{backgroundColor:'#ffe9e1',borderWidth:1,borderColor:'#f2b5a7'},lessonHeadingWrong:{color:'#b53c39'},
  scrim:{flex:1,backgroundColor:'rgba(9,43,56,0.48)',justifyContent:'center',alignItems:'center',padding:16},
  dialog:{width:'100%',maxWidth:440,maxHeight:'90%',borderRadius:28,backgroundColor:'#fffdf4',borderWidth:3,borderColor:'#a7db91',overflow:'hidden',elevation:12},
  dialogContent:{padding:22,gap:11},dialogKicker:{fontSize:12,fontWeight:'900',letterSpacing:.6,color:'#168074'},dialogTitle:{fontSize:25,lineHeight:34,fontWeight:'900',color:'#165e42'},dialogIntro:{fontSize:16,lineHeight:24,color:'#355d64'},
  itemBadge:{alignItems:'center',backgroundColor:'#def4e0',borderRadius:22,padding:14,gap:3,borderWidth:2,borderColor:'#b6dea8'},itemBadgeIcon:{fontSize:32,color:'#e4a41f'},itemBadgeCaption:{fontSize:12,color:'#397b64',fontWeight:'700'},itemBadgeTitle:{fontSize:20,color:'#175b45',fontWeight:'900'},
  sortItem:{alignItems:'center',paddingVertical:4},feedbackHero:{flexDirection:'row',alignItems:'center',gap:16},binsArtwork:{width:'100%',height:64},binGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},binCard:{width:'48%',flexGrow:1,minHeight:115,alignItems:'center',justifyContent:'center',borderRadius:18,borderWidth:2,borderBottomWidth:6,padding:8,gap:3},binIcon:{width:42,height:42,borderRadius:13,alignItems:'center',justifyContent:'center'},binSymbol:{fontSize:24,color:'#fff',fontWeight:'900'},binName:{fontSize:15,color:'#174e55',fontWeight:'900',textAlign:'center'},binHint:{fontSize:11,color:'#41666a'},
  resultBadge:{width:56,height:56,borderRadius:28,backgroundColor:'#4ba663',alignItems:'center',justifyContent:'center'},resultBadgeWrong:{backgroundColor:'#d94c49'},resultBadgeText:{fontSize:30,color:'#fff',fontWeight:'900'},answerCard:{backgroundColor:'#fff',borderLeftWidth:5,borderRadius:12,padding:12,gap:3},answerLabel:{fontSize:12,color:'#4c7472',fontWeight:'700'},answerTitle:{fontSize:18,color:'#175e4a',fontWeight:'900'},lessonCard:{backgroundColor:'#e5f4e7',borderRadius:16,padding:14,gap:7},lessonHeading:{fontSize:15,fontWeight:'900',color:'#287a55'},lessonText:{fontSize:15,lineHeight:23,color:'#244d4a'},tipText:{fontSize:14,lineHeight:21,color:'#315d59',fontWeight:'700'},disclaimer:{fontSize:12,lineHeight:17,color:'#607b78'},stars:{fontSize:36,letterSpacing:8,color:'#e1a322',textAlign:'center'},
  panel:{maxHeight:'52%',backgroundColor:'#fff',borderTopLeftRadius:22,borderTopRightRadius:22},
  panelContent:{paddingHorizontal:18,paddingTop:16,paddingBottom:24,gap:9},
  heading:{fontSize:23,color:'#185f48',fontWeight:'900'},body:{fontSize:16,lineHeight:24,color:'#173f50'},reward:{fontSize:20,fontWeight:'900',color:'#ab5900'},
});
