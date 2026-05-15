import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { copyToClipboard, truncateAddress } from '../../utils/helpers';

interface BlockchainHashProps {
  hash: string;
  label?: string;
  truncated?: boolean;
  showLink?: boolean;
}

export default function BlockchainHash({ hash, label, truncated = true, showLink = false }: BlockchainHashProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-dark-500 dark:text-dark-400">{label}</p>}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
        <code className="text-xs font-mono text-primary-600 dark:text-primary-400 break-all">
          {truncated ? truncateAddress(hash) : hash}
        </code>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors shrink-0"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success-500" /> : <Copy className="w-3.5 h-3.5 text-dark-400" />}
        </button>
        {showLink && (
          <button className="p-1 rounded hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors shrink-0" title="View on explorer">
            <ExternalLink className="w-3.5 h-3.5 text-dark-400" />
          </button>
        )}
      </div>
    </div>
  );
}
