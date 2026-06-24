const FINNHUB_API_KEY = 'd7hb4h1r01qhiu0avvl0d7hb4h1r01qhiu0avvlg';
const BASE_URL = 'https://finnhub.io/api/v1';

export interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

export interface FinnhubCandle {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  s: string;    // Status: "ok" or "no_data"
  t: number[];  // Timestamps
  v: number[];  // Volumes
}

/**
 * Fetches the current quote for a single symbol.
 */
export async function getStockQuote(symbol: string): Promise<FinnhubQuote | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`Finnhub quote error for ${symbol}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: FinnhubQuote = await response.json();

    // Finnhub returns all zeros for invalid symbols
    if (data.c === 0 && data.pc === 0) {
      console.warn(`Finnhub returned no data for symbol: ${symbol}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Generates realistic mock candle data if the real API fails.
 */
function generateMockCandles(symbol: string, resolution: string, count: number): FinnhubCandle {
  const now = Math.floor(Date.now() / 1000);
  const interval = resolution === 'D' ? 86400 : parseInt(resolution) * 60 || 3600;
  
  const t: number[] = [];
  const c: number[] = [];
  const h: number[] = [];
  const l: number[] = [];
  const o: number[] = [];
  const v: number[] = [];

  // Seed price based on symbol string hashing
  let price = 100 + (symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 400);

  for (let i = count; i >= 0; i--) {
    const time = now - (i * interval);
    const open = price;
    const change = (Math.random() - 0.48) * (price * 0.02); // Slight upward bias
    const close = price + change;
    const high = Math.max(open, close) + (Math.random() * (price * 0.005));
    const low = Math.min(open, close) - (Math.random() * (price * 0.005));
    const vol = Math.floor(Math.random() * 100000) + 10000;

    t.push(time);
    o.push(open);
    c.push(close);
    h.push(high);
    l.push(low);
    v.push(vol);
    
    price = close;
  }

  return { c, h, l, o, s: 'ok', t, v };
}

/**
 * Fetches historical candle data for a symbol.
 */
export async function getStockCandles(
  symbol: string,
  resolution: string = '60',
  fromTimestamp?: number,
  toTimestamp?: number
): Promise<FinnhubCandle | null> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const from = fromTimestamp || now - 7 * 24 * 60 * 60; // Default: 7 days ago
    const to = toTimestamp || now;

    const response = await fetch(
      `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 403 || response.status === 401 || response.status === 429) {
        console.warn(`Finnhub API restricted (${response.status}) for ${symbol}. Using simulated arcade data.`);
        return generateMockCandles(symbol, resolution, 168); // ~1 week of hourly data
      }
      return null;
    }

    const data: FinnhubCandle = await response.json();

    if (data.s === 'no_data' || !data.c || data.c.length === 0) {
      console.warn(`No real data for ${symbol}. Using simulated arcade data.`);
      return generateMockCandles(symbol, resolution, 168);
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch candles for ${symbol}:`, error);
    return generateMockCandles(symbol, resolution, 168);
  }
}

/**
 * Fetches quotes for multiple symbols in parallel.
 */
export async function getMultipleQuotes(symbols: string[]): Promise<Record<string, FinnhubQuote>> {
  const results: Record<string, FinnhubQuote> = {};

  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      const quote = await getStockQuote(symbol);
      return { symbol, quote };
    })
  );

  quotes.forEach(({ symbol, quote }) => {
    if (quote) {
      results[symbol] = quote;
    }
  });

  return results;
}

/**
 * Fetches historical candles for multiple symbols.
 */
export async function getMultipleCandles(
  symbols: string[],
  resolution: string = '60'
): Promise<Record<string, FinnhubCandle>> {
  const results: Record<string, FinnhubCandle> = {};

  const candles = await Promise.all(
    symbols.map(async (symbol) => {
      const candle = await getStockCandles(symbol, resolution);
      return { symbol, candle };
    })
  );

  candles.forEach(({ symbol, candle }) => {
    if (candle) {
      results[symbol] = candle;
    }
  });

  return results;
}
