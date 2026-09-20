// Local intelligent NLP synthesis and knowledge engine for on-device inference
// Solves the issue where prompts fell back to a single repetitive template.

export interface QueryIntent {
  type: 
    | 'math' 
    | 'code' 
    | 'explanation' 
    | 'creative' 
    | 'conversational' 
    | 'factual' 
    | 'comparison' 
    | 'how-to' 
    | 'opinion' 
    | 'followup';
  subject: string;
  language?: string;
  isQuestion: boolean;
}

export class LocalKnowledgeEngine {
  // Evaluates arithmetic & mathematical expressions safely
  public static tryEvaluateMath(prompt: string): string | null {
    const clean = prompt.toLowerCase()
      .replace(/what is|calculate|evaluate|solve|compute|\?|equals|equal to/g, '')
      .trim();

    // Check for standard arithmetic expressions e.g. "15 * 8", "125 / 5", "2^8", "sqrt(144)"
    const mathPattern = /^[\d\s+\-*/^().,%x×÷]+$/;
    const sanitized = clean
      .replace(/x|×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**')
      .replace(/%/g, '/100');

    if (mathPattern.test(sanitized) && /[\d]/.test(sanitized) && /[+\-*/]/.test(sanitized)) {
      try {
        // Safe evaluation limited strictly to numbers and basic math operators
        const fn = new Function(`return (${sanitized});`);
        const result = fn();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
          return `The result of **${clean.trim()}** is **${result.toLocaleString()}**.\n\n### Calculation Breakdown\n- **Expression**: \`${clean.trim()}\`\n- **Computed Value**: \`${result}\``;
        }
      } catch {
        // Fall through if not valid math
      }
    }

    // Common conversion patterns
    if (clean.includes('miles to km') || clean.includes('miles in km')) {
      const num = parseFloat(clean);
      if (!isNaN(num)) {
        return `**${num} miles** is approximately **${(num * 1.60934).toFixed(2)} kilometers** (1 mile ≈ 1.609 km).`;
      }
    }
    if (clean.includes('km to miles')) {
      const num = parseFloat(clean);
      if (!isNaN(num)) {
        return `**${num} kilometers** is approximately **${(num / 1.60934).toFixed(2)} miles** (1 km ≈ 0.6214 miles).`;
      }
    }
    if (clean.includes('c to f') || clean.includes('celsius to fahrenheit')) {
      const num = parseFloat(clean);
      if (!isNaN(num)) {
        return `**${num}°C** equals **${((num * 9/5) + 32).toFixed(1)}°F**.`;
      }
    }
    if (clean.includes('f to c') || clean.includes('fahrenheit to celsius')) {
      const num = parseFloat(clean);
      if (!isNaN(num)) {
        return `**${num}°F** equals **${(((num - 32) * 5/9)).toFixed(1)}°C**.`;
      }
    }

    return null;
  }

  // Detects intent and semantics from the user query
  public static analyzeIntent(prompt: string, prevMessages: { role: string; content: string }[]): QueryIntent {
    const p = prompt.toLowerCase().trim();

    // Check for follow-up intents
    if (
      p === 'why?' || 
      p === 'how?' || 
      p.startsWith('tell me more') || 
      p.startsWith('explain more') || 
      p.startsWith('can you expand') ||
      p.startsWith('give another example') ||
      p.startsWith('make it simpler') ||
      p.startsWith('elaborate')
    ) {
      const lastAssistant = [...prevMessages].reverse().find(m => m.role === 'assistant');
      return {
        type: 'followup',
        subject: lastAssistant?.content.slice(0, 100) || 'previous discussion',
        isQuestion: true,
      };
    }

    // Creative writing
    if (
      p.includes('poem') || 
      p.includes('haiku') || 
      p.includes('story') || 
      p.includes('joke') || 
      p.includes('riddle') || 
      p.includes('song') || 
      p.includes('lyrics') || 
      p.includes('write a story') ||
      p.includes('limerick')
    ) {
      return { type: 'creative', subject: prompt, isQuestion: false };
    }

    // Coding intent
    const codingLanguages = ['python', 'javascript', 'typescript', 'rust', 'c++', 'html', 'css', 'react', 'sql', 'bash', 'go', 'java', 'docker'];
    const hasCodeLang = codingLanguages.some(lang => p.includes(lang));
    if (
      hasCodeLang || 
      p.includes('code') || 
      p.includes('function') || 
      p.includes('algorithm') || 
      p.includes('bug') || 
      p.includes('error') || 
      p.includes('component') ||
      p.includes('regex') ||
      p.includes('sql query') ||
      p.includes('loop')
    ) {
      const detectedLang = codingLanguages.find(l => p.includes(l)) || 'code';
      return { type: 'code', subject: prompt, language: detectedLang, isQuestion: p.includes('?') };
    }

    // Comparison
    if (p.includes(' vs ') || p.includes(' versus ') || p.includes('difference between') || p.includes('compare')) {
      return { type: 'comparison', subject: prompt, isQuestion: true };
    }

    // How-to / instructional
    if (p.startsWith('how to') || p.startsWith('how do i') || p.startsWith('how can i') || p.includes('steps to') || p.includes('guide')) {
      return { type: 'how-to', subject: prompt, isQuestion: true };
    }

    // Explanations
    if (p.startsWith('why') || p.startsWith('explain') || p.startsWith('what is') || p.startsWith('what are') || p.includes('meaning of')) {
      return { type: 'explanation', subject: prompt, isQuestion: true };
    }

    // Conversational / Greetings / Sentiment
    if (
      p.includes('hello') || 
      p.includes('hi ') || 
      p === 'hi' || 
      p.includes('hey') || 
      p.includes('good morning') || 
      p.includes('good evening') ||
      p.includes('how are you') ||
      p.includes('thank') ||
      p.includes('cool') ||
      p.includes('bye') ||
      p.includes('what can you do')
    ) {
      return { type: 'conversational', subject: prompt, isQuestion: p.includes('?') };
    }

    return { type: 'factual', subject: prompt, isQuestion: p.includes('?') };
  }
}
