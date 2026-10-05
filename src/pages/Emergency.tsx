import { motion } from 'motion/react';
import { Flame, Activity, ShieldAlert, HeartPulse, Tornado } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const categories = [
  { id: 'fire', icon: Flame, title: 'Өрт', color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'earthquake', icon: Activity, title: 'Жер сілкінісі', color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'terror', icon: ShieldAlert, title: 'Террорлық қауіп', color: 'text-slate-800', bg: 'bg-slate-100' },
  { id: 'medical', icon: HeartPulse, title: 'Медициналық көмек', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'nature', icon: Tornado, title: 'Табиғи апаттар', color: 'text-blue-500', bg: 'bg-blue-50' },
];

const instructions: Record<string, string[]> = {
  fire: [
    'Дабыл түймесін басыңыз немесе 101 нөміріне қоңырау шалыңыз.',
    'Дүрбелеңге түспей, ғимараттан эвакуация жоспарына сай шығыңыз.',
    'Түтін болған жағдайда, еңкейіп немесе еңбектеп қозғалыңыз.',
    'Ауыз бен мұрынды дымқыл шүберекпен жабыңыз.',
    'Лифтті пайдаланбаңыз, тек баспалдақпен түсіңіз.',
  ],
  earthquake: [
    'Ғимарат ішінде болсаңыз: мықты үстелдің астына кіріңіз немесе ішкі қабырғаның бұрышына тұрыңыз.',
    'Терезелерден, айналардан және құлауы мүмкін заттардан аулақ болыңыз.',
    'Дүмпулер аяқталған соң ғана ғимараттан шығыңыз.',
    'Далада болсаңыз: ғимараттардан, ағаштардан және электр желілерінен алыс тұрыңыз.',
  ],
  terror: [
    'Күдікті зат көрсеңіз, оған тиіспеңіз және күзетке хабарлаңыз.',
    'Атыс кезінде: еденге жатыңыз, терезелерден алыс болыңыз.',
    'Мүмкіндік болса, қауіпсіз жерге тығылыңыз және есікті құлыптаңыз.',
    'Телефон дыбысын өшіріңіз.',
    'Полиция келгенде, қолдарыңызды көрінетіндей етіп ұстаңыз, күрт қимыл жасамаңыз.',
  ],
  medical: [
    'Жедел жәрдем шақырыңыз (103) немесе медпунктке хабарласыңыз.',
    'Зардап шеккен адамды қауіпсіз жерге орналастырыңыз.',
    'Қажет болса, алғашқы көмек көрсетіңіз (егер білсеңіз).',
    'Дәрігерлер келгенше қасында болыңыз.',
  ],
  nature: [
    'Дауыл кезінде: ғимарат ішінде қалыңыз, терезелерден аулақ болыңыз.',
    'Су тасқыны кезінде: жоғары қабаттарға немесе төбеге көтеріліңіз.',
    'Радио немесе теледидар арқылы ресми ақпаратты тыңдаңыз.',
  ],
};

export function Emergency() {
  const [activeTab, setActiveTab] = useState('fire');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Төтенше жағдай әрекеттері</h1>
        <p className="text-lg text-slate-600">Әртүрлі қауіпті жағдайларда өзіңізді және өзгелерді қалай қорғау керектігі туралы қадамдық нұсқаулар.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={clsx(
                'flex flex-col items-center justify-center p-6 rounded-3xl transition-all border-2',
                isActive 
                  ? `${cat.bg} border-${cat.color.split('-')[1]}-500 shadow-md scale-105` 
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              )}
            >
              <Icon className={clsx('w-10 h-10 mb-3', isActive ? cat.color : 'text-slate-400')} />
              <span className={clsx('text-sm font-bold text-center', isActive ? 'text-slate-900' : 'text-slate-500')}>
                {cat.title}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          {categories.find(c => c.id === activeTab)?.icon && (
            <div className={clsx('w-16 h-16 rounded-2xl flex items-center justify-center', categories.find(c => c.id === activeTab)?.bg)}>
              {(() => {
                const Icon = categories.find(c => c.id === activeTab)?.icon;
                return Icon ? <Icon className={clsx('w-8 h-8', categories.find(c => c.id === activeTab)?.color)} /> : null;
              })()}
            </div>
          )}
          <h2 className="text-3xl font-bold text-slate-900">
            {categories.find(c => c.id === activeTab)?.title} кезіндегі әрекеттер
          </h2>
        </div>

        <div className="space-y-6">
          {instructions[activeTab].map((step, index) => (
            <div key={index} className="flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-lg">
                {index + 1}
              </div>
              <p className="text-lg text-slate-700 pt-1 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
