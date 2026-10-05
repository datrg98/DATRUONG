// Shared interactions for both languages and all four static pages.
import './motion.js';
const vi = document.documentElement.lang === 'vi';
const t = (en, vn) => vi ? vn : en;
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
function closeMenu() { menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); }
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
});
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuToggle.focus(); } });
matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const dialog = document.querySelector('#film-player');
if (dialog) {
  const video = document.querySelector('#player-video');
  const status = document.querySelector('#player-status');
  let opener;
  let generation = 0;
  function openVideo(button, trigger = button) {
    opener = trigger;
    const current = ++generation;
    document.querySelector('#player-title').textContent = button.dataset.title;
    status.textContent = '';
    video.poster = button.dataset.poster || '';
    video.src = '/videos/' + encodeURIComponent(button.dataset.video);
    document.querySelector('#player-direct').href = video.src;
    dialog.showModal();
    video.muted = false;
    video.play().catch(error => {
      if (generation === current && dialog.open && error.name !== 'AbortError') status.textContent = t('Press play to start the film.', 'Nhấn phát để bắt đầu xem phim.');
    });
  }
  document.querySelectorAll('[data-video]').forEach(button => button.addEventListener('click', () => openVideo(button)));
  const featuredTrigger = document.querySelector('[data-play-feature]');
  featuredTrigger?.addEventListener('click', () => openVideo(document.querySelector('.feature-art'), featuredTrigger));
  dialog.querySelector('.close-player').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    generation++;
    video.pause();
    video.removeAttribute('src');
    video.removeAttribute('poster');
    video.load();
    status.textContent = '';
    opener?.focus({ preventScroll: true });
  });
  video.addEventListener('playing', () => { status.textContent = ''; });
  video.addEventListener('error', () => {
    if (dialog.open && video.getAttribute('src')) status.textContent = t('The video could not load. Please try the direct video link below.', 'Không thể tải video. Vui lòng thử liên kết mở video trực tiếp bên dưới.');
  });
}

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const groups = [...document.querySelectorAll('[data-group]')];
const extraProjects = [...document.querySelectorAll('.extra-project')];
const moreButton = document.querySelector('#more-projects');
let activeFilter = 'all';
let expanded = false;
const totalSocial = document.querySelectorAll('#social-projects .project-card').length;
const totalBrand = document.querySelectorAll('.brand-grid .project-card').length;
const totalFilm = document.querySelectorAll('.featured-film').length;
const totalAll = totalFilm + totalBrand + totalSocial;

function updateProjectCount() {
  const count = document.querySelector('#project-count');
  if (!count) return;
  const total = activeFilter === 'social' ? totalSocial : totalAll;
  const visible = (expanded ? totalSocial : 4) + (activeFilter === 'all' ? (totalFilm + totalBrand) : 0);
  count.textContent = t(`Showing ${visible} of ${total} projects`, `Đang hiển thị ${visible} / ${total} dự án`);
}
filterButtons.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach(filter => {
    const selected = filter === button;
    filter.setAttribute('aria-pressed', String(selected));
    filter.classList.toggle('active', selected);
  });
  groups.forEach(group => { group.hidden = activeFilter !== 'all' && group.dataset.group !== activeFilter; });
  updateProjectCount();
}));
moreButton?.addEventListener('click', () => {
  expanded = !expanded;
  extraProjects.forEach(project => { project.hidden = !expanded; });
  moreButton.setAttribute('aria-expanded', String(expanded));
  moreButton.textContent = expanded ? t('Show fewer edits −', 'Thu gọn video −') : t(`Explore all ${totalSocial} social edits +`, `Xem tất cả ${totalSocial} video social +`);
  updateProjectCount();
  if (!expanded) document.querySelector('[data-group="social"]').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});
updateProjectCount();

const form = document.querySelector('#contact-form');
if (form) {
  const service = document.querySelector('#service');
  const selected = new URLSearchParams(location.search).get('service');
  if ([...service.options].some(option => option.value === selected)) service.value = selected;
  let brief = '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    if (!name || !message) {
      const field = !name ? form.elements.name : form.elements.message;
      field.setCustomValidity(t('Please enter a value.', 'Vui lòng nhập nội dung.'));
      field.reportValidity();
      field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
      return;
    }
    const serviceName = service.value ? service.selectedOptions[0].textContent : t('To discuss', 'Cần trao đổi');
    brief = `${t('Name', 'Tên')}: ${name}\nEmail: ${email}\n${t('Service', 'Dịch vụ')}: ${serviceName}\n\n${message}`;
    const subject = t(`Project enquiry — ${name}`, `Trao đổi dự án — ${name}`);
    document.querySelector('#email-draft').href = `mailto:dattvq98@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief)}`;
    document.querySelector('#email-ready').hidden = false;
    document.querySelector('#brief-fallback').hidden = true;
    document.querySelector('#copy-brief').textContent = t('Copy brief', 'Sao chép brief');
    document.querySelector('#email-draft').focus();
  });
  document.querySelector('#copy-brief').addEventListener('click', async event => {
    try {
      await navigator.clipboard.writeText(brief);
      event.target.textContent = t('Copied ✓', 'Đã sao chép ✓');
    } catch {
      const fallback = document.querySelector('#brief-fallback');
      fallback.hidden = false;
      fallback.value = brief;
      fallback.focus();
      fallback.select();
      event.target.textContent = t('Select and copy the text below', 'Chọn và sao chép nội dung bên dưới');
    }
  });
}

const zaloModal = document.querySelector('#zalo-modal');
if (zaloModal) {
  const openTriggers = document.querySelectorAll('[data-open-zalo-qr], #open-zalo-qr-btn, .contact-zalo-qr-trigger');
  const closeBtn = document.querySelector('#close-zalo-modal');
  openTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      zaloModal.showModal();
    });
  });
  closeBtn?.addEventListener('click', () => zaloModal.close());
  zaloModal.addEventListener('click', event => {
    const bounds = zaloModal.getBoundingClientRect();
    if (event.target === zaloModal && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      zaloModal.close();
    }
  });
}
