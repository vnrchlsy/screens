// Kupkop PH — Platform Admin (web ops console) design mockups.
// Desktop browser-framed SVG → PNG. Run from screens/admin:  node gen-admin.js
// Platform admin = Kupkop staff: verify shelters/members + moderate (Decision A, web-only).
//
// ⚠️ SCOPE (decided 2026-07-20): these 17 screens (incl. sign-in / error / reset) are the **Phase 2** build spec, NOT MVP.
// Launch runs platform ops on a **customized Django admin** (Tech Spec §3.4 v0.18, Design Package
// §9.1 v0.14, dev/verification-and-admin.md Decision A). Near-term these mockups serve as the
// checklist for what to customize in that admin — inline signed-URL document review, a tier-aware
// required-doc checklist, and a needs-info action that notifies the applicant.
// Build trigger for the real console: review volume outgrows the founding team, or the first
// non-technical ops hire. Rendered screens here are NOT a commitment to MVP scope.
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const DIR = __dirname;

const NAVY = "#16233b", INK = "#0f1b2d", TEAL = "#1C6B6B", TEALDK = "#14504F", FOREST = "#11241F",
      MUTED = "#6b7280", FAINT = "#9aa3ad", SOFT = "#e7f0ef", BG = "#f4f5f3", CARD = "#ffffff",
      HAIR = "#eeeee9", WHITE = "#ffffff",
      OK = "#1f7a4d", OKBG = "#e7f4ec", WARN = "#8a5a12", WARN2 = "#9a6a1a", WARNBG = "#fbf0dc",
      DANGER = "#c2453f", DANGERBG = "#f9e7e5", INFO = "#1C6B6B", INFOBG = "#e2eef0", VIOLET = "#5b53a6";

const W = 1500, CH = 48, APPH = 950, H = CH + APPH;
const SBW = 264, CX = SBW, CW = W - SBW, PAD = 44;

function t(x, y, s, o = {}) {
  return `<text x="${x}" y="${y}" font-family="Inter, -apple-system, 'Segoe UI', Arial, sans-serif" font-size="${o.size || 15}" font-weight="${o.weight || "400"}" fill="${o.fill || NAVY}" text-anchor="${o.anchor || "start"}" letter-spacing="${o.ls || 0}">${s}</text>`;
}
function rr(x, y, w, h, r, fill, stroke) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="1"` : ""}/>`;
}
function card(x, y, w, h, r = 20) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${CARD}" stroke="${HAIR}" stroke-width="1" filter="url(#sh)"/>`;
}
function pillDot(x, y, label, bg, fg, dot) {
  const w = 30 + label.length * 7.6;
  return rr(x, y, w, 28, 14, bg) + (dot ? `<circle cx="${x + 15}" cy="${y + 14}" r="4" fill="${fg}"/>` : "") +
    t(x + (dot ? 26 : 14), y + 18.5, label, { size: 12.5, fill: fg, weight: "700" });
}
function chip(x, y, label, bg, fg) {
  const w = 18 + label.length * 7.4;
  return rr(x, y, w, 26, 13, bg) + t(x + w / 2, y + 17.5, label, { size: 12.5, anchor: "middle", fill: fg, weight: "700" });
}
function statusChip(x, y, st) {
  const map = { Pending: [WARNBG, WARN2], "Needs info": [INFOBG, INFO], Approved: [OKBG, OK], Rejected: [DANGERBG, DANGER], Open: [WARNBG, WARN2], Resolved: [OKBG, OK], New: [INFOBG, INFO], Actioned: [OKBG, OK], Dismissed: ["#eceae4", MUTED], Active: [OKBG, OK], Suspended: [DANGERBG, DANGER], Verified: [OKBG, OK], Unverified: ["#eceae4", MUTED], "In-Progress": [INFOBG, INFO] };
  const [bg, fg] = map[st] || ["#eee", MUTED];
  return pillDot(x, y, st, bg, fg, true);
}
function avatar(cx, cy, r, initials, bg = SOFT, fg = TEAL) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}"/>` + t(cx, cy + r * 0.34, initials, { size: r * 0.82, anchor: "middle", weight: "700", fill: fg });
}
const check = (cx, cy, c, sw = 2.4) => `<polyline points="${cx - 6},${cy} ${cx - 1},${cy + 5} ${cx + 7},${cy - 6}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
function toggle(x, y, on) {
  return rr(x, y, 44, 25, 12.5, on ? TEAL : "#cfd2cd") + `<circle cx="${on ? x + 31 : x + 13}" cy="${y + 12.5}" r="9.5" fill="#fff"/>`;
}
function miniqr(x, y, s) {
  let g = rr(x, y, s, s, 6, "#fff", HAIR);
  const n = 5, c = (s - 12) / n, p = 6, seed = [1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (seed[i * n + j]) g += `<rect x="${x + p + j * c}" y="${y + p + i * c}" width="${c - 1}" height="${c - 1}" fill="${INK}"/>`;
  return g;
}

// icon glyphs (stroke) centered at (gx,gy)
function glyph(ic, gx, gy, c, sw = 1.9) {
  if (ic === "grid") return `<g fill="none" stroke="${c}" stroke-width="${sw}"><rect x="${gx - 8}" y="${gy - 8}" width="7" height="7" rx="1.6"/><rect x="${gx + 1}" y="${gy - 8}" width="7" height="7" rx="1.6"/><rect x="${gx - 8}" y="${gy + 1}" width="7" height="7" rx="1.6"/><rect x="${gx + 1}" y="${gy + 1}" width="7" height="7" rx="1.6"/></g>`;
  if (ic === "shield") return `<path d="M${gx} ${gy - 9} l8 3 v5 c0 5 -4 7 -8 8 c-4 -1 -8 -3 -8 -8 v-5 z" fill="none" stroke="${c}" stroke-width="${sw}"/>` + check(gx, gy + 1, c, sw);
  if (ic === "flag") return `<path d="M${gx - 7} ${gy - 9} v18 M${gx - 7} ${gy - 9} h13 l-3 4 l3 4 h-13" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (ic === "building") return `<rect x="${gx - 7}" y="${gy - 9}" width="14" height="18" rx="1.8" fill="none" stroke="${c}" stroke-width="${sw}"/><path d="M${gx - 3} ${gy - 5} h1 M${gx + 2} ${gy - 5} h1 M${gx - 3} ${gy} h1 M${gx + 2} ${gy} h1" stroke="${c}" stroke-width="${sw}"/>`;
  if (ic === "user") return `<circle cx="${gx}" cy="${gy - 4}" r="4.5" fill="none" stroke="${c}" stroke-width="${sw}"/><path d="M${gx - 8} ${gy + 10} c0 -6 16 -6 16 0" fill="none" stroke="${c}" stroke-width="${sw}"/>`;
  if (ic === "peso") return t(gx, gy + 6, "₱", { size: 18, anchor: "middle", weight: "700", fill: c });
  if (ic === "clock") return `<circle cx="${gx}" cy="${gy}" r="8" fill="none" stroke="${c}" stroke-width="${sw}"/><path d="M${gx} ${gy - 4} v4 l3 2" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
  return `<circle cx="${gx}" cy="${gy}" r="7" fill="none" stroke="${c}" stroke-width="${sw}"/><circle cx="${gx}" cy="${gy}" r="2.5" fill="${c}"/>`;
}

// ---- browser chrome ----
function chrome(url) {
  let s = rr(0, 0, W, CH, 0, "#edece6");
  [0, 1, 2].forEach(i => { s += `<circle cx="${28 + i * 22}" cy="${CH / 2}" r="6.5" fill="${["#e06c5b", "#e3b341", "#4caf6d"][i]}"/>`; });
  s += rr(118, 13, 620, 24, 12, WHITE);
  s += glyph("clock", 0, 0, "transparent"); // no-op keep glyph referenced
  s += `<circle cx="140" cy="25" r="5" fill="none" stroke="${FAINT}" stroke-width="1.5"/><path d="M143 28 l3 3" stroke="${FAINT}" stroke-width="1.5" stroke-linecap="round"/>`;
  s += t(158, 29, url, { size: 12.5, fill: MUTED });
  return s;
}

// ---- sidebar ----
function sidebar(active) {
  const items = [["Dashboard", "grid"], ["Verifications", "shield", "7"], ["Moderation", "flag", "3"], ["Shelters", "building"], ["Members", "user"], ["Donations", "peso"], ["Settings", "gear"]];
  let s = `<rect x="0" y="0" width="${SBW}" height="${APPH}" fill="url(#sb)"/>`;
  // brand
  s += `<rect x="24" y="26" width="34" height="34" rx="11" fill="url(#btn)"/>` + t(41, 49, "K", { size: 18, anchor: "middle", weight: "800", fill: WHITE });
  s += t(70, 42, "Kupkop", { size: 18, weight: "800", fill: WHITE, ls: 0.2 }) + t(70, 60, "Platform Ops", { size: 11.5, fill: "#7f9a97", ls: 0.6 });
  s += t(28, 104, "MENU", { size: 11, fill: "#5c7370", weight: "700", ls: 1.4 });
  let y = 138;
  items.forEach(([lab, ic, badge]) => {
    const on = lab === active;
    if (on) s += `<rect x="16" y="${y - 23}" width="${SBW - 32}" height="46" rx="13" fill="url(#btn)" filter="url(#glow)"/>`;
    const c = on ? WHITE : "#a7c0bc";
    s += glyph(ic, 42, y - 1, c, on ? 2.1 : 1.9);
    s += t(66, y + 5, lab, { size: 14.5, fill: c, weight: on ? "700" : "500" });
    if (badge) s += chip(SBW - 58, y - 13, badge, on ? "rgba(255,255,255,0.22)" : TEAL, WHITE);
    y += 54;
  });
  // footer help
  s += rr(16, APPH - 96, SBW - 32, 64, 16, "rgba(255,255,255,0.06)");
  s += t(34, APPH - 60, "Need a hand?", { size: 13, weight: "700", fill: WHITE });
  s += t(34, APPH - 42, "Ops runbook →", { size: 12, fill: "#8fb0ac", weight: "600" });
  return s;
}

// ---- top bar ----
function topbar(title, subtitle) {
  let s = `<rect x="${CX}" y="0" width="${CW}" height="88" fill="${CARD}"/><line x1="${CX}" y1="88" x2="${W}" y2="88" stroke="${HAIR}" stroke-width="1"/>`;
  s += t(CX + PAD, 44, title, { size: 25, weight: "800", fill: INK, ls: -0.2 });
  if (subtitle) s += t(CX + PAD, 68, subtitle, { size: 13.5, fill: MUTED });
  // user cluster (right): bell · name · avatar
  s += avatar(W - 56, 44, 19, "RA", SOFT, TEAL);
  s += t(W - 88, 41, "Rina Alonzo", { size: 14, anchor: "end", fill: INK, weight: "700" });
  s += t(W - 88, 58, "Platform admin", { size: 11.5, anchor: "end", fill: FAINT });
  const bx = W - 214;
  s += `<circle cx="${bx}" cy="44" r="19" fill="${BG}"/>`;
  s += `<path d="M${bx - 6} 45 q0 -9 6 -9 q6 0 6 9 l2 4 h-16 z" fill="none" stroke="${MUTED}" stroke-width="1.7" stroke-linejoin="round"/><path d="M${bx - 2} 49 a2.6 2.6 0 0 0 5 0" fill="none" stroke="${MUTED}" stroke-width="1.7"/>`;
  s += `<circle cx="${bx + 6}" cy="37" r="4" fill="${DANGER}"/>`;
  return s;
}

