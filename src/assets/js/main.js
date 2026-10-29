/* Costa Rica Bluewater — progressive enhancement. No dependencies. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);
  const month = new Date().getMonth();

  // ── Header state ──────────────────────────────────────────────────────────
  const hdr = $('[data-hdr]');
  const onScroll = () => hdr && hdr.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mega menus: keep aria-expanded in sync, close on Escape
  $$('.has-mega').forEach(li => {
    const a = li.querySelector('.nav__link');
    const set = v => a.setAttribute('aria-expanded', String(v));
    li.addEventListener('mouseenter', () => set(true));
    li.addEventListener('mouseleave', () => { set(false); li.classList.remove('is-open'); });
    li.addEventListener('focusin', () => set(true));
    li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) set(false); });
    li.addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); a.focus(); li.classList.remove('is-open'); a.blur(); } });
  });

  // WhatsApp button: briefly reveal its label on the home page
  const wa = $('.wa-float');
  if (wa && document.body.classList.contains('is-home') && matchMedia('(hover: hover)').matches) {
    setTimeout(() => wa.classList.add('is-peek'), 1800);
    setTimeout(() => wa.classList.remove('is-peek'), 7500);
  }

  // ── Drawer ────────────────────────────────────────────────────────────────
  const drawer = $('#drawer'), burger = $('[data-drawer-open]');
  const openDrawer = () => { drawer.hidden = false; requestAnimationFrame(() => drawer.classList.add('is-open')); burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; $('.drawer__x', drawer).focus(); };
  const closeDrawer = () => { drawer.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; setTimeout(() => { drawer.hidden = true; }, 380); burger.focus(); };
  burger && burger.addEventListener('click', openDrawer);
  $$('[data-drawer-close]').forEach(b => b.addEventListener('click', closeDrawer));
  addEventListener('keydown', e => { if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer(); });

  // ── Reveal on scroll ──────────────────────────────────────────────────────
  const reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 70 + 'ms';
      el.classList.add('is-in'); io.unobserve(el);
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('is-in'));

  // ── Counters ──────────────────────────────────────────────────────────────
  $$('[data-count]').forEach(el => {
    const end = Number(el.dataset.count); if (!end || reduce) return;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const tick = t => { const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    io.observe(el);
  });

  // ── Seasonal highlights (client month) ────────────────────────────────────
  const now = $('[data-now]');
  if (now) { try { const m = JSON.parse(now.dataset.now)[month]; $('[data-now-text]', now).textContent = `Biting in ${m.m}: ${m.s}`; } catch (e) { /* keep server text */ } }
  $$('[data-season-table]').forEach(t => $$(`[data-month="${month}"]`, t).forEach(c => c.classList.add('is-now')));
  const mc = $(`[data-month-card="${month}"]`); mc && mc.classList.add('is-now');

  // ── Map tooltips ──────────────────────────────────────────────────────────
  $$('[data-map]').forEach(map => {
    const tip = $('.crmap__tip', map); if (!tip) return;
    const show = pin => {
      const r = pin.querySelector('.pin__dot').getBoundingClientRect(), m = map.getBoundingClientRect();
      tip.querySelector('img').src = pin.dataset.img;
      tip.querySelector('strong').textContent = pin.dataset.name;
      tip.querySelector('span').textContent = pin.dataset.region;
      tip.querySelector('em').textContent = pin.dataset.peak;
      let x = r.left + r.width / 2 - m.left; const half = 150;
      x = Math.max(half - 10, Math.min(m.width - half + 10, x));
      tip.style.left = x + 'px'; tip.style.top = (r.top - m.top) + 'px'; tip.hidden = false;
    };
    const hide = () => { tip.hidden = true; };
    if (matchMedia('(hover: hover)').matches && !map.classList.contains('crmap--compact')) {
      $$('.pin', map).forEach(p => { p.addEventListener('mouseenter', () => show(p)); p.addEventListener('mouseleave', hide); p.addEventListener('focus', () => show(p)); p.addEventListener('blur', hide); });
    }
    // Region list ↔ pin highlight
    const scope = map.closest('section') || document;
    $$('[data-pin-link]', scope).forEach(a => {
      const pin = $(`[data-pin="${a.dataset.pinLink}"]`, map); if (!pin) return;
      a.addEventListener('mouseenter', () => { pin.classList.add('is-hot'); });
      a.addEventListener('mouseleave', () => { pin.classList.remove('is-hot'); });
      pin.addEventListener('mouseenter', () => a.classList.add('is-hot'));
      pin.addEventListener('mouseleave', () => a.classList.remove('is-hot'));
    });
  });

  // ── Species rail ──────────────────────────────────────────────────────────
  $$('[data-rail]').forEach(rail => {
    const track = $('.rail__track', rail), step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 20;
    $('[data-rail-prev]', rail)?.addEventListener('click', () => track.scrollBy({ left: -step() * 2, behavior: 'smooth' }));
    $('[data-rail-next]', rail)?.addEventListener('click', () => track.scrollBy({ left: step() * 2, behavior: 'smooth' }));
  });

  // ── Fleet filters ─────────────────────────────────────────────────────────
  const filters = $('[data-filters]');
  if (filters) {
    const grid = $('[data-boat-grid]'), cards = $$('[data-boat]', grid), count = $('[data-count]', filters), empty = $('[data-empty]');
    const order = cards.slice();
    ['dest', 'type', 'anglers'].forEach(k => { if (params.get(k) && filters.elements[k]) filters.elements[k].value = params.get(k); });
    const apply = () => {
      const f = Object.fromEntries(new FormData(filters));
      const [lo, hi] = (f.size || '0-999').split('-').map(Number);
      let n = 0;
      cards.forEach(c => {
        const ok = (!f.dest || c.dataset.dest === f.dest) && (!f.type || c.dataset.tags.split(' ').includes(f.type)) &&
          (!f.anglers || Number(c.dataset.anglers) >= Number(f.anglers)) && (Number(c.dataset.len) >= lo && Number(c.dataset.len) <= hi);
        c.classList.toggle('is-hidden', !ok); if (ok) { n++; c.classList.add('is-in'); }
      });
      const sorted = order.slice();
      if (f.sort === 'price-asc') sorted.sort((a, b) => a.dataset.price - b.dataset.price);
      if (f.sort === 'price-desc') sorted.sort((a, b) => b.dataset.price - a.dataset.price);
      if (f.sort === 'len-desc') sorted.sort((a, b) => b.dataset.len - a.dataset.len);
      sorted.forEach(c => grid.appendChild(c));
      count.textContent = n; empty.hidden = n > 0;
      const q = new URLSearchParams(); ['dest', 'type', 'anglers'].forEach(k => f[k] && q.set(k, f[k]));
      history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
    };
    filters.addEventListener('change', apply);
    filters.addEventListener('reset', () => setTimeout(apply));
    filters.addEventListener('submit', e => e.preventDefault());
    apply();
  }

  // ── Booking forms ─────────────────────────────────────────────────────────
  const pad = n => String(n).padStart(2, '0');
  const today = new Date(); const iso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  $$('input[type="date"]').forEach(i => { i.min = iso; });
  $$('[data-booking]').forEach(form => {
    const el = n => form.elements[n];
    // Prefill from the URL (?dest=&boat=&trip=&date=&anglers=)
    if (params.get('dest') && el('destination')) el('destination').value = params.get('dest');
    if (params.get('boat') && el('boat')) el('boat').value = params.get('boat');
    if (params.get('trip') && el('trip')) el('trip').value = params.get('trip');
    if (params.get('type') && el('trip')) el('trip').value = params.get('type');
    if (params.get('date') && el('date') && params.get('date') >= iso) el('date').value = params.get('date');
    if (params.get('anglers') && el('anglers')) el('anglers').value = params.get('anglers');
    // Keep boat list in sync with destination
    const syncBoats = () => {
      const d = el('destination').value;
      $$('option[data-dest]', el('boat')).forEach(o => { o.hidden = !!d && o.dataset.dest !== d; });
      const sel = el('boat').selectedOptions[0];
      if (sel && sel.dataset.dest && d && sel.dataset.dest !== d) el('boat').value = '';
    };
    el('destination').addEventListener('change', syncBoats);
    el('boat').addEventListener('change', () => { const o = el('boat').selectedOptions[0]; if (o && o.dataset.dest) el('destination').value = o.dataset.dest; });
    syncBoats();

    form.addEventListener('submit', async e => {
      e.preventDefault();
      let bad = null;
      $$('[required]', form).forEach(i => { const ok = i.value.trim() && (i.type !== 'email' || /.+@.+\..+/.test(i.value)); i.closest('.field')?.classList.toggle('is-invalid', !ok); if (!ok && !bad) bad = i; });
      if (bad) { bad.focus(); return; }
      const data = Object.fromEntries(new FormData(form));
      const label = n => { const s = el(n); return s && s.selectedOptions ? s.selectedOptions[0]?.textContent.trim() : data[n]; };
      const lines = [
        `Hi ${window.SITE.name}! I'd like to check availability:`,
        `• Destination: ${label('destination')}`,
        data.boat ? `• Boat: ${label('boat')}` : '• Boat: please recommend',
        data.trip ? `• Trip: ${label('trip')}` : null,
        data.duration ? `• Duration: ${label('duration')}` : null,
        `• Date: ${data.date}${data.flexible ? ' (flexible)' : ''}`,
        `• Anglers: ${data.anglers}`,
        `• Name: ${data.name}`, `• Email: ${data.email}`, data.phone ? `• Phone: ${data.phone}` : null,
        data.message ? `• Notes: ${data.message}` : null,
      ].filter(Boolean).join('\n');
      const done = $('.bform__done', form), btn = $('button[type="submit"]', form);
      $('[data-done-wa]', form).href = `https://wa.me/${window.SITE.whatsapp}?text=${encodeURIComponent(lines)}`;
      $('[data-done-mail]', form).href = `mailto:${window.SITE.email}?subject=${encodeURIComponent('Charter request — ' + label('destination') + ' ' + data.date)}&body=${encodeURIComponent(lines)}`;
      if (window.SITE.formEndpoint) {
        btn.disabled = true;
        try {
          const r = await fetch(window.SITE.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...data, summary: lines, page: location.href }) });
          if (!r.ok) throw new Error(r.status);
          $('h3', done).textContent = 'Request received!';
          $('[data-done-text]', done).textContent = 'Thanks! A local expert will reply by email or WhatsApp within a few hours. Want a faster answer? Message us directly:';
        } catch (err) { $('[data-done-text]', done).textContent = 'We couldn’t submit the form automatically — please send it in one tap:'; }
        btn.disabled = false;
      }
      done.hidden = false; form.classList.add('is-done');
      form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
    $$('input, select', form).forEach(i => i.addEventListener('input', () => i.closest('.field')?.classList.remove('is-invalid')));
  });

  // ── Newsletter ────────────────────────────────────────────────────────────
  $$('[data-newsletter]').forEach(f => f.addEventListener('submit', async e => {
    e.preventDefault();
    const email = f.elements.email.value.trim(), msg = $('.ftr__newsmsg', f);
    if (!/.+@.+\..+/.test(email)) { msg.textContent = 'Please enter a valid email.'; return; }
    if (window.SITE.formEndpoint) {
      try { await fetch(window.SITE.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, type: 'newsletter' }) }); msg.textContent = 'You’re in! Watch your inbox for the next fishing report.'; f.reset(); return; } catch (err) { /* fall through to email */ }
    }
    location.href = `mailto:${window.SITE.email}?subject=${encodeURIComponent('Subscribe me to the fishing report')}&body=${encodeURIComponent('Please add ' + email + ' to the monthly Costa Rica fishing report.')}`;
    msg.textContent = 'Opening your email app to confirm your subscription…';
  }));

  // ── Lightbox ──────────────────────────────────────────────────────────────
  let lb, items = [], idx = 0;
  const lbShow = () => { const a = items[idx]; lb.querySelector('img').src = a.href; lb.querySelector('img').alt = a.dataset.caption || ''; lb.querySelector('figcaption').textContent = a.dataset.caption || ''; };
  const lbClose = () => { lb.classList.remove('is-open'); document.body.style.overflow = ''; setTimeout(() => lb.remove(), 300); lb = null; };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-lightbox]'); if (!a) return;
    e.preventDefault();
    const group = a.closest('[data-lightbox-group]');
    items = (group ? $$('[data-lightbox]', group) : [a]).filter(x => !x.hidden); idx = items.indexOf(a);
    lb = document.createElement('div'); lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
    const ico = n => `<svg class="ico" aria-hidden="true"><use href="#i-${n}"/></svg>`;
    lb.innerHTML = `<figure><img alt=""><figcaption></figcaption></figure><button type="button" data-lb-close aria-label="Close">${ico('close')}</button>${items.length > 1 ? `<button type="button" data-lb-prev aria-label="Previous photo">${ico('arrow')}</button><button type="button" data-lb-next aria-label="Next photo">${ico('arrow')}</button>` : ''}`;
    document.body.appendChild(lb); document.body.style.overflow = 'hidden'; lbShow();
    requestAnimationFrame(() => lb.classList.add('is-open'));
    lb.addEventListener('click', ev => {
      if (ev.target.closest('[data-lb-close]') || ev.target === lb) lbClose();
      else if (ev.target.closest('[data-lb-prev]')) { idx = (idx - 1 + items.length) % items.length; lbShow(); }
      else if (ev.target.closest('[data-lb-next]')) { idx = (idx + 1) % items.length; lbShow(); }
    });
    lb.querySelector('[data-lb-close]').focus();
  });
  addEventListener('keydown', e => {
    if (!lb) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft' && items.length > 1) { idx = (idx - 1 + items.length) % items.length; lbShow(); }
    if (e.key === 'ArrowRight' && items.length > 1) { idx = (idx + 1) % items.length; lbShow(); }
  });

  // ── Gallery tabs ──────────────────────────────────────────────────────────
  $$('[data-tabs]').forEach(tabs => {
    const grid = $('[data-masonry]');
    tabs.addEventListener('click', e => {
      const b = e.target.closest('[data-tab]'); if (!b) return;
      $$('[data-tab]', tabs).forEach(x => x.setAttribute('aria-selected', String(x === b)));
      $$('[data-group]', grid).forEach(it => { it.hidden = b.dataset.tab !== 'all' && it.dataset.group !== b.dataset.tab; });
    });
  });

  // ── Article TOC highlighting ──────────────────────────────────────────────
  const tocLinks = $$('.article__toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(tocLinks.map(a => [document.getElementById(a.hash.slice(1)), a]));
    const io = new IntersectionObserver(ens => ens.forEach(en => { if (en.isIntersecting) { tocLinks.forEach(a => a.classList.remove('is-active')); map.get(en.target)?.classList.add('is-active'); } }), { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((a, h) => h && io.observe(h));
  }
})();
