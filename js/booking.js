/* Nothin' Knotty Massage — booking planner.
   Lets clients pick service, length, location, add-ons, date & time against real business hours,
   then hands off to the secure GlossGenius booking page (deposit/payment + live availability). */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const C = window.NK_CONFIG, HOURS = window.NK_HOURS, SERVICES = window.NK_SERVICES, ADDONS = window.NK_ADDONS, fmt = window.NK_fmtHour;
    const $ = (s) => document.querySelector(s);
    const params = new URLSearchParams(location.search);
    const now = window.NK_now();
    const todayDate = new Date(now.y, now.m, now.d);

    const state = {
      service: SERVICES.find((s) => s.id === params.get("service")) || null,
      duration: null, location: "studio", addons: new Set(), date: null, time: null,
      oil: params.get("oil") || "", view: new Date(now.y, now.m, 1)
    };

    const svcAvailable = (s, d = todayDate) => !s.months || s.months.includes(d.getMonth());

    /* ---- Step 1: services ---- */
    function drawServices() {
      $("#opt-services").innerHTML = SERVICES.map((s) => {
        const from = Math.min(...s.options.map((o) => o[1]));
        const ok = svcAvailable(s);
        return `<button class="opt ${state.service === s ? "on" : ""}" data-id="${s.id}" ${ok ? "" : "disabled"}>
          <b>${s.name}</b><small>From $${from} · ${s.options.map((o) => o[0]).join("/")} min${s.seasonal ? " · " + s.seasonal : ""}</small></button>`;
      }).join("");
    }
    $("#opt-services").addEventListener("click", (e) => {
      const b = e.target.closest(".opt"); if (!b || b.disabled) return;
      state.service = SERVICES.find((s) => s.id === b.dataset.id);
      state.duration = state.service.options.length === 1 ? state.service.options[0] : null;
      if (!state.service.mobile) state.location = "studio";
      state.time = null;
      drawAll();
    });

    /* ---- Step 2: length & location ---- */
    function drawLength() {
      const s = state.service, wrap = $("#opt-length"), loc = $("#opt-location");
      if (!s) { wrap.innerHTML = `<p class="slots-empty">Choose a service first.</p>`; loc.innerHTML = ""; return; }
      wrap.innerHTML = s.options.map(([m, p]) => `<button class="opt ${state.duration && state.duration[0] === m ? "on" : ""}" data-m="${m}"><b>${m} minutes</b><small>$${p} in studio</small></button>`).join("");
      const canMobile = s.mobile && (!state.duration || state.duration[0] >= 60);
      if (!canMobile && state.location === "mobile") state.location = "studio";
      loc.innerHTML = `
        <button class="opt ${state.location === "studio" ? "on" : ""}" data-loc="studio"><b>In Studio</b><small>3400 Kauai Ct, Suite 201</small></button>
        <button class="opt ${state.location === "mobile" ? "on" : ""}" data-loc="mobile" ${canMobile ? "" : "disabled"}><b>House Call</b><small>${canMobile ? "+$" + C.mobileFee + " · I come to you" : "Not available for this option"}</small></button>`;
    }
    $("#opt-length").addEventListener("click", (e) => {
      const b = e.target.closest(".opt"); if (!b) return;
      state.duration = state.service.options.find((o) => o[0] === +b.dataset.m); state.time = null; drawAll();
    });
    $("#opt-location").addEventListener("click", (e) => {
      const b = e.target.closest(".opt"); if (!b || b.disabled) return;
      state.location = b.dataset.loc; drawAll();
    });

    /* ---- Step 3: add-ons ---- */
    function drawAddons() {
      $("#opt-addons").innerHTML = ADDONS.map((a) => `<button class="opt ${state.addons.has(a.id) ? "on" : ""}" data-id="${a.id}"><b>${a.name}</b><small>+$${a.price}</small></button>`).join("");
    }
    $("#opt-addons").addEventListener("click", (e) => {
      const b = e.target.closest(".opt"); if (!b) return;
      state.addons.has(b.dataset.id) ? state.addons.delete(b.dataset.id) : state.addons.add(b.dataset.id); drawAll();
    });

    /* ---- Step 4: calendar ---- */
    const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
    const maxDate = new Date(now.y, now.m + 3, now.d);
    function dayOpen(d) {
      if (d < todayDate || d > maxDate) return false;
      const h = HOURS[d.getDay()];
      if (h.open == null) return false;
      if (state.service && !svcAvailable(state.service, d)) return false;
      if (sameDay(d, todayDate) && slotsFor(d).length === 0) return false;
      return true;
    }
    function slotsFor(d) {
      const h = HOURS[d.getDay()]; if (h.open == null) return [];
      const len = (state.duration ? state.duration[0] : 60) / 60;
      const out = [];
      for (let t = h.open; t + len <= h.close + 1e-9; t += 0.5) {
        if (sameDay(d, todayDate) && t < now.hour + 2) continue; // 2h lead time
        out.push(t);
      }
      return out;
    }
    function drawCalendar() {
      const v = state.view, y = v.getFullYear(), m = v.getMonth();
      $("#cal-title").textContent = v.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      $("#cal-prev").disabled = y === now.y && m === now.m;
      $("#cal-next").disabled = new Date(y, m + 1, 1) > maxDate;
      const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
      let html = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => `<div class="dow">${d}</div>`).join("");
      for (let i = 0; i < first; i++) html += "<div></div>";
      for (let d = 1; d <= days; d++) {
        const dt = new Date(y, m, d);
        const cls = [sameDay(dt, todayDate) ? "today" : "", sameDay(dt, state.date) ? "sel" : ""].join(" ");
        html += `<button class="${cls}" data-d="${d}" ${dayOpen(dt) ? "" : "disabled"} aria-label="${dt.toDateString()}">${d}</button>`;
      }
      $("#cal-grid").innerHTML = html;
      const sl = $("#slots");
      if (!state.date) { sl.innerHTML = `<p class="slots-empty">Pick a date to see open start times. Closed Fridays &amp; Sundays.</p>`; return; }
      const slots = slotsFor(state.date);
      sl.innerHTML = slots.length
        ? `<div class="slots">${slots.map((t) => `<button data-t="${t}" class="${state.time === t ? "on" : ""}">${fmt(t)}</button>`).join("")}</div>`
        : `<p class="slots-empty">No start times left that day for this length — try another date.</p>`;
    }
    $("#cal-prev").addEventListener("click", () => { state.view = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1); drawCalendar(); });
    $("#cal-next").addEventListener("click", () => { state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1); drawCalendar(); });
    $("#cal-grid").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-d]"); if (!b || b.disabled) return;
      state.date = new Date(state.view.getFullYear(), state.view.getMonth(), +b.dataset.d); state.time = null; drawAll();
    });
    $("#slots").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-t]"); if (!b) return;
      state.time = +b.dataset.t; drawAll();
    });

    /* ---- Summary ---- */
    function drawSummary() {
      const s = state.service;
      const base = state.duration ? state.duration[1] : 0;
      const mob = state.location === "mobile" ? C.mobileFee : 0;
      const add = ADDONS.filter((a) => state.addons.has(a.id));
      const total = base + mob + add.reduce((t, a) => t + a.price, 0);
      const row = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
      $("#summary-list").innerHTML =
        row("Service", s ? s.name : "—") +
        row("Length", state.duration ? `${state.duration[0]} min · $${base}` : "—") +
        row("Location", state.location === "mobile" ? `House call · +$${mob}` : "In studio") +
        row("Add-ons", add.length ? add.map((a) => `${a.name} (+$${a.price})`).join("<br>") : "None") +
        (state.oil ? row("Oil preference", state.oil) : "") +
        row("Date", state.date ? state.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—") +
        row("Time", state.time != null ? fmt(state.time) : "—");
      $("#summary-total").textContent = `$${total}`;
      const ready = s && state.duration && state.date && state.time != null;
      $("#go-book").classList.toggle("is-disabled", !ready);
      $("#go-book").style.opacity = ready ? 1 : 0.55;
      $("#summary-hint").textContent = ready ? "" : "Choose a service, length, date and time to continue.";
      // Pre-filled text message as a backup way to request this exact slot
      const text = ready
        ? `Hi Juliet! I'd like to book: ${s.name}, ${state.duration[0]} min, ${state.location === "mobile" ? "house call" : "in studio"}${add.length ? ", add-ons: " + add.map((a) => a.name).join(", ") : ""}${state.oil ? ", oil: " + state.oil : ""} on ${state.date.toDateString()} at ${fmt(state.time)}. Est. total $${total}.`
        : "Hi Juliet! I'd like to book a massage.";
      $("#text-book").href = `sms:${C.phone}${/iPhone|iPad|Mac/i.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(text)}`;
      try { sessionStorage.setItem("nk-booking-note", text); } catch (e) {}
    }
    $("#go-book").addEventListener("click", (e) => {
      if ($("#go-book").classList.contains("is-disabled")) { e.preventDefault(); $("#summary-hint").textContent = "Almost there — finish the steps on the left first."; return; }
      $("#go-book").href = C.bookingUrl;
    });

    function drawAll() { drawServices(); drawLength(); drawAddons(); drawCalendar(); drawSummary(); }
    if (state.service && state.service.options.length === 1) state.duration = state.service.options[0];
    if (state.oil && state.service && state.service.id !== "aromatherapy") state.addons.add("aroma");
    drawAll();
  });
})();
