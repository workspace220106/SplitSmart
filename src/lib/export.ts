import { Expense, SplitUser } from '@/types';

/**
 * Downloads a list of expenses as a CSV file.
 */
export function exportExpensesToCSV(expenses: Expense[], members: SplitUser[], groupName: string) {
  const memberMap = new Map(members.map(m => [m.id, m.name]));

  // CSV headers
  const headers = ['Date', 'Description', 'Category', 'Payer', 'Total Amount', 'Split Type', 'Split Details'];

  // Convert expenses to rows
  const rows = expenses.map(expense => {
    const dateStr = new Date(expense.createdAt).toLocaleDateString();
    const payerName = memberMap.get(expense.payerId) || 'Unknown';
    
    // Format split details into a reader-friendly string
    let splitSummary = '';
    if (expense.splitType === 'equal') {
      splitSummary = 'Split Equally';
    } else {
      splitSummary = Object.entries(expense.splitDetails)
        .map(([id, val]) => {
          const name = memberMap.get(id) || id;
          if (expense.splitType === 'percentage') return `${name}: ${val}%`;
          if (expense.splitType === 'exact') return `${name}: ₹${val}`;
          if (expense.splitType === 'shares') return `${name}: ${val} shares`;
          return `${name}: ${val}`;
        })
        .join(' | ');
    }

    // Escape CSV values
    const escape = (val: string | number) => {
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
    };

    return [
      escape(dateStr),
      escape(expense.description),
      escape(expense.category),
      escape(payerName),
      expense.amount,
      escape(expense.splitType),
      escape(splitSummary)
    ];
  });

  const csvContent = [
    [`Group Name: ${groupName}`],
    [],
    headers,
    ...rows
  ]
    .map(row => row.join(','))
    .join('\n');

  // Trigger file download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `splitsmart_${groupName.toLowerCase().replace(/\s+/g, '_')}_expenses.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
