import WebSocket from 'ws';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner,
  parseRPCResponse,
  RPCMethod
} from '@erc7824/nitrolite';

dotenv.config(); // .env: PRIVATE_KEY=0x...

const CLEAR_NODE_URL = 'wss://clearnode.example.com';
const PRIVATE_KEY = process.env.PRIVATE_KEY; // зберігати у .env!
if (!PRIVATE_KEY) throw new Error('No PRIVATE_KEY in .env!');

// Дані для авторизації (приклад)
const walletAddress = '0x1eb7F56517Ee3B1783c125E90a462c2bF4156886';
const participant = '0xYourSignerAddress';
const appName = 'Your Domain';
const application = '0x1eb7F56517Ee3B1783c125E90a462c2bF4156886';

const main = async () => {
  const ws = new WebSocket(CLEAR_NODE_URL);

  ws.on('open', async () => {
    console.log('[ws] Connected');

    // 1. Створюємо та відправляємо auth_request
    const authRequestMsg = await createAuthRequestMessage({
      wallet: walletAddress,
      participant,
      app_name: appName,
      expire: Math.floor(Date.now() / 1000) + 3600, // 1 година
      scope: 'console',
      application,
      allowances: [],
    });
    ws.send(authRequestMsg);
    console.log('[auth] Sent auth_request');
  });

  ws.on('message', async (data: string) => {
    try {
      const message = parseRPCResponse(data);
      if (message.method === RPCMethod.AuthChallenge) {
        console.log('[auth] Received auth_challenge');

        // Підписувач EIP-712
        const wallet = new ethers.Wallet(PRIVATE_KEY);
        const signer = createEIP712AuthMessageSigner(
          wallet, // ethers.Wallet instance
          {
            scope: 'console',
            application,
            participant,
            expire: Math.floor(Date.now() / 1000) + 3600,
            allowances: [],
          },
          { name: appName }
        );

        // 2. Створюємо та відправляємо auth_verify
        const authVerifyMsg = await createAuthVerifyMessage(
          signer,
          message
        );
        ws.send(authVerifyMsg);
        console.log('[auth] Sent auth_verify');
      }

      // 3. Обробка успіху / помилки
      if (message.method === RPCMethod.AuthVerify) {
        if (message.params.success) {
          console.log('[auth] Authentication successful!');
          // Можна зберегти JWT для майбутніх reconnection
          const jwtToken = message.params.jwtToken;
          console.log('[auth] JWT:', jwtToken);
          // ...тут можна починати роботу з каналами
        } else {
          console.error('[auth] Authentication FAILED:', message.params);
        }
      }
      if (message.method === RPCMethod.Error) {
        console.error('[auth] Error:', message.params.error);
      }
    } catch (err) {
      console.error('[auth] Error parsing message:', err);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`[ws] Closed: ${code} ${reason}`);
  });

  ws.on('error', (err) => {
    console.error('[ws] Error:', err);
  });
};

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});