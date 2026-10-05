import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Camera, MapPin, AlertCircle } from 'lucide-react';

export function Report() {
  const [formData, setFormData] = useState({
    name: '',
    group_name: '',
    type: 'Төбелес',
    location: '',
    description: '',
    media_url: '',
    datetime: new Date().toISOString().slice(0, 16),
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({
          name: '',
          group_name: '',
          type: 'Төбелес',
          location: '',
          description: '',
          media_url: '',
          datetime: new Date().toISOString().slice(0, 16),
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-white text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Оқиға хабарлау</h2>
          <p className="text-slate-400">Төтенше жағдай немесе қауіп туралы жедел ақпарат беріңіз</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {status === 'success' && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center">
              <span className="font-semibold">Хабарлама сәтті жіберілді!</span> Әкімшілік жақын арада шара қолданады.
            </div>
          )}
          {status === 'error' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center">
              <span className="font-semibold">Қате кетті.</span> Қайтадан көріңіз.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Аты-жөні</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Мысалы: Асан Үсенов"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Топ</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Мысалы: ИС-22"
                value={formData.group_name}
                onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Оқиға түрі</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Төбелес">Төбелес / Агрессия</option>
              <option value="Өрт">Өрт / Түтін</option>
              <option value="Медициналық көмек">Медициналық көмек қажет</option>
              <option value="Күдікті зат">Күдікті зат / Адам</option>
              <option value="Бұзушылық">Тәртіп бұзушылық</option>
              <option value="Басқа">Басқа</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Оқиға орны</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                required
                type="text"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Мысалы: 3 қабат, 305 дәрісхана"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Күні мен уақыты</label>
            <input
              required
              type="datetime-local"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.datetime}
              onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Сипаттама</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Оқиғаны толық сипаттаңыз..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Фото немесе видео (URL)</label>
            <div className="relative">
              <Camera className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="url"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://..."
                value={formData.media_url}
                onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Бұлтты қоймаға жүктелген файл сілтемесін енгізіңіз.</p>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              <span className="animate-pulse">Жіберілуде...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Жіберу
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
