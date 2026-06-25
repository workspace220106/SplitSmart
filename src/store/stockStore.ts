'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Stock, PricePoint, Holding, Portfolio, StockTransaction, MarketEvent } from '../types';
import { getMultipleQuotes, getMultipleCandles } from '../lib/finnhub';
import { useUserStore } from './userStore';

// ─── Stock definitions with real tickers ─────────────────────────
const STOCK_DEFS = [
  { symbol: 'MSFT', name: 'Microsoft Corp', sector: 'Technology', description: 'Cloud computing & productivity software.', volatility: 0.2, marketCap: 3_000_000_000_000 },
  { symbol: 'TSLA', name: 'Tesla Inc', sector: 'Automotive', description: 'Electric vehicles & clean energy.', volatility: 0.5, marketCap: 500_000_000_000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc', sector: 'Retail', description: 'E-commerce & cloud services.', volatility: 0.3, marketCap: 1_900_000_000_000 },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', description: 'Investment banking & financial services.', volatility: 0.2, marketCap: 560_000_000_000 },
  { symbol: 'KO', name: 'Coca-Cola Co', sector: 'Consumer Goods', description: 'World\'s largest beverage company.', volatility: 0.1, marketCap: 270_000_000_000 },
  { symbol: 'CVX', name: 'Chevron Corp', sector: 'Energy', description: 'Integrated oil & gas company.', volatility: 0.25, marketCap: 290_000_000_000 },
  { symbol: 'PFE', name: 'Pfizer Inc', sector: 'Healthcare', description: 'Pharmaceutical & biotechnology.', volatility: 0.3, marketCap: 160_000_000_000 },
  { symbol: 'SONY', name: 'Sony Group Corp', sector: 'Entertainment', description: 'Electronics, gaming & entertainment.', volatility: 0.3, marketCap: 105_000_000_000 },
];

function makeInitialStock(def: typeof STOCK_DEFS[0]): Stock {
  return {
    ...def,
    basePrice: 0,
    currentPrice: 0,
    previousPrice: 0,
    dayHigh: 0,
    dayLow: 0,
    history: [],
  };
}

// ─── Types ───────────────────────────────────────────────────────
interface StockState {
  stocks: Stock[];
  holdings: Holding[];
  transactions: StockTransaction[];
  balance: number; // Pac-Tokens available for trading
  watchlist: string[];
  lastUpdate: number;
  isLoading: boolean;
  apiError: string | null;

  // Derived (computed on the fly)
  getPortfolio: () => Portfolio;
  getStock: (symbol: string) => Stock | undefined;

  // Actions
  initialize: () => Promise<void>;
  fetchPrices: () => Promise<void>;
  fetchHistory: (symbol: string) => Promise<void>;
  buyStock: (symbol: string, shares: number) => boolean;
  sellStock: (symbol: string, shares: number) => boolean;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  applyMarketEvent: (event: MarketEvent) => void;
}

