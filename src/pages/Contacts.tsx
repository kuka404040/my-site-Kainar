import { motion } from 'motion/react';
import { Phone, Shield, HeartPulse, Building2, Flame } from 'lucide-react';

const contacts = [
  {
    title: 'Колледж күзеті',
    phone: '+7 (727) 123-45-67',
    desc: 'Тәулік бойы жұмыс істейді. Күдікті жағдайларда хабарласыңыз.',
    icon: Shield,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100'
  },
  {
    title: 'Медпункт',
    phone: '+7 (727) 123-45-68',
    desc: 'Жұмыс уақыты: 08:00 - 18:00. Алғашқы медициналық көмек.',
    icon: HeartPulse,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100'
  },
  {
    title: 'Әкімшілік',
    phone: '+7 (727) 123-45-69',
    desc: 'Жұмыс уақыты: 09:00 - 18:00. Жалпы мәселелер бойынша.',
    icon: Building2,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200'
  },
  {
    title: 'Полиция',
    phone: '102',
    desc: 'Құқық бұзушылық немесе қылмыс болған жағдайда.',
    icon: Phone,
    color: 'text-slate-900',
    bg: 'bg-slate-100',
    border: 'border-slate-300'
  },
  {
    title: 'Өрт сөндіру қызметі',
    phone: '101',
    desc: 'Өрт немесе түтін байқалған жағдайда.',
    icon: Flame,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100'
  },
  {
    title: 'Жедел жәрдем',
    phone: '103',
    desc: 'Шұғыл медициналық көмек қажет болғанда.',
    icon: HeartPulse,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100'
  }
];

export function Contacts() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Шұғыл байланыс</h1>
        <p className="text-lg text-slate-600">Төтенше жағдайларда қажет болатын маңызды телефон нөмірлері.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact, index) => {
          const Icon = contact.icon;
          return (
            <div 
              key={index} 
              className={`bg-white rounded-3xl p-8 shadow-sm border ${contact.border} hover:shadow-xl transition-all group flex flex-col h-full`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${contact.bg}`}>
                <Icon className={`w-8 h-8 ${contact.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{contact.title}</h3>
              <p className="text-slate-500 mb-6 flex-grow">{contact.desc}</p>
              <a 
                href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                className={`inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-lg transition-colors ${contact.bg} ${contact.color} hover:bg-slate-900 hover:text-white`}
              >
                <Phone className="w-5 h-5" />
                {contact.phone}
              </a>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
