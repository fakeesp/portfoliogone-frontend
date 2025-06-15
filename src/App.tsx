import React, { useEffect } from 'react';
import { useWallet } from './useWallet';
import { useClearNode } from './useClearNode';
import './App.css'

function App() {
  const { connectWallet, isConnected, walletClient } = useWallet();
  const { connect, isAuthenticated, usdcBalance } = useClearNode();

  // Connect to Yellow/Nitrolite when wallet is connected
  useEffect(() => {
    if (walletClient) connect(walletClient);
  }, [walletClient, connect]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: '100vh', justifyContent: 'center', background: '#242424', color: '#fff' }}>
      <h1>MetaMask + Nitrolite/Yellow Auth</h1>
      {!isConnected ? (
        <button style={{ fontSize: 20, padding: '12px 32px', marginTop: 32 }} onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <>
          <div>Wallet connected: {walletClient?.account?.address}</div>
          <div>Yellow Auth: {isAuthenticated ? '✅ Authorized' : '⏳ Authorizing...'}</div>
          <div>USDC Balance: {usdcBalance}</div>
        </>
      )}
    </div>
  );
}

export default App;
