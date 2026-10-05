import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Users, FileText, Activity, AlertTriangle, MapPin, Clock } from 'lucide-react';

interface Incident {
  id: number;
  name: string;
  group_name: string;
  type: string;
  location: string;
  description: string;
  media_url: string;
  datetime: string;
  created_at: string;
}

interface SosAlert {
  id: number;
  location: string;
  created_at: string;
}

interface Stats {
  totalIncidents: number;
  totalSos: number;
  types: { type: string; count: number }[];
}

export function Admin() {
  const [activeTab, setActiveTab] = useState<'incidents' | 'sos' | 'stats'>('incidents');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'incidents') {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      setIncidents(data);
    } else if (activeTab === 'sos') {
      const res = await fetch('/api/sos');
      const data = await res.json();
      setSosAlerts(data);
    } else if (activeTab === 'stats') {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Админ панель</h1>
          <p className="text-slate-600">Жүйені басқару және статистика.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm uppercase tracking-wider">Администратор</span>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-6 py-3 rounded-xl font-bold transition-colors ${
            activeTab === 'incidents' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Оқиғалар
        </button>
        <button
          onClick={() => setActiveTab('sos')}
          className={`px-6 py-3 rounded-xl font-bold transition-colors ${
            activeTab === 'sos' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          SOS дабылдары
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 rounded-xl font-bold transition-colors ${
            activeTab === 'stats' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Статистика
        </button>
      </div>

      {activeTab === 'incidents' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Аты-жөні</th>
                  <th className="p-4 font-semibold">Топ</th>
                  <th className="p-4 font-semibold">Түрі</th>
                  <th className="p-4 font-semibold">Орны</th>
                  <th className="p-4 font-semibold">Уақыты</th>
                  <th className="p-4 font-semibold">Сипаттама</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500 font-mono text-sm">#{inc.id}</td>
                    <td className="p-4 font-medium text-slate-900">{inc.name}</td>
                    <td className="p-4 text-slate-600">{inc.group_name}</td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        {inc.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {inc.location}
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      {new Date(inc.datetime).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate" title={inc.description}>
                      {inc.description}
                    </td>
                  </tr>
                ))}
                {incidents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Оқиғалар табылмады.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sosAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-3xl p-6 shadow-sm border border-red-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">SOS Дабыл</h3>
                  <p className="text-slate-500 text-sm font-mono">#{alert.id}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">{alert.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">{new Date(alert.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          {sosAlerts.length === 0 && (
            <div className="col-span-full text-center p-12 bg-white rounded-3xl border border-slate-100 text-slate-500">
              SOS дабылдары жоқ.
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <FileText className="w-10 h-10" />
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider mb-1">Жалпы оқиғалар</p>
              <h2 className="text-5xl font-black text-slate-900">{stats.totalIncidents}</h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider mb-1">Жалпы SOS дабылдары</p>
              <h2 className="text-5xl font-black text-slate-900">{stats.totalSos}</h2>
            </div>
          </div>

          <div className="col-span-full bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Оқиғалар түрлері бойынша</h3>
            <div className="space-y-4">
              {stats.types.map((type, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-48 font-medium text-slate-700">{type.type}</div>
                  <div className="flex-grow h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(type.count / stats.totalIncidents) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-right font-bold text-slate-900">{type.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
