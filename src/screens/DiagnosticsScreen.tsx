import { useEffect, useRef, useState } from 'react';
import { AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { useGameAudio } from '../audio/GameAudio';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { Gyroscope, type GyroscopeMeasurement } from 'expo-sensors';
import { initialOrientation, integrateGyro, smoothGyro, correctGyro, calibrateGyro, type GyroOptions, type Orientation } from '../game/systems/gyro';


/** A disposable debug cube, not a game asset. */
function createDebugCube(gl: ExpoWebGLRenderingContext) {
  const shader = (type: number, source: string) => {
    const result = gl.createShader(type);
    if (!result) throw new Error('Could not create shader');
    gl.shaderSource(result, source); gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(result) ?? 'shader error');
    return result;
  };
  const vertex = shader(gl.VERTEX_SHADER, `attribute vec3 p; attribute vec3 color; uniform float yaw; uniform float pitch; varying vec3 v; void main(){ float a=pitch+0.5; float b=yaw+0.5; float y=p.y*cos(a)-p.z*sin(a); float z=p.y*sin(a)+p.z*cos(a); float x=p.x*cos(b)+z*sin(b); z=-p.x*sin(b)+z*cos(b); gl_Position=vec4(x*.48,y*.48,z*.2,1.0); v=color; }`);
  const fragment = shader(gl.FRAGMENT_SHADER, `precision mediump float; varying vec3 v; void main(){gl_FragColor=vec4(v,1.0);}`);
  const program = gl.createProgram();
  if (!program) throw new Error('Could not create GL program');
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link error');
  const positions = new Float32Array([
    -1,-1,1, 1,-1,1, 1,1,1, -1,-1,1, 1,1,1, -1,1,1,
    1,-1,1, 1,-1,-1, 1,1,-1, 1,-1,1, 1,1,-1, 1,1,1,
    -1,1,1, 1,1,1, 1,1,-1, -1,1,1, 1,1,-1, -1,1,-1,
    -1,-1,-1, -1,1,-1, 1,1,-1, -1,-1,-1, 1,1,-1, 1,-1,-1,
    -1,-1,-1, -1,-1,1, -1,1,1, -1,-1,-1, -1,1,1, -1,1,-1,
    -1,-1,-1, 1,-1,-1, 1,-1,1, -1,-1,-1, 1,-1,1, -1,-1,1,
  ]);
  const colors = new Float32Array(Array.from({length: 36}, (_, i) => [[0.18,0.64,0.42],[0.10,0.37,0.30],[0.51,0.82,0.43],[0.26,0.60,0.70],[0.85,0.70,0.29],[0.40,0.45,0.75]][Math.floor(i / 6)]).flat());
  gl.useProgram(program);
  const buffers: WebGLBuffer[] = [];
  const bind = (name: string, data: Float32Array) => {
    const buffer = gl.createBuffer(); if (!buffer) throw new Error('Could not create buffer');
    buffers.push(buffer); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
  };
  bind('p', positions); bind('color', colors);
  const yaw = gl.getUniformLocation(program, 'yaw');
  const pitch = gl.getUniformLocation(program, 'pitch');
  gl.deleteShader(vertex); gl.deleteShader(fragment);
  return {
    draw: (orientation: Orientation) => {
      gl.useProgram(program);
      gl.uniform1f(yaw, orientation.yaw); gl.uniform1f(pitch, orientation.pitch);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0.85, 0.95, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.drawArrays(gl.TRIANGLES, 0, 36); gl.endFrameEXP();
    },
    dispose: () => { buffers.forEach(buffer => gl.deleteBuffer(buffer)); gl.deleteProgram(program); },
  };
}

