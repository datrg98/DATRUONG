import { writeFileSync, readFileSync } from 'node:fs';
import { projects, experience, services, faqs } from '../src/content.js';

const media = JSON.parse(readFileSync(new URL('../src/media.json', import.meta.url), 'utf8'));
const logos = JSON.parse(readFileSync(new URL('../src/logos.json', import.meta.url), 'utf8'));
// Size each mark to a similar optical area inside a 160 × 100 reference cell: wide wordmarks
// grow wider, compact emblems taller, and dense solid badges shrink slightly. Returns cell-width %.
const logoWidth = ({ width, height, density, scale = 1 }) => {
  const ratio = width / height;
  const area = 2900 * Math.pow(0.4 / Math.max(density, 0.2), 0.3);
  let w = Math.sqrt(area * ratio) * scale;
  w = Math.min(w, 118, 58 * ratio);
  return `${(w / 1.6).toFixed(1)}%`;
};
const backdrop = '<div class="backdrop" aria-hidden="true"><span class="orb orb-1"></span><span class="orb orb-2"></span><span class="orb orb-3"></span><span class="grid"></span><span class="grid-glow"></span><span class="grain"></span></div>';
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
const play = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m9 5 11 7-11 7z"/></svg>';
const duration = (file) => { const n = Math.floor(media[file].duration); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
const counter = (target, suffix = '', decimals = 0) => {
  const label = Number(target).toFixed(decimals) + suffix;
  return `<strong data-count-to="${target}" data-count-decimals="${decimals}" data-count-suffix="${esc(suffix)}"><span class="sr-only">${label}</span><span data-count-value aria-hidden="true">${label}</span></strong>`;
};

for (const vi of [false, true]) {
  const t = (en, vn) => vi ? vn : en;
  const home = vi ? '/index-vi.html' : '/';
  const contact = vi ? '/contact-vi.html' : '/contact.html';
  const name = t('Dat Truong', 'Đạt Trương');
  const firstName = vi ? 'Đạt' : 'Dat';
  const lastName = vi ? 'Trương' : 'Truong';
  const watch = t('Watch', 'Xem');
  const playerButton = (file, title, label, classes = '', poster = '') => `<button type="button" class="${classes}" data-video="${esc(file)}" data-title="${esc(title)}" data-poster="${esc(poster)}" aria-label="${watch}: ${esc(title)}">${label}</button>`;
  
  const header = (isContact) => `<a class="skip-link" href="#main">${t('Skip to content', 'Đến nội dung chính')}</a>
  <header class="site-header"><div class="shell nav">
    <a class="wordmark" href="${home}" aria-label="${name} — ${t('Home', 'Trang chủ')}">DAT<span class="wordmark-slash">/</span>TRUONG<span class="orange">.</span></a>
    <nav class="desktop-nav" aria-label="${t('Main navigation', 'Điều hướng chính')}"><a href="${isContact ? home : ''}#work">${t('Work', 'Dự án')}</a><a href="${isContact ? home : ''}#clients">${t('Clients', 'Khách hàng')}</a><a href="${isContact ? home : ''}#about">${t('About', 'Giới thiệu')}</a><a href="${isContact ? home : ''}#services">${t('Services', 'Dịch vụ')}</a><a href="/Dat-Truong-CV.pdf" target="_blank" rel="noopener noreferrer">${t('Curriculum Vitae', 'Curriculum Vitae')}</a></nav>
    <div class="nav-right"><div class="languages" aria-label="${t('Language', 'Ngôn ngữ')}"><a href="${isContact ? '/contact.html' : '/'}" lang="en" ${!vi ? 'aria-current="page"' : ''}>EN</a><span>/</span><a href="${isContact ? '/contact-vi.html' : '/index-vi.html'}" lang="vi" ${vi ? 'aria-current="page"' : ''}>VI</a></div><a class="nav-contact" href="${contact}">${t('Let’s talk', 'Liên hệ')} ${arrow}</a><button class="menu-toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="${t('Open navigation', 'Mở điều hướng')}"><span></span><span></span></button></div>
    <nav id="mobile-menu" class="mobile-menu" aria-label="${t('Mobile navigation', 'Điều hướng di động')}" hidden><a href="${home}#work">${t('Work', 'Dự án')}</a><a href="${home}#clients">${t('Clients', 'Khách hàng')}</a><a href="${home}#about">${t('About', 'Giới thiệu')}</a><a href="${home}#services">${t('Services', 'Dịch vụ')}</a><a href="/Dat-Truong-CV.pdf" target="_blank" rel="noopener noreferrer">${t('Curriculum Vitae', 'Curriculum Vitae')}</a><a href="https://zalo.me/0708814771" target="_blank" rel="noopener noreferrer">Zalo: 0708 814 771 ${arrow}</a><a href="${contact}">${t('Let’s talk', 'Liên hệ')} ${arrow}</a></nav>
  </div></header>`;

  const footer = `<footer class="shell footer"><a class="wordmark" href="${home}">DAT<span class="wordmark-slash">/</span>TRUONG<span class="orange">.</span></a><span>© ${new Date().getFullYear()} ${name}</span><div><a href="mailto:dattvq98@gmail.com">Email ${arrow}</a><a href="tel:0708814771">${t('Phone', 'Điện thoại')} ${arrow}</a><a href="https://zalo.me/0708814771" target="_blank" rel="noopener noreferrer">Zalo ${arrow}</a><a href="/Dat-Truong-CV.pdf" target="_blank" rel="noopener noreferrer">${t('Curriculum Vitae', 'Curriculum Vitae')} ${arrow}</a></div><a href="#top">${t('Back to top', 'Về đầu trang')} ↑</a></footer>`;

  const dialog = `<dialog id="film-player" aria-labelledby="player-title"><div class="player-bar"><div><span class="eyebrow">${t('NOW PLAYING', 'ĐANG PHÁT')}</span><h2 id="player-title"></h2></div><button class="close-player" aria-label="${t('Close video', 'Đóng video')}" autofocus>×</button></div><video id="player-video" controls playsinline preload="none"></video><p id="player-status" role="status"></p><div class="player-footer"><span>${t('Sound on. Enjoy the story.', 'Bật âm thanh. Thưởng thức câu chuyện.')}</span><a id="player-direct" href="#">${t('Open video directly', 'Mở video trực tiếp')} ${arrow}</a></div></dialog>`;

  const zaloDialog = `<dialog id="zalo-modal" aria-labelledby="zalo-modal-title"><div class="player-bar"><div><span class="eyebrow">${t('DIRECT CONTACT', 'LIÊN HỆ TRỰC TIẾP')}</span><h2 id="zalo-modal-title">${t('Zalo Business Card — Trương Văn Quang Đạt', 'Danh thiếp Zalo — Trương Văn Quang Đạt')}</h2></div><button class="close-player" id="close-zalo-modal" aria-label="${t('Close modal', 'Đóng cửa sổ')}" autofocus>×</button></div><div class="zalo-modal-body"><div class="zalo-card-wrapper"><img src="/zalo-card.webp" alt="Danh thiếp Zalo — Trương Văn Quang Đạt" width="984" height="1200" loading="lazy"></div><div class="zalo-modal-actions"><p>${t('Scan the QR code with your Zalo mobile app or click below to chat directly with Dat.', 'Quét mã QR bằng ứng dụng Zalo trên điện thoại hoặc bấm bên dưới để nhắn tin trực tiếp với Đạt.')}</p><div class="zalo-btn-group"><a class="button button-orange" href="https://zalo.me/0708814771" target="_blank" rel="noopener noreferrer">${t('Chat on Zalo', 'Nhắn tin qua Zalo')} ${arrow}</a><a class="button button-outline" href="/zalo-card.webp" download="Truong-Van-Quang-Dat-Zalo.webp">${t('Save QR Card', 'Lưu danh thiếp')} ↓</a></div></div></div></dialog>`;

  const faq = `<section class="shell faq-section"><div><span class="eyebrow">${t('PROJECT DETAILS', 'THÔNG TIN HỢP TÁC')}</span><h2>${t('Before we begin', 'Trước khi bắt đầu')}</h2></div><div>${faqs.map(([q, qv, a, av]) => `<details class="faq"><summary>${t(q, qv)}<span>+</span></summary><p>${t(a, av)}</p></details>`).join('')}</div></section>`;

  const film = `<article class="featured-film" data-group="film"><div class="feature-label"><span><span class="feature-dot" aria-hidden="true"></span>${t('FEATURED FILM', 'PHIM NỔI BẬT')}</span><span>HIGGSFIELD FILM CONTEST</span></div>
    ${playerButton('nhung-dieu-ta-quen.mp4', 'Những điều ta quên', `<img src="/posters/nhung-dieu-ta-quen.webp" srcset="/posters/nhung-dieu-ta-quen-small.webp 1008w, /posters/nhung-dieu-ta-quen.webp 2016w" sizes="(max-width: 700px) 100vw, 92vw" width="2688" height="1152" alt="Những điều ta quên — ${t('five characters in a cinematic science-fiction setting', 'năm nhân vật trong bối cảnh khoa học viễn tưởng')}" fetchpriority="high">`, 'feature-art', '/posters/nhung-dieu-ta-quen.webp')}
    <div class="feature-caption"><div class="feature-title"><span class="eyebrow">${t('AI SHORT FILM', 'PHIM NGẮN AI')}</span><h3 lang="vi">Những điều ta quên</h3></div><div class="feature-specs"><span><small>${t('FORMAT', 'TỶ LỆ')}</small>21:9</span><span><small>${t('RUNTIME', 'THỜI LƯỢNG')}</small>04:48</span></div><button class="film-watch" type="button" data-play-feature aria-label="${t('Play featured film', 'Phát phim nổi bật')}"><span class="watch-disc">${play}</span><span>${t('Watch the film', 'Xem phim')}</span>${arrow}</button></div></article>`;

  const card = ([file, title, en, vn, type], index) => {
    const poster = '/posters/' + file.replace(/\.mp4$/, '.webp');
    const info = media[file];
    return `<article class="project-card ${type === 'social' && index >= 4 ? 'extra-project' : ''}" ${type === 'social' && index >= 4 ? 'hidden' : ''}>
      ${playerButton(file, title, `<img src="${esc(poster)}" alt="${esc(title)} — ${esc(t(en, vn))}" width="${info.width}" height="${info.height}" loading="lazy"><span class="card-top"><span>${duration(file)}</span></span><span class="card-play">${play}</span>`, `project-image ${type}`, poster)}
      <div class="project-caption"><div><h4>${esc(title)}</h4><p>${t(en, vn)}</p></div><span class="project-index">${String(index + 1).padStart(2, '0')}</span></div></article>`;
  };

  const brandList = projects.filter(p=>p[4]==='brand');
  const socialList = projects.filter(p=>p[4]==='social');
  const allCount = projects.length + 1;
  const brandCount = brandList.length;
  const socialCount = socialList.length;

  const work = `<section class="shell work-section" id="work" aria-labelledby="work-title"><div class="work-toolbar"><div class="work-heading"><span class="eyebrow">01 / ${t('PORTFOLIO', 'DỰ ÁN')}</span><h2 id="work-title">${t('Selected work', 'Dự án tiêu biểu')}</h2></div><div class="filters" role="group" aria-label="${t('Filter projects', 'Lọc dự án')}">${[['all',t('All work','Tất cả'),allCount],['film',t('AI film','Phim AI'),1],['brand',t('Brand films','Phim thương hiệu'),brandCount],['social',t('Social & reels','Social & reels'),socialCount]].map(([key,label,count])=>`<button class="filter ${key === 'all' ? 'active' : ''}" data-filter="${key}" aria-pressed="${key === 'all'}">${label}<sup>${count}</sup></button>`).join('')}</div></div>${film}
    <div class="project-group" data-group="brand"><div class="group-heading"><h3>${t('Commercial & brand films', 'Phim thương mại & thương hiệu')}</h3><span class="eyebrow">${String(brandCount).padStart(2,'0')} ${t('FILMS', 'DỰ ÁN')} / 16:9</span></div><div class="brand-grid">${brandList.map(card).join('')}</div></div>
    <div class="project-group" data-group="social"><div class="group-heading"><div><h3>${t('Social campaigns', 'Chiến dịch mạng xã hội')}</h3><p>${t('Product stories, launches and campaign edits.', 'Video sản phẩm, ra mắt và quảng bá chiến dịch.')}</p></div><span class="eyebrow">${String(socialCount).padStart(2,'0')} ${t('EDITS', 'VIDEO')} / 9:16</span></div><div class="social-grid" id="social-projects">${socialList.map(card).join('')}</div><div class="more-row"><span id="project-count" role="status"></span><button class="button button-outline" id="more-projects" aria-expanded="false" aria-controls="social-projects">${t(`Explore all ${socialCount} social edits`, `Xem tất cả ${socialCount} video social`)} <span>+</span></button></div></div></section>`;

  const moreCard = `<li class="logo-wall-more"><a href="${contact}" class="logo-more-card" aria-label="${t('And many more brands. Too many to present all. Contact Dat Truong', 'Và nhiều thương hiệu khác. Không thể liệt kê hết. Liên hệ Đạt Trương')}"><div class="logo-more-icon" aria-hidden="true"><span class="logo-more-plus">+</span></div><div class="logo-more-content"><strong class="logo-more-title">${t('& Many more', '& Nhiều hơn')}</strong><span class="logo-more-desc">${t('Too many to present all', 'Không thể liệt kê hết')}</span></div></a></li>`;
  const marqueeMore = `<div class="marquee-item marquee-more"><span>+ ${t('And many more brands', 'Và nhiều thương hiệu khác')}</span></div>`;

  const clients = `<section class="shell clients-section" id="clients" aria-labelledby="clients-title"><div class="clients-head"><div><span class="eyebrow">02 / ${t('CLIENTS', 'KHÁCH HÀNG')}</span><h2 id="clients-title">${t('Brands I’ve edited for', 'Thương hiệu tôi đã dựng phim')}</h2></div><p>${t('40+ brands across beauty, healthcare, nutrition, sportswear and technology, from campaign films to e-commerce and social edits.', '40+ thương hiệu thuộc làm đẹp, chăm sóc sức khỏe, dinh dưỡng, thời trang thể thao và công nghệ, từ phim chiến dịch đến video thương mại điện tử và mạng xã hội.')}</p></div><div class="logo-marquee" aria-hidden="true"><div class="marquee-track">${logos.map(({ slug, name }) => `<div class="marquee-item"><img src="/logos/${slug}.webp" alt="" loading="lazy" decoding="async"><span>${esc(name)}</span></div>`).join('')}${marqueeMore}${logos.map(({ slug, name }) => `<div class="marquee-item"><img src="/logos/${slug}.webp" alt="" loading="lazy" decoding="async"><span>${esc(name)}</span></div>`).join('')}${marqueeMore}</div></div><ul class="logo-wall" role="list">${logos.map(({ slug, name, width, height, density, scale }) => `<li><img src="/logos/${slug}.webp" alt="${esc(name)}" width="${width}" height="${height}" loading="lazy" decoding="async" style="--w: ${logoWidth({ width, height, density, scale })}"><span class="logo-name" aria-hidden="true">${esc(name)}</span></li>`).join('')}${moreCard}</ul></section>`;

  const appTools = [
    {
      id: 'adobe',
      distributor: 'Adobe Inc.',
      name: 'Adobe Creative Cloud',
      featured: true,
      tag: t('Unified Suite · 5 Apps', 'Bộ công cụ hợp nhất · 5 ứng dụng'),
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#FA0F00"/><path d="M13.97 4.5H19.5V19.5L13.97 4.5ZM4.5 4.5H10.03L4.5 19.5V4.5ZM12 11.22L15.17 19.5H12.91L11.72 16.31H8.97L11.14 10.74L12 11.22Z" fill="#FFFFFF"/></svg>`,
      desc: t('Primary commercial post-production backbone for non-linear video editing, keyframe motion graphics, visual assets and audio mastering.', 'Hệ sinh thái hậu kỳ cốt lõi cho dựng phim thương mại, motion graphics, xử lý hình ảnh và master âm thanh chuyên nghiệp.'),
      subchips: [
        { key: 'Pr', name: 'Premiere Pro', role: t('Cinema & Commercial Edit', 'Dựng phim thương mại') },
        { key: 'Ae', name: 'After Effects', role: t('Motion & Visual VFX', 'Motion & Kỹ xảo VFX') },
        { key: 'Ps', name: 'Photoshop', role: t('Concept & Asset Design', 'Thiết kế & Xử lý ảnh') },
        { key: 'Ai', name: 'Illustrator', role: t('Vector & Typography', 'Vector & Đồ họa chữ') },
        { key: 'Au', name: 'Audition', role: t('Audio Clean & Master', 'Lọc tạp âm & Master') }
      ]
    },
    {
      id: 'capcut',
      distributor: 'ByteDance',
      name: 'CapCut Pro',
      featured: false,
      tag: '9:16 Kinetic Video',
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#0A0E18" stroke="rgba(0, 240, 255, 0.3)"/><path d="M4.8 7.5L12 11.6L4.8 15.8V7.5Z" fill="#00F0FF"/><path d="M19.2 7.5L12 11.6L19.2 15.8V7.5Z" fill="#FFFFFF"/><path d="M12 4.5L16.5 12L12 19.5L7.5 12L12 4.5Z" fill="#00E5FF" fill-opacity="0.25"/></svg>`,
      desc: t('High-velocity vertical video editing, trend-responsive pacing, subtitle choreography and rapid social turnaround.', 'Dựng video dọc 9:16 tốc độ cao, nhịp dựng bắt trend, hiệu ứng phụ đề động và tối ưu thời gian bàn giao chiến dịch.'),
      subchips: []
    },
    {
      id: 'davinci',
      distributor: 'Blackmagic Design',
      name: 'DaVinci Resolve',
      featured: false,
      tag: 'Color Science',
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#0C0F1A" stroke="rgba(255, 255, 255, 0.12)"/><path d="M12 12L12 4C15.5 4 18.5 6.2 19.5 9.5L12 12Z" fill="#FF3B30"/><path d="M12 12L5 16C4 13.5 4.3 10.2 6.2 7.8L12 12Z" fill="#007AFF"/><path d="M12 12L17 18C14.8 20 11.2 20.2 8.8 18.6L12 12Z" fill="#FFCC00"/><circle cx="12" cy="12" r="2.8" fill="#0C0F1A"/></svg>`,
      desc: t('Node-based color grading, digital film emulation, contrast balancing and broadcast delivery calibration.', 'Chỉnh màu node-based chuyên sâu, giả lập chất phim điện ảnh, cân bằng tương phản và chuẩn hóa dải màu phát sóng.'),
      subchips: []
    }
  ];

  const aiTools = [
    {
      id: 'google',
      distributor: 'Google DeepMind',
      name: 'Google AI',
      featured: true,
      tag: t('Frontier Models · 2 Models', 'Mô hình tiên phong · 2 mô hình'),
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#0C0F1A" stroke="rgba(255, 255, 255, 0.1)"/><g transform="translate(2, 2) scale(0.833)"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.09C3.25 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.27C.46 8.2.005 10.05.005 12s.46 3.8 1.265 5.41l4.01-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.59l4.01 3.09c.95-2.83 3.6-4.93 6.72-4.93z"/></g></svg>`,
      desc: t('Flagship multimodal generative intelligence enabling cinematic high-definition video generation and foundation visual synthesis.', 'Hệ thống AI đa phương thức đỉnh cao phục vụ tạo sinh video điện ảnh độ phân giải cao và nền tảng thị giác đột phá.'),
      subchips: [
        { key: 'Veo 3.1', name: '', role: t('Cinematic Video Generation', 'Tạo video điện ảnh sắc nét') },
        { key: 'Nano Banana Pro', name: '', role: t('Multimodal Visual Foundation', 'Mô hình thị giác cao cấp') }
      ]
    },
    {
      id: 'bytedance-ai',
      distributor: 'ByteDance',
      name: 'ByteDance AI',
      featured: true,
      tag: t('Generative Models · 2 Models', 'Mô hình tạo sinh · 2 mô hình'),
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#0C0F1A" stroke="rgba(0, 229, 255, 0.25)"/><g transform="translate(3, 3) scale(0.75)"><path fill="#00E5FF" d="M0 2.572l4.115 1.064v16.736L0 21.428V2.572z"/><path fill="#00B5FB" d="M6.529 10.896l4.115 1.064v8.979l-4.115 1.064v-11.107z"/><path fill="#2B5FF8" d="M17.455 8.193v11.107l-4.123-1.064V9.257l4.123-1.064z"/><path fill="#7C3AED" d="M19.877 1.469L24 2.533v18.943l-4.123 1.056V1.469z"/></g></svg>`,
      desc: t('Next-generation generative engines designed for high-motion consistency, cinema-scale camera control and ultra-detailed image rendering.', 'Hệ mô hình AI thế hệ mới với khả năng chuyển động mượt mà, chuyển động máy quay chuẩn điện ảnh và kết xuất hình ảnh chi tiết.'),
      subchips: [
        { key: 'Seedance', name: '', role: t('Cinematic Video Model', 'Mô hình sinh video điện ảnh') },
        { key: 'Seedream', name: '', role: t('High-Fidelity Diffusion Image', 'Mô hình tạo ảnh phân giải cao') }
      ]
    },
    {
      id: 'runway',
      distributor: 'Runway ML',
      name: 'Runway',
      featured: false,
      tag: 'Gen-3 Alpha',
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#0C0F1A" stroke="rgba(255, 255, 255, 0.12)"/><g transform="translate(3.5, 3.5) scale(0.3)"><path d="M26.83 18.09C20.64 18.09 17.36 21.75 17.36 28.26V56.37H0.36V1.27H9.91L15.87 7.63C18.71 3.51 22.96 1.27 28.7 1.27H33.84V18.09H26.83Z" fill="#FFFFFF"/></g></svg>`,
      desc: t('World simulation models, dynamic camera choreography and temporal scene transitions.', 'Mô hình mô phỏng bối cảnh thế giới, chuyển động máy quay đa chiều và chuyển cảnh mượt mà.'),
      subchips: []
    },
    {
      id: 'kling',
      distributor: 'Kuaishou',
      name: 'Kling AI',
      featured: false,
      tag: 'Kling 1.5',
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><defs><linearGradient id="kling-grad-${vi?'vi':'en'}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF3366"/><stop offset="50%" stop-color="#8F57FF"/><stop offset="100%" stop-color="#00D4FF"/></linearGradient></defs><rect width="24" height="24" rx="5" fill="#0C0E1A" stroke="rgba(255, 51, 102, 0.25)"/><path d="M12 4C12 8.4 8.4 12 4 12C8.4 12 12 15.6 12 20C12 15.6 15.6 12 20 12C15.6 12 12 8.4 12 4Z" fill="url(#kling-grad-${vi?'vi':'en'})"/><circle cx="12" cy="12" r="1.8" fill="#FFFFFF"/></svg>`,
      desc: t('Realistic physical world simulation, fluid motion dynamics and multi-angle cinematic scenes.', 'Mô phỏng vật lý chuyển động thế giới thực, chuyển động tự nhiên và góc quay đa chiều.'),
      subchips: []
    },
    {
      id: 'elevenlabs',
      distributor: 'ElevenLabs',
      name: 'ElevenLabs',
      featured: false,
      tag: 'Voice & SFX AI',
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#0B0D16" stroke="rgba(255, 255, 255, 0.12)"/><path d="M7 5v14h3V5H7zm7 0v14h3V5h-3z" fill="#FFFFFF"/></svg>`,
      desc: t('Emotionally expressive neural voice cloning, multilingual dialogue dubbing and Foley sound effect synthesis.', 'Nhân bản giọng nói AI truyền cảm, lồng tiếng đa ngôn ngữ và tạo hiệu ứng âm thanh Foley điện ảnh.'),
      subchips: []
    },
    {
      id: 'higgsfield',
      distributor: 'Higgsfield',
      name: 'Higgsfield AI',
      featured: false,
      tag: 'Cinema Video AI',
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><defs><linearGradient id="higgs-grad-${vi?'vi':'en'}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#9945FF"/><stop offset="100%" stop-color="#00F0FF"/></linearGradient></defs><rect width="24" height="24" rx="5" fill="#0A0D18" stroke="rgba(153, 69, 255, 0.3)"/><path d="M7 6v12h2.5v-4.8h5v4.8H17V6h-2.5v4.8h-5V6H7z" fill="url(#higgs-grad-${vi?'vi':'en'})"/><circle cx="12" cy="12" r="1.3" fill="#FFFFFF"/></svg>`,
      desc: t('Specialized cinema camera angles, dynamic body control and character-consistent narrative generation.', 'Điều khiển góc máy điện ảnh chuyên biệt, chuyển động cơ thể sống động và duy trì tính nhất quán nhân vật.'),
      subchips: []
    },
    {
      id: 'midjourney',
      distributor: 'Midjourney Inc.',
      name: 'Midjourney',
      featured: false,
      tag: 'v6 / Niji',
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><defs><linearGradient id="mj-grad-${vi?'vi':'en'}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#8F88FF"/></linearGradient></defs><rect width="24" height="24" rx="5" fill="#090B14" stroke="rgba(143, 136, 255, 0.25)"/><path d="M5 16.5C8.5 18.8 15.5 18.8 19 16.5L17.5 18C14.2 20 9.8 20 6.5 18L5 16.5Z" fill="url(#mj-grad-${vi?'vi':'en'})"/><path d="M11.5 5.5C11.5 9.5 7 13 7 14.5H11.5V5.5Z" fill="url(#mj-grad-${vi?'vi':'en'})" fill-opacity="0.95"/><path d="M12.5 7.5C12.5 10.5 17 13.2 17 14.5H12.5V7.5Z" fill="url(#mj-grad-${vi?'vi':'en'})" fill-opacity="0.75"/></svg>`,
      desc: t('Photorealistic concept art, lighting textures, key visual exploration and cinematic storyboards.', 'Phác thảo concept visual chân thực, moodboard ánh sáng và phân cảnh storyboard chi tiết.'),
      subchips: []
    },
    {
      id: 'vbee',
      distributor: 'Vbee',
      name: 'Vbee AI',
      featured: false,
      tag: 'Vietnamese Neural TTS',
      svg: `<svg class="tool-logo-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><defs><linearGradient id="vbee-grad-${vi?'vi':'en'}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF7A00"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs><rect width="24" height="24" rx="5" fill="#130D08" stroke="rgba(255, 122, 0, 0.3)"/><path d="M6.5 10v4M9.25 7.5v9M12 5.5v13M14.75 7.5v9M17.5 10v4" stroke="url(#vbee-grad-${vi?'vi':'en'})" stroke-width="2" stroke-linecap="round"/></svg>`,
      desc: t('Natural Vietnamese neural speech synthesis tailored for commercial ads and broadcast narration.', 'Giọng đọc AI tiếng Việt tự nhiên, đa ngữ điệu vùng miền chuẩn cho quảng cáo và phóng sự.'),
      subchips: []
    }
  ];

  const renderToolCard = (item) => {
    const subchipsHtml = item.subchips.length > 0
      ? `<div class="tool-subchips">${item.subchips.map(sc => `<span class="tool-subchip"><strong class="subchip-key">${sc.key}</strong>${sc.name ? `<span class="subchip-name">${sc.name}</span>` : ''}<span class="subchip-role">${sc.role}</span></span>`).join('')}</div>`
      : '';
    return `<article class="tool-card ${item.featured ? 'tool-card-featured' : ''}" data-tool="${item.id}"><div class="tool-card-head"><div class="tool-card-brand">${item.svg}<div><h5 class="tool-name">${item.name}</h5><span class="tool-distributor">${item.distributor}</span></div></div><span class="tool-model-tag">${item.tag}</span></div><p class="tool-desc">${item.desc}</p>${subchipsHtml}</article>`;
  };

  const toolkitHtml = `<div class="shell toolkit"><div class="toolkit-top"><div><span class="eyebrow">${t('TOOLS OF THE TRADE', 'BỘ CÔNG CỤ')}</span><h3>${t('Software & AI Stack', 'Công cụ & Mô hình AI')}</h3><p class="toolkit-lead">${t('An integrated pipeline combining industry-standard post-production suites with next-generation generative AI video and visual models.', 'Quy trình hậu kỳ hợp nhất kết hợp phần mềm sáng tạo tiêu chuẩn điện ảnh và các mô hình AI tạo sinh đa phương thức tiên tiến nhất.')}</p></div><div class="credentials"><span class="eyebrow">${t('RECOGNITION & LEARNING', 'GHI NHẬN & HỌC TẬP')}</span><p><strong>${t('Sony Alpha Vietnam', 'Sony Alpha Việt Nam')}</strong><br>${t('Selection of the Month · August 2024', 'Video ấn tượng nhất tháng · 08.2024')}</p><details><summary>${t('Courses & credentials', 'Khóa học & Chứng chỉ')} <span>+</span></summary><ul><li>AI Video School: Veo 3.1, Kling, Sora+ — Udemy, 27h, 03.2026</li><li>Diffusion Mastery: Flux, Stable Diffusion, Midjourney — Udemy, 22.5h, 03.2026</li><li>IELTS Academic 6.0 — IDP, 2019</li></ul></details></div></div><div class="toolkit-groups"><div class="tool-group"><div class="tool-group-header"><div class="tool-group-title-wrap"><span class="tool-group-badge tool-badge-app">${t('CREATIVE APPLICATIONS', 'PHẦN MỀM SÁNG TẠO')}</span><h4>${t('Post-Production & Motion Suites', 'Hệ phần mềm dựng phim & đồ họa')}</h4></div><span class="tool-group-count">3 ${t('STUDIOS / ECOSYSTEMS', 'HỆ CÔNG CỤ')}</span></div><div class="tool-grid tool-grid-apps">${appTools.map(renderToolCard).join('')}</div></div><div class="tool-group"><div class="tool-group-header"><div class="tool-group-title-wrap"><span class="tool-group-badge tool-badge-ai">${t('AI TOOL MODELS & ENGINES', 'MÔ HÌNH AI & CÔNG NGHỆ TẠO SINH')}</span><h4>${t('Generative Video & Multimodal Engines', 'Mô hình sinh video & công nghệ AI')}</h4></div><span class="tool-group-count">8 ${t('MODELS & ENGINES', 'MÔ HÌNH & ENGINE')}</span></div><div class="tool-grid tool-grid-ai">${aiTools.map(renderToolCard).join('')}</div></div></div></div>`;

  const about = `<section class="about-section" id="about"><div class="shell about-grid"><div class="about-visual"><div class="portrait-frame"><img src="/profile.jpg" alt="${name}" loading="lazy" width="800" height="1000"><span class="rec" aria-hidden="true">REC</span></div><div class="portrait-caption"><span>${name}</span><span>${t('THE PERSON BEHIND THE FRAME', 'NGƯỜI ĐỨNG SAU KHUNG HÌNH')}</span></div></div><div class="about-content"><span class="eyebrow">03 / ${t('ABOUT ME', 'GIỚI THIỆU')}</span><h2>${t('Behind the edit.', 'Phía sau bản dựng.')}</h2><p class="about-lead">${t('I’m Dat, a Senior Video Editor & Media Specialist. I turn footage, ideas and emerging technology into stories people want to watch.', 'Tôi là Đạt, Senior Video Editor & chuyên gia Media. Tôi kết nối thước phim, ý tưởng và công nghệ mới thành những câu chuyện đáng xem.')}</p><p>${t('My work spans commercial editing, cinematography, photography and generative AI. At OnPoint, I lead post-production with equal attention to the craft and the way audiences respond.', 'Công việc của tôi trải rộng từ dựng phim thương mại, quay phim, nhiếp ảnh đến AI tạo sinh. Tại OnPoint, tôi dẫn dắt hậu kỳ, chú trọng cả chất lượng sáng tạo lẫn phản hồi của khán giả.')}</p>    <div class="stats"><div>${counter(11.6, 'M+', 1)}<span>${t('Peak video views', 'Lượt xem cao nhất')}</span></div><div>${counter(40, '+')}<span>${t('Brands edited for', 'Thương hiệu đã dựng phim')}</span></div><div>${counter(allCount)}<span>${t('Projects to explore', 'Dự án để khám phá')}</span></div></div><div class="about-links"><a class="text-link" href="${contact}">${t('Let’s make something memorable', 'Cùng tạo nên điều đáng nhớ')} ${arrow}</a><a class="text-link" href="/Dat-Truong-CV.pdf" target="_blank" rel="noopener noreferrer">${t('Download Curriculum Vitae (PDF)', 'Tải Curriculum Vitae (PDF)')} ${arrow}</a></div></div></div>
    <div class="shell career-grid"><div><span class="eyebrow">${t('THE JOURNEY', 'HÀNH TRÌNH')}</span><h3>${t('Experience', 'Kinh nghiệm')}</h3><img class="presentation-photo" src="/presentation.jpg" alt="${t('Dat presenting an end-to-end video production workflow', 'Đạt trình bày quy trình sản xuất video toàn diện')}" loading="lazy"></div><div class="career-list">${experience.map((exp, i) => {
      const curLead = vi ? exp.leadVi : exp.lead;
      const curBullets = vi ? exp.bulletsVi : exp.bullets;
      return `<details class="career" ${i===0?'open':''}><summary><span class="career-company">${exp.company}</span><span class="career-role">${vi ? exp.roleVi : exp.role}</span><span class="career-date">${vi ? exp.dateVi : exp.date}</span><span class="career-plus">+</span></summary><div class="career-body"><p class="career-lead">${curLead}</p><ul class="career-bullets">${curBullets.map(([bTitle, bDesc]) => `<li><strong>${bTitle}:</strong> ${bDesc}</li>`).join('')}</ul></div></details>`;
    }).join('')}</div></div>
    ${toolkitHtml}</section>`;

  const serviceSection = `<section class="shell services-section" id="services"><div class="section-heading"><div><span class="eyebrow">04 / ${t('WHAT I DO', 'DỊCH VỤ')}</span><h2>${t('Production &<br>post-production', 'Sản xuất &<br>hậu kỳ')}</h2></div><p>${t('A clear scope, a consistent visual direction, and delivery tailored to each project.', 'Phạm vi rõ ràng, định hướng hình ảnh nhất quán và sản phẩm bàn giao phù hợp từng dự án.')}</p></div><div class="service-list">${services.map(([en,vn,d,dv,tags],i)=>`<a class="service-row" href="${contact}?service=${i}"><span class="service-number">0${i+1}</span><h3>${t(en,vn)}</h3><div><p>${t(d,dv)}</p><span class="service-tools">${tags}</span></div><span class="service-arrow">${arrow}</span></a>`).join('')}</div><div class="process"><span class="eyebrow">${t('THE PROCESS', 'QUY TRÌNH')}</span><div><span>01</span><h3>${t('Find the story', 'Tìm câu chuyện')}</h3><p>${t('Brief, script and visual direction.', 'Brief, kịch bản và định hướng hình ảnh.')}</p></div><div><span>02</span><h3>${t('Build the world', 'Tạo thế giới')}</h3><p>${t('Live-action production or AI-generated scenes.', 'Quay thực tế hoặc tạo cảnh bằng AI.')}</p></div><div><span>03</span><h3>${t('Make it move', 'Thổi sức sống')}</h3><p>${t('Edit, color, sound and final delivery.', 'Dựng phim, màu sắc, âm thanh và bàn giao.')}</p></div></div></section>`;

  const cta = `<section class="cta-section"><div class="shell"><div class="availability"><i></i>${t('AVAILABLE FOR PROJECTS', 'SẴN SÀNG CHO DỰ ÁN MỚI')}</div><a class="cta-title" href="${contact}">${t('Let’s discuss<br>your next project.', 'Cùng trao đổi<br>về dự án của bạn.')}<span>${arrow}</span></a><div class="cta-bottom"><p>${t('Share your brief, timeline and references.', 'Chia sẻ brief, lịch trình và hình ảnh tham khảo.')}</p><div class="cta-actions"><a href="mailto:dattvq98@gmail.com">dattvq98@gmail.com ${arrow}</a><a href="https://zalo.me/0708814771" target="_blank" rel="noopener noreferrer">Zalo: 0708 814 771 ${arrow}</a></div></div></div></section>`;

  const hero = `<section class="shell hero"><div class="hero-kicker"><span class="eyebrow">${t('VIDEO EDITING / MOTION / AI FILM', 'DỰNG PHIM / MOTION / PHIM AI')}</span><span class="availability"><i></i>${t('Available for collaborations', 'Sẵn sàng hợp tác')}</span></div><div class="hero-stage"><div class="hero-avatar-frame" aria-hidden="true"><div class="hero-avatar-ambient"></div><div class="hero-avatar-spot"></div><img class="hero-avatar-cutout" src="/dat-truong-avatar.webp" alt="" width="512" height="512" fetchpriority="high"><span class="hero-avatar-badge"><span class="rec-dot"></span>REC · 25 FPS</span></div><h1 class="hero-title-stage" aria-label="${name}."><span class="hero-name-word hero-name-first">${firstName}</span><span class="hero-name-word hero-name-last">${lastName}<span class="orange">.</span></span></h1></div><div class="hero-grid"><div class="hero-heading"><p class="hero-specialty">Senior Video Editor<br><span>&amp; Media Specialist</span></p></div><div class="hero-aside"><p>${t('Commercial films, social campaigns and AI storytelling. Shaped through editing, color and sound.', 'Phim thương mại, chiến dịch mạng xã hội và kể chuyện bằng AI. Hoàn thiện qua dựng phim, màu sắc và âm thanh.')}</p><div class="hero-cta-buttons"><a class="button hero-button" href="#work">${t('View selected work', 'Khám phá dự án')} <span aria-hidden="true">↓</span></a></div></div></div><div class="hero-timeline" aria-hidden="true"><span class="timecode" data-timecode>00:00:00:00</span><div class="ruler"><span class="playhead"></span></div><span>25 FPS</span></div></section>`;

  const contactPage = `${header(true)}<main id="main"><section class="shell contact-section"><div class="contact-intro"><span class="eyebrow">${t('PROJECT ENQUIRIES', 'TRAO ĐỔI DỰ ÁN')}</span><h1>${t('Let’s discuss<br>your project<span class="orange">.</span>', 'Cùng trao đổi<br>về dự án của bạn<span class="orange">.</span>')}</h1><p>${t('Tell me what you’re imagining. We’ll find the right way to bring it to life.', 'Hãy chia sẻ điều bạn đang hình dung. Chúng ta sẽ cùng tìm cách đưa ý tưởng thành hiện thực.')}</p><div class="contact-methods"><a class="contact-method-link" href="mailto:dattvq98@gmail.com"><span class="method-tag">EMAIL</span><span class="method-val">dattvq98@gmail.com</span>${arrow}</a><a class="contact-method-link" href="tel:0708814771"><span class="method-tag">${t('PHONE', 'ĐIỆN THOẠI')}</span><span class="method-val">0708 814 771</span>${arrow}</a><a class="contact-method-link contact-zalo-highlight" href="https://zalo.me/0708814771" target="_blank" rel="noopener noreferrer"><span class="method-tag">ZALO CHAT &amp; CALL</span><span class="method-val">0708 814 771</span>${arrow}</a><button type="button" class="contact-method-link contact-zalo-qr-trigger" id="open-zalo-qr-btn"><span class="method-tag">ZALO QR CODE</span><span class="method-val">${t('Scan official card', 'Xem danh thiếp QR')}</span>${arrow}</button></div><a class="contact-cv text-link" href="/Dat-Truong-CV.pdf" target="_blank" rel="noopener noreferrer">${t('Download Curriculum Vitae (PDF)', 'Tải Curriculum Vitae (PDF)')} ${arrow}</a><div class="contact-person"><img src="/dat-truong-avatar.webp" alt="${name}" class="contact-avatar-cutout"><div><strong>${name}</strong><span>Senior Video Editor & Media Specialist</span><span class="availability"><i></i>${t('Available for projects', 'Sẵn sàng cho dự án mới')}</span></div></div></div><form id="contact-form" class="contact-form"><div class="form-heading"><span class="eyebrow">${t('PROJECT ENQUIRY', 'THÔNG TIN DỰ ÁN')}</span><h2>${t('Tell me about your project', 'Chia sẻ về dự án của bạn')}</h2></div><label for="full-name">${t('Your name', 'Tên của bạn')}<input id="full-name" name="name" autocomplete="name" placeholder="${t('How should I call you?', 'Tôi nên gọi bạn là gì?')}" required maxlength="100"></label><label for="email-address">Email<input id="email-address" name="email" type="email" autocomplete="email" placeholder="you@company.com" required maxlength="150"></label><label for="service">${t('What are you looking for?', 'Bạn đang cần dịch vụ gì?')}<select id="service" name="service"><option value="">${t('Select a service', 'Chọn dịch vụ')}</option>${services.map((s,i)=>`<option value="${i}">${t(s[0],s[1])}</option>`).join('')}</select></label><label for="message">${t('A little about your project', 'Chia sẻ về dự án')}<textarea id="message" name="message" rows="4" placeholder="${t('Your idea, deliverables, timeline and budget…', 'Ý tưởng, sản phẩm bàn giao, lịch trình và ngân sách…')}" required maxlength="4000"></textarea></label><button class="button button-orange" type="submit">${t('Prepare project email', 'Soạn email dự án')} ${arrow}</button><p class="form-note">${t('Creates an email draft for you to review and send in your email app.', 'Tạo bản nháp để bạn kiểm tra và gửi bằng ứng dụng email.')}</p><div id="email-ready" hidden role="status"><p>${t('Your brief is ready. Open your email app to review and send it, or copy it and email me directly.', 'Brief đã sẵn sàng. Mở ứng dụng email để kiểm tra và gửi, hoặc sao chép nội dung và gửi email trực tiếp.')}</p><a id="email-draft" class="text-link" href="mailto:dattvq98@gmail.com">${t('Open email draft', 'Mở bản nháp email')} ${arrow}</a><button type="button" id="copy-brief" class="text-link">${t('Copy brief', 'Sao chép brief')}</button><textarea id="brief-fallback" readonly hidden aria-label="${t('Prepared project brief', 'Brief dự án đã soạn')}"></textarea></div></form></section>${faq}</main>${footer}${dialog}${zaloDialog}`;

  const portfolio = `${header(false)}<main id="main">${hero}${work}${clients}${about}${serviceSection}${faq}${cta}</main>${footer}${dialog}${zaloDialog}`;

  for (const isContact of [false,true]) {
    const title = isContact ? t('Let’s talk — Dat Truong', 'Liên hệ — Đạt Trương') : t('Dat Truong — Video Editor & Visual Storyteller', 'Đạt Trương — Dựng phim & Kể chuyện bằng hình ảnh');
    const description = t('Commercial films, social campaigns and AI filmmaking by Dat Truong. Explore selected work and watch Những điều ta quên.', 'Phim thương mại, chiến dịch mạng xã hội và phim AI của Đạt Trương. Khám phá portfolio và xem Những điều ta quên.');
    const html = `<!doctype html>\n<html lang="${vi?'vi':'en'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#04060c"><meta name="description" content="${description}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${description}"><meta property="og:type" content="website"><meta property="og:image" content="/posters/nhung-dieu-ta-quen.webp"><title>${title}</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="preload" href="/fonts/manrope-variable.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="/src/style.css"></head><body id="top">${backdrop}${isContact?contactPage:portfolio}<script type="module" src="/src/main.js"></script></body></html>\n`;
    writeFileSync(new URL(`../${isContact?'contact':'index'}${vi?'-vi':''}.html`, import.meta.url), html);
  }
}
console.log('Rendered portfolio and contact pages in English and Vietnamese.');
