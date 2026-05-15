import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const faqResponses: Record<string, string> = {
  'how to vote': 'To cast your vote: 1) Register and verify your identity, 2) Connect your MetaMask wallet, 3) Browse active elections, 4) Select a candidate and click "Cast Your Vote", 5) Confirm the transaction. Your vote will be recorded on the blockchain!',
  'how to register': 'Click "Voter Login" then "Register as Voter". Fill in your name, email, Aadhaar ID, and password. Your account will be reviewed by an administrator before you can vote.',
  'metamask': 'MetaMask is a digital wallet for Ethereum. Install it from metamask.io as a browser extension. Create a wallet, save your seed phrase securely, and connect it to BlockVote to enable blockchain voting.',
  'connect wallet': 'Go to your Voter Dashboard and click "Connect Wallet". If you have MetaMask installed, it will prompt you to connect. If not, a simulated wallet will be created for demo purposes.',
  'blockchain': 'Blockchain is a distributed ledger technology. In BlockVote, every vote is recorded as a transaction on the Ethereum blockchain, making it immutable, transparent, and verifiable by anyone.',
  'is my vote secure': 'Yes! Your vote is encrypted before being recorded on the blockchain. The decentralized nature of blockchain makes it virtually impossible to tamper with. Each vote generates a unique transaction hash you can verify.',
  'double voting': 'BlockVote prevents double voting through: 1) Smart contract validation, 2) Database unique constraint (one vote per voter per election), 3) Aadhaar ID verification, 4) Wallet address tracking.',
  'results': 'Election results are available after the election ends. Go to "Results" in your voter dashboard. Results show vote distribution, winner, and detailed breakdown. You can also verify the count on the blockchain.',
  'receipt': 'After voting, you receive a blockchain transaction receipt with: transaction hash, block number, timestamp, and gas used. You can find all your receipts in "My Votes" section.',
  'admin': 'Administrators manage elections, candidates, and voter approvals. They can create elections, add candidates, approve voters, view analytics, and end elections manually.',
  'hello': 'Hello! I\'m BlockVote Assistant. I can help you with voting, registration, wallet setup, blockchain questions, and more. What would you like to know?',
  'hi': 'Hi there! Welcome to BlockVote. How can I help you today? I can assist with voting, registration, wallet setup, and more.',
  'help': 'I can help you with: 1) How to register and vote, 2) MetaMask wallet setup, 3) Blockchain and security questions, 4) Understanding election results, 5) Troubleshooting issues. Just ask!',
  'thank': 'You\'re welcome! If you have any more questions, feel free to ask. Happy voting!',
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  for (const [key, response] of Object.entries(faqResponses)) {
    if (lower.includes(key)) return response;
  }

  if (lower.includes('vote') || lower.includes('cast')) return faqResponses['how to vote'];
  if (lower.includes('register') || lower.includes('sign up')) return faqResponses['how to register'];
  if (lower.includes('wallet') || lower.includes('metamask')) return faqResponses['metamask'];
  if (lower.includes('secure') || lower.includes('safe') || lower.includes('hack')) return faqResponses['is my vote secure'];
  if (lower.includes('double') || lower.includes('duplicate') || lower.includes('twice')) return faqResponses['double voting'];
  if (lower.includes('result') || lower.includes('winner')) return faqResponses['results'];
  if (lower.includes('receipt') || lower.includes('transaction')) return faqResponses['receipt'];
  if (lower.includes('admin')) return faqResponses['admin'];

  return "I'm not sure about that. Try asking about: how to vote, registration, MetaMask wallet, blockchain security, double voting prevention, election results, or vote receipts.";
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm BlockVote Assistant. I can help you with voting, registration, wallet setup, and more. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center',
          isOpen
            ? 'bg-dark-600 hover:bg-dark-700'
            : 'bg-gradient-to-r from-primary-600 to-accent-500 hover:shadow-xl hover:scale-105 animate-pulse-glow'
        )}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] glass-card flex flex-col animate-scale-in shadow-2xl">
          {/* Header */}
          <div className="gradient-bg p-4 rounded-t-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">BlockVote Assistant</h3>
              <p className="text-xs text-white/70">Always here to help</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-2', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[75%] px-3 py-2 rounded-xl text-sm',
                    msg.sender === 'user'
                      ? 'bg-primary-500 text-white rounded-br-sm'
                      : 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 rounded-bl-sm'
                  )}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="bg-dark-100 dark:bg-dark-700 px-4 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-dark-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-dark-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-dark-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
            {['How to vote?', 'Is it secure?', 'Connect wallet', 'Results'].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="text-xs px-2.5 py-1 rounded-full border border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-dark-200 dark:border-dark-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-xl border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
