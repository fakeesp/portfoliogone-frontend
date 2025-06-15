import { ethers } from "ethers"
import NitroliteSDK from "@erc7824/nitrolite"

async function main() {
  // 🔑 1. Ініціалізуй провайдер і гаманець
  const privateKey = "728506503a2e9625568f7095ee21a1ed43623dea093c8ed01bd5dbb73fb815e6"; // ⚠️ Встав свій приватний ключ
  const wallet = new ethers.Wallet(privateKey);
  const address = await wallet.getAddress();

  console.log("🔗 Using wallet:", address);

  // 🌐 2. Підключення до ClearNode
  const sdk = new NitroliteSDK({
    wallet,
    chainId: 1, // або 5 для Goerli
    rpcUrl: "https://rpc.ankr.com/eth", // або свій RPC
    clearnodeUrl: "wss://clearnode.yellow.com", // або інший endpoint
  });

  console.log("📡 Connecting to ClearNode...");

  // 🔐 3. Авторизація (підпис EIP-712 → отримання JWT)
  await sdk.connect(); // Встановлює WebSocket і авторизує користувача

  const jwt = sdk.getJWT();

  console.log("✅ JWT отримано:");
  console.log(jwt);

  // 🚪 Закрити підключення
  await sdk.disconnect();
  console.log("❌ Disconnected");
}

main().catch(console.error);
