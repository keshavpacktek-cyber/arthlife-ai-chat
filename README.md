// Arthlife — Smart, Brand-Scoped Chat (rule-based, no external API)
// Author: Chat assistant for Arthlife

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { message = "", history = [] } = req.body || {};
  const raw = String(message || "").trim();
  if (!raw) return res.status(400).json({ error: "message required" });

  const lower = raw.toLowerCase();

  // ---------- helpers ----------
  const has = (...keys) => keys.some(k => lower.includes(k));
  const extract = (re) => {
    const m = raw.match(re);
    return m ? m[1] || m[0] : null;
  };
  const pincode = extract(/\b([1-9][0-9]{5})\b/);            // Indian pincode
  const orderId =
    extract(/\border(?:\s*id|#)?\s*[:\-]?\s*([a-z0-9\-]{4,18})\b/i) ||
    extract(/\b(?:#)?([0-9]{4,12})\b/);                      // lenient fallback

  // ---------- brand guardrail ----------
  // Allowed domain words: restrict answers to Arthlife/store/product/logistics/payment/support
  const BRAND_LEXICON = [
    "arthlife", "bracelet", "stone", "gemstone", "crystal", "product",
    "order", "delivery", "shipping", "pincode", "cod", "size", "fit",
    "return", "exchange", "replace", "refund", "payment", "checkout",
    "authentic", "original", "cleanse", "charge", "care", "warranty",
    "packaging", "gift", "availability", "stock", "bundle", "offer",
    "policy", "threshold", "whatsapp", "email", "support", "invoice",
    "tracking", "awb", "dispatch", "cart"
  ];
  const looksBrandRelated = BRAND_LEXICON.some(w => lower.includes(w));
  if (!looksBrandRelated) {
    return res.json({
      reply:
`Main **Arthlife** ke products, orders, delivery, size/fit, returns, payments aur care se related madad karta/kartee hoon 🌿  
Aap kuch is type ke sawal puch sakte hain:
• “Mera order track kaise hoga?”  • “Size kaise choose karun?”  
• “COD hai?”  • “Return/Exchange kaise karun?”  • “Pincode 560001 ka delivery time?”

Agar aapke paas **Arthlife order** ya product se related query ho, please likhiye — main turant help karta/kartee hoon.`
    });
  }

  // ---------- boilerplate snippets ----------
  const ORDER_ID_HELP =
`**Order ID/Tracking ID kaise nikalein**  
• **Email**: “Arthlife – Order Confirmation” ya “Order #” search karein (Inbox/Spam).  
• **SMS/WhatsApp**: Order placement ke baad bheja gaya confirmation/AWB message check karein.  
• **My Account → Orders** (agar account banaya tha) me recent orders mil jayenge.  
Mil jaaye to yahin type karein: “Order ID 1004” ya “AWB 12345…”.`;

  const CONTACT_HELP =
`Agar urgent ho, aap humse yahan baat kar sakte hain:
• WhatsApp: **+91 97177 09426**  
• Email: **support@arthlife.in**`;

  // ---------- INTENTS (ordered by specificity) ----------

  // A) Tracking / Where is my order
  if (has("where is my order", "order status", "track", "tracking", "awb", "consignment", "mera order", "mere order")) {
    if (orderId) {
      return res.json({
        reply:
`**Order ${orderId} – Tracking help**  
• AWB milte hi aapko WhatsApp/Email par message aata hai.  
• Agar AWB hai to courier portal par check karein; nahin mila to mai turant fetch kara deta/deti hoon.  
${CONTACT_HELP}`
      });
    }
    return res.json({
      reply:
`Order tracking me madad karta/kartee hoon 🙏  
Agar aap **Order ID** share karein to mai status check kara dunga/dungi.  
${ORDER_ID_HELP}`
    });
  }

  // B) Return / Exchange / Replace
  if (has("return", "exchange", "replace", "size change", "badalna", "replacement", "refund")) {
    return res.json({
      reply:
`**7-day Easy Returns/Exchange/Replace**  
• Condition: **unused**, full packing & tags intact.  
• Process: pickup arrange hota hai; refund/exchange initiate ho jata hai.  
• Size issue? Right size suggest bhi kar denge.  
${orderId ? `Aapne **Order ${orderId}** share kiya — pickup arrange karne ke liye please reason 1 line me bata dein.` : ORDER_ID_HELP}`
    });
  }

  // C) Delivery time / Pincode ETA
  if (has("delivery", "pincode", "pin code", "eta", "kitne din", "kab tak aa", "shipping time", "reach")) {
    if (pincode) {
      return res.json({
        reply:
`**Pincode ${pincode}**: 92% orders **2–5 din** me deliver; remote/ODF areas: **5–7 din**.  
Dispatch 24–48 hrs me. Order place karte hi email/SMS me confirmation milta hai.`
      });
    }
    return res.json({
      reply:
`Typical delivery: **2–5 din** (remote: **5–7 din**).  
Aap apna **pincode** type karenge to mai exact ETA batane ki koshish karunga/karungi.`
    });
  }

  // D) Cash on Delivery
  if (has("cod", "cash on delivery", "cash on del")) {
    return res.json({
      reply:
`**COD available** ✅  
Kuch pincodes par limit/verification ho sakti hai. Checkout me “Cash on Delivery” choose kar sakte hain.`
    });
  }

  // E) Size / Fit guide
  if (has("size", "fit", "guide", "measure", "wrist", "kaise naap", "kaise measure")) {
    return res.json({
      reply:
`**Size / Fit Guide**  
1) Dhaaga ko wrist par lapet kar **mark** karein → scale se **cm** me naap lein.  
2) Pick: **Snug** = wrist, **Comfort** = wrist + 0.5–1cm, **Loose** = wrist + 1–1.5cm.  
Agar aap wrist size bhejdein to mai best size suggest kar dunga/dungi.`
    });
  }

  // F) Authenticity / Genuine stones
  if (has("authentic", "original", "genuine", "real", "fake", "nakli", "lab", "certificate")) {
    return res.json({
      reply:
`Hamare gemstones **lab-verified & natural** hote hain 🌿  
Colour/pattern me halka natural variation possible hai — ye hi inki uniqueness hai. Certificate/QA available.`
    });
  }

  // G) Cleanse / Charge / How to use
  if (has("cleanse", "charge", "energ", "ritual", "how to use", "kaise use", "kaise wear")) {
    return res.json({
      reply:
`**Cleanse & Charge**  
• Mist/salt se cleanse karein.  
• Bracelet haath me lekar **intention set** karein.  
• Daily pehnein — left hand = receiving, right = action.  
• Weekly **2–3 min sunlight** me recharge karein.`
    });
  }

  // H) Payment / Checkout issues
  if (has("payment", "checkout", "upi", "card", "netbanking", "order place", "failed", "error", "decline")) {
    return res.json({
      reply:
`**Payment/Checkout help**  
• Browser cache clear karke ya **incognito** me try karein.  
• UPI/Card/NetBanking sab available hai.  
• Error screenshot share karein, mai turant guide kar dunga/dungi.  
${CONTACT_HELP}`
    });
  }

  // I) Shipping charges / Free shipping threshold
  if (has("free shipping", "threshold", "shipping charge", "delivery charges", "minimum order")) {
    return res.json({
      reply:
`**Free Shipping threshold** website/app par same set hai (e.g., ₹999).  
Cart ke top goal-bar me current value dikh jaata hai — usse cross karte hi free shipping apply ho jata hai.`
    });
  }

  // J) Product availability / Out of stock
  if (has("available", "availability", "stock", "out of stock", "restock", "kab aayega")) {
    return res.json({
      reply:
`Agar product “Out of stock” dikhe to page par **Notify me**/“Email me when available” option use karein.  
Hum restock hote hi message bhej dete hain.`
    });
  }

  // K) Customisation / Gift packing
  if (has("custom", "personalise", "engrave", "gift", "gift wrap", "packaging", "hamper")) {
    return res.json({
      reply:
`Gift packaging available 🎁  — elegant **ritual pouch** & message card.  
Custom requests ke liye hume WhatsApp par text karein; feasibility confirm kar denge.`
    });
  }

  // L) Care / Warranty
  if (has("care", "maintain", "clean", "perfume", "warranty", "guarantee", "damage")) {
    return res.json({
      reply:
`**Care**: harsh soaps/perfumes se direct contact avoid karein, soft cloth se wipe karein, ritual pouch me store karein.  
**Warranty**: manufacturing defects case-by-case resolve karte hain — pics share karein, hum turant help karenge.`
    });
  }

  // M) Contact / Support
  if (has("contact", "support", "help", "whatsapp", "email", "phone", "call")) {
    return res.json({ reply: CONTACT_HELP });
  }

  // N) Order ID mentioned (generic handling)
  if (orderId) {
    return res.json({
      reply:
`Aapne **Order ${orderId}** share kiya 🙏  
Bataye — **track/return/exchange/replace** me se kis cheez me madad chahiye? Mai abhi process start kar deta/deti hoon.`
    });
  }

  // O) Default brand-scoped helpful reply (not a bland “tell me more”)
  return res.json({
    reply:
`Main samajh gaya/gyi. Aap inn me se bata sakte hain:  
• **Track order**  • **Return/Exchange/Replace**  • **Delivery time (pincode)**  
• **Size/fit**  • **COD/Payment**  • **Authenticity**  • **Care/Cleanse**  
Agar tracking/return chahiye aur **Order ID** ya **AWB** yaad nahi hai, to:  
${ORDER_ID_HELP}`
  });
}