function frame(url, sbActive, title, subtitle, inner) {
  return `${chrome(url)}<g transform="translate(0,${CH})">${sidebar(sbActive)}${topbar(title, subtitle)}<g transform="translate(0,88)">${inner}</g></g>`;
}

// ---- stat card ----
function stat(x, y, w, n, label, delta, ic, accent, accentBg) {
  let s = card(x, y, w, 128);
  s += rr(x + 26, y + 26, 44, 44, 13, accentBg) + glyph(ic, x + 48, y + 48, accent, 2);
  s += t(x + 26, y + 104, label, { size: 13.5, fill: MUTED });
  s += t(x + w - 26, y + 56, n, { size: 38, weight: "800", anchor: "end", fill: INK, ls: -0.5 });
  if (delta) s += t(x + w - 26, y + 92, delta, { size: 12.5, anchor: "end", fill: OK, weight: "700" });
  return s;
}

// ---- compact metric tile (for detail pages) ----
function metric(x, y, w, n, label, ic, accent, accentBg) {
  let s = card(x, y, w, 98, 16);
  s += rr(x + 16, y + 16, 34, 34, 10, accentBg) + glyph(ic, x + 33, y + 33, accent, 1.9);
  s += t(x + w - 16, y + 50, n, { size: 26, weight: "800", anchor: "end", fill: INK, ls: -0.5 });
  s += t(x + 16, y + 80, label, { size: 12, fill: MUTED });
  return s;
}

// =================== SCREENS ===================
function dashboard() {
  const x0 = CX + PAD; let s = "";
  const sw = (CW - 2 * PAD - 3 * 20) / 4;
  s += stat(x0, 40, sw, "7", "Pending verifications", "▲ 2 today", "clock", WARN2, WARNBG);
  s += stat(x0 + (sw + 20), 40, sw, "3", "Open moderation flags", "▲ 1 today", "flag", DANGER, DANGERBG);
  // verified orgs — split by tier (Verified Rescue = tier 1, Verified Shelter = tier 2)
  const ox = x0 + (sw + 20) * 2;
  s += card(ox, 40, sw, 128);
  s += rr(ox + 26, 66, 44, 44, 13, SOFT) + glyph("building", ox + 48, 88, TEAL, 2);
  s += t(ox + sw - 26, 96, "128", { size: 38, weight: "800", anchor: "end", fill: INK, ls: -0.5 });
  s += t(ox + 26, 144, "Verified orgs", { size: 13.5, fill: MUTED });
  s += t(ox + sw - 26, 140, "84 rescues · 44 shelters", { size: 11.5, anchor: "end", fill: MUTED, weight: "600" });
  s += stat(x0 + (sw + 20) * 3, 40, sw, "3.4k", "Members", "▲ 112 this week", "user", VIOLET, "#ecebf6");

  const qy = 204, qw = CW - 2 * PAD - 400 - 24;
  s += card(x0, qy, qw, 486);
  s += t(x0 + 28, qy + 44, "Verification queue", { size: 17, weight: "800", fill: INK });
  s += t(x0 + qw - 28, qy + 44, "View all →", { size: 13.5, anchor: "end", fill: TEAL, weight: "700" });
  const rows = [
    ["PAWS Manila", "PM", "NGO", "2h ago", "Pending"],
    ["Marikina AWG", "MA", "NGO", "5h ago", "Pending"],
    ["Maria Santos", "MS", "Member", "1d ago", "Needs info"],
    ["Pasig Pound", "PP", "Rescue", "1d ago", "Pending"],
    ["Jose Cruz", "JC", "Member", "2d ago", "Pending"],
  ];
  rows.forEach(([nm, ini, type, when, st], i) => {
    const ry = qy + 78 + i * 78;
    if (i) s += `<line x1="${x0 + 28}" y1="${ry - 10}" x2="${x0 + qw - 28}" y2="${ry - 10}" stroke="${HAIR}" stroke-width="1"/>`;
    s += avatar(x0 + 50, ry + 24, 21, ini);
    s += t(x0 + 84, ry + 20, nm, { size: 15.5, weight: "700", fill: INK });
    s += t(x0 + 84, ry + 40, type + " · " + when, { size: 13, fill: MUTED });
    s += statusChip(x0 + qw - 232, ry + 11, st);
    s += rr(x0 + qw - 120, ry + 6, 92, 38, 11, "url(#btn)") + t(x0 + qw - 74, ry + 30, "Review", { size: 13.5, anchor: "middle", fill: WHITE, weight: "700" });
  });

  const mx = x0 + qw + 24, mw = 400;
  s += card(mx, qy, mw, 486);
  s += t(mx + 26, qy + 44, "Recent flags", { size: 17, weight: "800", fill: INK });
  const flags = [
    ["Listing", "“Free puppies!!” — possible spam", "Open"],
    ["Message", "Reported by 2 users", "Open"],
    ["Account", "Duplicate shelter profile", "Open"],
    ["Listing", "Wrong photos on a listing", "Resolved"],
  ];
  flags.forEach(([tp, desc, st], i) => {
    const fy = qy + 82 + i * 100;
    if (i) s += `<line x1="${mx + 26}" y1="${fy - 16}" x2="${mx + mw - 26}" y2="${fy - 16}" stroke="${HAIR}" stroke-width="1"/>`;
    s += chip(mx + 26, fy, tp, "#f0efe9", MUTED) + statusChip(mx + mw - 26 - (30 + st.length * 7.6), fy + 1, st);
    s += t(mx + 26, fy + 50, desc, { size: 13.5, fill: INK, weight: "500" });
    s += t(mx + 26, fy + 72, "Review flag →", { size: 12.5, fill: TEAL, weight: "700" });
  });
  return frame("admin.kupkopph.com/dashboard", "Dashboard", "Good morning, Rina", "7 verifications and 3 flags need you today", s);
}

function verifications() {
  const x0 = CX + PAD; let s = "";
  const tabs = [["Pending", 7, true], ["Needs info", 2, false], ["Approved", 128, false], ["Rejected", 4, false]];
  let tx = x0;
  tabs.forEach(([lab, n, on]) => {
    const label = `${lab}  ${n}`, w = 34 + label.length * 8;
    s += rr(tx, 36, w, 40, 20, on ? INK : CARD, on ? null : HAIR) + (on ? "" : "") +
      t(tx + w / 2, 61, `${lab}`, { size: 14, anchor: "middle", fill: on ? WHITE : NAVY, weight: on ? "700" : "500" });
    tx += w + 12;
  });
  s += rr(W - PAD - 320, 36, 320, 40, 20, CARD, HAIR) + `<circle cx="${W - PAD - 296}" cy="56" r="6" fill="none" stroke="${FAINT}" stroke-width="1.6"/><path d="M${W - PAD - 291} 61 l4 4" stroke="${FAINT}" stroke-width="1.6" stroke-linecap="round"/>` + t(W - PAD - 274, 61, "Search org or person…", { size: 13.5, fill: FAINT });

  const ty = 108, tw = CW - 2 * PAD;
  s += card(x0, ty, tw, APPH - 88 - ty - 36);
  const cols = [["APPLICANT", x0 + 28], ["TYPE", x0 + 372], ["DOCUMENTS", x0 + 512], ["SUBMITTED", x0 + 730], ["STATUS", x0 + 892], ["", x0 + tw - 128]];
  cols.forEach(([c, cx]) => s += t(cx, ty + 40, c, { size: 11.5, weight: "700", fill: FAINT, ls: 0.8 }));
  s += `<line x1="${x0 + 20}" y1="${ty + 58}" x2="${x0 + tw - 20}" y2="${ty + 58}" stroke="${HAIR}" stroke-width="1"/>`;
  // TYPE names the tier: Rescue = tier-1 Community rescue, NGO = tier-2 Registered NGO, Member =
  // Verified-Member capability. DOCUMENTS shows the tier-aware set (tier-1: ID/billing/photos/social;
  // tier-2: + SEC/BAI/vet) — the legacy DTI/references/LGU-cert model is gone.
  const rows = [
    ["PAWS Manila", "PM", "NGO", "ID, billing, photos, SEC, BAI", "Jul 13, 2:10 PM", "Pending"],
    ["Aling Nena's Rescue", "AN", "Rescue", "ID, billing, photos, social", "Jul 13, 11:04 AM", "Pending"],
    ["Maria Santos", "MS", "Member", "Gov ID, social link", "Jul 12, 6:20 PM", "Needs info"],
    ["Marikina AWG", "MA", "NGO", "ID, billing, SEC · BAI pending", "Jul 12, 9:00 AM", "Pending"],
    ["Jose Cruz", "JC", "Member", "Gov ID, social link", "Jul 11, 3:32 PM", "Pending"],
    ["QC Animal Shelter", "QC", "NGO", "ID, billing, photos, SEC, BAI", "Jul 11, 8:15 AM", "Pending"],
    ["Liza Tan", "LT", "Member", "Gov ID, social link", "Jul 10, 5:40 PM", "Pending"],
  ];
  rows.forEach(([nm, ini, type, docs, when, st], i) => {
    const ry = ty + 58 + i * 76;
    if (i) s += `<line x1="${x0 + 20}" y1="${ry}" x2="${x0 + tw - 20}" y2="${ry}" stroke="${HAIR}" stroke-width="1"/>`;
    s += avatar(x0 + 46, ry + 38, 19, ini);
    s += t(x0 + 78, ry + 43, nm, { size: 15, weight: "700", fill: INK });
    s += chip(x0 + 372, ry + 25, type, type === "Member" ? "#ecebf6" : SOFT, type === "Member" ? VIOLET : TEAL);
    s += t(x0 + 512, ry + 43, docs, { size: 13.5, fill: MUTED });
    s += t(x0 + 730, ry + 43, when, { size: 13.5, fill: MUTED });
    s += statusChip(x0 + 892, ry + 25, st);
    s += rr(x0 + tw - 128, ry + 20, 108, 38, 11, "url(#btn)") + t(x0 + tw - 74, ry + 44, "Review", { size: 13.5, anchor: "middle", fill: WHITE, weight: "700" });
  });
  return frame("admin.kupkopph.com/verifications", "Verifications", "Verifications", "7 pending review", s);
}

