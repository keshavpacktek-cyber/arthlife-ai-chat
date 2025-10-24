// Arthlife AI Chat — intent rules (no external API needed)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { message = "" } = req.body || {};
  const msg = String(message || "").trim();
  if (!msg) return res.status(400).json({ error: "message required" });

  const lower = msg.toLowerCase();

  // Small helpers
  const has = (...keys) => keys.some(k => lower.includes(k));
  const extractNumber = (re) => {
    const m = msg.match(re);
    return m ? m[1] || m[0] : null;
  };

  // Detected entities
  const pincode = extractNumber(/\b([1-9][0-9]{5})\b/);         // Indian pincode (6 digits)
  const orderId = extractNumber(/\border(?:\s*id|#)?\s*[:\-]?\s*(\d{4,12})\b/i) 
               || extractNumber(/\b(\d{4,12})\b/);             // fallback pure number (4-12 digits)

  // --- INTENTS -----------------------------------------------------------

  // 1) Where is my order / Track order
  if (has("where is my order","order status","track","tracking","mera order","mere order","kab aayega")) {
    if (orderId) {
      return res.json({
        reply:
`Order **${orderId}** ke status ke liye:
• Aapka AWB/Tracking ID milte hi hum WhatsApp/Email bhejte hain.
• Agar already mila hai to courier portal par track karein.
• Nahin mila? Reply me “AWB for ${orderId}” likh dijiye, hum turant check kara denge.`
      });
    }
    return res.json({
      reply:
`Order tracking me madad karta/kartee hoon 🙏
• Agar aapke paas **Order ID** hai, yahin likh dijiye (e.g. “Order ID 1004”).
• Tracking milte hi hum aapko AWB bhej denge. Typical delivery **2–5 din** (remote pin: 5–7 din).`
    });
  }

  // 2) Return / Exchange / Replace
  if (has("return","exchange","replace","replace kr","replace kar","badalna","size change")) {
    if (orderId) {
      return res.json({
        reply:
`Order **${orderId}** ke liye return/exchange me madad:
• Policy: **7-day easy returns** — unused condition, complete packing.
• Size ya product replace chahiye? Bas problem ka 1 line reason likh dijiye, hum pickup arrange kar denge.`
      });
    }
    return res.json({
      reply:
`7-day **Easy Returns & Exchange** available hai 🙌
• Please apni **Order ID** share karein (e.g., “Order ID 1004”).
• Unused condition & full packing ke sath pickup ho jayega.`
    });
  }

  // 3) Delivery time / Pincode ETA
  if (has("delivery","pincode","pin code","kitne din","kab tak aa","shipping time")) {
    if (pincode) {
      return res.json({
        reply:
`Pincode **${pincode}** ke liye: 92% orders **2–5 din** me deliver hote hain.
Remote/ODF areas: **5–7 din** lag sakte hain. Dispatch 24–48 hrs me ho jata hai.`
      });
    }
    return res.json({
      reply:
`Typical delivery: **2–5 din** (remote areas: 5–7 din).
Agar aap **pincode** share karein, to mai aapko aur accurate ETA bata dunga/dungi.`
    });
  }

  // 4) COD
  if (has("cod","cash on delivery","cash on del","cod available")) {
    return res.json({
      reply:
`Haan, **COD available** hai ✅  
Kuch pincodes par limit/verification ho sakti hai. Checkout ke time “Cash on Delivery” choose kar sakte hain.`
    });
  }

  // 5) Size / Fit guide
  if (has("size","fit","guide","measure","wrist","maap","kaise naap","kaise measure")) {
    return res.json({
      reply:
`**Size / Fit Guide**  
1) Ek dhaaga/stripe ko wrist par lapet kar mark karein.  
2) Scale se cm me naap lein.  
3) Choose: **Snug** = wrist, **Comfort** = wrist + 0.5–1cm, **Loose** = wrist + 1–1.5cm.  
Agar aap wrist size bhejdein, mai best size suggest kar dunga/dungi.`
    });
  }

  // 6) Authenticity / Genuine stones
  if (has("authentic","original","genuine","real","fake","nakli","lab")) {
    return res.json({
      reply:
`Haan, hamare gemstones **lab-verified & natural** hote hain.  
Colour/pattern me halka natural variation possible hai — ye hi inki uniqueness hai. Certificate/quality checks available.`
    });
  }

  // 7) Cleanse / Charge / How to use
  if (has("cleanse","charge","energ","ritual","how to use","kaise use","kaise wear")) {
    return res.json({
      reply:
`**Cleanse & Charge**  
• Mist/salt se cleanse karein.  
• Bracelet haath me lekar **intention set** karein.  
• Daily pehnein — left hand = receiving, right = action.  
• Weekly **2–3 min sunlight** me recharge kar lein.`
    });
  }

  // 8) Shipping threshold / Free shipping text
  if (has("free shipping","threshold","shipping charge","delivery charges")) {
    return res.json({
      reply:
`Free shipping threshold website/app par same rakha gaya hai (e.g., ₹999).  
Cart me top bar par aapko current goal dikhega — use cross karte hi free shipping apply ho jata hai.`
    });
  }

  // 9) Payment / Checkout issues
  if (has("payment","checkout","upi","card","order place","fail","error")) {
    return res.json({
      reply:
`Payment/checkout issue ke liye:  
• Browser cache clear karke ya **incognito** me try karein.  
• UPI/Card/NetBanking sab available hai.  
• Agar fir bhi error aa raha hai, last step ka screenshot bhej dijiye — hum turant help kar denge.`
    });
  }

  // 10) Generic “order id + replace/return” mixed message
  if (orderId) {
    return res.json({
      reply:
`Aapne **Order ID ${orderId}** share kiya 🙏  
Bataye return/exchange/track me se kis cheez me madad chahiye? Mai process turant start kar dunga/dungi.`
    });
  }

  // Default friendly fallback (varies a little so it doesn't feel same)
  const fallbacks = [
    "Mujhe thoda aur detail batayein — main turant madad karta/kartee hoon.",
    "Samjha! Aap apna question thoda detail me likhen, mai yahin jawab doonga/doongi.",
    "Bilkul madad karta/kartee hoon — aap kya jaana chahte hain? (order, delivery time, size, returns…)"
  ];
  const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return res.json({ reply });
}
