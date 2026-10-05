import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, ZoomIn, Map, X } from 'lucide-react';

// @ts-ignore
import floorPlan1 from '../assets/images/evacuation_floor_1_1779363044807.png';
// @ts-ignore
import floorPlan3 from '../assets/images/evacuation_floor_3_1779363075468.png';
// @ts-ignore
import floorPlan4 from '../assets/images/evacuation_floor_4_1779363099876.png';
// @ts-ignore
import floorPlan5 from '../assets/images/evacuation_floor_5_1779363120250.png';

interface Floor {
  id: number;
  name: string;
}

const DEFAULT_FLOOR_PLANS: Record<number, string> = {
  1: floorPlan1,
  3: floorPlan3,
  4: floorPlan4,
  5: floorPlan5
};

export function Evacuation() {
  const [zoomedFloor, setZoomedFloor] = useState<Floor | null>(null);

  const floors: Floor[] = [
    { id: 1, name: '1-ші қабат' },
    { id: 3, name: '3-ші қабат' },
    { id: 4, name: '4-ші қабат' },
    { id: 5, name: '5-ші қабат' },
  ];

  const handleDownload = (floorName: string, floorId: number) => {
    const activeUrl = DEFAULT_FLOOR_PLANS[floorId];
    if (activeUrl) {
      const link = document.createElement('a');
      link.href = activeUrl;
      link.download = `${floorName}-evacuation-plan.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 animate-fade-in"
    >
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-950 mb-4 tracking-tight">Эвакуация жоспары</h1>
        <p className="text-lg text-slate-600">
          Төтенше жағдай кезінде ғимараттан қауіпсіз шығу сызбалары.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {floors.map((floor) => {
          const activeSrc = DEFAULT_FLOOR_PLANS[floor.id];

          return (
            <div key={floor.id} className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 group flex flex-col justify-between h-full hover:shadow-lg transition-shadow">
              <div className="relative h-72 overflow-hidden bg-slate-900 flex items-center justify-center p-3">
                <div className="w-full h-full flex items-center justify-center bg-slate-950">
                  <img
                    src={activeSrc}
                    alt={floor.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain pointer-events-none rounded-lg"
                  />
                </div>

                {/* Overlaid quick utility action buttons */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-xs">
                  <button 
                    onClick={() => setZoomedFloor(floor)}
                    className="bg-white text-slate-950 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title="Үлкейтіп көру"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    Көру
                  </button>
                  <button 
                    onClick={() => handleDownload(floor.name, floor.id)}
                    className="bg-blue-600 text-white px-3.5 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                    title="Бұл планды жүктеу"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Жүктеу
                  </button>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-slate-950">{floor.name}</h3>
                  </div>
                  <p className="text-slate-500 text-xs flex items-center gap-2 mt-4">
                    <Map className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Шығу эвакуациялық жолдары мен өртке қарсы құралдардың орналасу орындары.</span>
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => setZoomedFloor(floor)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                    Үлкейтіп көру
                  </button>
                  <button
                    onClick={() => handleDownload(floor.name, floor.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Картаны жүктеу
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {zoomedFloor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-6xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]"
            >
              <div className="p-6 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <Map className="w-6 h-6 text-blue-400 animate-pulse" />
                  <div>
                    <h3 className="text-xl font-bold">{zoomedFloor.name} — Эвакуация жоспары</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setZoomedFloor(null)}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6 text-slate-300 hover:text-white" />
                </button>
              </div>

              <div className="overflow-auto p-6 bg-slate-950 flex justify-center items-center min-h-[450px]">
                <div className="w-full max-w-5xl">
                  <img
                    src={DEFAULT_FLOOR_PLANS[zoomedFloor.id]}
                    alt={zoomedFloor.name}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[70vh] object-contain mx-auto rounded-lg"
                  />
                </div>
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center sm:flex-row flex-col gap-4 shrink-0">
                <p className="text-sm text-slate-600 max-w-xl">
                  Қауіпсіздік ережелеріне сәйкес, нұсқағыштар арқылы ең жақын эвакуациялық шығу жолына жылдам қозғалыңыз.
                </p>
                <button
                  onClick={() => handleDownload(zoomedFloor.name, zoomedFloor.id)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Бұл жоспарды жүктеу
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
        <h3 className="text-2xl font-bold text-blue-900 mb-6">Эвакуация кезіндегі негізгі ережелер</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">1</div>
            <p className="text-blue-800">Дүрбелеңге түспеңіз. Сабыр сақтап, мұғалімнің нұсқауларын тыңдаңыз.</p>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">2</div>
            <p className="text-blue-800">Жеке заттарыңызды жинауға уақыт жұмсамаңыз. Ең бастысы — өмір.</p>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">3</div>
            <p className="text-blue-800">Жасыл түсті «ШЫҒУ» (ВЫХОД) белгілерін басшылыққа ала отырып қозғалыңыз.</p>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">4</div>
            <p className="text-blue-800">Ғимараттан шыққан соң, белгіленген жиналу нүктесіне барыңыз (Автотұрақ).</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
