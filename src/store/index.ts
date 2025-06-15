import { Store } from '../storeUtils';

// Nitrolite Store
interface NitroliteStoreState {
    client: any;
    isInitialized: boolean;
}

export const NitroliteStore = {
    state: new Store<NitroliteStoreState>({
        client: null,
        isInitialized: false,
    }),
    setClient(client: any): void {
        this.state.set('client', client);
        this.state.set('isInitialized', true);
    },
};

// Wallet Store
interface WalletStoreState {
    walletAddress: string | null;
    chainId: number | null;
    isConnected: boolean;
    channelOpen: boolean;
    walletClient: any;
    channelToken: string | null;
    channelAmount: string | null;
    error: string | null;
}

export const WalletStore = {
    state: new Store<WalletStoreState>({
        walletAddress: null,
        chainId: null,
        isConnected: false,
        channelOpen: false,
        walletClient: null,
        channelToken: null,
        channelAmount: null,
        error: null,
    }),
    connect(address: string): void {
        this.state.setState({
            walletAddress: address,
            isConnected: true,
            error: null,
        });
    },
    setError(error: string | null): void {
        this.state.set('error', error);
    },
    setWalletAddress(address: string | null): void {
        this.state.set('walletAddress', address);
        this.state.set('isConnected', !!address);
    },
    setChainId(chainId: number | null): void {
        this.state.set('chainId', chainId);
    },
    setChannelOpen(isOpen: boolean): void {
        this.state.set('channelOpen', isOpen);
    },
    openChannel(token: string, amount: string): void {
        this.state.setState({
            channelOpen: true,
            channelToken: token,
            channelAmount: amount,
        });
    },
    setWalletClient(walletClient: any): void {
        this.state.set('walletClient', walletClient);
        if (walletClient?.account?.address) {
            this.state.set('walletAddress', walletClient.account.address);
        }
    },
    getWalletClient(): any {
        return this.state.getState().walletClient;
    },
    closeChannel(): void {
        this.state.setState({
            channelOpen: false,
            channelToken: null,
            channelAmount: null,
        });
    },
};

// Settings Store
interface SettingsStoreState {
    activeChain: number;
}

export const SettingsStore = {
    state: new Store<SettingsStoreState>({
        activeChain: 137,
    }),
    setActiveChain(chainId: number): void {
        this.state.set('activeChain', chainId);
    },
};
