import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (verified: boolean) => void;
}

export default function Captcha({ onVerify }: CaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [verified, setVerified] = useState(false);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    setNum1(a);
    setNum2(b);
    setAnswer('');
    setVerified(false);
    onVerify(false);
  };

  useEffect(() => { generateCaptcha(); }, []);

  const checkAnswer = (val: string) => {
    setAnswer(val);
    const num = parseInt(val);
    if (num === num1 + num2) {
      setVerified(true);
      onVerify(true);
    } else {
      setVerified(false);
      onVerify(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
      <div className="flex items-center gap-2 font-mono text-lg font-bold text-dark-700 dark:text-dark-300 select-none">
        <span className="bg-dark-200 dark:bg-dark-600 px-2 py-1 rounded">{num1}</span>
        <span>+</span>
        <span className="bg-dark-200 dark:bg-dark-600 px-2 py-1 rounded">{num2}</span>
        <span>=</span>
      </div>
      <input
        type="number"
        value={answer}
        onChange={(e) => checkAnswer(e.target.value)}
        className="w-20 px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        placeholder="?"
      />
      <button
        onClick={generateCaptcha}
        type="button"
        className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
        title="Refresh captcha"
      >
        <RefreshCw className="w-4 h-4 text-dark-400" />
      </button>
      {verified && <span className="text-success-500 text-sm font-medium">Verified</span>}
    </div>
  );
}
