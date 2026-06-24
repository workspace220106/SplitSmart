import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Group, Expense, Settlement, Category, SplitType } from '../types';

interface SplitStore {
  currentUser: User;
  usersList: User[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  
  // Actions
  setCurrentUser: (user: User) => void;
  addUser: (name: string, email: string, upiId?: string) => User;
  createGroup: (name: string, description: string, creatorId: string) => Group;
  joinGroup: (inviteCode: string, userId: string) => Group | null;
  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  deleteExpense: (id: string) => void;
  addSettlement: (settlementData: Omit<Settlement, 'id' | 'status' | 'createdAt'>) => Settlement;
  confirmSettlement: (settlementId: string) => void;
  rejectSettlement: (settlementId: string) => void;
  checkRecurringExpenses: () => void;
}

// Seed Initial Data for a beautiful first load
const SEED_USERS: User[] = [
  { id: 'u1', name: 'Aarav (You)', email: 'aarav@college.edu', upiId: 'aarav@okhdfcbank', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60' },
  { id: 'u2', name: 'Kabir', email: 'kabir@college.edu', upiId: 'kabir@okaxis', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60' },
  { id: 'u3', name: 'Riya', email: 'riya@college.edu', upiId: 'riya@okicici', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60' },
  { id: 'u4', name: 'Sneha', email: 'sneha@college.edu', upiId: 'sneha@paytm', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60' }
];

const SEED_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Flat 204 Roomies 🏠',
    description: 'Monthly flat rent, groceries, cleaner, and Wi-Fi splitting.',
    inviteCode: 'FLAT204',
    members: SEED_USERS,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'u1'
  },
  {
    id: 'g2',
    name: 'Goa Trip 2026 🌴',
    description: 'Road trip splits: fuel, villa booking, shacks, and water sports.',
    inviteCode: 'GOA2026',
    members: [SEED_USERS[0], SEED_USERS[1], SEED_USERS[2]],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'u2'
  }
];

const SEED_EXPENSES: Expense[] = [
  // Flat 204 Rent & Utilities
  {
    id: 'e1',
    groupId: 'g1',
    amount: 24000,
    description: 'Monthly Apartment Rent',
    category: 'rent',
    payerId: 'u1', // Aarav paid
    splitType: 'equal',
    splitDetails: {},
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    isRecurring: true,
    recurringInterval: 'monthly'
  },
  {
    id: 'e2',
    groupId: 'g1',
    amount: 1500,
    description: 'High-speed Wi-Fi internet',
    category: 'utilities',
    payerId: 'u2', // Kabir paid
    splitType: 'equal',
    splitDetails: {},
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    isRecurring: true,
    recurringInterval: 'monthly'
  },
  {
    id: 'e3',
    groupId: 'g1',
    amount: 1200,
    description: 'Swiggy Dinner Feast',
    category: 'food',
    payerId: 'u3', // Riya paid
    splitType: 'shares',
    // Riya, Aarav eat more shares, Sneha eats less
    splitDetails: { 'u1': 2, 'u2': 1, 'u3': 2, 'u4': 1 },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'e4',
    groupId: 'g1',
    amount: 400,
    description: 'Milk & Eggs supply',
    category: 'food',
    payerId: 'u4', // Sneha paid
    splitType: 'exact',
    splitDetails: { 'u1': 100, 'u2': 100, 'u3': 100, 'u4': 100 },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  
  // Goa Trip Splits
  {
    id: 'e5',
    groupId: 'g2',
    amount: 18000,
    description: 'Goa Villa Booking Deposit',
    category: 'travel',
    payerId: 'u2', // Kabir paid
    splitType: 'equal',
    splitDetails: {},
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'e6',
    groupId: 'g2',
    amount: 6000,
    description: 'Car Fuel / Diesel Refill',
    category: 'travel',
    payerId: 'u1', // Aarav paid
    splitType: 'percentage',
    splitDetails: { 'u1': 40, 'u2': 30, 'u3': 30 }, // Aarav drives and agreed to pay more
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'e7',
    groupId: 'g2',
    amount: 4500,
    description: 'Dinner at Curlies Shack',
    category: 'food',
    payerId: 'u3', // Riya paid
    splitType: 'equal',
    splitDetails: {},
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_SETTLEMENTS: Settlement[] = [
  {
    id: 's1',
    groupId: 'g1',
    fromUserId: 'u2',
    toUserId: 'u1',
    amount: 4500,
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    upiTxnRef: 'UPI8492048590'
  },
  {
    id: 's2',
    groupId: 'g2',
    fromUserId: 'u3',
    toUserId: 'u2',
    amount: 1500,
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    upiTxnRef: 'UPI1029384756'
  }
];

export const useSplitStore = create<SplitStore>()(
  persist(
    (set, get) => ({
      currentUser: SEED_USERS[0],
      usersList: SEED_USERS,
      groups: SEED_GROUPS,
      expenses: SEED_EXPENSES,
      settlements: SEED_SETTLEMENTS,

      setCurrentUser: (user) => set({ currentUser: user }),

      addUser: (name, email, upiId) => {
        const newUser: User = {
          id: `u_${Date.now()}`,
          name,
          email,
          upiId,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
        };
        set(state => ({
          usersList: [...state.usersList, newUser]
        }));
        return newUser;
      },

      createGroup: (name, description, creatorId) => {
        const creator = get().usersList.find(u => u.id === creatorId) || get().currentUser;
        const newGroup: Group = {
          id: `g_${Date.now()}`,
          name,
          description,
          inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          members: [creator],
          createdAt: new Date().toISOString(),
          createdBy: creatorId
        };
        set(state => ({
          groups: [...state.groups, newGroup]
        }));
        return newGroup;
      },

      joinGroup: (inviteCode, userId) => {
        const { groups, usersList } = get();
        const groupIndex = groups.findIndex(g => g.inviteCode.trim().toUpperCase() === inviteCode.trim().toUpperCase());
        
        if (groupIndex === -1) return null;
        
        const user = usersList.find(u => u.id === userId);
        if (!user) return null;

        const group = groups[groupIndex];
        
        // Check if user is already a member
        if (group.members.some(m => m.id === userId)) {
          return group;
        }

        const updatedGroup = {
          ...group,
          members: [...group.members, user]
        };

        const updatedGroups = [...groups];
        updatedGroups[groupIndex] = updatedGroup;

        set({ groups: updatedGroups });
        return updatedGroup;
      },

      addExpense: (expenseData) => {
        const newExpense: Expense = {
          ...expenseData,
          id: `e_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        set(state => ({
          expenses: [newExpense, ...state.expenses]
        }));
        return newExpense;
      },

      deleteExpense: (id) => set(state => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),

      addSettlement: (settlementData) => {
        const newSettlement: Settlement = {
          ...settlementData,
          id: `s_${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        set(state => ({
          settlements: [newSettlement, ...state.settlements]
        }));
        return newSettlement;
      },

      confirmSettlement: (settlementId) => set(state => ({
        settlements: state.settlements.map(s => 
          s.id === settlementId ? { ...s, status: 'completed' } : s
        )
      })),

      rejectSettlement: (settlementId) => set(state => ({
        settlements: state.settlements.filter(s => s.id !== settlementId)
      })),

      checkRecurringExpenses: () => {
        const { expenses, addExpense } = get();
        const recurringExpenses = expenses.filter(e => e.isRecurring);
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        recurringExpenses.forEach(expense => {
          const expenseDate = new Date(expense.createdAt);
          
          // Simple logic: if expense is monthly, check if we've reached a new month and haven't logged it
          if (expense.recurringInterval === 'monthly') {
            const hasBeenLoggedThisMonth = expenses.some(e => 
              e.groupId === expense.groupId &&
              e.description === expense.description &&
              e.payerId === expense.payerId &&
              e.amount === expense.amount &&
              e.id !== expense.id &&
              new Date(e.createdAt).getMonth() === currentMonth &&
              new Date(e.createdAt).getFullYear() === currentYear
            );

            // If it was created in a previous month and not logged this month yet
            const isCreatedInPreviousMonth = (expenseDate.getFullYear() < currentYear) || 
              (expenseDate.getFullYear() === currentYear && expenseDate.getMonth() < currentMonth);

            if (!hasBeenLoggedThisMonth && isCreatedInPreviousMonth) {
              // Log the recurring copy
              addExpense({
                groupId: expense.groupId,
                amount: expense.amount,
                description: `${expense.description} (Auto-Recurring)`,
                category: expense.category,
                payerId: expense.payerId,
                splitType: expense.splitType,
                splitDetails: expense.splitDetails,
                isRecurring: false // Do not make copies of copies recurring
              });
            }
          }
        });
      }
    }),
    {
      name: 'splitsmart-storage', // unique name in localStorage
    }
  )
);
