import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Timer, Trophy, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const questions = [
  {
    id: 1,
    scenario: 'Колледж дәлізінде өрт дабылы іске қосылды. Сіздің әрекетіңіз?',
    options: [
      { text: 'Терезеден секіремін', correct: false },
      { text: 'Лифтке мініп, төмен түсемін', correct: false },
      { text: 'Мұғалімнің нұсқауын тыңдап, баспалдақпен эвакуация жоспарына сай шығамын', correct: true },
      { text: 'Заттарымды жинау үшін аудиторияға қайтамын', correct: false },
    ]
  },
  {
    id: 2,
    scenario: 'Жер сілкінісі басталды. Сіз 3-ші қабаттасыз.',
    options: [
      { text: 'Далаға қарай жүгіремін', correct: false },
      { text: 'Мықты үстелдің астына немесе ішкі бұрышқа тұрамын', correct: true },
      { text: 'Терезенің жанына барып қараймын', correct: false },
      { text: 'Лифтпен төмен түсемін', correct: false },
    ]
  },
  {
    id: 3,
    scenario: 'Дәлізде иесіз күдікті сөмке жатыр.',
    options: [
      { text: 'Ішінде не бар екенін ашып қараймын', correct: false },
      { text: 'Оны басқа жерге апарып тастаймын', correct: false },
      { text: 'Ешкімге айтпай өтіп кетемін', correct: false },
      { text: 'Оған тиіспей, дереу күзетке немесе мұғалімге хабарлаймын', correct: true },
    ]
  }
];

export function Game() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(60);
    setSelectedAnswer(null);
  };

  const handleAnswer = (index: number, isCorrect: boolean) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    if (isCorrect) setScore((prev) => prev + 100);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setGameState('finished');
      }
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Қауіпсіздік симуляторы</h1>
        <p className="text-lg text-slate-600">Төтенше жағдайларда дұрыс шешім қабылдауды үйреніңіз.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Game Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-blue-400" />
            <span className="font-bold text-xl tracking-wider">СИМУЛЯТОР</span>
          </div>
          {gameState === 'playing' && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-mono font-bold">{score}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl">
                <Timer className="w-5 h-5 text-red-400" />
                <span className="font-mono font-bold">00:{timeLeft.toString().padStart(2, '0')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Game Content */}
        <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center">
          {gameState === 'start' && (
            <div className="text-center space-y-8">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Дайынсыз ба?</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                Сізге әртүрлі төтенше жағдайлар ұсынылады. Берілген уақыт ішінде ең дұрыс және қауіпсіз әрекетті таңдауыңыз керек.
              </p>
              <button 
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Ойынды бастау
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <span className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 block">
                  Жағдай {currentQuestion + 1} / {questions.length}
                </span>
                <h3 className="text-2xl font-bold text-slate-900">
                  {questions[currentQuestion].scenario}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentQuestion].options.map((option, index) => {
                  let btnClass = "bg-white border-2 border-slate-200 hover:border-blue-500 text-slate-700";
                  if (selectedAnswer === index) {
                    btnClass = option.correct 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                      : "bg-red-50 border-red-500 text-red-700";
                  } else if (selectedAnswer !== null && option.correct) {
                    btnClass = "bg-emerald-50 border-emerald-500 text-emerald-700";
                  }

                  return (
                    <button
                      key={index}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleAnswer(index, option.correct)}
                      className={`p-6 rounded-2xl text-left font-medium transition-all flex items-center justify-between ${btnClass}`}
                    >
                      <span>{option.text}</span>
                      {selectedAnswer !== null && option.correct && <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />}
                      {selectedAnswer === index && !option.correct && <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="text-center space-y-8">
              <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Ойын аяқталды!</h2>
              <div className="text-6xl font-black text-slate-900 font-mono">
                {score} <span className="text-2xl text-slate-500 font-sans font-medium">ұпай</span>
              </div>
              <p className="text-slate-600 max-w-md mx-auto">
                {score === questions.length * 100 
                  ? 'Керемет! Сіз қауіпсіздік ережелерін өте жақсы білесіз.' 
                  : 'Жақсы нәтиже, бірақ қауіпсіздік ережелерін қайталап оқуға кеңес береміз.'}
              </p>
              <button 
                onClick={startGame}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-12 rounded-xl text-lg transition-all"
              >
                Қайта ойнау
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
