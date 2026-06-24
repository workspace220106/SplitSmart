'use client';

import React, { useState } from 'react';
import { useStockStore } from '@/store/stockStore';

export default function TradePanel({ symbol }: { symbol: string }) {
  const { stocks, holdings, balance, buyStock, sellStock } = useStockStore();
  const [amount, setAmount] = useState('1');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const stock = stocks.find(s => s.symbol === symbol);
  if (!stock || stock.currentPrice <= 0) return null;

  const shares = parseFloat(amount) || 0;
  const price = stock.currentPrice;
  const total = shares * price;

  const holding = holdings.find(h => h.symbol === symbol);
  const ownedShares = holding?.shares || 0;

  const canBuy = shares > 0 && balance >= total;
  const canSell = shares > 0 && ownedShares >= shares;
  const isValid = tradeType === 'buy' ? canBuy : canSell;

  const handleTrade = () => {
    let success = false;
    if (tradeType === 'buy') {
      success = buyStock(symbol, shares);
    } else {
      success = sellStock(symbol, shares);
    }

    if (success) {
      setFeedback({ type: 'success', msg: `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${shares} ${symbol} for ${total.toFixed(2)} TK` });
      setAmount('1');
    } else {
      setFeedback({ type: 'error', msg: tradeType === 'buy' ? 'Insufficient tokens!' : 'Not enough shares!' });
    }

    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="bg-black border-2 border-primary/30 p-5 flex flex-col gap-4 relative overflow-hidden shadow-[0_0_20px_rgba(255,211,0,0.05)]">
      <h2 className="font-headline text-lg uppercase tracking-[0.2em] text-primary border-b border-primary/20 pb-2 mb-1 font-bold">
        Trade <span className="text-white/50 text-[10px] ml-2 font-normal">[{symbol}]</span>
      </h2>

      {/* Buy / Sell tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTradeType('buy')}
          className={`flex-1 font-headline uppercase font-bold py-3 transition-all duration-200 border-2 ${
            tradeType === 'buy'
              ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(255,211,0,0.4)]'
              : 'bg-black text-primary/50 border-primary/20 hover:border-primary/50'
          }`}
        >
          BUY
        </button>
        <button
          onClick={() => setTradeType('sell')}
          className={`flex-1 font-headline uppercase font-bold py-3 transition-all duration-200 border-2 ${
            tradeType === 'sell'
              ? 'bg-error text-white border-error shadow-[0_0_15px_rgba(255,0,0,0.4)]'
              : 'bg-black text-error/50 border-error/20 hover:border-error/50'
          }`}
        >
          SELL
        </button>
      </div>

      {/* Quantity */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Shares</label>
        <input
          type="number"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-zinc-900 border-0 border-b-2 border-primary text-primary font-mono text-xl focus:ring-0 focus:border-b-4 focus:bg-zinc-800 transition-all w-full py-2 px-3 outline-none"
        />
      </div>

      {/* Total */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Total Cost (Tokens)</label>
        <div className="bg-zinc-900/50 border border-zinc-800 text-white font-mono text-xl w-full py-2 px-3 flex justify-between items-center">
          <span>{total.toFixed(2)}</span>
          <span className="text-[10px] text-primary">TK</span>
        </div>
      </div>

      {/* Info row */}
      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 mt-1 uppercase tracking-tighter">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[10px]">account_balance_wallet</span>
          <span>Balance: {balance.toFixed(2)} TK</span>
        </div>
        {ownedShares > 0 && (
          <div className="flex items-center gap-1 text-secondary">
            <span className="material-symbols-outlined text-[10px]">inventory_2</span>
            <span>Holding: {ownedShares.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Execute button */}
      <button
        onClick={handleTrade}
        disabled={!isValid}
        className={`w-full font-headline uppercase py-4 mt-2 transition-all flex justify-center items-center gap-3 font-bold text-sm tracking-widest ${
          isValid
            ? 'bg-primary text-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]'
            : 'bg-zinc-900 text-zinc-600 border-2 border-zinc-800 opacity-50 cursor-not-allowed'
        }`}
      >
        <span className="material-symbols-outlined text-lg">videogame_asset</span>
        {tradeType === 'buy' ? 'BUY NOW' : 'SELL NOW'}
      </button>

      {/* Feedback toast */}
      {feedback && (
        <div className={`text-[10px] font-mono uppercase text-center py-2 font-bold tracking-[0.15em] transition-all ${
          feedback.type === 'success' ? 'text-primary bg-primary/5' : 'text-error bg-error/5 animate-pulse'
        }`}>
          {feedback.msg}
        </div>
      )}
    </div>
  );
}