// ─── Store ───────────────────────────────────────────────────────
export const useStockStore = create<StockState>()(
  persist(
    (set, get) => ({
      stocks: STOCK_DEFS.map(makeInitialStock),
      holdings: [],
      transactions: [],
      balance: 5000, // Starting balance: 5000 Pac-Tokens
      watchlist: [],
      lastUpdate: 0,
      isLoading: false,
      apiError: null,

      // ── Derived portfolio ──────────────────────────────────────
      getPortfolio: (): Portfolio => {
        const state = get();
        const holdingsWithPrices: Holding[] = state.holdings.map(h => {
          const stock = state.stocks.find(s => s.symbol === h.symbol);
          const currentPrice = stock?.currentPrice || h.currentPrice;
          const totalValue = h.shares * currentPrice;
          const costBasis = h.shares * h.avgBuyPrice;
          const profitLoss = totalValue - costBasis;
          const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;
          return { ...h, currentPrice, totalValue, profitLoss, profitLossPercent };
        });

        const totalHoldingsValue = holdingsWithPrices.reduce((sum, h) => sum + h.totalValue, 0);
        const totalCostBasis = holdingsWithPrices.reduce((sum, h) => sum + h.shares * h.avgBuyPrice, 0);
        const totalProfitLoss = totalHoldingsValue - totalCostBasis;
        const totalProfitLossPercent = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0;

        return {
          balance: state.balance,
          holdings: holdingsWithPrices,
          totalValue: state.balance + totalHoldingsValue,
          totalProfitLoss,
          totalProfitLossPercent,
          transactions: state.transactions,
        };
      },

      getStock: (symbol: string) => get().stocks.find(s => s.symbol === symbol),

      // ── Initialize: fetch quotes + history for all stocks ──────
      initialize: async () => {
        const state = get();
        // Only fetch if prices are stale (> 30 seconds old) or never loaded
        if (state.isLoading) return;
        if (state.lastUpdate > 0 && Date.now() - state.lastUpdate < 30000) return;

        set({ isLoading: true, apiError: null });

        try {
          const symbols = STOCK_DEFS.map(d => d.symbol);

          // Fetch current quotes and historical candles in parallel
          const [quotes, candles] = await Promise.all([
            getMultipleQuotes(symbols),
            getMultipleCandles(symbols, '60'), // Hourly candles
          ]);

          set((prev) => {
            const updatedStocks = prev.stocks.map(stock => {
              const quote = quotes[stock.symbol];
              const candle = candles[stock.symbol];

              // Build history from candle data
              let history: PricePoint[] = stock.history;
              if (candle && candle.c.length > 0) {
                history = candle.t.map((t, i) => ({
                  timestamp: t * 1000,
                  price: candle.c[i],
                  volume: candle.v[i],
                }));
              }

              if (quote) {
                return {
                  ...stock,
                  basePrice: quote.pc, // Previous close
                  currentPrice: quote.c,
                  previousPrice: quote.pc,
                  dayHigh: quote.h,
                  dayLow: quote.l,
                  history,
                };
              }

              return { ...stock, history };
            });

            return {
              stocks: updatedStocks,
              lastUpdate: Date.now(),
              isLoading: false,
            };
          });
        } catch (error) {
          console.error('Failed to initialize stocks:', error);
          set({ isLoading: false, apiError: 'Failed to connect to market data.' });
        }
      },

      // ── Refresh prices only (no candle refetch) ────────────────
      fetchPrices: async () => {
        try {
          const symbols = get().stocks.map(s => s.symbol);
          const quotes = await getMultipleQuotes(symbols);

          if (Object.keys(quotes).length === 0) return;

          set((prev) => {
            const updatedStocks = prev.stocks.map(stock => {
              const quote = quotes[stock.symbol];
              if (!quote) return stock;

              // Append the new price to history
              const newPoint: PricePoint = {
                timestamp: Date.now(),
                price: quote.c,
                volume: 0,
              };
              const history = [...stock.history, newPoint];
              if (history.length > 200) history.shift();

              return {
                ...stock,
                previousPrice: stock.currentPrice,
                currentPrice: quote.c,
                dayHigh: quote.h,
                dayLow: quote.l,
                history,
              };
            });

            return { stocks: updatedStocks, lastUpdate: Date.now() };
          });
        } catch (error) {
          console.error('Price refresh failed:', error);
        }
      },

      // ── Fetch fresh candle history for a single stock ──────────
      fetchHistory: async (symbol: string) => {
        try {
          const { getStockCandles } = await import('../lib/finnhub');
          const candle = await getStockCandles(symbol, '60');
          if (!candle) return;

          const history: PricePoint[] = candle.t.map((t, i) => ({
            timestamp: t * 1000,
            price: candle.c[i],
            volume: candle.v[i],
          }));

          set((prev) => ({
            stocks: prev.stocks.map(s =>
              s.symbol === symbol ? { ...s, history } : s
            ),
          }));
        } catch (error) {
          console.error(`Failed to fetch history for ${symbol}:`, error);
        }
      },

      // ── Buy stock ──────────────────────────────────────────────
      buyStock: (symbol: string, shares: number): boolean => {
        const state = get();
        const stock = state.stocks.find(s => s.symbol === symbol);
        if (!stock || shares <= 0) return false;

        const cost = shares * stock.currentPrice;
        
        // Unify with userStore
        const userStore = useUserStore.getState();
        if (userStore.user.pacTokens < cost) return false;

        const success = userStore.spendTokens(cost);
        if (!success) return false;

        const existingHolding = state.holdings.find(h => h.symbol === symbol);
        let newHoldings: Holding[];

        if (existingHolding) {
          // Average-cost method
          const totalShares = existingHolding.shares + shares;
          const totalCost = (existingHolding.shares * existingHolding.avgBuyPrice) + cost;
          const newAvg = totalCost / totalShares;

          newHoldings = state.holdings.map(h =>
            h.symbol === symbol
              ? { ...h, shares: totalShares, avgBuyPrice: newAvg, currentPrice: stock.currentPrice, totalValue: totalShares * stock.currentPrice, profitLoss: (totalShares * stock.currentPrice) - totalCost, profitLossPercent: ((stock.currentPrice - newAvg) / newAvg) * 100 }
              : h
          );
        } else {
          newHoldings = [...state.holdings, {
            symbol,
            shares,
            avgBuyPrice: stock.currentPrice,
            currentPrice: stock.currentPrice,
            totalValue: cost,
            profitLoss: 0,
            profitLossPercent: 0,
          }];
        }

        const tx: StockTransaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          symbol,
          type: 'buy',
          shares,
          price: stock.currentPrice,
          total: cost,
          timestamp: new Date(),
        };

        set({
          balance: userStore.user.pacTokens - cost,
          holdings: newHoldings,
          transactions: [tx, ...state.transactions].slice(0, 50), // Keep last 50
        });

        return true;
      },

      // ── Sell stock ─────────────────────────────────────────────
      sellStock: (symbol: string, shares: number): boolean => {
        const state = get();
        const stock = state.stocks.find(s => s.symbol === symbol);
        const holding = state.holdings.find(h => h.symbol === symbol);
        if (!stock || !holding || shares <= 0 || holding.shares < shares) return false;

        const revenue = shares * stock.currentPrice;
        
        // Unify with userStore
        const userStore = useUserStore.getState();
        userStore.addTokens(revenue);

        const remainingShares = holding.shares - shares;

        let newHoldings: Holding[];
        if (remainingShares <= 0.0001) {
          // Remove the holding entirely
          newHoldings = state.holdings.filter(h => h.symbol !== symbol);
        } else {
          newHoldings = state.holdings.map(h =>
            h.symbol === symbol
              ? { ...h, shares: remainingShares, currentPrice: stock.currentPrice, totalValue: remainingShares * stock.currentPrice, profitLoss: (remainingShares * stock.currentPrice) - (remainingShares * h.avgBuyPrice), profitLossPercent: ((stock.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100 }
              : h
          );
        }

        const tx: StockTransaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          symbol,
          type: 'sell',
          shares,
          price: stock.currentPrice,
          total: revenue,
          timestamp: new Date(),
        };

        set({
          balance: userStore.user.pacTokens + revenue,
          holdings: newHoldings,
          transactions: [tx, ...state.transactions].slice(0, 50),
        });

        return true;
      },

      addToWatchlist: (symbol) => set((s) => ({ watchlist: [...s.watchlist, symbol] })),
      removeFromWatchlist: (symbol) => set((s) => ({ watchlist: s.watchlist.filter(w => w !== symbol) })),

      applyMarketEvent: (event) => {
        set((state) => ({
          stocks: state.stocks.map(stock => {
            if (event.affectedSectors?.includes(stock.sector)) {
              const multiplier = 1 + (event.impact || 0);
              return { ...stock, currentPrice: stock.currentPrice * multiplier };
            }
            return stock;
          }),
        }));
      },
    }),
    {
      name: 'splitsmart-stocks-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        holdings: state.holdings,
        transactions: state.transactions,
        balance: state.balance,
        watchlist: state.watchlist,
      }),
    }
  )
);

// Real-time synchronization: when userStore updates pacTokens, sync stockStore balance
if (typeof window !== 'undefined') {
  useUserStore.subscribe((state) => {
    const pacTokens = state.user?.pacTokens ?? 500;
    if (useStockStore.getState().balance !== pacTokens) {
      useStockStore.setState({ balance: pacTokens });
    }
  });
}