export function DiagnosticsScreen({ onBack, options, onOptionsChange }: { onBack: () => void; options: GyroOptions; onOptionsChange: (options: GyroOptions) => void }) {
  const audio = useGameAudio();
  const [sensorStatus, setSensorStatus] = useState('Checking sensor');
  const [glStatus, setGlStatus] = useState('Waiting for GL');
  const [drawRate, setDrawRate] = useState<number | null>(null);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [calibrationMessage, setCalibrationMessage] = useState('This device has not been calibrated');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationCount, setCalibrationCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const calibrationRun = useRef<{ samples: GyroscopeMeasurement[]; timer: ReturnType<typeof setTimeout> } | null>(null);
  const onOptionsChangeRef = useRef(onOptionsChange); onOptionsChangeRef.current = onOptionsChange;
  const [reading, setReading] = useState<GyroscopeMeasurement | null>(null);
  const [orientation, setOrientation] = useState<Orientation>(initialOrientation);
  const previous = useRef<GyroscopeMeasurement | null>(null);
  const orientationRef = useRef(initialOrientation);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const renderer = useRef<ReturnType<typeof createDebugCube> | null>(null);
  const glContext = useRef<ExpoWebGLRenderingContext | null>(null);
  const renderedOrientation = useRef<Orientation>(initialOrientation);
  useEffect(() => {
    if (!active) return;
    let frame = 0; let lastTime: number | null = null;
    let measuredFrom: number | null = null; let drawn = 0;
    const animate = (time: number) => {
      const dt = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const target = orientationRef.current;
      const current = renderedOrientation.current;
      const alpha = 1 - Math.exp(-dt / 0.022);
      const next = { yaw: current.yaw + (target.yaw - current.yaw) * alpha,
        pitch: current.pitch + (target.pitch - current.pitch) * alpha };
      if (renderer.current) {
        renderer.current.draw(next);
        if (measuredFrom === null) measuredFrom = time;
        drawn++;
        if (time - measuredFrom >= 1000) {
          setDrawRate(Math.round(drawn * 1000 / (time - measuredFrom)));
          measuredFrom = time; drawn = 0;
        }
      }
      renderedOrientation.current = next;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);
  useEffect(() => {
    // Fast Refresh may recreate effects without recreating the native GL view.
    if (!renderer.current && glContext.current) {
      renderer.current = createDebugCube(glContext.current);
      renderer.current.draw(renderedOrientation.current);
    }
    return () => { renderer.current?.dispose(); renderer.current = null; };
  }, []);
  useEffect(() => () => { if (calibrationRun.current) clearTimeout(calibrationRun.current.timer); calibrationRun.current = null; }, []);
  useEffect(() => { const sub = AppState.addEventListener('change', state => setActive(state === 'active')); return () => sub.remove(); }, []);
  useEffect(() => {
    let cancelled = false; let lastDisplay = 0; let lastMovement = 0;
    let motionStatus: 'waiting' | 'moving' | 'still' = 'waiting';
    let subscription: { remove: () => void } | undefined;
    previous.current = null;
    if (!active) { if (calibrationRun.current) { clearTimeout(calibrationRun.current.timer); calibrationRun.current = null; setIsCalibrating(false); setCalibrationMessage('Calibration cancelled. Try again.'); } setSensorStatus('Sensor paused while app is in background'); return; }
    (async () => {
      try {
        const permission = await Gyroscope.requestPermissionsAsync();
        if (cancelled) return;
        if (!permission.granted) { setSensorStatus('Sensor permission denied'); return; }
        const available = await Gyroscope.isAvailableAsync();
        if (cancelled) return;
        if (!available) { setSensorStatus('Test mode (no gyroscope)'); return; }
        Gyroscope.setUpdateInterval(16);
        setSensorStatus('Gyroscope connected — waiting for readings');
        subscription = Gyroscope.addListener(sample => {
          if (calibrationRun.current) {
            const samples = calibrationRun.current.samples;
            if (Number.isFinite(sample.timestamp) && (!samples.length || sample.timestamp > samples[samples.length - 1].timestamp)) samples.push(sample);
            const now = Date.now();
            if (now - lastDisplay >= 250) { lastDisplay = now; setCalibrationCount(samples.length); }
            return;
          }
          const filtered = smoothGyro(previous.current, correctGyro(sample, optionsRef.current.calibration));
          const now = Date.now();
          if (Math.hypot(filtered.x, filtered.y, filtered.z) > 0.08) lastMovement = now;
          const nextStatus = now - lastMovement < 700 ? 'moving' : 'still';
          if (motionStatus !== nextStatus) {
            motionStatus = nextStatus;
            setSensorStatus(nextStatus === 'moving' ? 'Gyroscope connected • moving' : 'Gyroscope connected • stationary');
          }
          orientationRef.current = integrateGyro(orientationRef.current, previous.current, filtered, optionsRef.current);
          previous.current = filtered;
          if (now - lastDisplay >= 100) { lastDisplay = now; setReading(sample); setOrientation(orientationRef.current); }
        });
      } catch { if (!cancelled) setSensorStatus('Could not check sensor'); }
    })();
    return () => { cancelled = true; subscription?.remove(); previous.current = null; };
  }, [active]);
  const beginCalibration = () => {
    if (calibrationRun.current || !reading || !active) return;
    setCalibrationCount(0);
    const run = { samples: [] as GyroscopeMeasurement[], timer: setTimeout(() => {
      const completed = calibrationRun.current; calibrationRun.current = null; setIsCalibrating(false);
      if (!completed) return;
      const calibration = calibrateGyro(completed.samples);
      previous.current = null;
      if (!calibration) { setCalibrationMessage(completed.samples.length < 8 ? 'Not enough sensor readings. Keep the device still and try again.' : 'The device may have moved. Keep it still and try again.'); return; }
      const next = { ...optionsRef.current, calibration }; optionsRef.current = next;
      onOptionsChangeRef.current(next); orientationRef.current = initialOrientation; setOrientation(initialOrientation);
      setCalibrationMessage('Device calibrated successfully');
    }, 4000) };
    calibrationRun.current = run; setIsCalibrating(true); setCalibrationMessage('Keep the device still for about 4 seconds…');
  };
  const recenter = () => { previous.current = null; orientationRef.current = initialOrientation; setOrientation(initialOrientation); };
  const manualTurn = (delta: number) => { orientationRef.current = { ...orientationRef.current, yaw: orientationRef.current.yaw + delta }; setOrientation(orientationRef.current); };
  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.eyebrow}>DEVICE SETTINGS</Text><Text style={styles.title}>Rotation & aiming</Text>
    <Text style={styles.intro}>Hold your device comfortably and adjust the controls to suit you.</Text>
    <View style={styles.previewCard}>
      <GLView style={styles.gl} onContextCreate={gl => { try { glContext.current = gl; renderer.current?.dispose(); renderer.current = createDebugCube(gl); renderedOrientation.current = orientationRef.current; renderer.current.draw(renderedOrientation.current); setGlStatus('Test view ready'); } catch (error) { setGlStatus(`GL Error: ${String(error)}`); } }} />
      <Text style={styles.sensorStatus}>{sensorStatus}</Text>
      <Text style={styles.caption}>Turn or tilt your device to test the response.</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Calibrate this device</Text><Text style={styles.body}>Keep your device still for about 4 seconds to measure sensor drift and noise.</Text>
      <Text style={styles.feedback}>{options.calibration && calibrationMessage === 'This device has not been calibrated' ? 'Saved calibration available' : calibrationMessage}{isCalibrating ? ` (${calibrationCount} samples)` : ''}</Text>
      <SettingButton title={isCalibrating ? 'Calibrating…' : 'Calibrate this device'} disabled={isCalibrating || !reading || !active} onPress={beginCalibration} />
    </View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Sensitivity <Text style={styles.value}>{options.sensitivity.toFixed(2)}×</Text></Text>
      <Text style={styles.body}>Adjust how quickly rotation responds to your movement.</Text>
      <View style={styles.row}><SettingButton title="− Slower" disabled={options.sensitivity <= 0.5} onPress={() => onOptionsChange({ ...options, sensitivity: Math.max(0.5, Math.round((options.sensitivity - 0.25) * 100) / 100) })} secondary /><SettingButton title="+ Faster" disabled={options.sensitivity >= 3} onPress={() => onOptionsChange({ ...options, sensitivity: Math.min(3, Math.round((options.sensitivity + 0.25) * 100) / 100) })} secondary /></View>
      <Text style={styles.body}>Horizontal: {options.horizontalAxis === 'roll' ? 'Tilt left and right' : 'Turn left and right'}</Text>
      <SettingButton title="Switch horizontal aiming method" onPress={() => onOptionsChange({ ...options, horizontalAxis: options.horizontalAxis === 'roll' ? 'turn' : 'roll' })} secondary />
      <SettingButton title={`Invert horizontal: ${options.invertX ? 'On' : 'Off'}`} onPress={() => onOptionsChange({ ...options, invertX: !options.invertX })} secondary />
      <SettingButton title={`Invert vertical: ${options.invertY ? 'On' : 'Off'}`} onPress={() => onOptionsChange({ ...options, invertY: !options.invertY })} secondary />
      <SettingButton title="Recenter view" onPress={recenter} secondary />
    </View>
    <View style={styles.card}><Text style={styles.cardTitle}>Correct answer sound</Text><Text style={styles.body}>Preview the success sound. Enable sound effects in the main menu first.</Text><GameButton title="♪  Preview sound" tone="sky" silent onPress={()=>audio.playEffect('correct')} /></View>
    <SettingButton title={showDetails ? 'Hide diagnostics' : 'Diagnostics and test buttons'} onPress={() => setShowDetails(!showDetails)} secondary />
    {showDetails && <View style={styles.card}>
      <Text style={styles.caption}>{glStatus} • Approximate render rate: {drawRate === null ? 'Measuring' : `${drawRate} frames/sec`}</Text>
      <Text style={styles.caption}>Angular velocity: {reading ? `${reading.x.toFixed(2)}, ${reading.y.toFixed(2)}, ${reading.z.toFixed(2)}` : 'No readings yet'} rad/s</Text>
      <Text style={styles.caption}>Angle: horizontal {orientation.yaw.toFixed(2)}, vertical {orientation.pitch.toFixed(2)}</Text>
      <Text style={styles.caption}>Test buttons do not replace testing the actual sensor.</Text>
      <View style={styles.row}><SettingButton title="◀ Test" onPress={() => manualTurn(-0.2)} secondary /><SettingButton title="Test ▶" onPress={() => manualTurn(0.2)} secondary /></View>
    </View>}
    <SettingButton title="Back to menu" onPress={onBack} secondary />
  </ScrollView>;
}
function SettingButton({title,onPress,disabled=false,secondary=false}:{title:string;onPress:()=>void;disabled?:boolean;secondary?:boolean}) {
  return <GameButton title={title} onPress={onPress} disabled={disabled} tone={secondary ? 'light' : 'leaf'} compact />;
}
const styles = StyleSheet.create({
  container:{padding:18,gap:10,backgroundColor:'#e4f7ff',flexGrow:1},eyebrow:{color:'#267a85',fontSize:13,fontWeight:'800'},title:{fontSize:28,fontWeight:'900',color:'#175b46'},intro:{fontSize:15,lineHeight:22,color:'#315b66'},
  previewCard:{backgroundColor:'#fff',borderRadius:22,padding:10,gap:4,borderWidth:3,borderColor:'#b8e8f2'},gl:{width:'100%',height:170,backgroundColor:'#d8f2ff',borderRadius:12},sensorStatus:{fontSize:14,fontWeight:'800',color:'#175b46'},caption:{fontSize:12,lineHeight:18,color:'#466b76'},
  card:{backgroundColor:'#fff',borderRadius:20,padding:16,gap:9,borderWidth:2,borderColor:'#c0e8ed',borderBottomWidth:4},cardTitle:{fontSize:19,fontWeight:'900',color:'#175b46'},value:{color:'#b05a08'},body:{fontSize:14,lineHeight:21,color:'#315b66'},feedback:{fontSize:14,fontWeight:'700',color:'#206f62'},row:{flexDirection:'row',gap:8,justifyContent:'center'},
  button:{minHeight:46,backgroundColor:'#c75500',borderRadius:13,paddingVertical:10,paddingHorizontal:16,alignItems:'center',justifyContent:'center'},secondary:{backgroundColor:'#edf8fb',borderWidth:1,borderColor:'#9bcbd2'},buttonText:{fontSize:15,fontWeight:'800',color:'#fff'},secondaryText:{color:'#195b6c'},disabled:{opacity:.45},pressed:{opacity:.72},
});
