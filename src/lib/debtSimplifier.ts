import { Expense, Group, Settlement, SimplifiedDebt } from '@/types';

/**
 * Calculates the exact share each user owes for a single expense.
 * Returns a mapping of userId to the amount they owe.
 */
export function calculateExpenseShares(expense: Expense, groupMembers: string[]): Record<string, number> {
  const shares: Record<string, number> = {};
  const total = expense.amount;
  const participantIds = Object.keys(expense.splitDetails).length > 0 
    ? Object.keys(expense.splitDetails) 
    : groupMembers;

  if (participantIds.length === 0) return {};

  switch (expense.splitType) {
    case 'equal': {
      const perPerson = total / participantIds.length;
      participantIds.forEach(id => {
        shares[id] = Number(perPerson.toFixed(2));
      });
      break;
    }
    case 'percentage': {
      let allocated = 0;
      participantIds.forEach((id, idx) => {
        if (idx === participantIds.length - 1) {
          // Put the remainder on the last person to avoid floating point issues
          shares[id] = Number((total - allocated).toFixed(2));
        } else {
          const pct = expense.splitDetails[id] || 0;
          const share = Number((total * (pct / 100)).toFixed(2));
          shares[id] = share;
          allocated += share;
        }
      });
      break;
    }
    case 'exact': {
      participantIds.forEach(id => {
        shares[id] = expense.splitDetails[id] || 0;
      });
      break;
    }
    case 'shares': {
      const totalShares = Object.values(expense.splitDetails).reduce((sum, val) => sum + val, 0);
      if (totalShares <= 0) {
        // Fallback to equal split
        const perPerson = total / participantIds.length;
        participantIds.forEach(id => {
          shares[id] = Number(perPerson.toFixed(2));
        });
      } else {
        let allocated = 0;
        participantIds.forEach((id, idx) => {
          if (idx === participantIds.length - 1) {
            shares[id] = Number((total - allocated).toFixed(2));
          } else {
            const userShares = expense.splitDetails[id] || 0;
            const share = Number((total * (userShares / totalShares)).toFixed(2));
            shares[id] = share;
            allocated += share;
          }
        });
      }
      break;
    }
  }

  return shares;
}

/**
 * Calculates net balances for all members of a group.
 * Positive balance = user is owed money (creditor).
 * Negative balance = user owes money (debtor).
 */
export function calculateNetBalances(
  group: Group,
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, number> {
  const balances: Record<string, number> = {};
  const memberIds = group.members.map(m => m.id);

  // Initialize all balances to 0
  memberIds.forEach(id => {
    balances[id] = 0;
  });

  // 1. Process Expenses
  expenses.forEach(expense => {
    // Payer gets credit
    if (balances[expense.payerId] !== undefined) {
      balances[expense.payerId] += expense.amount;
    }

    // Participants get debited
    const participantShares = calculateExpenseShares(expense, memberIds);
    Object.entries(participantShares).forEach(([userId, shareAmount]) => {
      if (balances[userId] !== undefined) {
        balances[userId] -= shareAmount;
      }
    });
  });

  // 2. Process Settlements
  settlements.forEach(settlement => {
    // Only completed settlements offset the ledger
    if (settlement.status === 'completed') {
      if (balances[settlement.fromUserId] !== undefined) {
        balances[settlement.fromUserId] += settlement.amount;
      }
      if (balances[settlement.toUserId] !== undefined) {
        balances[settlement.toUserId] -= settlement.amount;
      }
    }
  });

  // Round balances to 2 decimal places to avoid floating point issues
  Object.keys(balances).forEach(id => {
    balances[id] = Number(balances[id].toFixed(2));
  });

  return balances;
}

/**
 * Simplifies group debts using a greedy algorithm.
 * Returns the minimum number of transactions needed to settle everyone up.
 */
export function simplifyDebts(
  group: Group,
  expenses: Expense[],
  settlements: Settlement[]
): SimplifiedDebt[] {
  const netBalances = calculateNetBalances(group, expenses, settlements);

  // Separate debtors and creditors
  interface MemberBalance {
    userId: string;
    balance: number;
  }

  const debtors: MemberBalance[] = [];
  const creditors: MemberBalance[] = [];

  Object.entries(netBalances).forEach(([userId, balance]) => {
    if (balance < -0.01) {
      debtors.push({ userId, balance });
    } else if (balance > 0.01) {
      creditors.push({ userId, balance });
    }
  });

  const transactions: SimplifiedDebt[] = [];

  // Greedily match debtors and creditors
  let debtorIdx = 0;
  let creditorIdx = 0;

  // Sort initially to process largest amounts first (speeds up matching)
  debtors.sort((a, b) => a.balance - b.balance); // Most negative first
  creditors.sort((a, b) => b.balance - a.balance); // Most positive first

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const amountOwed = -debtor.balance;
    const amountCredited = creditor.balance;

    const settleAmount = Number(Math.min(amountOwed, amountCredited).toFixed(2));

    if (settleAmount > 0) {
      transactions.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: settleAmount
      });
    }

    debtor.balance += settleAmount;
    creditor.balance -= settleAmount;

    // Move pointers if balance is settled
    if (Math.abs(debtor.balance) < 0.01) {
      debtorIdx++;
    }
    if (Math.abs(creditor.balance) < 0.01) {
      creditorIdx++;
    }
  }

  return transactions;
}
