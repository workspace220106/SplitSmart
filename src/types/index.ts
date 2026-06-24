// User & Gamification Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  xp: number;
  level: number;
  pacTokens: number;
  behaviorScore: number;
  streakDays: number;
  longestStreak: number;
  joinedAt: Date;
  isPremium: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'saving' | 'tracking' | 'budget' | 'investment';
  target: number;
  progress: number;
  reward: {
    xp: number;
    tokens: number;
  };
  deadline?: Date;
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
}

// Finance Types
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  description: string;
  date: Date;
  tags?: string[];
}

export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'education'
  | 'health'
  | 'stationery'
  | 'other';

export interface Budget {
  id: string;
  category: Category;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly';
}

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  type: 'owed' | 'owing';
  dueDate?: Date;
  description?: string;
  isPaid: boolean;
}

// Stock Market Types
export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  previousPrice: number;
  volatility: number; // 0.1 - 0.5
  dayHigh: number;
  dayLow: number;
  marketCap: number;
  history: PricePoint[];
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface Holding {
  symbol: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Portfolio {
  balance: number; // PacTokens
  holdings: Holding[];
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  transactions: StockTransaction[];
}

export interface StockTransaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  timestamp: Date;
}

export interface MarketEvent {
  id: string;
  name: string;
  description: string;
  effect: Record<string, number>; // symbol -> multiplier
  affectedSectors: string[];
  impact: number; // multiplier delta, e.g. 0.05 = +5%
  duration: number; // minutes
  timestamp: Date;
}

// AI Types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  suggestions?: string[];
}

export interface AIFinancialContext {
  level: number;
  xp: number;
  behaviorScore: number;
  pacTokens: number;
  monthlyBudget: number;
  currentSpending: number;
  savingsRate: number;
  activeMissions: Mission[];
  recentTransactions: Transaction[];
  streakDays: number;
}

export interface AIAdvice {
  type: 'insight' | 'suggestion' | 'warning' | 'celebration' | 'mission';
  title: string;
  message: string;
  actionable?: boolean;
  action?: () => void;
  priority: 'low' | 'medium' | 'high';
}

// ─── SplitSmart Types (Group Expense Splitting) ──────────────────

export interface SplitUser {
  id: string;
  name: string;
  email: string;
  upiId?: string;
  avatar?: string;
}

export type SplitCategory = 'food' | 'travel' | 'rent' | 'utilities' | 'entertainment' | 'other';

export type SplitType = 'equal' | 'percentage' | 'exact' | 'shares';

export interface Group {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  members: SplitUser[];
  createdAt: string;
  createdBy: string;
}

export interface Expense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  category: SplitCategory;
  payerId: string;
  splitType: SplitType;
  // splitDetails maps userId to:
  // - percentage (for 'percentage')
  // - exact amount (for 'exact')
  // - number of shares (for 'shares')
  // - empty/ignored (for 'equal')
  splitDetails: Record<string, number>;
  createdAt: string;
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: 'pending' | 'completed';
  createdAt: string;
  upiTxnRef?: string;
}

export interface DebtBalance {
  userId: string;
  netBalance: number; // Positive means they should receive money, negative means they owe money
}

export interface SimplifiedDebt {
  fromUserId: string;
  toUserId: string;
  amount: number;
}
