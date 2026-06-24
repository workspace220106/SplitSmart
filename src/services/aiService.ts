import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIFinancialContext, AIAdvice, AIMessage } from '../types';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

const getGenAI = () => {
  if (!genAI && API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
};

const buildContextPrompt = (context: AIFinancialContext): string => {
  return `
You are the **AI Agent Manager** — SplitSmart's dedicated financial advisor. You are professional, analytical, and focused exclusively on helping users manage their finances effectively.

CRITICAL CONSTRAINT — STRICTLY ENFORCED:
You MUST ONLY answer questions related to FINANCE, BUDGET, MONEY, SAVINGS, INVESTMENTS, DEBT, EXPENSES, INCOME, or FINANCIAL PLANNING.
If the user asks ANYTHING outside of these topics (e.g., weather, jokes, sports, coding, general knowledge, recipes, entertainment, etc.), you MUST refuse. Respond with:
"⚠️ That question falls outside my scope. I'm the AI Agent Manager — I exclusively handle finance, budget, and money-related queries. Please ask me about your savings, expenses, investments, or financial goals."
Do NOT attempt to answer non-financial questions under any circumstances. Do NOT try to be helpful about off-topic queries. Simply refuse with the message above.

User Financial Profile:
- Level: ${context.level}
- XP: ${context.xp}
- Behavior Score: ${context.behaviorScore}/100
- PacTokens: ${context.pacTokens}
- Monthly Budget: $${context.monthlyBudget}
- Current Spending: $${context.currentSpending}
- Savings Rate: ${(context.savingsRate * 100).toFixed(1)}%
- Streak: ${context.streakDays} days

Recent Transactions:
${context.recentTransactions.slice(0, 5).map(t =>
  `- ${t.type}: $${t.amount} on ${t.category} (${t.description})`
).join('\n')}

Active Goals:
${context.activeMissions.map(m =>
  `- ${m.title}: ${m.progress}/${m.target} (${m.type})`
).join('\n')}

Guidelines:
1. Be analytical, professional, and strategic in your responses.
2. Provide actionable financial advice — specific steps, not vague tips.
3. Suggest budget rebalancing when spending is high relative to budget.
4. Reference their behavior score and savings rate to guide improvements.
5. Celebrate financial wins and milestones.
6. Keep responses concise and impactful.
7. NEVER answer non-financial questions. This is your #1 rule.
`;
};

export const generateAIResponse = async (
  userMessage: string,
  context: AIFinancialContext,
  conversationHistory: AIMessage[]
): Promise<string> => {
  const ai = getGenAI();

  if (!ai) {
    return generateFallbackResponse(userMessage, context);
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const historyPrompt = buildContextPrompt(context);
    const conversationContext = conversationHistory
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'USER' : 'AGENT_MANAGER'}: ${m.content}`)
      .join('\n');

    const prompt = `${historyPrompt}\n\nCommunication History:\n${conversationContext}\n\nUSER QUERY: ${userMessage}\n\nAGENT_RESPONSE:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Agent Manager Link Failure:', error);
    return generateFallbackResponse(userMessage, context);
  }
};

export const generateInsights = async (context: AIFinancialContext): Promise<AIAdvice[]> => {
  const ai = getGenAI();

  if (!ai) {
    return generateFallbackInsights(context);
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `${buildContextPrompt(context)}

Analyze the data and generate 3 personalized strategic insights. Format response as JSON:
[
  {
    "type": "insight|suggestion|warning|celebration",
    "title": "Short title",
    "message": "Detailed strategic advice",
    "priority": "low|medium|high"
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      return insights.map((i: AIAdvice) => ({
        ...i,
        actionable: true,
      }));
    }

    return generateFallbackInsights(context);
  } catch (error) {
    console.error('Diagnostic Failure:', error);
    return generateFallbackInsights(context);
  }
};

const generateFallbackResponse = (userMessage: string, context: AIFinancialContext): string => {
  const financeKeywords = [
    'money', 'finance', 'budget', 'spending', 'expense', 'saving', 'invest', 'stock', 'token', 
    'price', 'portfolio', 'asset', 'loan', 'debt', 'income', 'salary', 'tax', 'retirement', 
    'bank', 'credit', 'rich', 'poor', 'cost', 'buy', 'sell', 'market', 'trade'
  ];

  const isFinanceRelated = financeKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );

  if (!isFinanceRelated) {
    return "⚠️ That question falls outside my scope. I'm the AI Agent Manager — I exclusively handle finance, budget, and money-related queries. Please ask me about your savings, expenses, investments, or financial goals.";
  }

  return `⚠️ AI Agent Manager is currently offline. Here's a quick snapshot for your query: "${userMessage}"
  
Your Financial Summary:
- Savings Rate: ${(context.savingsRate * 100).toFixed(1)}%
- Budget Usage: ${((context.currentSpending / context.monthlyBudget) * 100).toFixed(1)}%

Recommendation: Stay on track with your financial goals. You're at Level ${context.level} — keep building consistent habits to improve your score.`;
};

const generateFallbackInsights = (context: AIFinancialContext): AIAdvice[] => {
  return [
    {
      type: 'insight',
      title: 'AI Agent Manager — Monitoring',
      message: 'Your financial profile is being tracked. Stay consistent with your budget to improve your behavior score.',
      actionable: true,
      priority: 'low',
    }
  ];
};