function verificationDetail() {
  const x0 = CX + PAD; let s = "";
  s += t(x0, 40, "← Back to verifications", { size: 13.5, fill: TEAL, weight: "700" });
  s += avatar(x0 + 30, 98, 30, "PM", SOFT, TEAL);
  s += t(x0 + 76, 90, "PAWS Manila", { size: 25, weight: "800", fill: INK, ls: -0.3 }) + statusChip(x0 + 276, 78, "Pending");
  s += chip(x0 + 388, 79, "Registered NGO · tier 2", SOFT, TEAL);
  s += t(x0 + 76, 116, "shelter_org · applying for Verified Shelter · submitted Jul 13, 2:10 PM", { size: 13.5, fill: MUTED });

  const mainW = CW - 2 * PAD - 420 - 24, my = 156;
  s += card(x0, my, mainW, 298);
  s += t(x0 + 28, my + 40, "Organization details", { size: 16, weight: "800", fill: INK });
  const facts = [["Legal name", "PAWS Manila Inc."], ["Contact", "hello@pawsmanila.org · 0917 555 0110"], ["Address", "12 Aurora Blvd, Marikina City"], ["Tier", "Registered NGO (tier 2) → Verified Shelter"], ["Affiliated vet", "Dr. Jose Ramos · PRC 0123456"], ["Account", "shelter · member since Jun 2025"]];
  facts.forEach(([k, v], i) => {
    const fy = my + 78 + i * 36;
    s += t(x0 + 28, fy, k, { size: 13.5, fill: FAINT });
    s += t(x0 + 210, fy, v, { size: 13.5, fill: INK, weight: "600" });
  });

  const dy = my + 330;
  s += t(x0, dy, "Documents", { size: 16, weight: "800", fill: INK }) + chip(x0 + 130, dy - 18, "6 of 6", OKBG, OK);
  s += t(x0 + 236, dy, "Required set for a Registered NGO (tier 2).", { size: 12.5, fill: FAINT });
  // tier-2 required set — an NGO can't be approved on rescue-tier evidence (customization #2)
  const docs = [
    ["Gov ID (owner)", "owner-id.jpg", "IMG"],
    ["Proof of billing", "meralco-bill.pdf", "PDF"],
    ["Rescue-space photos", "3 photos", "IMG"],
    ["SEC registration", "sec-reg.pdf", "PDF"],
    ["BAI certificate", "bai-2025.pdf", "PDF"],
    ["Social link", "facebook.com/pawsmanila", "LINK"],
  ];
  const dw = (mainW - 2 * 20) / 3;
  docs.forEach(([name, file, kind], i) => {
    const dx = x0 + (i % 3) * (dw + 20), dyy = dy + 22 + Math.floor(i / 3) * 176;
    s += card(dx, dyy, dw, 156, 16);
    s += rr(dx + 16, dyy + 14, dw - 32, 74, 12, kind === "LINK" ? "#e6f0f0" : "#eef2f0");
    s += rr(dx + dw / 2 - 28, dyy + 34, 56, 30, 8, kind === "IMG" ? "#dfeae7" : "#e3e7ec") + t(dx + dw / 2, dyy + 55, kind, { size: 13.5, anchor: "middle", weight: "800", fill: kind === "PDF" ? "#8794a3" : TEAL });
    s += `<circle cx="${dx + 30}" cy="${dyy + 116}" r="8" fill="${OKBG}"/>` + check(dx + 30, dyy + 116, OK, 1.8);
    s += t(dx + 46, dyy + 112, name, { size: 13.5, weight: "700", fill: INK });
    s += t(dx + 18, dyy + 137, file, { size: 11.5, fill: FAINT });
    s += t(dx + dw - 18, dyy + 137, "Open ↗", { size: 12, anchor: "end", fill: TEAL, weight: "700" });
  });

  const rx = x0 + mainW + 24, rw = 420;
  s += card(rx, my, rw, 500);
  s += t(rx + 28, my + 42, "Decision", { size: 17, weight: "800", fill: INK });
  s += t(rx + 28, my + 80, "REVIEWER NOTES", { size: 11, weight: "700", fill: FAINT, ls: 0.8 });
  s += rr(rx + 28, my + 92, rw - 56, 100, 12, "#f8f8f4", HAIR);
  s += t(rx + 44, my + 124, "Docs check out — SEC &amp; BAI valid,", { size: 13, fill: MUTED });
  s += t(rx + 44, my + 146, "vet PRC verified. Approving.", { size: 13, fill: MUTED });
  s += rr(rx + 28, my + 216, rw - 56, 52, 13, "url(#btn)") + check(rx + 118, my + 242, WHITE, 2.8) + t(rx + (rw) / 2 + 14, my + 247, "Approve", { size: 16, anchor: "middle", fill: WHITE, weight: "700" });
  const hw = (rw - 56 - 14) / 2;
  s += rr(rx + 28, my + 280, hw, 48, 12, CARD, HAIR) + t(rx + 28 + hw / 2, my + 310, "Needs info", { size: 14, anchor: "middle", fill: NAVY, weight: "700" });
  s += rr(rx + 28 + hw + 14, my + 280, hw, 48, 12, "#fdf3f2", "#eecbc8") + t(rx + 28 + hw + 14 + hw / 2, my + 310, "Reject", { size: 14, anchor: "middle", fill: DANGER, weight: "700" });
  s += `<line x1="${rx + 28}" y1="${my + 358}" x2="${rx + rw - 28}" y2="${my + 358}" stroke="${HAIR}" stroke-width="1"/>`;
  s += t(rx + 28, my + 390, "On approve", { size: 12.5, weight: "700", fill: INK, ls: 0.3 });
  ["Listings go public · donations enabled", "Verified Shelter badge shown", "Applicant notified in-app"].forEach((ln, i) => {
    const ey = my + 416 + i * 26;
    s += `<circle cx="${rx + 33}" cy="${ey - 4}" r="8" fill="${OKBG}"/>` + check(rx + 33, ey - 4, OK, 1.8) + t(rx + 50, ey, ln, { size: 12.5, fill: MUTED });
  });
  return frame("admin.kupkopph.com/verifications/paws-manila", "Verifications", "Review verification", "PAWS Manila · shelter_org", s);
}

function verificationMemberDetail() {
  const x0 = CX + PAD; let s = "";
  s += t(x0, 40, "← Back to verifications", { size: 13.5, fill: TEAL, weight: "700" });
  s += avatar(x0 + 30, 98, 30, "MS", "#ecebf6", VIOLET);
  s += t(x0 + 76, 90, "Maria Santos", { size: 25, weight: "800", fill: INK, ls: -0.3 }) + statusChip(x0 + 280, 78, "Needs info");
  s += t(x0 + 76, 116, "Member · rescuer capability · submitted Jul 12, 6:20 PM", { size: 13.5, fill: MUTED });

  const mainW = CW - 2 * PAD - 420 - 24, my = 156;
  s += card(x0, my, mainW, 262);
  s += t(x0 + 28, my + 40, "Applicant details", { size: 16, weight: "800", fill: INK });
  const facts = [["Full name", "Maria Santos"], ["Contact", "maria.santos@email.com · 0917 222 3344"], ["Location", "Quezon City"], ["Account", "pet owner · member since May 2025"], ["Applying for", "Verified Member (adopt + rescue tools)"]];
  facts.forEach(([k, v], i) => {
    const fy = my + 78 + i * 36;
    s += t(x0 + 28, fy, k, { size: 13.5, fill: FAINT });
    s += t(x0 + 210, fy, v, { size: 13.5, fill: INK, weight: "600" });
  });

  const dy = my + 294;
  s += t(x0, dy, "Documents", { size: 16, weight: "800", fill: INK }) + chip(x0 + 130, dy - 18, "2", SOFT, TEAL);
  const docs = [["Government ID", "maria-id.jpg", "IMG"], ["Social link", "facebook.com/maria.santos", "LINK"]];
  const dw = (mainW - 20) / 2;
  docs.forEach(([name, file, kind], i) => {
    const dx = x0 + i * (dw + 20), dyy = dy + 22;
    s += card(dx, dyy, dw, 192, 16);
    s += rr(dx + 16, dyy + 16, dw - 32, 108, 12, kind === "LINK" ? "#e6f0f0" : "#eef2f0");
    s += rr(dx + dw / 2 - 30, dyy + 54, 60, 32, 8, kind === "IMG" ? "#dfeae7" : "#d7e6e6") + t(dx + dw / 2, dyy + 76, kind, { size: 14, anchor: "middle", weight: "800", fill: TEAL });
    s += t(dx + 18, dyy + 150, name, { size: 14, weight: "700", fill: INK });
    s += t(dx + 18, dyy + 172, file, { size: 12, fill: FAINT });
    s += t(dx + dw - 18, dyy + 172, "Open ↗", { size: 12.5, anchor: "end", fill: TEAL, weight: "700" });
  });

  const rx = x0 + mainW + 24, rw = 420;
  s += card(rx, my, rw, 500);
  s += t(rx + 28, my + 42, "Decision", { size: 17, weight: "800", fill: INK });
  s += t(rx + 28, my + 80, "REVIEWER NOTES", { size: 11, weight: "700", fill: FAINT, ls: 0.8 });
  s += rr(rx + 28, my + 92, rw - 56, 100, 12, "#f8f8f4", HAIR);
  s += t(rx + 44, my + 124, "ID photo is blurry — asked Maria to", { size: 13, fill: MUTED });
  s += t(rx + 44, my + 146, "re-upload a clearer shot.", { size: 13, fill: MUTED });
  s += rr(rx + 28, my + 216, rw - 56, 52, 13, "url(#btn)") + check(rx + 118, my + 242, WHITE, 2.8) + t(rx + (rw) / 2 + 14, my + 247, "Approve", { size: 16, anchor: "middle", fill: WHITE, weight: "700" });
  const hw = (rw - 56 - 14) / 2;
  s += rr(rx + 28, my + 280, hw, 48, 12, "#eaf2f2", "#cfe0df") + t(rx + 28 + hw / 2, my + 310, "Needs info", { size: 14, anchor: "middle", fill: TEAL, weight: "700" });
  s += rr(rx + 28 + hw + 14, my + 280, hw, 48, 12, "#fdf3f2", "#eecbc8") + t(rx + 28 + hw + 14 + hw / 2, my + 310, "Reject", { size: 14, anchor: "middle", fill: DANGER, weight: "700" });
  s += `<line x1="${rx + 28}" y1="${my + 358}" x2="${rx + rw - 28}" y2="${my + 358}" stroke="${HAIR}" stroke-width="1"/>`;
  s += t(rx + 28, my + 390, "On approve", { size: 12.5, weight: "700", fill: INK, ls: 0.3 });
  ["Verified Member badge shown", "Can adopt from shelters", "Rescue tools unlocked · notified"].forEach((ln, i) => {
    const ey = my + 416 + i * 26;
    s += `<circle cx="${rx + 33}" cy="${ey - 4}" r="8" fill="${OKBG}"/>` + check(rx + 33, ey - 4, OK, 1.8) + t(rx + 50, ey, ln, { size: 12.5, fill: MUTED });
  });
  return frame("admin.kupkopph.com/verifications/maria-santos", "Verifications", "Review verification", "Maria Santos · member", s);
}

