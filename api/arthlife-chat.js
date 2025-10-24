export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error: 'POST only'});

  const { message, history } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  const KB = [
    {q:'Where is my order?', a:'AWB/Order ID bhej dijiye — status turant check karwa dete hain. Usual 2–5 din, remote 5–7 din.'},
    {q:'Return/Exchange', a:'7-day easy returns. Unused + original packing. Pickup + QC ke baad 3–7 biz days me refund.'},
    {q:'Delivery time', a:'Most pincodes 2–5 din. Remote pincodes 5–7 din. COD pincode-wise.'},
    {q:'Size guide', a:'String wrist par lapet ke mark karein → cm. Snug = wrist, Comfort = +0.5–1 cm, Loose = +1–1.5 cm.'},
    {q:'COD', a:'COD available (kuch pincodes par restriction/verification ho sakta hai).'},
    {q:'Authenticity', a:'Lab-verified natural gemstones; slight colour/pattern variation is natural.'},
    {q:'Cleanse & charge', a:'Salt/mist cleanse, intention set, weekly 2–3 min sunlight recharge.'},
    {q:'Payment issue', a:'Incognito/clear cache try karein. UPI/Card/NetBanking supported. Double charge auto-reversed.'},
  ];

  const lower=(message||'').toLowerCase();
  const picked = KB.filter(x => (x.q + x.a).toLowerCase().split(/\W+/).some(w => lower.includes(w))).slice(0,5);
  const context = picked.map((x,i)=>`${i+1}. Q: ${x.q}\nA: ${x.a}`).join('\n');

  const system = `You are Arthlife's assistant.
Tone: soft, calm, spiritual guidance; concise & kind; simple Hindi/Hinglish; gentle emojis (🌿✨) sparingly.
Facts: natural lab-verified gemstones; 7-day easy returns; 2–5 day delivery (remote 5–7); size guide string method.
Never invent prices/discounts. If order-specific, ask for Order ID + name; offer human handoff if needed.`;

  const user = `Customer message: """${message}"""
Use this context if useful:
${context || '(no close matches)'}
`;

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          { role:'system', content: system },
          ...(Array.isArray(history)? history : []),
          { role:'user', content: user }
        ]
      })
    });
    const data = await r.json();
    const txt = data?.choices?.[0]?.message?.content?.trim()
      || 'Mujhe thoda aur detail batayein, main turant madad karta/kartee hoon.';
    res.status(200).json({ reply: txt });
  } catch (e) {
    res.status(500).json({ error:'AI error', detail:String(e) });
  }
}
