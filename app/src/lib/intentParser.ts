export interface ParsedIntent {
  intent: 'add_expense' | 'add_credit_got' | 'add_credit_gave' | 'add_card_spend' | 'add_income' | 'navigate' | 'unknown';
  params: Record<string, string>;
}

export function parseIntent(text: string): ParsedIntent {
  const lowerText = text.toLowerCase().trim();

  // 1. "Spent X on Y" -> add_expense
  const spentRegex = /^spent\s+(\d+(?:\.\d+)?)(?:\s+on\s+(.+))?/i;
  const spentMatch = lowerText.match(spentRegex);
  if (spentMatch) {
    return {
      intent: 'add_expense',
      params: {
        amount: spentMatch[1],
        description: spentMatch[2] || '',
      }
    };
  }

  // 2. "Got X from Y" -> add_credit_got
  const gotRegex = /^got\s+(\d+(?:\.\d+)?)(?:\s+from\s+(.+))?/i;
  const gotMatch = lowerText.match(gotRegex);
  if (gotMatch) {
    return {
      intent: 'add_credit_got',
      params: {
        amount: gotMatch[1],
        note: gotMatch[2] || '',
      }
    };
  }

  // 3. "Gave X to Y" -> add_credit_gave
  const gaveRegex = /^gave\s+(\d+(?:\.\d+)?)(?:\s+to\s+(.+))?/i;
  const gaveMatch = lowerText.match(gaveRegex);
  if (gaveMatch) {
    return {
      intent: 'add_credit_gave',
      params: {
        amount: gaveMatch[1],
        note: gaveMatch[2] || '',
      }
    };
  }

  // 4. "Card spend X at Y" -> add_card_spend
  const cardRegex = /^card\s+spend\s+(\d+(?:\.\d+)?)(?:\s+at\s+(.+))?/i;
  const cardMatch = lowerText.match(cardRegex);
  if (cardMatch) {
    return {
      intent: 'add_card_spend',
      params: {
        amount: cardMatch[1],
        note: cardMatch[2] || '', // mapping 'at Y' to note or merchant
        merchant: cardMatch[2] || '',
      }
    };
  }

  // 5. "Add income X Y" -> add_income
  const incomeRegex = /^add\s+income\s+(\d+(?:\.\d+)?)(?:\s+(.+))?/i;
  const incomeMatch = lowerText.match(incomeRegex);
  if (incomeMatch) {
    return {
      intent: 'add_income',
      params: {
        amount: incomeMatch[1],
        notes: incomeMatch[2] || '',
      }
    };
  }

  // 6. "Open loans", "Open X" -> navigate
  const openRegex = /^open\s+(.+)/i;
  const openMatch = lowerText.match(openRegex);
  if (openMatch) {
    return {
      intent: 'navigate',
      params: {
        target: openMatch[1].trim(),
      }
    };
  }

  return { intent: 'unknown', params: {} };
}