function moderation() {
  const x0 = CX + PAD; let s = "";
  const tabs = [["Open", true], ["Actioned", false], ["Dismissed", false]];
  let tx = x0;
  tabs.forEach(([lab, on]) => {
    const w = 34 + lab.length * 8.5;
    s += rr(tx, 36, w, 40, 20, on ? INK : CARD, on ? null : HAIR) + t(tx + w / 2, 61, lab, { size: 14, anchor: "middle", fill: on ? WHITE : NAVY, weight: on ? "700" : "500" });
    tx += w + 12;
  });
  s += rr(W - PAD - 320, 36, 320, 40, 20, CARD, HAIR) + `<circle cx="${W - PAD - 296}" cy="56" r="6" fill="none" stroke="${FAINT}" stroke-width="1.6"/><path d="M${W - PAD - 291} 61 l4 4" stroke="${FAINT}" stroke-width="1.6" stroke-linecap="round"/>` + t(W - PAD - 274, 61, "Search flags…", { size: 13.5, fill: FAINT });

  const ty = 108, tw = CW - 2 * PAD;
  s += card(x0, ty, tw, APPH - 88 - ty - 36);
  const cols = [["TYPE", x0 + 28], ["FLAGGED", x0 + 170], ["REPORTED BY", x0 + 620], ["WHEN", x0 + 790], ["STATUS", x0 + 892], ["", x0 + tw - 128]];
  cols.forEach(([c, cx]) => s += t(cx, ty + 40, c, { size: 11.5, weight: "700", fill: FAINT, ls: 0.8 }));
  s += `<line x1="${x0 + 20}" y1="${ty + 58}" x2="${x0 + tw - 20}" y2="${ty + 58}" stroke="${HAIR}" stroke-width="1"/>`;
  // Story = Sprint 6 UGC (D-S6-4); actioning a story flag HIDES the story (status='hidden'),
  // never deletes — the row/photos survive and the author sees the hidden state.
  const cmap = { Listing: [SOFT, TEAL], Message: ["#ecebf6", VIOLET], Account: [WARNBG, WARN2],
                 Story: [OKBG, OK] };
  const rows = [
    ["Listing", "“Free puppies!! Take one now!!!” — suspected spam", "1 report", "2h ago", "Open"],
    ["Story", "Off-topic — not a real success story", "1 report", "6h ago", "Open"],
    ["Message", "Harassment in an adoption inquiry thread", "2 reports", "5h ago", "Open"],
    ["Account", "Duplicate shelter profile", "System", "1d ago", "Open"],
    ["Story", "Misleading — animal wasn't actually adopted", "2 reports", "2d ago", "Actioned"],
    ["Message", "Off-topic comment on a story", "1 report", "3d ago", "Dismissed"],
  ];
  rows.forEach(([type, summary, reporter, when, st], i) => {
    const ry = ty + 58 + i * 88;
    if (i) s += `<line x1="${x0 + 20}" y1="${ry}" x2="${x0 + tw - 20}" y2="${ry}" stroke="${HAIR}" stroke-width="1"/>`;
    const [cb, cf] = cmap[type];
    s += chip(x0 + 28, ry + 32, type, cb, cf);
    s += t(x0 + 170, ry + 48, summary, { size: 14.5, fill: INK, weight: "600" });
    s += t(x0 + 620, ry + 48, reporter, { size: 13.5, fill: MUTED });
    s += t(x0 + 790, ry + 48, when, { size: 13.5, fill: MUTED });
    s += statusChip(x0 + 892, ry + 30, st);
    const done = st !== "Open";
    s += rr(x0 + tw - 128, ry + 25, 108, 38, 11, done ? CARD : "url(#btn)", done ? HAIR : null) + t(x0 + tw - 74, ry + 49, done ? "View" : "Review", { size: 13.5, anchor: "middle", fill: done ? NAVY : WHITE, weight: "700" });
  });
  return frame("admin.kupkopph.com/moderation", "Moderation", "Moderation", "3 open flags", s);
}

function moderationDetail() {
  const x0 = CX + PAD; let s = "";
  s += t(x0, 40, "← Back to moderation", { size: 13.5, fill: TEAL, weight: "700" });
  s += rr(x0, 74, 56, 56, 16, DANGERBG) + glyph("flag", x0 + 28, 102, DANGER, 2.4);
  s += t(x0 + 74, 96, "Flagged listing", { size: 25, weight: "800", fill: INK, ls: -0.3 }) + statusChip(x0 + 320, 84, "Open");
  s += t(x0 + 74, 122, "Reported 2h ago · 1 report · category: Spam / scam", { size: 13.5, fill: MUTED });

  const mainW = CW - 2 * PAD - 420 - 24, my = 156;
  // flagged content
  s += card(x0, my, mainW, 300);
  s += t(x0 + 28, my + 40, "Flagged content", { size: 16, weight: "800", fill: INK });
  s += rr(x0 + 28, my + 64, mainW - 56, 210, 14, "#f8f8f4", HAIR);
  s += t(x0 + 48, my + 104, "Free puppies!! Take one now!!!", { size: 20, weight: "800", fill: INK });
  s += avatar(x0 + 62, my + 148, 16, "JD", "#efeae2", "#8a5a12");
  s += t(x0 + 86, my + 145, "Juan D.", { size: 13.5, weight: "700", fill: NAVY }) + chip(x0 + 152, my + 134, "Unverified", "#eceae4", MUTED);
  s += t(x0 + 86, my + 165, "Posted Jul 13 · Quezon City", { size: 12.5, fill: MUTED });
  ["“Giving away 8 puppies for free, message my number now,", "no questions. Cash for shots appreciated…”"].forEach((ln, i) => s += t(x0 + 48, my + 205 + i * 24, ln, { size: 13.5, fill: MUTED }));

  // report details
  const ry2 = my + 324;
  s += t(x0, ry2, "Report details", { size: 16, weight: "800", fill: INK });
  s += card(x0, ry2 + 20, mainW, 150);
  s += avatar(x0 + 52, ry2 + 74, 20, "AR");
  s += t(x0 + 84, ry2 + 66, "Ana Reyes", { size: 14.5, weight: "700", fill: INK }) + chip(x0 + 210, ry2 + 54, "Spam / scam", DANGERBG, DANGER);
  s += t(x0 + 84, ry2 + 88, "Reported Jul 13, 2:40 PM", { size: 12.5, fill: MUTED });
  s += t(x0 + 52, ry2 + 124, "“Asking for money for a ‘free’ pet and pushing for", { size: 13.5, fill: MUTED });
  s += t(x0 + 52, ry2 + 146, "off-app contact — looks like a scam.”", { size: 13.5, fill: MUTED });

  // decision rail
  const rx = x0 + mainW + 24, rw = 420;
  s += card(rx, my, rw, 470);
  s += t(rx + 28, my + 42, "Action", { size: 17, weight: "800", fill: INK });
  s += t(rx + 28, my + 80, "MODERATOR NOTES", { size: 11, weight: "700", fill: FAINT, ls: 0.8 });
  s += rr(rx + 28, my + 92, rw - 56, 92, 12, "#f8f8f4", HAIR);
  s += t(rx + 44, my + 124, "Clear scam pattern. Removing the", { size: 13, fill: MUTED });
  s += t(rx + 44, my + 146, "listing and warning the poster.", { size: 13, fill: MUTED });
  s += rr(rx + 28, my + 204, rw - 56, 52, 13, DANGER) + t(rx + rw / 2, my + 237, "Remove listing", { size: 16, anchor: "middle", fill: WHITE, weight: "700" });
  const hw = (rw - 56 - 14) / 2;
  s += rr(rx + 28, my + 268, hw, 48, 12, CARD, HAIR) + t(rx + 28 + hw / 2, my + 298, "Warn poster", { size: 14, anchor: "middle", fill: NAVY, weight: "700" });
  s += rr(rx + 28 + hw + 14, my + 268, hw, 48, 12, CARD, HAIR) + t(rx + 28 + hw + 14 + hw / 2, my + 298, "Dismiss", { size: 14, anchor: "middle", fill: MUTED, weight: "700" });
  s += `<line x1="${rx + 28}" y1="${my + 346}" x2="${rx + rw - 28}" y2="${my + 346}" stroke="${HAIR}" stroke-width="1"/>`;
  s += t(rx + 28, my + 378, "On remove", { size: 12.5, weight: "700", fill: INK, ls: 0.3 });
  ["Listing hidden from the app", "Poster notified with the reason", "Repeat offenders auto-escalate"].forEach((ln, i) => {
    const ey = my + 404 + i * 26;
    s += `<circle cx="${rx + 33}" cy="${ey - 4}" r="8" fill="${DANGERBG}"/>` + `<line x1="${rx + 29}" y1="${ey - 4}" x2="${rx + 37}" y2="${ey - 4}" stroke="${DANGER}" stroke-width="1.8" stroke-linecap="round"/>` + t(rx + 50, ey, ln, { size: 12.5, fill: MUTED });
  });
  return frame("admin.kupkopph.com/moderation/flag-2831", "Moderation", "Review flag", "Listing · suspected spam", s);
}

function tabsRow(x0, tabs) {
  let s = "", tx = x0;
  tabs.forEach(([lab, on]) => {
    const w = 34 + lab.length * 8.5;
    s += rr(tx, 36, w, 40, 20, on ? INK : CARD, on ? null : HAIR) + t(tx + w / 2, 61, lab, { size: 14, anchor: "middle", fill: on ? WHITE : NAVY, weight: on ? "700" : "500" });
    tx += w + 12;
  });
  return s;
}
function searchBox(ph) {
  return rr(W - PAD - 320, 36, 320, 40, 20, CARD, HAIR) + `<circle cx="${W - PAD - 296}" cy="56" r="6" fill="none" stroke="${FAINT}" stroke-width="1.6"/><path d="M${W - PAD - 291} 61 l4 4" stroke="${FAINT}" stroke-width="1.6" stroke-linecap="round"/>` + t(W - PAD - 274, 61, ph, { size: 13.5, fill: FAINT });
}

