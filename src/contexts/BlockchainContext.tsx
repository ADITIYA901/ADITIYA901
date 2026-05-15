import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { BlockchainState } from '../types';
import { generateTxHash, generateBlockNumber } from '../utils/helpers';

interface BlockchainContextType extends BlockchainState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  simulateTransaction: () => Promise<{ txHash: string; blockNumber: number }>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BlockchainState>({
    isConnected: false,
    account: null,
    chainId: null,
    isConnecting: false,
  });

  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        setState({
          isConnected: true,
          account: accounts[0],
          chainId: parseInt(chainId, 16),
          isConnecting: false,
        });
      } else {
        // Simulate wallet connection for demo
        const demoAccount = '0x' + Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('');

        setState({
          isConnected: true,
          account: demoAccount,
          chainId: 1,
          isConnecting: false,
        });
      }
    } catch {
      setState(prev => ({ ...prev, isConnecting: false }));
      throw new Error('Failed to connect wallet');
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setState({
      isConnected: false,
      account: null,
      chainId: null,
      isConnecting: false,
    });
  }, []);

  const simulateTransaction = useCallback(async (): Promise<{ txHash: string; blockNumber: number }> => {
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const txHash = generateTxHash();
    const blockNumber = generateBlockNumber();

    return { txHash, blockNumber };
  }, []);

  return (
    <BlockchainContext.Provider
      value={{ ...state, connectWallet, disconnectWallet, simulateTransaction }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (!context) throw new Error('useBlockchain must be used within BlockchainProvider');
  return context;
}
