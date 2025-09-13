export function stripHTML(input = "") {
    return String(input).replace(/<[^>]*>?/g, "");
  }
  
  export function escapeHTML(input = "") {
    return String(input)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
  
  // For general text fields: remove labels, crop, trim leading and trailing blanks
  export function sanitizeText(input = "", max = 500) {
    const s = stripHTML(input).trim();
    return s.slice(0, max);
  }
  
  // Email: minimum format check + length limit
  export function sanitizeEmail(email = "", max = 254) {
    const s = stripHTML(email).trim().slice(0, max);
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
    return ok ? s : "";
  }
  
  // Phone: Only numbers, +, blank, - are allowed, and trimmed
  export function sanitizePhone(phone = "", max = 20) {
    const s = stripHTML(phone).replace(/[^\d+\-\s]/g, "").trim().slice(0, max);
    return s;
  }
  