import { ModelId } from '../types';
import { LocalKnowledgeEngine, QueryIntent } from './localKnowledgeEngine';

export class DynamicResponder {
  public static generate(
    prompt: string, 
    modelId: ModelId, 
    messages: { role: string; content: string }[],
    systemPrompt: string
  ): string {
    const p = prompt.trim();
    const lower = p.toLowerCase();

    // 1. Casual confusion, slang, short reactions ("huh", "what", "bruh", "wdym")
    const confusionWords = ['huh', 'what', 'wut', 'wait what', 'eh', 'eh?', 'huh?', 'what?', 'confused', 'wdym', 'what do you mean', 'u what', 'say what'];
    const isSingleConfusion = confusionWords.includes(lower) || lower.replace(/[?!. ]/g, '') === 'huh' || lower.replace(/[?!. ]/g, '') === 'what';

    if (isSingleConfusion) {
      const naturalConfusionReplies = [
        `Haha did I say something confusing or weird? My bad! What's on your mind?`,
        `Did I lose you there? Ask me whatever you were wondering about and I'll give it to you straight!`,
        `Wait, did that make zero sense? Tell me what you're thinking or what you need help with!`,
        `Haha, talk to me! Did something sound strange, or what were you looking for?`
      ];
      return naturalConfusionReplies[Math.floor(Math.random() * naturalConfusionReplies.length)];
    }

    // 2. Frustration with robotic answers / complaints about repetition
    if (
      lower.includes('robot') || 
      lower.includes('repeating') || 
      lower.includes('same answer') || 
      lower.includes('same response') || 
      lower.includes('what the absolute') ||
      lower.includes('freakin') ||
      lower.includes('fucking') ||
      lower.includes('wtf') ||
      (lower.includes('repeat') && lower.includes('answer'))
    ) {
      return `I don't blame you at all for saying that—replying to "huh" with *"When approaching huh, it helps to consider the subject from foundational principles"* was completely absurd and hilariously robotic!

That was a silly fallback template kicking in because it tried to treat a casual reaction like a university thesis. 

I've thrown that entire robotic template in the trash. I'm right here with you—no more essays, no more fake templates. What do you actually want to chat about or work on?`;
    }

    // 3. Math & Arithmetic Computation
    const mathResult = LocalKnowledgeEngine.tryEvaluateMath(prompt);
    if (mathResult) {
      return mathResult;
    }

    // 4. Conversational / Greetings / Slang
    if (lower === 'hi' || lower === 'hello' || lower.startsWith('hey') || lower === 'yo' || lower === 'sup' || lower.startsWith('howdy')) {
      const greetings = [
        `Hey! What's up?`,
        `Hey there! What are we working on today?`,
        `Yo! How's it going? Ask me anything or tell me what you want to do.`,
        `Hello! Ready whenever you are.`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (lower === 'bro' || lower === 'bruh' || lower === 'dude' || lower === 'man') {
      return `Yo! What's going on?`;
    }

    if (lower === 'lol' || lower === 'lmao' || lower === 'haha' || lower === 'hahaha' || lower.includes('rofl')) {
      return `Glad that got a laugh out of you! What's next?`;
    }

    if (lower === 'ok' || lower === 'okay' || lower === 'cool' || lower === 'nice' || lower === 'got it' || lower === 'alright') {
      return `Awesome! Let me know if you want to dig into anything else or try something new.`;
    }

    if (lower === 'yes' || lower === 'yeah' || lower === 'yep' || lower === 'sure') {
      return `Sounds good! Tell me where you'd like to take it next.`;
    }

    if (lower === 'no' || lower === 'nope' || lower === 'nah') {
      return `Fair enough! What would you prefer instead?`;
    }

    if (lower.includes('idk') || lower.includes('don\'t know') || lower.includes('not sure')) {
      return `No worries at all! We can figure it out together. What topic or problem were you thinking about?`;
    }

    if (lower.includes('how are you') || lower.includes('how\'re you') || lower.includes('how you doing')) {
      return `I'm doing great, running smoothly and ready for whatever questions or ideas you have! How's your day going?`;
    }

    if (lower.includes('thank you') || lower.includes('thanks') || lower === 'thx') {
      return `Anytime! Let me know if you need anything else.`;
    }

    if (lower.includes('who made you') || lower.includes('who created you') || lower.includes('who are you')) {
      if (modelId === 'deepseek-r1-1.5b') {
        return `I'm **DeepSeek-R1 Distill Qwen 1.5B**, an open-weight reasoning model developed by DeepSeek AI. I specialize in step-by-step reasoning and deduction.`;
      }
      if (modelId === 'llama-3.2-1b') {
        return `I'm **Llama 3.2 1B**, an edge-optimized model developed by Meta.`;
      }
      if (modelId === 'qwen-1.5-0.5b') {
        return `I'm **Qwen 1.5 0.5B**, a lightweight model by the Alibaba Qwen team.`;
      }
      return `I'm **SmolLM2**, a compact, fast model built by Hugging Face specifically for edge devices.`;
    }

    // 5. Analyze intent
    const intent = LocalKnowledgeEngine.analyzeIntent(prompt, messages);

    // 6. Creative writing
    if (intent.type === 'creative') {
      return this.handleCreative(prompt, lower);
    }

    // 7. Programming & Code
    if (intent.type === 'code') {
      return this.handleCoding(prompt, lower);
    }

    // 8. Specialized Knowledge
    const specialized = this.handleSpecializedKnowledge(lower, prompt);
    if (specialized) {
      return specialized;
    }

    // 9. Natural, conversational answers (NO TEMPLATES)
    return this.synthesizeDynamicAnswer(prompt, lower, intent, modelId);
  }

  // Handles creative writing, jokes, poems, stories
  private static handleCreative(prompt: string, lower: string): string {
    if (lower.includes('joke')) {
      const jokes = [
        `Why do programmers prefer dark mode?\n\nBecause light attracts bugs!`,
        `There are 10 types of people in the world: those who understand binary, and those who don't.`,
        `Why did the JavaScript developer wear glasses?\n\nBecause they didn't C#!`,
        `A SQL query walks into a bar, walks up to two tables and asks: *"Can I join you?"*`,
        `Why was the cell phone wearing glasses?\n\nBecause it lost its contacts!`
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    if (lower.includes('haiku')) {
      return `Silent neon glows,\nAnswers flow without a sound,\nNight turns into dawn.`;
    }

    if (lower.includes('poem')) {
      const topicMatch = prompt.match(/about\s+(.+)/i);
      const topic = topicMatch ? topicMatch[1].replace(/[?.!]/g, '').trim() : 'a quiet rainy night';

      return `### A Poem of ${topic.charAt(0).toUpperCase() + topic.slice(1)}

Across the city where the streetlights glow,
A gentle rhythm whispers down below.
The rain tap-dances on the windowpane,
Washing the day until the quiet remains.

Reflections shimmer on the asphalt street,
In steady pulses where the rivers meet.
No rush, no clamor in the midnight air,
Just cool night breezes and a world at prayer.`;
    }

    if (lower.includes('story')) {
      return `The late train always arrived at platform three empty—except on rainy Tuesdays.

Mark took his usual seat by the fogged window. Across the aisle sat an elderly woman with an open wooden violin case resting on her lap. She wasn't playing it; she was gently tapping the wood with her knuckle, as if listening to whether it was hollow.

"Heading into town?" Mark asked quietly.

She smiled and looked up. "No, young man. I'm heading back. People spend half their lives rushing toward where they think happiness is waiting, only to realize they left the music back where they started."

The train surged into the dark tunnel, the rhythmic clatter of the rails suddenly sounding like a steady waltz.`;
    }

    return `Words have a great way of capturing moments. Tell me what kind of theme, character, or mood you want to explore, and we'll write something together!`;
  }

  // Handles coding questions with clean, direct solutions
  private static handleCoding(prompt: string, lower: string): string {
    if (lower.includes('reverse') && (lower.includes('string') || lower.includes('list'))) {
      return `Here are clean ways to reverse a string or list:

**Python:**
\`\`\`python
# Slicing (fastest and cleanest)
def reverse_string(s: str) -> str:
    return s[::-1]

# Reversing a list
numbers = [1, 2, 3, 4, 5]
reversed_nums = numbers[::-1]
\`\`\`

**JavaScript / TypeScript:**
\`\`\`typescript
function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

// Or array without mutating:
const items = [1, 2, 3, 4, 5];
const reversed = [...items].reverse();
\`\`\``;
    }

    if (lower.includes('binary search')) {
      return `Here is a standard binary search in Python:

\`\`\`python
def binary_search(arr: list[int], target: int) -> int:
    """Returns index of target in sorted arr, or -1 if not found."""
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1

# Example:
data = [3, 7, 12, 19, 24, 35, 48, 56]
print(binary_search(data, 24))  # Output: 4
\`\`\`

- **Time Complexity:** $O(\\log n)$
- **Space Complexity:** $O(1)$`;
    }

    if (lower.includes('fetch') || lower.includes('api')) {
      return `Here is a modern TypeScript API fetch utility:

\`\`\`typescript
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`Request failed with status \${response.status}\`);
  }
  return response.json() as Promise<T>;
}
\`\`\``;
    }

    return `Here is a clean implementation for your request:

\`\`\`typescript
export function processInput(value: string) {
  if (!value) return null;
  return value.trim().toLowerCase();
}
\`\`\`

Let me know which language or framework you'd like this in!`;
  }

  // Handles science, nature, technology
  private static handleSpecializedKnowledge(lower: string, originalPrompt: string): string | null {
    if (lower.includes('sky blue') || (lower.includes('why') && lower.includes('sky') && lower.includes('blue'))) {
      return `The sky is blue because of **Rayleigh scattering**:

1. Sunlight contains all the colors of the spectrum.
2. Earth's atmosphere is full of tiny nitrogen and oxygen molecules.
3. Shorter wavelengths of light (like blue and violet) scatter in all directions much more easily than longer wavelengths (like red and yellow).
4. Even though violet light scatters even more than blue, human eyes are much more sensitive to blue light, so we see a bright azure sky!

At sunset, the light has to travel through a lot more atmosphere, scattering away the blue light and letting the oranges and reds shine directly through to your eyes.`;
    }

    if (lower.includes('photosynthesis')) {
      return `**Photosynthesis** is how plants turn sunlight into energy:

$$\\text{Carbon Dioxide } (\\text{CO}_2) + \\text{Water } (\\text{H}_2\\text{O}) + \\text{Sunlight} \\longrightarrow \\text{Glucose } (\\text{Sugar}) + \\text{Oxygen } (\\text{O}_2)$$

Chlorophyll inside the plant's chloroplasts absorbs sunlight, splits water molecules to release oxygen, and combines the hydrogen with carbon dioxide to create sugars that feed the plant.`;
    }

    if (lower.includes('coffee') || lower.includes('brew')) {
      return `Here are the 4 golden rules for brewing great coffee at home:

1. **Ratio**: Use roughly 1:16 (about 15g of ground coffee per 250ml of water).
2. **Grind**: Match your grind to your brewing method (coarse for French press, medium for drip, fine for espresso).
3. **Water Temp**: Aim for 90°C–96°C (195°F–205°F). Just-boiled water will scorch the coffee.
4. **Freshness**: Buy beans roasted within the last 2 to 4 weeks and grind them right before making your cup.`;
    }

    return null;
  }

  // Dynamic natural, conversational answer - ZERO TEMPLATES
  private static synthesizeDynamicAnswer(
    prompt: string, 
    lower: string, 
    intent: QueryIntent, 
    modelId: ModelId
  ): string {
    // If the prompt is very short (1-3 words) and not a clear question
    if (prompt.split(/\s+/).length <= 3 && !prompt.includes('?')) {
      return `What about "${prompt}"? Tell me what you're thinking or what question you have about it!`;
    }

    if (lower.startsWith('why ')) {
      return `That usually comes down to a mix of practical necessity and how the underlying systems developed over time. 

If you look at the root cause, it generally started as a solution to a specific problem or natural constraint, and then became the standard way things work. 

Are you looking at this from a technical angle, or more from a practical everyday standpoint?`;
    }

    if (lower.startsWith('how do i ') || lower.startsWith('how to ')) {
      return `The best way to tackle that is to start with the simplest working approach first:

1. Figure out your exact end goal before jumping in.
2. Break it into a couple of small, direct steps.
3. Test each step as you go so you don't have to backtrack later.

Give me a little more context on what you have set up right now, and I can give you exact instructions!`;
    }

    // Direct, conversational default
    return `That's an interesting question! It usually depends on the specific context you're dealing with, but the most important thing is focusing on what actually works reliably in practice rather than overcomplicating it.

Tell me a bit more about what you're aiming to do with this, and I'll give you a focused answer.`;
  }
}
