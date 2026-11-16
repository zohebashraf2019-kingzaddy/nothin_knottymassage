/* Nothin' Knotty Massage LLC — site scripts (Nexora Digital) */
(function () {
  "use strict";

  /* ================= CONFIG — edit here ================= */
  const CONFIG = {
    bookingUrl: "https://nothinknottymassage.glossgenius.com/services",
    instagram: "https://www.instagram.com/nothin_knottymassage/",
    igHandle: "@nothin_knottymassage",
    phone: "+17754338937",
    phoneDisplay: "(775) 433-8937",
    address: "3400 Kauai Court, Suite 201, Reno, NV 89509",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=3400+Kauai+Court+201+Reno+NV+89509",
    mobileFee: 30,
    // Contact form: paste a Formspree / Web3Forms endpoint here to receive messages by email.
    // Leave blank and the form opens a pre-filled text message to Juliet instead.
    formEndpoint: "",
    timeZone: "America/Los_Angeles"
  };
  window.NK_CONFIG = CONFIG;

  // 0 = Sunday. Times in 24h decimal hours.
  const HOURS = [
    { day: "Sunday", open: null, close: null },
    { day: "Monday", open: 9.5, close: 14 },
    { day: "Tuesday", open: 9.5, close: 20 },
    { day: "Wednesday", open: 9.5, close: 20 },
    { day: "Thursday", open: 9, close: 14 },
    { day: "Friday", open: null, close: null },
    { day: "Saturday", open: 10, close: 14.5 }
  ];
  window.NK_HOURS = HOURS;

  const SERVICES = [
    { id: "swedish", name: "Swedish Massage", img: "images/svc-swedish.jpg",
      desc: "A gentle, relaxing massage using long, flowing strokes to ease tension, improve circulation and promote overall relaxation.",
      options: [[30, 45], [60, 90], [90, 135]], mobile: true },
    { id: "aromatherapy", name: "Relaxing Aromatherapy Massage", img: "images/svc-aromatherapy.jpg",
      desc: "A calming massage combined with therapeutic essential oils to reduce stress, relax the mind and body, and promote balance and well-being.",
      options: [[60, 100], [90, 145]], mobile: true },
    { id: "hotstone", name: "Hot Stone Relaxation Massage", img: "images/svc-hotstone.jpg",
      desc: "A deeply relaxing massage using warm smooth stones to ease muscle tension, improve circulation and promote deep relaxation.",
      options: [[60, 100], [90, 145]], mobile: true },
    { id: "prenatal", name: "Prenatal Massage", img: "images/svc-prenatal.jpg",
      desc: "A gentle, nurturing massage designed for expectant mothers to ease common pregnancy discomforts. Includes a soothing belly massage using Vitamin E oils to help hydrate the skin and support stretch mark prevention.",
      options: [[30, 45], [60, 90], [90, 135]], mobile: true },
    { id: "deeptissue", name: "Deep Tissue Hot Stone Massage", img: "images/svc-deeptissue.jpg",
      desc: "A therapeutic massage that targets deeper layers of muscle to relieve chronic tension and tightness, combined with the soothing benefits of warm hot stones to enhance relaxation and improve circulation.",
      options: [[60, 110], [90, 160]], mobile: true },
    { id: "pumpkin", name: "November Pumpkin Spice Massage", img: "images/svc-pumpkin.jpg", seasonal: "November only",
      desc: "Treat yourself to the cozy comforts of fall! A relaxing full-body massage with warm pumpkin spice massage oil, paired with a fragrant pumpkin spice foot exfoliation to leave your feet soft and refreshed.",
      options: [[60, 100]], mobile: false, months: [10] }
  ];
  window.NK_SERVICES = SERVICES;

  const ADDONS = [
    { id: "cupping", name: "Cupping", price: 30, ico: "🫙", desc: "Increases circulation, relieves muscle tension and promotes faster recovery." },
    { id: "aroma", name: "Aromatherapy", price: 25, ico: "🌿", desc: "Therapeutic essential oils to reduce stress and support better sleep." },
    { id: "biofreeze", name: "Bio-Freeze", price: 15, ico: "❄️", desc: "A cooling, soothing treatment for sore muscles and tension." },
    { id: "eyemask", name: "Lavender Steam Eye Mask", price: 10, ico: "😌", desc: "A warm lavender-infused eye mask for deeper relaxation." },
    { id: "scalp", name: "Tea-Tree Scalp Treatment", price: 15, ico: "🍃", desc: "Cleanses the scalp, eases itchiness and buildup for a relaxed mind." }
  ];
  window.NK_ADDONS = ADDONS;

  /* ================= helpers ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmtHour = (h) => {
    const hr = Math.floor(h), m = Math.round((h - hr) * 60);
    const ap = hr >= 12 ? "PM" : "AM";
    const h12 = ((hr + 11) % 12) + 1;
    return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""} ${ap}`;
  };
  window.NK_fmtHour = fmtHour;
  const nowInReno = () => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: CONFIG.timeZone, weekday: "short", hour: "numeric", minute: "numeric", hour12: false, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date());
    const g = (t) => parts.find((p) => p.type === t)?.value;
    const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { dow: map[g("weekday")], hour: (+g("hour") % 24) + (+g("minute")) / 60, y: +g("year"), m: +g("month") - 1, d: +g("day") };
  };
  window.NK_now = nowInReno;

  const ICON = {
    ig: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    msg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    cal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
  };
  window.NK_ICON = ICON;

  /* ================= header / footer ================= */
  function renderChrome() {
    const page = document.body.dataset.page || "home";
    const link = (href, label, key) => `<li><a href="${href}" class="${page === key ? "active" : ""}">${label}</a></li>`;
    const header = $("#site-header");
    if (header) {
      header.innerHTML = `
      <div class="topbar"><div class="container">
        <span id="open-status"><span class="dot"></span>Loading hours…</span>
        <span class="hide-sm">${ICON.pin.replace('width="18" height="18"', 'width="14" height="14" style="vertical-align:-2px"')} ${CONFIG.address}</span>
        <span><a href="tel:${CONFIG.phone}">${CONFIG.phoneDisplay}</a> · <a href="${CONFIG.instagram}" target="_blank" rel="noopener">${CONFIG.igHandle}</a></span>
      </div></div>
      <nav class="nav" aria-label="Main"><div class="container">
        <a class="brand" href="index.html" aria-label="Nothin' Knotty Massage home">
          <img src="images/logo.png" alt="Nothin' Knotty Massage logo" width="58" height="58">
          <span>Nothin' Knotty<small>Massage LLC</small></span>
        </a>
        <button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
        <ul class="nav-links">
          ${link("index.html", "Home", "home")}
          ${link("index.html#services", "Services", "services")}
          ${link("about.html", "About", "about")}
          ${link("index.html#hours", "Hours", "hours")}
          ${link("index.html#faq", "FAQ", "faq")}
          ${link("contact.html", "Contact", "contact")}
          <li><a href="booking.html" class="btn btn-primary btn-sm">Book Now</a></li>
        </ul>
      </div></nav>`;
      const t = $(".nav-toggle"), l = $(".nav-links");
      t.addEventListener("click", () => {
        const o = l.classList.toggle("open"); t.classList.toggle("open", o); t.setAttribute("aria-expanded", o);
      });
      $$(".nav-links a").forEach((a) => a.addEventListener("click", () => { l.classList.remove("open"); t.classList.remove("open"); }));
    }
    const footer = $("#site-footer");
    if (footer) {
      const hrs = HOURS.slice(1).concat(HOURS[0]).map((h) => `<li style="display:flex;justify-content:space-between;gap:1rem"><span>${h.day.slice(0, 3)}</span><span>${h.open == null ? "Closed" : fmtHour(h.open) + " – " + fmtHour(h.close)}</span></li>`).join("");
      footer.innerHTML = `<footer><div class="container">
        <div class="foot-grid">
          <div>
            <img class="foot-logo" src="images/logo.png" alt="Nothin' Knotty Massage">
            <p>Relax · Rebalance · Feel your best. Licensed massage therapy in Reno, Nevada — in studio or right at home. <em>Se habla español.</em></p>
            <div class="socials">
              <a href="${CONFIG.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.ig}</a>
              <a href="tel:${CONFIG.phone}" aria-label="Call">${ICON.phone}</a>
              <a href="sms:${CONFIG.phone}" aria-label="Text">${ICON.msg}</a>
              <a href="${CONFIG.bookingUrl}" target="_blank" rel="noopener" aria-label="Book online">${ICON.cal}</a>
            </div>
          </div>
          <div><h4>Explore</h4><ul>
            <li><a href="index.html#services">Massage Services</a></li>
            <li><a href="index.html#addons">Add-Ons</a></li>
            <li><a href="index.html#specials">Specials &amp; Giveaway</a></li>
            <li><a href="index.html#aromatherapy">Aromatherapy Guide</a></li>
            <li><a href="about.html">Meet Juliet</a></li>
            <li><a href="index.html#faq">FAQ</a></li>
          </ul></div>
          <div><h4>Hours</h4><ul>${hrs}</ul></div>
          <div><h4>Visit</h4><ul>
            <li><a href="${CONFIG.mapsUrl}" target="_blank" rel="noopener">${CONFIG.address}</a></li>
            <li><a href="tel:${CONFIG.phone}">${CONFIG.phoneDisplay}</a></li>
            <li><a href="${CONFIG.instagram}" target="_blank" rel="noopener">${CONFIG.igHandle}</a></li>
            <li style="margin-top:.8rem"><a class="btn btn-light btn-sm" href="booking.html">Book Your Massage</a></li>
          </ul></div>
        </div>
        <div class="foot-bottom">
          <span>© ${new Date().getFullYear()} Nothin' Knotty Massage LLC · Reno, NV</span>
          <span>Website by <a href="https://www.nexoradigital.live" target="_blank" rel="noopener">Nexora Digital</a></span>
        </div>
      </div></footer>
      <a class="btn btn-clay float-book" href="booking.html">Book Now</a>
      <div class="lightbox" role="dialog" aria-modal="true"><button aria-label="Close">×</button><img alt=""></div>`;
    }
  }

  /* ================= open/closed status ================= */
  function renderStatus() {
    const n = nowInReno(), today = HOURS[n.dow];
    const open = today.open != null && n.hour >= today.open && n.hour < today.close;
    let text;
    if (open) text = `Open now · until ${fmtHour(today.close)}`;
    else {
      let i = 0, d = n.dow;
      if (today.open != null && n.hour < today.open) text = `Closed · opens today at ${fmtHour(today.open)}`;
      else {
        do { d = (d + 1) % 7; i++; } while (HOURS[d].open == null && i < 7);
        text = `Closed · opens ${i === 1 ? "tomorrow" : HOURS[d].day} at ${fmtHour(HOURS[d].open)}`;
      }
    }
    const el = $("#open-status");
    if (el) el.innerHTML = `<span class="dot ${open ? "" : "closed"}"></span>${text}`;
    $$(".status-pill").forEach((p) => { p.classList.toggle("closed", !open); p.innerHTML = `<i></i>${text}`; });
    $$("[data-hours-table]").forEach((tb) => {
      tb.innerHTML = HOURS.slice(1).concat(HOURS[0]).map((h) => {
        const idx = HOURS.indexOf(h);
        return `<tr class="${idx === n.dow ? "today" : ""} ${h.open == null ? "closed" : ""}"><td>${h.day}${idx === n.dow ? " · Today" : ""}</td><td>${h.open == null ? "Closed" : fmtHour(h.open) + " – " + fmtHour(h.close)}</td></tr>`;
      }).join("");
    });
  }

  /* ================= services + add-ons ================= */
  function renderServices() {
    const grid = $("[data-services]");
    if (grid) {
      const n = nowInReno();
      grid.innerHTML = SERVICES.map((s) => {
        const available = !s.months || s.months.includes(n.m);
        const rows = s.options.map(([m, p]) => `<li><span>${m} min · in studio</span><b>$${p}</b></li>`).join("") +
          (s.mobile ? s.options.filter(([m]) => m >= 60).map(([m, p]) => `<li><span>${m} min · house call</span><b>$${p + CONFIG.mobileFee}</b></li>`).join("") : "");
        const from = Math.min(...s.options.map((o) => o[1]));
        return `<article class="svc reveal">
          ${s.seasonal ? `<span class="tag">${s.seasonal}</span>` : s.id === "prenatal" ? `<span class="tag green">Mamas-to-be</span>` : ""}
          <div class="svc-img"><img src="${s.img}" alt="${s.name} illustration" loading="lazy"></div>
          <div class="svc-body">
            <h3>${s.name}</h3>
            <p>${s.desc}</p>
            <ul class="price-table">${rows}</ul>
            ${from >= 100 ? `<p class="bnpl">Pay over time with Affirm, Klarna or Afterpay</p>` : ""}
            ${available ? `<a class="btn btn-ghost btn-sm" href="booking.html?service=${s.id}">Book this</a>` : `<span class="btn btn-ghost btn-sm" style="opacity:.5;cursor:default">Returns next November</span>`}
          </div>
        </article>`;
      }).join("");
    }
    const ad = $("[data-addons]");
    if (ad) ad.innerHTML = ADDONS.map((a) => `<div class="addon reveal"><div class="ico">${a.ico}</div><h4>${a.name}</h4><div class="amt">+$${a.price}</div><p>${a.desc}</p></div>`).join("");
  }

  /* ================= aromatherapy explorer ================= */
  const OILS = [
    ["💜", "Lavender", "Stressed", "Helps promote relaxation, calm the mind, reduce anxiety and support better sleep."],
    ["🌱", "Tea Tree", "Purification", "Known for its cleansing and immune-supporting properties. Helps refresh the mind and body."],
    ["🍋", "Lemon", "Energy boost", "Helps uplift mood, increase focus, and promote mental clarity."],
    ["🪵", "Frankincense", "Feel grounded", "Helps reduce stress, promote deeper breathing, and support a sense of calm and balance."],
    ["🌲", "Cedarwood", "Grounding", "Helps promote relaxation, reduce tension, and create a sense of stability and calm."],
    ["🌿", "Peppermint", "Pain relief", "Helps ease muscle tension, reduce headaches, and promote a cooling, refreshing sensation."],
    ["🌾", "Rosemary", "Focus", "Helps improve concentration, mental clarity, and circulation. Energizing and revitalizing."],
    ["🍊", "Sweet Orange", "Mood boost", "Helps reduce stress, uplift your mood, and create a sense of happiness and warmth."],
    ["🎋", "Lemongrass", "Refreshment", "Helps reduce stress, increase mental clarity, and promote an energizing, clean, uplifting feel."],
    ["🍃", "Eucalyptus", "Respiratory support", "Helps clear the mind, support easier breathing, and promote a refreshing, invigorating sensation."]
  ];
  function renderOils() {
    const wrap = $("[data-oils]"), det = $("[data-oil-detail]");
    if (!wrap || !det) return;
    wrap.innerHTML = OILS.map((o, i) => `<button class="oil" data-i="${i}"><span class="em">${o[0]}</span><h4>${o[1]}</h4><small>${o[2]}</small></button>`).join("");
    const show = (i) => {
      const o = OILS[i];
      $$(".oil", wrap).forEach((b) => b.classList.toggle("active", +b.dataset.i === i));
      det.innerHTML = `<span class="em">${o[0]}</span><div><h3>${o[1]}</h3><p><strong>Best choice if you need: ${o[2].toLowerCase()}.</strong> ${o[3]}</p></div><a class="btn btn-primary btn-sm" href="booking.html?service=aromatherapy&oil=${encodeURIComponent(o[1])}">Book with ${o[1]}</a>`;
    };
    wrap.addEventListener("click", (e) => { const b = e.target.closest(".oil"); if (b) show(+b.dataset.i); });
    show(0);
  }

  /* ================= giveaway countdown ================= */
  function renderCountdown() {
    $$("[data-countdown]").forEach((el) => {
      const end = new Date(el.dataset.countdown).getTime();
      const tick = () => {
        let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
        const d = Math.floor(s / 86400); s %= 86400;
        const h = Math.floor(s / 3600); s %= 3600;
        const m = Math.floor(s / 60);
        el.innerHTML = [[d, "Days"], [h, "Hrs"], [m, "Min"]].map(([v, l]) => `<div><b>${v}</b><small>${l}</small></div>`).join("");
      };
      tick(); setInterval(tick, 30000);
    });
  }

  /* ================= contact form ================= */
  function initContact() {
    const form = $("#contact-form");
    if (!form) return;
    $$(".chip", form).forEach((c) => c.addEventListener("click", () => {
      c.classList.toggle("on");
      $("#interest").value = $$(".chip.on", form).map((x) => x.textContent).join(", ");
    }));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.website && form.website.value) return; // honeypot
      const data = Object.fromEntries(new FormData(form).entries());
      const msg = $(".form-msg", form);
      const body = `Hi Juliet! It's ${data.name}.\n${data.interest ? "Interested in: " + data.interest + "\n" : ""}${data.preferred ? "Preferred day/time: " + data.preferred + "\n" : ""}${data.message}\n\nReply to: ${data.phone || ""} ${data.email || ""}`.trim();
      if (CONFIG.formEndpoint) {
        try {
          const r = await fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...data, _subject: "New website message — Nothin' Knotty Massage" }) });
          if (!r.ok) throw new Error();
          msg.textContent = "Thank you! Your message was sent — Juliet will get back to you soon. 🤎";
          msg.classList.add("show"); form.reset(); $$(".chip.on", form).forEach((c) => c.classList.remove("on"));
          return;
        } catch (err) { /* fall through to SMS */ }
      }
      msg.innerHTML = `Opening your messages app so you can send this straight to Juliet… If nothing opens, text <a href="sms:${CONFIG.phone}">${CONFIG.phoneDisplay}</a> or DM <a href="${CONFIG.instagram}" target="_blank" rel="noopener">${CONFIG.igHandle}</a>.`;
      msg.classList.add("show");
      window.location.href = `sms:${CONFIG.phone}${/iPhone|iPad|Mac/i.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(body)}`;
    });
  }

  /* ================= lightbox ================= */
  function initLightbox() {
    const lb = $(".lightbox");
    if (!lb) return;
    $$("[data-lightbox]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault(); $("img", lb).src = a.getAttribute("href"); $("img", lb).alt = a.dataset.lightbox || ""; lb.classList.add("open");
    }));
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "BUTTON") lb.classList.remove("open"); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("open"); });
  }

  /* ================= reveal ================= */
  function initReveal() {
    const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderChrome();
    renderServices();
    renderStatus();
    setInterval(renderStatus, 60000);
    renderOils();
    renderCountdown();
    initContact();
    initLightbox();
    initReveal();
    $$("[data-booking-url]").forEach((a) => (a.href = CONFIG.bookingUrl));
    $$("[data-ig-url]").forEach((a) => (a.href = CONFIG.instagram));
  });
})();
