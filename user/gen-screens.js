// Sprint 1 (Identity & Profiles / M1) hi-fi screen mockups for Kupkop PH.
// Same house style as website/assets/gen-mockups.js — hand-authored SVG → PNG via sharp.
// Phone frame: SW=540, SH=1170, PAD=30, dark bezel + notch.
// Run from screens/user:  node gen-screens.js
//
// DRAFT 1 — welcome + signup only (approve direction before the full set:
// OTP, choose account type, my profile, add pet, settings).
const sharp = require("sharp");
const path = require("path");

const DIR = __dirname;
const NAVY = "#1F3A5F", TEAL = "#1C6B6B", TEALDK = "#14504F", ACCENT = "#2E8B8B",
      FOREST = "#11241F", MUTED = "#5f5e5a", SOFT = "#e7f0ef", BG = "#F4F5F2", // BG = V2BG since the v2 rollout
      CREAM = "#F5F6F3", LINE = "#e3e1d9", WHITE = "#ffffff";

const SW = 540, SH = 1170;   // screen
const PAD = 30;              // bezel

function t(x, y, s, o = {}) {
  const anchor = o.anchor || "start";
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${o.size || 24}" font-weight="${o.weight || "normal"}" fill="${o.fill || NAVY}" text-anchor="${anchor}" letter-spacing="${o.ls || 0}">${s}</text>`;
}
function rrect(x, y, w, h, r, fill, stroke) {
  // v2 rollout: white hairline-stroked containers ARE the app's cards → soft shadow, no stroke.
  // Every other fill/stroke combination renders as before.
  if (fill === WHITE && stroke === LINE) return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${WHITE}" filter="url(#v2sh)"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="1.5"` : ""}/>`;
}
function statusbar(dark) {
  const c = dark ? WHITE : NAVY;
  return t(34, 38, "9:41", { size: 22, weight: "700", fill: c }) +
    `<circle cx="486" cy="32" r="5" fill="${c}"/><circle cx="502" cy="32" r="5" fill="${c}"/><rect x="470" y="22" width="40" height="18" rx="4" fill="none" stroke="${c}" stroke-width="2"/>`;
}

// Kupkop paw+heart mark (brand teal), centered on (cx,cy), radius r.
function pawmark(cx, cy, r, fill) {
  const pad = (dx, dy, pr) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="${pr}" fill="${fill}"/>`;
  return pad(-r * 0.55, -r * 0.35, r * 0.26) + pad(-r * 0.2, -r * 0.62, r * 0.26) +
         pad(r * 0.2, -r * 0.62, r * 0.26) + pad(r * 0.55, -r * 0.35, r * 0.26) +
         // heart-shaped main pad
         `<path d="M${cx} ${cy + r * 0.7}
            C ${cx - r * 0.75} ${cy + r * 0.15}, ${cx - r * 0.62} ${cy - r * 0.35}, ${cx - r * 0.22} ${cy - r * 0.1}
            C ${cx - r * 0.06} ${cy + r * 0.02}, ${cx + r * 0.06} ${cy + r * 0.02}, ${cx + r * 0.22} ${cy - r * 0.1}
            C ${cx + r * 0.62} ${cy - r * 0.35}, ${cx + r * 0.75} ${cy + r * 0.15}, ${cx} ${cy + r * 0.7} Z"
            fill="${fill}"/>`;
}

// Reusable text input row
// v2 rollout: filled pill with the label INSIDE (small, muted) — same signature and vertical
// footprint as the old label-above-outlined-box (y .. y+84), so no caller re-layout needed.
// o.error = the message string → danger outline + the reason directly beneath the field.
// The message lives WITH its field, never pooled into a summary at the top: a form-level "3 fields
// need attention" makes the user hunt for which three. Field height is unchanged (82) so a form's
// spacing only has to grow where an error is actually shown.
// Rules for what these strings may say — including the account-enumeration asymmetry between signup
// and signin — are in `dev/onboarding-validation.md`.
function field(x, y, w, label, value, o = {}) {
  const err = o.error;
  let s = `<rect x="${x}" y="${y + 2}" width="${w}" height="82" rx="22" fill="${WHITE}" filter="url(#v2soft)"/>`;
  if (err) s += `<rect x="${x}" y="${y + 2}" width="${w}" height="82" rx="22" fill="none" stroke="${DANGER}" stroke-width="2.5"/>`;
  s += t(x + 26, y + 32, label, { size: 13, fill: err ? DANGER : MUTED, weight: "600", ls: 0.4 });
  const vx = x + (o.prefix ? 92 : 26);
  if (o.prefix) s += t(x + 26, y + 66, o.prefix, { size: 20, weight: "700", fill: err ? DANGER : TEAL });
  s += t(vx, y + 66, value, { size: 20, fill: value ? V2INK : "#9a988f", weight: value ? "700" : "normal" });
  if (o.eye) {
    const ex = x + w - 44, ey = y + 50;
    s += `<ellipse cx="${ex}" cy="${ey}" rx="15" ry="9.5" fill="none" stroke="${MUTED}" stroke-width="2.4"/><circle cx="${ex}" cy="${ey}" r="4.5" fill="${MUTED}"/>`;
  }
  if (err) {
    s += alertIcon(x + 13, y + 108, 11, DANGER);
    s += t(x + 34, y + 114, err, { size: 14, fill: DANGER, weight: "600" });
  }
  return s;
}

// --- shared interior-screen helpers -----------------------------------------
// Filled gradient pill for a primary create-action living IN the topbar row (right-aligned to
// x=506, same vertical band as the back circle: y 44–88). Used where a plain "+ New" text link
// under-competes with the title for attention — wishlist and Kawang-Gawa list screens, whose
// whole job is that one action. Text-link "+ New"/"Edit" elsewhere (e.g. need-pledges) stays as
// is: those screens have a stronger primary CTA already, so a second loud button would compete.
function topbarPill(xRight, label) {
  const w = 34 + label.length * 9.5;
  return `<rect x="${xRight - w}" y="44" width="${w}" height="44" rx="22" fill="url(#v2btn)" filter="url(#v2soft)"/>` +
    t(xRight - w / 2, 73, label, { size: 16.5, anchor: "middle", fill: WHITE, weight: "700" });
}
function topbar(title) {
  return statusbar(false) +
    `<circle cx="56" cy="66" r="22" fill="${WHITE}" filter="url(#v2soft)"/>` +
    t(56, 76, "‹", { size: 30, anchor: "middle", weight: "700", fill: V2INK }) +
    t(270, 76, title, { size: 22, anchor: "middle", weight: "800", fill: V2INK });
}
function steps(active) {
  let s = "";
  [0, 1, 2].forEach(i => { s += `<circle cx="${200 + i * 48}" cy="112" r="7" fill="${i <= active ? TEAL : "#cfd6d2"}"/>`; });
  return s;
}
// shelter journey has more stops than the owner's 3-dot (type → account → verify) can honestly
// show — shelters were seeing "step 3 of 3" on five consecutive screens. Their dots:
// Type (tier) · Account (signup+OTP) · Org (setup ×2) · Verify (tier docs).
function steps4(active) {
  let s = "";
  [0, 1, 2, 3].forEach(i => { s += `<circle cx="${174 + i * 64}" cy="112" r="7" fill="${i <= active ? TEAL : "#cfd6d2"}"/>`; });
  return s;
}
const chipW = label => 34 + label.length * 12;
function chip(x, y, label, on) {
  const w = chipW(label);
  return rrect(x, y, w, 52, 26, on ? TEAL : WHITE, on ? TEAL : LINE) +
    t(x + w / 2, y + 34, label, { size: 20, anchor: "middle", fill: on ? WHITE : NAVY, weight: "700" });
}
// row of selectable chips starting at x; returns svg
function chipRow(x, y, labels, activeIdx) {
  let s = "", cx = x;
  labels.forEach((lab, i) => { s += chip(cx, y, lab, i === activeIdx); cx += chipW(lab) + 14; });
  return s;
}
function row(x, y, w, label, o = {}) {
  let s = t(x, y + 38, label, { size: 22, weight: o.strong ? "700" : "600", fill: o.danger ? "#B23B3B" : NAVY });
  if (o.value) s += t(x + w - 52, y + 38, o.value, { size: 20, anchor: "end", fill: MUTED });
  if (!o.noChevron) s += t(x + w - 8, y + 40, "›", { size: 34, anchor: "end", fill: "#b8b6ad" });
  s += `<line x1="${x}" y1="${y + 66}" x2="${x + w}" y2="${y + 66}" stroke="${LINE}" stroke-width="1.5"/>`;
  return s;
}
// v2 rollout: both shells render the floating iconized bar (Inbox dropped Phase 2; Sagip in Home)
function bottomnav(active) { return v2nav(active); }

// ---------- Screen 1: Welcome ----------
// logo = { uri, w, h } for the real kupkop_logo.PNG (trimmed).
// paw  = { uri } for paws.jpg recolored white-on-transparent.
function welcome(logo, paw) {
  // teal → forest gradient hero, cream card at bottom
  let s = `<defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${TEAL}"/><stop offset="1" stop-color="${FOREST}"/></linearGradient></defs>`;
  s += `<rect width="${SW}" height="${SH}" fill="url(#wg)"/>` + statusbar(true);

  // soft paw watermarks — real paws.jpg, low opacity, rotated
  const bgPaw = (x, y, sz, rot) => `<image href="${paw.uri}" x="${x}" y="${y}" width="${sz}" height="${sz}" transform="rotate(${rot} ${x + sz / 2} ${y + sz / 2})"/>`;
  s += `<g opacity="0.09">` + bgPaw(16, 200, 132, -18) + bgPaw(430, 150, 96, 14) + bgPaw(410, 452, 120, 8) + `</g>`;

  // brand lockup — real logo (includes the wordmark) on a white card
  const drawW = 206, drawH = Math.round(drawW * logo.h / logo.w), pad = 34;
  const cardW = drawW + pad * 2, cardX = (SW - cardW) / 2, cardY = 124, cardH = drawH + pad * 2;
  s += rrect(cardX, cardY, cardW, cardH, 36, WHITE);
  s += `<image href="${logo.uri}" x="${cardX + pad}" y="${cardY + pad}" width="${drawW}" height="${drawH}"/>`;
  s += t(270, cardY + cardH + 44, "Kupkop. Kalinga. Kinabukasan.", { size: 21, anchor: "middle", fill: "#cfe6e2" });
  s += t(270, cardY + cardH + 74, "The app made for Filipino fur parents.", { size: 19, anchor: "middle", weight: "700", fill: WHITE });

  // value props — indented with a left margin, paw bullets
  const props = ["Spot a stray? Help’s a tap away.", "Meet your forever furry friend.", "Every peso reaches the shelter."];
  const bx = 74, tx = 116, y0 = 560, step = 56;
  const pawSz = 38;
  props.forEach((label, i) => {
    const y = y0 + i * step;
    s += `<image href="${paw.uri}" x="${bx - pawSz / 2}" y="${y - 8 - pawSz / 2}" width="${pawSz}" height="${pawSz}"/>`;
    s += t(tx, y, label, { size: 21, fill: "#eaf4f2" });
  });

  // bottom cream action card — raised to fit "Browse as a guest" as a first-class entry (guest
  // browsing is now the low-friction default: land, look around, sign up only on an action)
  const cy = 716;
  s += rrect(0, cy, SW, SH - cy, 0, CREAM);
  s += rrect(0, cy, SW, 44, 0, CREAM);
  s += `<rect x="34" y="${cy + 42}" width="472" height="68" rx="34" fill="url(#v2btn)" filter="url(#v2soft)"/>` + t(270, cy + 85, "Get started", { size: 24, anchor: "middle", fill: WHITE, weight: "700" });
  // prominent, not buried — the friend-shared-a-stray-link visitor should see this immediately
  s += rrect(34, cy + 124, 472, 64, 32, WHITE, LINE) + t(270, cy + 164, "Browse as a guest", { size: 20, anchor: "middle", fill: TEALDK, weight: "700" });
  s += t(270, cy + 236, "or continue with", { size: 16, anchor: "middle", fill: "#9a988f" });
  s += providerRow(34, cy + 254, 472, ["google", "apple"]);
  s += t(270, cy + 356, "Already have an account?  Log in", { size: 19, anchor: "middle", fill: MUTED });
  s += t(270, cy + 396, "By continuing you agree to our Terms &amp; Privacy.", { size: 15, anchor: "middle", fill: "#9a988f" });
  return s;
}

// ---------- Screen 3: Sign up ----------
// opts.shelter → the shelter variant. The form depends on the account type picked in step 1:
// a shelter account IS the org (shelter_profile is 1:1 with account), so this screen creates the
// admin's login and its name feeds shelter-setup's "Contact person"; org details come next.
function signup(opts = {}) {
  const shelter = !!opts.shelter;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + statusbar(false);

  // top bar + progress (step 2 of 3: type → account → verify)
  s += topbar(shelter ? "Create shelter account" : "Create account") + (shelter ? steps4(1) : steps(1));

  s += t(34, 168, shelter ? "Create your shelter account" : "Let’s get you set up", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 202, shelter ? "Your login first — org details come next." : "A few details and you’re in.", { size: 19, fill: MUTED });

  // opts.errors → the validation reference render. Three DIFFERENT failure classes in one screen —
  // format, already-taken, and strength — because they are the three a dev has to handle differently:
  // format is client-side and instant, taken is only knowable server-side on submit, and strength is
  // client-side but must be re-checked server-side (§12.1). A valid first field keeps the contrast.
  //
  // ⚠️ "This email already has an account" is safe to say HERE and nowhere else. Signup must reveal a
  // collision or the user cannot proceed; `signin` and `forgot-password` must stay generic or they
  // become account-enumeration oracles (§12.1). See dev/onboarding-validation.md.
  // opts.errors → the validation reference render. Three DIFFERENT failure classes in one screen,
  // because a dev handles each differently: REQUIRED is client-side and instant, ALREADY-TAKEN is
  // only knowable server-side on submit, and STRENGTH is client-side but must be re-checked on the
  // server (§12.1). A format error (malformed address) uses the same treatment as the first.
  //
  // ⚠️ "This email already has an account" is safe to say HERE and nowhere else. Signup must reveal a
  // collision or the user cannot proceed; `signin`, `forgot-password` and `verify-phone` must stay
  // generic or they become account-enumeration oracles (§12.1). See dev/onboarding-validation.md.
  if (opts.errors) {
    s += field(34, 250, 472, shelter ? "Your name" : "Full name", "", { error: "Enter your name." });
    s += field(34, 406, 472, shelter ? "Organization email" : "Email", shelter ? "hello@pawsmanila.org" : "ana@email.com",
      { error: "This email already has an account. Log in instead." });
    s += field(34, 562, 472, "Password", "••••••", { eye: true, error: "At least 8 characters, including a number." });

    s += t(34, 730, "Fix the fields above to continue.", { size: 16, fill: MUTED });
    // the CTA stays enabled — a disabled button gives no reason and nothing to tap for feedback
    s += rrect(34, 770, 472, 68, 34, TEAL) + t(270, 813, "Send code", { size: 24, anchor: "middle", fill: WHITE, weight: "700" });
    s += t(270, 908, "Already have an account?  Log in", { size: 20, anchor: "middle", fill: TEAL, weight: "700" });
    return s;
  }

  // ⚠️ NO mobile field (decision 14). Email is the identifier; a phone number is a verified
  // attribute captured at first use — `verify-phone` for owners, `shelter-setup-contact` for
  // shelters. Asking for it here is what made "one-tap" social signup a form.
  s += field(34, 250, 472, shelter ? "Your name" : "Full name", shelter ? "Maria Santos" : "Ana Reyes");
  s += field(34, 372, 472, shelter ? "Organization email" : "Email", shelter ? "hello@pawsmanila.org" : "ana@email.com");
  s += field(34, 494, 472, "Password", "••••••••", { eye: true });

  // helper
  s += t(34, 620, shelter ? "We’ll email a 6-digit code to your org address." : "We’ll email you a 6-digit code to verify it.",
    { size: 17, fill: MUTED });

  // primary CTA
  s += rrect(34, 678, 472, 68, 34, TEAL) + t(270, 721, "Send code", { size: 24, anchor: "middle", fill: WHITE, weight: "700" });

  // divider
  s += `<line x1="34" y1="790" x2="176" y2="790" stroke="${LINE}" stroke-width="1.5"/>` +
       t(270, 796, "or sign up with", { size: 17, anchor: "middle", fill: MUTED }) +
       `<line x1="364" y1="790" x2="506" y2="790" stroke="${LINE}" stroke-width="1.5"/>`;
  s += providerRow(34, 826, 472, ["google", "apple"]);

  s += t(270, 940, "Already have an account?  Log in", { size: 20, anchor: "middle", fill: TEAL, weight: "700" });
  // gap 7 — `welcome` and `signin` both carry this line; the screen that actually CREATES the record
  // did not. Under RA 10173 consent is cheapest to place where the record is made, not one screen back.
  s += t(270, 1000, "By creating an account you agree to our", { size: 14, anchor: "middle", fill: "#9a988f" });
  s += t(270, 1024, "Terms &amp; Privacy Policy.", { size: 14, anchor: "middle", fill: "#9a988f" });
  return s;
}

// ---------- Screen 3b: Sign up with Google — the one field Google can't give us ----------
// Google returns name + email (→ account_identity), so the form collapses from 4 fields +
// password to ONE: the mobile number. It can't be skipped — SMS OTP needs a target, and with
// in-app chat at Phase 2 the phone IS how shelters reach a member. Then → the normal OTP screen.
// opts.shelter → Google hands back a PERSONAL Gmail, but an org needs its own public address
// (DP §6.4 contact group). So the shelter variant can't collapse to one field: mobile + org email.
// ⚠️ SHELTER ONLY (decision 14). The owner variant was DELETED, not hidden: with email as the
// identifier, a provider supplies everything an owner account needs — name and a verified address —
// so there is no form left to render. A Google owner goes provider → account-type-google → home,
// with `email_verified_at` set from the provider's assertion and no code sent. That is the whole
// point of the change; keeping a one-field screen "just in case" would quietly undo it.
//
// A shelter still lands here because the ORG email is not the personal Google address, and the
// public-facing one is what adopters and reviewers see. Their phone comes later, on
// shelter-setup-contact — the only place a shelter number is actually needed.
function signupGoogle(opts = {}) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + statusbar(false);
  s += topbar("Create shelter account") + steps4(1);

  s += t(34, 168, "One more thing", { size: 30, weight: "800", fill: V2INK });
  s += t(34, 202, "We’ve got your details from Google.", { size: 19, fill: MUTED });

  // what Google shared — shown, not hidden, so the import is visible before they commit
  s += rrect(34, 250, 472, 104, 20, WHITE, LINE);
  s += avq(86, 302, 32) + t(86, 311, "MS", { size: 22, anchor: "middle", weight: "700", fill: TEAL });
  s += t(136, 294, "Maria Santos", { size: 21, weight: "800", fill: V2INK });
  s += t(136, 322, "maria.santos@gmail.com", { size: 15, fill: MUTED });
  s += rrect(410, 288, 76, 28, 14, SOFT) + t(448, 307, "Google", { size: 13, anchor: "middle", fill: TEAL, weight: "700" });
  s += `<circle cx="52" cy="386" r="9" fill="${OKBG}"/>` +
    `<polyline points="48,386 51,389 56,382" fill="none" stroke="${OK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(70, 391, "Already verified by Google — no code needed.", { size: 13.5, fill: MUTED });

  // the personal Gmail sits directly above, which is what makes the distinction obvious
  s += field(34, 430, 472, "Organization email", "hello@pawsmanila.org");
  s += t(34, 534, "Your org’s public email — not your personal Gmail.", { size: 13, fill: MUTED });

  s += btn(600, "Continue");
  s += t(270, 730, "Use a different Google account", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

function signIn() { return signInV2(); }
function signInV1_unused() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Log in");

  // brand moment
  s += `<circle cx="270" cy="200" r="52" fill="${SOFT}"/>` + pawmark(270, 204, 30, TEAL);
  s += t(270, 300, "Welcome back", { size: 30, anchor: "middle", weight: "700", fill: NAVY });
  s += t(270, 336, "Log in to keep helping.", { size: 20, anchor: "middle", fill: MUTED });

  s += field(34, 392, 472, "Mobile number", "917 123 4567", { prefix: "+63" });
  s += field(34, 514, 472, "Password", "••••••••", { eye: true });
  s += t(506, 636, "Forgot password?", { size: 18, anchor: "end", fill: TEAL, weight: "700" });

  s += btn(688, "Log in");

  s += `<line x1="34" y1="812" x2="240" y2="812" stroke="${LINE}" stroke-width="1.5"/>` +
       t(270, 818, "or", { size: 18, anchor: "middle", fill: MUTED }) +
       `<line x1="300" y1="812" x2="506" y2="812" stroke="${LINE}" stroke-width="1.5"/>`;
  s += btnOutline(848, "Continue with Google");

  s += t(270, 986, "New to Kupkop?  Create account", { size: 20, anchor: "middle", fill: TEAL, weight: "700" });
  s += t(270, 1040, "By continuing you agree to our Terms &amp; Privacy.", { size: 16, anchor: "middle", fill: "#9a988f" });
  return s;
}

// ---------- Location: permission ask (first-run, or when a location feature is first tapped) ----------
// How we determine location: device GPS (this permission) → resolved to an APPROXIMATE city and
// stored as that (never precise coords, per the privacy stance) → manual city fallback. Every
// "near you" / "X km away" on the app derives from this.
const bigPin = (cx, cy, c, hole) => `<path d="M${cx} ${cy + 34} c-26 -32 -26 -56 0 -56 c26 0 26 24 0 56 z" fill="${c}"/>` + `<circle cx="${cx}" cy="${cy - 8}" r="10" fill="${hole}"/>`;
function locationPermission() {
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false) + v2back();
  s += v2squircle(270, 206, 120, "url(#v2hero)", 38) + bigPin(270, 200, WHITE, TEALDK);
  s += t(270, 322, "Find help near you", { size: 30, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 360, "Kupkop uses your location to show what's", { size: 16, anchor: "middle", fill: MUTED });
  s += t(270, 384, "nearby — strays, adoptable pets, shelters.", { size: 16, anchor: "middle", fill: MUTED });

  s += v2card(34, 426, 472, 202, 22);
  [["pin", "Stray reports near you", "#E2EEF0", TEALDK], ["heart", "Adoptable pets close by", SOFT, TEAL], ["building", "How far each shelter is", "#ECEBF6", "#5b53a6"]].forEach(([ic, lab, bg, fg], i) => {
    const y = 462 + i * 60;
    s += avq(72, y, 22, bg);
    if (ic === "pin") s += pinIcon(72, y - 2, fg);
    else if (ic === "heart") s += heartIcon(72, y, 24, fg);
    else s += buildingIcon(72, y, 22, fg, bg);
    s += t(116, y + 6, lab, { size: 17, weight: "700", fill: V2INK });
  });

  // privacy — matters here: approximate, city-only
  s += `<rect x="34" y="652" width="472" height="66" rx="16" fill="${SOFT}"/>`;
  s += glyphShield(72, 685, TEALDK);
  s += t(104, 680, "Only your city is saved", { size: 14.5, weight: "800", fill: TEALDK });
  s += t(104, 702, "Never your exact location.", { size: 13, fill: MUTED });

  s += btn(770, "Allow location");
  s += t(270, 898, "Enter it manually", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}
const glyphShield = (cx, cy, c) => `<path d="M${cx} ${cy - 13} l11 4 v7 c0 7 -5 10 -11 12 c-6 -2 -11 -5 -11 -12 v-7 z" fill="none" stroke="${c}" stroke-width="2.4"/>` + `<polyline points="${cx - 5},${cy} ${cx - 1},${cy + 4} ${cx + 6},${cy - 5}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;

// ---------- Location: manual picker (change location · GPS fallback) ----------
function locationPicker() {
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + topbar("Your location");
  // GPS shortcut
  s += `<rect x="34" y="146" width="472" height="66" rx="20" fill="${WHITE}" filter="url(#v2soft)"/>`;
  s += avq(74, 179, 20, "#E2EEF0") + pinIcon(74, 177, TEALDK);
  s += t(116, 185, "Use my current location", { size: 17, weight: "800", fill: TEAL });
  s += t(486, 185, "›", { size: 22, anchor: "end", fill: "#b8b6ad" });
  // search
  s += `<rect x="34" y="230" width="472" height="60" rx="30" fill="${WHITE}" filter="url(#v2soft)"/>`;
  s += magnifyIcon(70, 260, MUTED) + t(96, 267, "Search city or barangay", { size: 16, fill: "#9a988f" });

  s += t(34, 344, "METRO MANILA", { size: 12.5, weight: "800", ls: 1, fill: "#a9adaa" });
  const cities = [["Marikina City", true], ["Quezon City", false], ["Manila", false], ["Pasig City", false], ["Mandaluyong", false], ["Makati", false]];
  s += v2card(34, 362, 472, cities.length * 66 + 8, 22);
  cities.forEach(([name, on], i) => {
    const y = 362 + 20 + i * 66;
    if (i) s += `<line x1="70" y1="${y - 13}" x2="472" y2="${y - 13}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += pinIcon(70, y + 12, on ? TEAL : "#c9cec7");
    s += t(104, y + 20, name, { size: 17, weight: on ? "800" : "600", fill: on ? V2INK : NAVY });
    if (on) s += `<circle cx="474" cy="${y + 12}" r="14" fill="url(#v2btn)"/>` + `<polyline points="468,${y + 12} 472,${y + 16} 480,${y + 7}" fill="none" stroke="${WHITE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    else s += `<circle cx="474" cy="${y + 12}" r="13" fill="none" stroke="#d4d8d2" stroke-width="2"/>`;
  });
  s += t(270, 820, "Only your city is saved — used to show what's near you.", { size: 13, anchor: "middle", fill: "#a9adaa" });
  return s;
}

// ---------- Screen 2c: Forgot password (target of "Forgot password?" on Log in) ----------
function forgotPassword() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Forgot password");

  s += `<circle cx="270" cy="200" r="52" fill="${SOFT}"/>` + lockIcon(270, 198, 46, TEAL);
  s += t(270, 300, "Forgot your password?", { size: 30, anchor: "middle", weight: "700", fill: NAVY });
  s += t(270, 342, "No worries — we’ll email you a code", { size: 20, anchor: "middle", fill: MUTED });
  s += t(270, 372, "to reset it.", { size: 20, anchor: "middle", fill: MUTED });

  s += field(34, 430, 472, "Email", "ana@email.com");
  s += t(34, 556, "Use the email you signed up with.", { size: 17, fill: MUTED });

  s += btn(620, "Send code");
  s += t(270, 748, "Remembered it?  Log in", { size: 20, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Screen 2d: Set a new password (after the reset code is verified) ----------
function resetPassword() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Reset password");
  s += t(34, 168, "Create a new password", { size: 30, weight: "800", fill: V2INK });
  s += t(34, 204, "Make it something you’ll remember.", { size: 20, fill: MUTED });

  s += field(34, 258, 472, "New password", "••••••••", { eye: true });
  s += field(34, 380, 472, "Confirm new password", "••••••••", { eye: true });

  // requirement checklist
  const req = (y, label) => `<circle cx="47" cy="${y - 6}" r="13" fill="${OKBG}"/>` +
    `<polyline points="41,${y - 6} 45,${y - 1} 53,${y - 12}" fill="none" stroke="${OK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` +
    t(74, y, label, { size: 17, fill: MUTED });
  s += req(512, "At least 8 characters");
  s += req(552, "One number or symbol");

  s += btn(640, "Save new password");
  s += t(270, 768, "Back to log in", { size: 20, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Screen 2e: Password changed (terminal success — no back arrow) ----------
function passwordChanged() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + statusbar(false);

  // success check
  s += `<circle cx="270" cy="320" r="70" fill="${OKBG}"/>`;
  s += `<polyline points="238,320 262,346 306,296" fill="none" stroke="${OK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(270, 462, "Password changed", { size: 30, anchor: "middle", weight: "700", fill: NAVY });
  s += t(270, 504, "Log in with your new password.", { size: 18, anchor: "middle", fill: MUTED });

  // security note
  s += rrect(34, 566, 472, 96, 20, WHITE, LINE);
  s += avq(86, 614, 30) + lockIcon(86, 613, 28, TEAL);
  s += t(134, 606, "Signed out everywhere else", { size: 18, weight: "700", fill: NAVY });
  s += t(134, 634, "For your security, other devices were logged out.", { size: 15, fill: MUTED });

  s += btn(742, "Log in");
  s += t(270, 868, "Need help?  Contact support", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// primary / outline buttons (full-width)
const btn = (y, label) => `<rect x="34" y="${y}" width="472" height="68" rx="34" fill="url(#v2btn)" filter="url(#v2soft)"/>` + t(270, y + 43, label, { size: 23, anchor: "middle", fill: WHITE, weight: "700" });
const btnOutline = (y, label) => `<rect x="34" y="${y}" width="472" height="64" rx="32" fill="${WHITE}" filter="url(#v2soft)"/>` + t(270, y + 40, label, { size: 19, anchor: "middle", fill: V2INK, weight: "700" });
// v2 danger button — a filled gradient pill (destructive primary), and a tinted-outline variant for
// the softer "cancel activity from the list" case. Both take explicit x/w so modals can size them.
const dbtn = (x, y, w, label, size = 22) => `<rect x="${x}" y="${y}" width="${w}" height="68" rx="34" fill="url(#v2danger)" filter="url(#v2soft)"/>` + t(x + w / 2, y + 43, label, { size, anchor: "middle", fill: WHITE, weight: "700" });
const dbtnOutline = (x, y, w, label, size = 21) => `<rect x="${x}" y="${y}" width="${w}" height="64" rx="32" fill="#FBEEEC" filter="url(#v2soft)"/>` + t(x + w / 2, y + 40, label, { size, anchor: "middle", fill: DANGER, weight: "700" });
const pawIcon = (uri, cx, cy, sz) => `<image href="${uri}" x="${cx - sz / 2}" y="${cy - sz / 2}" width="${sz}" height="${sz}"/>`;

// ---------- Verify phone — owner, at FIRST USE (decision 14) ----------
// Not part of signup. Triggered the first time an owner reaches something needing a reachable
// number: an adoption inquiry, a Kawang-Gawa shift, an offer on a stray, a claim, or a direct
// placement. A browsing user never sees it, which is where the SMS saving actually comes from.
//
// ⚠️ The screen leads with WHAT THEY WERE DOING, not with the ask. Someone who tapped "Send inquiry"
// did not come here to hand over a phone number, and an unexplained field at that moment reads as a
// toll gate. The reason is concrete and checkable: in-app messaging is Phase 2 (decision 6), so the
// shelter literally has to phone them.
function verifyPhone(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Add your number");

  // the thing they were in the middle of
  s += rrect(34, 148, 472, 88, 20, WHITE, LINE);
  s += avq(80, 192, 28) + pawIcon(paws.teal.uri, 80, 192, 30);
  s += t(126, 184, "Inquiry about Milo", { size: 19, weight: "800", fill: V2INK });
  s += t(126, 212, "PAWS Manila · ready to send", { size: 14.5, fill: MUTED });

  s += `<circle cx="270" cy="330" r="58" fill="${SOFT}"/>` + phoneIcon(270, 330, TEALDK);
  s += t(270, 438, "Add your mobile number", { size: 28, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 476, "One time — then it’s on your account.", { size: 17, anchor: "middle", fill: MUTED });

  s += field(34, 520, 472, "Mobile number", "917 123 4567", { prefix: "+63" });
  s += t(34, 628, "We’ll text a 6-digit code to verify it.", { size: 13.5, fill: MUTED });

  // why — concrete, not a policy sentence
  s += rrect(34, 668, 472, 118, 20, "#eaf4f2");
  s += `<circle cx="76" cy="710" r="17" fill="${TEAL}"/>` + personIcon(76, 710, 20, WHITE);
  s += t(106, 704, "Why we need it", { size: 15.5, weight: "700", fill: TEALDK });
  s += t(58, 744, "Kupkop has no in-app chat yet, so PAWS Manila", { size: 14, fill: MUTED });
  s += t(58, 768, "will call or text you about Milo.", { size: 14, fill: MUTED });

  s += btn(824, "Send code");

  // the privacy answer to the question the ask provokes
  s += t(270, 942, "Shared only when you choose — per inquiry or shift.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  s += t(270, 970, "Never shown on your public profile.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Owner success moment, post-verification (gap 3 / open question 5) ----------
// A shelter gets `shelter-verify-pending` as a "what happens next" beat; the owner previously landed
// on `home` with no acknowledgement that anything completed. This is that beat.
//
// ⚠️ It deliberately does NOT say "add your first pet". Kupkop's owners are not all pet owners — a
// large share arrive to adopt or to report strays, and a screen that assumes a pet tells those people
// the app isn't for them in the first thirty seconds. Three self-selecting doors instead of one
// assumption, and skipping is a peer option rather than a grey afterthought.
//
// This also gives `add-pet` its first onboarding entry point — until now it was reachable only from
// the profile — without forcing it on anyone.
function signupSuccess(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + statusbar(false);

  s += `<circle cx="270" cy="208" r="66" fill="#eaf3de"/>`;
  s += `<polyline points="240,208 262,230 300,188" fill="none" stroke="${OK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(270, 322, "You\u2019re in, Ana", { size: 32, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 360, "Your email is verified.", { size: 18, anchor: "middle", fill: MUTED });

  // \u26a0\ufe0f NOT an action menu (was "What would you like to do first?"). Two of those doors — adopt,
  // claim a rescue — need the Verified Member badge the owner doesn't have yet, so offering them as
  // one-tap actions sets up a wall the instant they tap. This screen INTRODUCES the features instead,
  // and the badge-gated ones say so up front, so the wall is expected, not a surprise. "Start
  // exploring" goes to Home, where verification is prompted where it's actually needed.
  s += t(34, 438, "Here\u2019s what you can do", { size: 20, weight: "800", fill: V2INK });

  const feats = [
    ["adopt", "Adopt a pet", "Give a rescue a loving home", true],
    ["rescue", "Report &amp; rescue strays", "Sagip \u2014 spot a stray, get it help", true],
    ["volunteer", "Volunteer with shelters", "Kawang-Gawa \u2014 walk, feed, lend a hand", false],
  ];
  feats.forEach(([kind, title, sub, gated], i) => {
    const y = 468 + i * 100;
    s += rrect(34, y, 472, 84, 20, WHITE, LINE);
    s += avq(84, y + 42, 28, SOFT);
    if (kind === "adopt") s += homeHeartIcon(84, y + 42, 32, TEALDK);
    else if (kind === "rescue") s += pinIcon(84, y + 42, TEALDK);
    else s += pawIcon(paws.teal.uri, 84, y + 42, 30);
    s += t(130, y + 38, title, { size: 19, weight: "800", fill: V2INK });
    s += t(130, y + 64, sub, { size: 14, fill: MUTED });
    // the honest gate marker — these two need the badge, so flag it HERE, not at the tap
    if (gated) s += rrect(412, y + 26, 76, 30, 15, WARNBG) + t(450, y + 46, "Verify", { size: 12.5, anchor: "middle", fill: WARN2, weight: "700" });
  });

  s += rrect(34, 780, 472, 78, 16, "#eaf4f2");
  s += verified(70, 819, 15);
  s += t(100, 812, "Adopting &amp; rescuing need a quick check", { size: 14, fill: TEALDK, weight: "700" });
  s += t(100, 836, "One ID + a social link. Do it anytime from You.", { size: 13, fill: MUTED });

  s += btn(896, "Start exploring");
  return s;
}

// ---------- Social provider buttons ----------
// ⚠️ Apple is not a product choice on iOS. App Store guideline 4.8 requires an app offering a
// third-party login to also offer a privacy-preserving equivalent, and Sign in with Apple is what
// satisfies it — the "we use our own accounts" exemption doesn't apply once Google is on the screen.
// It also fits the email-identifier model for free: Apple ALWAYS returns an address (real or relay),
// so it needs no fallback path.
//
// Facebook is deliberately absent (Phase 2). Not for lack of demand — it's likely this audience's
// main provider — but because Facebook can return **no email** for an account registered by phone or
// where the permission is declined, and with `account.email` NOT NULL that user simply cannot sign
// up. It needs a "we still need your email" fallback screen plus Meta business verification. Adding
// it later is purely additive (a new `account_identity` row), so it costs nothing to wait.
//
// ⚠️ The Apple mark here is a hand-drawn approximation for the mock. Sign in with Apple has binding
// brand requirements (official asset, permitted label text, minimum size) — use Apple's supplied
// button at build time, do not trace this.
const googleGlyph = (cx, cy, r = 13) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SOFT}"/>` +
  t(cx, cy + 6, "G", { size: 16, anchor: "middle", weight: "800", fill: TEAL });
const appleGlyph = (cx, cy, sz = 26, c = V2INK) =>
  `<path d="M${cx} ${cy - sz * 0.20} c ${-sz * 0.30} 0 ${-sz * 0.42} ${sz * 0.22} ${-sz * 0.34} ${sz * 0.46} c ${sz * 0.05} ${sz * 0.20} ${sz * 0.20} ${sz * 0.32} ${sz * 0.34} ${sz * 0.32} c ${sz * 0.14} 0 ${sz * 0.29} ${-sz * 0.12} ${sz * 0.34} ${-sz * 0.32} c ${sz * 0.08} ${-sz * 0.24} ${-sz * 0.04} ${-sz * 0.46} ${-sz * 0.34} ${-sz * 0.46} z" fill="${c}"/>` +
  `<path d="M${cx + sz * 0.03} ${cy - sz * 0.22} c ${sz * 0.02} ${-sz * 0.13} ${sz * 0.12} ${-sz * 0.21} ${sz * 0.19} ${-sz * 0.22} c ${sz * 0.01} ${sz * 0.12} ${-sz * 0.08} ${sz * 0.21} ${-sz * 0.19} ${sz * 0.22} z" fill="${c}"/>`;

// Takes a LIST so a third provider is one array entry, not a third layout: 2 → labelled buttons,
// 3 → glyph-only (labels stop fitting three across at this width).
const PROVIDERS = { google: [googleGlyph, "Google"], apple: [appleGlyph, "Apple"], facebook: [null, "Facebook"] };
function providerRow(x, y, w, keys, h = 64) {
  const n = keys.length, gap = 12, bw = (w - gap * (n - 1)) / n, labelled = n <= 2;
  let s = "";
  keys.forEach((k, i) => {
    const [glyph, label] = PROVIDERS[k];
    const bx = x + i * (bw + gap), cx = bx + bw / 2, cy = y + h / 2;
    s += rrect(bx, y, bw, h, h / 2, WHITE, LINE);
    if (!labelled) { s += glyph(cx, cy); return; }
    const tw = label.length * 10.5, total = 26 + 12 + tw, gx = cx - total / 2 + 13;
    s += glyph(gx, cy);
    s += t(gx + 25, cy + 7, label, { size: 18, weight: "700", fill: V2INK });
  });
  return s;
}

// ---------- Screen 3: OTP verify ----------
// opts.reset → same code entry, reused by the forgot-password flow (no signup stepper)
// ONE screen, three uses (decision 14): verify-email at signup · verify-phone at first use · reset.
// Only the channel line and the topbar differ — the digit mechanic, throttling and attempt cap are
// identical, so duplicating it into three screens would just create three places to drift.
// opts.sms → SMS channel (the phone-verification step). Default is the email channel.
function otp(opts = {}) {
  const reset = !!opts.reset, sms = !!opts.sms, unverified = !!opts.unverified, locked = !!opts.locked;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` +
    topbar(reset ? "Reset password" : sms ? "Verify your number" : "Verify your email") +
    (reset || sms || unverified ? "" : steps(2));

  // ⚠️ opts.unverified — the sign-in block (gap 6). Signup creates the account and THEN sends a code,
  // so a user who closes the app mid-flow has a real account with `email_verified_at = NULL`. Without
  // this state they sign in with correct credentials and the app has nowhere to put them: the same
  // shape as the shelter dashboard rendering "Under review" over files it never received.
  // Policy is BLOCK AT SIGN-IN for owners, not a degraded shell — unlike a shelter, an unverified
  // owner has nothing to prepare, so a browse-only mode buys nothing and adds a state to maintain.
  // The strip explains WHY they are looking at a code screen instead of home; without it this reads
  // as the app having forgotten they already signed up.
  const dy = unverified ? 72 : 0;
  if (unverified) {
    s += `<rect x="34" y="140" width="472" height="76" rx="18" fill="${WARNBG}"/>`;
    s += alertIcon(70, 178, 16, WARN2);
    s += t(100, 172, "Your email isn’t verified yet", { size: 15, fill: WARN2, weight: "700" });
    s += t(100, 196, "Finish this and you’re into your account.", { size: 13.5, fill: WARN });
  }
  s += t(34, 168 + dy, "Enter the code", { size: 30, weight: "800", fill: V2INK });
  s += t(34, 204 + dy, sms ? "We sent a 6-digit code to" : unverified ? "We emailed a new code to" : "We emailed a 6-digit code to",
    { size: 20, fill: MUTED });
  s += t(34, 240 + dy, sms ? "+63 917 123 4567" : "ana@email.com", { size: 22, weight: "800", fill: V2INK });

  // opts.error → wrong code · opts.locked → attempts exhausted, the code is dead (gap 8).
  // Both put the WHOLE group in danger, not one box: six digits are entered as one act and we can't
  // say which was wrong, so marking a single box would be a guess.
  const bad = !!opts.error || locked;
  const digits = bad ? ["4", "2", "1", "9", "0", "3"] : ["4", "2", "1", "", "", ""];
  const bw = 66, bh = 82, gap = 14;
  const sx = (SW - (6 * bw + 5 * gap)) / 2, by = 300 + dy;
  digits.forEach((d, i) => {
    const x = sx + i * (bw + gap), cur = !bad && i === 3;
    s += rrect(x, by, bw, bh, 16, WHITE, bad ? DANGER : cur ? TEAL : LINE);
    if (bad) s += `<rect x="${x}" y="${by}" width="${bw}" height="${bh}" rx="16" fill="none" stroke="${DANGER}" stroke-width="2.5"/>`;
    if (d) s += t(x + bw / 2, by + 54, d, { size: 34, anchor: "middle", weight: "700", fill: bad ? DANGER : locked ? "#c9928f" : NAVY });
    else if (cur) s += `<rect x="${x + bw / 2 - 1}" y="${by + 22}" width="2" height="38" fill="${TEAL}"/>`;
  });

  if (locked) {
    // ⚠️ The dead code is still shown, greyed — clearing the boxes would look like a glitch and
    // invite re-typing the same digits. The PRIMARY action flips to "Send a new code": leaving
    // "Verify" as the button would be a control that cannot succeed, which is how a user concludes
    // the app is broken and abandons the account entirely.
    s += `<rect x="34" y="410" width="472" height="96" rx="18" fill="${DANGERBG}"/>`;
    s += alertIcon(70, 458, 16, DANGER);
    s += t(100, 444, "Too many tries — this code is dead", { size: 15.5, fill: DANGER, weight: "700" });
    s += t(100, 468, "You used all 5 attempts. Nothing is wrong with", { size: 13.5, fill: "#8A3B3B" });
    s += t(100, 490, "your account — you just need a fresh code.", { size: 13.5, fill: "#8A3B3B" });

    s += btn(548, "Send a new code");
    // the honest limit, so a user who is also rate-limited isn't left tapping a button that no-ops
    s += t(270, 668, "You can request 5 codes an hour.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
    s += t(270, 730, sms ? "Wrong number?  Change it" : "Wrong email?  Change it", { size: 20, anchor: "middle", fill: TEAL, weight: "700" });
    return s;
  }

  if (bad) {
    // ⚠️ The attempt counter is shown on purpose. §12.1 caps a code at 5 attempts and then burns it;
    // silently invalidating on the 5th try reads as "the app is broken", and the user re-requests
    // codes forever. Saying how many are left is not a security leak — the attacker already knows
    // the limit, and the honest count is what stops a legitimate user from being confused by it.
    s += alertIcon(148, 424, 13, DANGER);
    s += t(174, 430, "That code isn't right — 3 attempts left.", { size: 16.5, fill: DANGER, weight: "700" });
    s += t(270, 476, "Didn’t get a code?", { size: 19, anchor: "middle", fill: MUTED });
    s += t(270, 510, "Send a new code", { size: 19, anchor: "middle", fill: TEAL, weight: "700" });
    s += btn(576, "Verify");
    s += t(270, 706, sms ? "Wrong number?  Change it" : "Wrong email?  Change it", { size: 20, anchor: "middle", fill: TEAL, weight: "700" });
    return s;
  }

  s += t(270, 448 + dy, "Didn’t get a code?", { size: 19, anchor: "middle", fill: MUTED });
  s += t(270, 482 + dy, "Resend in 0:59", { size: 19, anchor: "middle", fill: "#b8b6ad", weight: "700" });
  s += btn(560 + dy, "Verify");
  s += t(270, 690 + dy, sms ? "Wrong number?  Change it" : "Wrong email?  Change it", { size: 20, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Screen 2: Choose account type (FIRST step — the signup form depends on it) ----------
// Stepper: type (0) → account (1) → verify (2).
// opts.google → the Google entry point. "Continue with Google" on welcome authenticates FIRST,
// then lands here with the identity carried (chip below) — the type must be chosen before the
// type-specific Google forms (signup-google / -google-shelter) can render.
function accountType(paws, opts = {}) {
  const google = !!opts.google;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Choose account type") + steps(0);
  s += t(34, 168, "How will you join?", { size: 30, weight: "800", fill: V2INK });
  s += t(34, 204, "This sets up the right account — you can get verified anytime.", { size: 17, fill: MUTED });

  if (google) {
    s += rrect(34, 230, 472, 52, 16, WHITE, LINE);
    s += `<circle cx="66" cy="256" r="14" fill="${SOFT}"/>` + t(66, 262, "G", { size: 16, anchor: "middle", weight: "700", fill: TEAL });
    s += t(92, 262, "ana.reyes@gmail.com", { size: 15, fill: NAVY, weight: "600" });
    s += t(486, 262, "from Google", { size: 13, anchor: "end", fill: "#b8b6ad" });
  }
  const y0 = google ? 306 : 262;

  // The dividing line is DONATIONS + VOLUNTEERS, not "do you rescue?" — everyone answering this
  // screen rescues, so framing the choice around rescuing made it undecidable: a person who takes
  // strays in at home saw themselves in both cards and only found out they picked wrong once the
  // forms diverged (and account_type is chosen FIRST, so it's expensive to get wrong).
  // Both cards can rescue and rehome; only the shelter account can take money and host people at
  // its address, which is exactly what the extra tier-1 documents (billing proof, space photos) gate.
  const cards = [
    ["owner", "Pet Owner", ["Adopt, report strays, and rehome", "animals you rescue yourself."], true],
    ["shelter", "Shelter / Organization", ["List animals, receive donations,", "and host volunteers."], false],
  ];
  cards.forEach(([kind, title, desc, on], i) => {
    const y = y0 + i * 224;
    s += rrect(34, y, 472, 200, 24, on ? SOFT : WHITE, on ? TEAL : LINE);
    const icx = 110, icy = y + 100;
    s += `<circle cx="${icx}" cy="${icy}" r="50" fill="${on ? TEAL : SOFT}"/>`;
    if (kind === "owner") s += pawIcon(on ? paws.white.uri : paws.teal.uri, icx, icy, 54);
    else s += buildingIcon(icx, icy, 46, on ? WHITE : TEAL, on ? TEAL : SOFT);
    s += t(190, y + 90, title, { size: 25, weight: "800", fill: V2INK });
    s += t(190, y + 126, desc[0], { size: 17, fill: MUTED });
    s += t(190, y + 152, desc[1], { size: 17, fill: MUTED });
    if (on) {
      const cx = 466, cy = y + 36;
      s += `<circle cx="${cx}" cy="${cy}" r="17" fill="${TEAL}"/>` +
        `<polyline points="${cx - 8},${cy} ${cx - 3},${cy + 6} ${cx + 8},${cy - 7}" fill="none" stroke="${WHITE}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  });
  s += btn(812, "Continue");
  return s;
}

// ---------- Screen 5: My profile ----------
// V2 pass — matches shelterProfile: gradient-hero squircle avatar, V2 stat tiles, grouped card,
// floating nav. A plain owner has no trust badge (Verified Member is optional), so the identity card
// stays clean and the Verified-Member gate sits below it as a soft-teal accent (verify → adopt + rescue).
function profile(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false);
  s += t(34, 90, "Profile", { size: 29, weight: "800", fill: V2INK, ls: -0.5 });

  // identity card
  s += v2card(34, 110, 472, 210, 28);
  s += v2squircle(270, 182, 96, "url(#v2hero)", 32) + t(270, 196, "AR", { size: 38, anchor: "middle", weight: "800", fill: WHITE });
  s += t(270, 282, "Ana Reyes", { size: 27, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 310, "Fur parent · Marikina City", { size: 15.5, anchor: "middle", fill: MUTED });

  // become a verified member — the owner's key gate (verification required to adopt + rescue)
  s += rrect(34, 340, 472, 96, 22, "#E2EEF0");
  s += v2squircle(84, 388, 52, "url(#v2btn)", 16) + personIcon(84, 388, 30, WHITE);
  s += t(126, 378, "Become a Verified Member", { size: 17, weight: "800", fill: TEALDK });
  s += t(126, 404, "Verify to adopt &amp; rescue strays.", { size: 13, fill: "#5f6b6a" });
  s += rrect(400, 364, 80, 44, 22, "url(#v2btn)") + t(440, 391, "Start", { size: 15, anchor: "middle", fill: WHITE, weight: "700" });

  // stat tiles (same treatment as the shelter profile / dashboard)
  const SY = 456;
  [["2", "Pets", "paw"], ["5", "Rescues", "heart"], ["9", "Donations", "peso"]].forEach(([n, lab, ic], i) => {
    const x = 34 + i * 162;
    const [bg, fg] = ic === "paw" ? [SOFT, TEAL] : ic === "heart" ? ["#EAF3DE", "#27500A"] : ["#F2EFE7", "#8a5a12"];
    s += v2card(x, SY, 148, 100, 22);
    s += v2squircle(x + 40, SY + 32, 38, bg, 12);
    if (ic === "paw") s += pawmark(x + 40, SY + 33, 11, fg);
    else if (ic === "heart") s += heartIcon(x + 40, SY + 32, 24, fg);
    else s += t(x + 40, SY + 40, "₱", { size: 20, anchor: "middle", weight: "800", fill: fg });
    s += t(x + 22, SY + 68, n, { size: 26, weight: "800", fill: V2INK });
    s += t(x + 22, SY + 90, lab, { size: 13, fill: MUTED });
  });

  // my pets
  s += t(34, 596, "My pets", { size: 21, weight: "800", fill: V2INK });
  s += t(506, 596, "Add", { size: 15, anchor: "end", fill: TEAL, weight: "700" });
  s += v2card(34, 614, 472, 148, 24);
  [["Milo", "Aspin · 2 yrs · Male"], ["Luna", "Puspin · 1 yr · Female"]].forEach(([nm, meta], i) => {
    const y = 614 + i * 74;
    if (i) s += `<line x1="66" y1="${y}" x2="474" y2="${y}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += v2squircle(96, y + 37, 50, SOFT) + pawIcon(paws.teal.uri, 96, y + 37, 28);
    s += t(140, y + 32, nm, { size: 19, weight: "800", fill: V2INK });
    s += t(140, y + 56, meta, { size: 14, fill: MUTED });
    s += t(478, y + 42, "›", { size: 26, anchor: "end", weight: "700", fill: "#C9CEC7" });
  });

  // account menu (grouped card)
  const RH = 58, CX = 34, CW = 472;
  const orow = (gy, i, n, label, value) => {
    const y0 = gy + i * RH;
    let r = t(CX + 32, y0 + 36, label, { size: 18.5, weight: "600", fill: V2INK });
    if (value) r += t(CX + CW - 52, y0 + 36, value, { size: 15.5, anchor: "end", weight: "600", fill: MUTED });
    r += t(CX + CW - 28, y0 + 40, "›", { size: 24, anchor: "end", weight: "700", fill: "#C9CEC7" });
    if (i < n - 1) r += `<line x1="${CX + 32}" y1="${y0 + RH}" x2="${CX + CW - 24}" y2="${y0 + RH}" stroke="${LINE}" stroke-width="1.5"/>`;
    return r;
  };
  s += t(34, 800, "Account", { size: 21, weight: "800", fill: V2INK });
  const MY = 818;
  s += v2card(CX, MY, CW, 4 * RH, 24);
  s += orow(MY, 0, 4, "My adoption inquiries", "2 active");
  s += orow(MY, 1, 4, "Badges", "3 earned");
  s += orow(MY, 2, 4, "Account settings");
  s += orow(MY, 3, 4, "Help &amp; support");

  s += v2nav(3);
  return s;
}

// ---------- Screen 6: Add pet ----------
function addPet(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Add a pet");

  // photo uploader
  s += `<circle cx="270" cy="196" r="64" fill="${SOFT}" stroke="${LINE}" stroke-width="2" stroke-dasharray="6 7"/>`;
  s += pawIcon(paws.teal.uri, 270, 184, 52);
  s += `<circle cx="316" cy="232" r="22" fill="${TEAL}"/>` + t(316, 240, "+", { size: 28, anchor: "middle", fill: WHITE, weight: "700" });
  s += t(270, 300, "Add a photo", { size: 20, anchor: "middle", fill: TEAL, weight: "700" });

  s += field(34, 344, 472, "Pet name", "Milo");

  s += t(34, 486, "Species", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 502, ["Dog", "Cat", "Other"], 0);

  // Breed — dropdown (tap to pick)
  const chevron = (cx, cy) => `<polyline points="${cx - 9},${cy - 5} ${cx},${cy + 5} ${cx + 9},${cy - 5}" fill="none" stroke="${MUTED}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(34, 586, "Breed", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 602, 472, 64, 16, WHITE, LINE);
  s += t(58, 643, "Aspin (Asong Pinoy)", { size: 22, fill: NAVY, weight: "600" });
  s += chevron(472, 634);

  // Birthdate — with a calendar icon
  const cal = (x, y) => `<rect x="${x}" y="${y + 5}" width="30" height="26" rx="5" fill="none" stroke="${MUTED}" stroke-width="2.5"/>` +
    `<line x1="${x}" y1="${y + 13}" x2="${x + 30}" y2="${y + 13}" stroke="${MUTED}" stroke-width="2.5"/>` +
    `<line x1="${x + 9}" y1="${y}" x2="${x + 9}" y2="${y + 8}" stroke="${MUTED}" stroke-width="2.5" stroke-linecap="round"/>` +
    `<line x1="${x + 21}" y1="${y}" x2="${x + 21}" y2="${y + 8}" stroke="${MUTED}" stroke-width="2.5" stroke-linecap="round"/>`;
  s += field(34, 688, 472, "Birthdate", "10 Feb 2024");
  s += cal(456, 718);

  // Sex — full-width chip row
  s += t(34, 790, "Sex", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 806, ["Male", "Female"], 0);

  // spayed / neutered toggle
  s += t(34, 928, "Spayed / neutered", { size: 22, weight: "800", fill: V2INK });
  s += rrect(422, 906, 84, 46, 23, TEAL) + `<circle cx="483" cy="929" r="18" fill="${WHITE}"/>`;

  s += btn(1002, "Save pet");
  return s;
}

// ---------- Screen 7: Settings ----------
function settings() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Settings");

  const item = (gx, gy, gw, label, value, i, n) => {
    let r = t(gx, gy + 44, label, { size: 22, weight: "600", fill: NAVY });
    if (value) r += t(gx + gw - 44, gy + 44, value, { size: 20, anchor: "end", fill: MUTED });
    r += t(gx + gw - 6, gy + 46, "›", { size: 32, anchor: "end", fill: "#b8b6ad" });
    if (i < n - 1) r += `<line x1="${gx}" y1="${gy + 70}" x2="${gx + gw}" y2="${gy + 70}" stroke="${LINE}" stroke-width="1.5"/>`;
    return r;
  };
  const grp = (title, y, rows) => {
    let r = t(34, y, title, { size: 16, weight: "700", fill: MUTED, ls: 1.5 });
    const gy = y + 18, h = rows.length * 70;
    r += rrect(34, gy, 472, h, 20, WHITE, LINE);
    rows.forEach((rw, i) => { r += item(58, gy + i * 70, 424, rw[0], rw[1], i, rows.length); });
    return { r, end: gy + h };
  };

  let g = grp("ACCOUNT", 158, [["Edit profile"], ["Phone number", "+63 917···"], ["Email address"]]);
  s += g.r;
  g = grp("PREFERENCES", g.end + 30, [["Notifications"], ["Location"]]);
  s += g.r;
  g = grp("SUPPORT", g.end + 30, [["Help center"], ["About Kupkop PH"], ["Privacy &amp; terms"]]);
  s += g.r;

  const ly = g.end + 34;
  s += rrect(34, ly, 472, 70, 20, WHITE, LINE) + t(270, ly + 44, "Log out", { size: 22, anchor: "middle", weight: "700", fill: "#B23B3B" });
  s += t(270, ly + 132, "Kupkop PH · v0.1.0 (MVP)", { size: 16, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Edit profile (pet owner) ----------
// Destination of Settings → "Edit profile". V2. Email is the identifier (changing it re-verifies);
// phone is the first-use verified attribute; city is a picker. No language field (English-only).
// PATCH /me + /me/phone + /me/location.
function editProfile(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false) + v2back();
  s += t(270, 76, "Edit profile", { size: 22, anchor: "middle", weight: "800", fill: V2INK });

  // avatar + change photo (camera badge)
  s += v2squircle(270, 178, 108, "url(#v2hero)", 34) + t(270, 192, "AR", { size: 42, anchor: "middle", weight: "800", fill: WHITE });
  s += `<circle cx="316" cy="216" r="19" fill="${TEAL}" stroke="${V2BG}" stroke-width="3.5"/>`;
  s += `<rect x="308" y="213" width="16" height="11" rx="3" fill="${WHITE}"/><circle cx="316" cy="219" r="3" fill="${TEAL}"/><rect x="313" y="210" width="6" height="4" rx="1.5" fill="${WHITE}"/>`;
  s += t(270, 268, "Change photo", { size: 16, anchor: "middle", weight: "700", fill: TEAL });

  s += v2field(34, 300, 472, "DISPLAY NAME", "Ana Reyes");
  s += v2field(34, 402, 472, "EMAIL", "ana@email.com");
  s += t(46, 502, "Changing this sends a code to re-verify your email.", { size: 12.5, fill: MUTED });
  s += v2field(34, 522, 472, "PHONE", "917 123 4567", { prefix: "+63" });
  s += rrect(384, 560, 98, 32, 16, OKBG) + verified(402, 576, 9) + t(416, 581, "Verified", { size: 13, fill: OK, weight: "700" });
  s += v2field(34, 624, 472, "CITY", "Marikina City");
  s += t(474, 674, "›", { size: 26, anchor: "end", weight: "700", fill: "#C9CEC7" });

  s += v2btn(760, "Save changes");
  s += t(270, 866, "Cancel", { size: 16, anchor: "middle", weight: "700", fill: MUTED });
  return s;
}

// ---------- Edit organization (shelter / rescuer) ----------
// Destination of the shelter profile's "Organization details" row. V2. opts.tier === 1 → Community
// rescue (no affiliated-vet block; tier-2 adds vet name + PRC). Mirrors the onboarding field set
// (shelter-setup + -setup-contact) collapsed into one editable form. PATCH /shelter/profile.
function editOrg(paws, opts = {}) {
  const tier1 = opts.tier === 1;
  const name = tier1 ? "Aling Nena's Rescue" : "PAWS Manila";
  const v2chips = (x, y, labels, active) => {
    let cx = x, out = "";
    labels.forEach((lab, i) => {
      const w = 28 + lab.length * 11, on = i === active;
      out += `<rect x="${cx}" y="${y}" width="${w}" height="46" rx="23" fill="${on ? "url(#v2btn)" : WHITE}" filter="url(#v2soft)"/>`;
      out += t(cx + w / 2, y + 30, lab, { size: 15.5, anchor: "middle", weight: "700", fill: on ? WHITE : V2INK });
      cx += w + 12;
    });
    return out;
  };
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false) + v2back();
  s += t(270, 76, "Edit organization", { size: 22, anchor: "middle", weight: "800", fill: V2INK });

  // logo row (compact) + change badge
  s += v2squircle(78, 150, 68, "url(#v2hero)", 22);
  s += tier1 ? homeHeartIcon(78, 150, 40, WHITE) : buildingIcon(78, 150, 34, WHITE);
  s += `<circle cx="106" cy="176" r="15" fill="${TEAL}" stroke="${V2BG}" stroke-width="3"/>`;
  s += `<rect x="99" y="173" width="14" height="9" rx="2.5" fill="${WHITE}"/><circle cx="106" cy="178" r="2.5" fill="${TEAL}"/><rect x="103" y="171" width="6" height="3" rx="1" fill="${WHITE}"/>`;
  s += t(132, 142, "Change logo", { size: 17, weight: "700", fill: TEAL });
  s += t(132, 168, "PNG or JPG, square works best.", { size: 13, fill: MUTED });

  s += t(34, 224, "ORGANIZATION", { size: 13, weight: "700", fill: MUTED, ls: 1 });
  s += v2field(34, 238, 472, "ORGANIZATION NAME", name);
  s += t(46, 346, "TYPE", { size: 12, weight: "600", fill: MUTED, ls: 0.4 });
  s += v2chips(34, 358, ["Shelter", "Rescue", "Clinic"], tier1 ? 1 : 0);
  s += v2field(34, 420, 472, "REGISTRATION NO. (SEC / DTI / LGU)", tier1 ? "DTI-2021-88123" : "CN-2019-0482");
  s += v2field(34, 514, 472, "ADDRESS", tier1 ? "9 Mabini St, Quezon City" : "12 Aurora Blvd, Marikina City");

  s += t(34, 622, "CONTACT", { size: 13, weight: "700", fill: MUTED, ls: 1 });
  s += v2field(34, 636, 229, "CONTACT PERSON", "Maria Santos");
  s += v2field(277, 636, 229, "NUMBER", "917 1234 567", { prefix: "+63" });
  s += t(46, 744, "ROLE", { size: 12, weight: "600", fill: MUTED, ls: 0.4 });
  s += v2chips(34, 756, ["Owner", "Staff", "Volunteer"], 0);
  s += v2field(34, 818, 472, "WEBSITE / FACEBOOK", tier1 ? "facebook.com/alingnenarescue" : "facebook.com/pawsmanila");

  if (tier1) {
    s += v2btn(926, "Save changes");
    s += t(270, 1032, "Cancel", { size: 16, anchor: "middle", weight: "700", fill: MUTED });
  } else {
    s += t(34, 926, "AFFILIATED VET", { size: 13, weight: "700", fill: MUTED, ls: 1 });
    s += v2field(34, 940, 300, "VET NAME", "Dr. Jose Ramos");
    s += v2field(346, 940, 160, "PRC NO.", "0123456");
    s += v2btn(1046, "Save changes");
    s += t(270, 1150, "Cancel", { size: 16, anchor: "middle", weight: "700", fill: MUTED });
  }
  return s;
}

// ===== Shelter / organization screens =======================================
const verified = (cx, cy, r = 16) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${TEAL}"/>` +
  `<polyline points="${cx - r * 0.45},${cy} ${cx - r * 0.12},${cy + r * 0.35} ${cx + r * 0.5},${cy - r * 0.4}" fill="none" stroke="${WHITE}" stroke-width="${r * 0.22}" stroke-linecap="round" stroke-linejoin="round"/>`;

// right-aligned status pill; returns svg (chip ends at x)
function statusChip(x, y, label) {
  const map = { Available: ["#EAF3DE", "#27500A"], Confirmed: ["#EAF3DE", "#27500A"], Pending: ["#FAEEDA", "#633806"], Adopted: ["#ece9e1", "#6b6a63"], New: ["#E4EEF0", "#1C6B6B"], Review: ["#FAEEDA", "#633806"], Submitted: ["#E4EEF0", "#1C6B6B"], "In review": ["#FAEEDA", "#633806"], Approved: ["#EAF3DE", "#27500A"], Declined: ["#F3E3E1", "#8A3B3B"], Completed: ["#E7F0EF", "#14504F"], Cancelled: ["#ece9e1", "#6b6a63"], Withdrawn: ["#ece9e1", "#6b6a63"], Pledged: ["#E4EEF0", "#1C6B6B"], Delivered: ["#EAF3DE", "#27500A"], Fulfilled: ["#EAF3DE", "#27500A"], Closed: ["#ece9e1", "#6b6a63"], Verified: ["#EAF3DE", "#27500A"],
    // stray_status lifecycle: reported → claimed → rescued → safe → resolved. The colour walks
    // amber → teal → green → grey on purpose: an UNCLAIMED report is the only one that needs someone
    // to act, so it alone gets the attention colour. Everything after it is "someone has this".
    Reported: ["#FAEEDA", "#633806"], Claimed: ["#E4EEF0", "#1C6B6B"], Rescued: ["#E7F0EF", "#14504F"],
    Safe: ["#EAF3DE", "#27500A"], Resolved: ["#ece9e1", "#6b6a63"],
    // offer_status. Deliberately NO amber here: amber means "this needs someone to act", and a live
    // offer needs nothing — the unclaimed REPORT is what still needs someone. Colouring offers amber
    // would put two different urgencies in the same colour on the same screen.
    Open: ["#E4EEF0", "#1C6B6B"], Matched: ["#EAF3DE", "#27500A"], Expired: ["#ece9e1", "#6b6a63"] };
  const [bg, fg] = map[label] || ["#eeeeee", MUTED];
  const w = 40 + label.length * 10;
  return rrect(x - w, y, w, 36, 18, bg) + `<circle cx="${x - w + 16}" cy="${y + 18}" r="4" fill="${fg}"/>` +
    t(x - w + 28, y + 23.5, label, { size: 14, fill: fg, weight: "700" });
}
function shelterNav(active) { return v2nav(active, ["Home", "Animals", "Donate", "Requests", "You"]); }
function qr(x, y, size) {
  const n = 11, cell = size / n;
  let seed = 7; const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let s = "";
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (rand() > 0.5) s += `<rect x="${x + j * cell}" y="${y + i * cell}" width="${cell}" height="${cell}" fill="${NAVY}"/>`;
  const finder = (fx, fy) => `<rect x="${fx}" y="${fy}" width="${cell * 3}" height="${cell * 3}" fill="${WHITE}"/><rect x="${fx}" y="${fy}" width="${cell * 3}" height="${cell * 3}" fill="none" stroke="${NAVY}" stroke-width="6"/><rect x="${fx + cell}" y="${fy + cell}" width="${cell}" height="${cell}" fill="${NAVY}"/>`;
  return s + finder(x, y) + finder(x + cell * 8, y) + finder(x, y + cell * 8);
}

// status / verification helper icons + stepper
const OK = "#27500A", OKBG = "#EAF3DE", WARN = "#8a5a12", WARN2 = "#633806", WARNBG = "#FAEEDA",
      DANGER = "#B23B3B", DANGERBG = "#FBEEEC", DANGERLN = "#E7C7C2", GREYPILL = "#eceae3";
const clockIcon = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="4"/>` +
  `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * 0.55}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>` +
  `<line x1="${cx}" y1="${cy}" x2="${cx + r * 0.42}" y2="${cy + r * 0.18}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
const alertIcon = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="4"/>` +
  `<line x1="${cx}" y1="${cy - r * 0.45}" x2="${cx}" y2="${cy + r * 0.12}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>` +
  `<circle cx="${cx}" cy="${cy + r * 0.45}" r="2.8" fill="${c}"/>`;
const lockIcon = (cx, cy, sz, c) => `<rect x="${cx - sz * 0.5}" y="${cy - sz * 0.12}" width="${sz}" height="${sz * 0.62}" rx="3" fill="${c}"/>` +
  `<path d="M${cx - sz * 0.3} ${cy - sz * 0.12} v${-sz * 0.18} a${sz * 0.3} ${sz * 0.3} 0 0 1 ${sz * 0.6} 0 v${sz * 0.18}" fill="none" stroke="${c}" stroke-width="${sz * 0.12}"/>`;
const bellIcon = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="26" fill="${WHITE}" stroke="${LINE}"/>` +
  `<path d="M${cx - 9} ${cy + 4} q0 -13 9 -13 q9 0 9 13 l3 5 h-24 z" fill="none" stroke="${NAVY}" stroke-width="2.4" stroke-linejoin="round"/>` +
  `<path d="M${cx - 3} ${cy + 11} a3.5 3.5 0 0 0 7 0" fill="none" stroke="${NAVY}" stroke-width="2.4"/>`;
function stepper(labels, current, y) {
  const xs = [130, 270, 410];
  let s = `<line x1="${xs[0]}" y1="${y}" x2="${xs[2]}" y2="${y}" stroke="${LINE}" stroke-width="3"/>`;
  labels.forEach((lab, i) => {
    const x = xs[i], done = i < current, cur = i === current, on = done || cur;
    s += `<circle cx="${x}" cy="${y}" r="17" fill="${on ? TEAL : "#cfd6d2"}"/>`;
    if (done) s += `<polyline points="${x - 7},${y} ${x - 2},${y + 6} ${x + 8},${y - 6}" fill="none" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (cur) s += `<circle cx="${x}" cy="${y}" r="6" fill="${WHITE}"/>`;
    s += t(x, y + 42, lab, { size: 16, anchor: "middle", fill: on ? NAVY : MUTED, weight: cur ? "700" : "normal" });
  });
  return s;
}

// rescuer/shelter identity marks
const buildingIcon = (cx, cy, s, c, hole = TEAL) => {
  const x = cx - s * 0.5, y = cy - s * 0.5, w = s, h = s;
  let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}"/>`;
  for (let r = 0; r < 2; r++) for (let col = 0; col < 3; col++)
    g += `<rect x="${x + w * 0.16 + col * w * 0.28}" y="${y + h * 0.14 + r * h * 0.26}" width="${w * 0.15}" height="${w * 0.15}" fill="${hole}"/>`;
  g += `<rect x="${cx - w * 0.1}" y="${y + h * 0.66}" width="${w * 0.2}" height="${h * 0.34}" fill="${hole}"/>`;
  return g;
};
const personIcon = (cx, cy, s, c) => `<circle cx="${cx}" cy="${cy - s * 0.24}" r="${s * 0.2}" fill="${c}"/>` +
  `<path d="M${cx - s * 0.36} ${cy + s * 0.42} a${s * 0.36} ${s * 0.4} 0 0 1 ${s * 0.72} 0 z" fill="${c}"/>`;
// home glyph — the tier-1 community-rescue mark (a roof over a heart: rescue from home)
const homeHeartIcon = (cx, cy, s, c) => `<path d="M${cx} ${cy - s * 0.52} L${cx + s * 0.55} ${cy - s * 0.05} L${cx + s * 0.4} ${cy - s * 0.05} L${cx + s * 0.4} ${cy + s * 0.5} L${cx - s * 0.4} ${cy + s * 0.5} L${cx - s * 0.4} ${cy - s * 0.05} L${cx - s * 0.55} ${cy - s * 0.05} Z" fill="${c}"/>` +
  heartIcon(cx, cy + s * 0.16, s * 0.42, c === WHITE ? TEAL : WHITE);
const typeRoundel = (cx, cy, kind) => {
  let g = `<circle cx="${cx}" cy="${cy}" r="52" fill="${TEAL}"/>`;
  if (kind === "shelter") g += buildingIcon(cx, cy, 46, WHITE);
  else if (kind === "rescue") g += homeHeartIcon(cx, cy, 52, WHITE);
  else g += personIcon(cx, cy, 60, WHITE);
  g += `<circle cx="${cx + 38}" cy="${cy + 38}" r="16" fill="${WHITE}"/>` + verified(cx + 38, cy + 38, 12);
  return g;
};
// labeled "Verified <type>" pill — the rule: badge always names the type
function verifiedPill(cx, y, label) {
  const w = 62 + label.length * 11, x = cx - w / 2;
  return rrect(x, y, w, 42, 21, WHITE, LINE) + verified(x + 24, y + 21, 12) +
    t(x + 42, y + 28, label, { size: 17, fill: TEAL, weight: "700" });
}
const docGlyph = (cx, cy, c) => `<path d="M${cx - 13} ${cy - 16} h18 l8 8 v24 h-26 z" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>` +
  `<path d="M${cx + 5} ${cy - 16} v8 h8" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>` +
  `<line x1="${cx - 6}" y1="${cy + 3}" x2="${cx + 9}" y2="${cy + 3}" stroke="${c}" stroke-width="2.5"/>` +
  `<line x1="${cx - 6}" y1="${cy + 11}" x2="${cx + 9}" y2="${cy + 11}" stroke="${c}" stroke-width="2.5"/>`;

// ⚠️ RA 10173 (Data Privacy Act) consent block for every screen that uploads a government ID or org
// documents. A signup-time T&C checkbox is legally insufficient for *sensitive personal information*
// (a gov ID is exactly that): consent must be SPECIFIC to the purpose and given at the point of
// collection. So it lives here, inline, checked to submit — NOT bundled into the account-creation
// consent on `signup`.
//   - `what` names the purpose precisely ("verify my identity" / "verify our organisation"),
//     because "solely for X" is the operative limitation the law wants stated.
//   - Required: submit is blocked until it's ticked. This is the one consent that genuinely gates the
//     action, unlike the "stays enabled" rule for ordinary fields.
// (Retention copy was removed 2026-07-21 pending a legal-set number in the Privacy Policy; the
//  consent itself stays.)
function consentDocs(y, what) {
  let s = rrect(34, y, 472, 74, 18, "#eaf4f2");
  s += rrect(58, y + 22, 30, 30, 8, TEAL) +
    `<polyline points="65,${y + 37} 71,${y + 44} 82,${y + 30}" fill="none" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(102, y + 32, `I consent to Kupkop PH collecting these documents`, { size: 14.5, fill: NAVY, weight: "600" });
  s += t(102, y + 54, `solely to ${what}.`, { size: 14.5, fill: NAVY, weight: "600" });
  return s;
}

// ---------- Verify (Verified Member): intro — unlocks adopting + rescue tools ----------
function memberUpgrade(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Get verified");
  s += rrect(34, 150, 472, 150, 24, TEAL);
  s += `<circle cx="106" cy="225" r="46" fill="#ffffff" fill-opacity="0.15"/>` + personIcon(106, 225, 56, WHITE);
  s += t(180, 210, "Become a Verified Member", { size: 21, weight: "700", fill: WHITE });
  s += t(180, 244, "One quick check unlocks adopting", { size: 17, fill: "#cfe6e2" });
  s += t(180, 268, "&amp; rescue tools.", { size: 17, fill: "#cfe6e2" });

  s += t(34, 356, "What you unlock", { size: 22, weight: "800", fill: V2INK });
  const bens = ["Adopt from partner shelters", "Claim &amp; update stray rescue cases", "Post rescued animals for adoption", "Keep everything you do as a fur parent"];
  bens.forEach((b, i) => { const y = 406 + i * 56; s += pawIcon(paws.teal.uri, 52, y - 6, 28); s += t(88, y, b, { size: 18, fill: NAVY }); });

  s += rrect(34, 646, 472, 100, 16, "#eaf4f2");
  s += t(58, 688, "Light verification", { size: 18, weight: "700", fill: TEAL });
  s += t(58, 716, "A valid ID and one link to your social page.", { size: 15, fill: MUTED });

  s += btn(792, "Get verified");
  s += t(270, 888, "Free · takes a few minutes", { size: 15, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Verify (Verified Member): quick verification ----------
function memberVerify() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Get verified");
  s += t(34, 168, "Quick verification", { size: 30, weight: "800", fill: V2INK });
  s += t(34, 204, "Two things and you're set.", { size: 18, fill: MUTED });

  // valid ID (uploaded)
  const y = 258;
  s += rrect(34, y, 472, 112, 20, WHITE, LINE);
  s += avq(86, y + 56, 32) + docGlyph(86, y + 56, TEAL);
  s += t(140, y + 50, "Valid government ID", { size: 21, weight: "800", fill: V2INK });
  s += t(140, y + 80, "A clear photo of your ID · Required", { size: 15, fill: MUTED });
  s += `<circle cx="466" cy="${y + 40}" r="16" fill="${OKBG}"/>` +
    `<polyline points="459,${y + 40} 464,${y + 46} 474,${y + 33}" fill="none" stroke="${OK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(486, y + 84, "maria-id.jpg", { size: 15, anchor: "end", fill: MUTED });

  s += field(34, 410, 472, "Social link", "facebook.com/maria.santos");

  s += t(34, 542, "About you (optional)", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 558, 472, 108, 16, WHITE, LINE);
  s += t(58, 596, "I've fostered aspins in QC since 2022…", { size: 18, fill: "#9a988f" });

  s += consentDocs(690, "verify my identity");
  s += t(34, 826, "A Kupkop admin reviews this — usually within a day.", { size: 15, fill: MUTED });
  s += btn(864, "Submit for review");
  return s;
}

// ---------- Verified Member: submission confirmed (modal over member-verify) ----------
// The moment after "Submit for review". A modal, not a full screen, so it reads as "that worked,
// here's what happens next" without yanking the user out of context. ⚠️ It STATES the wait plainly
// (a few days) — a vague "we'll review it" leaves the user checking hourly and assuming it's stuck.
function memberVerifySubmitted() {
  let s = memberVerify();
  s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;
  s += `<rect x="50" y="316" width="440" height="536" rx="26" fill="${WHITE}" filter="url(#v2sh)"/>`;

  s += `<circle cx="270" cy="404" r="52" fill="${OKBG}"/>`;
  s += `<polyline points="246,404 264,422 296,384" fill="none" stroke="${OK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(270, 500, "Request submitted", { size: 26, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 538, "We’ve got your ID and social link.", { size: 15.5, anchor: "middle", fill: MUTED });

  // the honest timeline — the whole reason this modal exists
  s += `<rect x="86" y="576" width="368" height="92" rx="16" fill="${SOFT}"/>`;
  s += clockIcon(126, 622, 16, TEALDK);
  s += t(158, 610, "This takes a few days", { size: 15, fill: TEALDK, weight: "700" });
  s += t(158, 634, "A person reviews every request — usually", { size: 12.5, fill: MUTED });
  s += t(158, 654, "2–3 business days. We’ll notify you.", { size: 12.5, fill: MUTED });

  s += t(270, 712, "You can use everything else while you wait.", { size: 13, anchor: "middle", fill: "#a9adaa" });
  s += `<rect x="86" y="734" width="368" height="64" rx="32" fill="url(#v2btn)" filter="url(#v2soft)"/>`;
  s += t(270, 774, "Back to home", { size: 20, anchor: "middle", fill: WHITE, weight: "700" });
  s += t(270, 832, "Track my documents", { size: 16, anchor: "middle", fill: TEALDK, weight: "700" });
  return s;
}

// ---------- Help & support (reached from "Need help?" on password-changed, and elsewhere) ----------
// Messaging is Phase 2 (decision 6), so support is the same real channels the rest of the app uses:
// email + Facebook. No in-app chat promised here that the MVP can't honour.
function contactSupport() {
  const mailIcon = (cx, cy, c) => `<rect x="${cx - 15}" y="${cy - 11}" width="30" height="22" rx="4" fill="none" stroke="${c}" stroke-width="2.5"/>` +
    `<path d="M${cx - 15} ${cy - 8} l15 11 l15 -11" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>`;
  const fbIcon = (cx, cy, c) => rrect(cx - 15, cy - 15, 30, 30, 7, c) + t(cx, cy + 10, "f", { size: 22, anchor: "middle", fill: WHITE, weight: "700" });
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Help &amp; support");

  s += `<circle cx="270" cy="216" r="60" fill="${SOFT}"/>` + `<circle cx="270" cy="210" r="26" fill="none" stroke="${TEALDK}" stroke-width="5"/>` +
    `<path d="M258 202 a12 12 0 1 1 16 10 c-4 2 -4 4 -4 8" fill="none" stroke="${TEALDK}" stroke-width="5" stroke-linecap="round"/>` +
    `<circle cx="270" cy="230" r="3.5" fill="${TEALDK}"/>`;
  s += t(270, 330, "We’re here to help", { size: 28, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 368, "Reach us and we’ll get back to you.", { size: 17, anchor: "middle", fill: MUTED });

  const rows = [
    [mailIcon, "Email us", "support@kupkopph.com", "Replies within 1 business day"],
    [fbIcon, "Message on Facebook", "@kupkopph", "Fastest on weekdays"],
  ];
  rows.forEach(([icon, title, val, sub], i) => {
    const y = 430 + i * 116;
    s += rrect(34, y, 472, 100, 20, WHITE, LINE);
    s += avq(86, y + 50, 30, SOFT) + icon(86, y + 50, TEAL);
    s += t(136, y + 42, title, { size: 19, weight: "800", fill: V2INK });
    s += t(136, y + 70, val, { size: 15, fill: TEAL, weight: "700" });
    s += t(486, y + 42, sub, { size: 12.5, anchor: "end", fill: "#b8b6ad" });
    s += t(486, y + 70, "\u203a", { size: 24, anchor: "end", fill: TEAL, weight: "700" });
  });

  s += t(34, 726, "Common questions", { size: 18, weight: "800", fill: V2INK });
  ["How does verification work?", "Is my ID kept private?", "How do I adopt or volunteer?"].forEach((q, i) => {
    const y = 758 + i * 62;
    s += rrect(34, y, 472, 52, 14, WHITE, LINE);
    s += t(58, y + 33, q, { size: 15.5, fill: NAVY, weight: "600" });
    s += t(486, y + 33, "\u203a", { size: 20, anchor: "end", fill: TEAL, weight: "700" });
  });

  s += t(270, 992, "kupkopph.com/help", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Rescuer 3: Profile (person-shaped + Verified Member badge) ----------
function memberProfile(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>`;
  s += `<defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${TEAL}"/><stop offset="1" stop-color="${TEALDK}"/></linearGradient></defs>`;
  s += rrect(0, 0, SW, 380, 0, "url(#rg)") + statusbar(true);
  s += t(270, 70, "My Profile", { size: 24, anchor: "middle", weight: "700", fill: WHITE });
  s += `<circle cx="270" cy="168" r="56" fill="${WHITE}"/>` + t(270, 184, "MS", { size: 40, anchor: "middle", weight: "700", fill: TEAL });
  s += t(270, 262, "Maria Santos", { size: 30, anchor: "middle", weight: "700", fill: WHITE });
  s += verifiedPill(270, 284, "Verified Member");
  s += t(270, 358, "Individual rescuer · Quezon City", { size: 17, anchor: "middle", fill: "#cfe6e2" });

  // stats
  const sy = 404;
  s += rrect(34, sy, 472, 116, 24, WHITE, LINE);
  [["14", "Rescues"], ["9", "Rehomed"], ["3", "Fostering"]].forEach(([n, lab], i) => {
    const cx = 34 + (i + 0.5) * (472 / 3);
    if (i) s += `<line x1="${34 + i * (472 / 3)}" y1="${sy + 28}" x2="${34 + i * (472 / 3)}" y2="${sy + 88}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += t(cx, sy + 56, n, { size: 26, anchor: "middle", weight: "700", fill: NAVY });
    s += t(cx, sy + 88, lab, { size: 17, anchor: "middle", fill: MUTED });
  });

  // adopt from shelters (any pet owner adopts from shelters — donations go to shelters, not individuals)
  const dy = 542;
  s += rrect(34, dy, 472, 96, 20, "#eaf4f2", TEAL);
  s += `<circle cx="86" cy="${dy + 48}" r="30" fill="${TEAL}"/>` + buildingIcon(86, dy + 48, 34, WHITE);
  s += t(134, dy + 40, "Adopt from a shelter", { size: 21, weight: "800", fill: V2INK });
  s += t(134, dy + 68, "Browse verified shelter animals.", { size: 15, fill: MUTED });
  s += t(486, dy + 54, "Browse ›", { size: 17, anchor: "end", fill: TEAL, weight: "700" });

  // my rescues
  s += t(34, 704, "My rescues", { size: 24, weight: "800", fill: V2INK });
  s += t(506, 704, "See all", { size: 18, anchor: "end", fill: TEAL, weight: "700" });
  const pets = [["Bantay", "Aspin · rescued Jun 2026", "Available"], ["Ligaya", "Puspin · rescued May 2026", "Adopted"]];
  pets.forEach(([nm, meta, st], i) => {
    const y = 728 + i * 100;
    s += rrect(34, y, 472, 88, 20, WHITE, LINE);
    s += avq(82, y + 44, 30) + pawIcon(paws.teal.uri, 82, y + 44, 34);
    s += t(132, y + 40, nm, { size: 22, weight: "800", fill: V2INK });
    s += t(132, y + 68, meta, { size: 16, fill: MUTED });
    s += statusChip(486, y + 26, st);
  });

  s += bottomnav(3); // keeps the fur-parent shell — the key differentiator
  return s;
}

// ---------- Badge comparison sheet (frameless board) ----------
function badgeBoard(paws) {
  let s = t(40, 66, "Trust badges — Member · Rescue · Shelter", { size: 30, weight: "800", fill: V2INK });
  s += t(40, 102, "Same verified-teal check on all three; the mark and the label carry the meaning — never show a bare “Verified”.", { size: 16, fill: MUTED });
  s += t(40, 128, "Shelter tiers earn DIFFERENT badges, so the NGO's heavier checks are visible to adopters.", { size: 16, fill: MUTED });
  const panel = (x, kind, label, facts) => {
    let g = rrect(x, 140, 440, 360, 24, WHITE, LINE);
    g += typeRoundel(x + 220, 246, kind);
    g += t(x + 220, 350, label, { size: 26, anchor: "middle", weight: "700", fill: NAVY });
    facts.forEach((f, i) => { const y = 402 + i * 44; g += pawIcon(paws.teal.uri, x + 54, y - 6, 22); g += t(x + 88, y, f, { size: 15, fill: NAVY }); });
    return g;
  };
  s += panel(40, "rescuer", "Verified Member", ["An individual — personal account", "Verified with an ID + a social link", "Adopt, rescue &amp; keep the fur-parent app"]);
  s += panel(500, "rescue", "Verified Rescue", ["Tier-1 shelter — community rescue", "ID + billing + photos of the space", "Full shelter tools; upgrade when registered"]);
  s += panel(960, "shelter", "Verified Shelter", ["Tier-2 shelter — registered NGO", "Adds SEC + BAI + affiliated vet (PRC)", "The heaviest checks — highest trust"]);
  return s;
}

// ---------- Shelter verify 1: Upload documents ----------
function shelterVerifyDocs() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Verify your shelter");
  s += t(34, 168, "Upload documents", { size: 30, weight: "800", fill: V2INK });
  s += t(34, 204, "Our admins review these to verify your org.", { size: 18, fill: MUTED });
  s += t(34, 232, "Only Kupkop reviewers can see them.", { size: 18, fill: MUTED });

  const docIcon = (cx, cy, c) => `<path d="M${cx - 13} ${cy - 16} h18 l8 8 v24 h-26 z" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<path d="M${cx + 5} ${cy - 16} v8 h8" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<line x1="${cx - 6}" y1="${cy + 3}" x2="${cx + 9}" y2="${cy + 3}" stroke="${c}" stroke-width="2.5"/>` +
    `<line x1="${cx - 6}" y1="${cy + 11}" x2="${cx + 9}" y2="${cy + 11}" stroke="${c}" stroke-width="2.5"/>`;
  const docs = [
    ["Government ID", "Contact person's valid ID · Required", true, "juan-id.jpg"],
    ["SEC / DTI / LGU registration", "Proof your org is registered · Required", true, "sec-cert.pdf"],
    ["Proof of address", "Utility bill or clinic photo · Optional", false, ""],
  ];
  docs.forEach(([title, hint, done, file], i) => {
    const y = 280 + i * 128;
    s += rrect(34, y, 472, 112, 20, WHITE, LINE);
    s += avq(86, y + 56, 32) + docIcon(86, y + 56, TEAL);
    s += t(140, y + 50, title, { size: 21, weight: "800", fill: V2INK });
    s += t(140, y + 80, hint, { size: 15, fill: MUTED });
    if (done) {
      s += `<circle cx="466" cy="${y + 40}" r="16" fill="${OKBG}"/>` +
        `<polyline points="459,${y + 40} 464,${y + 46} 474,${y + 33}" fill="none" stroke="${OK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += t(486, y + 84, file, { size: 15, anchor: "end", fill: MUTED });
    } else {
      s += rrect(410, y + 34, 96, 44, 22, WHITE, TEAL) + t(458, y + 62, "Upload", { size: 17, anchor: "middle", fill: TEAL, weight: "700" });
    }
  });
  s += t(34, 700, "Files are stored securely (access-restricted).", { size: 15, fill: MUTED });
  s += btn(760, "Submit for review");
  s += t(270, 862, "We'll notify you once it's reviewed.", { size: 16, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Shelter tier: which kind of rescue? (sets the document set) ----------
// Asked right after account-type = Shelter, BEFORE the forms — an NGO's checks (SEC + BAI + vet)
// are heavy, so they should know what's coming before investing in setup. Tier is an attribute on
// shelter_profile; account_type stays `shelter` for both.
function shelterTier(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Shelter type") + steps4(0);
  s += t(34, 168, "What kind of rescue are you?", { size: 27, weight: "800", fill: V2INK });
  s += t(34, 204, "This sets the documents we'll ask for.", { size: 17, fill: MUTED });

  // tier 1 has FULL shelter capabilities — incl. adoption listings — just lighter checks.
  // Named "Community rescue", NOT "Independent rescuer": the old label collided head-on with the
  // Pet-Owner rescuer capability one screen earlier, so both options read as "for someone who
  // rescues". It also now matches the stored value (shelter_tier = community_rescue) and the badge
  // it earns (Verified Rescue). The label describes an OPERATION, which is the actual distinction.
  const cards = [
    ["rescuer", "Community rescue", ["You take animals in at home or a", "small space — no SEC papers yet."], "ID · address proof · photos of your space", true],
    ["ngo", "Registered NGO / Foundation", ["SEC-registered, with a BAI licence", "to operate."], "Adds SEC, BAI &amp; your affiliated vet", false],
  ];
  cards.forEach(([kind, title, desc, docs, on], i) => {
    const y = 262 + i * 224;
    s += rrect(34, y, 472, 200, 24, on ? SOFT : WHITE, on ? TEAL : LINE);
    const icx = 100, icy = y + 90;
    s += `<circle cx="${icx}" cy="${icy}" r="44" fill="${on ? TEAL : SOFT}"/>`;
    if (kind === "rescuer") s += personIcon(icx, icy, 50, on ? WHITE : TEAL);
    else s += buildingIcon(icx, icy, 42, on ? WHITE : TEAL, on ? TEAL : SOFT);
    s += t(166, y + 62, title, { size: 22, weight: "800", fill: V2INK });
    s += t(166, y + 92, desc[0], { size: 15, fill: MUTED });
    s += t(166, y + 116, desc[1], { size: 15, fill: MUTED });
    s += t(58, y + 168, docs, { size: 14, fill: TEAL, weight: "700" });
    if (on) {
      const cx = 466, cy = y + 34;
      s += `<circle cx="${cx}" cy="${cy}" r="17" fill="${TEAL}"/>` +
        `<polyline points="${cx - 8},${cy} ${cx - 3},${cy + 6} ${cx + 8},${cy - 7}" fill="none" stroke="${WHITE}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  });
  s += t(34, 748, "Not registered yet? Start as a community rescue —", { size: 14, fill: MUTED });
  s += t(34, 772, "you can upgrade once your SEC papers come through.", { size: 14, fill: MUTED });
  s += btn(820, "Continue");
  return s;
}

// ---------- Shelter verify — Tier 1: community rescue ----------
// Replaces the old generic shelter-verify-docs for this tier. Legal name + email are PREFILLED
// from signup (shown as a summary, not re-asked) — same rule as contact person on setup.
// The deferral exit shared by both tier forms — what makes `shelter-dashboard-incomplete` reachable.
//
// Why it exists: tier 2 asks for SEC papers, an annual BAI certificate and a vet's PRC number, and
// tier 1 for a utility bill — filing-cabinet documents, not photos already on a phone. As a hard
// gate this step strands an account that already exists from OTP, in the evening, with nowhere to
// land. Rule: typing is required inline (org name, type, address, contact); uploading is resumable.
//
// ⚠️ The consequence sits WITH the link, not only on the destination screen. A shelter deciding
// whether to defer should learn what deferring costs while deciding — the same reason the claiming-
// is-final warning on `rescue-case` sits above the button and not only inside the confirm.
// Deliberately a text link, never a button: submitting now stays the strong default, and giving the
// escape hatch equal visual weight would turn an exception into a fork.
const deferUploads = y =>
  t(270, y, "I'll upload these later", { size: 16.5, anchor: "middle", fill: TEALDK, weight: "700" }) +
  t(270, y + 26, "Your org stays hidden until we've checked them.", { size: 12.5, anchor: "middle", fill: "#b8b6ad" });

// opts.ngo → the SAME form, seen inside the tier-2 journey (gap 4).
//
// ⚠️ This fixes a real bug, not just a missing signpost. Tier 2 runs tier1 → tier2, and
// `shelter-verify-tier2` opens with a green "Rescuer checks done" strip asserting the base checks
// exist — but nothing in the flow demonstrated it, and worse, this screen's button said **"Submit
// for review"** in both journeys. For an NGO that is simply false: they are not submitting anything
// yet, there is a whole second form after this one. An applicant who tapped it and landed on more
// document fields would reasonably think the submission failed.
// So the NGO pass renames the step (Step 1 of 2), and the CTA says where it actually goes.
function shelterVerifyTier1(paws, opts = {}) {
  const ngo = !!opts.ngo;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar(ngo ? "Base checks" : "Verify your rescue") + steps4(3);
  s += t(34, 164, ngo ? "Base checks" : "Verify your rescue", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 198, ngo ? "Step 1 of 2 — NGO papers come next." : "So adopters know you're real.", { size: 17, fill: MUTED });

  // prefilled identity — shown, not asked again
  s += rrect(34, 236, 472, 96, 20, WHITE, LINE);
  s += avq(82, 284, 26) + t(82, 292, "MS", { size: 18, anchor: "middle", weight: "700", fill: TEAL });
  s += t(126, 276, "Maria Santos", { size: 18, weight: "700", fill: NAVY });
  s += t(126, 302, "hello@pawsmanila.org", { size: 14, fill: MUTED });
  s += `<circle cx="470" cy="264" r="9" fill="${OKBG}"/>` +
    `<polyline points="466,264 469,267 474,260" fill="none" stroke="${OK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(486, 308, "From your account", { size: 12, anchor: "end", fill: "#b8b6ad" });

  s += field(34, 356, 472, "Proof of rescue activity", "facebook.com/pawsmanila");
  s += t(34, 460, "A page or group showing your rescue work.", { size: 13, fill: MUTED });

  s += t(34, 498, "Documents", { size: 20, weight: "800", fill: V2INK });
  const docs = [
    ["Government-issued ID", "Your valid ID · Required", "maria-id.jpg"],
    ["Proof of billing", "Utility bill for your address · Required", "meralco-bill.pdf"],
  ];
  docs.forEach(([title, hint, file], i) => {
    const y = 520 + i * 112;
    s += rrect(34, y, 472, 98, 20, WHITE, LINE);
    s += avq(82, y + 49, 26) + docGlyph(82, y + 49, TEAL);
    s += t(130, y + 43, title, { size: 18, weight: "700", fill: NAVY });
    s += t(130, y + 70, hint, { size: 13.5, fill: MUTED });
    s += `<circle cx="470" cy="${y + 49}" r="15" fill="${OKBG}"/>` +
      `<polyline points="464,${y + 49} 468,${y + 54} 477,${y + 43}" fill="none" stroke="${OK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  });

  // rescue-space photos moved to their own slotted screen (shelter-verify-photos): the guidance —
  // three specific angles, and "the space, not the animals" — needs room three thumbnails can't give.
  // Here it's a summary row with progress, matching the doc-card pattern.
  s += rrect(34, 758, 472, 98, 20, WHITE, LINE);
  s += avq(82, 807, 26) + `<rect x="70" y="795" width="24" height="24" rx="4" fill="none" stroke="${TEAL}" stroke-width="2.5"/>` +
    `<circle cx="79" cy="803" r="3" fill="${TEAL}"/><path d="M74 815 l7 -7 5 5 4 -4 4 4" fill="none" stroke="${TEAL}" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += t(130, 800, "Photos of your rescue space", { size: 17, weight: "700", fill: NAVY });
  s += t(130, 827, "3 angles of the space · 1 of 3 added", { size: 13.5, fill: MUTED });
  s += t(486, 814, "Add ›", { size: 16, anchor: "end", fill: TEAL, weight: "700" });

  s += consentDocs(878, "verify our organisation");
  s += btn(990, ngo ? "Continue to NGO papers" : "Submit for review");
  s += deferUploads(1094);
  return s;
}

// ---------- Shelter verify — rescue-space photos (slotted, with per-slot guidance) ----------
// Reached from the "Photos of your rescue space" row on shelter-verify-tier1. Three NAMED slots, not
// a generic "add 3", because the point of these photos is to prove a *facility* exists — and left to
// their own devices people upload three adorable close-ups of one dog, which proves nothing about the
// space. Each slot asks for a specific angle; the warning states the actual failure mode plainly.
function shelterVerifyPhotos(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Rescue space photos");
  s += t(34, 164, "Show us the space", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 198, "Three photos of the facility itself.", { size: 17, fill: MUTED });

  // opts: slot 1 filled (demonstrates the done state), 2 & 3 empty (the add state)
  const slots = [
    ["1", "Resting or sleeping area", "Pens, cages, or indoor beds", true],
    ["2", "Feeding or activity space", "Yard, porch, or play space", false],
    ["3", "Wide view of the rescue setup", "The whole space in one shot", false],
  ];
  slots.forEach(([n, title, hint, filled], i) => {
    const y = 234 + i * 148;
    s += rrect(34, y, 472, 132, 22, WHITE, LINE);
    // thumbnail: filled = a photo stand-in; empty = a dashed camera drop
    if (filled) {
      s += rrect(58, y + 22, 88, 88, 16, "#dbe6e2") + pawIcon(paws.teal.uri, 102, y + 66, 44);
      s += `<circle cx="130" cy="${y + 30}" r="15" fill="${OKBG}"/>` +
        `<polyline points="124,${y + 30} 128,${y + 35} 137,${y + 24}" fill="none" stroke="${OK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else {
      s += `<rect x="58" y="${y + 22}" width="88" height="88" rx="16" fill="${SOFT}" stroke="${TEAL}" stroke-width="2" stroke-dasharray="6 6"/>`;
      s += `<rect x="86" y="${y + 55}" width="32" height="24" rx="4" fill="none" stroke="${TEAL}" stroke-width="2.5"/>` +
        `<circle cx="102" cy="${y + 67}" r="6" fill="none" stroke="${TEAL}" stroke-width="2.5"/>` +
        `<rect x="95" y="${y + 50}" width="14" height="7" rx="2" fill="${TEAL}"/>`;
    }
    s += t(170, y + 50, title, { size: 18, weight: "800", fill: V2INK });
    // helper chip — the concrete examples, so "activity space" isn't guessed at
    const cw = 26 + hint.length * 8.2;
    s += rrect(170, y + 66, cw, 34, 17, SOFT) + t(170 + cw / 2, y + 88, hint, { size: 13.5, anchor: "middle", fill: TEALDK, weight: "700" });
    s += t(482, y + 56, filled ? "Retake" : "Add", { size: 15, anchor: "end", fill: TEAL, weight: "700" });
  });

  // extra photos beyond the required three — a big space, a second location, or just more proof.
  // Dashed + "optional" so it reads as a bonus, never a fourth required slot.
  s += `<rect x="34" y="678" width="472" height="60" rx="18" fill="none" stroke="${LINE}" stroke-width="2" stroke-dasharray="7 7"/>`;
  s += t(64, 715, "+", { size: 30, fill: TEAL, weight: "700" });
  s += t(96, 714, "Add another photo", { size: 16.5, fill: NAVY, weight: "700" });
  s += t(482, 714, "Optional", { size: 14, anchor: "end", fill: MUTED });

  // ⚠️ Settled 2026-07-21: animals visible IN the space are GOOD — a wide shot with dogs in the yard
  // proves both the facility and that it's a live rescue; an empty room proves neither. The only thing
  // to avoid is a close-up PORTRAIT of one animal, which shows a face and no space. So the copy
  // encourages animals-in-context and forbids only the portrait — not animals outright.
  s += `<rect x="34" y="756" width="472" height="82" rx="18" fill="${WARNBG}"/>`;
  s += alertIcon(70, 799, 16, WARN2);
  s += t(100, 788, "Show the space — animals in it are good.", { size: 14.5, fill: WARN2, weight: "700" });
  s += t(100, 812, "Just avoid close-up portraits of one animal.", { size: 13.5, fill: WARN });

  s += btn(866, "Done · 1 of 3");
  s += t(270, 970, "You can add the rest before you submit.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Shelter verify — Tier 2: registered NGO / foundation (adds to Tier 1) ----------
// opts.baiPending → the PROVISIONAL path (added 2026-07-21). The BAI certificate is an annual
// government licence with a slow, inspection-gated issue process, so a legitimately SEC-registered
// NGO can be stuck waiting on it for weeks. Walling them out of every tier-2 feature until it lands
// punishes the paperwork, not the risk. So a shelter can submit with **SEC + vet now and BAI as
// applied-not-yet-issued**, and gets a PROVISIONAL Verified Shelter status.
//
// ⚠️ NO capability restrictions (decided 2026-07-21) — a partially-verified shelter is fully active.
// Provisional is purely an **account-status label** naming what's verified so far, symmetric either
// way: SEC in / BAI pending → "In-Progress · SEC-Verified"; BAI in / SEC pending → "…BAI-Verified".
// (An earlier version gated escalation-partner until BAI; that was dropped — status marker, not wall.)
// Screen only for now; the status model is a docs-pass follow-up.
function shelterVerifyTier2(opts = {}) {
  const bai = !!opts.baiPending;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("NGO documents") + steps4(3);
  s += t(34, 164, "NGO documents", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 198, bai ? "Step 2 of 2 — SEC now, BAI when it's ready." : "Step 2 of 2 — three more things.", { size: 17, fill: MUTED });

  // tier 2 is tier 1 PLUS this — say so, or it looks like the base checks were skipped
  s += rrect(34, 236, 472, 62, 16, OKBG);
  s += `<circle cx="72" cy="267" r="15" fill="${OK}"/>` +
    `<polyline points="66,267 70,272 79,261" fill="none" stroke="${WHITE}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(100, 273, "Rescuer checks done — ID, address, photos", { size: 14.5, fill: "#27500A", weight: "700" });

  s += t(34, 330, "Documents", { size: 20, weight: "800", fill: V2INK });

  // SEC card — always uploaded here
  s += rrect(34, 352, 472, 96, 20, WHITE, LINE);
  s += avq(82, 400, 26, SOFT) + docGlyph(82, 400, TEAL);
  s += t(130, 394, "SEC registration", { size: 18, weight: "700", fill: NAVY });
  s += t(130, 420, "Your certificate of registration", { size: 13.5, fill: MUTED });
  s += `<circle cx="470" cy="400" r="15" fill="${OKBG}"/>` +
    `<polyline points="464,400 468,405 477,394" fill="none" stroke="${OK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`;

  // BAI card — carries the have-it/awaiting control ON THE CARD as a TOGGLE SWITCH. `bai` (=baiPending)
  // is the toggle in its OFF state ("I don't have it yet"). A switch reads as a binary state at a
  // glance — clearer than a text link, and reversible in one tap. The declaration lives on the
  // document it concerns, not a stray link at the foot of the screen.
  const have = !bai;
  const by = 458;
  s += rrect(34, by, 472, 124, 20, WHITE, LINE);
  s += avq(82, by + 44, 26, have ? SOFT : WARNBG) + docGlyph(82, by + 44, have ? TEAL : WARN2);
  s += t(130, by + 38, "BAI certificate", { size: 18, weight: "700", fill: NAVY });
  s += t(130, by + 64, have ? "Annual licence to operate · renews yearly" : "Applied — awaiting issuance",
    { size: 13.5, fill: have ? MUTED : WARN2, weight: have ? "normal" : "700" });
  // top-right status: uploaded ✓ when they have it · amber "Waiting" when not
  if (have) s += `<circle cx="470" cy="${by + 44}" r="15" fill="${OKBG}"/>` +
    `<polyline points="464,${by + 44} 468,${by + 49} 477,${by + 38}" fill="none" stroke="${OK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  else s += rrect(392, by + 28, 96, 32, 16, WARNBG) + clockIcon(410, by + 44, 10, WARN2) + t(426, by + 49, "Waiting", { size: 13, fill: WARN2, weight: "700" });
  // the toggle row inside the card — label + switch
  s += `<line x1="34" y1="${by + 88}" x2="506" y2="${by + 88}" stroke="${LINE}" stroke-width="1.5"/>`;
  s += t(58, by + 111, "I already have my BAI certificate", { size: 14.5, fill: NAVY, weight: "600" });
  s += toggleSwitch(428, by + 90, have);   // 54×31, top-left coords; right-aligned on the toggle row

  s += t(34, 616, "Affiliated vet", { size: 20, weight: "800", fill: V2INK });
  s += field(34, 642, 472, "Vet name", "Dr. Jose Ramos");
  s += field(34, 746, 472, "PRC licence number", "0123456");

  if (!have) {
    // toggle OFF → provisional. What it means: no features withheld; a status label until BAI arrives.
    s += `<rect x="34" y="852" width="472" height="86" rx="18" fill="#eaf4f2"/>`;
    s += clockIcon(72, 895, 15, TEALDK);
    s += t(100, 885, "You'll be active right away", { size: 14, fill: V2INK, weight: "700" });
    s += t(100, 908, "Nothing held back. Status shows In-Progress ·", { size: 12.5, fill: MUTED });
    s += t(100, 928, "SEC-Verified until your BAI comes through.", { size: 12.5, fill: MUTED });
    s += consentDocs(950, "verify our organisation");
    s += btn(1042, "Submit for review");
    return s;
  }

  s += t(34, 852, "We check the PRC number against the register.", { size: 13, fill: MUTED });
  s += consentDocs(880, "verify our organisation");
  s += btn(972, "Submit for review");
  s += deferUploads(1076);
  return s;
}

// ---------- Shelter dashboard — PROVISIONAL (SEC-verified, BAI pending) ----------
// The landing for a shelter approved on SEC while BAI is still in government processing (see the
// baiPending path in shelterVerifyTier2). Unlike -pending (fully gated) or -incomplete (nothing
// submitted), this org is LIVE — it just has one capability held back. The screen's whole job is to
// make that split legible: everything is on EXCEPT escalation, and escalation is waiting on a
// specific named document, not on Kupkop.
// opts.have = "sec" (default) or "bai" — which document is already verified. NO capability
// restrictions (decided 2026-07-21): a partially-verified shelter is FULLY active. The provisional
// state is purely an **account-status label** naming what's verified so far, symmetric either way:
//   - SEC in, BAI pending → "In-Progress · SEC-Verified"
//   - BAI in, SEC pending → "In-Progress · BAI-Verified"
// Nothing is gated; the only difference from a full Verified Shelter is the status chip and a nudge
// to add the missing document. (The earlier capability-split — escalation locked until BAI — was
// removed; keeping it as a status marker, not a wall.)
// V2 pass. Provisional = a tier-2 NGO active on a partial doc set (SEC-now/BAI-later or the
// reverse). ⚠️ NOT a restriction — "You're active" is the headline and nothing is withheld; the
// status chip and banner only name what's still outstanding. Tier-2 only (a tier-1 rescue has no
// SEC/BAI, so no provisional state).
function shelterDashboardProvisional(paws, opts = {}) {
  const haveSec = opts.have !== "bai";
  const haveLabel = haveSec ? "SEC-Verified" : "BAI-Verified";
  const missing = haveSec ? "BAI certificate" : "SEC registration";
  const missingShort = haveSec ? "BAI" : "SEC";
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false);
  s += t(34, 92, "PAWS Manila", { size: 28, weight: "800", fill: V2INK, ls: -0.5 });
  // account-status chip — names what's verified so far (decision 5); a status marker, not a gate
  const chipLabel = `In-Progress · ${haveLabel}`, cw = 42 + chipLabel.length * 8.5;
  s += rrect(506 - cw, 66, cw, 34, 17, WARNBG) + `<circle cx="${506 - cw + 18}" cy="83" r="4.5" fill="${WARN2}"/>` +
    t(506 - cw + 30, 88, chipLabel, { size: 13, fill: WARN2, weight: "700" });
  s += t(34, 124, "Shelter dashboard", { size: 16, fill: MUTED });

  // teal "you're active" banner — a completion nudge, not a gate
  s += rrect(34, 152, 472, 108, 22, "#E2EEF0");
  s += v2squircle(82, 206, 46, "#CDE7E3", 15) + clockIcon(82, 206, 18, TEALDK);
  s += t(124, 197, "You're active", { size: 19, weight: "800", fill: V2INK });
  s += t(124, 225, "Everything's on — add your", { size: 13.5, fill: "#5f6b6a" });
  s += t(124, 246, `${missing} to finish.`, { size: 13.5, fill: "#5f6b6a" });
  s += t(486, 214, `Add ${missingShort} ›`, { size: 15.5, anchor: "end", weight: "700", fill: TEALDK });

  // full working dashboard — real numbers, nothing locked
  const SY = 288;
  [["4", "Listings", "paw"], ["1", "Adopted", "heart"], ["12", "Donations", "peso"]].forEach(([n, lab, ic], i) => {
    const x = 34 + i * 162;
    const [bg, fg] = ic === "paw" ? [SOFT, TEAL] : ic === "heart" ? ["#EAF3DE", "#27500A"] : ["#F2EFE7", "#8a5a12"];
    s += v2card(x, SY, 148, 104, 22);
    s += v2squircle(x + 40, SY + 34, 38, bg, 12);
    if (ic === "paw") s += pawmark(x + 40, SY + 35, 11, fg);
    else if (ic === "heart") s += heartIcon(x + 40, SY + 34, 24, fg);
    else s += t(x + 40, SY + 42, "₱", { size: 20, anchor: "middle", weight: "800", fill: fg });
    s += t(x + 22, SY + 72, n, { size: 26, weight: "800", fill: V2INK });
    s += t(x + 22, SY + 94, lab, { size: 13, fill: MUTED });
  });

  s += v2btn(416, "+  List an animal");
  s += t(270, 518, "Goes live to adopters right away.", { size: 15, anchor: "middle", fill: MUTED });

  // quick-action tiles — all unlocked (nothing is withheld in the provisional state)
  ["Listings", "Donations", "Requests"].forEach((lab, i) => {
    const x = 34 + i * 162;
    const [bg, fg] = i === 0 ? [SOFT, TEAL] : i === 1 ? ["#F2EFE7", "#8a5a12"] : ["#E2EEF0", TEALDK];
    s += v2card(x, 552, 148, 104, 22);
    s += v2squircle(x + 40, 588, 38, bg, 12);
    if (i === 0) s += pawmark(x + 40, 589, 11, fg);
    else if (i === 1) s += t(x + 40, 596, "₱", { size: 20, anchor: "middle", weight: "800", fill: fg });
    else s += `<rect x="${x + 29}" y="581" width="22" height="15" rx="3.5" fill="${fg}"/><path d="M${x + 29} 584 l11 7 l11 -7" fill="none" stroke="${WHITE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += t(x + 22, 636, lab, { size: 16.5, weight: "700", fill: V2INK });
  });

  // reassurance strip
  s += rrect(34, 684, 472, 76, 22, SOFT);
  s += clockIcon(74, 722, 15, TEAL);
  s += t(102, 728, `We'll email you the moment your ${missingShort} is verified.`, { size: 13.5, fill: TEALDK, weight: "600" });

  s += shelterNav(0);
  return s;
}

// ---------- Shelter verify: resubmit after needs_info / rejected ----------
// Target of "Update documents" on shelter-verify-needs-info. Distinct from the first-time upload:
// it carries the reviewer's note forward and marks WHICH file to replace — otherwise the shelter
// lands on a blank uploader knowing something's wrong but not what. Resubmitting returns the
// verification_request to `pending` (state machine: needs_info / rejected → pending).
// NB: the green check here means APPROVED as of the per-document status added for the tracker
// (`verification_document.status`) — it used to mean merely UPLOADED, back when only the request
// carried a status. See verifyDocuments() for the full per-file view.
// opts.ngo → the tier-2 doc set. The resubmit list mirrors what the applicant's tier actually
// submitted (tier 1: ID / billing / photos · tier 2: + SEC / BAI / vet) — the old generic list
// showed docs a tier-1 rescuer never uploaded.
function shelterVerifyResubmit(opts = {}) {
  const ngo = !!opts.ngo;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Resubmit documents");
  s += t(34, 168, "One document needs a fix", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 202, "Replace it and resubmit — the rest are fine.", { size: 18, fill: MUTED });

  // the reviewer's note travels with the fix, so it's readable while they act on it
  s += rrect(34, 244, 472, 118, 20, DANGERBG, DANGERLN);
  s += t(58, 284, "REVIEWER NOTE", { size: 14, weight: "700", fill: DANGER, ls: 1 });
  s += t(58, 318, ngo ? "Your BAI certificate expired in March —" : "The utility bill photo is unreadable —", { size: 17, fill: NAVY });
  s += t(58, 344, ngo ? "please upload this year's licence." : "please re-upload a clearer copy.", { size: 17, fill: NAVY });

  s += t(34, 412, "Your documents", { size: 22, weight: "800", fill: V2INK });
  const docs = ngo ? [
    ["SEC registration", "sec-cert.pdf", false],
    ["BAI certificate", "bai-2025.pdf · expired", true],
    ["Affiliated vet (PRC)", "Dr. Jose Ramos · 0123456", false],
  ] : [
    ["Government-issued ID", "maria-id.jpg", false],
    ["Proof of billing", "meralco-bill.pdf · unreadable", true],
    ["Photos of rescue space", "3 photos", false],
  ];
  docs.forEach(([title, file, bad], i) => {
    const y = 440 + i * 122;
    s += rrect(34, y, 472, 106, 20, WHITE, bad ? DANGERLN : LINE);
    s += `<circle cx="86" cy="${y + 53}" r="30" fill="${bad ? DANGERBG : SOFT}"/>` + docGlyph(86, y + 53, bad ? DANGER : TEAL);
    // title stays at 17 so the longest doc name clears the Replace pill on its right
    s += t(140, y + 46, title, { size: 17, weight: "700", fill: NAVY });
    s += t(140, y + 74, file, { size: 15, fill: bad ? DANGER : MUTED, weight: bad ? "600" : "normal" });
    if (bad) {
      s += `<rect x="414" y="${y + 31}" width="92" height="44" rx="22" fill="url(#v2danger)"/>` + t(460, y + 59, "Replace", { size: 15, anchor: "middle", fill: WHITE, weight: "700" });
    } else {
      s += `<circle cx="470" cy="${y + 53}" r="16" fill="${OKBG}"/>` +
        `<polyline points="463,${y + 53} 468,${y + 59} 478,${y + 46}" fill="none" stroke="${OK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  });

  s += t(34, 838, "Only the flagged file is replaced — the others stay.", { size: 14, fill: MUTED });
  s += btn(884, "Resubmit for review");
  s += t(270, 990, "Back to under review · usually 1–2 business days", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Shelter verify: "resubmitted" confirmation (modal over the resubmit screen) ----------
// Tapping "Resubmit for review" shows this before returning — a resubmit sends the
// verification_request needs_info/rejected → pending, so the shelter should get a clear receipt
// (they've been rejected once; silence here reads as "did it even go through?").
function shelterVerifyResubmitDone(opts = {}) {
  let s = shelterVerifyResubmit(opts);
 s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;
  s += `<rect x="50" y="316" width="440" height="536" rx="26" fill="${WHITE}" filter="url(#v2sh)"/>`;

  s += `<circle cx="270" cy="404" r="52" fill="${OKBG}"/>`;
  s += `<polyline points="246,404 264,422 296,384" fill="none" stroke="${OK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(270, 512, "Documents resubmitted", { size: 25, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 550, "Your application is back under review.", { size: 16, anchor: "middle", fill: MUTED });
  s += t(270, 576, "We usually take 1–2 business days.", { size: 16, anchor: "middle", fill: MUTED });

  // reassurance strip — the org is still usable while it waits (draft-only, gated-public)
  s += `<rect x="82" y="612" width="376" height="60" rx="16" fill="${SOFT}"/>`;
  s += clockIcon(116, 642, 15, TEAL);
  s += t(144, 648, "Keep drafting — you go live once approved", { size: 13.5, fill: TEALDK, weight: "600" });

  s += `<rect x="82" y="700" width="376" height="64" rx="32" fill="url(#v2btn)" filter="url(#v2soft)"/>` + t(270, 740, "Back to dashboard", { size: 20, anchor: "middle", fill: WHITE, weight: "700" });
  return s;
}

// ---------- Verification: per-document tracker ("My documents") ----------
// Reached from "Track my documents" on the verify-status screens (shelter) and the Verified Member
// pending banner (rescuer). Answers the one question the request-level states can't: *which* of my
// files is holding this up. shelter-verify-* only ever showed ONE overall state plus a free-text
// reviewer note, so a shelter with four uploads could see "More info needed" and still not know
// which file to fix without reading prose.
//
// Requires per-document review state — `verification_document.status` (pending/approved/rejected)
// + `review_note` / `reviewed_at` / `reviewed_by`, added to the schema for this screen. Before that
// column existed the green check on the resubmit screen meant UPLOADED, not approved.
//
// Ordering is the whole point: outstanding files first (rejected above in-review), and everything
// already cleared collapses into ONE summary row. The screen is named for what the user came to do
// — find the unapproved files — not for enumerating a folder. That also keeps every variant short
// enough to fit without scrolling, incl. the 7-document NGO set.
//
// opts.ngo → tier-2 shelter (SEC/BAI/vet on top of the tier-1 base) · opts.rescuer → the Verified
// Member set (ID + social link), which has no rejected row so the clean state is covered too.
function verifyDocuments(opts = {}) {
  const ngo = !!opts.ngo, rescuer = !!opts.rescuer;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("My documents");

  s += t(34, 152, "Document status", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 186, rescuer ? "Each item is reviewed on its own." : "Each file is reviewed on its own.", { size: 18, fill: MUTED });

  // outstanding = rejected + in-review. Rejected rows carry the reviewer's note inline, so the fix
  // is readable where the user is deciding — same principle as the resubmit screen.
  const outstanding = rescuer ? [
    ["Government-issued ID", "maria-id.jpg · uploaded 9 Jul", "review"],
  ] : ngo ? [
    ["BAI certificate", "bai-2025.pdf", "reject", "Expired in March — upload this year's licence."],
    ["SEC registration", "sec-cert.pdf · uploaded 9 Jul", "review"],
  ] : [
    ["Proof of billing", "meralco-bill.pdf", "reject", "Photo is unreadable — send a clearer copy."],
    ["Photos of rescue space", "3 photos · uploaded 9 Jul", "review"],
  ];
  const approved = rescuer
    ? [["Social link", "facebook.com/maria.santos"]]
    : ngo
      ? [["Government-issued ID", "maria-id.jpg"], ["Proof of billing", "meralco-bill.pdf"],
         ["Photos of rescue space", "3 photos"], ["Affiliated vet (PRC)", "Dr. Jose Ramos · 0123456"],
         ["Social link", "facebook.com/pawsmanila"]]
      : [["Government-issued ID", "maria-id.jpg"], ["Social link", "facebook.com/pawsmanila"]];
  const nReject = outstanding.filter(d => d[2] === "reject").length;
  const nReview = outstanding.length - nReject;

  // summary strip — the at-a-glance count, mirroring the 3-stat card used on the dashboards
  const sy = 216;
  s += rrect(34, sy, 472, 104, 24, WHITE, LINE);
  [[String(approved.length), "Approved", OK], [String(nReview), "In review", TEALDK],
   [String(nReject), "Needs a fix", nReject ? DANGER : MUTED]].forEach(([n, lab, col], i) => {
    const cx = 34 + (i + 0.5) * (472 / 3);
    if (i) s += `<line x1="${34 + i * (472 / 3)}" y1="${sy + 26}" x2="${34 + i * (472 / 3)}" y2="${sy + 80}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += t(cx, sy + 54, n, { size: 28, anchor: "middle", weight: "800", fill: col });
    s += t(cx, sy + 84, lab, { size: 16, anchor: "middle", fill: MUTED });
  });

  s += t(34, 372, nReject ? "Needs your attention" : "Still being checked", { size: 22, weight: "800", fill: V2INK });

  let y = 398;
  outstanding.forEach(([title, file, st, note]) => {
    const bad = st === "reject", h = bad ? 154 : 106;
    s += rrect(34, y, 472, h, 20, WHITE, bad ? DANGERLN : LINE);
    s += `<circle cx="86" cy="${y + 53}" r="30" fill="${bad ? DANGERBG : SOFT}"/>` + docGlyph(86, y + 53, bad ? DANGER : TEAL);
    s += t(140, y + 46, title, { size: 17, weight: "700", fill: NAVY });
    s += t(140, y + 74, file, { size: 15, fill: MUTED });
    s += statusPill(482, y + 34, bad ? "reject" : "review");
    if (bad) {
      // the reviewer's reason sits with the file it belongs to — not pooled in one note at the top
      s += `<line x1="58" y1="${y + 104}" x2="482" y2="${y + 104}" stroke="${LINE}" stroke-width="1.5"/>`;
      s += t(58, y + 132, note, { size: 15, fill: DANGER });
    }
    y += h + 16;
  });

  // everything cleared collapses to one row — approved files need acknowledgement, not real estate
  s += t(34, y + 28, "Already approved", { size: 22, weight: "800", fill: V2INK });
  y += 54;
  s += rrect(34, y, 472, 96, 20, WHITE, LINE);
  s += `<circle cx="86" cy="${y + 48}" r="30" fill="${OKBG}"/>`;
  s += `<polyline points="74,${y + 48} 82,${y + 57} 99,${y + 38}" fill="none" stroke="${OK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(140, y + 42, approved.length + (approved.length === 1 ? " item approved" : " items approved"), { size: 19, weight: "800", fill: V2INK });
  s += t(140, y + 70, approved.map(d => d[0]).join(", ").slice(0, 40) + (approved.map(d => d[0]).join(", ").length > 40 ? "…" : ""), { size: 14, fill: MUTED });
  s += t(486, y + 54, "View ›", { size: 16, anchor: "end", fill: TEAL, weight: "700" });
  y += 96;

  // CTA follows the state: a rejected file is actionable now, an in-review one is only waitable
  if (nReject) {
    s += btn(y + 44, "Replace flagged file");
    s += t(270, y + 148, "Only the flagged file is replaced — the rest stay approved.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  } else {
    s += rrect(34, y + 44, 472, 88, 20, SOFT);
    s += clockIcon(78, y + 88, 20, TEAL);
    s += t(116, y + 80, "Nothing for you to do", { size: 18, weight: "700", fill: TEALDK });
    s += t(116, y + 108, "We'll notify you when the review is done.", { size: 15, fill: TEALDK });
    s += t(270, y + 172, "Submitted 9 Jul 2026 · usually 1–2 business days", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  }
  return s;
}

// right-aligned status pill; x is the RIGHT edge so it hangs off the card's inner margin
function statusPill(xRight, y, st) {
  const map = {
    approved: ["Approved", OKBG, OK],
    review: ["In review", SOFT, TEALDK],
    reject: ["Needs a new copy", DANGERBG, DANGER],
  };
  const [label, bg, fg] = map[st];
  const w = 26 + label.length * 8.2;
  return rrect(xRight - w, y, w, 38, 19, bg) +
    t(xRight - w / 2, y + 25, label, { size: 14, anchor: "middle", fill: fg, weight: "700" });
}

// ---------- Shelter verify 2: Status (pending / needs_info) ----------
// state: "pending" | "needs_info" | "rejected" — the three review outcomes a shelter can land on.
// They are colour-separated on purpose: needs_info is AMBER (fixable, we need one more thing) and
// rejected is RED (declined). Rendering both in danger red made them indistinguishable, which is
// also how the ops console reads them (Needs info = info chip, Rejected = danger chip).
function shelterVerifyStatus(state) {
  const pending = state === "pending";
  const rejected = state === "rejected";
  const heroBg = pending ? SOFT : rejected ? DANGERBG : WARNBG;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Verification");
  s += `<circle cx="270" cy="230" r="72" fill="${heroBg}"/>`;
  if (pending) s += clockIcon(270, 230, 42, TEAL);
  else if (rejected) {
    s += `<circle cx="270" cy="230" r="42" fill="none" stroke="${DANGER}" stroke-width="4"/>`;
    s += `<line x1="255" y1="215" x2="285" y2="245" stroke="${DANGER}" stroke-width="4" stroke-linecap="round"/>`;
    s += `<line x1="285" y1="215" x2="255" y2="245" stroke="${DANGER}" stroke-width="4" stroke-linecap="round"/>`;
  } else s += alertIcon(270, 230, 42, WARN2);
  s += t(270, 356, pending ? "Under review" : rejected ? "Not verified" : "More info needed", { size: 30, anchor: "middle", weight: "700", fill: NAVY });

  if (pending) {
    s += t(270, 396, "We're checking your documents.", { size: 19, anchor: "middle", fill: MUTED });
    s += t(270, 424, "This usually takes 1–2 business days.", { size: 19, anchor: "middle", fill: MUTED });
    s += stepper(["Submitted", "In review", "Approved"], 1, 510);
    s += rrect(34, 604, 472, 128, 20, WHITE, LINE);
    s += t(58, 646, "Keep going while you wait", { size: 20, weight: "800", fill: V2INK });
    s += t(58, 680, "Draft your listings now — they go live", { size: 17, fill: MUTED });
    s += t(58, 706, "automatically once you're approved.", { size: 17, fill: MUTED });
    s += btn(788, "Go to dashboard");
    // entry to the per-document tracker — "under review" is exactly when a shelter wants to know
    // which of its four uploads is actually holding things up
    s += btnOutline(872, "Track my documents");
    s += t(270, 968, "Submitted 9 Jul 2026 · PAWS Manila", { size: 15, anchor: "middle", fill: "#b8b6ad" });
  } else if (rejected) {
    // harder outcome than needs_info: the org couldn't be verified at all. Still recoverable —
    // the state machine allows rejected → resubmit → pending — so the exit is the same fix path.
    s += t(270, 396, "We couldn't verify your org with the", { size: 19, anchor: "middle", fill: MUTED });
    s += t(270, 424, "documents provided.", { size: 19, anchor: "middle", fill: MUTED });
    s += rrect(34, 464, 472, 150, 20, DANGERBG, DANGERLN);
    s += t(58, 506, "REVIEWER NOTE", { size: 15, weight: "700", fill: DANGER, ls: 1 });
    s += t(58, 544, "The registration number doesn't match", { size: 18, fill: NAVY });
    s += t(58, 572, "the uploaded SEC certificate.", { size: 18, fill: NAVY });
    s += t(34, 652, "Your org stays in draft — fix this and resubmit.", { size: 15, fill: MUTED });
    s += btn(690, "Resubmit documents");
    s += btnOutline(774, "Contact support");
    // lighter than a third button: the primary fix path already leads to the doc list
    s += t(270, 884, "Track my documents ›", { size: 17, anchor: "middle", fill: TEAL, weight: "700" });
  } else {
    s += t(270, 396, "One document needs a clearer copy.", { size: 19, anchor: "middle", fill: MUTED });
    s += rrect(34, 464, 472, 150, 20, WARNBG);
    s += t(58, 506, "REVIEWER NOTE", { size: 15, weight: "700", fill: WARN2, ls: 1 });
    s += t(58, 544, "The SEC certificate photo is blurry —", { size: 18, fill: NAVY });
    s += t(58, 572, "please re-upload a clearer copy.", { size: 18, fill: NAVY });
    s += btn(690, "Update documents");
    s += btnOutline(774, "Contact support");
    s += t(270, 884, "Track my documents ›", { size: 17, anchor: "middle", fill: TEAL, weight: "700" });
  }
  return s;
}

// ---------- Shelter dashboard — pending (gating in context) ----------
// opts.submitted = false → the org exists but NO documents have been sent yet.
//
// ⚠️ These are TWO states and this screen used to render both at once — an amber "Under review"
// banner (which is only true after submission) directly above a teal "Upload your documents to get
// approved" card (which is only true before it). A shelter saw the app claim it was reviewing files
// it had never received. The split is the fix; the two states never share a component.
//
// Derived, not stored, like every other verification state: **no `verification_request(shelter_org)`
// row at all = not submitted**; a row in `pending` = under review. No schema change.
//
// Why the not-submitted state has to exist: the tier-2 document set is SEC papers, an annual BAI
// certificate and a vet's PRC number — filing-cabinet documents, not photos already on a phone. If
// uploading is a hard gate, a shelter signing up in the evening abandons onboarding with an account
// already created at OTP and nowhere useful to land. Typing is required inline; uploading is resumable.
// V2 pass. opts.submitted (default true) → documents sent (Under review) vs not (Documents not
// sent). opts.tier1 → Community-rescue variant (home-heart name/copy). Draft-only, gated-public:
// Donations is the one locked quick action; the foot card carries the useful next move per state.
function shelterDashboardPending(paws, opts = {}) {
  const submitted = opts.submitted !== false;
  const tier1 = !!opts.tier1;
  const name = tier1 ? "Aling Nena's Rescue" : "PAWS Manila";
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false);
  s += t(34, 92, name, { size: 28, weight: "800", fill: V2INK, ls: -0.5 });
  const pill = "Unverified", pw = 44 + pill.length * 9.5;
  s += rrect(506 - pw, 68, pw, 34, 17, GREYPILL) + `<circle cx="${506 - pw + 18}" cy="85" r="4.5" fill="${MUTED}"/>` +
    t(506 - pw + 30, 90, pill, { size: 14, fill: MUTED, weight: "700" });
  s += t(34, 124, tier1 ? "Rescue dashboard" : "Shelter dashboard", { size: 16, fill: MUTED });

  // amber status banner — states the CONSEQUENCE; the foot card carries the ACTION
  s += rrect(34, 152, 472, 108, 22, WARNBG);
  s += v2squircle(82, 206, 46, "#F3E1BE", 15);
  s += submitted ? clockIcon(82, 206, 18, WARN2) : alertIcon(82, 206, 18, WARN2);
  s += t(124, 197, submitted ? "Under review" : "Documents not sent yet", { size: 19, weight: "800", fill: WARN2 });
  s += t(124, 225, submitted ? "Listings stay hidden &amp; donations off" : "We can't start checking until you", { size: 13.5, fill: "#8a6d3b" });
  s += t(124, 246, submitted ? "until approved." : "upload them.", { size: 13.5, fill: "#8a6d3b" });
  s += t(486, 214, submitted ? "Status ›" : "Upload ›", { size: 15.5, anchor: "end", weight: "700", fill: WARN2 });

  // stat tiles (draft state)
  const SY = 288;
  [[tier1 ? "1" : "3", tier1 ? "Draft" : "Drafts", "paw"], ["0", "Adopted", "heart"], ["0", "Donations", "peso"]].forEach(([n, lab, ic], i) => {
    const x = 34 + i * 162;
    const [bg, fg] = ic === "paw" ? [SOFT, TEAL] : ic === "heart" ? ["#EAF3DE", "#27500A"] : ["#F2EFE7", "#8a5a12"];
    s += v2card(x, SY, 148, 104, 22);
    s += v2squircle(x + 40, SY + 34, 38, bg, 12);
    if (ic === "paw") s += pawmark(x + 40, SY + 35, 11, fg);
    else if (ic === "heart") s += heartIcon(x + 40, SY + 34, 24, fg);
    else s += t(x + 40, SY + 42, "₱", { size: 20, anchor: "middle", weight: "800", fill: fg });
    s += t(x + 22, SY + 72, n, { size: 26, weight: "800", fill: V2INK });
    s += t(x + 22, SY + 94, lab, { size: 13, fill: MUTED });
  });

  // primary action
  s += v2btn(416, "+  List an animal");
  s += t(270, 518, "Saved as a draft until you're verified.", { size: 15, anchor: "middle", fill: MUTED });

  // quick-action tiles — Donations locked (gated-public)
  ["Listings", "Donations", "Requests"].forEach((lab, i) => {
    const x = 34 + i * 162, locked = i === 1;
    const [bg, fg] = i === 0 ? [SOFT, TEAL] : i === 1 ? ["#F2EFE7", "#8a5a12"] : ["#E2EEF0", TEALDK];
    s += v2card(x, 552, 148, 104, 22);
    s += v2squircle(x + 40, 588, 38, locked ? "#ECEAE3" : bg, 12);
    if (i === 0) s += pawmark(x + 40, 589, 11, fg);
    else if (i === 1) s += t(x + 40, 596, "₱", { size: 20, anchor: "middle", weight: "800", fill: "#B4B8B0" });
    else s += `<rect x="${x + 29}" y="581" width="22" height="15" rx="3.5" fill="${fg}"/><path d="M${x + 29} 584 l11 7 l11 -7" fill="none" stroke="${WHITE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += t(x + 22, 636, lab, { size: 16.5, weight: "700", fill: locked ? "#9a9e96" : V2INK });
    if (locked) s += `<circle cx="${x + 122}" cy="574" r="14" fill="#ECEAE3"/>` + lockIcon(x + 122, 575, 13, "#8a8e86");
  });

  // foot accent card — the useful next move, differs by state
  s += rrect(34, 684, 472, 100, 22, "#E2EEF0");
  s += t(58, 724, submitted ? "Draft your listings while you wait" : "Finish verifying to go live", { size: 17.5, weight: "800", fill: TEALDK });
  s += t(58, 752, submitted ? "They go live the moment you're approved." : "Upload your documents to get approved.", { size: 13.5, fill: "#5f6b6a" });
  s += t(486, 738, submitted ? "Start ›" : "Continue ›", { size: 16, anchor: "end", weight: "800", fill: TEALDK });

  s += shelterNav(0);
  return s;
}

// ---------- Shelter 1: Set up your shelter ----------
function shelterSetup(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Set up your shelter") + steps4(2);
  s += t(34, 168, "Tell us about your org", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 202, "This helps adopters trust your listings.", { size: 18, fill: MUTED });

  // logo uploader row
  s += `<circle cx="74" cy="272" r="40" fill="${SOFT}" stroke="${LINE}" stroke-width="2" stroke-dasharray="6 7"/>` + pawIcon(paws.teal.uri, 74, 272, 34);
  s += t(132, 262, "Add organization logo", { size: 20, weight: "700", fill: TEAL });
  s += t(132, 292, "PNG or JPG, square works best.", { size: 16, fill: MUTED });

  s += field(34, 336, 472, "Organization name", "PAWS Manila");

  s += t(34, 468, "Organization type", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 484, ["Shelter", "Rescue", "Clinic"], 0);

  s += field(34, 566, 472, "Registration no. (SEC / DTI / LGU)", "CN-2019-0482");
  s += field(34, 688, 472, "Address", "12 Aurora Blvd, Marikina City");

  s += btn(820, "Continue");
  s += t(270, 924, "Next: how people reach you", { size: 15, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Shelter setup 2 of 2: contact details ----------
// Split from shelter-setup: the org's 8 fields don't fit one viewport, and the DP §6.4 field
// table already groups them — identity / registration / location here vs. the contact group
// (person + role, phone, website / FB) on this step.
function shelterSetupContact(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Contact details") + steps4(2);
  s += t(34, 168, "How can people reach you?", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 202, "Adopters see this — our reviewers check it.", { size: 18, fill: MUTED });

  // Prefilled from the signup name — say so, or it reads as being asked twice. It stays
  // editable because the public contact isn't always the admin who created the account.
  s += field(34, 250, 472, "Contact person", "Maria Santos");
  s += `<circle cx="44" cy="348" r="8" fill="${OKBG}"/>` +
    `<polyline points="40,348 43,351 48,344" fill="none" stroke="${OK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(60, 353, "From your account — change if someone else is the contact.", { size: 13, fill: MUTED });

  // role — an enum-ish choice, so chips rather than free text (also keeps the form short)
  s += t(34, 388, "Their role", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 404, ["Owner", "Staff", "Volunteer"], 0);

  // ⚠️ This is where a SHELTER's phone gets verified (decision 14). Owners defer it to first use, but
  // `official_phone` is required here and a shelter nobody can reach is useless to an adopter — so the
  // SMS happens on Continue. Shelters are a small share of accounts, so the bill stays bounded while
  // the reachability guarantee lands exactly where it matters.
  s += field(34, 486, 472, "Contact number", "917 123 4567", { prefix: "+63" });
  s += t(34, 594, "We’ll text a code to verify this number.", { size: 13, fill: MUTED });
  s += field(34, 626, 472, "Website / Facebook page", "facebook.com/pawsmanila");

  s += rrect(34, 738, 472, 76, 16, "#eaf4f2");
  s += `<circle cx="74" cy="776" r="17" fill="${TEAL}"/>` + personIcon(74, 776, 20, WHITE);
  s += t(104, 770, "Who are we talking to?", { size: 15, weight: "700", fill: TEALDK });
  s += t(104, 794, "The role helps our reviewers verify your org.", { size: 13, fill: MUTED });

  s += btn(848, "Continue");
  s += t(270, 952, "Documents come next — you can save and finish later.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Shelter 2: Dashboard ----------
// v2 rollout: the approved pilot (queue row + stat icons) IS the dashboard now.
function shelterDashboard(paws) { return shelterDashboardV2(paws); }
function shelterDashboardV1_unused(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + statusbar(false);
  s += t(34, 92, "PAWS Manila", { size: 28, weight: "800", fill: V2INK });
  s += verified(258, 84, 15);
  s += t(34, 124, "Shelter dashboard", { size: 19, fill: MUTED });
  // bell icon
  s += `<circle cx="496" cy="88" r="26" fill="${WHITE}" stroke="${LINE}"/>`;
  s += `<path d="M487 92 q0 -13 9 -13 q9 0 9 13 l3 5 h-24 z" fill="none" stroke="${NAVY}" stroke-width="2.4" stroke-linejoin="round"/>` +
       `<path d="M493 99 a3.5 3.5 0 0 0 7 0" fill="none" stroke="${NAVY}" stroke-width="2.4"/>`;

  // stat card
  const sy = 156;
  s += rrect(34, sy, 472, 116, 24, WHITE, LINE);
  [["12", "Listed"], ["34", "Adopted"], ["132", "Donations"]].forEach(([n, lab], i) => {
    const cx = 34 + (i + 0.5) * (472 / 3);
    if (i) s += `<line x1="${34 + i * (472 / 3)}" y1="${sy + 28}" x2="${34 + i * (472 / 3)}" y2="${sy + 88}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += t(cx, sy + 56, n, { size: 26, anchor: "middle", weight: "700", fill: NAVY });
    s += t(cx, sy + 88, lab, { size: 17, anchor: "middle", fill: MUTED });
  });

  s += btn(300, "+  List an animal");

  // quick action cards (Volunteer added → shelter Kawang-Gawa)
  const qa = [["Listings", "paw"], ["Volunteer", "person"], ["Donations", "peso"], ["Requests", "mail"]];
  const qtw = 109;
  qa.forEach(([lab, ic], i) => {
    const x = 34 + i * 121, gx = x + qtw / 2;
    s += rrect(x, 396, qtw, 116, 18, WHITE, LINE);
    s += avq(gx, 436, 24);
    if (ic === "person") s += personIcon(gx, 436, 30, TEAL);
    else if (ic === "peso") s += t(gx, 445, "₱", { size: 24, anchor: "middle", fill: TEAL, weight: "700" });
    else if (ic === "mail") s += mailIcon(gx, 436, TEAL);
    else s += pawIcon(paws.teal.uri, gx, 436, 26);
    s += t(gx, 492, lab, { size: 15, anchor: "middle", weight: "700", fill: NAVY });
  });

  // adoption requests
  s += t(34, 566, "Adoption requests", { size: 24, weight: "800", fill: V2INK });
  s += t(506, 566, "See all", { size: 18, anchor: "end", fill: TEAL, weight: "700" });
  const reqs = [["Ana Reyes", "wants to adopt Milo", "New"], ["Maria Santos", "adopting Bruno", "Step 4 of 6"]];
  reqs.forEach(([nm, meta, st], i) => {
    const y = 596 + i * 104;
    s += rrect(34, y, 472, 88, 20, WHITE, LINE);
    s += avq(82, y + 44, 28) + t(82, y + 52, nm.split(" ").map(w => w[0]).join(""), { size: 20, anchor: "middle", weight: "700", fill: TEAL });
    s += t(128, y + 40, nm, { size: 21, weight: "800", fill: V2INK });
    s += t(128, y + 68, meta, { size: 17, fill: MUTED });
    if (st.startsWith("Step")) s += t(486, y + 50, st, { size: 15, anchor: "end", fill: TEAL, weight: "700" });
    else s += statusChip(486, y + 26, st);
  });

  s += shelterNav(0);
  return s;
}

// ---------- Shelter — org profile ("You" tab; building mark + Verified Shelter badge) ----------
// opts.tier: 2 (default — registered NGO, "Verified Shelter") | 1 (community rescue,
// "Verified Rescue"). Different tiers earn DIFFERENT badges — otherwise the NGO's heavier
// checks (SEC + BAI + vet) buy nothing visible and the tier distinction is invisible to adopters.
// V2 pass (modern language, matches shelterDashboardV2): soft-shadow cards, gradient-hero squircle
// avatar, V2 stat tiles, grouped list cards, floating nav. Both tiers render from this one function
// — tier1 only swaps the mark/name/badge/stats and turns the Organization card's 4th slot into a
// soft-teal "Upgrade to Verified Shelter" accent (where tier2 shows a plain Verification row), so
// the two variants share an identical layout and both clear the floating nav.
function shelterProfile(opts = {}) {
  const tier1 = opts.tier === 1;
  const pending = !!opts.pending; // unverified (draft-only, gated-public) — no green badge yet
  const name = tier1 ? "Aling Nena's Rescue" : "PAWS Manila";
  const badge = tier1 ? "Verified Rescue" : "Verified Shelter";
  const sub = tier1 ? "Community rescue · Quezon City" : "Registered NGO · Marikina City";
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false);
  s += t(34, 92, "Profile", { size: 29, weight: "800", fill: V2INK, ls: -0.5 });

  // identity card — gradient-hero squircle avatar + name + verified chip + type·city
  s += v2card(34, 108, 472, 262, 28);
  s += v2squircle(270, 194, 100, "url(#v2hero)", 32);
  s += tier1 ? homeHeartIcon(270, 194, 58, WHITE) : buildingIcon(270, 194, 48, WHITE);
  s += t(270, 292, name, { size: 27, anchor: "middle", weight: "800", fill: V2INK });
  if (pending) {
    const lab = "Under review", cw = 66 + lab.length * 10.5, cx0 = 270 - cw / 2;
    s += rrect(cx0, 314, cw, 40, 20, WARNBG) + clockIcon(cx0 + 24, 334, 11, WARN2) +
      t(cx0 + 42, 341, lab, { size: 16, weight: "800", fill: WARN2 });
  } else {
    const cw = 60 + badge.length * 10.5, cx0 = 270 - cw / 2;
    s += rrect(cx0, 314, cw, 40, 20, "#E2EEF0") + verified(cx0 + 24, 334, 11) +
      t(cx0 + 42, 341, badge, { size: 16, weight: "800", fill: TEALDK });
  }
  s += t(270, 360, sub, { size: 15.5, anchor: "middle", fill: MUTED });

  // stat tiles — same treatment as the dashboard (icon squircle + 800-weight count)
  const SY = 392;
  const stats = pending
    ? [[tier1 ? "1" : "3", tier1 ? "Draft" : "Drafts", "paw"], ["0", "Adopted", "heart"], ["0", "Volunteers", "person"]]
    : (tier1 ? [["4", "Listings", "paw"], ["11", "Adopted", "heart"], ["6", "Volunteers", "person"]]
             : [["12", "Listings", "paw"], ["34", "Adopted", "heart"], ["56", "Volunteers", "person"]]);
  stats.forEach(([n, lab, ic], i) => {
    const x = 34 + i * 162;
    const [bg, fg] = ic === "paw" ? [SOFT, TEAL] : ic === "heart" ? ["#EAF3DE", "#27500A"] : ["#ECEBF6", "#5b53a6"];
    s += v2card(x, SY, 148, 104, 22);
    s += v2squircle(x + 40, SY + 34, 38, bg, 12);
    if (ic === "paw") s += pawmark(x + 40, SY + 35, 11, fg);
    else if (ic === "heart") s += heartIcon(x + 40, SY + 34, 24, fg);
    else s += personIcon(x + 40, SY + 35, 26, fg);
    s += t(x + 22, SY + 72, n, { size: 26, weight: "800", fill: V2INK });
    s += t(x + 22, SY + 94, lab, { size: 13, fill: MUTED });
  });

  // grouped list-row helper (V2)
  const RH = 58, CX = 34, CW = 472;
  const orow = (gy, i, n, label, value, o = {}) => {
    const y0 = gy + i * RH;
    let r = t(CX + 32, y0 + 36, label, { size: 18.5, weight: "600", fill: o.danger ? "#B23B3B" : o.locked ? "#9a9e96" : V2INK });
    if (o.locked) r += lockIcon(CX + CW - 44, y0 + 28, 15, "#B4B8B0");
    else {
      if (value) r += t(CX + CW - 52, y0 + 36, value, { size: 15.5, anchor: "end", weight: "600", fill: MUTED });
      if (!o.noChev) r += t(CX + CW - 28, y0 + 40, "›", { size: 24, anchor: "end", weight: "700", fill: "#C9CEC7" });
    }
    if (i < n - 1 && !o.noRule) r += `<line x1="${CX + 32}" y1="${y0 + RH}" x2="${CX + CW - 24}" y2="${y0 + RH}" stroke="${LINE}" stroke-width="1.5"/>`;
    return r;
  };

  // Organization
  s += t(34, 536, "Organization", { size: 21, weight: "800", fill: V2INK });
  const OGY = 554;
  // slot 4 is an accent (under-review / upgrade) rather than a plain row in every case but tier-2 verified
  const accentSlot4 = pending || tier1;
  s += v2card(CX, OGY, CW, 4 * RH, 24);
  s += orow(OGY, 0, 4, "Organization details");
  s += orow(OGY, 1, 4, "Donation QR &amp; wishlist", pending ? null : "On", { locked: pending });
  s += orow(OGY, 2, 4, "Volunteer program", pending ? null : "3 active", { locked: pending, noRule: accentSlot4 });
  if (pending) {
    // 4th slot = amber under-review accent — verification is the one outstanding thing
    const y0 = OGY + 3 * RH;
    s += rrect(CX + 12, y0 + 5, CW - 24, RH - 10, 16, WARNBG);
    s += t(CX + 32, y0 + 25, "Under review", { size: 16.5, weight: "800", fill: WARN2 });
    s += t(CX + 32, y0 + 45, "Track your documents", { size: 12, fill: "#8a6d3b" });
    s += t(CX + CW - 30, y0 + 36, "›", { size: 24, anchor: "end", weight: "800", fill: WARN2 });
  } else if (tier1) {
    // 4th slot = soft-teal upgrade accent (tier-2 verified gets a plain Verification row instead)
    const y0 = OGY + 3 * RH;
    s += rrect(CX + 12, y0 + 5, CW - 24, RH - 10, 16, "#E2EEF0");
    s += t(CX + 32, y0 + 25, "Upgrade to Verified Shelter", { size: 16.5, weight: "800", fill: TEALDK });
    s += t(CX + 32, y0 + 45, "Unlock uncapped fees &amp; escalation", { size: 12, fill: "#5f6b6a" });
    s += t(CX + CW - 30, y0 + 36, "›", { size: 24, anchor: "end", weight: "800", fill: TEALDK });
  } else {
    s += orow(OGY, 3, 4, "Verification", badge);
  }

  // Account
  s += t(34, 820, "Account", { size: 21, weight: "800", fill: V2INK });
  const ACY = 838;
  s += v2card(CX, ACY, CW, 3 * RH, 24);
  s += orow(ACY, 0, 3, "Account settings");
  s += orow(ACY, 1, 3, "Help &amp; support");
  s += orow(ACY, 2, 3, "Log out", null, { danger: true, noChev: true });

  s += shelterNav(4);
  return s;
}

// ---------- Shelter 3: List an animal ----------
// opts.tier1 → the shelter is a Community rescue (Verified Rescue). The ONLY functional difference
// between the tiers: a tier-1 shelter's adoption fee is capped at ₱500 (cost recovery for vaccines /
// deworming), while a tier-2 registered NGO may set any fee.
//
// Why this one is tiered when almost nothing else is: an UNREGISTERED entity collecting a
// per-animal fee at volume edges into unlicensed animal trade, which is BAI-regulated territory in
// PH. A tier-2 NGO has legal standing to charge (SEC entity + BAI licence); a tier-1 rescue does
// not. So the cap protects the rescuer from real exposure — it is not Kupkop being stingy, and the
// copy says so rather than just greying the field out.
//
// Not free-only, deliberately: a rescue that spent ₱3k on vet care and can recover nothing will
// take cash off-platform instead, which is strictly worse (untracked, and the adopter has no record).
function listAnimal(paws, opts = {}) {
  const tier1 = !!opts.tier1;
  const rescue = !!opts.fromRescue;   // "List for adoption" door off rescue-outcome — pre-fill from the report
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar(rescue ? "List for adoption" : "List an animal");

  if (rescue) {
    // the photo + species come from the rescue report — show the photo filled, not an empty uploader
    s += `<circle cx="270" cy="186" r="60" fill="${SOFT}"/>` + pawIcon(paws.teal.uri, 270, 176, 48);
    s += `<rect x="326" y="216" width="88" height="36" rx="18" fill="${WHITE}" filter="url(#v2soft)"/>` + t(370, 240, "Change", { size: 14, anchor: "middle", fill: TEAL, weight: "700" });
    s += t(270, 288, "From your rescue · Dog · Injured · Aurora Blvd", { size: 14.5, anchor: "middle", fill: MUTED });
  } else {
    s += `<circle cx="270" cy="186" r="60" fill="${SOFT}" stroke="${LINE}" stroke-width="2" stroke-dasharray="6 7"/>` + pawIcon(paws.teal.uri, 270, 176, 48);
    s += `<circle cx="312" cy="218" r="21" fill="${TEAL}"/>` + t(312, 226, "+", { size: 26, anchor: "middle", fill: WHITE, weight: "700" });
    s += t(270, 282, "Add photos", { size: 19, anchor: "middle", fill: TEAL, weight: "700" });
  }

  s += field(34, 322, 472, "Name", rescue ? "Give her a name" : "Milo");

  s += t(34, 456, "Species", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 472, ["Dog", "Cat", "Other"], 0);

  // Breed dropdown
  const chevron = (cx, cy) => `<polyline points="${cx - 9},${cy - 5} ${cx},${cy + 5} ${cx + 9},${cy - 5}" fill="none" stroke="${MUTED}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(34, 552, "Breed", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 568, 472, 64, 16, WHITE, LINE) + t(58, 609, "Aspin (Asong Pinoy)", { size: 22, fill: NAVY, weight: "600" }) + chevron(472, 600);

  s += t(34, 674, "Sex", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 690, ["Male", "Female"], 0);

  s += t(34, 772, "Adoption status", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 788, ["Available", "Pending", "Adopted"], 0);

  s += field(34, 870, 472, "Adoption fee", tier1 ? "₱300" : "₱0  (Free adoption)");
  if (tier1) {
    // the cap is explained where it bites, not buried in a help page — a rescuer who doesn't know
    // WHY reads it as Kupkop distrusting them rather than as legal cover
    s += `<rect x="34" y="960" width="472" height="70" rx="16" fill="${SOFT}"/>`;
    s += t(58, 990, "Max ₱500 — cost recovery for vet care.", { size: 14.5, fill: TEALDK, weight: "700" });
    s += t(58, 1014, "Registered NGOs can set any fee.", { size: 14, fill: MUTED });
    s += btn(1060, "Publish listing");
  } else {
    s += btn(1000, "Publish listing");
  }
  return s;
}

// ---------- Shelter: edit a listed animal's details ----------
// Every row on My listings already carries an "Edit ›" link (below) — it had no destination
// screen. Same layout as listAnimal (List an animal) so the two visually pair as one form in two
// modes, mirroring the shelterNeedNew/shelterNeedEdit split: the photo slot shows the EXISTING
// photo with a "Change" pill instead of an empty dashed uploader, every field is prefilled, and
// the button reads "Save changes" instead of "Publish listing".
//
// Adoption status is a plain chip here, not a separate confirm/complete action like shelterNeed's
// "Mark complete" — a pet's status (Available/Pending/Adopted) is a direct field the shelter picks,
// not a derived outcome computed from a target quantity, so editing it in place is the whole
// mechanism and needs no extra screen.
function shelterEditAnimal(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Edit listing");

  s += `<circle cx="270" cy="186" r="60" fill="${SOFT}"/>` + pawIcon(paws.teal.uri, 270, 176, 48);
  s += `<rect x="326" y="216" width="88" height="36" rx="18" fill="${WHITE}" filter="url(#v2soft)"/>` + t(370, 240, "Change", { size: 14, anchor: "middle", fill: TEAL, weight: "700" });
  s += t(270, 282, "3 photos", { size: 16, anchor: "middle", fill: MUTED });

  s += field(34, 322, 472, "Name", "Milo");

  s += t(34, 456, "Species", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 472, ["Dog", "Cat", "Other"], 0);

  const chevron2 = (cx, cy) => `<polyline points="${cx - 9},${cy - 5} ${cx},${cy + 5} ${cx + 9},${cy - 5}" fill="none" stroke="${MUTED}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(34, 552, "Breed", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 568, 472, 64, 16, WHITE, LINE) + t(58, 609, "Aspin (Asong Pinoy)", { size: 22, fill: NAVY, weight: "600" }) + chevron2(472, 600);

  s += t(34, 674, "Sex", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 690, ["Male", "Female"], 0);

  s += t(34, 772, "Adoption status", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 788, ["Available", "Pending", "Adopted"], 0);

  s += field(34, 870, 472, "Adoption fee", "₱0  (Free adoption)");

  s += btn(1000, "Save changes");
  return s;
}

// ---------- Shelter 4: My listings ----------
function shelterListings(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("My listings");
  s += topbarPill(506, "+ New");

  s += chipRow(34, 130, ["All", "Available", "Pending", "Adopted"], 0);

  const items = [
    ["Milo", "Aspin · 2 yrs · Male", "Available"],
    ["Luna", "Puspin · 1 yr · Female", "Pending"],
    ["Bantay", "Aspin · 4 yrs · Male", "Available"],
    ["Muning", "Puspin · 3 yrs · Female", "Adopted"],
  ];
  items.forEach(([nm, meta, st], i) => {
    const y = 214 + i * 108;
    s += rrect(34, y, 472, 92, 20, WHITE, LINE);
    s += avq(84, y + 46, 32) + pawIcon(paws.teal.uri, 84, y + 46, 34);
    s += t(136, y + 42, nm, { size: 22, weight: "800", fill: V2INK });
    s += t(136, y + 72, meta, { size: 17, fill: MUTED });
    s += statusChip(486, y + 16, st);
    s += t(486, y + 78, "Edit ›", { size: 17, anchor: "end", fill: TEAL, weight: "700" });
  });

  s += shelterNav(1);
  return s;
}

// ---------- Shelter 5: Donations (Abot-tulong) ----------
// opts.qr: "verified" (default — live, donors can scan) | "pending" (uploaded, admin hasn't
// cleared it yet — donation_qr.verified = false, so it's NOT public) | "none" (never uploaded).
// There was previously no way to REACH an add/update flow from here at all — the card just always
// rendered a QR graphic as if one already existed. "Update ›" only shows once a QR exists; the
// empty state gets its own full CTA instead, since there's nothing yet to "update".
function donations(opts = {}) {
  const qrState = opts.qr || "verified";
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Donations");

  // this-month card — counts, NOT pesos: the QR is display-only and payment happens
  // off-platform in GCash/Maya, so Kupkop can't see (or claim) an amount received.
  s += `<defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${TEAL}"/><stop offset="1" stop-color="${TEALDK}"/></linearGradient></defs>`;
  s += rrect(34, 150, 472, 140, 24, "url(#dg)");
  s += t(58, 194, "This month", { size: 18, fill: "#cfe6e2" });
  s += t(58, 244, "9 donations", { size: 42, weight: "700", fill: WHITE });
  s += t(482, 244, "3 needs fulfilled", { size: 18, anchor: "end", fill: "#cfe6e2" });
  s += t(58, 274, "Pledges you confirmed · QR gifts go straight to your e-wallet", { size: 13, fill: "#a9cfca" });

  // QR card
  s += t(34, 344, "Your Abot-tulong QR", { size: 22, weight: "800", fill: V2INK });
  if (qrState !== "none") s += t(506, 344, "Update ›", { size: 17, anchor: "end", fill: TEAL, weight: "700" });

  if (qrState === "none") {
    // dashed uploader, same visual language as the logo/photo uploaders elsewhere (shelter-setup,
    // add-pet) — a square dashed box reads as "tap to add a photo" without extra copy. Shorter
    // than the other two states' card (160 vs 250) to leave room for a real button below it
    // before the wishlist row at y=636 — the card alone isn't the tap target here since it also
    // has to fit "Donors can't give directly" context copy.
    s += `<rect x="34" y="366" width="472" height="160" rx="24" fill="${WHITE}" stroke="${LINE}" stroke-width="2" stroke-dasharray="7 8"/>`;
    s += `<circle cx="270" cy="414" r="32" fill="${SOFT}"/>`;
    s += `<line x1="270" y1="400" x2="270" y2="428" stroke="${TEAL}" stroke-width="4" stroke-linecap="round"/><line x1="256" y1="414" x2="284" y2="414" stroke="${TEAL}" stroke-width="4" stroke-linecap="round"/>`;
    s += t(270, 470, "No QR yet", { size: 19, anchor: "middle", weight: "700", fill: V2INK });
    s += t(270, 496, "Donors can't give directly until you add one.", { size: 14.5, anchor: "middle", fill: MUTED });
    s += btn(548, "+  Add your donation QR");
  } else if (qrState === "pending") {
    s += rrect(34, 366, 472, 250, 24, WHITE, LINE);
    s += `<g opacity="0.32">` + qr(195, 396, 150) + `</g>`;
    // the honest state: uploaded but not yet admin-checked, so it is NOT the live public QR —
    // donation_qr.verified is still false and nothing donors see has changed.
    s += `<rect x="150" y="446" width="240" height="50" rx="25" fill="${WARNBG}"/>`;
    s += clockIcon(178, 471, 14, WARN);
    s += t(200, 477, "Pending verification", { size: 15.5, fill: WARN2, weight: "700" });
    s += t(270, 578, "Not visible to donors yet · usually 1–2 business days.", { size: 14.5, anchor: "middle", fill: WARN });
  } else {
    s += rrect(34, 366, 472, 250, 24, WHITE, LINE);
    s += qr(195, 396, 150);
    s += statusChip(482, 388, "Verified");
    s += t(270, 578, "Scan with GCash · Maya · GrabPay", { size: 18, anchor: "middle", fill: MUTED });
  }

  // wishlist (tracked pledges) entry
  s += rrect(34, 636, 472, 60, 16, "#eaf4f2");
  s += bowlGlyph(70, 666, TEAL) + t(102, 672, "Wishlist · 3 open needs · 1 to confirm", { size: 16, fill: NAVY, weight: "600" });
  s += t(486, 672, "›", { size: 30, anchor: "end", fill: TEAL });

  // recent pledges — sourced from need_pledge (item + qty + state), the only donation
  // record Kupkop actually holds. A funds-category pledge can carry a peso figure because
  // the shelter confirms receipt of it; a scanned QR gift never reaches us at all.
  s += t(34, 736, "Recent pledges", { size: 22, weight: "800", fill: V2INK });
  s += t(506, 736, "See all", { size: 18, anchor: "end", fill: TEAL, weight: "700" });
  const rows = [
    ["Ana Reyes", "Dog &amp; puppy food · 10 kg", "Delivered", "2h ago"],
    ["Jose Cruz", "Vet fund · ₱500", "Pledged", "5h ago"],
    ["Liza Tan", "Blankets &amp; towels · 5 pcs", "Delivered", "Yesterday"],
  ];
  rows.forEach(([nm, item, st, when], i) => {
    const y = 762 + i * 74;
    s += avq(60, y + 30, 24) + t(60, y + 38, nm.split(" ").map(w => w[0]).join(""), { size: 18, anchor: "middle", weight: "700", fill: TEAL });
    s += t(100, y + 24, nm, { size: 20, weight: "800", fill: V2INK });
    s += t(100, y + 50, item + " · " + when, { size: 15, fill: MUTED });
    s += statusChip(506, y + 14, st);
    s += `<line x1="34" y1="${y + 62}" x2="506" y2="${y + 62}" stroke="${LINE}" stroke-width="1.5"/>`;
  });

  s += shelterNav(2);
  return s;
}

// ---------- Shelter: add / update the Abot-tulong QR ----------
// One form, two entry points — reached from "+ Add your donation QR" (empty state) or
// "Update ›" (an existing one) on screen-shelter-donations. Same fields either way; what differs
// is what's prefilled and the consequence line at the bottom, because an update is NOT a free
// edit like shelterNeedEdit: this is the shelter's PAYOUT ACCOUNT. Swapping it resets
// donation_qr.verified to false and re-enters the admin queue — the same fraud control that
// gated it the first time (§3.5's "admin confirms the payout account matches the org") has to
// re-run on every change, or a compromised account could swap in a scam QR with no re-check.
// That's also why this is its own screen rather than an inline edit on the donations card.
function shelterQrForm(opts = {}) {
  const existing = !!opts.existing;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar(existing ? "Update your QR" : "Add your QR");
  s += t(34, 168, existing ? "Replace your donation QR" : "Add your donation QR", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 202, "Donors scan this to give straight to your e-wallet.", { size: 17, fill: MUTED });

  s += t(34, 250, "Provider", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 268, ["GCash", "Maya"], 0);

  // the square uploader IS the QR when one exists — showing the current image (not a generic
  // placeholder) is what tells the shelter "this is what you're about to replace"
  const uy = 348;
  if (existing) {
    s += rrect(34, uy, 472, 220, 24, WHITE, LINE);
    s += `<g opacity="0.9">` + qr(195, uy + 26, 150) + `</g>`;
    s += `<rect x="360" y="${uy + 158}" width="122" height="42" rx="21" fill="${WHITE}" filter="url(#v2soft)"/>` + t(421, uy + 185, "Replace", { size: 15, anchor: "middle", fill: TEAL, weight: "700" });
  } else {
    s += `<rect x="34" y="${uy}" width="472" height="220" rx="24" fill="${WHITE}" stroke="${LINE}" stroke-width="2" stroke-dasharray="7 8"/>`;
    s += `<circle cx="270" cy="${uy + 78}" r="38" fill="${SOFT}"/>`;
    s += `<line x1="270" y1="${uy + 62}" x2="270" y2="${uy + 94}" stroke="${TEAL}" stroke-width="4" stroke-linecap="round"/><line x1="254" y1="${uy + 78}" x2="286" y2="${uy + 78}" stroke="${TEAL}" stroke-width="4" stroke-linecap="round"/>`;
    s += t(270, uy + 148, "Upload your QR image", { size: 18, anchor: "middle", weight: "700", fill: TEAL });
    s += t(270, uy + 176, "Screenshot or save it from your GCash/Maya app.", { size: 14, anchor: "middle", fill: MUTED });
  }

  s += field(34, uy + 246, 472, "Account holder name", "PAWS Manila");
  s += t(34, uy + 340, "Must match your org name — this is what we check it against.", { size: 14, fill: MUTED });

  // the consequence line changes with the stakes: first upload just needs review; replacing a
  // LIVE one means it goes dark for donors until it's re-cleared, which the shelter should know
  // before they tap the button, not after.
  s += `<rect x="34" y="${uy + 372}" width="472" height="${existing ? 78 : 60}" rx="16" fill="${WARNBG}"/>`;
  s += alertIcon(70, uy + 372 + (existing ? 39 : 30), 16, WARN2);
  if (existing) {
    s += t(102, uy + 396, "Your QR goes offline for donors until", { size: 14.5, fill: WARN2, weight: "600" });
    s += t(102, uy + 420, "this is re-checked — usually 1–2 business days.", { size: 14.5, fill: WARN2, weight: "600" });
  } else {
    s += t(102, uy + 406, "An admin checks this before it goes live for donors.", { size: 14.5, fill: WARN2, weight: "600" });
  }

  s += btn(uy + 372 + (existing ? 78 : 60) + 26, existing ? "Save &amp; resubmit" : "Submit for review");
  return s;
}

// ---------- Pet-owner Home ----------
const heartIcon = (cx, cy, s, c) => `<path d="M${cx} ${cy + s * 0.34} C ${cx - s * 0.55} ${cy - s * 0.06}, ${cx - s * 0.44} ${cy - s * 0.46}, ${cx - s * 0.17} ${cy - s * 0.28} C ${cx - s * 0.05} ${cy - s * 0.2}, ${cx + s * 0.05} ${cy - s * 0.2}, ${cx + s * 0.17} ${cy - s * 0.28} C ${cx + s * 0.44} ${cy - s * 0.46}, ${cx + s * 0.55} ${cy - s * 0.06}, ${cx} ${cy + s * 0.34} Z" fill="${c}"/>`;
const magnifyIcon = (cx, cy, c) => `<circle cx="${cx - 3}" cy="${cy - 3}" r="10" fill="none" stroke="${c}" stroke-width="3"/>` + `<line x1="${cx + 4}" y1="${cy + 4}" x2="${cx + 12}" y2="${cy + 12}" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`;
function home(paws, opts = {}) {
  const guest = !!opts.guest;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + statusbar(false);
  // ⚠️ GUEST MODE (action-gated signup). A visitor lands here with NO account — browses adoption
  // listings + the rescue map read-only. No name, no bell (nothing to notify), no pending/tracker
  // banner. A "Log in" pill replaces the bell, and a teal guest strip explains the state + offers
  // signup. Every gated action (favourite · adopt · report · volunteer · the You tab) raises the
  // signupWall, which resumes the action after signup. City is still required (decision 11) — a
  // guest picks or defaults one, no GPS/account needed.
  s += t(34, 92, guest ? "Welcome!" : "Kumusta, Ana!", { size: 28, weight: "800", fill: V2INK });
  // tappable location — the source of every "near you" / "X km" figure below (→ location-picker)
  if (opts.pending) s += t(34, 124, "Pet owner · Verified Member pending", { size: 18, fill: MUTED });
  else {
    s += pinIcon(44, 120, TEAL) + t(60, 126, "Marikina City", { size: 17, weight: "700", fill: V2INK }) + t(196, 126, "Change ›", { size: 15, fill: TEAL, weight: "700" });
  }
  if (guest) s += rrect(410, 70, 96, 40, 20, WHITE, LINE) + t(458, 95, "Log in", { size: 16, anchor: "middle", fill: TEAL, weight: "700" });
  else s += bellIcon(496, 88);

  // top notice (shifts the feed down): guest strip · pending banner · or active-adoption tracker
  let off = 0;
  if (guest) {
    off = 100;
    s += rrect(34, 152, 472, 84, 20, "#eaf4f2", TEAL);
    s += personIcon(74, 194, 30, TEALDK);
    s += t(112, 186, "You’re browsing as a guest", { size: 17, weight: "800", fill: V2INK });
    s += t(112, 212, "Sign up to adopt, save pets &amp; help strays.", { size: 14.5, fill: MUTED });
    s += t(486, 200, "Sign up ›", { size: 16, anchor: "end", fill: TEAL, weight: "700" });
  } else if (opts.pending) {
    off = 112;
    s += rrect(34, 152, 472, 92, 20, WARNBG);
    s += clockIcon(74, 198, 20, WARN);
    s += t(112, 188, "Verified Member in review", { size: 18, weight: "700", fill: WARN2 });
    s += t(112, 216, "We'll notify you within a day.", { size: 15, fill: WARN });
    // → verify-documents-member. The rescuer path has no request-level status screen of its own
    // (only shelters got verify-pending/-needs-info/-rejected), so the per-document tracker IS
    // where a member checks in — which is also the only place their ID's state is visible.
    s += t(486, 204, "Documents ›", { size: 16, anchor: "end", fill: WARN2, weight: "700" });
  } else {
    // active adoption — at-a-glance tracker → My inquiries / inquiry detail
    off = 116;
    s += rrect(34, 152, 472, 96, 20, "#eaf4f2", TEAL);
    s += `<circle cx="88" cy="200" r="30" fill="${TEAL}"/>` + pawIcon(paws.white.uri, 88, 200, 32);
    s += t(136, 190, "Your adoption · Milo", { size: 20, weight: "800", fill: V2INK });
    s += t(136, 220, "Step 4 of 6 · Interview", { size: 15, fill: TEAL, weight: "600" });
    s += t(486, 206, "Track ›", { size: 16, anchor: "end", fill: TEAL, weight: "700" });
  }

  // hero — report a stray (Sagip)
  s += rrect(34, 156 + off, 472, 148, 24, TEAL);
  s += `<image href="${paws.white.uri}" x="406" y="${168 + off}" width="96" height="96" opacity="0.14"/>`;
  s += t(60, 214 + off, "Saw a stray?", { size: 28, weight: "700", fill: WHITE });
  s += t(60, 248 + off, "Report it in seconds — help is near.", { size: 17, fill: "#d8ece9" });
  s += rrect(60, 264 + off, 184, 48, 24, WHITE) + t(152, 295 + off, "Report now", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });

  // quick actions
  const acts = [["Lost &amp; found", "search"], ["Adopt", "heart"], ["Donate", "peso"], ["Volunteer", "person"]];
  const tw = 109, gp = 12;
  acts.forEach(([lab, ic], i) => {
    const x = 34 + i * (tw + gp), gx = x + tw / 2, qy = 324 + off;
    s += rrect(x, qy, tw, 116, 18, WHITE, LINE);
    s += `<circle cx="${gx}" cy="${qy + 40}" r="26" fill="${TEAL}"/>`;
    if (ic === "search") s += magnifyIcon(gx, qy + 40, WHITE);
    else if (ic === "heart") s += heartIcon(gx, qy + 40, 30, WHITE);
    else if (ic === "peso") s += t(gx, qy + 49, "₱", { size: 28, anchor: "middle", fill: WHITE, weight: "700" });
    else if (ic === "person") s += personIcon(gx, qy + 40, 34, WHITE);
    else s += pawIcon(paws.white.uri, gx, qy + 40, 28);
    s += t(gx, qy + 96, lab, { size: 15, anchor: "middle", weight: "700", fill: NAVY });
  });

  // adopt near you
  s += t(34, 486 + off, "Adopt near you", { size: 22, weight: "800", fill: V2INK });
  s += t(506, 486 + off, "See all", { size: 17, anchor: "end", fill: TEAL, weight: "700" });
  const pets = [["Milo", "Aspin · 1 yr · Male", "PAWS Manila · 2 km"], ["Luna", "Puspin · 2 yrs · Female", "Marikina AWG · 4 km"]];
  pets.forEach(([nm, meta, org], i) => {
    const y = 510 + off + i * 104;
    s += rrect(34, y, 472, 92, 20, WHITE, LINE);
    s += avq(82, y + 46, 32) + pawIcon(paws.teal.uri, 82, y + 46, 34);
    s += t(134, y + 40, nm, { size: 22, weight: "800", fill: V2INK });
    s += t(134, y + 68, meta, { size: 16, fill: MUTED });
    s += statusChip(486, y + 14, "Available");
    s += t(486, y + 74, org, { size: 14, anchor: "end", fill: "#b8b6ad" });
  });

  // nearby rescues
  s += t(34, 758 + off, "Nearby rescues", { size: 22, weight: "800", fill: V2INK });
  const ry = 782 + off;
  s += rrect(34, ry, 472, 92, 20, WHITE, LINE);
  s += avq(82, ry + 46, 32) + pawIcon(paws.teal.uri, 82, ry + 46, 34);
  s += t(134, ry + 40, "Aspin · Quezon City", { size: 22, weight: "800", fill: V2INK });
  s += t(134, ry + 68, "0.4 km · needs pickup", { size: 16, fill: MUTED });
  const uw = 26 + 6 * 11;
  s += rrect(486 - uw, ry + 28, uw, 36, 18, WARNBG) + t(486 - uw / 2, ry + 52, "Urgent", { size: 16, anchor: "middle", fill: WARN2, weight: "700" });
  if (opts.pending) s += t(270, ry + 118, "Claiming rescues unlocks once you're verified.", { size: 15, anchor: "middle", fill: MUTED });

  s += bottomnav(0);
  return s;
}

// ---------- The action-gated signup wall (guest → account) ----------
// Raised the moment a guest takes an action that needs an account: favourite, adopt, report,
// volunteer, claim/offer, or opening "You". A bottom sheet, not a full screen — it interrupts one
// action without throwing away the browsing context behind it.
// ⚠️ Two things this MUST get right:
//   1. It resumes the action. The copy promises "we'll bring you right back to Milo" and the build
//      has to honour it (deep-link/intent preservation) — the whole point is that the guest doesn't
//      lose their place. A wall that dumps them on a generic home after signup is worse than no wall.
//   2. It is ONLY the signup gate. Adopting also needs the Verified Member badge, but that gate comes
//      later, on its own screen. Don't fold "get verified" into this sheet — one wall, one job.
// opts.action ∈ save | adopt | report | volunteer — drives the copy; the component is one thing.
function signupWall(paws, opts = {}) {
  const action = opts.action || "adopt";
  const copy = {
    save:      ["Save Milo", "Create a free account to keep your favourites in one place.", "Milo"],
    adopt:     ["Adopt Milo", "Create a free account to send your adoption inquiry.", "Milo"],
    report:    ["Report a stray", "Create a free account so a rescuer can reach you about it.", "this report"],
    volunteer: ["Volunteer with shelters", "Create a free account to sign up for a shift.", "Kawang-Gawa"],
  }[action];
  const [title, sub, resume] = copy;

  // base = the guest home behind the sheet, so it reads as an interruption, not a new screen
  let s = home(paws, { guest: true });
  s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;

  // bottom sheet
  const top = 604;
  s += `<path d="M0 ${top + 28} q0 -28 28 -28 h484 q28 0 28 28 v${SH - top - 28} h-540 z" fill="${WHITE}"/>`;
  s += `<rect x="240" y="${top + 20}" width="60" height="5" rx="2.5" fill="#d8d6cd"/>`;

  s += `<circle cx="270" cy="${top + 88}" r="40" fill="${SOFT}"/>`;
  if (action === "save") s += heartIcon(270, top + 88, 34, TEALDK);
  else if (action === "report") s += pinIcon(270, top + 84, TEALDK);
  else if (action === "volunteer") s += pawIcon(paws.teal.uri, 270, top + 88, 40);
  else s += homeHeartIcon(270, top + 88, 40, TEALDK);

  s += t(270, top + 168, title, { size: 26, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, top + 204, sub, { size: 15.5, anchor: "middle", fill: MUTED });

  // the promise that makes the wall acceptable — you don't lose your place
  s += `<rect x="70" y="${top + 232}" width="400" height="52" rx="16" fill="#eaf4f2"/>`;
  s += verified(104, top + 258, 13);
  s += t(128, top + 264, `Takes a minute — we’ll bring you right back to ${resume}.`, { size: 13, fill: TEALDK, weight: "600" });

  s += `<rect x="34" y="${top + 308}" width="472" height="66" rx="33" fill="url(#v2btn)" filter="url(#v2soft)"/>` +
    t(270, top + 349, "Create free account", { size: 21, anchor: "middle", fill: WHITE, weight: "700" });
  s += t(270, top + 414, "Already have one?  Log in", { size: 18, anchor: "middle", fill: TEALDK, weight: "700" });
  s += t(270, top + 470, "Keep browsing", { size: 17, anchor: "middle", fill: "#a9adaa", weight: "700" });
  return s;
}

// ---------- Kawang-Gawa (volunteering) ----------
const bowlGlyph = (cx, cy, c) => `<path d="M${cx - 18} ${cy - 2} a18 15 0 0 0 36 0 Z" fill="${c}"/>` +
  `<ellipse cx="${cx}" cy="${cy - 2}" rx="18" ry="5" fill="${c}"/>` +
  `<circle cx="${cx - 6}" cy="${cy - 12}" r="3.5" fill="${c}"/>` + `<circle cx="${cx + 6}" cy="${cy - 11}" r="3" fill="${c}"/>`;
const calGlyph = (cx, cy, c) => `<rect x="${cx - 15}" y="${cy - 11}" width="30" height="26" rx="4" fill="none" stroke="${c}" stroke-width="3"/>` +
  `<line x1="${cx - 15}" y1="${cy - 3}" x2="${cx + 15}" y2="${cy - 3}" stroke="${c}" stroke-width="3"/>` +
  `<line x1="${cx - 8}" y1="${cy - 16}" x2="${cx - 8}" y2="${cy - 8}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>` +
  `<line x1="${cx + 8}" y1="${cy - 16}" x2="${cx + 8}" y2="${cy - 8}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
const broomGlyph = (cx, cy, c) => `<line x1="${cx + 11}" y1="${cy - 15}" x2="${cx - 4}" y2="${cy + 2}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>` +
  `<path d="M${cx - 14} ${cy + 4} l14 -11 l8 8 l-10 13 z" fill="${c}"/>`;
const pinIcon = (cx, cy, c) => `<path d="M${cx} ${cy + 12} c-10 -13 -10 -22 0 -22 c10 0 10 9 0 22 z" fill="${c}"/>` + `<circle cx="${cx}" cy="${cy - 4}" r="4" fill="${WHITE}"/>`;
function typeGlyph(type, cx, cy, paws) {
  if (type === "walk") return pawIcon(paws.teal.uri, cx, cy, 34);
  if (type === "feed") return bowlGlyph(cx, cy, TEAL);
  if (type === "event") return calGlyph(cx, cy, TEAL);
  return broomGlyph(cx, cy, TEAL);
}

// Kawang-Gawa hub — browse volunteer opportunities by type
// segmented control (tabs within a section)
function segmented(x, y, w, labels, active) {
  const h = 48, seg = w / labels.length;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="#EAEDE8"/>`;
  labels.forEach((lab, i) => {
    const on = i === active;
    if (on) s += `<rect x="${x + i * seg + 4}" y="${y + 4}" width="${seg - 8}" height="${h - 8}" rx="20" fill="${WHITE}" filter="url(#v2soft)"/>`;
    s += t(x + i * seg + seg / 2, y + 31, lab, { size: 17, anchor: "middle", fill: on ? TEAL : MUTED, weight: "700" });
  });
  return s;
}

function kawangGawa(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Kawang-Gawa");
  s += segmented(34, 150, 472, ["Browse", "My shifts"], 0);
  s += t(34, 252, "Volunteer with shelters", { size: 26, weight: "800", fill: V2INK });
  s += chipRow(34, 288, ["All", "Walking", "Feeding", "Events"], 0);

  const opps = [
    ["walk", "Morning dog walk", "PAWS Manila · Marikina", "Sat, Jul 12 · 8–10 AM", "4 slots"],
    ["feed", "Feed the rescue pack", "Marikina AWG", "Sun, Jul 13 · 7–9 AM", "2 slots"],
    ["event", "Adoption day helper", "PAWS Manila", "Sat, Jul 19 · 1–5 PM", "6 slots"],
    ["facility", "Kennel cleaning", "Pasig Pound", "Sun, Jul 20 · 9–11 AM", "5 slots"],
  ];
  opps.forEach(([type, title, shelter, when, slots], i) => {
    const y = 360 + i * 122;
    s += rrect(34, y, 472, 112, 20, WHITE, LINE);
    s += avq(86, y + 56, 32) + typeGlyph(type, 86, y + 56, paws);
    s += t(140, y + 44, title, { size: 21, weight: "800", fill: V2INK });
    s += t(140, y + 72, shelter, { size: 15, fill: MUTED });
    s += t(140, y + 97, when, { size: 15, fill: TEAL, weight: "600" });
    const sw = 22 + slots.length * 10;
    s += rrect(486 - sw, y + 18, sw, 34, 17, "#eaf4f2") + t(486 - sw / 2, y + 41, slots, { size: 15, anchor: "middle", fill: TEAL, weight: "700" });
  });
  return s;
}

// Kawang-Gawa — opportunity detail + sign up
function kawangGawaDetail(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Volunteer");
  s += `<circle cx="82" cy="196" r="40" fill="${SOFT}"/>` + pawIcon(paws.teal.uri, 82, 196, 44);
  s += t(146, 182, "Morning dog walk", { size: 26, weight: "800", fill: V2INK });
  s += t(146, 216, "Walk &amp; socialize shelter dogs", { size: 16, fill: MUTED });

  s += t(34, 288, "PAWS Manila", { size: 20, weight: "800", fill: V2INK }) + verified(186, 281, 13);
  s += t(34, 318, "Marikina City", { size: 15, fill: MUTED });

  const iy = 350;
  s += rrect(34, iy, 472, 168, 20, WHITE, LINE);
  s += calGlyph(70, iy + 40, TEAL) + t(108, iy + 48, "Sat, Jul 12 · 8:00–10:00 AM", { size: 17, fill: NAVY });
  s += pinIcon(70, iy + 86, TEAL) + t(108, iy + 96, "12 Aurora Blvd, Marikina", { size: 17, fill: NAVY });
  s += personIcon(70, iy + 138, 34, TEAL) + t(108, iy + 144, "4 of 6 slots left", { size: 17, fill: NAVY });

  s += t(34, 570, "What you'll do", { size: 20, weight: "800", fill: V2INK });
  ["Walk assigned dogs on a set route", "Basic socializing — no experience needed", "Check-in and check-out at the shelter"].forEach((b, i) => {
    const y = 610 + i * 40;
    s += pawIcon(paws.teal.uri, 48, y - 6, 24) + t(84, y, b, { size: 16, fill: NAVY });
  });

  // consents + CTA
  const checkbox = y => rrect(34, y, 30, 30, 8, TEAL) + `<polyline points="41,${y + 15} 47,${y + 22} 58,${y + 8}" fill="none" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += checkbox(710);
  s += t(78, 732, "I agree to the volunteer waiver &amp; guidelines.", { size: 16, fill: NAVY });
  s += checkbox(768);
  s += t(78, 784, "I agree to share my contact details (phone,", { size: 16, fill: NAVY });
  s += t(78, 808, "email, address) with the shelter to coordinate.", { size: 16, fill: NAVY });
  s += t(78, 840, "You can see who gets it in Privacy settings.", { size: 13, fill: MUTED });
  s += btn(884, "Sign up");
  return s;
}

// Kawang-Gawa — after sign-up: request sent, awaiting shelter confirmation
function kawangGawaRequested(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Volunteer");
  s += `<circle cx="270" cy="222" r="70" fill="${SOFT}"/>` + clockIcon(270, 222, 40, TEAL);
  s += t(270, 346, "Request sent!", { size: 30, anchor: "middle", weight: "700", fill: NAVY });
  s += t(270, 386, "PAWS Manila will confirm your", { size: 19, anchor: "middle", fill: MUTED });
  s += t(270, 414, "shift shortly.", { size: 19, anchor: "middle", fill: MUTED });

  const cy = 470;
  s += rrect(34, cy, 472, 120, 20, WHITE, LINE);
  s += avq(86, cy + 60, 30) + pawIcon(paws.teal.uri, 86, cy + 60, 32);
  s += t(134, cy + 44, "Morning dog walk", { size: 21, weight: "800", fill: V2INK });
  s += t(134, cy + 74, "PAWS Manila", { size: 15, fill: MUTED });
  s += t(134, cy + 98, "Sat, Jul 12 · 8–10 AM", { size: 15, fill: TEAL, weight: "600" });
  s += statusChip(486, cy + 20, "Pending");

  s += t(270, 652, "Once confirmed, it's added to your", { size: 16, anchor: "middle", fill: MUTED });
  s += t(270, 678, "schedule and phone calendar.", { size: 16, anchor: "middle", fill: MUTED });
  s += btn(762, "View my schedule");
  s += t(270, 858, "Browse more opportunities", { size: 17, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// mini month calendar (July 2026; Jul 1 = Wed). today = day number; dots = { day: color }
// v2 calendar — a shadow card with month nav; today = gradient circle, event days = soft tinted
// circle (OKBG/WARNBG) with a bold coloured number. Card spans (x .. x+472), height 290.
function miniCal(x, y, today, dots) {
  const cw = 60, gx = x + 26;
  let s = `<rect x="${x}" y="${y}" width="472" height="290" rx="22" fill="${WHITE}" filter="url(#v2sh)"/>`;
  s += t(x + 26, y + 48, "July 2026", { size: 18, weight: "800", fill: V2INK });
  s += `<circle cx="${x + 400}" cy="${y + 42}" r="17" fill="${BG}"/>` + t(x + 400, y + 49, "‹", { size: 19, anchor: "middle", weight: "800", fill: V2INK });
  s += `<circle cx="${x + 442}" cy="${y + 42}" r="17" fill="${BG}"/>` + t(x + 442, y + 49, "›", { size: 19, anchor: "middle", weight: "800", fill: V2INK });
  ["S", "M", "T", "W", "T", "F", "S"].forEach((d, i) => s += t(gx + i * cw + cw / 2, y + 86, d, { size: 13, anchor: "middle", fill: "#a9adaa", weight: "800" }));
  const startCol = 3;
  for (let day = 1; day <= 31; day++) {
    const idx = startCol + day - 1, col = idx % 7, row = Math.floor(idx / 7);
    const cx = gx + col * cw + cw / 2, cyy = y + 122 + row * 38;
    const isToday = day === today, dot = dots[day];
    if (isToday) s += `<circle cx="${cx}" cy="${cyy - 5}" r="19" fill="url(#v2btn)" filter="url(#v2soft)"/>`;
    else if (dot) s += `<circle cx="${cx}" cy="${cyy - 5}" r="17" fill="${dot === OK ? OKBG : WARNBG}"/>`;
    const fill = isToday ? WHITE : (dot ? (dot === OK ? "#27500A" : WARN2) : V2INK);
    s += t(cx, cyy, String(day), { size: 15, anchor: "middle", fill, weight: (isToday || dot) ? "800" : "500" });
  }
  return s;
}

// Kawang-Gawa — pet owner's volunteer schedule (confirmed shift lands here + in calendar)
function kawangGawaSchedule(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Kawang-Gawa");
  s += segmented(34, 150, 472, ["Browse", "My shifts"], 1);
  s += miniCal(34, 212, 9, { 12: OK, 13: WARN });
  // legend
  s += `<circle cx="300" cy="528" r="5" fill="${OK}"/>` + t(314, 533, "Confirmed", { size: 14, fill: MUTED });
  s += `<circle cx="418" cy="528" r="5" fill="${WARN}"/>` + t(432, 533, "Pending", { size: 14, fill: MUTED });

  s += t(34, 578, "Upcoming shifts", { size: 22, weight: "800", fill: V2INK });
  s += t(506, 578, "History ›", { size: 17, anchor: "end", fill: TEAL, weight: "700" });

  // confirmed shift → added to calendar; day-of check-in + cancel hang off this card
  const y1 = 604;
  s += rrect(34, y1, 472, 168, 20, WHITE, LINE);
  s += avq(82, y1 + 46, 30) + pawIcon(paws.teal.uri, 82, y1 + 46, 32);
  s += t(132, y1 + 40, "Morning dog walk", { size: 21, weight: "800", fill: V2INK });
  s += t(132, y1 + 68, "PAWS Manila · Sat, Jul 12 · 8–10 AM", { size: 15, fill: MUTED });
  s += `<circle cx="140" cy="${y1 + 92}" r="9" fill="${OKBG}"/>` + `<polyline points="135,${y1 + 92} 139,${y1 + 96} 145,${y1 + 86}" fill="none" stroke="${OK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(158, y1 + 97, "Added to your calendar", { size: 14, fill: OK, weight: "600" });
  s += statusChip(486, y1 + 16, "Confirmed");
  // actions: day-of check-in (→ kawanggawa-checkin) · cancel (→ kawanggawa-cancel, free until the 12h cutoff)
  s += `<line x1="58" y1="${y1 + 120}" x2="482" y2="${y1 + 120}" stroke="${LINE}" stroke-width="1.5"/>`;
  s += t(58, y1 + 148, "Check in ›", { size: 17, fill: TEAL, weight: "700" });
  s += t(482, y1 + 148, "Cancel shift", { size: 17, anchor: "end", fill: "#B23B3B", weight: "700" });

  // pending shift → awaiting shelter
  const y2 = 788;
  s += rrect(34, y2, 472, 100, 20, WHITE, LINE);
  s += avq(82, y2 + 46, 30) + bowlGlyph(82, y2 + 46, TEAL);
  s += t(132, y2 + 42, "Feed the rescue pack", { size: 21, weight: "800", fill: V2INK });
  s += t(132, y2 + 70, "Marikina AWG · Sun, Jul 13 · 7–9 AM", { size: 15, fill: MUTED });
  s += statusChip(486, y2 + 16, "Pending");

  return s;
}

// ---------- Achievement badges (medal seal + glyph) ----------
// A scalloped medal seal. glyphFn(cx,cy,earned) draws the emblem; locked = grayed + lock.
function medal(cx, cy, r, glyphFn, earned) {
  const scallop = earned ? TEALDK : "#cbd0cb", disc = earned ? TEAL : "#dcdad2";
  let g = "";
  const bumps = 12;
  for (let i = 0; i < bumps; i++) { const a = (i / bumps) * Math.PI * 2; g += `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${(r * 0.2).toFixed(1)}" fill="${scallop}"/>`; }
  g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${disc}"/>`;
  g += `<circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.35"/>`;
  g += glyphFn(cx, cy, earned);
  if (!earned) g += `<circle cx="${cx + r * 0.6}" cy="${cy + r * 0.6}" r="${r * 0.34}" fill="#ffffff"/>` + lockIcon(cx + r * 0.6, cy + r * 0.6, r * 0.3, "#9a988f");
  return g;
}
function badgeGlyph(key, cx, cy, r, earned) {
  const c = earned ? WHITE : "#a7a59d", disc = earned ? TEAL : "#dcdad2";
  if (key === "vol") return heartIcon(cx, cy - 1, r * 1.05, c) + pawmark(cx, cy - r * 0.16, r * 0.3, disc);
  if (key === "check") return `<polyline points="${cx - r * 0.42},${cy + r * 0.02} ${cx - r * 0.12},${cy + r * 0.34} ${cx + r * 0.46},${cy - r * 0.34}" fill="none" stroke="${c}" stroke-width="${r * 0.16}" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (key === "paw") return pawmark(cx, cy, r * 0.72, c);
  if (key === "home") return `<path d="M${cx} ${cy - r * 0.5} L${cx + r * 0.55} ${cy} L${cx + r * 0.4} ${cy} L${cx + r * 0.4} ${cy + r * 0.5} L${cx - r * 0.4} ${cy + r * 0.5} L${cx - r * 0.4} ${cy} L${cx - r * 0.55} ${cy} Z" fill="${c}"/>`;
  if (key === "peso") return t(cx, cy + r * 0.42, "₱", { size: r * 1.2, anchor: "middle", weight: "700", fill: c });
  if (key === "chat") return `<rect x="${cx - r * 0.5}" y="${cy - r * 0.45}" width="${r}" height="${r * 0.72}" rx="${r * 0.22}" fill="${c}"/>` + `<path d="M${cx - r * 0.18} ${cy + r * 0.25} l0 ${r * 0.3} l${r * 0.3} ${-r * 0.3} z" fill="${c}"/>`;
  return "";
}

// ---------- Kawang-Gawa — pet owner's volunteer history (past shifts + reliability) ----------
function kawangGawaHistory(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Volunteer history");

  // summary stats
  const sy = 150;
  s += rrect(34, sy, 472, 116, 24, WHITE, LINE);
  [["12", "Completed"], ["26h", "Hours"], ["0", "No-shows"]].forEach(([n, lab], i) => {
    const cx = 34 + (i + 0.5) * (472 / 3);
    if (i) s += `<line x1="${34 + i * (472 / 3)}" y1="${sy + 28}" x2="${34 + i * (472 / 3)}" y2="${sy + 88}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += t(cx, sy + 56, n, { size: 26, anchor: "middle", weight: "700", fill: NAVY });
    s += t(cx, sy + 88, lab, { size: 17, anchor: "middle", fill: MUTED });
  });

  // earned achievement badge (Active Volunteer)
  s += rrect(34, 288, 472, 96, 20, WHITE, LINE);
  s += medal(90, 336, 34, (cx, cy, e) => badgeGlyph("vol", cx, cy, 34, e), true);
  s += t(150, 322, "Active Volunteer", { size: 20, weight: "800", fill: V2INK });
  s += t(150, 350, "Reliable · 12 shifts · shown on your profile", { size: 14, fill: MUTED });
  s += t(486, 342, "See all ›", { size: 15, anchor: "end", fill: TEAL, weight: "700" });

  // shift history, most recent first. A cancelled shift lands here the moment it's
  // cancelled — even if its date hasn't passed (Jul 12 below) — otherwise it would
  // vanish from My shifts with no record anywhere until the date rolled by.
  s += t(34, 424, "Shift history", { size: 22, weight: "800", fill: V2INK });
  const past = [
    ["walk", "Morning dog walk", "PAWS Manila · Jul 12", "Cancelled"],
    ["walk", "Morning dog walk", "PAWS Manila · Jul 5", "Completed"],
    ["feed", "Feed the rescue pack", "Marikina AWG · Jun 28", "Completed"],
    ["event", "Adoption day helper", "PAWS Manila · Jun 21", "Completed"],
    ["facility", "Kennel cleaning", "Pasig Pound · Jun 14", "Cancelled"],
  ];
  past.forEach(([type, title, meta, st], i) => {
    const y = 452 + i * 100;
    s += rrect(34, y, 472, 88, 20, WHITE, LINE);
    s += avq(80, y + 44, 28) + typeGlyph(type, 80, y + 44, paws);
    s += t(124, y + 40, title, { size: 20, weight: "800", fill: V2INK });
    s += t(124, y + 66, meta, { size: 15, fill: MUTED });
    s += statusChip(486, y + 28, st);
  });

  s += t(270, 986, "Completed and cancelled shifts appear here.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Pet owner: badges collection (achievements, incl. Active Volunteer) ----------
// v2 redesign — built to pull the user toward the NEXT badge, not just display a wall:
// (1) collection-progress hero (a set to complete), (2) an "Almost there" near-win with a live
// progress bar, (3) earned trophies, (4) locked badges that show HOW to earn (removes the mystery).
function badges(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Badges");
  // No "X of Y" hero: the badge set is open-ended (more get added), so a fixed fraction would go
  // stale and wrongly imply a completable collection. Engagement comes from the near-win + how-to-earn.
  s += t(34, 152, "Your badges", { size: 26, weight: "800", fill: V2INK });
  s += t(34, 184, "Earned by helping — shown on your profile.", { size: 15, fill: MUTED });

  // ---- almost there (near-win: closest badge, live progress) ----
  s += t(34, 240, "Almost there", { size: 18, weight: "800", fill: V2INK });
  s += `<rect x="34" y="256" width="472" height="130" rx="22" fill="${SOFT}"/>`;
  s += medal(96, 320, 40, (gx, gy, e) => badgeGlyph("vol", gx, gy, 40, e), false);
  s += t(158, 300, "Super Volunteer", { size: 20, weight: "800", fill: V2INK });
  s += t(158, 326, "Complete 10 volunteer shifts", { size: 13.5, fill: MUTED });
  s += `<rect x="158" y="344" width="290" height="12" rx="6" fill="${WHITE}"/>`;
  s += `<rect x="158" y="344" width="232" height="12" rx="6" fill="url(#v2btn)"/>`;
  s += t(158, 375, "8 of 10 — just 2 more to go!", { size: 13, fill: TEALDK, weight: "800" });

  // ---- earned trophies ----
  s += t(34, 436, "Earned · 3", { size: 18, weight: "800", fill: V2INK });
  [["vol", "Active Volunteer", "Jul 2026"], ["check", "Reliable", "0 no-shows"], ["paw", "First Rescue", "Jun 2026"]].forEach(([key, name, cap], i) => {
    const cx = 108 + i * 162, cy = 504;
    s += medal(cx, cy, 42, (gx, gy, e) => badgeGlyph(key, gx, gy, 42, e), true);
    s += t(cx, cy + 84, name, { size: 14, anchor: "middle", weight: "800", fill: V2INK });
    s += t(cx, cy + 106, cap, { size: 12, anchor: "middle", fill: TEAL, weight: "600" });
  });

  // ---- locked (how to earn — no mystery) ----
  s += t(34, 654, "Keep going", { size: 18, weight: "800", fill: V2INK });
  [["home", "Adopter", "Adopt a pet from a shelter", "12% of members have this"],
   ["peso", "Generous", "Make your first donation", "Rare — be one of the first"]].forEach(([key, name, how, rare], i) => {
    const y = 680 + i * 92;
    s += v2card(34, y, 472, 80, 20);
    s += medal(80, y + 40, 27, (gx, gy, e) => badgeGlyph(key, gx, gy, 27, e), false);
    s += t(128, y + 36, name, { size: 17, weight: "800", fill: V2INK });
    s += t(128, y + 60, how, { size: 13, fill: MUTED });
    s += t(486, y + 30, "Start ›", { size: 13.5, anchor: "end", fill: TEAL, weight: "800" });
    s += t(486, y + 60, rare, { size: 11.5, anchor: "end", fill: "#b8b6ad" });
  });
  return s;
}

// =================== SAGIP — report a stray (pet-owner side) ===================
// The MVP's headline module, and the last one designed. Data model already exists: stray_report
// (species · condition · notes · geom · location_text · is_anonymous) + stray_report_photo, with
// stray_status running reported → claimed → rescued → safe → resolved (Tech Spec §6).
//
// Two constraints shape every screen below:
//  1. DP §6.1 promises reporting "in a few taps" — so the form is ONE screen, the photo is optional
//     and says so, and nothing blocks submission except species + condition.
//  2. Locked decision #11: location is city-only EVERYWHERE except a stray-report pin, which is the
//     single place precise GPS is used. That makes the location screen the most privacy-sensitive
//     surface in the app, so it states the exception in plain words rather than dropping a pin and
//     hoping nobody asks.
//
// NOTE: DP §6.1 still says the reporter "can chat with them in-app" — stale, in-app messaging is
// Phase 2 (decision #6). Contact here is phone / Facebook, matching every other surface.

// Abstract map canvas — roads, blocks, a park and water. Drawn as SVG rather than a tile image so
// the mockups stay self-contained (no network, no API key) and re-render identically every time.
function mapCanvas(x, y, w, h, r = 20) {
  const id = "mc" + Math.round(x) + "_" + Math.round(y);
  let s = `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath></defs>`;
  s += `<g clip-path="url(#${id})">`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e9ece8"/>`;
  s += `<rect x="${x + w * 0.05}" y="${y + h * 0.08}" width="${w * 0.28}" height="${h * 0.16}" rx="12" fill="#dae6d4"/>`;
  s += `<rect x="${x + w * 0.60}" y="${y + h * 0.70}" width="${w * 0.46}" height="${h * 0.22}" rx="12" fill="#d9e3ea"/>`;
  // blocks
  [[0.40, 0.10, 0.22, 0.14], [0.70, 0.14, 0.20, 0.12], [0.08, 0.36, 0.20, 0.16],
   [0.38, 0.38, 0.24, 0.16], [0.72, 0.40, 0.22, 0.14], [0.10, 0.66, 0.22, 0.16],
   [0.38, 0.68, 0.18, 0.14]].forEach(([bx, by, bw, bh]) => {
    s += `<rect x="${x + w * bx}" y="${y + h * by}" width="${w * bw}" height="${h * bh}" rx="8" fill="#e0e4df"/>`;
  });
  // roads over the blocks
  const road = (x1, y1, x2, y2, wd) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${WHITE}" stroke-width="${wd}" stroke-linecap="round"/>`;
  [0.33, 0.64].forEach(f => { s += road(x + w * f, y - 10, x + w * f, y + h + 10, 15); });
  [0.30, 0.62].forEach(f => { s += road(x - 10, y + h * f, x + w + 10, y + h * f, 15); });
  s += road(x - 10, y + h * 0.90, x + w + 10, y + h * 0.16, 19);
  s += `</g>`;
  return s;
}

// a map pin that sits ON the map (drop shadow + white ring) — heavier than the inline pinIcon
function mapPin(cx, cy, fill, sz = 1) {
  return `<ellipse cx="${cx}" cy="${cy + 5 * sz}" rx="${9 * sz}" ry="${3.5 * sz}" fill="#0d1826" opacity="0.18"/>` +
    `<path d="M${cx} ${cy + 4 * sz} c-${13 * sz} -${17 * sz} -${13 * sz} -${29 * sz} 0 -${29 * sz} c${13 * sz} 0 ${13 * sz} ${12 * sz} 0 ${29 * sz} z" fill="${fill}"/>` +
    `<circle cx="${cx}" cy="${cy - 18 * sz}" r="${5.5 * sz}" fill="${WHITE}"/>`;
}

const toggleSwitch = (x, y, on) => `<rect x="${x}" y="${y}" width="54" height="31" rx="15.5" fill="${on ? TEAL : "#d8d6cd"}"/>` +
  `<circle cx="${on ? x + 38 : x + 16}" cy="${y + 15.5}" r="12.5" fill="${WHITE}" filter="url(#v2soft)"/>`;

// ---------- Sagip 1: the report form ----------
function reportStray(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Report a stray");
  s += t(34, 152, "What did you see?", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 184, "A photo helps — but don't wait for one.", { size: 16.5, fill: MUTED });

  // photo is optional and SAYS so: an injured animal on the road is not the moment to fight a camera
  s += `<rect x="34" y="214" width="472" height="120" rx="20" fill="${WHITE}" stroke="${LINE}" stroke-width="2" stroke-dasharray="7 8"/>`;
  s += `<circle cx="270" cy="256" r="26" fill="${SOFT}"/>`;
  s += `<rect x="258" y="248" width="24" height="17" rx="4" fill="none" stroke="${TEAL}" stroke-width="2.4"/>`;
  s += `<circle cx="270" cy="257" r="5" fill="none" stroke="${TEAL}" stroke-width="2.4"/>`;
  s += `<path d="M263 248 l3 -4 h8 l3 4" fill="none" stroke="${TEAL}" stroke-width="2.4" stroke-linejoin="round"/>`;
  s += t(270, 306, "Add a photo · optional", { size: 16, anchor: "middle", fill: TEAL, weight: "700" });

  s += t(34, 372, "Animal", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 390, ["Dog", "Cat", "Other"], 0);

  s += t(34, 478, "Condition", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 496, ["Injured", "Sick", "Healthy"], 0);
  s += chipRow(34, 558, ["Pregnant"], -1);

  s += t(34, 646, "Notes (optional)", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 662, 472, 84, 16, WHITE, LINE);
  s += t(58, 700, "Limping, near the sari-sari store —", { size: 15.5, fill: "#9a988f" });
  s += t(58, 724, "wouldn't let me near.", { size: 15.5, fill: "#9a988f" });

  // location prefilled from GPS; tapping opens the pin screen
  s += rrect(34, 766, 472, 76, 20, WHITE, LINE);
  s += `<circle cx="80" cy="804" r="22" fill="${SOFT}"/>` + pinIcon(80, 800, TEAL);
  s += t(118, 796, "12 Aurora Blvd, Marikina City", { size: 16.5, weight: "700", fill: NAVY });
  s += t(118, 820, "From your GPS", { size: 14, fill: MUTED });
  s += t(486, 810, "Adjust ›", { size: 15, anchor: "end", fill: TEAL, weight: "700" });

  s += rrect(34, 858, 472, 64, 20, WHITE, LINE);
  s += t(58, 897, "Report anonymously", { size: 16.5, weight: "700", fill: NAVY });
  s += toggleSwitch(428, 875, false);

  s += btn(950, "Send report");
  s += t(270, 1052, "Nearby rescuers are alerted right away.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip 2: place the pin ----------
// The ONE screen in the app that uses precise GPS (decision #11 — everywhere else is city-only).
// That exception is stated on the screen, not buried in a policy page: a user who has just been
// told their location is never stored will reasonably wonder what changed here.
function reportStrayLocation() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Set the location");
  s += mapCanvas(34, 148, 472, 500, 22);
  s += mapPin(270, 400, DANGER, 1.5);

  // drag affordance floats on the map rather than sitting below it — the gesture happens here
  s += `<rect x="130" y="176" width="280" height="44" rx="22" fill="${WHITE}" filter="url(#v2sh)"/>`;
  s += t(270, 204, "Drag the map to move the pin", { size: 14.5, anchor: "middle", fill: V2INK, weight: "700" });

  s += rrect(34, 672, 472, 92, 20, WHITE, LINE);
  s += `<circle cx="80" cy="718" r="22" fill="${SOFT}"/>` + pinIcon(80, 714, TEAL);
  s += t(118, 710, "12 Aurora Blvd", { size: 17, weight: "800", fill: V2INK });
  s += t(118, 736, "Marikina City · accurate to ~10 m", { size: 14.5, fill: MUTED });

  s += `<rect x="34" y="784" width="472" height="86" rx="18" fill="${SOFT}"/>`;
  s += lockIcon(70, 820, 18, TEALDK);
  s += t(100, 814, "Only this report uses your exact spot.", { size: 14.5, fill: TEALDK, weight: "700" });
  s += t(100, 840, "Your profile still shows just your city, and the", { size: 13.5, fill: MUTED });
  s += t(100, 860, "pin is dropped once — we don't track you.", { size: 13.5, fill: MUTED });

  s += btn(908, "Use this location");
  return s;
}

// ---------- Sagip 3: report sent ----------
function reportStraySent(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Report sent");
  s += `<circle cx="270" cy="208" r="66" fill="#eaf3de"/>`;
  s += `<polyline points="240,208 262,230 300,188" fill="none" stroke="${OK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(270, 366, "Report sent", { size: 32, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 404, "Rescuers near Marikina City have been alerted.", { size: 16, anchor: "middle", fill: MUTED });

  s += rrect(34, 442, 472, 96, 20, WHITE, LINE);
  s += avq(84, 490, 30) + pawIcon(paws.teal.uri, 84, 490, 32);
  s += t(134, 482, "Dog · Injured", { size: 20, weight: "800", fill: V2INK });
  s += t(134, 510, "12 Aurora Blvd, Marikina City", { size: 15, fill: MUTED });
  s += statusChip(486, 462, "Reported");

  s += t(34, 594, "What happens next", { size: 20, weight: "800", fill: V2INK });
  ["Nearby verified rescuers get an alert", "Someone claims the case — you'll be told who", "You follow every update until it's resolved"].forEach((ln, i) => {
    const y = 636 + i * 52;
    s += `<circle cx="52" cy="${y}" r="17" fill="${SOFT}"/>` + t(52, y + 6, String(i + 1), { size: 17, anchor: "middle", weight: "700", fill: TEAL });
    s += t(84, y + 6, ln, { size: 16, fill: NAVY });
  });

  // honest about the failure case rather than implying a guaranteed rescue
  s += `<rect x="34" y="812" width="472" height="76" rx="18" fill="${SOFT}"/>`;
  s += clockIcon(74, 850, 18, TEAL);
  s += t(106, 844, "No one yet? It widens automatically.", { size: 14.5, fill: TEALDK, weight: "700" });
  s += t(106, 868, "Unclaimed reports alert a bigger radius.", { size: 13.5, fill: MUTED });

  s += btn(924, "Track this report");
  return s;
}

// ---------- Sagip 4: my reports ----------
// opts.tab = 1 → the Offers half, shared with My rescues (see myOffers). A reporter and an offerer
// are usually the same person: someone who reports a stray on Aurora Blvd this morning is exactly
// who offers a ride on Katipunan tonight.
function myReports(paws, opts = {}) {
  if (opts.tab === 1) return myOffers(paws, { fromReports: true });
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("My reports");
  s += segmented(34, 150, 472, ["Reports", "Offers"], 0);
  const sy = 216;
  s += rrect(34, sy, 472, 116, 24, WHITE, LINE);
  [["6", "Reported"], ["4", "Rescued"], ["3", "Resolved"]].forEach(([n, lab], i) => {
    const cx = 34 + (i + 0.5) * (472 / 3);
    if (i) s += `<line x1="${34 + i * (472 / 3)}" y1="${sy + 28}" x2="${34 + i * (472 / 3)}" y2="${sy + 88}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += t(cx, sy + 56, n, { size: 26, anchor: "middle", weight: "700", fill: NAVY });
    s += t(cx, sy + 88, lab, { size: 17, anchor: "middle", fill: MUTED });
  });

  s += t(34, 382, "Your reports", { size: 22, weight: "800", fill: V2INK });
  // the count is offers RECEIVED on that report — the other sense of "offer" from the tab beside it,
  // but unambiguous in place: it sits on a row the reporter filed, next to that report's status.
  // Unclaimed rows only, same rule as the map: once claimed, offers belong to the claimer.
  const rows = [
    ["Dog · Injured", "Aurora Blvd · 20 min ago", "Reported", "2 offers"],
    ["Cat · Pregnant", "Katipunan Ave · Jul 19", "Claimed", ""],
    ["Dog · Sick", "P. Tuazon · Jul 16", "Safe", ""],
    ["Dog · Healthy", "Marcos Hwy · Jul 11", "Resolved", ""],
  ];
  rows.forEach(([title, meta, st, offers], i) => {
    const y = 414 + i * 104;
    s += rrect(34, y, 472, 88, 20, WHITE, LINE);
    const done = st === "Resolved";
    s += avq(80, y + 44, 28, done ? "#eceae4" : SOFT) + pawIcon(paws.teal.uri, 80, y + 44, 30);
    s += t(124, y + 40, title, { size: 19, weight: "700", fill: done ? "#9a988f" : NAVY });
    s += t(124, y + 66, meta, { size: 15, fill: done ? "#b8b6ad" : MUTED });
    s += statusChip(486, y + 28, st);
    if (offers) s += t(486, y + 78, offers, { size: 13, anchor: "end", fill: TEALDK, weight: "700" });
  });

  s += t(270, 876, "Tap a report to see who's helping.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip 5: report detail (status timeline + who claimed it) ----------
// opts.unclaimed → the state the MVP will spend most of its time in. Metro Manila generates strays
// far faster than rescue capacity absorbs them, so an unclaimed report is the DEFAULT, not the edge
// case — and until now this screen only rendered the happy path. A reporter who watches nothing
// happen learns that reporting does nothing, stops, and tells people; that churn is the real cost
// of an unclaimed queue, well before any operational one.
// opts.offers → how many people have offered. 0 is the honest, and hardest, state to design.
function reportDetail(paws, opts = {}) {
  const unclaimed = !!opts.unclaimed;
  const nOffers = opts.offers === undefined ? 2 : opts.offers;
  const fbIcon = (cx, cy, c) => rrect(cx - 12, cy - 12, 24, 24, 6, c) + t(cx, cy + 8, "f", { size: 18, anchor: "middle", fill: WHITE, weight: "700" });
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Your report");

  s += rrect(34, 148, 472, 96, 20, WHITE, LINE);
  s += avq(84, 196, 30) + pawIcon(paws.teal.uri, 84, 196, 32);
  s += t(134, 188, "Dog · Injured", { size: 20, weight: "800", fill: V2INK });
  s += t(134, 216, unclaimed ? "Aurora Blvd · reported 3 h ago" : "Aurora Blvd · reported 20 min ago", { size: 15, fill: MUTED });
  s += statusChip(486, 168, unclaimed ? "Reported" : "Claimed");

  // 5-stage lifecycle, same vertical tracker language as the adoption journey
  s += rrect(34, 268, 472, 344, 20, WHITE, LINE);
  const stages = unclaimed ? [
    ["Reported", "You · 5:04 AM", "done"],
    ["Claimed", "Waiting", "in_progress"],
    ["Rescued", "", "todo"],
    ["At vet / safe", "", "todo"],
    ["Resolved", "", "todo"],
  ] : [
    ["Reported", "You · 8:12 AM", "done"],
    ["Claimed", "Marikina AWG · 8:31 AM", "done"],
    ["Rescued", "In progress", "in_progress"],
    ["At vet / safe", "", "todo"],
    ["Resolved", "", "todo"],
  ];
  const bx = 76, sy0 = 314, sp = 66;
  stages.forEach(([label, meta, st], i) => {
    const cy = sy0 + i * sp;
    if (i < stages.length - 1) s += `<line x1="${bx}" y1="${cy + 15}" x2="${bx}" y2="${cy + sp - 15}" stroke="${st === "done" ? TEAL : LINE}" stroke-width="3"/>`;
    if (st === "done") s += `<circle cx="${bx}" cy="${cy}" r="14" fill="${TEAL}"/>` +
      `<polyline points="${bx - 6},${cy} ${bx - 1},${cy + 5} ${bx + 7},${cy - 5}" fill="none" stroke="${WHITE}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (st === "in_progress") s += `<circle cx="${bx}" cy="${cy}" r="14" fill="${WHITE}" stroke="${TEAL}" stroke-width="4"/>` + `<circle cx="${bx}" cy="${cy}" r="5.5" fill="${TEAL}"/>`;
    else s += `<circle cx="${bx}" cy="${cy}" r="12" fill="${WHITE}" stroke="${LINE}" stroke-width="3"/>`;
    const active = st === "done" || st === "in_progress";
    s += t(112, cy + 6, label, { size: 17, weight: active ? "700" : "600", fill: active ? NAVY : "#9a988f" });
    if (meta) s += t(484, cy + 6, meta, { size: 13.5, anchor: "end", fill: st === "in_progress" ? TEAL : MUTED, weight: st === "in_progress" ? "700" : "normal" });
  });

  if (unclaimed) {
    // "Who's helping" cannot render — nobody has it. Swapping in the offers list is the whole
    // counter to the churn described above: the reporter sees motion without a claim, which is the
    // difference between "nothing happened" and "not yet".
    s += t(34, 660, "Offers of help", { size: 20, weight: "800", fill: V2INK });
    const cardH = nOffers ? 160 : 240;
    s += rrect(34, 680, 472, cardH, 20, WHITE, LINE);
    if (nOffers) {
      [["transport", "Miguel S.", "1.4 km away"], ["vet_cost", "Jenny dela Cruz", "Offered 40 min ago"]].forEach(([key, name, meta], i) => {
        const [glyph, label] = OFFERS[key];
        const y = 700 + i * 76;
        s += avq(80, y + 38, 24, SOFT) + glyph(80, y + 38, 30, TEALDK);
        s += t(124, y + 32, name, { size: 17.5, weight: "700", fill: NAVY });
        s += t(124, y + 58, `${label} · ${meta}`, { size: 14, fill: MUTED });
      });
    } else {
      // the honest empty state. The reporter is on-scene and already cares, which makes them the
      // likeliest rescuer of this specific animal — so the screen hands them something to do
      // rather than an apology.
      s += t(58, 726, "No offers yet", { size: 18, weight: "800", fill: "#6b6a63" });
      s += t(58, 754, "While you wait, these help most:", { size: 14.5, fill: MUTED });
      [["Share the report", "More eyes on it than the map alone"],
       ["Leave food and water", "Keeps her there and findable"],
       ["Find the nearest vet", "3 open clinics within 2 km"]].forEach(([title, sub], i) => {
        const y = 784 + i * 48;
        s += pawIcon(paws.teal.uri, 74, y - 6, 22);
        s += t(108, y, title, { size: 16, weight: "700", fill: NAVY });
        s += t(108, y + 20, sub, { size: 13, fill: MUTED });
      });
    }
    // escalation is what the app is doing on the reporter's behalf while nobody claims. Saying so
    // is most of the reassurance available when the answer is still "no one yet".
    const ey = 680 + cardH + 24;
    s += `<rect x="34" y="${ey}" width="472" height="70" rx="18" fill="${SOFT}"/>`;
    s += clockIcon(70, ey + 35, 15, TEALDK);
    s += t(100, ey + 29, "Widened to 5 km", { size: 14.5, fill: TEALDK, weight: "700" });
    s += t(100, ey + 53, "12 rescuers notified · shelters at 24 h", { size: 13.5, fill: MUTED });
    s += btnOutline(ey + 90, "Share this report");
    s += t(270, ey + 196, "We'll tell you the moment someone claims her.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
    return s;
  }

  // who has it — the reporter's main question after "did anyone come?"
  s += t(34, 660, "Who's helping", { size: 20, weight: "800", fill: V2INK });
  s += rrect(34, 680, 472, 104, 20, WHITE, LINE);
  s += avq(84, 732, 30) + buildingIcon(84, 732, 32, TEAL, SOFT);
  s += t(134, 722, "Marikina AWG", { size: 19, weight: "800", fill: V2INK }) + verified(282, 715, 11);
  s += t(134, 750, "Verified Rescue · 1.2 km away", { size: 14.5, fill: MUTED });

  // offers don't vanish on claim — they convert from latent to the claimer's support crew, which
  // is the payoff that makes offering feel like it did something
  s += t(34, 812, "2 others offered to help", { size: 15, fill: MUTED });
  s += t(486, 812, "Marikina AWG can see them", { size: 13.5, anchor: "end", fill: "#b8b6ad" });

  // in-app chat is Phase 2 → phone / Facebook, same as every other contact surface
  const half = 229;
  s += rrect(34, 844, half, 64, 32, WHITE, LINE) + phoneIcon(120, 876, TEAL) + t(150, 884, "Call", { size: 18, fill: NAVY, weight: "700" });
  s += rrect(277, 844, half, 64, 32, WHITE, LINE) + fbIcon(330, 876, TEAL) + t(356, 884, "Message", { size: 18, fill: NAVY, weight: "700" });

  s += t(270, 956, "You'll be notified at every status change.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip 6: nearby strays map ----------
// Everyone sees this (DP §6.1: "all users see reports on the map") — claiming is the gated part,
// not looking. Pins are colour-coded so a rescuer can tell at a glance what still needs someone,
// which is also the duplicate-response guard.
function rescueMap(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Nearby strays");
  s += mapCanvas(0, 110, SW, 560, 0);

  // amber = unclaimed (needs someone), teal = claimed, green = safe
  [[150, 250, WARN2, 1.25], [352, 318, WARN2, 1.25], [232, 430, TEAL, 1.1], [420, 500, OK, 1.0], [96, 556, TEAL, 1.0]].forEach(([px, py, c, z]) => {
    s += mapPin(px, py, c, z);
  });

  // legend floats on the map
  s += `<rect x="24" y="136" width="300" height="42" rx="21" fill="${WHITE}" filter="url(#v2sh)"/>`;
  [["Needs help", WARN2, 46], ["Being helped", TEAL, 158], ["Safe", OK, 268]].forEach(([lab, c, lx]) => {
    s += `<circle cx="${lx}" cy="157" r="6" fill="${c}"/>` + t(lx + 12, 162, lab, { size: 12.5, fill: V2INK, weight: "700" });
  });

  // bottom sheet — the map answers "where", the list answers "what and how long ago"
  s += `<rect x="0" y="640" width="${SW}" height="${SH - 640}" rx="28" fill="${BG}" filter="url(#v2sh)"/>`;
  s += `<rect x="240" y="662" width="60" height="5" rx="2.5" fill="#d8d6cd"/>`;
  s += t(34, 712, "5 nearby", { size: 22, weight: "800", fill: V2INK });
  s += t(506, 712, "Within 3 km", { size: 15, anchor: "end", fill: MUTED });

  // ⚠️ Offer counts live in the ROWS, never on the pins (settled 2026-07-21). A pin answers exactly
  // one question — does this need someone? — and a second visual dimension on it would make a
  // supported case read as a handled case at a glance, which is the confusion the never-moves-
  // stray_status rule exists to prevent. The row is where a rescuer is already reading detail, and
  // knowing which unclaimed cases have backing BEFORE opening one is the whole "support makes
  // claiming cheaper" mechanism.
  const rows = [
    ["Dog · Injured", "Aurora Blvd · 20 min ago", "Reported", "3 offers"],
    ["Cat · Pregnant", "Katipunan Ave · 1 h ago", "Claimed", ""],
    ["Dog · Sick", "P. Tuazon · 3 h ago", "Claimed", ""],
  ];
  rows.forEach(([title, meta, st, offers], i) => {
    const y = 740 + i * 96;
    s += rrect(34, y, 472, 80, 20, WHITE, LINE);
    s += avq(80, y + 40, 26) + pawIcon(paws.teal.uri, 80, y + 40, 28);
    s += t(122, y + 36, title, { size: 18, weight: "700", fill: NAVY });
    s += t(122, y + 60, meta, { size: 14, fill: MUTED });
    s += statusChip(486, y + 24, st);
    // only on unclaimed rows: once a case is claimed the offers belong to the claimer, not the feed
    if (offers) s += t(486, y + 70, offers, { size: 13, anchor: "end", fill: TEALDK, weight: "700" });
  });
  return s;
}

// =================== SAGIP — claim & work a case (rescuer side) ===================
// The other half of the loop. Backed by rescue_case (report_id UNIQUE — one claim per report,
// first-come) + case_status_history (the audit trail behind the reporter's timeline).
//
// The UNIQUE constraint is the design driver: a claim is EXCLUSIVE. Once taken, nobody else can
// help, and the animal's fate now depends on one person showing up. That makes claiming a
// commitment, not a bookmark — so the confirm names that plainly instead of celebrating the tap.
//
// Who can claim: Verified Member (rescuer capability) OR verified shelter — the same predicate as
// listing an animal. An unverified owner hits the gate rather than a dead button.

// ---------- The commitment ladder — offers (report_offer) ----------
// Claiming is exclusive AND binding, which makes it the most expensive verb in the app. For most
// people reading a report the honest answer is "I can't own this animal's outcome, but I can do ONE
// thing" — and while claiming is the only action on the screen, that answer renders as no action at
// all. report_offer is the lower rung: non-exclusive, many per report, many per person.
//
// Offers do not rescue animals. What they do is make CLAIMING cheaper — a rescuer looking at a bare
// report is signing up to do everything alone; one looking at two transport offers and a foster is
// signing up to do a part. That is why the strip sits ABOVE the "claiming is final" warning: you
// learn the case has support before you read what committing costs.
//
// ⚠️ AN OFFER NEVER MOVES stray_status. The report stays `reported` and stays amber on the map. If
// offers marked a case as handled, four offers and no claimer would look solved while nobody is
// going — the same silent-failure shape as the listing-visibility bug (HANDOFF decision 3), except
// here the thing that quietly goes nowhere is an injured animal.
const carGlyph = (cx, cy, s, c) =>
  `<path d="M${cx - s * 0.55} ${cy + s * 0.1} q0 ${-s * 0.28} ${s * 0.22} ${-s * 0.3} l${s * 0.16} ${-s * 0.26} h${s * 0.34} l${s * 0.16} ${s * 0.26} q${s * 0.22} 0.02 ${s * 0.22} ${s * 0.3} z" fill="${c}"/>` +
  `<circle cx="${cx - s * 0.28}" cy="${cy + s * 0.17}" r="${s * 0.11}" fill="${c}"/>` +
  `<circle cx="${cx + s * 0.28}" cy="${cy + s * 0.17}" r="${s * 0.11}" fill="${c}"/>`;
// a first-aid kit, not a cross-in-a-circle: on a row of tappable cards that earlier shape reads as
// a "+ add" affordance rather than a subject. The filled body + handle makes it an object.
const vetGlyph = (cx, cy, s, c) =>
  `<rect x="${cx - s * 0.16}" y="${cy - s * 0.42}" width="${s * 0.32}" height="${s * 0.12}" rx="${s * 0.04}" fill="none" stroke="${c}" stroke-width="${s * 0.09}"/>` +
  `<rect x="${cx - s * 0.44}" y="${cy - s * 0.3}" width="${s * 0.88}" height="${s * 0.66}" rx="${s * 0.1}" fill="${c}"/>` +
  `<line x1="${cx}" y1="${cy - s * 0.12}" x2="${cx}" y2="${cy + s * 0.18}" stroke="${WHITE}" stroke-width="${s * 0.12}" stroke-linecap="round"/>` +
  `<line x1="${cx - s * 0.15}" y1="${cy + s * 0.03}" x2="${cx + s * 0.15}" y2="${cy + s * 0.03}" stroke="${WHITE}" stroke-width="${s * 0.12}" stroke-linecap="round"/>`;
// a crate: lid band across the top, tape stub on the lid only. The tape must NOT run the full
// height — a full-height divider crossing the lid line reads as a four-pane window, not a box.
// an undo arc — the home-heart is the Verified Rescue badge mark, so reusing it for "withdraw" or
// "declined" would give one glyph two unrelated meanings. Shared by the offer and placement flows.
const undoGlyph = (cx, cy, s, c) =>
  `<path d="M${cx - s * 0.34} ${cy + s * 0.06} a${s * 0.36} ${s * 0.36} 0 1 1 ${s * 0.12} ${s * 0.26}" fill="none" stroke="${c}" stroke-width="${s * 0.13}" stroke-linecap="round"/>` +
  `<polyline points="${cx - s * 0.52},${cy - s * 0.1} ${cx - s * 0.34},${cy + s * 0.08} ${cx - s * 0.14},${cy - s * 0.08}" fill="none" stroke="${c}" stroke-width="${s * 0.13}" stroke-linecap="round" stroke-linejoin="round"/>`;
const boxGlyph = (cx, cy, s, c) =>
  `<rect x="${cx - s * 0.42}" y="${cy - s * 0.3}" width="${s * 0.84}" height="${s * 0.62}" rx="${s * 0.06}" fill="none" stroke="${c}" stroke-width="${s * 0.11}"/>` +
  `<line x1="${cx - s * 0.42}" y1="${cy - s * 0.06}" x2="${cx + s * 0.42}" y2="${cy - s * 0.06}" stroke="${c}" stroke-width="${s * 0.11}"/>` +
  `<line x1="${cx}" y1="${cy - s * 0.3}" x2="${cx}" y2="${cy - s * 0.06}" stroke="${c}" stroke-width="${s * 0.11}"/>`;

// offer_type → glyph + label, in the order they unblock a rescue (street → vet → meanwhile)
//
// ⚠️ NO `foster` HERE, by decision (2026-07-21, final). A rescued stray goes into rescuer/shelter
// custody FIRST — that custody step is the animal's safety guarantee, and a street-side foster offer
// routes around it, handing an animal straight from a finder to whoever raised a hand fastest.
// Every remaining type SUPPORTS the person holding the animal; none of them takes custody. That is
// what makes the set coherent, and it is why foster alone kept dragging a gating question behind it:
// it was never the same kind of thing as the other three.
// A Verified Member who wants the animal goes through DIRECT PLACEMENT instead — the claimer hands
// it over deliberately, with a record. See the rescue→adoption handoff.
const OFFERS = {
  transport: [carGlyph, "Transport", "Drive it to a vet or shelter"],
  vet_cost: [vetGlyph, "Vet costs", "Chip in for treatment"],
  supplies: [boxGlyph, "Supplies", "Food, crate, or a carrier"],
};

// The summary row on rescue-case. The empty state is deliberately NOT hidden — a rescuer about to
// claim an unsupported case should know that is what they are doing.
function offerStrip(y, n, summary) {
  if (!n) {
    let s = rrect(34, y, 472, 76, 20, "#efeee8");
    s += t(58, y + 34, "No one has offered yet", { size: 16.5, weight: "700", fill: "#6b6a63" });
    s += t(58, y + 58, "You'd be on your own for this one.", { size: 14, fill: "#8d8b83" });
    return s;
  }
  let s = rrect(34, y, 472, 76, 20, WHITE, LINE);
  for (let i = 0; i < Math.min(n, 3); i++) {
    const cx = 78 + i * 30;
    s += avq(cx, y + 38, 20, WHITE) + avq(cx, y + 38, 17, SOFT) + personIcon(cx, y + 38, 22, TEAL);
  }
  const tx = 78 + Math.min(n, 3) * 30 + 16;
  s += t(tx, y + 34, `${n} ${n === 1 ? "person" : "people"} can help`, { size: 16.5, weight: "800", fill: V2INK });
  s += t(tx, y + 58, summary, { size: 14, fill: MUTED });
  s += t(486, y + 46, "›", { size: 24, anchor: "end", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Sagip 7: a case, seen by a rescuer (unclaimed) ----------
// opts.offers = how many people have already offered (0 → the on-your-own empty state)
function rescueCase(paws, opts = {}) {
  const nOffers = opts.offers === undefined ? 3 : opts.offers;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Stray report");

  // the reporter's photo leads — a rescuer decides mostly on what they can see
  s += rrect(34, 148, 472, 196, 22, "#dbe6e2");
  s += pawIcon(paws.teal.uri, 270, 240, 84);
  s += rrect(56, 170, 128, 36, 18, WHITE) + `<circle cx="80" cy="188" r="5" fill="${WARN2}"/>` +
    t(96, 194, "Unclaimed", { size: 14, fill: WARN2, weight: "700" });

  s += t(34, 388, "Dog · Injured", { size: 26, weight: "800", fill: V2INK });
  s += t(34, 420, "1.2 km away · reported 20 min ago", { size: 16, fill: MUTED });

  s += t(34, 470, "Reporter's notes", { size: 17, weight: "700", fill: NAVY });
  s += rrect(34, 486, 472, 80, 18, WHITE, LINE);
  s += t(58, 522, "Limping, near the sari-sari store —", { size: 15.5, fill: NAVY });
  s += t(58, 546, "wouldn't let me near.", { size: 15.5, fill: NAVY });

  // location with a map thumbnail — "where exactly" is the rescuer's second question
  s += rrect(34, 594, 472, 96, 20, WHITE, LINE);
  s += mapCanvas(52, 610, 64, 64, 14) + mapPin(84, 654, DANGER, 0.7);
  s += t(134, 634, "12 Aurora Blvd", { size: 17, weight: "800", fill: V2INK });
  s += t(134, 660, "Marikina City · tap for directions", { size: 14.5, fill: MUTED });
  s += t(486, 648, "Open ›", { size: 15, anchor: "end", fill: TEAL, weight: "700" });

  s += t(34, 718, "Reported by Ana R.", { size: 15, fill: MUTED });

  // what the case already has, BEFORE the cost of taking it — see the ladder note above
  s += offerStrip(736, nOffers, "2 transport · 1 vet costs");

  // the exclusivity warning belongs BEFORE the button, not in the confirm alone — a rescuer
  // should know the stakes while deciding, not after they've already tapped
  s += `<rect x="34" y="828" width="472" height="70" rx="18" fill="${WARNBG}"/>`;
  s += alertIcon(70, 863, 16, WARN2);
  s += t(100, 857, "Claiming is final.", { size: 14.5, fill: WARN2, weight: "700" });
  s += t(100, 881, "It's locked to you and can't be handed back.", { size: 13.5, fill: WARN });

  // three rungs, rendered as three weights: own the outcome · do one thing · pass it on. Share used
  // to sit alone under the button as the only alternative to claiming — the weakest possible second
  // rung, and the reason the screen offered nothing to the many people who can help but can't commit.
  s += btn(916, "Claim this case");
  s += btnOutline(996, "Can't go? Offer help");
  s += t(270, 1100, "Share this report", { size: 15, anchor: "middle", fill: TEALDK, weight: "700" });
  return s;
}

// ---------- Sagip 8: claim confirmation ----------
// Deliberately NOT a celebration. rescue_case.report_id is UNIQUE, so a claim is exclusive: an
// optimistic tap that never turns into a visit leaves the animal worse off than an unclaimed
// report, because the report stops asking anyone else for help. The modal therefore leads with
// the person who is now depending on it and states the exclusivity, rather than "nice, you're
// helping!" — the honest framing is the anti-abandonment mechanism.
function rescueClaimConfirm(paws) {
  let s = rescueCase(paws);
  s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;
  s += `<rect x="50" y="300" width="440" height="578" rx="26" fill="${WHITE}" filter="url(#v2sh)"/>`;

  s += `<circle cx="270" cy="374" r="38" fill="${SOFT}"/>` + pinIcon(270, 370, TEAL);
  s += t(270, 456, "Claim this case?", { size: 25, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 494, "Ana will be told you're on the way.", { size: 15, anchor: "middle", fill: MUTED });

  s += `<rect x="82" y="526" width="376" height="74" rx="16" fill="${WARNBG}"/>`;
  s += alertIcon(116, 563, 15, WARN2);
  s += t(146, 557, "It's yours from here", { size: 13.5, fill: WARN2, weight: "700" });
  s += t(146, 580, "No one else can take it, and you can't hand it back.", { size: 12.5, fill: WARN });

  s += `<rect x="82" y="612" width="376" height="74" rx="16" fill="${SOFT}"/>`;
  s += clockIcon(116, 649, 15, TEALDK);
  s += t(146, 643, "You drive the updates", { size: 13.5, fill: TEALDK, weight: "700" });
  s += t(146, 666, "Rescued → at vet → safe → resolved.", { size: 13, fill: MUTED });

  s += t(270, 716, "This can't be undone — only claim if you're sure.", { size: 12.5, anchor: "middle", fill: "#a9adaa" });
  s += `<rect x="82" y="736" width="376" height="64" rx="32" fill="url(#v2btn)" filter="url(#v2soft)"/>`;
  s += t(270, 776, "Yes, I'm going", { size: 20, anchor: "middle", fill: WHITE, weight: "700" });
  // every confirm in the app pairs a primary with a way out — and this one especially needs it:
  // the whole point is that backing out now is better than an abandoned claim later
  s += t(270, 848, "Not now", { size: 18, anchor: "middle", fill: TEALDK, weight: "700" });
  return s;
}

// ---------- Sagip 8b: make an offer (the lower rung) ----------
// Reached from "Can't go? Offer help" on rescue-case. The screen's hardest job is copy, not layout:
// it must never let someone leave believing they have solved the case. Hence the amber strip above
// the button — an offer is a promise to a future claimer, and the animal is still on the street.
//
// Offers are commitments, not reactions: sending one shares your contact with whoever claims (the
// same per-item consent pattern as a Kawang-Gawa shift). No counts on profiles, no badge for
// offering — the moment offering is cheaper than it looks, the feature becomes applause.
//
// ⚠️ WINDOWS (settled 2026-07-21). Offers expire at 48 h; a stalled CLAIM expires by condition —
// injured/sick 6 h, pregnant 12 h, healthy 24 h. The offer window must exceed the longest claim
// window, and that ordering is load-bearing, not tidiness: auto-expiry is only acceptable because a
// reopened case re-asks the people who already offered. Set offers shorter than 24 h and a case
// that reopens at hour 24 finds an empty offer list, which is a cold rebroadcast into the same
// silence that stalled it. If either number moves, move both.
function rescueOffer(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Offer help");

  s += rrect(34, 148, 472, 88, 20, WHITE, LINE);
  s += avq(80, 192, 28) + pawIcon(paws.teal.uri, 80, 192, 30);
  s += t(126, 184, "Dog · Injured", { size: 19, weight: "800", fill: V2INK });
  s += t(126, 212, "Aurora Blvd · still unclaimed", { size: 14.5, fill: WARN2, weight: "600" });

  s += t(34, 286, "What can you do?", { size: 22, weight: "800", fill: V2INK });

  // Full-width rows, not the old 2×2 — three types in a 2×2 leaves a hole, and the row gives the
  // sub line room to breathe. Multi-select: one person can offer transport AND supplies, and each
  // checked type writes its own report_offer row (UNIQUE is per report+account+TYPE, not per person).
  const cards = [["transport", true], ["vet_cost", false], ["supplies", false]];
  cards.forEach(([key, on], i) => {
    const [glyph, label, sub] = OFFERS[key];
    const y = 312 + i * 100;
    s += rrect(34, y, 472, 88, 20, on ? SOFT : WHITE, on ? undefined : LINE);
    if (on) s += `<rect x="34" y="${y}" width="472" height="88" rx="20" fill="none" stroke="${TEAL}" stroke-width="2.5"/>`;
    s += avq(84, y + 44, 26, on ? WHITE : SOFT) + glyph(84, y + 44, 30, on ? TEALDK : TEAL);
    s += t(134, y + 38, label, { size: 18.5, weight: "800", fill: on ? TEALDK : NAVY });
    s += t(134, y + 63, sub, { size: 14, fill: MUTED });
    if (on) s += verified(470, y + 44, 15);
    else s += `<circle cx="470" cy="${y + 44}" r="15" fill="${WHITE}" stroke="#d8d6cd" stroke-width="3"/>`;
  });

  s += t(34, 632, "Add a note · optional", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 648, 472, 80, 16, WHITE, LINE);
  s += t(58, 684, "Free after 6 PM, I have a car and a", { size: 15.5, fill: "#9a988f" });
  s += t(58, 708, "large crate. Can meet at Aurora.", { size: 15.5, fill: "#9a988f" });

  const checkbox = y => rrect(34, y, 30, 30, 8, TEAL) + `<polyline points="41,${y + 15} 47,${y + 22} 58,${y + 8}" fill="none" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += checkbox(752);
  s += t(78, 774, "Share my number with whoever claims", { size: 16, fill: NAVY });
  s += t(78, 798, "this case, so they can coordinate.", { size: 16, fill: NAVY });

  // the load-bearing sentence on the screen
  s += `<rect x="34" y="828" width="472" height="70" rx="18" fill="${WARNBG}"/>`;
  s += alertIcon(70, 863, 16, WARN2);
  s += t(100, 857, "This isn't a claim.", { size: 14.5, fill: WARN2, weight: "700" });
  s += t(100, 881, "Someone still has to go and get her.", { size: 13.5, fill: WARN });

  s += btn(920, "Send offer");
  s += t(270, 1032, "Offers expire after 48 hours.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip 8c: offer sent ----------
// Mirrors rescue-offer's restraint: confirms the offer, refuses to imply the case is handled.
function rescueOfferSent(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Offer help");
  s += `<circle cx="270" cy="238" r="70" fill="${SOFT}"/>` + carGlyph(270, 238, 64, TEALDK);
  s += t(270, 366, "Offer sent", { size: 30, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 406, "Ana can see that someone's ready", { size: 18, anchor: "middle", fill: MUTED });
  s += t(270, 434, "to drive — that helps.", { size: 18, anchor: "middle", fill: MUTED });

  // status is stated plainly rather than softened: the case is exactly as unclaimed as it was
  s += `<rect x="34" y="478" width="472" height="70" rx="18" fill="${WARNBG}"/>`;
  s += alertIcon(70, 513, 16, WARN2);
  s += t(100, 507, "The case is still unclaimed.", { size: 14.5, fill: WARN2, weight: "700" });
  s += t(100, 531, "It stays on the map until someone goes.", { size: 13.5, fill: WARN });

  s += t(34, 606, "What happens next", { size: 20, weight: "800", fill: V2INK });
  s += rrect(34, 626, 472, 260, 20, WHITE, LINE);
  [[personIcon, "Someone claims it", "They get your number and call you."],
   [clockIcon, "No one claims in 48 h", "Your offer expires — we'll ask again if it reopens."],
   [undoGlyph, "You change your mind", "Withdraw any time from My rescues › Offers."]].forEach(([g, title, sub], i) => {
    const y = 668 + i * 82;
    s += g(76, y, i === 1 ? 17 : 30, TEAL);
    s += t(120, y - 4, title, { size: 17, weight: "700", fill: NAVY });
    s += t(120, y + 22, sub, { size: 14, fill: MUTED });
  });

  s += btn(922, "Back to the map");
  s += t(270, 1026, "Still able to go yourself? You can claim it.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip 9: post a status update ----------
// The claimer drives stray_status forward; each post writes case_status_history and notifies the
// reporter. Outcome note + photo land on rescue_case.outcome_notes / outcome_photo_url.
function rescueUpdate(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Post an update");

  s += rrect(34, 148, 472, 88, 20, WHITE, LINE);
  s += avq(80, 192, 28) + pawIcon(paws.teal.uri, 80, 192, 30);
  s += t(126, 184, "Dog · Injured", { size: 19, weight: "800", fill: V2INK });
  s += t(126, 212, "Aurora Blvd · claimed 8:31 AM", { size: 14.5, fill: MUTED });

  s += t(34, 282, "Where is it now?", { size: 20, weight: "800", fill: V2INK });
  // radio list rather than chips: these are sequential states, and a tapped-by-accident chip row
  // would let someone skip from claimed straight to resolved
  const steps = [["Rescued", "You have the animal", true], ["At vet / safe", "Getting care or sheltered", false],
                 ["Resolved", "Home, shelter, or listed for adoption", false]];
  steps.forEach(([lab, sub, on], i) => {
    const y = 306 + i * 92;
    s += rrect(34, y, 472, 80, 20, WHITE, on ? TEAL : LINE);
    s += `<circle cx="76" cy="${y + 40}" r="15" fill="${WHITE}" stroke="${on ? TEAL : "#d8d6cd"}" stroke-width="3"/>`;
    if (on) s += `<circle cx="76" cy="${y + 40}" r="7" fill="${TEAL}"/>`;
    s += t(112, y + 34, lab, { size: 17.5, weight: "700", fill: NAVY });
    s += t(112, y + 58, sub, { size: 14, fill: MUTED });
  });

  s += t(34, 618, "Add a note", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 634, 472, 84, 16, WHITE, LINE);
  s += t(58, 672, "Picked her up, heading to the vet on", { size: 15.5, fill: "#9a988f" });
  s += t(58, 696, "Katipunan. Leg looks broken.", { size: 15.5, fill: "#9a988f" });

  s += `<rect x="34" y="740" width="472" height="96" rx="20" fill="${WHITE}" stroke="${LINE}" stroke-width="2" stroke-dasharray="7 8"/>`;
  s += `<circle cx="270" cy="775" r="22" fill="${SOFT}"/>`;
  s += `<line x1="270" y1="764" x2="270" y2="786" stroke="${TEAL}" stroke-width="3.5" stroke-linecap="round"/><line x1="259" y1="775" x2="281" y2="775" stroke="${TEAL}" stroke-width="3.5" stroke-linecap="round"/>`;
  s += t(270, 818, "Add a photo · optional", { size: 15, anchor: "middle", fill: TEAL, weight: "700" });

  s += btn(866, "Post update");
  s += t(270, 968, "Ana is notified every time you post.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  // NO release action, by decision (2026-07-21): a claim is binding. Once someone has committed to
  // an animal, the app does not offer a one-tap way to put it back on the street. See the note in
  // rescueClaimConfirm — the commitment is stated up front instead, which is where it belongs.
  return s;
}

// =================== SAGIP — rescue → adoption handoff ===================
// What happens to an animal AFTER it is safe. Two paths off a resolved case: list it publicly (the
// full staged adoption journey), or place it directly with one named person.
//
// ⚠️ THE CUSTODY RULE (decided 2026-07-21) drives all of this: a stray lands in rescuer/shelter
// custody FIRST, always. Placement is a second, deliberate act by whoever is holding the animal —
// never a pull by someone who wants it. Three consequences, all load-bearing:
//   1. These screens are reachable ONLY at stray_status `safe` or `resolved`. You cannot place an
//      animal you have not secured. That is a STATE GATE, not a disabled button.
//   2. The claimer pushes; there is no "I want this one" affordance anywhere on the member side.
//   3. The recipient must be Verified Member OR verified shelter — the SAME predicate that already
//      gates adopting (decision 3). No new gate, no new badge; an unverified recipient hits the
//      existing adoptRescuerGate untouched.
// It is also TWO-SIDED: the claimer proposes, the recipient accepts. You cannot hand an animal to
// someone without their consent, and the accept screen is where they see what they are taking on.
//
// No schema change — decision 9 built adoption stages as SKIPPABLE and this is exactly that case:
// an adoption_listing carrying source_report_id that is never published, an adoption_inquiry for
// the named member, all six stages `skipped` except finalization `done`, terminating at `adopted`.
// The adopter record existing at all is the point; traceability is what the badge is for.

// ---------- Sagip 11: what happens to her now (claimer's fork) ----------
// The entry point. Without it the whole placement flow is orphaned — this project has already run
// two orphan sweeps, so the affordance ships with the flow rather than after it.
function rescueOutcome(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Her next home");

  s += rrect(34, 148, 472, 96, 20, WHITE, LINE);
  s += avq(84, 196, 30) + pawIcon(paws.teal.uri, 84, 196, 32);
  s += t(134, 188, "Dog · Injured", { size: 20, weight: "800", fill: V2INK });
  s += t(134, 216, "Aurora Blvd · with you since Jul 19", { size: 15, fill: MUTED });
  s += statusChip(486, 168, "Safe");

  s += t(34, 306, "What happens to her now?", { size: 24, weight: "800", fill: V2INK });
  s += t(34, 340, "She's safe with you, so this is your call.", { size: 16, fill: MUTED });

  [[homeHeartIcon, "List for adoption", "Anyone can apply. Full adoption steps —", "application, home check, interview."],
   [personIcon, "Place with someone", "Hand her to one person you choose.", "The steps are skipped — you vouch."]].forEach(([glyph, title, l1, l2], i) => {
    const y = 386 + i * 172;
    s += rrect(34, y, 472, 152, 22, WHITE, LINE);
    s += avq(84, y + 52, 30, SOFT) + glyph(84, y + 52, 34, TEALDK);
    s += t(134, y + 46, title, { size: 21, weight: "800", fill: V2INK });
    s += t(58, y + 106, l1, { size: 15, fill: MUTED });
    s += t(58, y + 130, l2, { size: 15, fill: MUTED });
    s += t(486, y + 52, "›", { size: 26, anchor: "end", fill: TEAL, weight: "700" });
  });

  s += t(270, 800, "Not yet — she stays with me", { size: 17, anchor: "middle", fill: TEALDK, weight: "700" });

  // the honest asymmetry between the two doors above. Amber, not the teal info tint — this is the
  // app's caution colour everywhere else (claim-final, late cancel), and softening it here would
  // make the one door with no safety net look like the neutral option.
  s += `<rect x="34" y="852" width="472" height="92" rx="18" fill="${WARNBG}"/>`;
  s += alertIcon(70, 898, 16, WARN2);
  s += t(100, 884, "Placing skips every check.", { size: 14.5, fill: WARN2, weight: "700" });
  s += t(100, 908, "Only place her with someone you know", { size: 13.5, fill: WARN });
  s += t(100, 930, "and would answer for.", { size: 13.5, fill: WARN });
  return s;
}

// ---------- Sagip 12: pick who to place her with ----------
// Case participants lead, and that is not a convenience: the reporter who found her and the person
// who drove her to the vet are who actually adopt a rescue. Leading with them also avoids building
// a general people-search, which would mean querying strangers by name inside a welfare app.
function rescuePlace(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Place with someone");

  s += rrect(34, 148, 472, 88, 20, WHITE, LINE);
  s += avq(80, 192, 28) + pawIcon(paws.teal.uri, 80, 192, 30);
  s += t(126, 184, "Dog · Injured", { size: 19, weight: "800", fill: V2INK });
  s += t(126, 212, "Safe with you · Aurora Blvd", { size: 14.5, fill: MUTED });

  s += t(34, 292, "From this case", { size: 20, weight: "800", fill: V2INK });
  s += t(34, 322, "The people already involved.", { size: 14.5, fill: MUTED });

  // the third row is deliberately an UNVERIFIED participant: the gate has to be visible where the
  // choice is made, not discovered after tapping Continue
  const people = [
    ["Ana R.", "Reported her · Jul 19", true, true],
    ["Miguel S.", "Offered transport", true, false],
    ["Jenny dela Cruz", "Offered vet costs", false, false],
  ];
  people.forEach(([name, meta, ver, on], i) => {
    const y = 350 + i * 104;
    s += rrect(34, y, 472, 88, 20, on ? SOFT : WHITE, on ? undefined : LINE);
    if (on) s += `<rect x="34" y="${y}" width="472" height="88" rx="20" fill="none" stroke="${TEAL}" stroke-width="2.5"/>`;
    s += avq(84, y + 44, 26, on ? WHITE : SOFT) + personIcon(84, y + 44, 30, ver ? TEALDK : "#9a988f");
    s += t(134, y + 38, name, { size: 18.5, weight: "800", fill: ver ? V2INK : "#6b6a63" });
    if (ver) s += verified(134 + name.length * 10 + 16, y + 31, 10);
    s += t(134, y + 63, ver ? `${meta} · Verified Member` : `${meta} · not verified yet`,
      { size: 13.5, fill: ver ? MUTED : WARN2, weight: ver ? "normal" : "700" });
    if (on) s += verified(470, y + 44, 15);
    else if (ver) s += `<circle cx="470" cy="${y + 44}" r="15" fill="${WHITE}" stroke="#d8d6cd" stroke-width="3"/>`;
    else s += lockIcon(470, y + 44, 16, "#b8b6ad");
  });

  s += t(34, 700, "Someone else", { size: 20, weight: "800", fill: V2INK });
  s += field(34, 724, 472, "THEIR MOBILE NUMBER", "", { prefix: "+63" });
  s += t(34, 842, "They must be a Verified Member to receive her.", { size: 14, fill: MUTED });

  s += btn(896, "Continue");
  s += t(270, 1000, "She stays with you until they accept.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip 13: placement confirm (the vouch) ----------
// Same posture as rescueClaimConfirm — names what is being given up rather than celebrating. This
// is the ONLY adoption path with no application, no home check and no interview, `adopted` is
// terminal, and adoption RETURNS are Phase 2, so there is no built-in way back.
function rescuePlaceConfirm(paws) {
  let s = rescuePlace(paws);
  s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;
  s += `<rect x="50" y="286" width="440" height="600" rx="26" fill="${WHITE}" filter="url(#v2sh)"/>`;

  s += avq(270, 360, 38, SOFT) + personIcon(270, 360, 44, TEALDK);
  s += t(270, 444, "Place her with Ana?", { size: 25, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 482, "Ana becomes her owner once she accepts.", { size: 15, anchor: "middle", fill: MUTED });

  s += `<rect x="82" y="514" width="376" height="96" rx="16" fill="${WARNBG}"/>`;
  s += alertIcon(116, 562, 15, WARN2);
  s += t(146, 546, "Every check is skipped", { size: 13.5, fill: WARN2, weight: "700" });
  s += t(146, 569, "No application, no home check, no", { size: 12.5, fill: WARN });
  s += t(146, 590, "interview. You're vouching for Ana.", { size: 12.5, fill: WARN });

  s += `<rect x="82" y="622" width="376" height="74" rx="16" fill="${SOFT}"/>`;
  s += lockIcon(116, 659, 15, TEALDK);
  s += t(146, 653, "This can't be undone", { size: 13.5, fill: TEALDK, weight: "700" });
  s += t(146, 676, "Adopted is final — returns aren't in the app.", { size: 12.5, fill: MUTED });

  s += t(270, 726, "Only place her with someone you'd answer for.", { size: 12.5, anchor: "middle", fill: "#a9adaa" });
  s += `<rect x="82" y="746" width="376" height="64" rx="32" fill="url(#v2btn)" filter="url(#v2soft)"/>`;
  s += t(270, 786, "Yes, place her with Ana", { size: 19, anchor: "middle", fill: WHITE, weight: "700" });
  s += t(270, 856, "Not now", { size: 18, anchor: "middle", fill: TEALDK, weight: "700" });
  return s;
}

// ---------- Sagip 14: placement sent, awaiting the recipient ----------
function rescuePlaceSent(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Place with someone");
  s += `<circle cx="270" cy="238" r="70" fill="${SOFT}"/>` + clockIcon(270, 238, 40, TEALDK);
  s += t(270, 366, "Waiting for Ana", { size: 30, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 406, "She's been notified. Nothing changes", { size: 18, anchor: "middle", fill: MUTED });
  s += t(270, 434, "until she accepts.", { size: 18, anchor: "middle", fill: MUTED });

  // the reassurance that matters to a rescuer: the animal has not left their care yet
  s += `<rect x="34" y="478" width="472" height="70" rx="18" fill="${SOFT}"/>`;
  s += homeHeartIcon(70, 513, 30, TEALDK);
  s += t(100, 507, "She's still with you", { size: 14.5, fill: TEALDK, weight: "700" });
  s += t(100, 531, "Her status stays Safe until the handover.", { size: 13.5, fill: MUTED });

  s += t(34, 606, "What happens next", { size: 20, weight: "800", fill: V2INK });
  s += rrect(34, 626, 472, 260, 20, WHITE, LINE);
  [[personIcon, "Ana accepts", "She becomes the owner on record."],
   [carGlyph, "You arrange the handover", "Her number is shared so you can meet."],
   [undoGlyph, "She declines, or doesn't answer", "Nothing happens — you can place or list again."]].forEach(([g, title, sub], i) => {
    const y = 668 + i * 82;
    s += g(76, y, 30, TEAL);
    s += t(120, y - 4, title, { size: 17, weight: "700", fill: NAVY });
    s += t(120, y + 22, sub, { size: 14, fill: MUTED });
  });

  s += btn(922, "Back to my rescues");
  s += t(270, 1026, "You can cancel this while it's pending.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip: the public "List for adoption" door — the listing went live ----------
// The other door off rescue-outcome (rescue-place*) hands the animal to one named person; this one
// puts her on the PUBLIC adopt feed. Simpler by design: it reuses the adoption_listing model with
// source_report_id, so from here she runs the ordinary staged adoption journey (decision 9 / §6.2).
function rescueListed(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("List for adoption");
  s += `<circle cx="270" cy="238" r="70" fill="${SOFT}"/>` + homeHeartIcon(270, 238, 56, TEALDK);
  s += t(270, 366, "She's listed!", { size: 30, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 406, "She's on the public adopt feed now —", { size: 18, anchor: "middle", fill: MUTED });
  s += t(270, 434, "adopters near you can find and inquire.", { size: 18, anchor: "middle", fill: MUTED });

  // custody + record reassurance — the rescue is now a tracked adoption record, but she hasn't left
  s += `<rect x="34" y="478" width="472" height="70" rx="18" fill="${SOFT}"/>`;
  s += homeHeartIcon(70, 513, 30, TEALDK);
  s += t(100, 507, "She stays in your care", { size: 14.5, fill: TEALDK, weight: "700" });
  s += t(100, 531, "until an adoption is final — now a tracked record.", { size: 13.5, fill: MUTED });

  s += t(34, 606, "What happens next", { size: 20, weight: "800", fill: V2INK });
  s += rrect(34, 626, 472, 260, 20, WHITE, LINE);
  [[(x, y) => mailIcon(x, y, TEAL), "Adopters inquire", "Requests land in your list to review."],
   [(x, y) => docGlyph(x, y, TEAL), "Run the steps you want", "Application, home check, interview — or skip."],
   [(x, y) => homeHeartIcon(x, y, 30, TEAL), "On adoption, she's home", "She becomes a tracked pet on their account."]].forEach(([g, title, sub], i) => {
    const y = 668 + i * 82;
    s += g(76, y);
    s += t(120, y - 4, title, { size: 17, weight: "700", fill: NAVY });
    s += t(120, y + 22, sub, { size: 14, fill: MUTED });
  });

  s += btn(922, "Back to my rescues");
  s += t(270, 1026, "Edit or unlist anytime from My listings.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip 15: the recipient's side — accept or decline ----------
// The member did NOT ask for this, so the screen opens by explaining why they're seeing it, and the
// decline is a peer of the accept rather than a buried text link: an unwanted animal accepted out
// of social pressure is the worst outcome this flow can produce.
function placeRequest(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Adoption offer");

  s += rrect(34, 148, 472, 196, 22, "#dbe6e2");
  s += pawIcon(paws.teal.uri, 270, 240, 84);

  // deliberately unnamed: a stray has no name until an owner records one, which is what "Add her
  // details" on place-accepted is for. Calling her Luna here would invent a name the claimer side
  // never shows, and would quietly imply the shelter had already made her theirs.
  s += t(34, 388, "Marikina AWG wants to", { size: 24, weight: "800", fill: V2INK });
  s += t(34, 420, "place her with you", { size: 24, weight: "800", fill: V2INK });
  s += t(34, 456, "Dog · rescued from Aurora Blvd, Jul 19.", { size: 16, fill: MUTED });
  s += t(34, 480, "You reported her.", { size: 16, fill: MUTED });

  s += rrect(34, 492, 472, 96, 20, WHITE, LINE);
  s += avq(84, 540, 30) + buildingIcon(84, 540, 32, TEAL, SOFT);
  s += t(134, 532, "Marikina AWG", { size: 19, weight: "800", fill: V2INK }) + verified(282, 525, 11);
  s += t(134, 560, "Verified Rescue · has her now", { size: 14.5, fill: MUTED });

  s += t(34, 640, "What accepting means", { size: 20, weight: "800", fill: V2INK });
  s += rrect(34, 660, 472, 216, 20, WHITE, LINE);
  [["You become her owner", "On record, from the moment you accept."],
   ["No application needed", "They've vouched for you — steps are skipped."],
   ["It's final", "Adoption returns aren't in the app yet."]].forEach(([title, sub], i) => {
    const y = 702 + i * 68;
    s += pawIcon(paws.teal.uri, 74, y - 6, 22);
    s += t(108, y, title, { size: 16.5, weight: "700", fill: NAVY });
    s += t(108, y + 22, sub, { size: 13.5, fill: MUTED });
  });

  s += btn(908, "Accept — she's mine");
  s += dbtnOutline(34, 988, 472, "No thanks", 19);
  s += t(270, 1094, "Declining is fine. She stays with Marikina AWG.", { size: 13.5, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip 16: accepted ----------
function placeAccepted(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Adoption offer");
  s += `<circle cx="270" cy="238" r="70" fill="#eaf3de"/>` + homeHeartIcon(270, 238, 66, OK);
  s += t(270, 366, "She's yours", { size: 32, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 406, "Recorded Jul 21 · placed by Marikina AWG.", { size: 17, anchor: "middle", fill: MUTED });

  s += t(34, 478, "Arrange the handover", { size: 20, weight: "800", fill: V2INK });
  s += rrect(34, 498, 472, 104, 20, WHITE, LINE);
  s += avq(84, 550, 30) + buildingIcon(84, 550, 32, TEAL, SOFT);
  s += t(134, 542, "Marikina AWG", { size: 19, weight: "800", fill: V2INK }) + verified(282, 535, 11);
  s += t(134, 570, "0917 555 0134 · Marikina City", { size: 14.5, fill: MUTED });

  const half = 229;
  s += rrect(34, 624, half, 64, 32, WHITE, LINE) + phoneIcon(120, 656, TEAL) + t(150, 664, "Call", { size: 18, fill: NAVY, weight: "700" });
  s += rrect(277, 624, half, 64, 32, WHITE, LINE) + pinIcon(330, 652, TEAL) + t(356, 664, "Directions", { size: 17, fill: NAVY, weight: "700" });

  // the record framing — this is what the skipped-checks path buys in exchange
  s += `<rect x="34" y="722" width="472" height="92" rx="18" fill="${SOFT}"/>`;
  s += docGlyph(70, 768, TEALDK);
  s += t(104, 754, "She's on your record now", { size: 14.5, fill: TEALDK, weight: "700" });
  s += t(104, 778, "Name her and she joins My pets. Marikina AWG", { size: 13.5, fill: MUTED });
  s += t(104, 800, "keeps her in their adoption history.", { size: 13.5, fill: MUTED });

  s += btn(858, "Add her details");
  s += t(270, 962, "You can do this later from My pets.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip 10: my rescues (claimer's list) ----------
// opts.tab = 1 → the Offers side. An offer with nowhere to live is an offer people forget they
// made, and a forgotten offer is worse than none: a claimer rings a number nobody meant to give.
// Segmented control rather than a second destination — same pattern as Kawang-Gawa Browse/My shifts.
function myRescues(paws, opts = {}) {
  if (opts.tab === 1) return myOffers(paws);
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("My rescues");
  s += segmented(34, 150, 472, ["Claims", "Offers"], 0);
  const sy = 216;
  s += rrect(34, sy, 472, 116, 24, WHITE, LINE);
  [["2", "Active"], ["14", "Rescued"], ["11", "Resolved"]].forEach(([n, lab], i) => {
    const cx = 34 + (i + 0.5) * (472 / 3);
    if (i) s += `<line x1="${34 + i * (472 / 3)}" y1="${sy + 28}" x2="${34 + i * (472 / 3)}" y2="${sy + 88}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += t(cx, sy + 56, n, { size: 26, anchor: "middle", weight: "700", fill: NAVY });
    s += t(cx, sy + 88, lab, { size: 17, anchor: "middle", fill: MUTED });
  });

  // active first, and each carries the NEXT action — a claimed case with no visible next step is
  // how cases go quiet
  s += t(34, 382, "Active · 2", { size: 20, weight: "800", fill: V2INK });
  [["Dog · Injured", "Aurora Blvd · claimed 8:31 AM", "Rescued", "Post update ›"],
   ["Cat · Pregnant", "Katipunan Ave · claimed Jul 19", "Claimed", "Post update ›"]].forEach(([title, meta, st, cta], i) => {
    const y = 410 + i * 116;
    s += rrect(34, y, 472, 100, 20, WHITE, LINE);
    s += avq(80, y + 40, 28) + pawIcon(paws.teal.uri, 80, y + 40, 30);
    s += t(124, y + 36, title, { size: 19, weight: "700", fill: NAVY });
    s += t(124, y + 60, meta, { size: 14.5, fill: MUTED });
    s += statusChip(486, y + 20, st);
    s += t(486, y + 84, cta, { size: 14.5, anchor: "end", fill: TEAL, weight: "700" });
  });

  s += t(34, 682, "Closed", { size: 20, weight: "800", fill: V2INK });
  [["Dog · Sick", "P. Tuazon · Jul 16", "Resolved"],
   ["Dog · Healthy", "Marcos Hwy · Jul 11", "Resolved"]].forEach(([title, meta, st], i) => {
    const y = 710 + i * 96;
    s += rrect(34, y, 472, 80, 20, WHITE, LINE);
    s += avq(80, y + 40, 26, "#eceae4") + pawIcon(paws.teal.uri, 80, y + 40, 28);
    s += t(122, y + 36, title, { size: 18, weight: "700", fill: "#9a988f" });
    s += t(122, y + 60, meta, { size: 14, fill: "#b8b6ad" });
    s += statusChip(486, y + 24, st);
  });

  s += t(270, 938, "Resolved cases can be listed for adoption.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Sagip 10b: my offers ----------
// Each open row carries a Withdraw — offers are freely reversible, which is exactly what separates
// them from a claim and what earns them the right to be low-effort.
// ⚠️ The reverse must NOT hold: a CLAIMER cannot downgrade to an offer. That would be the release
// button removed on 2026-07-21 wearing a different label. The ladder is climbable, not descendable.
//
// ⚠️ REACHED FROM BOTH My rescues AND My reports (added 2026-07-21). Offering is open to every
// signed-in account, but My rescues is a CLAIMER surface — so hanging offers off it alone stranded
// exactly the people the lower rung was built for: someone who can drive but can't claim has no
// reason to ever open "My rescues", and their own offers would be invisible to them. My reports is
// where a non-claiming user already tracks their Sagip activity, so offers belong there too.
// Same screen, same data — only the segmented control's parent changes.
function myOffers(paws, opts = {}) {
  const fromReports = !!opts.fromReports;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar(fromReports ? "My reports" : "My rescues");
  s += segmented(34, 150, 472, fromReports ? ["Reports", "Offers"] : ["Claims", "Offers"], 1);

  const sy = 216;
  s += rrect(34, sy, 472, 116, 24, WHITE, LINE);
  [["2", "Open"], ["5", "Matched"], ["3", "Expired"]].forEach(([n, lab], i) => {
    const cx = 34 + (i + 0.5) * (472 / 3);
    if (i) s += `<line x1="${34 + i * (472 / 3)}" y1="${sy + 28}" x2="${34 + i * (472 / 3)}" y2="${sy + 88}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += t(cx, sy + 56, n, { size: 26, anchor: "middle", weight: "700", fill: NAVY });
    s += t(cx, sy + 88, lab, { size: 17, anchor: "middle", fill: MUTED });
  });

  s += t(34, 382, "Open · 2", { size: 20, weight: "800", fill: V2INK });
  [["transport", "Dog · Injured", "Aurora Blvd · expires in 44 h", "Open", "Withdraw"],
   ["supplies", "Cat · Pregnant", "Katipunan Ave · expires in 9 h", "Open", "Withdraw"]].forEach(([key, title, meta, st, cta], i) => {
    const [glyph] = OFFERS[key];
    const y = 410 + i * 116;
    s += rrect(34, y, 472, 100, 20, WHITE, LINE);
    s += avq(80, y + 40, 28, SOFT) + glyph(80, y + 40, 32, TEALDK);
    s += t(124, y + 36, title, { size: 19, weight: "700", fill: NAVY });
    s += t(124, y + 60, meta, { size: 14.5, fill: MUTED });
    s += statusChip(486, y + 20, st);
    s += t(486, y + 84, cta, { size: 14.5, anchor: "end", fill: DANGER, weight: "700" });
  });

  s += t(34, 682, "Closed", { size: 20, weight: "800", fill: V2INK });
  [["vet_cost", "Dog · Sick", "P. Tuazon · Ella G. claimed it", "Matched"],
   ["supplies", "Dog · Healthy", "Marcos Hwy · no one claimed", "Expired"]].forEach(([key, title, meta, st], i) => {
    const [glyph] = OFFERS[key];
    const y = 710 + i * 96;
    s += rrect(34, y, 472, 80, 20, WHITE, LINE);
    s += avq(80, y + 40, 26, "#eceae4") + glyph(80, y + 40, 28, "#9a988f");
    s += t(122, y + 36, title, { size: 18, weight: "700", fill: "#9a988f" });
    s += t(122, y + 60, meta, { size: 14, fill: "#b8b6ad" });
    s += statusChip(486, y + 24, st);
  });

  s += t(270, 938, "Expired offers reopen if the case does.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Shelter Kawang-Gawa: manage activities ----------
function shelterVolunteer(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Kawang-Gawa");
  s += topbarPill(506, "+ New");
  s += t(34, 166, "Your volunteer activities", { size: 26, weight: "800", fill: V2INK });
  s += t(34, 200, "Posted shifts and their sign-ups.", { size: 17, fill: MUTED });
  s += t(506, 200, "Calendar ›", { size: 17, anchor: "end", fill: TEAL, weight: "700" });

  const acts = [
    ["walk", "Morning dog walk", "Sat, Jul 12 · 8–10 AM", "4 / 6 signed up", 2],
    ["feed", "Feed the rescue pack", "Sun, Jul 13 · 7–9 AM", "3 / 5 signed up", 1],
    ["event", "Adoption day helper", "Sat, Jul 19 · 1–5 PM", "6 / 8 signed up", 0],
    ["facility", "Kennel cleaning", "Sun, Jul 20 · 9–11 AM", "2 / 5 signed up", 3],
  ];
  acts.forEach(([type, title, when, signups, pending], i) => {
    const y = 246 + i * 128;
    s += rrect(34, y, 472, 112, 20, WHITE, LINE);
    s += avq(86, y + 56, 32) + typeGlyph(type, 86, y + 56, paws);
    s += t(140, y + 44, title, { size: 21, weight: "800", fill: V2INK });
    s += t(140, y + 72, when, { size: 15, fill: TEAL, weight: "600" });
    s += t(140, y + 97, signups, { size: 15, fill: MUTED });
    if (pending > 0) { const lab = pending + " pending", w = 22 + lab.length * 10; s += rrect(486 - w, y + 18, w, 34, 17, WARNBG) + t(486 - w / 2, y + 41, lab, { size: 15, anchor: "middle", fill: WARN2, weight: "700" }); }
    else s += t(486, y + 41, "All set", { size: 15, anchor: "end", fill: OK, weight: "700" });
  });
  return s;
}

// ---------- Shelter Kawang-Gawa: create a volunteer activity ----------
function shelterVolunteerCreate() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("New activity");
  s += t(34, 164, "Activity type", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 182, ["Walking", "Feeding", "Visitor"], 0);
  s += chipRow(34, 244, ["Events", "Facility", "Transport"], -1);

  s += field(34, 316, 472, "Title", "Morning dog walk");

  const dy = 438;
  s += t(34, dy, "Date &amp; time", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, dy + 16, 472, 64, 16, WHITE, LINE) + t(58, dy + 57, "Sat, Jul 12 · 8:00–10:00 AM", { size: 20, fill: NAVY, weight: "600" });
  s += calGlyph(470, dy + 48, MUTED);

  s += field(34, 560, 260, "Volunteers needed", "6");

  s += t(34, 700, "Assign walk-ready animals", { size: 20, weight: "800", fill: V2INK });
  s += t(34, 728, "For walking shifts only", { size: 14, fill: MUTED });
  s += rrect(422, 686, 84, 46, 23, TEAL) + `<circle cx="483" cy="709" r="18" fill="${WHITE}"/>`;

  s += btn(806, "Post activity");
  return s;
}

// ---------- Shelter Kawang-Gawa: approve / decline sign-ups ----------
function shelterVolunteerRequests() {
  const initials = n => n.split(" ").map(w => w[0]).join("");
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Morning dog walk");
  s += t(270, 104, "Sat, Jul 12 · 8–10 AM · 6 spots", { size: 15, anchor: "middle", fill: MUTED });

  s += t(34, 168, "Pending · 2", { size: 18, weight: "700", fill: NAVY });
  [["Ana Reyes", "requested 2h ago"], ["Jose Cruz", "requested 5h ago"]].forEach(([nm, when], i) => {
    const y = 196 + i * 152;
    s += rrect(34, y, 472, 136, 20, WHITE, LINE);
    s += avq(80, y + 50, 28) + t(80, y + 58, initials(nm), { size: 20, anchor: "middle", weight: "700", fill: TEAL });
    s += t(124, y + 46, nm, { size: 21, weight: "800", fill: V2INK });
    s += t(124, y + 74, when, { size: 15, fill: MUTED });
    s += rrect(124, y + 92, 158, 40, 20, WHITE, LINE) + t(203, y + 118, "Decline", { size: 17, anchor: "middle", fill: NAVY, weight: "700" });
    s += rrect(300, y + 92, 180, 40, 20, TEAL) + t(390, y + 118, "Approve", { size: 17, anchor: "middle", fill: WHITE, weight: "700" });
  });

  s += t(34, 528, "Confirmed · 4", { size: 18, weight: "700", fill: NAVY });
  [["Maria Santos", "Confirmed"], ["Pedro Lim", "Confirmed"]].forEach(([nm, st], i) => {
    const y = 556 + i * 88;
    s += rrect(34, y, 472, 72, 18, WHITE, LINE);
    s += avq(72, y + 36, 24) + t(72, y + 43, initials(nm), { size: 18, anchor: "middle", weight: "700", fill: TEAL });
    s += t(112, y + 44, nm, { size: 20, weight: "800", fill: V2INK });
    s += statusChip(486, y + 18, st);
  });
  return s;
}

// ---------- Shelter Kawang-Gawa: volunteer detail (contact info + approve) ----------
const phoneIcon = (cx, cy, c) => `<rect x="${cx - 8}" y="${cy - 13}" width="16" height="26" rx="3" fill="none" stroke="${c}" stroke-width="2.5"/>` + `<circle cx="${cx}" cy="${cy + 8}" r="1.8" fill="${c}"/>`;
const mailIcon = (cx, cy, c) => `<rect x="${cx - 13}" y="${cy - 9}" width="26" height="18" rx="3" fill="none" stroke="${c}" stroke-width="2.5"/>` + `<path d="M${cx - 13} ${cy - 6} l13 9 l13 -9" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
function shelterVolunteerDetail(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Volunteer");
  // header
  s += `<circle cx="86" cy="194" r="44" fill="${SOFT}"/>` + t(86, 204, "AR", { size: 32, anchor: "middle", weight: "700", fill: TEAL });
  s += t(150, 180, "Ana Reyes", { size: 26, weight: "800", fill: V2INK });
  s += rrect(322, 160, 104, 32, 16, OKBG) + t(374, 181, "Reliable", { size: 14, anchor: "middle", fill: OK, weight: "700" });
  s += t(150, 214, "Pet owner · 8 shifts · 0 no-shows", { size: 16, fill: MUTED });

  // which shift
  s += rrect(34, 268, 472, 88, 20, WHITE, LINE);
  s += avq(82, 312, 28) + pawIcon(paws.teal.uri, 82, 312, 30);
  s += t(128, 302, "Morning dog walk", { size: 20, weight: "800", fill: V2INK });
  s += t(128, 330, "Sat, Jul 12 · 8–10 AM", { size: 15, fill: TEAL, weight: "600" });
  s += statusChip(486, 288, "Pending");

  // contact card
  s += t(34, 398, "Contact", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 416, 472, 216, 20, WHITE, LINE);
  const rows = [[phoneIcon, "+63 917 123 4567"], [mailIcon, "ana.reyes@email.com"], [pinIcon, "12 Mabini St, Brgy. Malanday, Marikina"]];
  rows.forEach(([icon, val], i) => {
    const cy = 470 + i * 62;
    s += icon(66, cy, TEAL) + t(108, cy + 7, val, { size: 18, fill: NAVY, weight: "600" });
    if (i < rows.length - 1) s += `<line x1="34" y1="${cy + 31}" x2="506" y2="${cy + 31}" stroke="${LINE}" stroke-width="1.5"/>`;
  });
  s += t(34, 672, "Shared so you can coordinate the shift.", { size: 14, fill: MUTED });

  // actions
  s += rrect(34, 760, 220, 68, 34, WHITE, LINE) + t(144, 803, "Decline", { size: 21, anchor: "middle", fill: NAVY, weight: "700" });
  s += rrect(286, 760, 220, 68, 34, TEAL) + t(396, 803, "Approve", { size: 21, anchor: "middle", fill: WHITE, weight: "700" });
  return s;
}

// ---------- Shelter Kawang-Gawa: volunteer calendar ----------
function shelterVolunteerCalendar(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Volunteer schedule");
  // amber = has pending requests, green = all set
  s += miniCal(34, 138, 9, { 12: WARN, 13: WARN, 19: OK, 20: WARN });
  s += `<circle cx="280" cy="454" r="5" fill="${WARN}"/>` + t(294, 459, "Needs review", { size: 14, fill: MUTED });
  s += `<circle cx="420" cy="454" r="5" fill="${OK}"/>` + t(434, 459, "All set", { size: 14, fill: MUTED });

  s += t(34, 500, "Upcoming shifts", { size: 22, weight: "800", fill: V2INK });
  const acts = [
    ["walk", "Morning dog walk", "Sat, Jul 12 · 8–10 AM", "4 / 6 signed up", 2],
    ["feed", "Feed the rescue pack", "Sun, Jul 13 · 7–9 AM", "3 / 5 signed up", 1],
    ["event", "Adoption day helper", "Sat, Jul 19 · 1–5 PM", "6 / 8 signed up", 0],
    ["facility", "Kennel cleaning", "Sun, Jul 20 · 9–11 AM", "2 / 5 signed up", 3],
  ];
  acts.forEach(([type, title, when, signups, pending], i) => {
    const y = 526 + i * 104;
    s += rrect(34, y, 472, 92, 20, WHITE, LINE);
    s += avq(80, y + 46, 28) + typeGlyph(type, 80, y + 46, paws);
    s += t(126, y + 38, title, { size: 20, weight: "800", fill: V2INK });
    s += t(126, y + 66, when + " · " + signups, { size: 14, fill: MUTED });
    if (pending > 0) { const lab = pending + " pending", w = 22 + lab.length * 10; s += rrect(486 - w, y + 14, w, 32, 16, WARNBG) + t(486 - w / 2, y + 35, lab, { size: 14, anchor: "middle", fill: WARN2, weight: "700" }); }
    else s += t(486, y + 35, "All set", { size: 14, anchor: "end", fill: OK, weight: "700" });
  });
  return s;
}

// ---------- Pet owner: cancel a volunteer shift (free until cutoff) ----------
// opts.late → past the 12h cutoff: the cancel is still allowed, but it goes on the record.
function kawangGawaCancel(paws, opts = {}) {
  const late = !!opts.late;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Cancel shift");
  const cy = 158;
  s += rrect(34, cy, 472, 120, 20, WHITE, LINE);
  s += avq(86, cy + 60, 30) + pawIcon(paws.teal.uri, 86, cy + 60, 32);
  s += t(134, cy + 44, "Morning dog walk", { size: 21, weight: "800", fill: V2INK });
  s += t(134, cy + 74, "PAWS Manila", { size: 15, fill: MUTED });
  s += t(134, cy + 98, "Sat, Jul 12 · 8–10 AM", { size: 15, fill: TEAL, weight: "600" });
  s += statusChip(486, cy + 20, "Confirmed");

  s += t(34, 344, "Cancel this shift?", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 384, "Your slot reopens for another volunteer", { size: 17, fill: MUTED });
  s += t(34, 410, "and PAWS Manila is notified.", { size: 17, fill: MUTED });

  s += rrect(34, 452, 472, 92, 16, late ? WARNBG : "#eaf4f2");
  s += clockIcon(74, 498, 20, late ? WARN2 : TEAL);
  s += t(112, 488, late ? "Cancel window closed · Fri, Jul 11 · 8 PM" : "Free to cancel until Fri, Jul 11 · 8 PM",
    { size: 16, weight: "700", fill: late ? WARN2 : NAVY });
  s += t(112, 516, late ? "This late cancel is noted on your record." : "Later cancels are noted on your record.",
    { size: 14, fill: MUTED });

  // reason (shared with the shelter so it knows why)
  s += t(34, 592, "Reason (optional)", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 608, 472, 88, 16, WHITE, LINE) + t(58, 646, "e.g. Something came up — sorry!", { size: 17, fill: "#9a988f" });
  s += t(34, 716, "The shelter sees this so it can plan.", { size: 14, fill: MUTED });

  s += dbtn(34, 772, 472, "Cancel my shift");
  s += t(270, 890, "Keep my shift", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Kawang-Gawa — cancel confirmation (modal over the cancel screen) ----------
// Cancelling is irreversible (the slot reopens to others immediately), so the danger
// action gets a final confirm. Copy reflects the 12h cutoff: this one is inside the
// free window, so it says so — a late cancel would warn that it lands on the record.
function kawangGawaCancelConfirm(paws, opts = {}) {
  const late = !!opts.late;
  let s = kawangGawaCancel(paws, opts);
  s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;

  s += rrect(50, 360, 440, 450, 26, WHITE);
  s += `<circle cx="270" cy="432" r="38" fill="${DANGERBG}"/>` + alertIcon(270, 432, 20, DANGER);
  s += t(270, 512, "Cancel this shift?", { size: 26, anchor: "middle", weight: "700", fill: NAVY });
  s += t(270, 552, "Your slot reopens for another", { size: 17, anchor: "middle", fill: MUTED });
  s += t(270, 578, "volunteer and PAWS Manila is notified.", { size: 17, anchor: "middle", fill: MUTED });

  s += rrect(82, 606, 376, 56, 14, late ? WARNBG : "#eaf4f2");
  s += clockIcon(114, 634, 15, late ? WARN2 : TEAL);
  s += t(142, 640, late ? "Late cancel — noted on your record" : "Free cancel — nothing on your record",
    { size: 15, fill: late ? WARN2 : NAVY, weight: "600" });

  s += dbtn(82, 686, 376, "Yes, cancel shift", 20);
  s += t(270, 786, "Keep my shift", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Shelter: mark attendance / no-show after a shift ----------
function shelterVolunteerAttendance() {
  const initials = n => n.split(" ").map(w => w[0]).join("");
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Attendance");
  s += t(270, 104, "Morning dog walk · Sat, Jul 12", { size: 15, anchor: "middle", fill: MUTED });
  s += t(34, 168, "Mark who showed up", { size: 22, weight: "800", fill: V2INK });

  const vols = [["Ana Reyes", "attended"], ["Jose Cruz", "attended"], ["Maria Santos", "noshow"], ["Pedro Lim", ""]];
  vols.forEach(([nm, mark], i) => {
    const y = 204 + i * 100;
    s += rrect(34, y, 472, 88, 20, WHITE, LINE);
    s += avq(76, y + 44, 26) + t(76, y + 51, initials(nm), { size: 18, anchor: "middle", weight: "700", fill: TEAL });
    s += t(118, y + 52, nm, { size: 20, weight: "800", fill: V2INK });
    const att = mark === "attended", no = mark === "noshow";
    s += rrect(286, y + 24, 100, 40, 20, att ? OK : WHITE, att ? OK : LINE) + t(336, y + 50, "Attended", { size: 15, anchor: "middle", fill: att ? WHITE : NAVY, weight: "700" });
    s += rrect(394, y + 24, 100, 40, 20, no ? DANGER : WHITE, no ? DANGER : LINE) + t(444, y + 50, "No-show", { size: 15, anchor: "middle", fill: no ? WHITE : NAVY, weight: "700" });
  });
  s += btn(688, "Save attendance");
  return s;
}

// ---------- Shelter: cancel an activity (notifies signed-up volunteers) ----------
function shelterVolunteerCancel(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Cancel activity");
  const cy = 158;
  s += rrect(34, cy, 472, 120, 20, WHITE, LINE);
  s += avq(86, cy + 60, 30) + pawIcon(paws.teal.uri, 86, cy + 60, 32);
  s += t(134, cy + 44, "Morning dog walk", { size: 21, weight: "800", fill: V2INK });
  s += t(134, cy + 74, "Sat, Jul 12 · 8–10 AM", { size: 15, fill: TEAL, weight: "600" });
  s += t(134, cy + 98, "4 volunteers signed up", { size: 15, fill: MUTED });

  s += t(34, 344, "Cancel this activity?", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 384, "All 4 signed-up volunteers will be", { size: 17, fill: MUTED });
  s += t(34, 410, "notified and their slots released.", { size: 17, fill: MUTED });

  s += t(34, 462, "Reason (optional)", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 478, 472, 96, 16, WHITE, LINE) + t(58, 516, "e.g. Not enough animals available today", { size: 17, fill: "#9a988f" });
  s += t(34, 618, "Volunteers get a push notification.", { size: 14, fill: MUTED });

  s += dbtn(34, 762, 472, "Cancel activity");
  s += t(270, 880, "Keep activity", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Shelter: cancel-activity confirmation (modal over shelter-volunteer-cancel) ----------
// Heavier than the volunteer's own cancel: this cascades — every volunteer_signup on the shift
// flips to cancelled, slots release, and a notification fans out. So the confirm names the
// blast radius (who, how many) instead of a generic "are you sure".
function shelterVolunteerCancelConfirm(paws) {
  let s = shelterVolunteerCancel(paws);
  s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;

  s += rrect(50, 340, 440, 470, 26, WHITE);
  s += `<circle cx="270" cy="412" r="38" fill="${DANGERBG}"/>` + alertIcon(270, 412, 20, DANGER);
  s += t(270, 492, "Cancel this activity?", { size: 26, anchor: "middle", weight: "700", fill: NAVY });
  s += t(270, 532, "The shift closes and every signed-up", { size: 17, anchor: "middle", fill: MUTED });
  s += t(270, 558, "volunteer loses their slot.", { size: 17, anchor: "middle", fill: MUTED });

  // name the blast radius — the volunteers who get the push
  s += rrect(82, 590, 376, 68, 14, WARNBG);
  ["AR", "JC", "MS", "PL"].forEach((ini, i) => {
    const cx = 118 + i * 32;
    s += `<circle cx="${cx}" cy="624" r="17" fill="${WHITE}" stroke="${WARNBG}" stroke-width="3"/>`;
    s += t(cx, 630, ini, { size: 13, anchor: "middle", weight: "700", fill: WARN2 });
  });
  s += t(262, 630, "4 volunteers notified", { size: 15, fill: WARN2, weight: "700" });

  s += dbtn(82, 686, 376, "Yes, cancel activity", 20);
  s += t(270, 786, "Keep activity", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Pet owner: notifications (the "notified" surface — reached from the bell) ----------
// v2 notifications — card list with New/Earlier sections and a gradient "badge earned" hero.
// kind: "owner" (Verified Member) | "shelter" (tier-2 Verified Shelter) | "rescue" (tier-1
// Verified Rescue). One builder for all three so the verification moment renders identically —
// only the badge mark, name, and consequences differ per identity.
function notifV2Screen(kind, paws) {
  const owner = kind === "owner";
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Notifications");
  s += t(506, 144, "Mark all read", { size: 15, anchor: "end", fill: TEAL, weight: "700" });

  // hero — the verification outcome (notification fires on verification_request → approved)
  const heroTitle = owner ? "You’re a Verified Member!" : kind === "rescue" ? "You’re a Verified Rescue!" : "You’re a Verified Shelter!";
  const heroLines = owner
    ? ["Your ID checked out — you can now", "adopt and use rescue tools."]
    : ["Documents approved — your listings are", "public and donations are on."];
  const heroLink = owner ? "See your badge ›" : "View your public profile ›";
  let y = 164;
  s += `<rect x="34" y="${y}" width="472" height="132" rx="24" fill="url(#v2hero)" filter="url(#v2sh)"/>`;
  s += `<circle cx="88" cy="${y + 66}" r="30" fill="${WHITE}"/>`;
  if (owner) s += personIcon(88, y + 66, 34, TEAL);
  else if (kind === "rescue") s += homeHeartIcon(88, y + 66, 34, TEAL);
  else s += buildingIcon(88, y + 66, 30, TEAL, WHITE);
  s += `<circle cx="110" cy="${y + 88}" r="11" fill="${WHITE}"/>` + verified(110, y + 88, 9);
  s += t(134, y + 44, heroTitle, { size: 19, weight: "800", fill: WHITE });
  heroLines.forEach((ln, i) => s += t(134, y + 70 + i * 21, ln, { size: 13, fill: "#cfe6e2" }));
  s += t(134, y + 118, heroLink, { size: 13.5, weight: "800", fill: WHITE });
  s += t(482, y + 40, "2m", { size: 13, anchor: "end", fill: "#a9cfca" });
  y += 156;

  const items = owner ? [
    ["heart", "Adoption update", ["PAWS Manila moved your Milo inquiry to", "Interview — step 4 of 6."], "1h", true],
    ["heart", "Adoption update", ["Marikina AWG finished Luna’s background", "check — a home check is next."], "3h", true],
    ["alert", "Shift cancelled", ["“Morning dog walk” (Sat, Jul 12) was", "cancelled. Your slot was released."], "1d", false],
    ["check", "Shift confirmed", ["“Feed the rescue pack” (Sun, Jul 13) —", "added to your calendar."], "1d", false],
    ["paw", "New pet near you", ["Milo, an Aspin, is 2 km away."], "2d", false],
  ] : [
    ["heart", "New adoption inquiry", ["Ana Reyes (Verified Member) wants to", "adopt Milo. Tap to review."], "40m", true],
    ["person", "New volunteer sign-up", ["Jose Cruz requested “Morning dog walk”", "(Sat, Jul 12). Approve or decline."], "2h", true],
    ["alert", "Inquiry withdrawn", ["Pedro Lim withdrew their inquiry for Luna."], "1d", false],
  ];
  const imap = { heart: [SOFT, TEAL], paw: [SOFT, TEAL], check: ["#EAF3DE", "#27500A"], alert: [WARNBG, WARN2], person: ["#ECEBF6", "#5b53a6"] };
  let hadNew = false, hadEarlier = false;
  items.forEach(([ic, title, lines, when, unread]) => {
    if (unread && !hadNew) { s += t(34, y + 12, "New", { size: 16, weight: "800", fill: V2INK }); y += 30; hadNew = true; }
    if (!unread && !hadEarlier) { y += 6; s += t(34, y + 12, "Earlier", { size: 16, weight: "800", fill: V2INK }); y += 30; hadEarlier = true; }
    const h = 56 + lines.length * 22 + 12;
    s += v2card(34, y, 472, h, 22);
    const [ibg, ifg] = imap[ic];
    s += v2squircle(70, y + h / 2, 44, ibg, 15);
    if (ic === "heart") s += heartIcon(70, y + h / 2, 26, ifg);
    else if (ic === "paw") s += pawmark(70, y + h / 2, 12, ifg);
    else if (ic === "check") s += `<polyline points="62,${y + h / 2} 68,${y + h / 2 + 6} 79,${y + h / 2 - 7}" fill="none" stroke="${ifg}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (ic === "person") s += personIcon(70, y + h / 2 + 1, 24, ifg);
    else s += alertIcon(70, y + h / 2, 13, ifg);
    s += t(104, y + 36, title, { size: 17, weight: "800", fill: V2INK });
    s += t(468, y + 36, when, { size: 13, anchor: "end", fill: "#b8b6ad" });
    if (unread) s += `<circle cx="487" cy="${y + 31}" r="4.5" fill="${TEAL}"/>`;
    lines.forEach((ln, i) => s += t(104, y + 60 + i * 22, ln, { size: 13.5, fill: MUTED }));
    y += h + 12;
  });
  return s;
}
function notifications(paws) { return notifV2Screen("owner", paws); }

// ---------- Shelter: activity detail hub (ties requests / attendance / edit / cancel) ----------
function shelterVolunteerActivity(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Activity");
  s += `<circle cx="84" cy="192" r="44" fill="${SOFT}"/>` + pawIcon(paws.teal.uri, 84, 192, 44);
  s += t(150, 178, "Morning dog walk", { size: 26, weight: "800", fill: V2INK });
  s += t(150, 212, "Sat, Jul 12 · 8:00–10:00 AM", { size: 16, fill: TEAL, weight: "600" });
  s += t(150, 240, "PAWS Manila · Marikina", { size: 15, fill: MUTED });

  // sign-up summary
  s += rrect(34, 290, 472, 84, 20, WHITE, LINE);
  s += t(58, 328, "4 of 6 spots filled", { size: 19, weight: "700", fill: NAVY });
  s += t(58, 354, "2 awaiting your review", { size: 14, fill: MUTED });
  s += rrect(392, 312, 92, 40, 20, WARNBG) + t(438, 338, "2 pending", { size: 15, anchor: "middle", fill: WARN2, weight: "700" });

  // manage list
  s += t(34, 418, "MANAGE", { size: 15, weight: "700", fill: MUTED, ls: 1.5 });
  s += rrect(34, 436, 472, 210, 20, WHITE, LINE);
  const item = (gy, label, badge, last) => {
    let r = t(58, gy + 44, label, { size: 22, weight: "600", fill: NAVY });
    if (badge) { const w = 22 + badge.length * 10; r += rrect(432 - w, gy + 24, w, 36, 18, WARNBG) + t(432 - w / 2, gy + 47, badge, { size: 14, anchor: "middle", fill: WARN2, weight: "700" }); }
    r += t(476, gy + 46, "›", { size: 32, anchor: "end", fill: "#b8b6ad" });
    if (!last) r += `<line x1="58" y1="${gy + 70}" x2="482" y2="${gy + 70}" stroke="${LINE}" stroke-width="1.5"/>`;
    return r;
  };
  s += item(436, "View requests", "2 new");
  s += item(506, "Mark attendance");
  s += item(576, "Edit activity", null, true);

  s += dbtnOutline(34, 692, 472, "Cancel activity");
  return s;
}

// ---------- Pet owner: pet detail (adoptable animal) ----------
function petDetail(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + statusbar(false);
  s += t(34, 76, "‹", { size: 42, weight: "700", fill: NAVY });

  // hero photo (placeholder) + overlays
  s += rrect(34, 104, 472, 276, 24, "#dbe6e2");
  s += pawIcon(paws.teal.uri, 270, 230, 92);
  s += rrect(56, 128, 130, 38, 19, WHITE) + `<circle cx="82" cy="147" r="5" fill="${OK}"/>` + t(98, 153, "Available", { size: 15, fill: OK, weight: "700" });
  s += `<circle cx="474" cy="142" r="23" fill="${WHITE}"/>` + heartIcon(474, 143, 24, "#c9d3cf");

  // name + meta
  s += t(34, 438, "Milo", { size: 34, weight: "800", fill: V2INK });
  s += t(34, 474, "Aspin (Asong Pinoy) · 2 yrs · Male · Medium", { size: 17, fill: MUTED });

  // shelter card
  s += rrect(34, 506, 472, 88, 20, WHITE, LINE);
  s += avq(80, 550, 28) + buildingIcon(80, 550, 30, TEAL, SOFT);
  s += t(126, 542, "PAWS Manila", { size: 20, weight: "800", fill: V2INK }) + verified(272, 535, 12);
  s += t(126, 570, "Marikina City · 2 km away", { size: 15, fill: MUTED });
  s += t(482, 556, "›", { size: 32, anchor: "end", fill: "#b8b6ad" });

  // about
  s += t(34, 636, "About Milo", { size: 22, weight: "800", fill: V2INK });
  ["Friendly, house-trained aspin who loves morning walks", "and belly rubs. Great with kids and other dogs.", "Looking for a calm forever home."].forEach((ln, i) => {
    s += t(34, 672 + i * 26, ln, { size: 16, fill: MUTED });
  });

  // health
  s += t(34, 776, "Health", { size: 22, weight: "800", fill: V2INK });
  let hx = 34;
  ["Vaccinated", "Neutered", "Dewormed"].forEach(h => {
    const w = 56 + h.length * 10;
    s += rrect(hx, 800, w, 40, 20, OKBG);
    s += `<polyline points="${hx + 18},820 ${hx + 24},826 ${hx + 34},814" fill="none" stroke="${OK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += t(hx + 44, 826, h, { size: 15, fill: OK, weight: "700" });
    hx += w + 12;
  });

  // fee + CTA
  s += `<line x1="34" y1="884" x2="506" y2="884" stroke="${LINE}" stroke-width="1.5"/>`;
  s += t(34, 916, "Adoption fee", { size: 16, fill: MUTED });
  s += t(34, 946, "Free", { size: 24, weight: "800", fill: V2INK });
  s += t(506, 938, "Home visit required", { size: 14, anchor: "end", fill: MUTED });
  // "Start adoption" → adoptInquiry for Verified Members; non-verified owners route to adoptRescuerGate first
  s += btn(984, "Start adoption");
  s += t(270, 1064, "Have a question? Call the shelter", { size: 16, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Adopt (browse tab) ----------
// Browse & filter adoptable pets → pet detail → Start adoption. Bottom-nav "Adopt" tab (index 1).
function adopt(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + statusbar(false);
  s += t(34, 92, "Adopt a friend", { size: 28, weight: "800", fill: V2INK });
  s += bellIcon(496, 88);
  s += segmented(34, 120, 472, ["Browse", "My inquiries"], 0);

  // search bar
  s += rrect(34, 190, 472, 60, 30, WHITE, LINE);
  s += magnifyIcon(74, 220, MUTED);
  s += t(100, 228, "Search breed, shelter…", { size: 18, fill: "#9a988f" });

  // filter chips
  s += chipRow(34, 274, ["All", "Dogs", "Cats", "Near me"], 0);

  // 2-col pet grid
  const cardW = 228, gap = 16, cardH = 224;
  const cols = [34, 34 + cardW + gap];
  const pets = [
    ["Milo", "Aspin · 1y · M", "PAWS Manila · 2km"],
    ["Luna", "Puspin · 2y · F", "Marikina AWG · 4km"],
    ["Bruno", "Aspin · 3y · M", "Pasig Pound · 5km"],
    ["Chika", "Puspin · 4mo · F", "PAWS Manila · 2km"],
    ["Rocky", "Aspin · 2y · M", "QC Shelter · 6km"],
    ["Mimi", "Puspin · 1y · F", "Marikina AWG · 4km"],
  ];
  pets.forEach(([nm, meta, org], i) => {
    const x = cols[i % 2], y = 336 + Math.floor(i / 2) * (cardH + 12);
    s += rrect(x, y, cardW, cardH, 20, WHITE, LINE);
    // photo placeholder
    s += rrect(x + 10, y + 10, cardW - 20, 118, 16, "#dbe6e2") + pawIcon(paws.teal.uri, x + cardW / 2, y + 69, 50);
    // heart (save)
    s += `<circle cx="${x + cardW - 30}" cy="${y + 32}" r="17" fill="${WHITE}"/>` + heartIcon(x + cardW - 30, y + 33, 20, "#c9d3cf");
    s += t(x + 16, y + 162, nm, { size: 20, weight: "800", fill: V2INK });
    s += t(x + 16, y + 186, meta, { size: 14, fill: MUTED });
    s += t(x + 16, y + 208, org, { size: 12.5, fill: "#b8b6ad" });
  });

  s += bottomnav(1);
  return s;
}

// ---------- Adopt — My inquiries (track submitted adoption requests) ----------
function adoptInquiries(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + statusbar(false);
  s += t(34, 92, "Adopt a friend", { size: 28, weight: "800", fill: V2INK });
  s += bellIcon(496, 88);
  s += segmented(34, 120, 472, ["Browse", "My inquiries"], 1);

  // active inquiries show a stage progress bar; finished ones show an outcome chip
  const rows = [
    ["Milo", "Aspin · 2y", "PAWS Manila", { step: 4, stage: "Interview" }],
    ["Luna", "Puspin · 2y", "Marikina AWG", { step: 2, stage: "Application" }],
    ["Bruno", "Aspin · 3y", "Pasig Pound", { outcome: "Adopted" }],
    ["Rocky", "Aspin · 2y", "QC Shelter", { outcome: "Declined" }],
  ];
  rows.forEach(([nm, meta, org, prog], i) => {
    const y = 206 + i * 118;
    s += rrect(34, y, 472, 106, 20, WHITE, LINE);
    s += avq(84, y + 46, 30) + pawIcon(paws.teal.uri, 84, y + 46, 32);
    s += t(132, y + 40, nm, { size: 21, weight: "800", fill: V2INK });
    s += t(132, y + 66, meta + " · " + org, { size: 15, fill: MUTED });
    if (prog.outcome) {
      s += statusChip(486, y + 34, prog.outcome);
    } else {
      // mini progress bar (step of 6)
      const bw = 250;
      s += rrect(132, y + 84, bw, 8, 4, "#e7e5dd");
      s += rrect(132, y + 84, Math.round(bw * prog.step / 6), 8, 4, TEAL);
      s += t(486, y + 40, "Step " + prog.step + " of 6", { size: 14, anchor: "end", fill: MUTED, weight: "700" });
      // the Application stage is the owner's own questionnaire → jump straight into it
      const isApp = prog.stage === "Application";
      s += t(486, y + 68, isApp ? "Complete application ›" : prog.stage,
        { size: isApp ? 13.5 : 15, anchor: "end", fill: TEAL, weight: "700" });
    }
  });

  s += t(270, 736, "Tap an inquiry to see all 6 steps and", { size: 16, anchor: "middle", fill: MUTED });
  s += t(270, 762, "contact the shelter.", { size: 16, anchor: "middle", fill: MUTED });

  s += bottomnav(1);
  return s;
}

// ---------- Adopt — inquiry detail (status timeline + contact) ----------
// opts.state: "active" (default, mid-journey) | "declined" (shelter stopped it) | "adopted" (completed)
// Renders the 6-stage adoption tracker (adoption_stage). Each stage: done | in_progress | not_started | declined.
function adoptInquiryDetail(paws, opts = {}) {
  const state = opts.state || "active";
  const declined = state === "declined", adopted = state === "adopted", withdrawn = state === "withdrawn";
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Your inquiry");

  // pet + shelter header + outcome chip (only when terminal)
  s += `<circle cx="82" cy="176" r="40" fill="${SOFT}"/>` + pawIcon(paws.teal.uri, 82, 176, 44);
  s += t(146, 166, "Milo", { size: 26, weight: "800", fill: V2INK });
  s += t(146, 200, "PAWS Manila · Marikina City", { size: 16, fill: MUTED });
  if (declined) s += statusChip(486, 150, "Declined");
  else if (adopted) s += statusChip(486, 150, "Adopted");
  else if (withdrawn) s += statusChip(486, 150, "Withdrawn");
  else s += t(486, 176, "Step 4 of 6", { size: 16, anchor: "end", fill: TEAL, weight: "700" });

  // 6-stage tracker — withdrawn reuses the ACTIVE progress (same array as the default branch
  // below): withdrawing doesn't retroactively fail a stage the way a shelter decline does, it just
  // freezes wherever the owner stopped. Only the contextual band below differs.
  const stages = adopted ? [
    ["Inquiry sent", "Jul 12", "done"],
    ["Application &amp; background check", "Jul 13", "done"],
    ["Home check", "Jul 15", "done"],
    ["Interview", "Jul 17", "done"],
    ["Vet clearance", "Jul 19", "done"],
    ["Finalization", "Jul 20", "done"],
  ] : declined ? [
    ["Inquiry sent", "Jul 12", "done"],
    ["Application &amp; background check", "Jul 13", "done"],
    ["Home check", "Jul 16", "declined"],
    ["Interview", "", "not_started"],
    ["Vet clearance", "", "not_started"],
    ["Finalization", "", "not_started"],
  ] : [
    ["Inquiry sent", "Jul 12", "done"],
    ["Application &amp; background check", "Jul 13", "done"],
    ["Home check", "Skipped", "skipped"],
    ["Interview", "In progress", "in_progress"],
    ["Vet clearance", "", "not_started"],
    ["Finalization", "", "not_started"],
  ];
  s += rrect(34, 240, 472, 452, 20, WHITE, LINE);
  const bx = 72, sy = 286, sp = 72;
  // once withdrawn, the stage that was "in progress" at the time is FROZEN, not still live —
  // rendering it in active teal next to a grey "Withdrawn" chip would read as contradictory.
  stages.forEach(([label, meta, st], i) => {
    const cy = sy + i * sp;
    const frozen = withdrawn && st === "in_progress";
    if (i < stages.length - 1) {
      const col = (st === "done" || st === "skipped") ? TEAL : LINE;
      s += `<line x1="${bx}" y1="${cy + 16}" x2="${bx}" y2="${cy + sp - 16}" stroke="${col}" stroke-width="3"/>`;
    }
    if (st === "done") {
      s += `<circle cx="${bx}" cy="${cy}" r="15" fill="${TEAL}"/>` +
        `<polyline points="${bx - 7},${cy} ${bx - 2},${cy + 6} ${bx + 8},${cy - 6}" fill="none" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (frozen) {
      s += `<circle cx="${bx}" cy="${cy}" r="14" fill="#ece9e1"/>` +
        `<line x1="${bx - 6}" y1="${cy}" x2="${bx + 6}" y2="${cy}" stroke="#6b6a63" stroke-width="3" stroke-linecap="round"/>`;
    } else if (st === "in_progress") {
      s += `<circle cx="${bx}" cy="${cy}" r="15" fill="${WHITE}" stroke="${TEAL}" stroke-width="4"/>` + `<circle cx="${bx}" cy="${cy}" r="6" fill="${TEAL}"/>`;
    } else if (st === "declined") {
      s += `<circle cx="${bx}" cy="${cy}" r="15" fill="#F3E3E1"/>` +
        `<line x1="${bx - 6}" y1="${cy - 6}" x2="${bx + 6}" y2="${cy + 6}" stroke="#8A3B3B" stroke-width="3" stroke-linecap="round"/>` +
        `<line x1="${bx + 6}" y1="${cy - 6}" x2="${bx - 6}" y2="${cy + 6}" stroke="#8A3B3B" stroke-width="3" stroke-linecap="round"/>`;
    } else if (st === "skipped") {
      s += `<circle cx="${bx}" cy="${cy}" r="14" fill="#ece9e1"/>` +
        `<line x1="${bx - 6}" y1="${cy}" x2="${bx + 6}" y2="${cy}" stroke="#6b6a63" stroke-width="3" stroke-linecap="round"/>`;
    } else {
      s += `<circle cx="${bx}" cy="${cy}" r="13" fill="${WHITE}" stroke="${LINE}" stroke-width="3"/>`;
    }
    const active = (st === "done" || st === "in_progress" || st === "declined") && !frozen;
    const lblFill = st === "declined" ? "#8A3B3B" : (active ? NAVY : "#9a988f");
    s += t(108, cy + 6, label, { size: 17, weight: active ? "700" : "600", fill: lblFill });
    const metaText = frozen ? "Stopped here" : meta;
    if (metaText) {
      const mFill = frozen ? "#6b6a63" : st === "in_progress" ? TEAL : (st === "declined" ? "#8A3B3B" : MUTED);
      s += t(484, cy + 6, metaText, { size: 14, anchor: "end", fill: mFill, weight: (st === "in_progress" || frozen) ? "700" : "normal" });
    }
    // the application stage is the owner's own questionnaire → link into screen-adopt-application
    // (mirrors the shelter's "View application ›" on their inquiry detail)
    if (label.startsWith("Application") && (st === "done" || st === "in_progress")) {
      s += t(108, cy + 30, st === "in_progress" ? "Complete your application ›" : "View your application ›",
        { size: 13, fill: TEAL, weight: "700" });
    }
  });

  // contextual band by state
  if (declined) {
    s += t(34, 726, "Shelter's note", { size: 17, weight: "700", fill: NAVY });
    s += rrect(34, 740, 472, 84, 16, "#FBF2F0", "#F0DAD6");
    ["“The yard isn't fully fenced yet for a large, active dog.", "We'd love to reconsider once that's sorted.”"].forEach((ln, i) => {
      s += t(56, 772 + i * 26, ln, { size: 14, fill: "#7a4a45" });
    });
  } else if (adopted) {
    s += rrect(34, 720, 472, 84, 16, "#EAF3DE");
    s += `<circle cx="80" cy="762" r="22" fill="#27500A"/>` + `<polyline points="70,762 78,770 92,754" fill="none" stroke="${WHITE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += t(116, 754, "Milo is officially yours!", { size: 18, weight: "700", fill: "#27500A" });
    s += t(116, 782, "Welcome to the family.", { size: 14, fill: "#3d5a1e" });
  } else if (withdrawn) {
    // neutral grey, not the declined screen's pink "rejected" tone — this was the owner's own
    // call, not the shelter's, so it shouldn't read like a setback.
    s += rrect(34, 720, 472, 84, 16, "#eceae4");
    s += `<circle cx="80" cy="762" r="22" fill="${WHITE}"/>` + `<line x1="70" y1="762" x2="90" y2="762" stroke="#6b6a63" stroke-width="4" stroke-linecap="round"/>`;
    s += t(116, 754, "You withdrew this inquiry", { size: 18, weight: "700", fill: "#4a4943" });
    s += t(116, 782, "You can start a new one for Milo anytime.", { size: 14, fill: "#6b6a63" });
  } else {
    s += rrect(34, 720, 472, 84, 16, SOFT);
    s += t(58, 754, "Up next: your interview", { size: 18, weight: "700", fill: TEALDK });
    s += t(58, 782, "PAWS Manila will set a virtual or in-person time.", { size: 14, fill: MUTED });
  }

  // contact actions (in-app chat is Phase 2 → phone / Facebook)
  const half = 229;
  s += rrect(34, 832, half, 64, 32, WHITE, LINE) + phoneIcon(120, 864, TEAL) + t(150, 872, "Call", { size: 18, fill: NAVY, weight: "700" });
  s += rrect(277, 832, half, 64, 32, WHITE, LINE) + t(391, 872, "Message on FB", { size: 18, anchor: "middle", fill: NAVY, weight: "700" });

  // footer action
  const footer = (declined || withdrawn) ? ["Browse more pets", TEAL] : adopted ? ["Share your adoption story", TEAL] : ["Withdraw inquiry", "#B23B3B"];
  s += t(270, 946, footer[0], { size: 17, anchor: "middle", fill: footer[1], weight: "700" });
  return s;
}

// ---------- Adopt — withdraw inquiry confirmation (modal over the inquiry detail) ----------
// The "Withdraw inquiry" footer link on the active inquiry had no destination — same gap as the
// donation pledge cancel had before its confirm modal was built, and this deserves the same
// treatment: dbtn/danger, not the neutral teal used for e.g. shelterNeedReceivedConfirm, because
// unlike a food pledge this ends a process the SHELTER has been actively reviewing (background
// check, possibly a home visit already done), and per inquiry_status it's a terminal outcome —
// reconsidering means starting an entirely new inquiry, not resuming this one. That's why the
// caption below is honest about that cost rather than reusing the pledge-cancel's breezy
// "no penalty" reassurance, which would read as tone-deaf here.
function adoptInquiryWithdrawConfirm(paws) {
  let s = adoptInquiryDetail(paws);
  s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;
  // taller card (706 vs the original 474) to fit the reason field + a dedicated repercussions
  // box — re-centered on the canvas (y=232 vs 326) rather than just growing downward, so it
  // doesn't crowd the bottom edge.
  s += `<rect x="50" y="232" width="440" height="706" rx="26" fill="${WHITE}" filter="url(#v2sh)"/>`;
  s += `<circle cx="270" cy="306" r="38" fill="${DANGERBG}"/>` + alertIcon(270, 306, 20, DANGER);
  s += t(270, 388, "Withdraw this inquiry?", { size: 25, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 426, "You're on Step 4 of 6 (Interview) with PAWS Manila.", { size: 15, anchor: "middle", fill: MUTED });

  // what happens automatically (neutral/informational — teal, same as the pledge-cancel modal)
  s += `<rect x="82" y="458" width="376" height="70" rx="16" fill="${SOFT}"/>`;
  s += pinIcon(114, 489, TEALDK);
  s += t(142, 484, "Milo's listing reopens to other adopters,", { size: 13.5, fill: TEALDK, weight: "600" });
  s += t(142, 507, "and PAWS Manila is notified.", { size: 13.5, fill: MUTED });

  // REQUIRED note to the shelter — not "(optional)": a withdrawal this late in the process
  // (step 4 of 6) leaves PAWS Manila with an unexplained gap in their queue, so the reason is
  // mandatory rather than a nice-to-have. Red asterisk is the only required-field marker in the
  // app so far, but it's the clearest way to say "this one isn't skippable" without a paragraph.
  s += t(82, 560, "Reason", { size: 15.5, weight: "700", fill: NAVY });
  s += t(150, 560, "*", { size: 17, weight: "700", fill: DANGER });
  s += rrect(82, 574, 376, 88, 16, WHITE, LINE);
  s += t(102, 610, "Let PAWS Manila know why —", { size: 14.5, fill: "#9a988f" });
  s += t(102, 634, "e.g. found another pet, timing doesn't work.", { size: 14.5, fill: "#9a988f" });

  // the repercussion that matters here is to the OWNER'S ACCOUNT, not this one inquiry —
  // repeated withdrawals are a pattern (holding a slot other adopters could've used, repeatedly),
  // so they're tracked and flagged for admin review after 3 in a row, same threshold the
  // volunteer no-show rule already uses. Kept SOFT and explicit that the badge is untouched —
  // withdrawing is honest, communicative behavior (the alternative is silently ghosting the
  // shelter), so auto-revoking Verified Member over it would punish exactly the behavior this
  // flow exists to encourage. Escalating beyond a flag, if it comes to that, is an admin call.
  s += `<rect x="82" y="680" width="376" height="72" rx="16" fill="${WARNBG}"/>`;
  s += alertIcon(114, 716, 15, WARN2);
  s += t(142, 710, "Withdrawing 3 times in a row flags your", { size: 13.5, fill: WARN2, weight: "600" });
  s += t(142, 733, "account for review — badge stays safe.", { size: 13.5, fill: WARN });

  s += t(270, 782, "Can't be undone — start a new inquiry to reconsider.", { size: 12.5, anchor: "middle", fill: "#a9adaa" });
  s += dbtn(82, 808, 376, "Yes, withdraw inquiry", 20);
  s += t(270, 912, "Keep my inquiry", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Adopt — rescuer-required gate (non-rescuer taps "Start adoption") ----------
// opts.rescue → the same gate hit by tapping "Claim this case" without the badge. One function,
// because it IS one gate: the Verified Member badge unlocks adopting and claiming together, so
// duplicating it would let the two drift into implying two different checks.
// opts.rescue → claiming a case. A foster variant existed briefly (2026-07-21) and was removed when
// fostering was un-gated: EVERY offer type is now open, so claiming is once again the only stray
// action needing the badge, and the exclusivity rationale below covers it on its own.
function adoptRescuerGate(paws, opts = {}) {
  const rescue = !!opts.rescue;
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar(rescue ? "Claim this case" : "Adopt Milo");

  // what they were trying to do — the pet, or the stray they wanted to help
  s += rrect(34, 148, 472, 88, 20, WHITE, LINE);
  s += avq(80, 192, 28) + pawIcon(paws.teal.uri, 80, 192, 30);
  s += t(126, 184, rescue ? "Dog · Injured" : "Milo", { size: 20, weight: "800", fill: V2INK });
  s += t(126, 212, rescue ? "Aurora Blvd · 1.2 km away" : "PAWS Manila · Marikina City", { size: 15, fill: MUTED });

  // badge hero (person + lock)
  s += `<circle cx="270" cy="322" r="58" fill="#eaf4f2"/>` + personIcon(270, 316, 64, TEAL);
  s += `<circle cx="312" cy="356" r="20" fill="${TEAL}" stroke="${BG}" stroke-width="4"/>` + lockIcon(312, 356, 16, WHITE);

  s += t(270, 428, rescue ? "Get verified to claim" : "Get verified to adopt", { size: 26, anchor: "middle", weight: "700", fill: NAVY });
  (rescue
    // "anyone can help, verified can claim" (DP §6.1) — so the copy is careful not to read as
    // "you may not help". Reporting, going to look and every offer type are open to everyone; only
    // the exclusive lock on a case needs the badge. "or chip in" is kept from the brief foster-gate
    // pass: it now enumerates the open actions accurately, which the original two-verb line didn't
    // once offers existed.
    ? ["Anyone can report, go help, or chip in.", "Claiming locks a case to one person, so", "Kupkop asks for the badge first."]
    : ["To adopt, Kupkop asks you to earn the", "Verified Member badge first — so shelters", "know who they're placing pets with."]
  ).forEach((ln, i) => {
    s += t(270, 466 + i * 28, ln, { size: 16, anchor: "middle", fill: MUTED });
  });

  // what the check needs (mirrors rescuer verification)
  const check = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="13" fill="${TEAL}"/>` + `<polyline points="${cx - 6},${cy} ${cx - 1},${cy + 5} ${cx + 7},${cy - 5}" fill="none" stroke="${WHITE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += rrect(34, 566, 472, 128, 20, "#eaf4f2");
  s += t(58, 606, "Quick, one-time check", { size: 18, weight: "700", fill: TEAL });
  s += check(72, 640) + t(102, 646, "A valid government ID", { size: 16, fill: NAVY });
  s += check(72, 674) + t(102, 680, "One link to your social page", { size: 16, fill: NAVY });

  s += btn(736, "Get verified");
  s += t(270, 838, "Not now", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Shelter — adoption inquiries inbox (Requests tab) ----------
const initials = n => n.split(" ").map(w => w[0]).join("");
function shelterAdoptionInquiries(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + statusbar(false);
  s += t(34, 92, "Adoption requests", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 124, "5 inquiries across your listings", { size: 18, fill: MUTED });
  s += bellIcon(496, 88);
  // → shelter-adoption-history. This list only ever shows OPEN work (needs review / in progress),
  // so a completed adoption disappears from it — the history is the only way back to that record.
  // Filled gradient pill (same treatment as topbarPill, positioned for this header row — this is
  // a root tab screen with no topbar, so topbarPill's hardcoded y doesn't apply), left of the
  // bell: a text link here under-read as navigation to a whole surface.
  {
    const hw = 34 + "History ›".length * 9.5;
    s += `<rect x="${458 - hw}" y="66" width="${hw}" height="44" rx="22" fill="url(#v2btn)" filter="url(#v2soft)"/>`;
    s += t(458 - hw / 2, 95, "History ›", { size: 16.5, anchor: "middle", fill: WHITE, weight: "700" });
  }

  // needs review (brand-new, no stage started)
  s += t(34, 176, "Needs review · 2", { size: 18, weight: "700", fill: NAVY });
  [["Ana Reyes", "Milo", "2h ago"], ["Jose Cruz", "Luna", "5h ago"]].forEach(([nm, pet, when], i) => {
    const y = 202 + i * 96;
    s += rrect(34, y, 472, 84, 20, WHITE, LINE);
    s += avq(80, y + 42, 28) + t(80, y + 50, initials(nm), { size: 20, anchor: "middle", weight: "700", fill: TEAL });
    s += t(124, y + 38, nm, { size: 20, weight: "800", fill: V2INK });
    s += t(124, y + 64, "wants to adopt " + pet + " · " + when, { size: 15, fill: MUTED });
    s += statusChip(486, y + 16, "New");
    s += t(486, y + 68, "Review ›", { size: 15, anchor: "end", fill: TEAL, weight: "700" });
  });

  // in progress (stage tracker running)
  s += t(34, 424, "In progress · 3", { size: 18, weight: "700", fill: NAVY });
  [["Maria Santos", "Bruno", 4, "Interview"], ["Pedro Lim", "Chika", 3, "Home check"], ["Liza Tan", "Rocky", 5, "Vet clearance"]].forEach(([nm, pet, step, stage], i) => {
    const y = 450 + i * 96;
    s += rrect(34, y, 472, 84, 20, WHITE, LINE);
    s += avq(80, y + 42, 28) + t(80, y + 50, initials(nm), { size: 20, anchor: "middle", weight: "700", fill: TEAL });
    s += t(124, y + 38, nm, { size: 20, weight: "800", fill: V2INK });
    s += t(124, y + 64, "adopting " + pet, { size: 15, fill: MUTED });
    s += t(486, y + 34, "Step " + step + " of 6", { size: 14, anchor: "end", fill: MUTED, weight: "700" });
    s += t(486, y + 62, stage, { size: 15, anchor: "end", fill: TEAL, weight: "600" });
  });

  s += t(270, 776, "Tap a request to review the applicant", { size: 15, anchor: "middle", fill: MUTED });
  s += t(270, 800, "and move it through the stages.", { size: 15, anchor: "middle", fill: MUTED });

  s += shelterNav(3);
  return s;
}

// ---------- Shelter — adoption inquiry detail (applicant + advance/decline stages) ----------
function shelterAdoptionInquiryDetail(paws) {
  const fbIcon = (cx, cy, c) => rrect(cx - 12, cy - 12, 24, 24, 6, c) + t(cx, cy + 8, "f", { size: 18, anchor: "middle", fill: WHITE, weight: "700" });
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Adoption inquiry");

  // applicant header — a Verified Member (adoption requires the Verified Member badge)
  s += `<circle cx="86" cy="190" r="44" fill="${SOFT}"/>` + t(86, 200, "AR", { size: 32, anchor: "middle", weight: "700", fill: TEAL });
  s += t(150, 176, "Ana Reyes", { size: 26, weight: "800", fill: V2INK });
  s += rrect(300, 156, 176, 34, 17, "#E4EEF0") + verified(322, 173, 10) + t(342, 178, "Verified Member", { size: 13, fill: TEALDK, weight: "700" });
  s += t(150, 208, "Pet owner · 2 pets · Quezon City", { size: 16, fill: MUTED });
  s += t(150, 234, "Member since Jun 2025", { size: 14, fill: "#9a988f" });

  // which pet + current stage
  s += rrect(34, 250, 472, 82, 20, WHITE, LINE);
  s += avq(80, 291, 28) + pawIcon(paws.teal.uri, 80, 291, 30);
  s += t(124, 283, "Milo", { size: 20, weight: "800", fill: V2INK });
  s += t(124, 311, "Aspin · 2y · Male", { size: 15, fill: MUTED });
  s += t(486, 283, "Step 4 of 6", { size: 14, anchor: "end", fill: MUTED, weight: "700" });
  s += t(486, 311, "Interview", { size: 15, anchor: "end", fill: TEAL, weight: "600" });

  // horizontal 6-stage progress (done ✓ / current ◉ / upcoming ○)
  const states = ["done", "done", "done", "current", "future", "future"];
  const x0 = 66, x1 = 474, gap = (x1 - x0) / 5, yy = 384;
  states.forEach((st, i) => {
    const cx = x0 + i * gap;
    if (i < states.length - 1) s += `<line x1="${cx + 12}" y1="${yy}" x2="${cx + gap - 12}" y2="${yy}" stroke="${st === "done" ? TEAL : LINE}" stroke-width="3"/>`;
    if (st === "done") s += `<circle cx="${cx}" cy="${yy}" r="12" fill="${TEAL}"/>` + `<polyline points="${cx - 5},${yy} ${cx - 1},${yy + 4} ${cx + 6},${yy - 4}" fill="none" stroke="${WHITE}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (st === "current") s += `<circle cx="${cx}" cy="${yy}" r="12" fill="${WHITE}" stroke="${TEAL}" stroke-width="4"/>` + `<circle cx="${cx}" cy="${yy}" r="4.5" fill="${TEAL}"/>`;
    else s += `<circle cx="${cx}" cy="${yy}" r="10" fill="${WHITE}" stroke="${LINE}" stroke-width="3"/>`;
  });

  // applicant contact (shared per adopter consent)
  s += t(34, 452, "Applicant contact", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 470, 472, 186, 20, WHITE, LINE);
  const rows = [[phoneIcon, "+63 917 123 4567"], [fbIcon, "facebook.com/ana.reyes"], [pinIcon, "12 Mabini St, Marikina"]];
  rows.forEach(([icon, val], i) => {
    const cy = 518 + i * 54;
    s += icon(66, cy, TEAL) + t(104, cy + 7, val, { size: 17, fill: NAVY, weight: "600" });
    if (i < rows.length - 1) s += `<line x1="34" y1="${cy + 27}" x2="506" y2="${cy + 27}" stroke="${LINE}" stroke-width="1.5"/>`;
  });
  s += t(34, 690, "Shared with your shelter per the adopter's consent.", { size: 14, fill: MUTED });
  s += t(506, 690, "View application ›", { size: 15, anchor: "end", fill: TEAL, weight: "700" });

  // stage actions
  s += t(34, 748, "Move this inquiry forward", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 768, 290, 68, 34, TEAL) + t(179, 811, "Mark interview done", { size: 19, anchor: "middle", fill: WHITE, weight: "700" });
  s += rrect(340, 768, 166, 68, 34, WHITE, LINE) + t(423, 811, "Manage stages", { size: 18, anchor: "middle", fill: NAVY, weight: "700" });
  s += t(270, 892, "Decline inquiry", { size: 17, anchor: "middle", fill: "#B23B3B", weight: "700" });
  return s;
}

// ---------- Shelter — manage stages (flexible: any order, or skip) ----------
function shelterAdoptionStages(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Manage stages");

  // context: pet + adopter
  s += rrect(34, 150, 472, 84, 20, WHITE, LINE);
  s += avq(80, 192, 28) + pawIcon(paws.teal.uri, 80, 192, 30);
  s += t(124, 184, "Milo", { size: 20, weight: "800", fill: V2INK });
  s += t(124, 212, "Adopter: Ana Reyes", { size: 15, fill: MUTED });

  s += t(34, 276, "Complete stages in any order, or skip", { size: 15, fill: MUTED });
  s += t(34, 300, "ones that don't apply.", { size: 15, fill: MUTED });

  // pill helper (right-aligned, ends at xr)
  const pill = (label, bg, fg, xr, cy) => {
    const w = 28 + label.length * 9;
    return rrect(xr - w, cy - 18, w, 36, 18, bg) + t(xr - w / 2, cy + 6, label, { size: 15, anchor: "middle", fill: fg, weight: "700" });
  };
  const rows = [
    ["Inquiry sent", "", "done"],
    ["Application &amp; background check", "", "done"],
    ["Home check", "Accepted home photos", "skipped"],
    ["Interview", "", "in_progress"],
    ["Vet clearance", "", "todo"],
    ["Finalization", "", "todo"],
  ];
  rows.forEach(([label, sub, st], i) => {
    const y = 330 + i * 84, cy = y + 40;
    s += rrect(34, y, 472, 72, 16, WHITE, LINE);
    // state icon
    const ix = 66;
    if (st === "done") s += `<circle cx="${ix}" cy="${cy}" r="14" fill="${TEAL}"/>` + `<polyline points="${ix - 6},${cy} ${ix - 1},${cy + 5} ${ix + 7},${cy - 5}" fill="none" stroke="${WHITE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (st === "in_progress") s += `<circle cx="${ix}" cy="${cy}" r="14" fill="${WHITE}" stroke="${TEAL}" stroke-width="4"/>` + `<circle cx="${ix}" cy="${cy}" r="5" fill="${TEAL}"/>`;
    else if (st === "skipped") s += `<circle cx="${ix}" cy="${cy}" r="14" fill="#ece9e1"/>` + `<line x1="${ix - 6}" y1="${cy}" x2="${ix + 6}" y2="${cy}" stroke="#6b6a63" stroke-width="3" stroke-linecap="round"/>`;
    else s += `<circle cx="${ix}" cy="${cy}" r="12" fill="${WHITE}" stroke="${LINE}" stroke-width="3"/>`;
    // label (+ optional sub)
    const strong = st === "done" || st === "in_progress";
    s += t(100, sub ? cy - 8 : cy + 6, label, { size: 17, weight: strong ? "700" : "600", fill: st === "skipped" ? MUTED : NAVY });
    if (sub) s += t(100, cy + 16, sub, { size: 13, fill: MUTED });
    // state pill + chevron (tappable to change)
    const map = { done: ["Done", OKBG, OK], in_progress: ["In progress", SOFT, TEAL], skipped: ["Skipped", "#ece9e1", "#6b6a63"], todo: ["To do", "#f0efe9", MUTED] };
    const [plab, pbg, pfg] = map[st];
    s += pill(plab, pbg, pfg, 476, cy);
    s += t(496, cy + 7, "›", { size: 26, anchor: "end", fill: "#b8b6ad" });
  });

  s += t(270, 876, "Tap a stage to mark it done, in progress, or skip.", { size: 14, anchor: "middle", fill: MUTED });
  return s;
}

// ---------- Shelter — decline an inquiry (reason → adoption_inquiry.notes, shown to adopter) ----------
function shelterAdoptionDecline(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Decline inquiry");

  // applicant + pet summary
  s += rrect(34, 158, 472, 110, 20, WHITE, LINE);
  s += avq(84, 213, 30) + t(84, 221, "AR", { size: 20, anchor: "middle", weight: "700", fill: TEAL });
  s += t(132, 203, "Ana Reyes", { size: 21, weight: "800", fill: V2INK });
  s += t(132, 231, "Adopting Milo · step 4 of 6", { size: 15, fill: MUTED });

  s += t(34, 336, "Decline this inquiry?", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 376, "Ana will be notified. Milo returns to", { size: 17, fill: MUTED });
  s += t(34, 402, "available so others can apply.", { size: 17, fill: MUTED });

  s += t(34, 458, "Reason (Ana will see this)", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 474, 472, 120, 16, WHITE, LINE);
  ["e.g. The home isn't a fit for a large, active dog", "right now — we'd welcome a future application."].forEach((ln, i) => {
    s += t(58, 514 + i * 30, ln, { size: 16, fill: "#9a988f" });
  });
  s += t(34, 632, "Saved as the shelter's note on the inquiry.", { size: 14, fill: MUTED });

  s += dbtn(34, 760, 472, "Decline inquiry");
  s += t(270, 878, "Keep reviewing", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Shelter — finalize adoption (sets inquiry adopted + listing adopted → ownership loop) ----------
function shelterAdoptionComplete(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Complete adoption");

  // pet + adopter summary
  s += rrect(34, 158, 472, 110, 20, WHITE, LINE);
  s += avq(84, 213, 30) + pawIcon(paws.teal.uri, 84, 213, 32);
  s += t(132, 203, "Milo", { size: 21, weight: "800", fill: V2INK });
  s += t(132, 231, "Adopter: Ana Reyes · step 6 of 6", { size: 15, fill: MUTED });

  s += t(34, 332, "Finalize Milo's adoption?", { size: 27, weight: "800", fill: V2INK });

  // finalization checklist (the last stage's sub-items — arranged off-app)
  s += rrect(34, 372, 472, 170, 20, WHITE, LINE);
  const check = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="16" fill="${TEAL}"/>` + `<polyline points="${cx - 7},${cy} ${cx - 1},${cy + 6} ${cx + 8},${cy - 6}" fill="none" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  ["Adoption contract signed", "Adoption fee settled (off-app)", "Milo handed over to Ana"].forEach((lab, i) => {
    const cy = 418 + i * 50;
    s += check(70, cy) + t(104, cy + 6, lab, { size: 18, fill: NAVY, weight: "600" });
  });

  s += t(34, 596, "What this does", { size: 18, weight: "700", fill: NAVY });
  ["Marks Milo Adopted and closes the listing", "Adds Milo to Ana's pets (ownership transfer)", "Ana earns an Adopter badge and is notified"].forEach((ln, i) => {
    const y = 632 + i * 34;
    s += `<circle cx="42" cy="${y - 5}" r="4" fill="${TEAL}"/>` + t(60, y, ln, { size: 16, fill: MUTED });
  });

  s += btn(766, "Complete adoption");
  s += t(270, 878, "Not yet", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Shelter — adoption history (completed adoptions + who adopted) ----------
// shelterAdoptionComplete() finalizes an adoption, but nothing downstream ever showed the
// resulting record: the inquiry leaves "Adoption requests" (which only lists needs-review and
// in-progress) and the pet leaves the active listings, so a completed adoption vanished from the
// shelter's view entirely. This is the permanent record — and the only place a shelter can look
// up who took which animal, which matters for follow-ups and for RA 8485 rehoming traceability.
//
// Deliberately adopter-forward: the ADOPTER is the headline of each row, not the pet, because the
// question this screen answers is "who has our animals" — the pet is already known from the
// listing side. Tapping a row opens that adopter's contact (already captured on the inquiry per
// their consent), so a shelter can reach a past adopter without digging through closed inquiries.
function shelterAdoptionHistory(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Adoption history");

  // summary — counts only, consistent with the app's no-invented-metrics stance elsewhere.
  // NB: "Returned" (an adopted animal coming back) is deliberately ABSENT — returns are out of
  // MVP scope, deferred to Sprint 2. When they land, they rejoin this card as a third stat, the
  // chip row gains a Returned filter, and rows get the muted returned treatment (see git history
  // of this function for the built version that was pulled out).
  const sy = 150;
  s += rrect(34, sy, 472, 116, 24, WHITE, LINE);
  [["34", "Adopted"], ["6", "This year"]].forEach(([n, lab], i) => {
    const cx = 34 + (i + 0.5) * (472 / 2);
    if (i) s += `<line x1="${34 + i * (472 / 2)}" y1="${sy + 28}" x2="${34 + i * (472 / 2)}" y2="${sy + 88}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += t(cx, sy + 56, n, { size: 26, anchor: "middle", weight: "700", fill: NAVY });
    s += t(cx, sy + 88, lab, { size: 17, anchor: "middle", fill: MUTED });
  });

  s += chipRow(34, 288, ["All", "This year"], 0);

  s += t(34, 386, "Completed adoptions", { size: 22, weight: "800", fill: V2INK });
  s += t(506, 386, "34 total", { size: 15, anchor: "end", fill: MUTED });

  const rows = [
    ["Ana Reyes", "Milo", "Aspin · 2y", "Jul 20, 2026"],
    ["Maria Santos", "Bruno", "Aspin · 3y", "Jul 8, 2026"],
    ["Jose Cruz", "Luna", "Puspin · 1y", "Jun 24, 2026"],
    ["Liza Tan", "Rocky", "Aspin · 2y", "Jun 11, 2026"],
  ];
  rows.forEach(([adopter, pet, meta, when], i) => {
    const y = 414 + i * 116;
    s += rrect(34, y, 472, 100, 20, WHITE, LINE);
    s += avq(80, y + 40, 28) + t(80, y + 47, initials(adopter), { size: 19, anchor: "middle", weight: "700", fill: TEAL });
    s += t(124, y + 36, adopter, { size: 19, weight: "800", fill: V2INK });
    // NOT statusChip("Adopted") — that maps to the muted grey used on the LISTING side, where
    // "Adopted" means "no longer available." Here a completed adoption is the shelter's best
    // outcome, so it gets the success green.
    const w = 118;
    s += rrect(486 - w, y + 18, w, 36, 18, OKBG) + `<circle cx="${486 - w + 16}" cy="${y + 36}" r="4" fill="${OK}"/>` +
      t(486 - w + 28, y + 41.5, "Adopted", { size: 14, fill: OK, weight: "700" });
    // the pet line sits under the adopter — secondary, but it's what the row is *about*
    s += avq(136, y + 72, 16) + pawIcon(paws.teal.uri, 136, y + 72, 18);
    s += t(160, y + 78, pet + " · " + meta, { size: 15, fill: MUTED });
    s += t(486, y + 78, when, { size: 14, anchor: "end", fill: "#b8b6ad" });
  });

  s += t(270, 908, "Tap an adoption to see the adopter's contact details.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  s += shelterNav(1);
  return s;
}

// ---------- Shelter — a single past adoption (the adopter record) ----------
// The detail behind a history row. Reuses the applicant-contact card from the live inquiry detail
// — same data, same consent basis — but framed as a closed record: no stage actions, no decline.
// The one action offered is contacting the adopter, which is the actual reason a shelter opens a
// months-old adoption (follow-up visit, vaccination reminder, or a return).
function shelterAdoptionHistoryDetail(paws) {
  const fbIcon = (cx, cy, c) => rrect(cx - 12, cy - 12, 24, 24, 6, c) + t(cx, cy + 8, "f", { size: 18, anchor: "middle", fill: WHITE, weight: "700" });
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Adoption record");

  // outcome banner first — this is a closed record, so lead with the outcome, not the process
  s += rrect(34, 150, 472, 84, 20, "#EAF3DE");
  s += `<circle cx="80" cy="192" r="22" fill="#27500A"/>` + `<polyline points="70,192 78,200 92,184" fill="none" stroke="${WHITE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(116, 184, "Adopted Jul 20, 2026", { size: 18, weight: "700", fill: "#27500A" });
  s += t(116, 212, "Completed by you · 6 of 6 stages", { size: 14, fill: "#3d5a1e" });

  // the pet — no "Listing ›" affordance on purpose: once adopted, the listing is a closed record
  // and there is nothing left to edit on it (ownership has transferred to the adopter). Linking
  // to the editable listing form here would invite changing a pet that is no longer the shelter's.
  s += rrect(34, 254, 472, 84, 20, WHITE, LINE);
  s += avq(80, 296, 28) + pawIcon(paws.teal.uri, 80, 296, 30);
  s += t(124, 288, "Milo", { size: 20, weight: "800", fill: V2INK });
  s += t(124, 316, "Aspin · 2y · Male", { size: 15, fill: MUTED });

  // the adopter
  s += t(34, 388, "Adopter", { size: 18, weight: "700", fill: NAVY });
  s += `<circle cx="86" cy="452" r="40" fill="${SOFT}"/>` + t(86, 462, "AR", { size: 30, anchor: "middle", weight: "700", fill: TEAL });
  s += t(146, 440, "Ana Reyes", { size: 24, weight: "800", fill: V2INK });
  s += rrect(146, 456, 176, 32, 16, "#E4EEF0") + verified(167, 472, 9) + t(186, 477, "Verified Member", { size: 12.5, fill: TEALDK, weight: "700" });
  s += t(146, 508, "Quezon City · member since Jun 2025", { size: 14, fill: MUTED });

  s += rrect(34, 540, 472, 186, 20, WHITE, LINE);
  const rows = [[phoneIcon, "+63 917 123 4567"], [fbIcon, "facebook.com/ana.reyes"], [pinIcon, "12 Mabini St, Marikina"]];
  rows.forEach(([icon, val], i) => {
    const cy = 588 + i * 54;
    s += icon(66, cy, TEAL) + t(104, cy + 7, val, { size: 17, fill: NAVY, weight: "600" });
    if (i < rows.length - 1) s += `<line x1="34" y1="${cy + 27}" x2="506" y2="${cy + 27}" stroke="${LINE}" stroke-width="1.5"/>`;
  });
  s += t(34, 758, "Kept on the record per the adopter's consent.", { size: 14, fill: MUTED });

  const half = 229;
  s += rrect(34, 792, half, 64, 32, WHITE, LINE) + phoneIcon(120, 824, TEAL) + t(150, 832, "Call", { size: 18, fill: NAVY, weight: "700" });
  s += rrect(277, 792, half, 64, 32, WHITE, LINE) + t(391, 832, "Message on FB", { size: 18, anchor: "middle", fill: NAVY, weight: "700" });

  s += t(270, 906, "View application ›", { size: 16, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Adopt — Start-adoption inquiry (message + contact-sharing consent) ----------
function adoptInquiry(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Start adoption");

  // pet + shelter header
  s += `<circle cx="82" cy="168" r="40" fill="${SOFT}"/>` + pawIcon(paws.teal.uri, 82, 168, 44);
  s += t(146, 158, "Milo", { size: 26, weight: "800", fill: V2INK });
  s += t(146, 192, "PAWS Manila · Marikina City", { size: 16, fill: MUTED });

  // message to the shelter
  s += t(34, 262, "Your message to the shelter", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 278, 472, 148, 16, WHITE, LINE);
  ["Tell PAWS Manila about your home, yard,", "other pets, and why you'd love to adopt", "Milo. This helps them review your inquiry."].forEach((ln, i) => {
    s += t(56, 320 + i * 30, ln, { size: 16, fill: "#9a988f" });
  });

  // what the shelter receives
  s += t(34, 470, "Shared with PAWS Manila", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 486, 472, 116, 20, WHITE, LINE);
  s += avq(84, 544, 30) + pawIcon(paws.teal.uri, 84, 544, 32);
  s += t(134, 530, "Ana Reyes", { size: 20, weight: "800", fill: V2INK });
  s += t(134, 558, "0917 123 4567 · Quezon City", { size: 15, fill: MUTED });
  s += t(134, 582, "facebook.com/ana.reyes", { size: 15, fill: TEAL, weight: "600" });

  // consent + CTA
  const checkbox = y => rrect(34, y, 30, 30, 8, TEAL) + `<polyline points="41,${y + 15} 47,${y + 22} 58,${y + 8}" fill="none" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += checkbox(636);
  s += t(78, 650, "I agree to share my name &amp; contact details", { size: 16, fill: NAVY });
  s += t(78, 674, "with PAWS Manila to arrange this adoption.", { size: 16, fill: NAVY });
  s += t(78, 706, "Home visits are arranged with the shelter off-app.", { size: 13, fill: MUTED });

  s += btn(770, "Send inquiry");
  s += t(270, 872, "You'll be notified when the shelter responds.", { size: 16, anchor: "middle", fill: MUTED });
  return s;
}

// ---------- Adopt — inquiry sent (status + what happens next) ----------
function adoptInquirySent(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Adoption");

  // success check
  s += `<circle cx="270" cy="214" r="70" fill="${OKBG}"/>`;
  s += `<polyline points="238,214 262,240 306,190" fill="none" stroke="${OK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(270, 338, "Inquiry sent!", { size: 30, anchor: "middle", weight: "700", fill: NAVY });
  s += t(270, 378, "PAWS Manila has your inquiry for Milo.", { size: 18, anchor: "middle", fill: MUTED });

  // inquiry summary card
  const cy = 434;
  s += rrect(34, cy, 472, 116, 20, WHITE, LINE);
  s += avq(86, cy + 58, 30) + pawIcon(paws.teal.uri, 86, cy + 58, 32);
  s += t(134, cy + 44, "Milo", { size: 21, weight: "800", fill: V2INK });
  s += t(134, cy + 72, "Aspin · 2y · Male", { size: 15, fill: MUTED });
  s += t(134, cy + 98, "PAWS Manila · Marikina", { size: 15, fill: TEAL, weight: "600" });
  s += statusChip(486, cy + 18, "Submitted");

  // what happens next
  s += t(34, 606, "What happens next", { size: 20, weight: "800", fill: V2INK });
  const steps3 = ["Application &amp; background check", "Home check, then a short interview", "Vet clearance, then contract &amp; release"];
  steps3.forEach((ln, i) => {
    const y = 648 + i * 52;
    s += `<circle cx="52" cy="${y}" r="17" fill="${SOFT}"/>` + t(52, y + 6, String(i + 1), { size: 17, anchor: "middle", weight: "700", fill: TEAL });
    s += t(84, y + 6, ln, { size: 17, fill: NAVY });
  });

  // primary next step → the application questionnaire (stage 2 of the journey)
  s += btn(800, "Start your application");

  // contact actions (in-app chat is Phase 2 → phone / Facebook)
  const half = 229;
  s += rrect(34, 890, half, 64, 32, WHITE, LINE) + phoneIcon(120, 922, TEAL) + t(150, 930, "Call", { size: 18, fill: NAVY, weight: "700" });
  s += rrect(277, 890, half, 64, 32, WHITE, LINE) + t(391, 930, "Message on FB", { size: 18, anchor: "middle", fill: NAVY, weight: "700" });

  s += t(270, 1008, "We'll ping the bell when they reply.", { size: 16, anchor: "middle", fill: MUTED });
  return s;
}

// frameless board (for non-device artifacts like the badge sheet)
// ---------- Shelter: notifications (dashboard bell) ----------
// v2 redesign 2026-07-15: shares notifV2Screen; the old "Shelter verified" row became the hero.
function shelterNotifications(paws) { return notifV2Screen("shelter", paws); }

// ---------- Kawang-Gawa: day-of check-in / check-out (records check_in_at / check_out_at) ----------
function kawangGawaCheckin(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Today's shift");
  const cy = 150;
  s += rrect(34, cy, 472, 120, 20, WHITE, LINE);
  s += avq(86, cy + 60, 30) + pawIcon(paws.teal.uri, 86, cy + 60, 32);
  s += t(134, cy + 44, "Morning dog walk", { size: 21, weight: "800", fill: V2INK });
  s += t(134, cy + 74, "PAWS Manila · Marikina City", { size: 15, fill: MUTED });
  s += t(134, cy + 98, "Sat, Jul 12 · 8–10 AM", { size: 15, fill: TEAL, weight: "600" });

  // happening-now banner
  s += rrect(34, 300, 472, 60, 16, OKBG) + `<circle cx="66" cy="330" r="6" fill="${OK}"/>` + t(88, 336, "Happening now — check out when you're done.", { size: 15, fill: OK, weight: "600" });

  // attendance steps
  s += t(34, 416, "Attendance", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 434, 472, 132, 20, WHITE, LINE);
  // checked in (done)
  s += `<circle cx="76" cy="482" r="15" fill="${TEAL}"/>` + `<polyline points="69,482 74,488 84,476" fill="none" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<line x1="76" y1="498" x2="76" y2="520" stroke="${TEAL}" stroke-width="3"/>`;
  s += t(108, 488, "Checked in", { size: 18, weight: "700", fill: NAVY }) + t(482, 488, "8:02 AM", { size: 15, anchor: "end", fill: MUTED });
  // check out (pending)
  s += `<circle cx="76" cy="534" r="13" fill="${WHITE}" stroke="${LINE}" stroke-width="3"/>`;
  s += t(108, 540, "Check out", { size: 18, weight: "600", fill: "#9a988f" }) + t(482, 540, "Pending", { size: 15, anchor: "end", fill: MUTED });

  s += btn(636, "Check out");
  s += t(270, 736, "The shelter marks your attendance from this.", { size: 15, anchor: "middle", fill: MUTED });
  return s;
}

// ---------- Shelter: edit a posted activity ----------
function shelterVolunteerEdit(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Edit activity");
  s += t(34, 164, "Activity type", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 182, ["Walking", "Feeding", "Visitor"], 0);

  s += field(34, 256, 472, "Title", "Morning dog walk");

  const dy = 378;
  s += t(34, dy, "Date &amp; time", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, dy + 16, 472, 64, 16, WHITE, LINE) + t(58, dy + 57, "Sat, Jul 12 · 8:00–10:00 AM", { size: 20, fill: NAVY, weight: "600" });
  s += calGlyph(470, dy + 48, MUTED);

  s += field(34, 500, 260, "Volunteers needed", "6");
  s += t(310, 516, "4 signed up", { size: 15, fill: MUTED });
  s += t(310, 540, "so far", { size: 15, fill: MUTED });

  s += t(34, 620, "Changes notify signed-up volunteers.", { size: 14, fill: MUTED });
  s += btn(700, "Save changes");
  s += t(270, 820, "Cancel this activity", { size: 17, anchor: "middle", fill: "#B23B3B", weight: "700" });
  return s;
}

// ---------- Adopt — application questionnaire (feeds the background-check stage; shelter's "View application") ----------
function adoptApplication(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Adoption application");
  s += t(34, 150, "Tell PAWS Manila about your home", { size: 22, weight: "800", fill: V2INK });
  s += t(34, 182, "Used for the background-check stage.", { size: 15, fill: MUTED });

  s += t(34, 232, "Do you own or rent?", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 252, ["Own", "Rent", "Living with family"], 1);

  // landlord consent (rent)
  const checkbox = y => rrect(34, y, 30, 30, 8, TEAL) + `<polyline points="41,${y + 15} 47,${y + 22} 58,${y + 8}" fill="none" stroke="${WHITE}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += checkbox(326);
  s += t(78, 348, "My landlord allows pets.", { size: 16, fill: NAVY });

  s += field(34, 390, 472, "Other pets at home", "1 senior aspin (spayed)");

  s += t(34, 512, "Your experience with pets", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 528, 472, 110, 16, WHITE, LINE);
  ["Grew up with dogs; fostered two aspins in", "2023–24. Fenced yard, work-from-home."].forEach((ln, i) => s += t(58, 568 + i * 28, ln, { size: 15, fill: MUTED }));

  s += t(34, 674, "Only the shelter sees this.", { size: 14, fill: MUTED });
  s += btn(760, "Save application");
  return s;
}

// ---------- Abot-tulong (donations) — needs/pledge tracking (funds never flow through Kupkop) ----------
function needGlyph(cat, cx, cy, c) {
  if (cat === "food") return bowlGlyph(cx, cy, c);
  if (cat === "medicine") return `<rect x="${cx - 4}" y="${cy - 11}" width="8" height="22" rx="2" fill="${c}"/><rect x="${cx - 11}" y="${cy - 4}" width="22" height="8" rx="2" fill="${c}"/>`;
  if (cat === "supplies") return `<rect x="${cx - 12}" y="${cy - 8}" width="24" height="18" rx="2.5" fill="none" stroke="${c}" stroke-width="2.6"/><line x1="${cx - 12}" y1="${cy - 1}" x2="${cx + 12}" y2="${cy - 1}" stroke="${c}" stroke-width="2.6"/><line x1="${cx}" y1="${cy - 8}" x2="${cx}" y2="${cy - 1}" stroke="${c}" stroke-width="2.6"/>`;
  return t(cx, cy + 8, "₱", { size: 26, anchor: "middle", weight: "700", fill: c });
}
function needRow(paws, x, y, cat, title, got, need, unit) {
  let s = rrect(x, y, 472, 108, 20, WHITE, LINE);
  s += avq(x + 46, y + 54, 26) + needGlyph(cat, x + 46, y + 54, TEAL);
  s += t(x + 88, y + 40, title, { size: 19, weight: "700", fill: NAVY });
  const bw = 250, frac = got / need;
  s += rrect(x + 88, y + 58, bw, 9, 4.5, "#e7e5dd") + rrect(x + 88, y + 58, Math.round(bw * frac), 9, 4.5, TEAL);
  s += t(x + 88, y + 90, `${got} / ${need} ${unit}`, { size: 14, fill: MUTED });
  s += rrect(x + 354, y + 34, 100, 44, 22, TEAL) + t(x + 404, y + 62, "Pledge", { size: 17, anchor: "middle", fill: WHITE, weight: "700" });
  return s;
}
function donate(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Abot-tulong");
  s += `<circle cx="80" cy="188" r="36" fill="${SOFT}"/>` + buildingIcon(80, 188, 38, TEAL, SOFT);
  s += t(134, 176, "PAWS Manila", { size: 24, weight: "800", fill: V2INK }) + verified(320, 169, 13);
  s += t(134, 206, "Marikina City", { size: 15, fill: MUTED });

  // give directly (QR) — off-platform
  s += rrect(34, 244, 472, 176, 22, WHITE, LINE);
  s += qr(120, 268, 128);
  s += t(272, 300, "Give directly", { size: 19, weight: "700", fill: NAVY });
  s += t(272, 328, "Scan with GCash or Maya.", { size: 15, fill: MUTED });
  s += t(272, 352, "Straight to the shelter —", { size: 14, fill: "#9a988f" });
  s += t(272, 372, "Kupkop never handles it.", { size: 14, fill: "#9a988f" });

  // wishlist (trackable pledges)
  s += t(34, 466, "Wishlist", { size: 22, weight: "800", fill: V2INK });
  s += t(34, 492, "Pledge an item — the shelter confirms delivery.", { size: 14, fill: MUTED });
  const needs = [["food", "Dog &amp; puppy food", 32, 50, "kg"], ["medicine", "Deworming meds", 8, 20, "doses"], ["supplies", "Blankets &amp; towels", 5, 15, "pcs"]];
  needs.forEach(([cat, title, got, need, unit], i) => s += needRow(paws, 34, 520 + i * 122, cat, title, got, need, unit));
  return s;
}
function donatePledge(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Pledge");
  s += rrect(34, 150, 472, 104, 20, WHITE, LINE);
  s += avq(84, 202, 30) + needGlyph("food", 84, 202, TEAL);
  s += t(134, 190, "Dog &amp; puppy food", { size: 21, weight: "800", fill: V2INK });
  s += t(134, 218, "PAWS Manila · 32 of 50 kg so far", { size: 15, fill: MUTED });

  s += t(34, 300, "How much will you give?", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 320, ["5 kg", "10 kg", "20 kg", "Other"], 1);
  s += field(34, 396, 472, "Amount", "10 kg");

  s += t(34, 520, "Note to the shelter (optional)", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 536, 472, 92, 16, WHITE, LINE) + t(58, 574, "Can drop off this weekend — Ana", { size: 16, fill: "#9a988f" });

  s += rrect(34, 664, 472, 74, 16, "#eaf4f2");
  s += t(58, 698, "You deliver the item; the shelter marks it", { size: 14, fill: TEAL });
  s += t(58, 720, "received. No money passes through Kupkop.", { size: 14, fill: TEAL });

  s += btn(792, "Pledge 10 kg");
  return s;
}
function donatePledged(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Abot-tulong");
  s += `<circle cx="270" cy="214" r="70" fill="${OKBG}"/>`;
  s += `<polyline points="238,214 262,240 306,190" fill="none" stroke="${OK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(270, 338, "Pledge recorded!", { size: 30, anchor: "middle", weight: "700", fill: NAVY });
  s += t(270, 378, "PAWS Manila is expecting 10 kg of food.", { size: 18, anchor: "middle", fill: MUTED });

  const cy = 434;
  s += rrect(34, cy, 472, 104, 20, WHITE, LINE);
  s += avq(84, cy + 52, 30) + needGlyph("food", 84, cy + 52, TEAL);
  s += t(132, cy + 42, "Dog &amp; puppy food · 10 kg", { size: 20, weight: "800", fill: V2INK });
  s += t(132, cy + 70, "PAWS Manila", { size: 15, fill: MUTED });
  s += statusChip(486, cy + 18, "Pledged");

  s += t(34, 596, "What happens next", { size: 20, weight: "800", fill: V2INK });
  ["Deliver or drop it off at the shelter", "PAWS Manila marks it received", "It counts toward the need — you're tracked"].forEach((ln, i) => {
    const y = 638 + i * 52;
    s += `<circle cx="52" cy="${y}" r="17" fill="${SOFT}"/>` + t(52, y + 6, String(i + 1), { size: 17, anchor: "middle", weight: "700", fill: TEAL });
    s += t(84, y + 6, ln, { size: 16, fill: NAVY });
  });
  s += btn(820, "View my donations");
  return s;
}
function myDonations(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("My donations");
  const sy = 150;
  s += rrect(34, sy, 472, 116, 24, WHITE, LINE);
  [["9", "Pledges"], ["7", "Delivered"], ["5", "Needs helped"]].forEach(([n, lab], i) => {
    const cx = 34 + (i + 0.5) * (472 / 3);
    if (i) s += `<line x1="${34 + i * (472 / 3)}" y1="${sy + 28}" x2="${34 + i * (472 / 3)}" y2="${sy + 88}" stroke="${LINE}" stroke-width="1.5"/>`;
    s += t(cx, sy + 56, n, { size: 26, anchor: "middle", weight: "700", fill: NAVY });
    s += t(cx, sy + 88, lab, { size: 16, anchor: "middle", fill: MUTED });
  });
  s += t(34, 314, "Your pledges", { size: 22, weight: "800", fill: V2INK });
  const rows = [
    ["food", "Dog &amp; puppy food · 10 kg", "PAWS Manila · Jul 13", "Pledged"],
    ["medicine", "Deworming meds · 5 doses", "Marikina AWG · Jul 6", "Delivered"],
    ["funds", "Vet fund · ₱500", "Pasig Pound · Jun 28", "Delivered"],
    ["supplies", "Blankets · 4 pcs", "PAWS Manila · Jun 20", "Delivered"],
  ];
  // Cancel is only offered while PLEDGED — once Delivered the goods are with the shelter, so there's
  // nothing to cancel. The pledged row grows to carry the action (mirrors the volunteer shift card).
  let y = 346;
  rows.forEach(([cat, title, meta, st]) => {
    const pledged = st === "Pledged", h = pledged ? 128 : 88;
    s += rrect(34, y, 472, h, 20, WHITE, LINE);
    s += avq(80, y + 44, 28) + needGlyph(cat, 80, y + 44, TEAL);
    s += t(124, y + 40, title, { size: 18, weight: "700", fill: NAVY });
    s += t(124, y + 66, meta, { size: 14, fill: MUTED });
    s += statusChip(486, y + 26, st);
    if (pledged) {
      s += `<line x1="58" y1="${y + 94}" x2="482" y2="${y + 94}" stroke="${LINE}" stroke-width="1.5"/>`;
      s += t(58, y + 118, "Deliver, then the shelter confirms", { size: 14, fill: MUTED });
      s += t(482, y + 118, "Cancel pledge", { size: 15, anchor: "end", fill: DANGER, weight: "700" });
    }
    y += h + 12;
  });
  s += t(270, y + 8, "Deliveries are confirmed by the shelter.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  return s;
}

// ---------- Donor: cancel a pledge (confirmation over my-donations) ----------
// Repercussions the modal has to make honest: (1) the pledge frees the need's progress so another
// donor can step in, (2) the shelter was expecting it and is notified, (3) it's recorded `cancelled`
// (not deleted) and visible to the shelter. Soft — no reliability penalty (over-punishing giving is
// worse than the occasional cancel) — but the shelter sees it, which is the gentle anti-abuse.
function myDonationsCancelConfirm(paws) {
  let s = myDonations(paws);
  s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;
  s += `<rect x="50" y="326" width="440" height="474" rx="26" fill="${WHITE}" filter="url(#v2sh)"/>`;
  s += `<circle cx="270" cy="400" r="38" fill="${DANGERBG}"/>` + alertIcon(270, 400, 20, DANGER);
  s += t(270, 482, "Cancel this pledge?", { size: 25, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 520, "PAWS Manila is expecting 10 kg of food.", { size: 15, anchor: "middle", fill: MUTED });
  // what happens
  s += `<rect x="82" y="552" width="376" height="70" rx="16" fill="${SOFT}"/>`;
  s += pinIcon(114, 583, TEALDK);
  s += t(142, 578, "The need reopens for another donor,", { size: 13.5, fill: TEALDK, weight: "600" });
  s += t(142, 601, "and the shelter is notified.", { size: 13.5, fill: MUTED });
  s += t(270, 652, "No penalty — just pledge what you can deliver.", { size: 12.5, anchor: "middle", fill: "#a9adaa" });
  s += dbtn(82, 682, 376, "Yes, cancel pledge", 20);
  s += t(270, 786, "Keep pledge", { size: 18, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Abot-tulong donor entry — pick a shelter to support (from Home · Donate) ----------
function support(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Abot-tulong");
  s += t(34, 152, "Support a shelter", { size: 28, weight: "800", fill: V2INK });
  s += t(34, 184, "100% goes to the shelter — Kupkop takes nothing.", { size: 15, fill: MUTED });
  s += chipRow(34, 212, ["All", "Nearby", "Verified"], 0);

  const shelters = [
    ["PAWS Manila", true, "Marikina City", "3 open needs", true],
    ["Marikina AWG", true, "Marikina City", "2 open needs", false],
    ["CARA Welfare", true, "Manila", "5 open needs", false],
    ["Pasig Pound", false, "Pasig City", "1 open need", false],
  ];
  shelters.forEach(([nm, ver, loc, needs, urgent], i) => {
    const y = 288 + i * 114;
    s += rrect(34, y, 472, 100, 20, WHITE, LINE);
    s += avq(82, y + 50, 30) + buildingIcon(82, y + 50, 32, TEAL, SOFT);
    s += t(128, y + 42, nm, { size: 21, weight: "800", fill: V2INK });
    if (ver) s += verified(128 + nm.length * 12.6 + 22, y + 35, 12);
    s += t(128, y + 70, loc + " · " + needs, { size: 15, fill: MUTED });
    if (urgent) s += rrect(486 - 84, y + 16, 84, 30, 15, WARNBG) + t(486 - 42, y + 36, "Urgent", { size: 14, anchor: "middle", fill: WARN2, weight: "700" });
    s += t(486, y + 66, "›", { size: 32, anchor: "end", fill: "#b8b6ad" });
  });
  return s;
}

// ---------- Shelter: Abot-tulong wishlist management (post needs, confirm pledged deliveries) ----------
function shelterNeeds(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Wishlist");
  s += topbarPill(506, "+ New");
  s += t(34, 168, "What your shelter needs", { size: 26, weight: "800", fill: V2INK });
  s += t(34, 200, "Donors pledge items — you confirm delivery.", { size: 16, fill: MUTED });

  const needs = [
    ["food", "Dog &amp; puppy food", 32, 50, "kg", "Open", 3, 1],
    ["medicine", "Deworming meds", 8, 20, "doses", "Open", 2, 0],
    ["supplies", "Blankets &amp; towels", 15, 15, "pcs", "Fulfilled", 4, 0],
    // stood down below target — the other end state "Mark complete" can produce (need_status=closed)
    ["funds", "Vet fund", 4, 10, "k", "Closed", 2, 0],
  ];
  needs.forEach(([cat, title, got, need, unit, st, pledges, toConfirm], i) => {
    const y = 236 + i * 132;
    s += rrect(34, y, 472, 116, 20, WHITE, LINE);
    s += avq(80, y + 44, 26) + needGlyph(cat, 80, y + 44, TEAL);
    s += t(122, y + 40, title, { size: 19, weight: "700", fill: NAVY });
    const bw = 250, frac = got / need;
    s += rrect(122, y + 58, bw, 9, 4.5, "#e7e5dd") + rrect(122, y + 58, Math.round(bw * frac), 9, 4.5, TEAL);
    s += t(122, y + 90, `${got} / ${need} ${unit} · ${pledges} pledges`, { size: 14, fill: MUTED });
    s += statusChip(486, y + 16, st);
    if (toConfirm) { const lab = toConfirm + " to confirm", w = 26 + lab.length * 9; s += rrect(486 - w, y + 74, w, 30, 15, WARNBG) + t(486 - w / 2, y + 94, lab, { size: 13, anchor: "middle", fill: WARN2, weight: "700" }); }
    else s += t(486, y + 94, "Manage ›", { size: 15, anchor: "end", fill: TEAL, weight: "700" });
  });
  return s;
}
function shelterNeedNew() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("New need");
  s += t(34, 160, "Category", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 180, ["Food", "Medicine", "Supplies"], 0);
  s += chipRow(34, 242, ["Funds", "Other"], -1);

  s += field(34, 314, 472, "What do you need?", "Dog &amp; puppy food");
  s += field(34, 436, 300, "Quantity needed", "50");
  s += field(354, 436, 152, "Unit", "kg");

  s += t(34, 558, "Details (optional)", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 574, 472, 96, 16, WHITE, LINE) + t(58, 612, "Any brand/size, drop-off hours…", { size: 16, fill: "#9a988f" });

  s += t(34, 706, "Donors can pledge once this is posted.", { size: 14, fill: MUTED });
  s += btn(770, "Post need");
  return s;
}
// ---------- Shelter: edit an existing need ----------
// Same form as shelterNeedNew but prefilled and constrained: a need that already has deliveries
// can't have its target moved below what's been received (32 kg is banked — a target of 20 would
// make the progress bar read 32/20). The floor note states that where the field is, not on submit.
// Category is deliberately still editable: a shelter mis-filing "Deworming meds" under Supplies is
// likelier than a need genuinely changing kind, and re-posting would orphan the pledges.
function shelterNeedEdit() {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Edit need");
  s += t(34, 160, "Category", { size: 18, weight: "700", fill: NAVY });
  s += chipRow(34, 180, ["Food", "Medicine", "Supplies"], 0);
  s += chipRow(34, 242, ["Funds", "Other"], -1);

  s += field(34, 314, 472, "What do you need?", "Dog &amp; puppy food");
  s += field(34, 436, 300, "Quantity needed", "50");
  s += field(354, 436, 152, "Unit", "kg");
  // the floor lives next to the field it constrains
  s += `<rect x="34" y="536" width="472" height="52" rx="16" fill="${SOFT}"/>`;
  s += t(58, 568, "32 kg already received — the target can't go lower.", { size: 14.5, fill: TEALDK, weight: "600" });

  s += t(34, 626, "Details (optional)", { size: 18, weight: "700", fill: NAVY });
  s += rrect(34, 642, 472, 96, 16, WHITE, LINE) + t(58, 680, "Any brand/size, drop-off hours…", { size: 16, fill: "#9a988f" });

  s += t(34, 774, "Donors who already pledged keep their pledge.", { size: 14, fill: MUTED });
  s += btn(812, "Save changes");
  s += t(270, 916, "Mark as complete ›", { size: 17, anchor: "middle", fill: TEAL, weight: "700" });
  return s;
}

// ---------- Shelter: mark a need complete (confirm modal over the need detail) ----------
// Completing is a POSITIVE action, so the hero is teal, not danger — but it has a blast radius and
// the modal has to name it: an open (pledged, not yet delivered) pledge is cancelled by this, and
// that donor set out to give something. Same principle as the volunteer cancel-cascade modal —
// a shelter admin should see who they're about to stand up.
//
// Deliberately allowed BELOW target (32/50 here): "complete" means the shelter no longer needs the
// item, not that the number was hit — a bulk donation elsewhere is the common case. Blocking it
// until 50/50 would leave stale needs on every wishlist.
//
// One button, two end states — the shelter shouldn't have to know the enum: `need_status` already
// distinguishes `fulfilled` (target met) from `closed` (stood down early), so "Mark complete" maps
// to whichever the numbers say. The wishlist chip follows: Fulfilled at/above target, Closed below.
//
// No pronouns for the donor — the row names the person and the action, nothing more.
function shelterNeedCompleteConfirm(paws) {
  let s = shelterNeedPledges(paws);
  s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;
  s += `<rect x="50" y="300" width="440" height="530" rx="26" fill="${WHITE}" filter="url(#v2sh)"/>`;

  s += `<circle cx="270" cy="374" r="38" fill="${SOFT}"/>`;
  s += `<polyline points="254,374 265,386 288,362" fill="none" stroke="${TEAL}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(270, 456, "Mark this need complete?", { size: 24, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 492, "Dog &amp; puppy food · 32 of 50 kg received.", { size: 15, anchor: "middle", fill: MUTED });

  // consequence
  s += `<rect x="82" y="516" width="376" height="70" rx="16" fill="${SOFT}"/>`;
  s += pinIcon(114, 547, TEALDK);
  s += t(142, 542, "It comes off your wishlist —", { size: 13.5, fill: TEALDK, weight: "600" });
  s += t(142, 565, "donors can no longer pledge to it.", { size: 13.5, fill: MUTED });

  // blast radius — the one open pledge this strands
  s += `<rect x="82" y="598" width="376" height="78" rx="16" fill="${WARNBG}"/>`;
  s += avq(118, 637, 22, "#f0e2c6") + t(118, 644, "AR", { size: 16, anchor: "middle", weight: "700", fill: WARN2 });
  s += t(152, 630, "1 open pledge is cancelled", { size: 13.5, fill: WARN2, weight: "700" });
  s += t(152, 653, "Ana Reyes · 10 kg — the donor is notified.", { size: 13, fill: WARN });

  s += `<rect x="82" y="694" width="376" height="64" rx="32" fill="url(#v2btn)" filter="url(#v2soft)"/>`;
  s += t(270, 734, "Mark complete", { size: 20, anchor: "middle", fill: WHITE, weight: "700" });
  s += t(270, 800, "Not yet", { size: 18, anchor: "middle", fill: TEALDK, weight: "700" });
  return s;
}

// ---------- Shelter: confirm a pledge was received (modal over the need detail) ----------
// "Mark received" used to fire straight from the pledge row with no confirm — but this is the
// ONE moment that turns a donor's claim into Kupkop's actual record: DP §6.9 is explicit that
// "only the receiving shelter can confirm a pledge, so the count reflects what actually arrived
// rather than what was promised," and it drives quantity_received directly (no undo flow exists
// in the data model). A stray tap here silently overstates a need's progress with nothing to
// catch it — worth one confirm, unlike e.g. approving a volunteer request which is easily reversed.
//
// Positive action → teal checkmark hero (same language as shelterNeedCompleteConfirm), not a
// warning. The one thing worth surfacing concretely is the progress it produces — showing
// "32 → 42 of 50 kg" makes the effect real instead of an abstract "are you sure".
function shelterNeedReceivedConfirm(paws) {
  let s = shelterNeedPledges(paws);
  s += `<rect width="${SW}" height="${SH}" fill="#0d1826" opacity="0.55"/>`;
  s += `<rect x="50" y="310" width="440" height="480" rx="26" fill="${WHITE}" filter="url(#v2sh)"/>`;

  s += `<circle cx="270" cy="384" r="38" fill="${SOFT}"/>`;
  s += `<polyline points="254,384 265,396 288,372" fill="none" stroke="${TEAL}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(270, 466, "Confirm you received this?", { size: 24, anchor: "middle", weight: "800", fill: V2INK });
  s += t(270, 502, "Ana Reyes pledged 10 kg of Dog &amp; puppy food.", { size: 15, anchor: "middle", fill: MUTED });

  // the concrete effect — before → after, not an abstract warning
  s += `<rect x="82" y="536" width="376" height="76" rx="16" fill="${SOFT}"/>`;
  s += `<circle cx="118" cy="574" r="14" fill="${OKBG}"/>` +
    `<polyline points="112,574 116,579 125,568" fill="none" stroke="${OK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += t(144, 570, "32 → 42 of 50 kg received", { size: 16.5, weight: "800", fill: TEALDK });
  s += t(144, 595, "Updates your wishlist progress automatically.", { size: 13.5, fill: MUTED });

  s += t(270, 646, "Can't be undone — confirm only what's actually arrived.", { size: 13, anchor: "middle", fill: "#a9adaa" });

  s += `<rect x="82" y="674" width="376" height="64" rx="32" fill="url(#v2btn)" filter="url(#v2soft)"/>`;
  s += t(270, 714, "Yes, mark received", { size: 20, anchor: "middle", fill: WHITE, weight: "700" });
  s += t(270, 770, "Not yet", { size: 18, anchor: "middle", fill: TEALDK, weight: "700" });
  return s;
}

function shelterNeedPledges(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${BG}"/>` + topbar("Wishlist item");
  // the need detail is the hub for one need — edit sits here, next to the thing it edits
  s += t(506, 74, "Edit", { size: 20, anchor: "end", fill: TEAL, weight: "700" });
  // need summary
  s += rrect(34, 150, 472, 128, 20, WHITE, LINE);
  s += avq(84, 200, 30) + needGlyph("food", 84, 200, TEAL);
  s += t(134, 190, "Dog &amp; puppy food", { size: 21, weight: "800", fill: V2INK }) + statusChip(486, 172, "Open");
  const bw = 352, frac = 32 / 50;
  s += rrect(134, 214, bw, 10, 5, "#e7e5dd") + rrect(134, 214, Math.round(bw * frac), 10, 5, TEAL);
  s += t(134, 250, "32 of 50 kg received · Food", { size: 15, fill: MUTED });

  s += t(34, 330, "Pledges", { size: 22, weight: "800", fill: V2INK }) + t(506, 330, "4 total", { size: 16, anchor: "end", fill: MUTED });
  const rows = [
    ["Ana Reyes", "AR", "10 kg", "pledged 2h ago", "confirm"],
    ["Jose Cruz", "JC", "5 kg", "delivered Jul 10", "done"],
    ["Maria Santos", "MS", "8 kg", "delivered Jul 8", "done"],
    // donor cancelled — shown so the shelter knows these goods aren't coming (need reopened, no action)
    ["Pedro Lim", "PL", "6 kg", "cancelled Jul 12", "cancelled"],
  ];
  rows.forEach(([nm, ini, qty, when, state], i) => {
    const y = 362 + i * 108, cancelled = state === "cancelled";
    s += rrect(34, y, 472, 92, 20, WHITE, LINE);
    s += avq(80, y + 46, 28, cancelled ? "#eceae4" : SOFT) + t(80, y + 53, ini, { size: 20, anchor: "middle", weight: "700", fill: cancelled ? "#9a988f" : TEAL });
    s += t(124, y + 40, nm + " · " + qty, { size: 19, weight: "700", fill: cancelled ? "#9a988f" : NAVY });
    s += t(124, y + 66, when, { size: 15, fill: cancelled ? "#b8b6ad" : MUTED });
    if (state === "confirm") s += rrect(340, y + 26, 150, 44, 22, TEAL) + t(415, y + 54, "Mark received", { size: 15, anchor: "middle", fill: WHITE, weight: "700" });
    else if (cancelled) s += statusChip(486, y + 30, "Cancelled");
    else s += statusChip(486, y + 30, "Delivered");
  });
  s += t(270, 826, "Cancelled pledges free the need for other donors.", { size: 14, anchor: "middle", fill: "#b8b6ad" });
  // closing the need out — the only route to the `Fulfilled` chip the wishlist already renders
  s += btnOutline(862, "Mark need complete");
  return s;
}

// =================== V2 DESIGN LANGUAGE (pilot — 4 screens) ===================
// Modern pass: soft drop shadows replace hairline strokes, filled pill inputs, gradient primary
// buttons, squircle icon tiles, floating detached tab bar, larger/tighter type. Rendered as
// separate *-v2 files so the 81 untouched screens keep the current look until the language is
// approved — then these helpers replace their v1 counterparts.
const V2BG = "#F4F5F2", V2INK = "#12213A";
const v2defs = () => `<defs>
  <filter id="v2sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#1F3A5F" flood-opacity="0.10"/></filter>
  <filter id="v2soft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#1F3A5F" flood-opacity="0.08"/></filter>
  <linearGradient id="v2btn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#238383"/><stop offset="1" stop-color="#14504F"/></linearGradient>
  <linearGradient id="v2danger" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C94A44"/><stop offset="1" stop-color="#9E322D"/></linearGradient>
  <linearGradient id="v2hero" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${TEAL}"/><stop offset="1" stop-color="${FOREST}"/></linearGradient>
  <linearGradient id="v2fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${V2BG}" stop-opacity="0"/><stop offset="0.5" stop-color="${V2BG}" stop-opacity="0.9"/><stop offset="1" stop-color="${V2BG}"/></linearGradient>
</defs>`;
const v2card = (x, y, w, h, r = 24) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${WHITE}" filter="url(#v2sh)"/>`;
const v2btn = (y, label) => `<rect x="34" y="${y}" width="472" height="72" rx="36" fill="url(#v2btn)" filter="url(#v2soft)"/>` +
  t(270, y + 46, label, { size: 23, anchor: "middle", fill: WHITE, weight: "700" });
const v2squircle = (cx, cy, sz, fill, r) => `<rect x="${cx - sz / 2}" y="${cy - sz / 2}" width="${sz}" height="${sz}" rx="${r || sz * 0.32}" fill="${fill}"/>`;
// avatar squircle — drop-in for a SOFT list-row avatar circle (same centre + radius footprint),
// so icons/initials drawn at (cx,cy) still centre. Used app-wide to replace the v1 circle avatars.
const avq = (cx, cy, r, fill = SOFT) => `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="${r * 0.62}" fill="${fill}"/>`;
function v2field(x, y, w, label, value, o = {}) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="84" rx="22" fill="${WHITE}" filter="url(#v2soft)"/>`;
  s += t(x + 26, y + 32, label, { size: 13, fill: MUTED, weight: "600", ls: 0.4 });
  const vx = x + (o.prefix ? 88 : 26);
  if (o.prefix) s += t(x + 26, y + 64, o.prefix, { size: 20, weight: "700", fill: TEAL });
  s += t(vx, y + 64, value, { size: 20, weight: "700", fill: V2INK });
  if (o.eye) s += `<ellipse cx="${x + w - 44}" cy="${y + 50}" rx="15" ry="9.5" fill="none" stroke="${MUTED}" stroke-width="2.4"/><circle cx="${x + w - 44}" cy="${y + 50}" r="4.5" fill="${MUTED}"/>`;
  return s;
}
function v2seg(x, y, w, labels, active) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="58" rx="29" fill="#EAEDE8"/>`;
  const seg = w / labels.length;
  labels.forEach((lab, i) => {
    if (i === active) s += `<rect x="${x + i * seg + 5}" y="${y + 5}" width="${seg - 10}" height="48" rx="24" fill="${WHITE}" filter="url(#v2soft)"/>`;
    s += t(x + (i + 0.5) * seg, y + 36, lab, { size: 17, anchor: "middle", weight: "700", fill: i === active ? TEAL : MUTED });
  });
  return s;
}
function v2statusChip(x, y, label) {
  const map = { Adopted: ["#EAF3DE", "#27500A"], Declined: ["#F8E9E7", "#8A3B3B"], New: ["#E2EEF0", TEALDK], Confirmed: ["#EAF3DE", "#27500A"] };
  const [bg, fg] = map[label] || ["#ECEAE3", MUTED];
  const w = 40 + label.length * 10.5;
  return `<rect x="${x - w}" y="${y}" width="${w}" height="36" rx="18" fill="${bg}"/>` +
    `<circle cx="${x - w + 17}" cy="${y + 18}" r="4" fill="${fg}"/>` +
    t(x - w + 29, y + 24, label, { size: 14, fill: fg, weight: "700" });
}
// tab-bar glyphs, filled/rounded to match the v2 language; looked up by tab label so both
// shells (owner: Home·Adopt·Volunteer·You / shelter: Home·Animals·Donate·Requests·You) share one set
function v2tabIcon(lab, cx, cy, c) {
  if (lab === "Home") return `<path d="M${cx} ${cy - 12} L${cx + 13} ${cy - 1} L${cx + 9} ${cy - 1} L${cx + 9} ${cy + 10} Q${cx + 9} ${cy + 12} ${cx + 7} ${cy + 12} L${cx + 3} ${cy + 12} L${cx + 3} ${cy + 4} L${cx - 3} ${cy + 4} L${cx - 3} ${cy + 12} L${cx - 7} ${cy + 12} Q${cx - 9} ${cy + 12} ${cx - 9} ${cy + 10} L${cx - 9} ${cy - 1} L${cx - 13} ${cy - 1} Z" fill="${c}"/>`;
  if (lab === "Adopt") return heartIcon(cx, cy + 1, 26, c);
  if (lab === "Volunteer") return `<rect x="${cx - 11}" y="${cy - 9}" width="22" height="20" rx="5" fill="${c}"/>` +
    `<line x1="${cx - 6}" y1="${cy - 13}" x2="${cx - 6}" y2="${cy - 7}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="${cx + 6}" y1="${cy - 13}" x2="${cx + 6}" y2="${cy - 7}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>` +
    `<line x1="${cx - 5.5}" y1="${cy - 1}" x2="${cx + 5.5}" y2="${cy - 1}" stroke="${WHITE}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (lab === "Animals") return pawmark(cx, cy + 1, 13, c);
  if (lab === "Donate") return t(cx, cy + 9, "₱", { size: 25, anchor: "middle", weight: "800", fill: c });
  if (lab === "Requests") return `<rect x="${cx - 12}" y="${cy - 8}" width="24" height="17" rx="4" fill="${c}"/>` +
    `<path d="M${cx - 12} ${cy - 5} l12 8 l12 -8" fill="none" stroke="${WHITE}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  return personIcon(cx, cy + 1, 26, c); // "You"
}
// floating detached tab bar — active item gets a tinted pill; inactive are quiet
function v2nav(active, items) {
  const labs = items || ["Home", "Adopt", "Volunteer", "You"];
  // scroll-fade so v1 content laid out for the old full-width bar reads as scrolling under the float
  let s = `<rect x="0" y="${SH - 150}" width="${SW}" height="150" fill="url(#v2fade)"/>`;
  s += `<rect x="24" y="${SH - 108}" width="${SW - 48}" height="84" rx="30" fill="${WHITE}" filter="url(#v2sh)"/>`;
  const seg = (SW - 48) / labs.length;
  labs.forEach((lab, i) => {
    const cx = 24 + (i + 0.5) * seg, on = i === active;
    if (on) s += `<rect x="${cx - seg / 2 + 8}" y="${SH - 100}" width="${seg - 16}" height="68" rx="22" fill="${SOFT}"/>`;
    s += v2tabIcon(lab, cx, SH - 74, on ? TEAL : "#C9CEC7");
    s += t(cx, SH - 42, lab, { size: 13.5, anchor: "middle", weight: on ? "800" : "600", fill: on ? TEALDK : MUTED });
  });
  return s;
}
const v2back = () => `<circle cx="56" cy="66" r="22" fill="${WHITE}" filter="url(#v2soft)"/>` +
  t(56, 76, "‹", { size: 30, anchor: "middle", weight: "700", fill: V2INK });

// ---- V2 pilot 1: Log in ----
function signInV2() {
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false) + v2back();
  s += v2squircle(270, 196, 104, "url(#v2hero)", 34) + pawmark(270, 200, 32, WHITE);
  s += t(34, 330, "Welcome back", { size: 34, weight: "800", fill: V2INK, ls: -0.5 });
  s += t(34, 366, "Log in to keep helping.", { size: 18, fill: MUTED });
  s += v2field(34, 408, 472, "EMAIL", "ana@email.com");
  s += v2field(34, 512, 472, "PASSWORD", "••••••••", { eye: true });
  s += t(506, 636, "Forgot password?", { size: 16, anchor: "end", fill: TEAL, weight: "700" });
  s += v2btn(676, "Log in");
  s += t(270, 806, "or continue with", { size: 15, anchor: "middle", fill: "#A9ADA5" });
  s += providerRow(34, 834, 472, ["google", "apple"], 66);
  s += t(270, 972, "New to Kupkop?  Create account", { size: 17, anchor: "middle", fill: TEAL, weight: "700" });
  s += t(270, 1022, "By continuing you agree to our Terms &amp; Privacy.", { size: 14, anchor: "middle", fill: "#A9ADA5" });
  return s;
}

// ---- V2 pilot 2: Adopt — my inquiries ----
function adoptInquiriesV2(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false);
  s += t(34, 96, "Adopt a friend", { size: 31, weight: "800", fill: V2INK, ls: -0.5 });
  s += `<circle cx="496" cy="88" r="24" fill="${WHITE}" filter="url(#v2soft)"/>` +
    `<path d="M488 92 q0 -12 8 -12 q8 0 8 12 l3 4 h-22 z" fill="none" stroke="${V2INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M493 98 a3 3 0 0 0 6 0" fill="none" stroke="${V2INK}" stroke-width="2.2"/>`;
  s += v2seg(34, 128, 472, ["Browse", "My inquiries"], 1);
  const rows = [
    ["Milo", "Aspin · 2y · PAWS Manila", { step: 4, stage: "Interview" }],
    ["Luna", "Puspin · 2y · Marikina AWG", { step: 2, stage: "Complete application ›" }],
    ["Bruno", "Aspin · 3y · Pasig Pound", { outcome: "Adopted" }],
    ["Rocky", "Aspin · 2y · QC Shelter", { outcome: "Declined" }],
  ];
  rows.forEach(([nm, meta, prog], i) => {
    const y = 222 + i * 130;
    s += v2card(34, y, 472, 114);
    s += v2squircle(84, y + 57, 62, SOFT) + pawIcon(paws.teal.uri, 84, y + 57, 34);
    s += t(130, y + 46, nm, { size: 21, weight: "800", fill: V2INK });
    s += t(130, y + 72, meta, { size: 14, fill: MUTED });
    if (prog.outcome) s += v2statusChip(482, y + 26, prog.outcome);
    else {
      s += `<rect x="130" y="${y + 88}" width="220" height="10" rx="5" fill="#E8EAE4"/>` +
        `<rect x="130" y="${y + 88}" width="${Math.round(220 * prog.step / 6)}" height="10" rx="5" fill="url(#v2btn)"/>`;
      s += t(482, y + 40, "Step " + prog.step + " of 6", { size: 13.5, anchor: "end", fill: MUTED, weight: "700" });
      s += t(482, y + 66, prog.stage, { size: 13.5, anchor: "end", fill: TEAL, weight: "700" });
    }
  });
  s += t(270, 792, "Tap an inquiry for all 6 steps &amp; shelter contact.", { size: 14, anchor: "middle", fill: "#A9ADA5" });
  s += v2nav(1);
  return s;
}

// ---- V2 pilot 3: Adopt — inquiry detail (active state) ----
function adoptInquiryDetailV2(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false) + v2back();
  s += t(270, 76, "Your inquiry", { size: 22, anchor: "middle", weight: "800", fill: V2INK });
  s += v2card(34, 116, 472, 108);
  s += v2squircle(88, 170, 64, SOFT) + pawIcon(paws.teal.uri, 88, 170, 36);
  s += t(136, 160, "Milo", { size: 23, weight: "800", fill: V2INK });
  s += t(136, 188, "PAWS Manila · Marikina City", { size: 14, fill: MUTED });
  s += `<rect x="384" y="146" width="98" height="34" rx="17" fill="${SOFT}"/>` + t(433, 168, "Step 4 of 6", { size: 13.5, anchor: "middle", fill: TEALDK, weight: "800" });
  // staged tracker
  s += v2card(34, 248, 472, 470);
  const stages = [
    ["Inquiry sent", "Jul 12", "done"],
    ["Application &amp; background check", "Jul 13", "done"],
    ["Home check", "Skipped", "skipped"],
    ["Interview", "In progress", "in_progress"],
    ["Vet clearance", "", "not_started"],
    ["Finalization", "", "not_started"],
  ];
  const bx = 76, sy = 300, sp = 72;
  stages.forEach(([label, meta, st], i) => {
    const cy = sy + i * sp;
    if (i < stages.length - 1) {
      const col = (st === "done" || st === "skipped") ? TEAL : "#E4E6E0";
      s += `<line x1="${bx}" y1="${cy + 17}" x2="${bx}" y2="${cy + sp - 17}" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`;
    }
    if (st === "done") s += `<circle cx="${bx}" cy="${cy}" r="15" fill="url(#v2btn)"/>` +
      `<polyline points="${bx - 6},${cy} ${bx - 1},${cy + 5} ${bx + 7},${cy - 5}" fill="none" stroke="${WHITE}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (st === "in_progress") s += `<circle cx="${bx}" cy="${cy}" r="15" fill="${WHITE}" stroke="${TEAL}" stroke-width="4"/><circle cx="${bx}" cy="${cy}" r="5.5" fill="${TEAL}"/>`;
    else if (st === "skipped") s += `<circle cx="${bx}" cy="${cy}" r="13" fill="#ECEAE3"/><line x1="${bx - 5}" y1="${cy}" x2="${bx + 5}" y2="${cy}" stroke="#6b6a63" stroke-width="2.6" stroke-linecap="round"/>`;
    else s += `<circle cx="${bx}" cy="${cy}" r="12" fill="${WHITE}" stroke="#E0E2DC" stroke-width="3"/>`;
    const active = st === "done" || st === "in_progress";
    s += t(108, cy + 6, label, { size: 16.5, weight: active ? "800" : "600", fill: active ? V2INK : "#A9ADA5" });
    if (meta) s += t(482, cy + 6, meta, { size: 13.5, anchor: "end", fill: st === "in_progress" ? TEAL : MUTED, weight: st === "in_progress" ? "800" : "500" });
    if (label.startsWith("Application")) s += t(108, cy + 30, "View your application ›", { size: 12.5, fill: TEAL, weight: "700" });
  });
  // up next banner
  s += `<rect x="34" y="742" width="472" height="78" rx="22" fill="${SOFT}"/>`;
  s += t(58, 774, "Up next: your interview", { size: 17, weight: "800", fill: TEALDK });
  s += t(58, 800, "PAWS Manila will set a virtual or in-person time.", { size: 13.5, fill: MUTED });
  // contact
  s += `<rect x="34" y="846" width="228" height="64" rx="32" fill="${WHITE}" filter="url(#v2soft)"/>` + phoneIcon(120, 878, TEAL) + t(148, 886, "Call", { size: 17, fill: V2INK, weight: "700" });
  s += `<rect x="278" y="846" width="228" height="64" rx="32" fill="${WHITE}" filter="url(#v2soft)"/>` + t(392, 886, "Message on FB", { size: 16, anchor: "middle", fill: V2INK, weight: "700" });
  s += t(270, 962, "Withdraw inquiry", { size: 16, anchor: "middle", fill: "#B23B3B", weight: "700" });
  return s;
}

// ---- V2 pilot 4: Shelter dashboard ----
function shelterDashboardV2(paws) {
  let s = `<rect width="${SW}" height="${SH}" fill="${V2BG}"/>` + statusbar(false);
  s += t(34, 92, "PAWS Manila", { size: 29, weight: "800", fill: V2INK, ls: -0.5 });
  s += verified(254, 84, 14);
  s += t(34, 122, "Shelter dashboard", { size: 16, fill: MUTED });
  s += `<circle cx="496" cy="88" r="24" fill="${WHITE}" filter="url(#v2soft)"/>` +
    `<path d="M488 92 q0 -12 8 -12 q8 0 8 12 l3 4 h-22 z" fill="none" stroke="${V2INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M493 98 a3 3 0 0 0 6 0" fill="none" stroke="${V2INK}" stroke-width="2.2"/>` +
    `<circle cx="506" cy="74" r="5" fill="#C2453F"/>`;
  // stat tiles — icon squircles use the app's feature iconography (paw = listings,
  // heart = adopted, ₱ = donations feature; the 132 is a COUNT, not pesos)
  [["12", "Listed", "paw", SOFT, TEAL], ["34", "Adopted", "heart", "#EAF3DE", "#27500A"], ["132", "Donations", "peso", "#F2EFE7", "#8a5a12"]].forEach(([n, lab, ic, bg, fg], i) => {
    const x = 34 + i * 162;
    s += v2card(x, 152, 148, 112, 22);
    s += v2squircle(x + 40, 186, 36, bg, 12);
    if (ic === "paw") s += pawmark(x + 40, 187, 10, fg);
    else if (ic === "heart") s += heartIcon(x + 40, 187, 22, fg);
    else s += t(x + 40, 194, "₱", { size: 19, anchor: "middle", weight: "800", fill: fg });
    s += t(x + 22, 152 + 74, n, { size: 27, weight: "800", fill: V2INK });
    s += t(x + 22, 152 + 98, lab, { size: 13, fill: MUTED });
  });
  // Two create actions share the row rather than stacking — there's no vertical room before
  // "Needs you today" (388), and posting a need previously took Dashboard → Wishlist → "+ New".
  // Hierarchy is carried by treatment, not width: listing an animal keeps the gradient primary,
  // posting a need is the outline secondary. → screen-shelter-need-new.
  // 64 tall, not the usual 72 — the pair has to clear the "Needs you today" heading at 388, and
  // the shadow filter bleeds a few px past the rect.
  s += `<rect x="34" y="296" width="230" height="64" rx="32" fill="url(#v2btn)" filter="url(#v2soft)"/>`;
  s += t(149, 336, "+  List an animal", { size: 17.5, anchor: "middle", fill: WHITE, weight: "700" });
  s += `<rect x="276" y="296" width="230" height="64" rx="32" fill="${WHITE}" filter="url(#v2soft)"/>`;
  s += t(391, 336, "+  New need", { size: 17.5, anchor: "middle", fill: V2INK, weight: "700" });
  // "Needs you today" — actionable queues replace the generic quick actions (their counts made
  // Listings/Volunteer/Donations/Requests shortcuts redundant; the nav still reaches everything).
  // Every count taps into an existing screen: adoption-inquiries · need-pledges · volunteer-requests
  // · volunteer-attendance.
  s += t(34, 388, "Needs you today", { size: 21, weight: "800", fill: V2INK });
  const act = [
    ["2", "Requests to review", "mail", "#E2EEF0", TEALDK],
    ["1", "Pledges to confirm", "bowl", "#F2EFE7", "#8a5a12"],
    ["3", "Volunteer approvals", "person", "#ECEBF6", "#5b53a6"],
    ["1", "Attendance to mark", "check", "#EAF3DE", "#27500A"],
  ];
  act.forEach(([n, lab, ic, bg, fg], i) => {
    const x = 34 + (i % 2) * 244, y = 412 + Math.floor(i / 2) * 122;
    s += v2card(x, y, 228, 110, 22);
    s += v2squircle(x + 38, y + 36, 32, bg, 11);
    if (ic === "mail") s += `<rect x="${x + 29}" y="${y + 30}" width="18" height="13" rx="3" fill="${fg}"/>` +
      `<path d="M${x + 29} ${y + 32.5} l9 6 l9 -6" fill="none" stroke="${WHITE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    else if (ic === "bowl") s += `<path d="M${x + 28} ${y + 35} a10 8.5 0 0 0 20 0 Z" fill="${fg}"/>` +
      `<ellipse cx="${x + 38}" cy="${y + 35}" rx="10" ry="2.8" fill="${fg}"/>` +
      `<circle cx="${x + 34.5}" cy="${y + 29}" r="2" fill="${fg}"/>` + `<circle cx="${x + 41.5}" cy="${y + 29.5}" r="1.8" fill="${fg}"/>`;
    else if (ic === "person") s += personIcon(x + 38, y + 37, 20, fg);
    else s += `<polyline points="${x + 31},${y + 36} ${x + 36},${y + 41} ${x + 45},${y + 30}" fill="none" stroke="${fg}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += t(x + 208, y + 42, "›", { size: 20, anchor: "end", fill: "#C9CEC7", weight: "700" });
    s += t(x + 20, y + 84, n, { size: 25, weight: "800", fill: V2INK });
    s += t(x + 62, y + 84, lab, { size: 13, fill: MUTED, weight: "600" });
  });
  // requests
  s += t(34, 700, "Adoption requests", { size: 21, weight: "800", fill: V2INK });
  s += t(506, 700, "See all", { size: 15, anchor: "end", fill: TEAL, weight: "700" });
  const reqs = [["Ana Reyes", "wants to adopt Milo", "New"], ["Maria Santos", "adopting Bruno", "Step 4 of 6"]];
  reqs.forEach(([nm, meta, st], i) => {
    const y = 726 + i * 116;
    s += v2card(34, y, 472, 100);
    s += v2squircle(84, y + 50, 56, SOFT) + t(84, y + 57, nm.split(" ").map(w => w[0]).join(""), { size: 18, anchor: "middle", weight: "800", fill: TEAL });
    s += t(126, y + 42, nm, { size: 19, weight: "800", fill: V2INK });
    s += t(126, y + 68, meta, { size: 14, fill: MUTED });
    if (st === "New") s += v2statusChip(482, y + 32, st);
    else s += t(482, y + 56, st, { size: 13.5, anchor: "end", fill: TEAL, weight: "800" });
  });
  s += v2nav(0, ["Home", "Animals", "Donate", "Requests", "You"]);
  return s;
}

function board(inner, w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${v2defs()}<rect width="${w}" height="${h}" fill="${BG}"/>${inner}</svg>`;
}

function phone(inner) {
  const W = SW + PAD * 2, H = SH + PAD * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="76" fill="#11241f"/>
    <rect x="${PAD}" y="${PAD}" width="${SW}" height="${SH}" rx="48" fill="#ffffff"/>
    <clipPath id="sc"><rect x="${PAD}" y="${PAD}" width="${SW}" height="${SH}" rx="48"/></clipPath>
    ${v2defs()}
    <g clip-path="url(#sc)"><g transform="translate(${PAD},${PAD})">${inner}</g></g>
    <rect x="${W / 2 - 60}" y="${PAD + 14}" width="120" height="30" rx="15" fill="#11241f"/>
  </svg>`;
}

(async () => {
  // Load the real Kupkop logo, trim whitespace, embed as a data URI.
  const { data, info } = await sharp(path.join(DIR, "..", "..", "kupkop_logo.PNG"))
    .trim().png().toBuffer({ resolveWithObject: true });
  const logo = { uri: "data:image/png;base64," + data.toString("base64"), w: info.width, h: info.height };

  // Recolor paws.jpg (black-on-white) → solid-color paw on transparent, for icons.
  const pawAlpha = await sharp(path.join(DIR, "..", "..", "paws.jpg")).resize(96, 96, { fit: "inside" })
    .grayscale().negate().toColourspace("b-w").raw().toBuffer({ resolveWithObject: true }); // intensity = alpha
  const gi = pawAlpha.info;
  const tintPaw = async (hex) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    const rgb = Buffer.alloc(gi.width * gi.height * 3);
    for (let i = 0; i < gi.width * gi.height; i++) { rgb[i * 3] = r; rgb[i * 3 + 1] = g; rgb[i * 3 + 2] = b; }
    const buf = await sharp(rgb, { raw: { width: gi.width, height: gi.height, channels: 3 } })
      .joinChannel(pawAlpha.data, { raw: { width: gi.width, height: gi.height, channels: 1 } })
      .png().toBuffer();
    return { uri: "data:image/png;base64," + buf.toString("base64") };
  };
  const paws = { white: await tintPaw("#ffffff"), teal: await tintPaw("#1C6B6B") };

  const out = [
    // signup flow, in order: welcome → account type → signup → OTP
    ["screen-welcome.png", welcome(logo, paws.white)],
    // Sagip — report a stray (pet-owner side); entry point is the "Saw a stray? · Report now" hero on home
    ["screen-report-stray.png", reportStray(paws)],
    ["screen-report-stray-location.png", reportStrayLocation()],
    ["screen-report-stray-sent.png", reportStraySent(paws)],
    ["screen-my-reports.png", myReports(paws)],
    ["screen-my-reports-offers.png", myReports(paws, { tab: 1 })],
    ["screen-report-detail.png", reportDetail(paws)],
    // the unclaimed pair — the state an MVP in Metro Manila lives in most of the time
    ["screen-report-detail-unclaimed.png", reportDetail(paws, { unclaimed: true })],
    ["screen-report-detail-waiting.png", reportDetail(paws, { unclaimed: true, offers: 0 })],
    ["screen-rescue-map.png", rescueMap(paws)],
    // Sagip — claim side (rescuer)
    ["screen-rescue-case.png", rescueCase(paws)],
    ["screen-rescue-case-no-offers.png", rescueCase(paws, { offers: 0 })],
    ["screen-rescue-claim-confirm.png", rescueClaimConfirm(paws)],
    ["screen-rescue-offer.png", rescueOffer(paws)],
    ["screen-rescue-offer-sent.png", rescueOfferSent(paws)],
    ["screen-rescue-update.png", rescueUpdate(paws)],
    // rescue → adoption handoff (custody rule: safe/resolved only, claimer pushes, two-sided)
    ["screen-rescue-outcome.png", rescueOutcome(paws)],
    ["screen-rescue-place.png", rescuePlace(paws)],
    ["screen-rescue-place-confirm.png", rescuePlaceConfirm(paws)],
    ["screen-rescue-place-sent.png", rescuePlaceSent(paws)],
    ["screen-place-request.png", placeRequest(paws)],
    ["screen-place-accepted.png", placeAccepted(paws)],
    ["screen-rescue-list.png", listAnimal(paws, { fromRescue: true })],
    ["screen-rescue-listed.png", rescueListed(paws)],
    ["screen-my-rescues.png", myRescues(paws)],
    ["screen-my-offers.png", myRescues(paws, { tab: 1 })],
    ["screen-rescue-claim-gate.png", adoptRescuerGate(paws, { rescue: true })],
    ["screen-account-type.png", accountType(paws)],
    ["screen-account-type-google.png", accountType(paws, { google: true })],
    ["screen-signup.png", signup()],
    // validation reference renders — rules in dev/onboarding-validation.md
    ["screen-signup-errors.png", signup({ errors: true })],
    ["screen-otp-error.png", otp({ error: true })],
    ["screen-signup-shelter.png", signup({ shelter: true })],
    // owner Google signup has no fields left → routes straight to home (decision 14)
    ["screen-signup-google-shelter.png", signupGoogle()],
    ["screen-otp.png", otp()],
    ["screen-otp-unverified.png", otp({ unverified: true })],
    ["screen-otp-locked.png", otp({ locked: true })],
    ["screen-signup-success.png", signupSuccess(paws)],
    ["screen-verify-phone.png", verifyPhone(paws)],
    ["screen-otp-sms.png", otp({ sms: true })],
    ["screen-signin.png", signIn()],
    // v2 approved + rolled out 2026-07-15: helpers restyled in place; signIn & shelterDashboard
    // render the pilot layouts; the -v2 duplicates are retired.
    ["screen-location-permission.png", locationPermission()],
    ["screen-location-picker.png", locationPicker()],
    ["screen-forgot-password.png", forgotPassword()],
    ["screen-reset-otp.png", otp({ reset: true })],
    ["screen-reset-password.png", resetPassword()],
    ["screen-password-changed.png", passwordChanged()],
    ["screen-contact-support.png", contactSupport()],
    ["screen-home.png", home(paws)],
    ["screen-home-guest.png", home(paws, { guest: true })],
    ["screen-signup-wall.png", signupWall(paws, { action: "adopt" })],
    ["screen-signup-wall-report.png", signupWall(paws, { action: "report" })],
    ["screen-home-member-pending.png", home(paws, { pending: true })],
    ["screen-profile.png", profile(paws)],
    ["screen-add-pet.png", addPet(paws)],
    ["screen-settings.png", settings()],
    ["screen-shelter-setup.png", shelterSetup(paws)],
    ["screen-shelter-setup-contact.png", shelterSetupContact(paws)],
    ["screen-shelter-dashboard.png", shelterDashboard(paws)],
    ["screen-shelter-profile.png", shelterProfile()],
    ["screen-shelter-profile-rescue.png", shelterProfile({ tier: 1 })],
    ["screen-shelter-profile-pending.png", shelterProfile({ pending: true })],
    ["screen-shelter-profile-rescue-pending.png", shelterProfile({ tier: 1, pending: true })],
    ["screen-shelter-list-animal.png", listAnimal(paws)],
    ["screen-shelter-list-animal-rescue.png", listAnimal(paws, { tier1: true })],
    ["screen-shelter-edit-animal.png", shelterEditAnimal(paws)],
    ["screen-edit-profile.png", editProfile(paws)],
    ["screen-shelter-edit.png", editOrg(paws)],
    ["screen-shelter-edit-rescue.png", editOrg(paws, { tier: 1 })],
    ["screen-shelter-listings.png", shelterListings(paws)],
    ["screen-shelter-donations.png", donations()],
    ["screen-shelter-donations-no-qr.png", donations({ qr: "none" })],
    ["screen-shelter-donations-qr-pending.png", donations({ qr: "pending" })],
    ["screen-shelter-qr-add.png", shelterQrForm()],
    ["screen-shelter-qr-update.png", shelterQrForm({ existing: true })],
    ["screen-donate.png", donate(paws)],
    ["screen-donate-pledge.png", donatePledge(paws)],
    ["screen-donate-pledged.png", donatePledged(paws)],
    ["screen-my-donations.png", myDonations(paws)],
    ["screen-my-donations-cancel.png", myDonationsCancelConfirm(paws)],
    ["screen-support.png", support(paws)],
    ["screen-shelter-needs.png", shelterNeeds(paws)],
    ["screen-shelter-need-new.png", shelterNeedNew()],
    ["screen-shelter-need-pledges.png", shelterNeedPledges(paws)],
    ["screen-shelter-need-received-confirm.png", shelterNeedReceivedConfirm(paws)],
    ["screen-shelter-need-edit.png", shelterNeedEdit()],
    ["screen-shelter-need-complete.png", shelterNeedCompleteConfirm(paws)],
    // shelter verification is now tier-based; shelterVerifyDocs() is superseded by the two tier
    // forms below and is no longer rendered (kept in source only as reference — safe to delete).
    ["screen-shelter-tier.png", shelterTier(paws)],
    ["screen-shelter-verify-tier1.png", shelterVerifyTier1(paws)],
    ["screen-shelter-verify-tier1-ngo.png", shelterVerifyTier1(paws, { ngo: true })],
    ["screen-shelter-verify-photos.png", shelterVerifyPhotos(paws)],
    ["screen-shelter-verify-tier2.png", shelterVerifyTier2()],
    ["screen-shelter-verify-tier2-bai-pending.png", shelterVerifyTier2({ baiPending: true })],
    ["screen-shelter-verify-pending.png", shelterVerifyStatus("pending")],
    ["screen-shelter-verify-needs-info.png", shelterVerifyStatus("needs_info")],
    ["screen-shelter-verify-rejected.png", shelterVerifyStatus("rejected")],
    ["screen-shelter-verify-resubmit.png", shelterVerifyResubmit()],
    ["screen-shelter-verify-resubmit-ngo.png", shelterVerifyResubmit({ ngo: true })],
    ["screen-shelter-verify-resubmit-done.png", shelterVerifyResubmitDone()],
    ["screen-verify-documents.png", verifyDocuments()],
    ["screen-verify-documents-ngo.png", verifyDocuments({ ngo: true })],
    ["screen-verify-documents-member.png", verifyDocuments({ rescuer: true })],
    // two states, never one screen: documents sent (under review) vs not sent yet
    ["screen-shelter-dashboard-pending.png", shelterDashboardPending(paws)],
    ["screen-shelter-dashboard-incomplete.png", shelterDashboardPending(paws, { submitted: false })],
    ["screen-shelter-dashboard-pending-rescue.png", shelterDashboardPending(paws, { tier1: true })],
    ["screen-shelter-dashboard-incomplete-rescue.png", shelterDashboardPending(paws, { tier1: true, submitted: false })],
    ["screen-shelter-dashboard-provisional.png", shelterDashboardProvisional(paws)],
    ["screen-shelter-dashboard-provisional-bai.png", shelterDashboardProvisional(paws, { have: "bai" })],
    ["screen-member-upgrade.png", memberUpgrade(paws)],
    ["screen-member-verify.png", memberVerify()],
    ["screen-member-verify-submitted.png", memberVerifySubmitted()],
    ["screen-member-profile.png", memberProfile(paws)],
    ["screen-badge-comparison.png", badgeBoard(paws), { board: true, w: 1440, h: 540 }],
    ["screen-kawanggawa.png", kawangGawa(paws)],
    ["screen-kawanggawa-detail.png", kawangGawaDetail(paws)],
    ["screen-kawanggawa-requested.png", kawangGawaRequested(paws)],
    ["screen-kawanggawa-schedule.png", kawangGawaSchedule(paws)],
    ["screen-kawanggawa-history.png", kawangGawaHistory(paws)],
    ["screen-badges.png", badges(paws)],
    ["screen-shelter-volunteer.png", shelterVolunteer(paws)],
    ["screen-shelter-volunteer-create.png", shelterVolunteerCreate()],
    ["screen-shelter-volunteer-requests.png", shelterVolunteerRequests()],
    ["screen-shelter-volunteer-detail.png", shelterVolunteerDetail(paws)],
    ["screen-shelter-volunteer-calendar.png", shelterVolunteerCalendar(paws)],
    ["screen-kawanggawa-cancel.png", kawangGawaCancel(paws)],
    ["screen-kawanggawa-cancel-confirm.png", kawangGawaCancelConfirm(paws)],
    ["screen-kawanggawa-cancel-late.png", kawangGawaCancel(paws, { late: true })],
    ["screen-kawanggawa-cancel-confirm-late.png", kawangGawaCancelConfirm(paws, { late: true })],
    ["screen-shelter-volunteer-attendance.png", shelterVolunteerAttendance()],
    ["screen-shelter-volunteer-cancel.png", shelterVolunteerCancel(paws)],
    ["screen-shelter-volunteer-cancel-confirm.png", shelterVolunteerCancelConfirm(paws)],
    ["screen-shelter-volunteer-activity.png", shelterVolunteerActivity(paws)],
    ["screen-notifications.png", notifications(paws)],
    ["screen-pet-detail.png", petDetail(paws)],
    ["screen-adopt.png", adopt(paws)],
    ["screen-adopt-inquiries.png", adoptInquiries(paws)],
    ["screen-adopt-inquiry.png", adoptInquiry(paws)],
    ["screen-adopt-inquiry-sent.png", adoptInquirySent(paws)],
    ["screen-adopt-inquiry-detail.png", adoptInquiryDetail(paws)],
    ["screen-adopt-inquiry-declined.png", adoptInquiryDetail(paws, { state: "declined" })],
    ["screen-adopt-inquiry-adopted.png", adoptInquiryDetail(paws, { state: "adopted" })],
    ["screen-adopt-inquiry-withdrawn.png", adoptInquiryDetail(paws, { state: "withdrawn" })],
    ["screen-adopt-inquiry-withdraw-confirm.png", adoptInquiryWithdrawConfirm(paws)],
    ["screen-shelter-adoption-inquiries.png", shelterAdoptionInquiries(paws)],
    ["screen-shelter-adoption-inquiry-detail.png", shelterAdoptionInquiryDetail(paws)],
    ["screen-shelter-adoption-decline.png", shelterAdoptionDecline(paws)],
    ["screen-shelter-adoption-complete.png", shelterAdoptionComplete(paws)],
    ["screen-shelter-adoption-stages.png", shelterAdoptionStages(paws)],
    ["screen-shelter-adoption-history.png", shelterAdoptionHistory(paws)],
    ["screen-shelter-adoption-history-detail.png", shelterAdoptionHistoryDetail(paws)],
    ["screen-adopt-rescuer-gate.png", adoptRescuerGate(paws)],
    ["screen-adopt-application.png", adoptApplication(paws)],
    ["screen-shelter-notifications.png", shelterNotifications(paws)],
    ["screen-shelter-notifications-rescue.png", notifV2Screen("rescue", paws)],
    ["screen-kawanggawa-checkin.png", kawangGawaCheckin(paws)],
    ["screen-shelter-volunteer-edit.png", shelterVolunteerEdit(paws)],
  ];
  const fs = require("fs");
  for (const [name, inner, opts] of out) {
    const svg = (opts && opts.board) ? board(inner, opts.w, opts.h) : phone(inner);
    await sharp(Buffer.from(svg), { density: 144 }).png().toFile(path.join(DIR, name));
    // Also emit an editable SVG for Figma import (vector shapes + editable text).
    const svgName = name.replace(/\.png$/, ".svg");
    fs.writeFileSync(path.join(DIR, svgName), svg);
    console.log("wrote screens/user/" + name + " + " + svgName);
  }
})();
