import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pocketbase-production-22f5.up.railway.app');

export async function POST({ request }) {
  try {
    const { feedback } = await request.json();
    if (typeof feedback !== 'string' || !feedback.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid feedback' }), { status: 400 });
    }
    await pb.collection('feedback').create({ message: feedback });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500 });
  }
}

export async function GET() {
  try {
    const records = await pb.collection('feedback').getFullList({ sort: '-created' });
    return new Response(JSON.stringify(records), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}