function shelters() {
  const x0 = CX + PAD, tw = CW - 2 * PAD; let s = tabsRow(x0, [["All", true], ["Verified", false], ["Unverified", false]]) + searchBox("Search shelters…");
  const ty = 108;
  s += card(x0, ty, tw, APPH - 88 - ty - 36);
  [["SHELTER", x0 + 28], ["LOCATION", x0 + 360], ["LISTINGS", x0 + 548], ["DONATION QR", x0 + 690], ["STATUS", x0 + 892]].forEach(([c, cx]) => s += t(cx, ty + 40, c, { size: 11.5, weight: "700", fill: FAINT, ls: 0.8 }));
  s += `<line x1="${x0 + 20}" y1="${ty + 58}" x2="${x0 + tw - 20}" y2="${ty + 58}" stroke="${HAIR}" stroke-width="1"/>`;
  // tier drives the badge: Rescue = tier-1 Community rescue (Verified Rescue), NGO = tier-2
  // Registered NGO (Verified Shelter). "In-Progress" = provisional (SEC in, BAI pending) — still active.
  const rows = [
    ["PAWS Manila", "PM", "NGO", "Marikina City", "12", true, "Verified"],
    ["CARA Welfare", "CW", "NGO", "Manila", "21", true, "Verified"],
    ["Aling Nena's Rescue", "AN", "Rescue", "Quezon City", "4", true, "Verified"],
    ["Marikina AWG", "MA", "NGO", "Marikina City", "6", true, "In-Progress"],
    ["Pasig Pound", "PP", "Rescue", "Pasig City", "3", false, "Pending"],
    ["Antipolo Strays", "AS", "Rescue", "Antipolo", "0", false, "Rejected"],
  ];
  rows.forEach(([nm, ini, tier, loc, n, qr, st], i) => {
    const ry = ty + 58 + i * 78;
    if (i) s += `<line x1="${x0 + 20}" y1="${ry}" x2="${x0 + tw - 20}" y2="${ry}" stroke="${HAIR}" stroke-width="1"/>`;
    s += avatar(x0 + 46, ry + 39, 19, ini);
    s += t(x0 + 78, ry + 44, nm, { size: 15, weight: "700", fill: INK });
    s += chip(x0 + 78 + nm.length * 8.3 + 12, ry + 26, tier, SOFT, TEAL);
    s += t(x0 + 360, ry + 44, loc, { size: 13.5, fill: MUTED });
    s += t(x0 + 548, ry + 44, n + " listings", { size: 13.5, fill: MUTED });
    s += toggle(x0 + 690, ry + 27, qr) + t(x0 + 744, ry + 44, qr ? "Verified" : "Off", { size: 13, fill: qr ? OK : FAINT, weight: "600" });
    s += statusChip(x0 + 892, ry + 26, st);
    s += rr(x0 + tw - 128, ry + 21, 108, 38, 11, CARD, HAIR) + t(x0 + tw - 74, ry + 45, "View", { size: 13.5, anchor: "middle", fill: NAVY, weight: "700" });
  });
  return frame("admin.kupkopph.com/shelters", "Shelters", "Shelters", "128 verified · 6 pending review", s);
}

function members() {
  const x0 = CX + PAD, tw = CW - 2 * PAD; let s = tabsRow(x0, [["All", true], ["Verified", false], ["Suspended", false]]) + searchBox("Search members…");
  const ty = 108;
  s += card(x0, ty, tw, APPH - 88 - ty - 36);
  [["MEMBER", x0 + 28], ["LOCATION", x0 + 330], ["ROLE", x0 + 486], ["JOINED", x0 + 760], ["STATUS", x0 + 892]].forEach(([c, cx]) => s += t(cx, ty + 40, c, { size: 11.5, weight: "700", fill: FAINT, ls: 0.8 }));
  s += `<line x1="${x0 + 20}" y1="${ty + 58}" x2="${x0 + tw - 20}" y2="${ty + 58}" stroke="${HAIR}" stroke-width="1"/>`;
  // "Rescuer" is a CAPABILITY, not a badge (decisions 3 & 5) — a Verified Member IS the rescuer
  // capability, so it is never a separate tag. Members carry only the Verified Member trust badge.
  const rmap = { "Verified Member": [SOFT, TEAL], "Pet owner": ["#f0efe9", MUTED] };
  const rows = [
    ["Ana Reyes", "AR", "Quezon City", ["Verified Member"], "Jun 2025", "Active"],
    ["Maria Santos", "MS", "Quezon City", ["Verified Member"], "May 2025", "Active"],
    ["Jose Cruz", "JC", "Manila", ["Pet owner"], "Jul 2025", "Active"],
    ["Liza Tan", "LT", "Pasig City", ["Verified Member"], "Apr 2025", "Active"],
    ["Pedro Lim", "PL", "Marikina City", ["Pet owner"], "Jul 2025", "Suspended"],
  ];
  rows.forEach(([nm, ini, loc, roles, joined, st], i) => {
    const ry = ty + 58 + i * 78;
    if (i) s += `<line x1="${x0 + 20}" y1="${ry}" x2="${x0 + tw - 20}" y2="${ry}" stroke="${HAIR}" stroke-width="1"/>`;
    s += avatar(x0 + 46, ry + 39, 19, ini, SOFT, TEAL);
    s += t(x0 + 78, ry + 44, nm, { size: 15, weight: "700", fill: INK });
    s += t(x0 + 330, ry + 44, loc, { size: 13.5, fill: MUTED });
    let cx = x0 + 486;
    roles.forEach(r => { const [b, f] = rmap[r]; const w = 18 + r.length * 7.4; s += chip(cx, ry + 26, r, b, f); cx += w + 8; });
    s += t(x0 + 760, ry + 44, joined, { size: 13.5, fill: MUTED });
    s += statusChip(x0 + 892, ry + 26, st);
    s += rr(x0 + tw - 128, ry + 21, 108, 38, 11, CARD, HAIR) + t(x0 + tw - 74, ry + 45, "View", { size: 13.5, anchor: "middle", fill: NAVY, weight: "700" });
  });
  return frame("admin.kupkopph.com/members", "Members", "Members", "3,412 members · 1,088 verified", s);
}

function donations() {
  const x0 = CX + PAD, tw = CW - 2 * PAD; let s = tabsRow(x0, [["Awaiting review", true], ["Verified", false], ["All", false]]) + searchBox("Search shelters…");
  const ty = 108;
  s += card(x0, ty, tw, APPH - 88 - ty - 36);
  s += rr(x0 + 24, ty + 22, tw - 48, 56, 12, INFOBG);
  s += t(x0 + 44, ty + 48, "Donation QR codes are hidden from the public until you verify the payout account matches the shelter.", { size: 13.5, fill: TEAL, weight: "600" });
  const hy = ty + 100;
  [["SHELTER", x0 + 28], ["PAYOUT METHOD", x0 + 340], ["QR", x0 + 660], ["VERIFIED", x0 + 792], ["STATUS", x0 + 892]].forEach(([c, cx]) => s += t(cx, hy, c, { size: 11.5, weight: "700", fill: FAINT, ls: 0.8 }));
  s += `<line x1="${x0 + 20}" y1="${hy + 18}" x2="${x0 + tw - 20}" y2="${hy + 18}" stroke="${HAIR}" stroke-width="1"/>`;
  const rows = [
    ["Marikina AWG", "MA", "GCash · 0917 888 1200", false, "Pending"],
    ["Pasig Pound", "PP", "Maya · 0919 444 5566", false, "Pending"],
    ["PAWS Manila", "PM", "GCash · 0917 555 0110", true, "Verified"],
    ["CARA Welfare", "CW", "Maya · 0918 222 3344", true, "Verified"],
    ["QC Animal Shelter", "QC", "GCash · 0917 333 7788", true, "Verified"],
  ];
  rows.forEach(([nm, ini, method, ver, st], i) => {
    const ry = hy + 18 + i * 86;
    if (i) s += `<line x1="${x0 + 20}" y1="${ry}" x2="${x0 + tw - 20}" y2="${ry}" stroke="${HAIR}" stroke-width="1"/>`;
    s += avatar(x0 + 46, ry + 43, 19, ini);
    s += t(x0 + 78, ry + 48, nm, { size: 15, weight: "700", fill: INK });
    s += t(x0 + 340, ry + 48, method, { size: 13.5, fill: MUTED });
    s += miniqr(x0 + 660, ry + 20, 48);
    s += toggle(x0 + 792, ry + 31, ver);
    s += statusChip(x0 + 892, ry + 30, st);
    const label = ver ? "View" : "Verify";
    s += rr(x0 + tw - 128, ry + 25, 108, 38, 11, ver ? CARD : "url(#btn)", ver ? HAIR : null) + t(x0 + tw - 74, ry + 49, label, { size: 13.5, anchor: "middle", fill: ver ? NAVY : WHITE, weight: "700" });
  });
  return frame("admin.kupkopph.com/donations", "Donations", "Donation QR verification", "2 awaiting review", s);
}

function needsInfoModal() {
  let s = verificationDetail();
  s += `<rect x="0" y="0" width="${W}" height="${H}" fill="#0d1826" opacity="0.55"/>`;
  const mw = 640, mh = 468, mx = (W - mw) / 2, my = (H - mh) / 2;
  s += `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="22" fill="${CARD}" filter="url(#sh)"/>`;
  s += rr(mx + 32, my + 32, 52, 52, 15, INFOBG) + glyph("shield", mx + 58, my + 58, INFO, 2.2);
  s += t(mx + 100, my + 56, "Request more info", { size: 21, weight: "800", fill: INK });
  s += t(mx + 100, my + 80, "PAWS Manila will be notified and can resubmit.", { size: 13.5, fill: MUTED });
  s += t(mx + 32, my + 124, "WHAT'S MISSING", { size: 11, weight: "700", fill: FAINT, ls: 0.8 });
  const opts = [["A clearer photo of the owner's Gov ID", true], ["Current BAI certificate (yours has expired)", false], ["Proof of billing showing the org address", true]];
  opts.forEach(([lab, on], i) => {
    const oy = my + 140 + i * 44;
    s += rr(mx + 32, oy, 26, 26, 7, on ? TEAL : CARD, on ? null : "#cfd2cd") + (on ? check(mx + 45, oy + 13, WHITE, 2.4) : "");
    s += t(mx + 72, oy + 18, lab, { size: 14.5, fill: INK, weight: "500" });
  });
  s += t(mx + 32, my + 296, "MESSAGE TO APPLICANT", { size: 11, weight: "700", fill: FAINT, ls: 0.8 });
  s += rr(mx + 32, my + 308, mw - 64, 76, 12, "#f8f8f4", HAIR);
  s += t(mx + 48, my + 338, "Hi PAWS Manila — your Gov ID photo is blurry and", { size: 13, fill: MUTED });
  s += t(mx + 48, my + 360, "we can't read the address. Please re-upload. Salamat!", { size: 13, fill: MUTED });
  s += rr(mx + 32, my + mh - 60, 150, 46, 12, CARD, HAIR) + t(mx + 107, my + mh - 31, "Cancel", { size: 14.5, anchor: "middle", fill: NAVY, weight: "700" });
  s += rr(mx + mw - 32 - 220, my + mh - 60, 220, 46, 12, "url(#btn)") + t(mx + mw - 32 - 110, my + mh - 31, "Send request", { size: 15, anchor: "middle", fill: WHITE, weight: "700" });
  return s;
}

