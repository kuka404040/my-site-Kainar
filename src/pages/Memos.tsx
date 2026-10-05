import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Download, User, GraduationCap, CheckCircle, Award, ShieldAlert,
  Info, Calendar, Hash, Notebook, Sparkles, AlertTriangle, LogIn, Flame, Eye
} from 'lucide-react';
import { generateKainarRulesPDF, generateKainarTeacherRulesPDF } from '../utils/pdfGenerator';
import { clsx } from 'clsx';

export function Memos() {
  // Personalization form state
  const [studentName, setStudentName] = useState('');
  const [studentGroup, setStudentGroup] = useState('');
  const [studentTicket, setStudentTicket] = useState('');
  const [signDate, setSignDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Preview Page index (1 to 7)
  const [activePreviewPage, setActivePreviewPage] = useState(1);

  const [isGeneratingTeacher, setIsGeneratingTeacher] = useState(false);

  // Trigger Teacher PDF build
  const handleGenerateTeacherPDF = async () => {
    setIsGeneratingTeacher(true);
    setSuccessMsg(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 850));
      await generateKainarTeacherRulesPDF();
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 5000);
    } catch (err) {
      console.error(err);
      alert('PDF генерациялау кезінде қате орын алды.');
    } finally {
      setIsGeneratingTeacher(false);
    }
  };

  // Trigger PDF build
  const handleGeneratePDF = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setSuccessMsg(false);
    
    try {
      // Simulate small progress buffer for premium UI look
      await new Promise(resolve => setTimeout(resolve, 850));
      await generateKainarRulesPDF(
        studentName.trim() || undefined,
        studentGroup.trim() || undefined,
        studentTicket.trim() || undefined,
        signDate || undefined
      );
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 5000);
    } catch (err) {
      console.error(err);
      alert('PDF генерациялау кезінде қате орын алды.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-12"
    >
      {/* Upper Brand Info Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        <div>
          <div className="flex items-center gap-1.5 text-blue-400 text-sm font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-5 h-5" /> 
            Қауіпсіздік Баспасы
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Қауіпсіздік Ережелері</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl leading-relaxed">
            Жоғары Колледж «Қайнар» студенттеріне арналған ресми қауіпсіздік ережелері мен нұсқаулықтар жинағы. Мұнда сіз ережелерді оқып, сандық түрде танысып, өзіңізге арналған жеке PDF құжатын жүктей аласыз.
          </p>
        </div>
        <button 
          onClick={() => handleGeneratePDF()}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 uppercase tracking-wider cursor-pointer shrink-0"
        >
          {isGenerating ? (
            <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-white animate-spin" />
          ) : (
            <Download className="w-4.5 h-4.5" />
          )}
          Жалпы PDF жүктеу
        </button>
      </div>

      {/* Main Grid: Form Left, PDF Interactive Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Personalization & Interactive Signer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                <div className="w-11 h-11 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950">Сандық Танысу Формасы</h3>
                  <p className="text-xs text-slate-500">Мәліметтерді енгізіп, жеке PDF-ті алыңыз</p>
                </div>
              </div>

              <form onSubmit={handleGeneratePDF} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    Студенттің Толық Аты-жөні
                  </label>
                  <div className="relative">
                    <User className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Мысалы: Асанәлі Төлегенұлы"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    Оқу Тобы / Мамандығы
                  </label>
                  <div className="relative">
                    <Notebook className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="text" 
                      value={studentGroup}
                      onChange={(e) => setStudentGroup(e.target.value)}
                      placeholder="Мысалы: ВТ-22Б (Есептеу техникасы)"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                      Билет нөмірі
                    </label>
                    <div className="relative">
                      <Hash className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                      <input 
                        type="text" 
                        value={studentTicket}
                        onChange={(e) => setStudentTicket(e.target.value)}
                        placeholder="№ 05421"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                      Қол қойылған Күні
                    </label>
                    <div className="relative">
                      <Calendar className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
                      <input 
                        type="date" 
                        value={signDate}
                        onChange={(e) => setSignDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button 
                    type="submit"
                    disabled={isGenerating}
                    className="w-full bg-slate-950 hover:bg-slate-900 disabled:bg-slate-800 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isGenerating ? (
                      <span className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-white animate-spin" />
                    ) : (
                      <Download className="w-4.5 h-4.5" />
                    )}
                    {studentName ? 'Сенімді қолмен PDF-ті жүктеу' : 'Жеке PDF жүктеп алу'}
                  </button>
                </div>
              </form>
            </div>

            {/* Notification triggers */}
            <div className="mt-8 pt-5 border-t border-slate-100 space-y-3">
              <AnimatePresence>
                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold mb-4"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Құжатыңыз сәтті дайындалды және жүктелді!
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 p-3 bg-indigo-50/50 border border-indigo-100/50 text-indigo-900 rounded-xl text-xs leading-relaxed font-semibold">
                <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>Осы құжатты жүктеп алғанда, 7-ші беттің соңындағы қолтаңба мен аты-жөніңіздің орнына сіз енгізген мәліметтер автоматты түрде ресми басылады.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High Fidelity 7-Page PDF Interactive Viewer Workspace */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-950 rounded-3xl p-5 shadow-2xl border border-slate-850">
            {/* Viewer Head controls */}
            <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="text-white text-xs font-bold font-mono uppercase tracking-widest">
                  Құжат Оқушы: {activePreviewPage} / 7 бет
                </span>
              </div>
              <div className="flex gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                {Array.from({ length: 7 }, (_, i) => i + 1).map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePreviewPage(idx)}
                    className={clsx(
                      "w-6 h-6 rounded-md text-[10px] font-extrabold flex items-center justify-center transition-all cursor-pointer",
                      activePreviewPage === idx 
                        ? "bg-indigo-600 text-white shadow" 
                        : "text-slate-450 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    {idx}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Sheet Body */}
            <div className="bg-white rounded-2xl min-h-[500px] p-6 text-slate-900 border border-slate-800 select-none shadow-inner flex flex-col justify-between">
              
              {/* Inside sheet container header */}
              <div>
                <div className="bg-[#113a70] text-white p-3.5 rounded-lg text-center mb-6 font-bold text-xs uppercase tracking-wider relative">
                  ЖОҒАРЫ КОЛЛЕДЖ «ҚАЙНАР» — ҚАУІПСІЗДІК ЕРЕЖЕЛЕРІ
                  <span className="absolute right-3.5 top-3.5 text-[9px] opacity-75 font-mono">Бет {activePreviewPage}</span>
                </div>

                {/* --- PAGE CONTENTS BASED ON LIVE SELECTIONS --- */}
                {activePreviewPage === 1 && (
                  <div className="space-y-6 animate-fadeIn py-4">
                    <div className="bg-[#113a70] text-center p-6 rounded-xl text-white font-black text-lg shadow-sm">
                      ЖОҒАРЫ КОЛЛЕДЖ «ҚАЙНАР»
                    </div>
                    <div className="h-1 bg-red-600 w-full rounded-full" />
                    
                    <div className="text-center space-y-2">
                      <h4 className="text-base font-extrabold text-slate-950 uppercase tracking-tight">
                        СТУДЕНТТЕРГЕ АРНАЛҒАН ҚАУІПСІЗДІК ЕРЕЖЕЛЕРІ
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto italic">
                        Осы ережелер жиынтығы барлық студенттердің, оқытушылардың және қызметкерлердің колледж аумағында қауіпсіз және тәртіпті жұмыс жасауын қамтамасыз ету мақсатында дайындалған. Ережелерді мұқият оқып, күнделікті тәжірибеде қолданыңыз.
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
                      <div className="bg-slate-900 text-white text-[11px] font-extrabold p-2.5 text-center">Мазмұны</div>
                      <div className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                        {['1. Жалпы қауіпсіздік ережелері', '2. Өртке қарсы қауіпсіздік шаралары', '3. Электр қауіпсіздігі', '4. Денсаулық пен санитарлық нормалар', '5. Зертхана және кабинет қауіпсіздігі', '6. Авариялық алгоритм', '7. Психологиялық мәдениет', '8. Санкциялар мен жауапкершілік'].map((t, idx) => (
                          <div key={idx} className="p-2.5 px-4 bg-slate-50/50 flex justify-between items-center">
                            <span>{t}</span>
                            <span className="text-indigo-600 font-mono text-[10px]">Бет {Math.min(7, idx + 2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewPage === 2 && (
                  <div className="space-y-5 animate-fadeIn text-xs">
                    <div className="bg-indigo-900 text-white p-2 rounded-lg font-extrabold text-[11px] uppercase tracking-wider">
                      1. ЖАЛПЫ ҚАУІПСІЗДІК ЕРЕЖЕЛЕРІ
                    </div>
                    <p className="text-slate-500 italic">Колледж аумағында болған кезде әрбір студент мынадай жалпы ережелерді қатаң сақтауға міндетті:</p>
                    
                    <ul className="space-y-3.5 text-slate-700 font-bold">
                      <li className="flex gap-2.5 items-start">
                        <span className="bg-blue-100 text-blue-800 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                        <span>Колледжге кірерде студенттік билетті көрсетіңіз. Бейтаныстарды кіргізуге болмайды.</span>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="bg-blue-100 text-blue-800 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                        <span>Дәрісханаларда, дәліздерде тәртіп пен үнсіздікті сақтаңыз; оқуға кедергі жасамаңыз.</span>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="bg-blue-100 text-blue-800 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                        <span>Ғимарат ішінде жүгіруге, дауыс шығарып ойнауға тыйым салынады.</span>
                      </li>
                      <li className="flex gap-2.5 items-start">
                        <span className="bg-blue-100 text-blue-800 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                        <span>Күдікті затты көрсеңіз — ұстамаңыз, ашпаңыз, күзетке хабарлаңыз.</span>
                      </li>
                    </ul>

                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex gap-2.5 items-start text-[10px]">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                      <div>
                        <b className="text-red-800 block mb-0.5">НАЗАР АУДАРЫҢЫЗ:</b>
                        <p className="text-slate-700 leading-snug">Қауіпті байқасаңыз, дереу күзетке немесе администрацияға хабарлаңыз.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewPage === 3 && (
                  <div className="space-y-5 animate-fadeIn text-xs">
                    <div className="bg-red-800 text-white p-2 rounded-lg font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4" />
                      2. ӨРТКЕ ҚАРСЫ ҚАУІПСІЗДІК ШАРАЛАРЫ & ЭЛЕКТР ҚАУІПСІЗДІГІ
                    </div>
                    
                    <ul className="space-y-3 text-slate-700 font-bold">
                      <li className="flex gap-2 items-start">
                        <span className="bg-red-100 text-red-800 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5">5</span>
                        <span>Эвакуация барысында жүгірмеңіз, бір-бірді итермеңіз, алдыңғыларды бақылаңыз.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="bg-red-100 text-red-800 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5">6</span>
                        <span>Өрт дабылын әзіл ретінде пайдаланбаңыз — бұл заңмен қуғындалады.</span>
                      </li>
                    </ul>

                    {/* Quick contacts table */}
                    <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-extrabold text-[10px]">
                          <th className="p-2 pl-3">Қызмет</th>
                          <th className="p-2 pr-3 text-right">Шұғыл нөмір</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td className="p-2 pl-3 text-slate-800 font-bold">Өртке қарсы қызмет</td>
                          <td className="p-2 pr-3 text-right text-red-600 font-extrabold">101</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="p-2 pl-3 text-slate-800 font-bold">Жедел медициналық көмек</td>
                          <td className="p-2 pr-3 text-right text-red-600 font-extrabold">103</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activePreviewPage === 4 && (
                  <div className="space-y-5 animate-fadeIn text-xs">
                    <div className="bg-green-700 text-white p-2 rounded-lg font-extrabold text-[11px] uppercase tracking-wider">
                      4. ДЕНСАУЛЫҚ ЖӘНЕ САНИТАРЛЫҚ НОРМАЛАР
                    </div>
                    <ul className="space-y-3 text-slate-700 font-bold">
                      <li className="flex gap-2 items-start">
                        <span className="bg-green-100 text-green-800 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                        <span>Жұқпалы белгілер (жөтел, қызу) байқалса, кураторға хабарлап, үйде болыңыз.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="bg-green-100 text-green-800 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                        <span>Тамақ алдында, дәретханадан кейін қолды сабынмен жақсылап жуыңыз.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="bg-green-100 text-green-800 w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                        <span>Тамақты тек асхана немесе кафетерийде жеңіз. Аудиторияда рұқсат жоқ.</span>
                      </li>
                    </ul>

                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-[10px] flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-green-800 font-semibold">Медпункт 1-қабатта орналасқан. Жұмыс уақыты: 08:00 - 17:00</span>
                    </div>
                  </div>
                )}

                {activePreviewPage === 5 && (
                  <div className="space-y-4 animate-fadeIn text-xs">
                    <div className="bg-[#f97316] text-white p-2 rounded-lg font-extrabold text-[11px] uppercase tracking-wider">
                      6. АВАРИЯЛЫҚ ЖАҒДАЙЛАРДА ІС-ӘРЕКЕТ АЛГОРИТМІ
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                      <div className="bg-slate-900 text-white p-2 font-black text-[10px] flex justify-between">
                        <span>Жағдай</span>
                        <span>Әрекет</span>
                      </div>
                      <div className="p-2 flex gap-3 bg-red-50/50">
                        <b className="text-red-700 shrink-0 w-32">Өрт шықса:</b>
                        <span className="text-slate-700">Дабыл соғып, баспалдақпен шығыңыз, 101-ге хабарлаңыз</span>
                      </div>
                      <div className="p-2 flex gap-3">
                        <b className="text-blue-700 shrink-0 w-32">Жер сілкінісі:</b>
                        <span className="text-slate-700">Еденге жатып, басыңызды жабыңыз, берік жиһаз паналаңыз</span>
                      </div>
                      <div className="p-2 flex gap-3 bg-red-50/50">
                        <b className="text-amber-700 shrink-0 w-32">Күдікті зат:</b>
                        <span className="text-slate-700">Ұстамаңыз, аймақты босатып, күзетке (102) хабарлаңыз</span>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewPage === 6 && (
                  <div className="space-y-4 animate-fadeIn text-xs">
                    <div className="bg-[#113a70] text-white p-2 rounded-lg font-extrabold text-[11px] uppercase tracking-wider">
                      7. ПСИХОЛОГИЯЛЫҚ ҚАУІПСІЗДІК ЖӘНЕ СЫЙЛАСТЫҚ
                    </div>
                    <p className="text-slate-500 italic">Колледжде кемсітуге, кибербуллингке немесе қорлауға қатаң тыйым салынады.</p>

                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-slate-800 text-xs">
                      Қайтадан бұзу немесе мүлікті бүлдіру жағдайында тәртіптік жаза мен материалдық жауапкершілік қарастырылған.
                    </div>
                  </div>
                )}

                {activePreviewPage === 7 && (
                  <div className="space-y-4 animate-fadeIn text-xs">
                    <div className="bg-[#113a70] text-white p-3 rounded-lg text-center font-extrabold text-[11px] uppercase tracking-wider">
                      ТАНЫСТЫМ ЖӘНЕ ОРЫНДАУҒА МІНДЕТТЕНЕМІН
                    </div>

                    <div className="p-4 border border-indigo-200 bg-indigo-50/30 rounded-xl space-y-3">
                      <div className="flex justify-between border-b border-indigo-100 pb-2">
                        <span className="text-slate-500 font-bold">Студент:</span>
                        <span className={clsx("font-extrabold", studentName ? "text-indigo-800 italic" : "text-slate-400 font-mono")}>
                          {studentName || '_____________________________'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-indigo-100 pb-2">
                        <span className="text-slate-500 font-bold">Топ / Мамандық:</span>
                        <span className={clsx("font-extrabold", studentGroup ? "text-indigo-800 italic" : "text-slate-400 font-mono")}>
                          {studentGroup || '_____________________________'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-indigo-100 pb-2">
                        <span className="text-slate-500 font-bold">Студенттік билет:</span>
                        <span className={clsx("font-extrabold", studentTicket ? "text-indigo-800 italic" : "text-slate-400 font-mono")}>
                          {studentTicket || '_____________________________'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-indigo-100 pb-2">
                        <span className="text-slate-500 font-bold">Қол қойылған күні:</span>
                        <span className="font-extrabold text-[#113a70]">
                          {signDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Мәртебесі:</span>
                        <span className={clsx("font-extrabold flex items-center gap-1", studentName ? "text-emerald-600" : "text-amber-600")}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                          {studentName ? 'ҚОЛ ҚОЙЫЛҒАН (САНДЫҚ)' : 'ҚОЛТАНБА КҮТІЛУДЕ'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Inside sheet container footer */}
              <div className="border-t border-slate-150 pt-3 flex justify-between items-center text-[10px] text-slate-450 font-bold">
                <span>Жоғары Колледж «Қайнар» | Қауіпсіздік бөлімі</span>
                <span>www.kaynar.edu.kz</span>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Teachers Memo Segment Box */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Оқытушыларға арналған қауіпсіздік ережелері</h3>
              <p className="text-slate-500 text-sm mt-0.5">Оқу кабинетіне кіру, эвакуация жұмыстарын бақылау және алғашқы көмек көрсету нұсқаулықтары.</p>
            </div>
          </div>
          <button 
            onClick={() => handleGenerateTeacherPDF()}
            disabled={isGeneratingTeacher}
            className="px-5 py-3 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer uppercase tracking-wider shrink-0 shadow-sm"
          >
            {isGeneratingTeacher ? (
              <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-white animate-spin" />
            ) : (
              <Download className="w-4.5 h-4.5" />
            )}
            Оқытушы нұсқаулықтарын жүктеу
          </button>
        </div>
      </div>
    </motion.div>
  );
}
