(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const closeMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  // Keep focus inside the open mobile menu; return focus naturally to the toggle.
  header?.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || menuButton?.getAttribute('aria-expanded') !== 'true') return;
    const items = [menuButton, ...nav.querySelectorAll('a')];
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('reveal-pending'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => {
      // Never hide initially visible content, including when loading at an anchor.
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('reveal-pending'); observer.observe(element);
      }
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) { document.querySelectorAll('.reveal-pending').forEach(el => el.classList.remove('reveal-pending')); observer.disconnect(); }
    });
  }

  const params = new URLSearchParams(window.location.search);
  const gpuFilter = document.querySelector('#gpu-filter');
  if (gpuFilter) {
    const products = [...document.querySelectorAll('[data-product]')];
    const buttons = [...document.querySelectorAll('[data-brand-filter]')];
    const variants = JSON.parse(document.querySelector('.catalog-controls').dataset.gpuVariants);
    let brand = buttons.some(b => b.dataset.brandFilter === params.get('brand')) ? params.get('brand') : 'all';
    if (Object.hasOwn(variants, params.get('gpu'))) gpuFilter.value = params.get('gpu');
    const updateCatalog = (updateUrl = true) => {
      const gpu = gpuFilter.value;
      const variant = variants[gpu];
      let visible = 0;
      products.forEach(product => {
        product.hidden = brand !== 'all' && product.dataset.brand !== brand;
        if (!product.hidden) visible++;
        product.querySelector('[data-gpu-name]').textContent = gpu;
        product.querySelector('[data-gpu-memory]').textContent = variant.memory;
        product.querySelector('[data-gpu-type]').textContent = variant.type;
        const query = new URLSearchParams({ product: product.dataset.id, gpu });
        product.querySelector('[data-quote-link]').setAttribute('href', `contact.html?${query}`);
      });
      buttons.forEach(button => {
        const active = button.dataset.brandFilter === brand;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      document.querySelector('#product-count').textContent = `${visible} ${visible === 1 ? 'platform' : 'platforms'}`;
      if (updateUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set('gpu', gpu);
        if (brand === 'all') url.searchParams.delete('brand'); else url.searchParams.set('brand', brand);
        // A hidden product anchor must not leave the page pointing at a missing row.
        const anchor = products.find(p => `#${p.id}` === url.hash);
        if (anchor?.hidden) url.hash = '';
        try { window.history.replaceState(null, '', url); } catch { /* file previews may disallow history updates */ }
      }
    };
    buttons.forEach(button => button.addEventListener('click', () => { brand = button.dataset.brandFilter; updateCatalog(); }));
    gpuFilter.addEventListener('change', () => updateCatalog());
    document.querySelector('.catalog-controls').addEventListener('submit', event => event.preventDefault());
    updateCatalog(false);
  }

  const form = document.querySelector('#inquiry-form');
  if (form) {
    const product = form.elements.product;
    const gpu = form.elements.gpu;
    if ([...product.options].some(option => option.value === params.get('product'))) product.value = params.get('product');
    if (['H100', 'H200'].includes(params.get('gpu'))) gpu.value = params.get('gpu');
    const workloads = { training: 'AI training / fine-tuning', inference: 'Inference / private AI', hpc: 'HPC / research' };
    if (Object.hasOwn(workloads, params.get('workload'))) form.elements.requirements.value = `Workload: ${workloads[params.get('workload')]}\n\n`;
    const result = document.querySelector('#inquiry-result');
    const preview = document.querySelector('#inquiry-preview');
    const emailLink = document.querySelector('#email-inquiry');
    const status = document.querySelector('#copy-status');
    form.addEventListener('input', () => { result.hidden = true; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      for (const key of ['name', 'requirements']) {
        const input = form.elements[key];
        input.setCustomValidity(input.value.trim() ? '' : 'Please enter this information.');
        input.addEventListener('input', () => input.setCustomValidity(''), { once: true });
      }
      if (!form.reportValidity()) return;
      const field = name => String(form.elements[name].value).trim();
      const platform = product.options[product.selectedIndex].textContent;
      const gpuName = gpu.options[gpu.selectedIndex].textContent;
      const subject = `GPU server inquiry — ${platform}`;
      const body = [
        'Hello Ateamdata,', '', 'I would like to discuss a server sourcing / integration project.', '',
        `Name: ${field('name')}`, `Email: ${field('email')}`, `Company: ${field('company') || 'Not specified'}`,
        `Platform: ${platform}`, `GPU preference: ${gpuName}`, `Number of systems: ${field('quantity')}`,
        '', 'Requirements:', field('requirements'), '', 'Please share the configuration options, availability and next steps.', '', 'Thank you.'
      ].join('\r\n');
      // All user text stays in text/value properties and encoded mailto parameters.
      preview.value = `To: cindy@ateamdata.com\r\nSubject: ${subject}\r\n\r\n${body}`;
      emailLink.href = `mailto:cindy@ateamdata.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = 'If an email app doesn’t open, copy the inquiry into your preferred email service.';
      result.hidden = false;
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'nearest' });
    });
    document.querySelector('#copy-inquiry').addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(preview.value);
        status.textContent = 'Inquiry copied. Paste it into your email service, review it and send it to cindy@ateamdata.com.';
      } catch {
        preview.focus(); preview.select();
        status.textContent = 'Select and copy the highlighted inquiry, then paste it into your email service.';
      }
    });
  }
})();