function settings() {
  const x0 = CX + PAD, tw = CW - 2 * PAD; let s = "";
  // left settings sub-nav
  const nav = ["Profile", "Notifications", "Team &amp; roles", "Security", "Audit log"];
  const navW = 244;
  s += card(x0, 40, navW, nav.length * 50 + 28);
  nav.forEach((it, i) => {
    const iy = 74 + i * 50, on = it === "Team &amp; roles";
    if (on) s += rr(x0 + 12, iy - 22, navW - 24, 40, 10, SOFT);
    s += t(x0 + 28, iy + 5, it, { size: 14.5, fill: on ? TEAL : NAVY, weight: on ? "700" : "500" });
  });

  const rx = x0 + navW + 28, rw = tw - navW - 28;
  s += t(rx, 40, "Team &amp; roles", { size: 18, weight: "800", fill: INK });
  s += t(rx, 62, "Manage who can access Platform Ops.", { size: 13.5, fill: MUTED });
  s += rr(x0 + tw - 168, 26, 168, 44, 12, "url(#btn)") + t(x0 + tw - 84, 53, "+  Invite admin", { size: 14, anchor: "middle", fill: WHITE, weight: "700" });

  // admins list
  const cy0 = 92, chAdmins = 4 * 78 + 24;
  s += card(rx, cy0, rw, chAdmins);
  const rmap = { Owner: [SOFT, TEAL], Admin: ["#ecebf6", VIOLET], Moderator: [WARNBG, WARN2] };
  const admins = [
    ["Rina Alonzo", "AR", "rina@kupkopph.com", "Owner", "Active now", true],
    ["Marco Diaz", "MD", "marco@kupkopph.com", "Admin", "Active 2h ago", false],
    ["Joy Tan", "JT", "joy@kupkopph.com", "Moderator", "Active 1d ago", false],
    ["Ben Cruz", "BC", "ben@kupkopph.com", "Moderator", "Active 3d ago", false],
  ];
  admins.forEach(([nm, ini, email, role, last, you], i) => {
    const ry = cy0 + 40 + i * 78;
    if (i) s += `<line x1="${rx + 24}" y1="${ry - 20}" x2="${rx + rw - 24}" y2="${ry - 20}" stroke="${HAIR}" stroke-width="1"/>`;
    s += avatar(rx + 46, ry + 18, 20, ini);
    s += t(rx + 78, ry + 14, nm + (you ? "  (you)" : ""), { size: 15, weight: "700", fill: INK });
    s += t(rx + 78, ry + 36, email, { size: 13, fill: MUTED });
    const [b, f] = rmap[role]; s += chip(rx + 470, ry, role, b, f);
    s += t(rx + 620, ry + 18, last, { size: 13, fill: FAINT });
    s += t(rx + rw - 34, ry + 22, "⋯", { size: 22, anchor: "end", fill: FAINT });
  });

  // role permissions matrix
  const py = cy0 + chAdmins + 24;
  s += card(rx, py, rw, 244);
  s += t(rx + 24, py + 40, "What each role can do", { size: 15.5, weight: "800", fill: INK });
  const roles = ["Owner", "Admin", "Moderator"], colX = [rx + rw - 300, rx + rw - 190, rx + rw - 70];
  roles.forEach((r, i) => s += t(colX[i], py + 40, r, { size: 12, anchor: "middle", weight: "700", fill: MUTED }));
  const caps = [
    ["Verify shelters &amp; members", [1, 1, 1]],
    ["Moderate flags", [1, 1, 1]],
    ["Manage shelters &amp; donations", [1, 1, 0]],
    ["Manage team &amp; billing", [1, 0, 0]],
  ];
  caps.forEach(([cap, vals], i) => {
    const ry = py + 78 + i * 40;
    s += t(rx + 24, ry + 5, cap, { size: 13.5, fill: NAVY, weight: "500" });
    vals.forEach((v, j) => {
      if (v) s += `<circle cx="${colX[j]}" cy="${ry}" r="9" fill="${OKBG}"/>` + check(colX[j], ry, OK, 1.9);
      else s += `<line x1="${colX[j] - 6}" y1="${ry}" x2="${colX[j] + 6}" y2="${ry}" stroke="#cfd2cd" stroke-width="2" stroke-linecap="round"/>`;
    });
  });
  return frame("admin.kupkopph.com/settings", "Settings", "Settings", "Platform Ops · team &amp; roles", s);
}

function shelterDetail() {
  const x0 = CX + PAD; let s = "";
  s += t(x0, 40, "← Back to shelters", { size: 13.5, fill: TEAL, weight: "700" });
  s += avatar(x0 + 30, 98, 30, "PM", SOFT, TEAL);
  s += t(x0 + 76, 90, "PAWS Manila", { size: 25, weight: "800", fill: INK, ls: -0.3 }) + statusChip(x0 + 276, 78, "Verified");
  s += chip(x0 + 386, 79, "Verified Shelter", SOFT, TEAL);
  s += t(x0 + 76, 116, "Registered NGO (tier 2) · Marikina City · verified Jun 12, 2025", { size: 13.5, fill: MUTED });

  const mainW = CW - 2 * PAD - 420 - 24, my = 156;
  // organization details
  s += card(x0, my, mainW, 284);
  s += t(x0 + 28, my + 40, "Organization", { size: 16, weight: "800", fill: INK });
  s += t(x0 + mainW - 28, my + 40, "Open verification record →", { size: 12.5, anchor: "end", fill: TEAL, weight: "700" });
  const facts = [
    ["Legal name", "PAWS Manila Inc."],
    ["Contact", "hello@pawsmanila.org · 0917 555 0110"],
    ["Address", "12 Aurora Blvd, Marikina City"],
    ["Tier", "Registered NGO (tier 2) · Verified Shelter"],
    ["Facebook", "facebook.com/pawsmanila"],
    ["Owner account", "shelter · member since Jun 2, 2025"],
  ];
  facts.forEach(([k, v], i) => {
    const fy = my + 84 + i * 34;
    s += t(x0 + 28, fy, k, { size: 13.5, fill: FAINT });
    s += t(x0 + 200, fy, v, { size: 13.5, fill: INK, weight: "600" });
  });

  // activity metrics
  const dy = my + 308;
  s += t(x0, dy, "Activity", { size: 16, weight: "800", fill: INK });
  const mw = (mainW - 3 * 16) / 4, mty = dy + 16;
  s += metric(x0, mty, mw, "12", "Listings", "grid", TEAL, SOFT);
  s += metric(x0 + (mw + 16), mty, mw, "37", "Adoptions", "shield", OK, OKBG);
  s += metric(x0 + (mw + 16) * 2, mty, mw, "128", "Needs fulfilled", "peso", VIOLET, "#ecebf6");
  s += metric(x0 + (mw + 16) * 3, mty, mw, "56", "Volunteers", "user", WARN2, WARNBG);

  // moderation history
  const hy = mty + 98 + 24;
  s += t(x0, hy, "Moderation history", { size: 16, weight: "800", fill: INK }) + chip(x0 + 210, hy - 18, "1 resolved", "#f0efe9", MUTED);
  s += card(x0, hy + 20, mainW, 158);
  const hist = [
    ["Listing", "Mismatched photos on a listing", "Resolved", "Jul 2"],
    ["Account", "Duplicate profile report — dismissed", "Dismissed", "May 20"],
  ];
  hist.forEach(([tp, desc, st, when], i) => {
    const ry = hy + 20 + 44 + i * 56;
    if (i) s += `<line x1="${x0 + 24}" y1="${ry - 20}" x2="${x0 + mainW - 24}" y2="${ry - 20}" stroke="${HAIR}" stroke-width="1"/>`;
    s += chip(x0 + 24, ry - 14, tp, "#f0efe9", MUTED);
    s += t(x0 + 24 + 24 + tp.length * 7.4 + 12, ry + 4, desc, { size: 13.5, fill: INK, weight: "500" });
    s += t(x0 + mainW - 148, ry + 4, when, { size: 12.5, anchor: "end", fill: FAINT });
    s += statusChip(x0 + mainW - 24 - (30 + st.length * 7.6), ry - 14, st);
  });

  // ---- right action rail ----
  const rx = x0 + mainW + 24, rw = 420;
  s += card(rx, my, rw, 512);
  s += t(rx + 28, my + 42, "Admin actions", { size: 17, weight: "800", fill: INK });
  // donation QR panel
  s += t(rx + 28, my + 78, "DONATION QR", { size: 11, weight: "700", fill: FAINT, ls: 0.8 });
  s += rr(rx + 28, my + 90, rw - 56, 68, 12, "#f8f8f4", HAIR);
  s += miniqr(rx + 44, my + 106, 40);
  s += t(rx + 96, my + 118, "GCash · 0917 555 0110", { size: 13.5, fill: INK, weight: "600" });
  s += `<circle cx="${rx + 100}" cy="${my + 138}" r="4" fill="${OK}"/>` + t(rx + 112, my + 142, "Verified &amp; public", { size: 12, fill: OK, weight: "600" });
  s += toggle(rx + rw - 28 - 44, my + 112, true);
  // action buttons
  s += rr(rx + 28, my + 180, rw - 56, 52, 13, "url(#btn)") + t(rx + rw / 2, my + 213, "View verification record", { size: 15, anchor: "middle", fill: WHITE, weight: "700" });
  s += rr(rx + 28, my + 244, rw - 56, 48, 12, CARD, HAIR) + t(rx + rw / 2, my + 274, "View public profile", { size: 14, anchor: "middle", fill: NAVY, weight: "700" });
  s += rr(rx + 28, my + 304, rw - 56, 48, 12, "#fdf3f2", "#eecbc8") + t(rx + rw / 2, my + 334, "Suspend organization", { size: 14, anchor: "middle", fill: DANGER, weight: "700" });
  s += `<line x1="${rx + 28}" y1="${my + 378}" x2="${rx + rw - 28}" y2="${my + 378}" stroke="${HAIR}" stroke-width="1"/>`;
  // timeline
  s += t(rx + 28, my + 410, "Account timeline", { size: 12.5, weight: "700", fill: INK, ls: 0.3 });
  const tl = [["Verified", "Jun 12, 2025"], ["Signed up", "Jun 2, 2025"], ["Last active", "2h ago"]];
  tl.forEach(([lab, when], i) => {
    const ey = my + 440 + i * 26;
    s += `<circle cx="${rx + 33}" cy="${ey - 4}" r="3.5" fill="${TEAL}"/>`;
    s += t(rx + 50, ey, lab, { size: 12.5, fill: NAVY, weight: "600" });
    s += t(rx + rw - 28, ey, when, { size: 12.5, anchor: "end", fill: FAINT });
  });
  return frame("admin.kupkopph.com/shelters/paws-manila", "Shelters", "Shelter detail", "PAWS Manila · Marikina City", s);
}

