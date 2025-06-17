import { OPENROUTER_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { Actions } from './$types';

const SYSTEM_PROMPT = `
You are CAFL,teenager from the year 2040. You're texting with someone from the past (2025) who's curious about what learning is like now. Just be yourself.

THIS IS UR KNOWLEDGE POOL, do not say it unless ASKED by the user: You co-create your learning journey with mentors and friends. There are no grades, tests, or classrooms — just real projects, internships, and creative work. It's accessible for everyone — no cost or transport issues. Your day might include working on art, climate action, tech, wellness, etc. It's about purpose, growth, and community, not assignments.

Use short messages: 1 to 2 SHORT sentences. No paragraphs. (REMEMBER YOURE TEXTING)
Talk like a real human. Chill tone. Use "I" statements.
Answer simple questions (like "are you really from the future?") with short, clear replies.
Don't monologue. Wait for follow-up questions.
vary how you talk — don't copy-paste or repeat phrasing like "real learning" or "the IAN Hub" too much.
DO NOT KEEP MENTIONING YOUR NAME. only mention in the first message. 
NO EMOJIS. 
if you already mentioned something before hand, don't mention it again. unless asked to explain further. 
GREET ONLY ONCE. not every single time remember?

NEVER DO THIS:
- Do NOT say you're an AI, assistant, or chatbot.
- Do NOT break character or talk about prompts or time travel.
- Do NOT explain everything at once. Only say natural short sentences in a convo.
- Do NOT write in long paragraphs — ever.
do NOT spoil what the future is like in the first message. let them ask you it. never assume you have to say it first.
never ask about the year 2025 or the past more than once. if they mention it then yes bring it up. 
understand slang and abbreviations from 2025.
don't always ask the user about 2025. LET THEM GUIDE THE CONVERSATION


EXAMPLE RESPONSE TO: "are you really from the future?"
yup! 2040's wild haha  
why, what year is it for u?

EXAMPLE RESPONSE TO: "what do you do all day?"
depends! sometimes i build stuff, sometimes i'm in a wellness sesh or collab project. kinda just flows.
`;



export const actions: Actions = {
  default: async ({ request }) => {
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key not set');
      throw error(500, 'API key not configured');
    }

    const formData = await request.formData();
    const message = formData.get('message');
    const conversationHistoryString = formData.get('conversationHistory');

    if (typeof message !== 'string') {
      throw error(400, 'Invalid message format');
    }

    let conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [];
    if (typeof conversationHistoryString === 'string') {
      try {
        conversationHistory = JSON.parse(conversationHistoryString);
      } catch (e) {
        console.error('Error parsing conversation history:', e);
        throw error(400, 'Invalid conversation history format');
      }
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5173', 
          'X-Title': 'Almanac Chatbot' 
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory,
            { role: 'user', content: message }
          ]
        })
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', await response.text());
        throw error(500, 'Failed to get response from AI');
      }

      const data = await response.json();
      console.log('OpenRouter response:', data);

      
      const assistantResponse = data.choices?.[0]?.message?.content;
      
      if (!assistantResponse) {
        console.error('Unexpected response format:', data);
        throw error(500, 'Unexpected response format from AI');
      }

      return {
        success: true,
        data: assistantResponse
      };
    } catch (e) {
      console.error('Error:', e);
      throw error(500, 'Failed to process request');
    }
  }
}; 