import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, AlertTriangle, ShieldCheck, Camera, Activity, Play, Square, RefreshCw, 
  Volume2, VolumeX, Eye, Bell, Plus, Users, Flame, Info, ChevronRight, X, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';

interface LogEntry {
  id: string;
  time: string;
  type: 'info' | 'person' | 'fire' | 'motion' | 'system';
  message: string;
  coords?: { x: number; y: number; w: number; h: number };
}

interface CameraConfig {
  id: number;
  name: string;
  isWebcam: boolean;
  mockVideoUrl?: string;
  status: 'active' | 'inactive';
}

interface AIModule {
  id: string;
  name: string;
  enabled: boolean;
  status: 'active' | 'idle' | 'warning';
  description: string;
  color: string;
}

function getGridClusters(
  points: { x: number; y: number }[],
  cellWidth: number,
  cellHeight: number,
  gridCols: number,
  gridRows: number,
  minPointsPerCell: number
) {
  const grid: number[][] = Array.from({ length: gridRows }, () => new Array(gridCols).fill(0));
  
  for (const p of points) {
    const col = Math.floor(p.x / cellWidth);
    const row = Math.floor(p.y / cellHeight);
    if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
      grid[row][col]++;
    }
  }

  const activeCells: [number, number][] = [];
  const cellMap = new Map<string, boolean>();
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (grid[r][c] >= minPointsPerCell) {
        activeCells.push([r, c]);
        cellMap.set(`${r},${c}`, true);
      }
    }
  }

  const visited = new Set<string>();
  const clusters: [number, number][][] = [];

  for (const [r, c] of activeCells) {
    const key = `${r},${c}`;
    if (!visited.has(key)) {
      const cluster: [number, number][] = [];
      const queue: [number, number][] = [[r, c]];
      visited.add(key);

      while (queue.length > 0) {
        const [currR, currC] = queue.shift()!;
        cluster.push([currR, currC]);

        const neighbors = [
          [currR - 1, currC],
          [currR + 1, currC],
          [currR, currC - 1],
          [currR, currC + 1],
          [currR - 1, currC - 1],
          [currR - 1, currC + 1],
          [currR + 1, currC - 1],
          [currR + 1, currC + 1],
        ];

        for (const [nr, nc] of neighbors) {
          const nKey = `${nr},${nc}`;
          if (cellMap.has(nKey) && !visited.has(nKey)) {
            visited.add(nKey);
            queue.push([nr, nc]);
          }
        }
      }
      clusters.push(cluster);
    }
  }

  return clusters.map(cells => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const [r, c] of cells) {
      const cellMinX = c * cellWidth;
      const cellMaxX = (c + 1) * cellWidth;
      const cellMinY = r * cellHeight;
      const cellMaxY = (r + 1) * cellHeight;

      if (cellMinX < minX) minX = cellMinX;
      if (cellMaxX > maxX) maxX = cellMaxX;
      if (cellMinY < minY) minY = cellMinY;
      if (cellMaxY > maxY) maxY = cellMaxY;
    }

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: minX + (maxX - minX) / 2,
      centerY: minY + (maxY - minY) / 2
    };
  });
}