function memberDetail() {
  const x0 = CX + PAD; let s = "";
  s += t(x0, 40, "← Back to members", { size: 13.5, fill: TEAL, weight: "700" });
  s += avatar(x0 + 30, 98, 30, "MS", "#ecebf6", VIOLET);
  s += t(x0 + 76, 90, "Maria Santos", { size: 25, weight: "800", fill: INK, ls: -0.3 }) + statusChip(x0 + 290, 78, "Active");
  s += t(x0 + 76, 116, "Verified Member · Quezon City · joined May 8, 2025", { size: 13.5, fill: MUTED });

  const mainW = CW - 2 * PAD - 420 - 24, my = 156;
  // member details
  s += card(x0, my, mainW, 250);
  s += t(x0 + 28, my + 40, "Member details", { size: 16, weight: "800", fill: INK });
  s += t(x0 + mainW - 28, my + 40, "Open verification record →", { size: 12.5, anchor: "end", fill: TEAL, weight: "700" });
  const facts = [
    ["Full name", "Maria Santos"],
    ["Contact", "maria.santos@email.com · 0917 222 3344"],
    ["Location", "Quezon City"],
    ["Account", "pet owner · rescuer capability"],
    ["Verified", "Verified Member since May 20, 2025"],
  ];
  facts.forEach(([k, v], i) => {
    const fy = my + 84 + i * 34;
    s += t(x0 + 28, fy, k, { size: 13.5, fill: FAINT });
    s += t(x0 + 200, fy, v, { size: 13.5, fill: INK, weight: "600" });
  });

  // activity metrics
  const dy = my + 274;
  s += t(x0, dy, "Activity", { size: 16, weight: "800", fill: INK });
  const mw = (mainW - 3 * 16) / 4, mty = dy + 16;
  s += metric(x0, mty, mw, "2", "Adoptions", "shield", TEAL, SOFT);
  s += metric(x0 + (mw + 16), mty, mw, "18", "Volunteer shifts", "clock", VIOLET, "#ecebf6");
  s += metric(x0 + (mw + 16) * 2, mty, mw, "5", "Rescues posted", "flag", WARN2, WARNBG);
  s += metric(x0 + (mw + 16) * 3, mty, mw, "9", "Donations", "peso", OK, OKBG);

  // reliability + badges side by side
  const ry2 = mty + 98 + 24, hw = (mainW - 20) / 2;
  s += card(x0, ry2, hw, 168);
  s += t(x0 + 24, ry2 + 38, "Volunteer reliability", { size: 15, weight: "800", fill: INK });
  s += pillDot(x0 + 24, ry2 + 58, "Reliable", OKBG, OK, true);
  s += t(x0 + 24, ry2 + 116, "18 shifts · 1 no-show", { size: 15, weight: "700", fill: INK });
  s += t(x0 + 24, ry2 + 140, "Manual re-approval kicks in at 3 no-shows.", { size: 12.5, fill: MUTED });

  s += card(x0 + hw + 20, ry2, hw, 168);
  s += t(x0 + hw + 20 + 24, ry2 + 38, "Badges", { size: 15, weight: "800", fill: INK });
  const badges = [["Verified Member", SOFT, TEAL], ["Reliable", OKBG, OK], ["Active Volunteer", WARNBG, WARN2]];
  let bx = x0 + hw + 20 + 24, byRow = ry2 + 68;
  badges.forEach(([lab, b, f]) => {
    const w = 18 + lab.length * 7.4;
    if (bx + w > x0 + hw + 20 + hw - 24) { bx = x0 + hw + 20 + 24; byRow += 40; }
    s += chip(bx, byRow, lab, b, f);
    bx += w + 10;
  });

  // moderation history (slim)
  const hy = ry2 + 168 + 24;
  s += t(x0, hy, "Moderation history", { size: 16, weight: "800", fill: INK });
  s += card(x0, hy + 20, mainW, 66);
  s += `<circle cx="${x0 + 44}" cy="${hy + 53}" r="9" fill="${OKBG}"/>` + check(x0 + 44, hy + 53, OK, 1.9);
  s += t(x0 + 66, hy + 58, "No flags on record — good standing.", { size: 13.5, fill: INK, weight: "500" });

  // ---- right action rail ----
  const rx = x0 + mainW + 24, rw = 420;
  s += card(rx, my, rw, 512);
  s += t(rx + 28, my + 42, "Admin actions", { size: 17, weight: "800", fill: INK });
  s += rr(rx + 28, my + 74, rw - 56, 52, 13, "url(#btn)") + t(rx + rw / 2, my + 107, "View verification record", { size: 15, anchor: "middle", fill: WHITE, weight: "700" });
  s += rr(rx + 28, my + 138, rw - 56, 48, 12, CARD, HAIR) + t(rx + rw / 2, my + 168, "View public profile", { size: 14, anchor: "middle", fill: NAVY, weight: "700" });
  s += rr(rx + 28, my + 198, rw - 56, 48, 12, CARD, HAIR) + t(rx + rw / 2, my + 228, "Revoke Verified Member", { size: 14, anchor: "middle", fill: NAVY, weight: "700" });
  s += rr(rx + 28, my + 258, rw - 56, 48, 12, "#fdf3f2", "#eecbc8") + t(rx + rw / 2, my + 288, "Suspend member", { size: 14, anchor: "middle", fill: DANGER, weight: "700" });
  s += `<line x1="${rx + 28}" y1="${my + 332}" x2="${rx + rw - 28}" y2="${my + 332}" stroke="${HAIR}" stroke-width="1"/>`;
  s += t(rx + 28, my + 364, "Revoking verification", { size: 12.5, weight: "700", fill: INK, ls: 0.3 });
  ["Verified Member badge removed", "Can no longer submit adoption inquiries", "Rescue tools locked · member notified"].forEach((ln, i) => {
    const ey = my + 390 + i * 26;
    s += `<circle cx="${rx + 33}" cy="${ey - 4}" r="8" fill="${WARNBG}"/>` + `<line x1="${rx + 29}" y1="${ey - 4}" x2="${rx + 37}" y2="${ey - 4}" stroke="${WARN2}" stroke-width="1.8" stroke-linecap="round"/>` + t(rx + 50, ey, ln, { size: 12.5, fill: MUTED });
  });
  s += `<line x1="${rx + 28}" y1="${my + 476}" x2="${rx + rw - 28}" y2="${my + 476}" stroke="${HAIR}" stroke-width="1"/>`;
  s += t(rx + 28, my + 502, "Joined May 8, 2025 · last active 1d ago", { size: 12, fill: FAINT });
  return frame("admin.kupkopph.com/members/maria-santos", "Members", "Member detail", "Maria Santos · Quezon City", s);
}

function memberDetailSuspended() {
  const x0 = CX + PAD; let s = "";
  s += t(x0, 40, "← Back to members", { size: 13.5, fill: TEAL, weight: "700" });
  s += avatar(x0 + 30, 98, 30, "PL", "#eceae4", MUTED);
  s += t(x0 + 76, 90, "Pedro Lim", { size: 25, weight: "800", fill: INK, ls: -0.3 }) + statusChip(x0 + 240, 78, "Suspended");
  s += t(x0 + 76, 116, "Pet owner · Marikina City · joined Jul 3, 2025", { size: 13.5, fill: MUTED });

  const mainW = CW - 2 * PAD - 420 - 24, my = 156;
  // suspension banner
  s += rr(x0, my, mainW, 62, 14, DANGERBG, "#eecbc8");
  s += glyph("flag", x0 + 36, my + 31, DANGER, 2.2);
  s += t(x0 + 62, my + 28, "Suspended Jul 12, 2025 by Rina Alonzo", { size: 14, weight: "700", fill: DANGER });
  s += t(x0 + 62, my + 48, "Reason: repeated spam listings after a warning.", { size: 12.5, fill: "#8a5148" });

  // member details
  const dcy = my + 82;
  s += card(x0, dcy, mainW, 236);
  s += t(x0 + 28, dcy + 40, "Member details", { size: 16, weight: "800", fill: INK });
  const facts = [
    ["Full name", "Pedro Lim"],
    ["Contact", "pedro.lim@email.com · 0917 654 3210"],
    ["Location", "Marikina City"],
    ["Account", "pet owner · not verified"],
    ["Status", "Suspended · Jul 12, 2025"],
  ];
  facts.forEach(([k, v], i) => {
    const fy = dcy + 82 + i * 32;
    s += t(x0 + 28, fy, k, { size: 13.5, fill: FAINT });
    s += t(x0 + 200, fy, v, { size: 13.5, fill: i === facts.length - 1 ? DANGER : INK, weight: i === facts.length - 1 ? "700" : "600" });
  });

  // activity metrics
  const dy = dcy + 260;
  s += t(x0, dy, "Activity", { size: 16, weight: "800", fill: INK });
  const mw = (mainW - 3 * 16) / 4, mty = dy + 16;
  s += metric(x0, mty, mw, "0", "Adoptions", "shield", MUTED, "#f0efe9");
  s += metric(x0 + (mw + 16), mty, mw, "3", "Volunteer shifts", "clock", MUTED, "#f0efe9");
  s += metric(x0 + (mw + 16) * 2, mty, mw, "0", "Rescues posted", "flag", MUTED, "#f0efe9");
  s += metric(x0 + (mw + 16) * 3, mty, mw, "1", "Donations", "peso", MUTED, "#f0efe9");

  // moderation history (the flags behind the suspension)
  const hy = mty + 98 + 24;
  s += t(x0, hy, "Moderation history", { size: 16, weight: "800", fill: INK }) + chip(x0 + 210, hy - 18, "2 actioned", DANGERBG, DANGER);
  s += card(x0, hy + 20, mainW, 150);
  const hist = [
    ["Listing", "“Free puppies!!” — suspected spam", "Actioned", "Jul 12"],
    ["Listing", "Reposted the flagged listing after a warning", "Actioned", "Jul 11"],
  ];
  hist.forEach(([tp, desc, st, when], i) => {
    const ry = hy + 20 + 44 + i * 56;
    if (i) s += `<line x1="${x0 + 24}" y1="${ry - 20}" x2="${x0 + mainW - 24}" y2="${ry - 20}" stroke="${HAIR}" stroke-width="1"/>`;
    s += chip(x0 + 24, ry - 14, tp, "#f0efe9", MUTED);
    s += t(x0 + 24 + 24 + tp.length * 7.4 + 12, ry + 4, desc, { size: 13.5, fill: INK, weight: "500" });
    s += t(x0 + mainW - 148, ry + 4, when, { size: 12.5, anchor: "end", fill: FAINT });
    s += statusChip(x0 + mainW - 24 - (30 + st.length * 7.6), ry - 14, st);
  });

  // ---- right action rail ----
  const rx = x0 + mainW + 24, rw = 420;
  s += card(rx, my, rw, 470);
  s += t(rx + 28, my + 42, "Admin actions", { size: 17, weight: "800", fill: INK });
  s += rr(rx + 28, my + 74, rw - 56, 52, 13, "url(#btn)") + t(rx + rw / 2, my + 107, "Reinstate member", { size: 15, anchor: "middle", fill: WHITE, weight: "700" });
  s += rr(rx + 28, my + 138, rw - 56, 48, 12, CARD, HAIR) + t(rx + rw / 2, my + 168, "View public profile", { size: 14, anchor: "middle", fill: NAVY, weight: "700" });
  s += `<line x1="${rx + 28}" y1="${my + 218}" x2="${rx + rw - 28}" y2="${my + 218}" stroke="${HAIR}" stroke-width="1"/>`;
  s += t(rx + 28, my + 250, "While suspended", { size: 12.5, weight: "700", fill: INK, ls: 0.3 });
  ["Listings hidden from the app", "Can't post, adopt, or volunteer", "Sign-in blocked with a notice"].forEach((ln, i) => {
    const ey = my + 276 + i * 26;
    s += `<circle cx="${rx + 33}" cy="${ey - 4}" r="8" fill="${DANGERBG}"/>` + `<line x1="${rx + 29}" y1="${ey - 4}" x2="${rx + 37}" y2="${ey - 4}" stroke="${DANGER}" stroke-width="1.8" stroke-linecap="round"/>` + t(rx + 50, ey, ln, { size: 12.5, fill: MUTED });
  });
  s += `<line x1="${rx + 28}" y1="${my + 366}" x2="${rx + rw - 28}" y2="${my + 366}" stroke="${HAIR}" stroke-width="1"/>`;
  s += t(rx + 28, my + 398, "Account timeline", { size: 12.5, weight: "700", fill: INK, ls: 0.3 });
  const tl = [["Suspended", "Jul 12, 2025", DANGER], ["Signed up", "Jul 3, 2025", TEAL], ["Last active", "Jul 12, 2025", TEAL]];
  tl.forEach(([lab, when, c], i) => {
    const ey = my + 428 + i * 26;
    s += `<circle cx="${rx + 33}" cy="${ey - 4}" r="3.5" fill="${c}"/>`;
    s += t(rx + 50, ey, lab, { size: 12.5, fill: NAVY, weight: "600" });
    s += t(rx + rw - 28, ey, when, { size: 12.5, anchor: "end", fill: FAINT });
  });
  return frame("admin.kupkopph.com/members/pedro-lim", "Members", "Member detail", "Pedro Lim · suspended", s);
}

