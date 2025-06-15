// useMetaMask.ts - MetaMask connection logic using wagmi and RainbowKit
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';

// Storage key for wallet connection
const WALLET_CONNECTION_KEY = 'wallet_connection';

export function useMetaMask() {
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
    const { openConnectModal } = useConnectModal();
    const { openAccountModal } = useAccountModal();
    const { address, isConnected, isConnecting, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { switchChain } = useSwitchChain();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMetaMaskInstalled(!!window.ethereum?.isMetaMask);
        }
    }, []);

    // Connect using RainbowKit
    const connectWallet = async () => {
        try {
            const metamaskConnector = connectors.find((connector) =>
                connector.name.toLowerCase().includes('metamask')
            );
            if (metamaskConnector) {
                connect({ connector: metamaskConnector });
            } else {
                openConnectModal?.();
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
    };

    const switchNetwork = async (chainId: number) => {
        try {
            await switchChain({ chainId });
        } catch (error) {
            console.error('Error switching network:', error);
        }
    };

    return {
        isMetaMaskInstalled,
        isConnected,
        account: address,
        address,
        chainId: chain?.id,
        connect: connectWallet,
        connectWallet,
        openConnectModal,
        openAccountModal,
        switchNetwork,
        isConnecting,
    };
}

// Export useMetaMask as useWallet for compatibility with existing import in App.tsx
export { useMetaMask as useWallet } from './useMetaMask';