export function CCTV() {
  const [camerasList, setCamerasList] = useState<CameraConfig[]>([
    { id: 1, name: 'СІЗДІҢ НОУТБУК КАМЕРАҢЫЗ (LIVE)', isWebcam: true, status: 'active' },
    { id: 2, name: 'Басты кіреберіс (CAM-02)', isWebcam: false, status: 'active' },
    { id: 3, name: '1-ші қабат дәлізі (CAM-03)', isWebcam: false, status: 'active' },
    { id: 4, name: 'Артқы аула (CAM-04)', isWebcam: false, status: 'active' },
  ]);

  const [activeCam, setActiveCam] = useState<CameraConfig>(camerasList[0]);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  // AI Active Switches
  const [aiEnabled, setAiEnabled] = useState(true);
  const [personDetection, setPersonDetection] = useState(true);
  const [fireDetection, setFireDetection] = useState(true);
  const [soundSiren, setSoundSiren] = useState(true);

  // Counters & stats
  const [personCount, setPersonCount] = useState(0);
  const [totalDetections, setTotalDetections] = useState(24);
  const [lastEventCoords, setLastEventCoords] = useState<{ x: number; y: number } | null>(null);

  // Custom simulation overrides for easy testing
  const [forcePerson, setForcePerson] = useState(false);
  const [forceFire, setForceFire] = useState(false);
  const [realFireDetected, setRealFireDetected] = useState(false);
  const realFireDetectedRef = useRef(false);
  const flameResetCounterRef = useRef(0);

  // Persistence trackers for stable, non-flickering visual bounding boxes
  const persistentPeopleRef = useRef<{ minX: number; maxX: number; minY: number; maxY: number; width: number; height: number; centerX: number; centerY: number; age: number }[]>([]);
  const persistentFiresRef = useRef<{ minX: number; maxX: number; minY: number; maxY: number; width: number; height: number; centerX: number; centerY: number; age: number }[]>([]);

  // Dynamic AI Modules (Users can add new modules)
  const [aiModules, setAiModules] = useState<AIModule[]>([
    { id: 'person', name: 'Адамды анықтау', enabled: true, status: 'active', description: 'Камера өрісіндегі адамдар мен олардың траекторияларын тіркейді', color: 'emerald' },
    { id: 'fire', name: 'Өрт пен өрт ұшқынын анықтау', enabled: true, status: 'idle', description: 'Оптикалық түтін мен от белгілерін бақылау', color: 'red' },
  ]);

  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [newModuleColor, setNewModuleColor] = useState('indigo');

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: new Date().toLocaleTimeString(), type: 'system', message: 'Зияткерлік AI күзет жүйесі сәтті іске қосылды.' },
    { id: '2', time: new Date().toLocaleTimeString(), type: 'info', message: 'Камералардан бейне ағындарын қабылдау жүргізілуде.' }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // Add real logs helper
  const addLog = (type: LogEntry['type'], message: string, coords?: LogEntry['coords']) => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs(prev => [
      { id: Date.now().toString() + Math.random(), time: timeStr, type, message, coords },
      ...prev.slice(0, 99) // keep last 100 entries
    ]);
  };

  // Play realistic alarm siren using Web Audio API
  const startAudioSiren = () => {
    if (!soundSiren) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop previous cycle if running
      if (sirenIntervalRef.current) return;

      const playOscillator = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.6);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.61);
      };

      playOscillator();
      sirenIntervalRef.current = setInterval(playOscillator, 650);
    } catch (e) {
      console.error('AudioContext alarm error:', e);
    }
  };

  const stopAudioSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  };

  // Handle webcam lifecycle
  useEffect(() => {
    if (activeCam.isWebcam) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then(stream => {
          setWebcamStream(stream);
          setWebcamError(null);
          addLog('system', 'Ноутбук веб-камерасы іске қосылды. Дайындық орындалды.');
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.log('Video autoplay error:', err));
          }
        })
        .catch(err => {
          console.error('Webcam target error:', err);
          setWebcamError('Камераға рұқсат берілмеді немесе ноутбугіңізде ол табылмады. (Симляция режимі қосылды)');
          addLog('system', 'Камераға рұқсат шектелген. Жүйе визуалды имитаторды қосты.');
        });
    } else {
      // Release webcam stream
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }
      addLog('info', `${activeCam.name} бейнесіне ауыстырылды.`);
    }

    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
      stopAudioSiren();
    };
  }, [activeCam]);

  // Handle alarms & siren state when fire is triggered
  useEffect(() => {
    if ((forceFire || realFireDetected) && soundSiren) {
      startAudioSiren();
    } else {
      stopAudioSiren();
    }
    return () => stopAudioSiren();
  }, [forceFire, realFireDetected, soundSiren]);

  // Canvas processing loop for real camera analysis & drawing beautiful visual grids
  useEffect(() => {
    let animFrameId: number;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Track previous frame for real motion detection (frame-differencing)
    let lastFrameData: Uint8ClampedArray | null = null;
    let frameCounter = 0;

    const render = () => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Draw Base Video Frame or Mock Visual Layout
      if (activeCam.isWebcam && webcamStream && video && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, width, height);
      } else {
        // Draw elegant high-tech visual simulation when camera is not ready
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        // Simulated background moving matrix/grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        const gridSize = 40;
        const timeOffset = Date.now() / 200;
        
        ctx.save();
        ctx.opacity = 0.3;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.restore();

        // High fidelity technical crosshairs
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        // Top-left bracket
        ctx.beginPath();
        ctx.moveTo(30, 20); ctx.lineTo(15, 20); ctx.lineTo(15, 35);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(width - 30, 20); ctx.lineTo(width - 15, 20); ctx.lineTo(width - 15, 35);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(30, height - 20); ctx.lineTo(15, height - 20); ctx.lineTo(15, height - 35);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(width - 30, height - 20); ctx.lineTo(width - 15, height - 20); ctx.lineTo(width - 15, height - 35);
        ctx.stroke();

        // Draw camera identifier
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`MOCK REPLICA — CAM: ${activeCam.name}`, 30, 45);
      }

      // Draw real or simulated active motion protection zones
      const zone = { x: 320, y: 100, w: 260, h: 240 };
      // Live Computer Vision processing for Webcam (When online & enabled)
      if (activeCam.isWebcam && webcamStream && video && video.readyState >= 2 && aiEnabled) {
        try {
          const currentFrame = ctx.getImageData(0, 0, width, height);
          const data = currentFrame.data;

          // --- 1. PERSON / MOTION DETECTION MODULE ---
          if (personDetection && lastFrameData) {
            let motionSegmentsX: number[] = [];
            let motionSegmentsY: number[] = [];

            // Sample pixels to compute movement areas (avoid processing everything to maintain high FPS)
            for (let i = 0; i < data.length; i += 32) {
              const rDiff = Math.abs(data[i] - lastFrameData[i]);
              const gDiff = Math.abs(data[i+1] - lastFrameData[i+1]);
              const bDiff = Math.abs(data[i+2] - lastFrameData[i+2]);
              const diff = (rDiff + gDiff + bDiff) / 3;

              if (diff > 45) {
                const pxIndex = i / 4;
                const pxX = pxIndex % width;
                const pxY = Math.floor(pxIndex / width);
                motionSegmentsX.push(pxX);
                motionSegmentsY.push(pxY);
              }
            }

            // If substantial motion is detected, create/update persistent people trackers
            if (motionSegmentsX.length > 120) {
              const pts = motionSegmentsX.map((x, idx) => ({ x, y: motionSegmentsY[idx] }));
              const clusters = getGridClusters(pts, 64, 60, 10, 8, 3);
              const detectedPeople = clusters.filter(c => c.width >= 70 && c.width <= 320 && c.height >= 95 && c.height <= 480 && c.height > c.width * 1.05);

              if (detectedPeople.length > 0) {
                detectedPeople.forEach((newPerson) => {
                  let matched = false;
                  for (let p of persistentPeopleRef.current) {
                    const dist = Math.hypot(p.centerX - newPerson.centerX, p.centerY - newPerson.centerY);
                    // Match if same rough location
                    if (dist < 120) {
                      p.minX = newPerson.minX;
                      p.minY = newPerson.minY;
                      p.maxX = newPerson.maxX;
                      p.maxY = newPerson.maxY;
                      p.width = newPerson.width;
                      p.height = newPerson.height;
                      p.centerX = newPerson.centerX;
                      p.centerY = newPerson.centerY;
                      p.age = 12; // Keep alive for 12 frames (~200ms) of no motion
                      matched = true;
                      break;
                    }
                  }
                  if (!matched) {
                    persistentPeopleRef.current.push({
                      ...newPerson,
                      age: 12
                    });
                  }
                });
              }
            }

            // Age the persistent trackers and filter out expired ones
            persistentPeopleRef.current.forEach(p => p.age--);
            persistentPeopleRef.current = persistentPeopleRef.current.filter(p => p.age > 0);

            // Update human count
            setPersonCount(persistentPeopleRef.current.length);

            // Draw all persistent people
            persistentPeopleRef.current.forEach((person) => {
              const { minX, minY, width: boxW, height: boxH, centerX, centerY } = person;
              const label = 'Адам';

              // Smooth drawing bounding box
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 3;
              ctx.strokeRect(minX, minY, boxW, boxH);

              // Overlay tag
              ctx.fillStyle = '#10b981';
              ctx.fillRect(minX, minY - 24, 70, 24);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 11px monospace';
              ctx.fillText(`${label}`, minX + 8, minY - 8);

              // Center tracking crosshair
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
              ctx.stroke();

              // Trigger event logging occasionally (throttle to prevent log flood)
              if (frameCounter % 60 === 0) {
                addLog('motion', `Қозғалыс белсенділігі [${label}]: координата X: ${Math.round(centerX)}px, Y: ${Math.round(centerY)}px`, { x: minX, y: minY, w: boxW, h: boxH });
                setTotalDetections(prev => prev + 1);
              }
            });
          } else {
            persistentPeopleRef.current = [];
            setPersonCount(0);
          }

          // --- 2. FIRE / FLAME PIXEL HEURISTIC ENGINE (REAL MATCH / LIGHTER DETECTION) ---
          if (fireDetection) {
            let flameXCount: number[] = [];
            let flameYCount: number[] = [];

            // Scan pixels dynamically searching for high luminosity orange/yellow match & lighter flame cores
            for (let i = 0; i < data.length; i += 16) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Balanced Flame Heuristics standard camera tuning:
              const isFlame = (r > 215 && g > 120 && b < 70 && r > g + 30 && g > b + 15) || // genuine orange flame
                              (r > 240 && g > 170 && b < 100 && r > g + 20) || // bright golden flame
                              (r > 250 && g > 240 && b > 140 && r - g < 20 && g - b > 50); // intense white-to-yellow flame core

              if (isFlame) {
                const pxIndex = i / 4;
                const pxX = pxIndex % width;
                const pxY = Math.floor(pxIndex / width);
                flameXCount.push(pxX);
                flameYCount.push(pxY);
              }
            }

            // Check if we registered a cluster representing a match or lighter flame.
            // A real lighter/match flame is small in scale. If flameXCount.length is very large (e.g. >110 sampled pixels),
            // it indicates a massive yellow background object/clothing rather than a small flame. We filter it out.
            if (flameXCount.length >= 3 && flameXCount.length <= 110) {
              const pts = flameXCount.map((x, idx) => ({ x, y: flameYCount[idx] }));
              const clusters = getGridClusters(pts, 32, 30, 20, 16, 2);
              const detectedFires = clusters.filter(c => c.width >= 10 && c.width <= 65 && c.height >= 10 && c.height <= 65);

              if (detectedFires.length > 0) {
                detectedFires.forEach((newFire) => {
                  let matched = false;
                  for (let f of persistentFiresRef.current) {
                    const dist = Math.hypot(f.centerX - newFire.centerX, f.centerY - newFire.centerY);
                    if (dist < 60) {
                      f.minX = newFire.minX;
                      f.minY = newFire.minY;
                      f.maxX = newFire.maxX;
                      f.maxY = newFire.maxY;
                      f.width = newFire.width;
                      f.height = newFire.height;
                      f.centerX = newFire.centerX;
                      f.centerY = newFire.centerY;
                      f.age = 12; // keep alive for 12 frames (~200ms)
                      matched = true;
                      break;
                    }
                  }
                  if (!matched) {
                    persistentFiresRef.current.push({
                      ...newFire,
                      age: 12
                    });
                  }
                });
              }
            }

            // Age the persistent fires and clean up
            persistentFiresRef.current.forEach(f => f.age--);
            persistentFiresRef.current = persistentFiresRef.current.filter(f => f.age > 0);

            const hasActiveFires = persistentFiresRef.current.length > 0;

            if (hasActiveFires) {
              persistentFiresRef.current.forEach((fire, index) => {
                const { minX, minY, width: fireW, height: fireH, centerX: fireCenterX, centerY: fireCenterY } = fire;
                const label = `От ${index + 1}`;

                // Visual overlay heat concentric circles (with cool breathing transparency)
                ctx.save();
                const pulse = 0.45 + Math.sin(Date.now() / 90) * 0.2;
                ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
                ctx.beginPath();
                ctx.arc(fireCenterX, fireCenterY, Math.min(100, (fireW + fireH) / 1.5), 0, 2 * Math.PI);
                ctx.fill();

                // Red bold glowing border box
                ctx.strokeStyle = '#dc2626';
                ctx.lineWidth = 4;
                ctx.strokeRect(minX, minY, fireW, fireH);

                // Sub-radar dotted target box
                ctx.strokeStyle = '#f97316';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 3]);
                ctx.beginPath();
                ctx.arc(fireCenterX, fireCenterY, Math.min(50, (fireW + fireH) / 2.2), 0, 2 * Math.PI);
                ctx.stroke();

                // High priority danger tag overlay
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(minX, minY - 26, 80, 26);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px system-ui, sans-serif';
                ctx.fillText(`⚠️ ${label}`, minX + 6, minY - 8);
                ctx.restore();

                // Trigger logs & state on state transition
                if (!realFireDetectedRef.current) {
                  realFireDetectedRef.current = true;
                  setRealFireDetected(true);
                  addLog('fire', `ҚАУІП: Камерадан ${label} (зажигалка немесе сіріңке) анықталды! Координаталары: (Х: ${Math.round(fireCenterX)} Y: ${Math.round(fireCenterY)})`, {
                    x: minX, y: minY, w: fireW, h: fireH
                  });
                  setTotalDetections(prev => prev + 1);
                }
              });
            } else {
              if (realFireDetectedRef.current) {
                realFireDetectedRef.current = false;
                setRealFireDetected(false);
                addLog('system', 'От белгілері сейілді. Қоршаған орта қауіпсіз.');
              }
            }
          } else {
            persistentFiresRef.current = [];
            if (realFireDetectedRef.current) {
              realFireDetectedRef.current = false;
              setRealFireDetected(false);
            }
          }

          lastFrameData = data;
        } catch (e) {
          console.error('Real-time computer vision processing error:', e);
        }
      }

      // Simulated or Forced Person Analysis overlay
      if (forcePerson || (!activeCam.isWebcam && aiEnabled)) {
        // Render 2 simulated walking bounding boxes of college corridors
        const time = Date.now() / 1500;

        // --- Simulated Person 1 ---
        const fakeX1 = 180 + Math.sin(time) * 120;
        const fakeY1 = 160 + Math.cos(time * 0.5) * 15;
        const fakeW1 = 90;
        const fakeH1 = 200;

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(fakeX1, fakeY1, fakeW1, fakeH1);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(fakeX1, fakeY1 - 24, 70, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Адам`, fakeX1 + 8, fakeY1 - 8);

        // Center visual dot 1
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(fakeX1 + fakeW1/2, fakeY1 + fakeH1/2, 5, 0, 2 * Math.PI);
        ctx.fill();

        // --- Simulated Person 2 ---
        const fakeX2 = 380 + Math.cos(time * 0.8) * 80;
        const fakeY2 = 200 + Math.sin(time * 0.4) * 10;
        const fakeW2 = 80;
        const fakeH2 = 180;

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(fakeX2, fakeY2, fakeW2, fakeH2);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(fakeX2, fakeY2 - 24, 70, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Адам`, fakeX2 + 8, fakeY2 - 8);

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(fakeX2 + fakeW2/2, fakeY2 + fakeH2/2, 5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Simulated or Forced Fire Analysis (With glowing bounds, threat indicators, and red warning light)
      if (forceFire) {
        // --- Simulated Fire 1 ---
        const fireX1 = 200;
        const fireY1 = 240;
        const fireSize1 = 100;

        // Visual Heat Zone (flashing transparency)
        const alpha1 = 0.3 + Math.sin(Date.now() / 100) * 0.15;
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha1})`;
        ctx.beginPath();
        ctx.arc(fireX1, fireY1, fireSize1 / 1.5, 0, 2*Math.PI);
        ctx.fill();

        // Glowing red target box
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 4;
        ctx.strokeRect(fireX1 - fireSize1/2, fireY1 - fireSize1/2, fireSize1, fireSize1);

        // Label Tag
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(fireX1 - fireSize1/2, fireY1 - fireSize1/2 - 28, 110, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`⚠️ От 1 (99%)`, fireX1 - fireSize1/2 + 8, fireY1 - fireSize1/2 - 10);

        // --- Simulated Fire 2 ---
        const fireX2 = 460;
        const fireY2 = 190;
        const fireSize2 = 90;

        // Visual Heat Zone (flashing transparency)
        const alpha2 = 0.3 + Math.sin(Date.now() / 120) * 0.15;
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha2})`;
        ctx.beginPath();
        ctx.arc(fireX2, fireY2, fireSize2 / 1.5, 0, 2*Math.PI);
        ctx.fill();

        // Glowing red target box
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 4;
        ctx.strokeRect(fireX2 - fireSize2/2, fireY2 - fireSize2/2, fireSize2, fireSize2);

        // Label Tag
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(fireX2 - fireSize2/2, fireY2 - fireSize2/2 - 28, 110, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`⚠️ От 2 (98%)`, fireX2 - fireSize2/2 + 8, fireY2 - fireSize2/2 - 10);
      }

      // Fire Warning Alert Banner (Either forced or real webcam flame detected)
      if (forceFire || realFireDetected) {
        // Danger flashing alert banner on preview top
        ctx.save();
        ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';
        ctx.fillRect(0, 0, width, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ТӨТЕНШЕ ЖАҒДАЙ: КАМЕРАДАН ӨРТ БЕЛГІСІ АНЫҚТАЛДЫ! ДАБЫЛ ҚОСУЛЫ', width/2, 25);
        ctx.restore();
      }

      // AI Status Watermark in Bottom
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(0, height - 30, width, 30);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`AI ENGINE CLOUD V4 : FEED BUFFER ONLINE | STABLE`, 20, height - 11);
      
      const statString = `FPS: 30 | DETECTIONS: ${totalDetections}`;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(statString, width - 180, height - 11);

      frameCounter++;
      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [activeCam, webcamStream, aiEnabled, personDetection, fireDetection, forceFire, forcePerson]);

  // Test notification triggers
  const triggerNotification = (method: 'SMS' | 'EMAIL' | 'PUSH') => {
    addLog('system', `[AI ТЕСТ] Студенттер мен қызметкерлерге ${method} желісі арқылы шұғыл ескерту хабарламалары жолданды.`);
    alert(`Ескерту: ${method} хабарландыруы жіберілді!\n"Колледждегі автоматты қауіпсіздік жүйесі сынамалы белгіні тіркеді."`);
  };

  // Add custom AI Module
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName) return;

    const id = 'custom_' + Date.now();
    const newMod: AIModule = {
      id,
      name: newModuleName,
      enabled: true,
      status: 'active',
      description: newModuleDesc || 'Сынамалы жаңа AI аналитика модулі',
      color: newModuleColor,
    };

    setAiModules(prev => [...prev, newMod]);
    addLog('system', `Жаңа AI аналитика модулі сәтті қосылды: "${newModuleName}"`);
    setNewModuleName('');
    setNewModuleDesc('');
    setShowAddModuleModal(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* Header section with real time status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-5 h-5" /> 
            Интеллектуалды қауіпсіздік
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">AI Бейнебақылау</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-xl">
            Ноутбук камерасын немесе колледж сыртқы камераларын тікелей эфирде қосып, нақты уақытта адам/от белгілерін бақылау және оқиғаларды журналдау.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Бейне Талданғыш Қосулы
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
            Дәлдік: 99.4%
          </div>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Real Live Feed Player Area - Column spans 3 */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800">
            {/* Top Stats & Camera Indicators Overlay */}
            <div className="absolute top-5 left-5 right-5 z-20 flex flex-wrap justify-between items-center gap-2">
              <div className="flex gap-2 items-center">
                <span className="bg-red-600 text-white text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-md uppercase flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  ТІКЕЛЕЙ ЭФИР
                </span>
                <span className="bg-slate-900/90 text-slate-300 text-xs font-bold tracking-normal px-3 py-1 rounded-md border border-slate-700/80 backdrop-blur-md">
                  CAM: {activeCam.name}
                </span>
              </div>
              
              <div className="bg-slate-900/90 text-emerald-400 text-xs font-mono px-3 py-1 rounded-md border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                Жүйе кідірісі: 0.12s
              </div>
            </div>

            {/* Simulated Live Display (HTML5 Canvas Rendering) */}
            <div className="w-full relative bg-[#090d16] aspect-video flex items-center justify-center">
              {/* Actual invisible Video element used to back feeding into Canvas */}
              {activeCam.isWebcam && (
                <video 
                  ref={videoRef} 
                  className="hidden" 
                  autoPlay 
                  playsInline 
                  muted 
                />
              )}

              {/* Render Canvas display */}
              <canvas 
                ref={canvasRef} 
                className="w-full h-full object-contain"
                width={640}
                height={480}
              />

              {/* Graceful Webcam Permission Overlay Error */}
              {activeCam.isWebcam && webcamError && (
                <div className="absolute inset-x-4 bottom-5 bg-slate-900/95 border border-slate-805/80 p-4 rounded-xl backdrop-blur-xs flex items-center gap-3 z-10">
                  <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                  <p className="text-white text-xs">{webcamError}</p>
                </div>
              )}
            </div>

            {/* Quick action buttons underneath preview stream */}
            <div className="p-4 bg-slate-900 border-t border-slate-850 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => {
                    setForcePerson(prev => {
                      const next = !prev;
                      if (next) {
                        addLog('person', 'Жасанды адам симуляциясы іске қосылды.');
                      } else {
                        addLog('system', 'Жасанды адам симуляциясы тоқтатылды.');
                      }
                      return next;
                    });
                  }}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer",
                    forcePerson ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  )}
                >
                  <Users className="w-4 h-4" />
                  {forcePerson ? "Адамды өшіру" : "Адам қозғалысын сынау"}
                </button>

                <button 
                  onClick={() => {
                    setForceFire(prev => {
                      const next = !prev;
                      if (next) {
                        addLog('fire', 'ӨРТ СИМУЛЯЦИЯСЫ: Камерадан түтін және от ошақтары тіркелді! ДАБЫЛ ЖАСАЛДЫ.');
                      } else {
                        addLog('system', 'Өрт симуляциясы өшірілді.');
                      }
                      return next;
                    });
                  }}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer",
                    forceFire ? "bg-red-600 text-white hover:bg-red-700 animate-pulse" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  )}
                >
                  <Flame className="w-4 h-4" />
                  {forceFire ? "Сынамалы Отты өшіру" : "От ошағын сынау"}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Дыбысты дабыл:</span>
                <button
                  onClick={() => {
                    setSoundSiren(!soundSiren);
                    addLog('system', `Дыбысты дабыл сигналы ${!soundSiren ? 'ҚОСЫЛДЫ' : 'ӨШІРІЛДІ'}.`);
                  }}
                  className={clsx(
                    "p-2 rounded-xl transition-all cursor-pointer",
                    soundSiren ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-slate-800 text-slate-500"
                  )}
                  title={soundSiren ? "Сирена қосулы" : "Сирена өшірулі"}
                >
                  {soundSiren ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* AI Analytics Interactive Control Panel Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-950 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              AI Интерактивті Басқару Панелі
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-800">Адамды анықтау модулі</div>
                  <div className="text-xs text-slate-500 mt-0.5">Live Траектория сызуы</div>
                </div>
                <button 
                  onClick={() => {
                    setPersonDetection(!personDetection);
                    addLog('system', `Адамды тану аналитикасы ${!personDetection ? 'қосылды' : 'сөндірілді'}`);
                  }}
                  className={clsx(
                    "w-11 h-6 rounded-full transition-all relative",
                    personDetection ? "bg-emerald-500" : "bg-slate-300"
                  )}
                >
                  <span className={clsx("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", personDetection ? "right-1" : "left-1")} />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-800">Түтін мен От бақылаушысы</div>
                  <div className="text-xs text-slate-500 mt-0.5">Пиксельді сканер</div>
                </div>
                <button 
                  onClick={() => {
                    setFireDetection(!fireDetection);
                    addLog('system', `Өртті оптикалық бақылаушы ${!fireDetection ? 'іске қосылды' : 'уақытша өшірілді'}`);
                  }}
                  className={clsx(
                    "w-11 h-6 rounded-full transition-all relative",
                    fireDetection ? "bg-emerald-500" : "bg-slate-300"
                  )}
                >
                  <span className={clsx("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", fireDetection ? "right-1" : "left-1")} />
                </button>
              </div>
            </div>

            {/* Secondary Advanced action test zones */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Қосымша шұғыл ескерту функцияларын сынау</div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => triggerNotification('SMS')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ☎️ SMS жіберу
                </button>
                <button
                  onClick={() => triggerNotification('EMAIL')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ✉️ Email жіберу
                </button>
                <button
                  onClick={() => triggerNotification('PUSH')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  🔔 Тест Push хабарландыруы
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Camera List & AI Analytics Module Builder Sidebar - Column spans 1 */}
        <div className="space-y-6">
          {/* Active Camera Selector Hub */}
          <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Бейне арнасын таңдаңыз</div>
            
            <div className="space-y-2.5">
              {camerasList.map((cam) => {
                const isActive = activeCam.id === cam.id;
                return (
                  <button
                    key={cam.id}
                    onClick={() => setActiveCam(cam)}
                    className={clsx(
                      "w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer",
                      isActive 
                        ? "bg-slate-950 border-slate-900 text-white shadow-lg" 
                        : "bg-slate-50/60 border-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                        isActive ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600 group-hover:bg-slate-300"
                      )}>
                        {cam.isWebcam ? <Camera className="w-4.5 h-4.5 animate-pulse" /> : <Video className="w-4.5 h-4.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs leading-normal">
                          {cam.name}
                        </div>
                        <div className={clsx("text-[10px] flex items-center gap-1 mt-0.5 font-medium", isActive ? "text-indigo-400" : "text-slate-500")}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Талдау белсенді
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={clsx("w-4 h-4 transition-transform", isActive ? "translate-x-0.5 text-white" : "text-slate-400 group-hover:translate-x-0.5")} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Modular Extension Sandbox */}
          <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Аналитика Модульдері</div>
              <button 
                onClick={() => setShowAddModuleModal(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-extrabold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Жаңа модуль
              </button>
            </div>

            <div className="space-y-3">
              {aiModules.map((mod) => (
                <div key={mod.id} className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl flex flex-col justify-between">
                  <div className="flex gap-2 items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span className={clsx("w-2 h-2 rounded-full", {
                        'bg-emerald-500': mod.color === 'emerald',
                        'bg-red-500': mod.color === 'red',
                        'bg-cyan-500': mod.color === 'cyan',
                        'bg-amber-500': mod.color === 'amber',
                        'bg-indigo-500': mod.color === 'indigo',
                      })} />
                      {mod.name}
                    </span>
                    <button 
                      onClick={() => {
                        setAiModules(prev => prev.map(m => m.id === mod.id ? { ...m, enabled: !m.enabled } : m));
                        addLog('system', `"${mod.name}" AI модулі ${!mod.enabled ? 'іске қосылды' : 'өшірілді'}`);
                      }}
                      className={clsx(
                        "text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                        mod.enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {mod.enabled ? "ҚОСУЛЫ" : "ӨШІРУЛІ"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                    {mod.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Log Terminal at bottom of page */}
      <div className="bg-slate-950 rounded-3xl p-6 shadow-2xl border border-slate-850">
        <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <h3 className="text-sm font-bold text-slate-200 font-mono tracking-wider">AI СИСТЕМАЛЫҚ ОҚИҒАЛАР ЖУРНАЛЫ (LIVE LOGS)</h3>
          </div>
          <button 
            onClick={() => {
              setLogs([]);
              addLog('system', 'Оқиғалар журналы сәтті тазартылды.');
            }}
            className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Журналды тазалау
          </button>
        </div>

        <div className="font-mono text-xs text-slate-400 space-y-1.5 h-[160px] overflow-y-auto pr-2 custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 leading-normal hover:bg-slate-900 px-2 py-0.5 rounded-md transition-colors">
              <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
              <span className={clsx("font-bold uppercase tracking-wider text-[10px] shrink-0 w-16", {
                'text-blue-400': log.type === 'info',
                'text-emerald-400': log.type === 'person',
                'text-red-500': log.type === 'fire',
                'text-amber-500': log.type === 'motion',
                'text-slate-500': log.type === 'system',
              })}>
                {log.type}
              </span>
              <span className="text-slate-300">
                {log.message}
                {log.coords && (
                  <span className="text-[10px] text-slate-500 ml-2 font-mono">
                    (X: {log.coords.x} Y: {log.coords.y} W: {log.coords.w} H: {log.coords.h})
                  </span>
                )}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-600 py-12 text-center select-none font-bold">Бұл орында ешқандай оқиға жоқ</div>
          )}
        </div>
      </div>

      {/* Modal dialog for adding custom AI Surveillance Module */}
      <AnimatePresence>
        {showAddModuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full border border-slate-200"
            >
              <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <Plus className="text-indigo-400 w-5 h-5" />
                  <span className="font-extrabold text-lg">Жаңа AI Бақылау Модулі</span>
                </div>
                <button 
                  onClick={() => setShowAddModuleModal(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddModule} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-1">
                    Модуль атауы (Қазақша)
                  </label>
                  <input 
                    type="text" 
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    placeholder="Жүкті анықтау, Күдікті адам, т.б."
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-1">
                    Анықтама сипаттамасы
                  </label>
                  <textarea 
                    value={newModuleDesc}
                    onChange={(e) => setNewModuleDesc(e.target.value)}
                    placeholder="Бұл модуль камера өрісіндегі қандай оқиғаны бақылайды..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-1">
                    Индикаторлық Түс белгісі
                  </label>
                  <div className="flex gap-3 mt-2">
                    {['indigo', 'emerald', 'cyan', 'amber', 'red'].map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setNewModuleColor(clr)}
                        className={clsx(
                          "w-8 h-8 rounded-full transition-all border-2 flex items-center justify-center cursor-pointer",
                          newModuleColor === clr ? "border-slate-800 scale-110" : "border-transparent",
                          {
                            'bg-indigo-600': clr === 'indigo',
                            'bg-emerald-500': clr === 'emerald',
                            'bg-cyan-500': clr === 'cyan',
                            'bg-amber-500': clr === 'amber',
                            'bg-red-500': clr === 'red',
                          }
                        )}
                        title={clr}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModuleModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                  >
                    Бас тарту
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold text-white shadow-md transition-colors"
                  >
                    Модульді жүйеге енгізу
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