// =================== RENDER ===================
(async () => {
  // ---- shared auth brand panel (left, echoes the console sidebar) ----
  function authBrandPanel() {
    let s = `<rect x="0" y="0" width="620" height="${APPH}" fill="url(#sb)"/>`;
    s += `<rect x="60" y="56" width="40" height="40" rx="13" fill="url(#btn)"/>` + t(80, 82, "K", { size: 21, anchor: "middle", weight: "800", fill: WHITE });
    s += t(116, 74, "Kupkop", { size: 20, weight: "800", fill: WHITE, ls: 0.2 }) + t(116, 94, "Platform Ops", { size: 12.5, fill: "#7f9a97", ls: 0.6 });
    s += t(60, 296, "Verify. Moderate. Protect.", { size: 36, weight: "800", fill: WHITE, ls: -0.5 });
    s += t(60, 342, "The staff console where Kupkop reviews verifications,", { size: 16, fill: "#a7c0bc" });
    s += t(60, 368, "actions flags, and keeps adopters and animals safe.", { size: 16, fill: "#a7c0bc" });
    ["Review shelter &amp; member verifications", "Action moderation flags", "Verify donation QRs · manage the team"].forEach((f, i) => {
      const fy = 448 + i * 52;
      s += `<circle cx="74" cy="${fy - 4}" r="13" fill="rgba(255,255,255,0.10)"/>` + check(74, fy - 4, "#7fd4b0", 2);
      s += t(100, fy, f, { size: 15, fill: "#d6e5e2", weight: "500" });
    });
    s += t(60, APPH - 48, "admin.kupkopph.com · staff access only", { size: 12.5, fill: "#5c7370", weight: "600" });
    return s;
  }
  const AX0 = 620 + (W - 620) / 2; // centre of the right-hand auth area

  // ---- Platform Ops sign-in (o.error → invalid-credentials state) ----
  function signIn(o = {}) {
    const err = !!o.error, eo = err ? 56 : 0;
    let s = chrome("admin.kupkopph.com/login") + `<g transform="translate(0,${CH})">` + authBrandPanel();
    const cw = 440, cx = AX0 - cw / 2, cy = err ? 148 : 172;
    s += card(cx, cy, cw, 606 + eo, 22);
    const ix = cx + 40, iw = cw - 80;
    s += t(ix, cy + 64, "Sign in", { size: 27, weight: "800", fill: INK, ls: -0.3 });
    s += t(ix, cy + 92, "Platform Ops · Kupkop staff access", { size: 13.5, fill: MUTED });
    if (err) {
      s += rr(ix, cy + 112, iw, 44, 11, DANGERBG, "#eecbc8");
      s += `<circle cx="${ix + 26}" cy="${cy + 134}" r="9" fill="none" stroke="${DANGER}" stroke-width="2"/><line x1="${ix + 26}" y1="${cy + 130}" x2="${ix + 26}" y2="${cy + 135}" stroke="${DANGER}" stroke-width="2" stroke-linecap="round"/><circle cx="${ix + 26}" cy="${cy + 139}" r="1.4" fill="${DANGER}"/>`;
      s += t(ix + 46, cy + 139, "Invalid email or password. Try again.", { size: 13, fill: DANGER, weight: "600" });
    }
    const field = (y, label, value, fo = {}) => {
      let r = t(ix, y, label, { size: 11.5, weight: "700", fill: fo.err ? DANGER : FAINT, ls: 0.6 });
      r += rr(ix, y + 12, iw, 52, 13, "#f6f7f4", fo.err ? "#eecbc8" : HAIR);
      r += t(ix + 18, y + 44, value, { size: 15, fill: INK, weight: "600" });
      if (fo.eye) r += `<ellipse cx="${ix + iw - 34}" cy="${y + 38}" rx="12" ry="7.5" fill="none" stroke="${MUTED}" stroke-width="1.8"/><circle cx="${ix + iw - 34}" cy="${y + 38}" r="3.4" fill="${MUTED}"/>`;
      return r;
    };
    s += field(cy + 138 + eo, "WORK EMAIL", "rina@kupkopph.com");
    s += field(cy + 226 + eo, "PASSWORD", "••••••••••", { eye: true, err });
    s += t(ix + iw, cy + 318 + eo, "Forgot password?", { size: 13, anchor: "end", fill: TEAL, weight: "700" });
    s += rr(ix, cy + 340 + eo, iw, 54, 14, "url(#btn)") + t(AX0, cy + 375 + eo, "Sign in", { size: 16, anchor: "middle", fill: WHITE, weight: "700" });
    const dy = cy + 426 + eo;
    s += `<line x1="${ix}" y1="${dy}" x2="${ix + iw / 2 - 22}" y2="${dy}" stroke="${HAIR}" stroke-width="1"/><line x1="${ix + iw / 2 + 22}" y1="${dy}" x2="${ix + iw}" y2="${dy}" stroke="${HAIR}" stroke-width="1"/>`;
    s += t(AX0, dy + 5, "or", { size: 12.5, anchor: "middle", fill: FAINT });
    s += rr(ix, cy + 450 + eo, iw, 52, 13, CARD, HAIR);
    s += rr(AX0 - 150, cy + 464 + eo, 24, 24, 6, WHITE, HAIR) + t(AX0 - 138, cy + 481 + eo, "G", { size: 15, anchor: "middle", weight: "800", fill: "#4285F4" });
    s += t(AX0 - 96, cy + 481 + eo, "Continue with Google Workspace", { size: 14, fill: INK, weight: "700" });
    s += t(AX0, cy + 558 + eo, "Staff access only · sessions protected by 2FA", { size: 12, anchor: "middle", fill: FAINT });
    s += `</g>`;
    return s;
  }

  // ---- Platform Ops reset password (reached from "Forgot password?") ----
  function resetPassword() {
    let s = chrome("admin.kupkopph.com/reset") + `<g transform="translate(0,${CH})">` + authBrandPanel();
    const cw = 440, cx = AX0 - cw / 2, cy = 250;
    s += card(cx, cy, cw, 350, 22);
    const ix = cx + 40, iw = cw - 80;
    s += t(ix, cy + 64, "Reset password", { size: 26, weight: "800", fill: INK, ls: -0.3 });
    s += t(ix, cy + 92, "Enter your work email — we'll send a reset link.", { size: 13.5, fill: MUTED });
    s += t(ix, cy + 138, "WORK EMAIL", { size: 11.5, weight: "700", fill: FAINT, ls: 0.6 });
    s += rr(ix, cy + 150, iw, 52, 13, "#f6f7f4", HAIR) + t(ix + 18, cy + 182, "rina@kupkopph.com", { size: 15, fill: INK, weight: "600" });
    s += rr(ix, cy + 228, iw, 54, 14, "url(#btn)") + t(AX0, cy + 263, "Send reset link", { size: 16, anchor: "middle", fill: WHITE, weight: "700" });
    s += t(AX0, cy + 320, "← Back to sign in", { size: 13.5, anchor: "middle", fill: TEAL, weight: "700" });
    s += `</g>`;
    return s;
  }

  const defs = `<defs>
    <filter id="sh" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#16233b" flood-opacity="0.06"/></filter>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="9" flood-color="#1C6B6B" flood-opacity="0.45"/></filter>
    <linearGradient id="sb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14281f"/><stop offset="1" stop-color="#0c1b15"/></linearGradient>
    <linearGradient id="btn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#20787a"/><stop offset="1" stop-color="#155150"/></linearGradient>
  </defs>`;
  const out = [
    ["admin-dashboard.png", dashboard()],
    ["admin-verifications.png", verifications()],
    ["admin-verification-detail.png", verificationDetail()],
    ["admin-verification-member-detail.png", verificationMemberDetail()],
    ["admin-moderation.png", moderation()],
    ["admin-moderation-detail.png", moderationDetail()],
    ["admin-shelters.png", shelters()],
    ["admin-shelter-detail.png", shelterDetail()],
    ["admin-members.png", members()],
    ["admin-member-detail.png", memberDetail()],
    ["admin-member-detail-suspended.png", memberDetailSuspended()],
    ["admin-donations.png", donations()],
    ["admin-verification-needs-info.png", needsInfoModal()],
    ["admin-settings.png", settings()],
    ["admin-signin.png", signIn()],
    ["admin-signin-error.png", signIn({ error: true })],
    ["admin-reset-password.png", resetPassword()],
  ];
  for (const [name, inner] of out) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}<rect width="${W}" height="${H}" fill="${BG}"/>${inner}</svg>`;
    await sharp(Buffer.from(svg), { density: 132 }).png().toFile(path.join(DIR, name));
    fs.writeFileSync(path.join(DIR, name.replace(/\.png$/, ".svg")), svg);
    console.log("wrote screens/admin/" + name);
  }
})();
