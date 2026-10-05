import { motion } from 'motion/react';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

const notifications = [
  {
    id: 1,
    type: 'warning',
    title: 'Дауылды ескерту',
    date: '2023-10-25 14:30',
    content: 'Құрметті студенттер мен оқытушылар! Бүгін кешке қатты жел мен жауын-шашын күтілуде. Сақ болыңыздар.',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200'
  },
  {
    id: 2,
    type: 'info',
    title: 'Оқу-жаттығу жиыны',
    date: '2023-10-24 09:00',
    content: 'Ертең сағат 11:00-де өрт қауіпсіздігі бойынша жоспарлы оқу-жаттығу эвакуациясы өтеді. Барлықтарыңыздың қатысуларыңыз сұралады.',
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  {
    id: 3,
    type: 'success',
    title: 'Жөндеу жұмыстары аяқталды',
    date: '2023-10-20 16:45',
    content: 'Басты ғимараттың 2-ші қабатындағы жөндеу жұмыстары толық аяқталды. Дәліз ашық.',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  }
];

export function Notifications() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
          <Bell className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Маңызды хабарламалар</h1>
          <p className="text-slate-600">Колледж әкімшілігінен соңғы ескертулер мен жаңалықтар.</p>
        </div>
      </div>

      <div className="space-y-6">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={clsx(
                'bg-white rounded-3xl p-6 md:p-8 shadow-sm border transition-all hover:shadow-md relative overflow-hidden',
                notif.border
              )}
            >
              <div className={clsx('absolute top-0 left-0 w-2 h-full', notif.bg.replace('50', '500'))} />
              <div className="flex gap-6">
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', notif.bg)}>
                  <Icon className={clsx('w-6 h-6', notif.color)} />
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                    <h3 className="text-xl font-bold text-slate-900">{notif.title}</h3>
                    <span className="text-sm font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
                      {notif.date}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{notif.content}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
