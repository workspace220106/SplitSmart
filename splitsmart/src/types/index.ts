export interface User {
  id: string;
  name: string;
  email: string;
  upiId?: string;
  avatar?: string;
}

export type Category = 'food' | 'travel' | 'rent' | 'utilities' | 'entertainment' | 'other';

export type SplitType = 'equal' | 'percentage' | 'exact' | 'shares';

export interface Group {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  members: User[];
  createdAt: string;
  createdBy: string;
}

export interface Expense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  category: Category;
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
