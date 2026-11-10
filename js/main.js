/* Materiales Lynch — comportamiento del sitio.
   Todo lo que hay que completar del cliente está en CONFIG. */
(() => {
  'use strict';

  const CONFIG = {
    whatsapp: '5491152491524',          // formato internacional, sin + ni espacios
    direccion: '',                      // ej: 'Av. San Martín 1234, Cañuelas'
    horarios: '',                       // ej: 'Lun a Vie 7 a 17 · Sáb 7 a 13'
    mapaEmbed: '',                      // URL "Insertar mapa" de Google Maps (src del iframe)
    galeria: [                          // sumar fotos reales: { src:'img/x.jpg', titulo:'Pozo de pileta' }
      { src: 'img/camion.jpg', titulo: 'Entrega con hidrogrúa' },
      { titulo: 'Movimiento de suelo' },
      { titulo: 'Pozo de pileta' },
      { titulo: 'Limpieza de terreno' },
      { titulo: 'Materiales' },
      { titulo: 'Obras entregadas' }
    ]
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waLink = (txt) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`;

  /* --- enlaces de WhatsApp --- */
  $$('[data-wa]').forEach(a => {
    a.href = waLink(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* --- datos del cliente --- */
  if (CONFIG.direccion) { $('#cfgDir').textContent = CONFIG.direccion; $('#cfgDir').nextElementSibling.remove(); }
  if (CONFIG.horarios) { $('#cfgHor').textContent = CONFIG.horarios; $('#cfgHor').nextElementSibling.remove(); }
  if (CONFIG.mapaEmbed) {
    const m = $('#map');
    m.innerHTML = '';
    m.style.cssText = 'padding:0;border:0;background:none';
    const f = document.createElement('iframe');
    f.src = CONFIG.mapaEmbed; f.loading = 'lazy'; f.title = 'Ubicación de Materiales Lynch';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    m.appendChild(f);
  }
  $('#year').textContent = new Date().getFullYear();

  /* --- menú móvil --- */
  const burger = $('#burger'), nav = $('#nav');
  const cerrar = () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const abierto = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', abierto);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', cerrar));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { cerrar(); cerrarLb(); } });

  /* --- aparición al hacer scroll (con escalonado en grupos) --- */
  const grupos = new Set($$('.reveal').map(el => el.parentElement));
  grupos.forEach(g => $$(':scope > .reveal', g).forEach((el, i) => el.style.setProperty('--d', (i * 0.09) + 's')));
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* --- efecto "ola" al tocar botones --- */
  $$('.btn').forEach(b => b.addEventListener('pointerdown', e => {
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }));

  /* --- inclinación 3D de tarjetas (solo con mouse) --- */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('[data-tilt]').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(700px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-4px)`;
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  }

  /* --- scroll: progreso, cabecera, camión y menú activo --- */
  const barra = $('.progress'), top = $('#top'), ruta = $('#ruta'), camion = $('.truck');
  const links = $$('.nav a');
  const secciones = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  let tick = false;
  const alScroll = () => {
    tick = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    barra.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    top.classList.toggle('is-stuck', y > 10);

    if (ruta && camion && !reduce) {
      const r = ruta.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (r.top + r.height) / (innerHeight + r.height)));
      const tx = -320 + p * (ruta.clientWidth + 360);
      camion.style.setProperty('--tx', tx.toFixed(1) + 'px');
      camion.style.setProperty('--run', p > 0 && p < 1 ? 'running' : 'paused');
    }
    const ref = y + innerHeight * .35;
    let actual = null;
    secciones.forEach(s => { if (s.offsetTop <= ref) actual = s.id; });
    if (max > 0 && y >= max - 6) actual = secciones[secciones.length - 1].id;
    links.forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + actual));
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(alScroll); } }, { passive: true });
  addEventListener('resize', alScroll);
  alScroll();

  /* --- galería y visor --- */
  const gal = $('#gallery');
  const lb = document.createElement('div');
  lb.className = 'lb'; lb.innerHTML = '<button aria-label="Cerrar">×</button><img alt="">';
  document.body.appendChild(lb);
  const lbImg = $('img', lb);
  function cerrarLb() { lb.classList.remove('on'); }
  lb.addEventListener('click', cerrarLb);

  CONFIG.galeria.forEach((it, i) => {
    const el = document.createElement(it.src ? 'button' : 'div');
    el.className = 'shot reveal' + (it.src ? '' : ' shot--empty');
    if (it.src) {
      el.type = 'button';
      el.setAttribute('aria-label', 'Ver foto: ' + it.titulo);
      el.innerHTML = `<img src="${it.src}" alt="${it.titulo}" loading="lazy"><span class="shot__cap">${it.titulo}</span>`;
      el.addEventListener('click', () => { lbImg.src = it.src; lbImg.alt = it.titulo; lb.classList.add('on'); });
    } else {
      el.innerHTML = `<div><b>${it.titulo}</b><small>Foto próximamente</small></div>`;
    }
    el.style.setProperty('--d', (i * 0.08) + 's');
    gal.appendChild(el);
  });
  // los .reveal creados acá también tienen que animarse
  if ('IntersectionObserver' in window && !reduce) {
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); }
    }), { threshold: .1 });
    $$('.reveal', gal).forEach(el => io2.observe(el));
  } else {
    $$('.reveal', gal).forEach(el => el.classList.add('in'));
  }

  /* --- formulario de presupuesto → WhatsApp --- */
  const form = $('#quoteForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    let ok = true;
    ['nombre', 'servicio'].forEach(k => {
      const campo = form.elements[k].closest('.fld');
      const falta = !String(d[k] || '').trim();
      campo.classList.toggle('bad', falta);
      if (falta) { ok = false; campo.style.animation = 'none'; void campo.offsetWidth; campo.style.animation = ''; }
    });
    if (!ok) return;
    const partes = [
      `Hola, soy ${d.nombre.trim()}.`,
      `Necesito: ${d.servicio}.`,
      d.zona && d.zona.trim() ? `Zona de la obra: ${d.zona.trim()}.` : '',
      d.detalle && d.detalle.trim() ? `Detalles: ${d.detalle.trim()}` : '',
      'Quisiera un presupuesto. ¡Gracias!'
    ].filter(Boolean);
    // un <a> real abre en pestaña nueva incluso donde window.open se bloquea (iPhone, vistas incrustadas)
    const a = document.createElement('a');
    a.href = waLink(partes.join('\n')); a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  });
  form.addEventListener('input', e => e.target.closest('.fld')?.classList.remove('bad'));
})();
