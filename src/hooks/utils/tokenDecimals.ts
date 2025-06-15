// Common token decimals
const TOKEN_DECIMALS: Record<string, number> = {
  // USDC on Polygon
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359': 6,
  // USDC on Ethereum
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6,
  // USDC on most testnets (including Goerli)
  '0x07865c6e87b9f70255377e024ace6630c1eaa37f': 6,
  // Add more tokens as needed
};

const DEFAULT_DECIMALS = 18;

export function getTokenDecimals(tokenAddress: string): number {
  if (!tokenAddress) {
    console.warn('Token address is empty, using default decimals');
    return DEFAULT_DECIMALS;
  }
  const normalizedAddress = tokenAddress.toLowerCase();
  const decimals = TOKEN_DECIMALS[normalizedAddress];
  if (decimals !== undefined) {
    return decimals;
  }
  if (normalizedAddress.includes('usdc')) {
    console.log(`Token address ${tokenAddress} appears to be USDC, using 6 decimals`);
    return 6;
  }
  console.log(`Token decimals not found for ${tokenAddress}, using default ${DEFAULT_DECIMALS}`);
  return DEFAULT_DECIMALS;
}

export function parseTokenUnits(tokenAddress: string, amount: string): bigint {
  try {
    const decimals = getTokenDecimals(tokenAddress);
    if (!amount || amount === '' || isNaN(Number(amount))) {
      console.warn(`Invalid amount provided: "${amount}", defaulting to 0`);
      return BigInt(0);
    }
    const parts = amount.split('.');
    const wholePart = parts[0] || '0';
    let fractionalPart = parts[1] || '';
    if (fractionalPart.length > decimals) {
      fractionalPart = fractionalPart.substring(0, decimals);
    } else {
      while (fractionalPart.length < decimals) {
        fractionalPart += '0';
      }
    }
    const wholePartWithoutLeadingZeros = wholePart.replace(/^0+/, '') || '0';
    const combinedString = wholePartWithoutLeadingZeros + fractionalPart;
    return BigInt(combinedString);
  } catch (error) {
    console.error(`Error parsing token units:`, error);
    return BigInt(0);
  }
}

export function formatTokenUnits(tokenAddress: string, amountBigInt: bigint): string {
  try {
    const decimals = getTokenDecimals(tokenAddress);
    if (amountBigInt === BigInt(0)) {
      return '0';
    }
    let amountStr = amountBigInt.toString();
    while (amountStr.length <= decimals) {
      amountStr = '0' + amountStr;
    }
    const wholePart = amountStr.slice(0, -decimals) || '0';
    const fractionalPart = amountStr.slice(-decimals);
    let result = `${wholePart}.${fractionalPart}`;
    result = result.replace(/\.?0+$/, '');
    if (result.endsWith('.')) {
      result = result.slice(0, -1);
    }
    return result || '0';
  } catch (error) {
    console.error(`Error formatting token units:`, error);
    return '0';
  }
}
