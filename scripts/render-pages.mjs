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
      id: 'premiere-pro',
      distributor: 'Adobe Inc.',
      name: 'Adobe Premiere Pro',
      featured: false,
      tag: 'Primary NLE',
      logo: '/tools/adobe-premiere.webp',
      desc: t('Primary commercial post-production backbone for non-linear assembly, narrative pacing, multi-camera sequences, audio synchronization and high-throughput project delivery.', 'Hệ thống dựng phim thương mại chủ lực phục vụ dựng thô đến tinh chỉnh mạch truyện, dựng đa máy quay, đồng bộ âm thanh và bàn giao dự án hiệu suất cao.'),
      subchips: []
    },
    {
      id: 'after-effects',
      distributor: 'Adobe Inc.',
      name: 'Adobe After Effects',
      featured: false,
      tag: 'Motion & VFX',
      logo: '/tools/adobe-after-effects.webp',
      desc: t('Advanced motion graphics design, keyframe animation, visual effects compositing, planar tracking, screen replacement and promotional title choreography.', 'Thiết kế motion graphics chuyên sâu, diễn hoạt keyframe, kỹ xảo tổng hợp VFX, theo dõi chuyển động (tracking) và chuyển động chữ quảng cáo.'),
      subchips: []
    },
    {
      id: 'photoshop',
      distributor: 'Adobe Inc.',
      name: 'Adobe Photoshop',
      featured: false,
      tag: 'Key Visual & Art',
      logo: '/tools/adobe-photoshop.webp',
      desc: t('Concept art manipulation, high-impact thumbnail design, texture synthesis, image retouching and visual asset preparation for video compositing.', 'Thiết kế key visual, thumbnail chiến dịch thu hút, xử lý concept art, chất liệu và chuẩn bị tư liệu đồ họa phân giải cao cho dựng phim.'),
      subchips: []
    },
    {
      id: 'illustrator',
      distributor: 'Adobe Inc.',
      name: 'Adobe Illustrator',
      featured: false,
      tag: 'Vector & Type',
      logo: '/tools/adobe-illustrator.webp',
      desc: t('Precision vector graphics, custom brand iconography, vector title layout and scalable asset production for motion animation pipelines.', 'Thiết kế đồ họa vector chuẩn xác, hệ thống biểu tượng thương hiệu, typography phân giải độc lập và tư liệu cho quy trình animation.'),
      subchips: []
    },
    {
      id: 'audition',
      distributor: 'Adobe Inc.',
      name: 'Adobe Audition',
      featured: false,
      tag: 'Audio Cleanup',
      logo: '/tools/adobe-audition.webp',
      desc: t('Multi-track audio restoration, dialogue noise reduction, spectral frequency editing, loudness balancing and final broadcast mastering.', 'Phục hồi và xử lý âm thanh đa kênh, lọc tạp âm hội thoại, biên tập phổ tần, cân bằng độ lớn (loudness) và master âm thanh chuẩn phát sóng.'),
      subchips: []
    },
    {
      id: 'capcut',
      distributor: 'ByteDance',
      name: 'CapCut Pro',
      featured: false,
      tag: '9:16 Kinetic Video',
      logo: '/tools/capcut-icon-dark.png',
      desc: t('High-velocity vertical video editing, trend-responsive pacing, subtitle choreography, kinetic transitions and rapid social turnaround.', 'Dựng video dọc 9:16 tốc độ cao, nhịp dựng bắt trend, hiệu ứng phụ đề động, chuyển cảnh linh hoạt và tối ưu tốc độ bàn giao chiến dịch.'),
      subchips: []
    },
    {
      id: 'davinci',
      distributor: 'Blackmagic Design',
      name: 'DaVinci Resolve',
      featured: false,
      tag: 'Color Science',
      logo: '/tools/davinci-resolve.webp',
      logoFit: 'padded',
      desc: t('Node-based color grading, digital film emulation, contrast balancing, shot-to-shot matching and broadcast delivery calibration.', 'Chỉnh màu node-based chuyên sâu, giả lập chất phim điện ảnh, cân bằng tương phản, đồng nhất màu sắc và chuẩn hóa dải màu phát sóng.'),
      subchips: []
    },
    {
      id: 'chatgpt',
      distributor: 'OpenAI',
      name: 'ChatGPT',
      featured: false,
      tag: 'Narrative & Prompt',
      logo: '/tools/chatgpt-badge.png',
      desc: t('Creative script ideation, narrative structure breakdown, story treatment drafting, concept brainstorming and generative prompt engineering.', 'Phát triển ý tưởng kịch bản, cấu trúc mạch truyện, phác thảo concept, brainstorming góc nhìn sáng tạo và thiết kế prompt tạo sinh chuyên sâu.'),
      subchips: []
    },
    {
      id: 'claude',
      distributor: 'Anthropic',
      name: 'Claude',
      featured: false,
      tag: 'Script Architecture',
      logo: '/tools/claude-icon.png',
      desc: t('Long-form storytelling development, storyboard dialogue refinement, emotional tone calibration and structured editorial documentation.', 'Xây dựng kịch bản chiều sâu, tinh chỉnh lời thoại phân cảnh, hiệu chỉnh nhịp cảm xúc và văn phong sáng tạo chuẩn hóa tài liệu sản xuất.'),
      subchips: []
    },
    {
      id: 'gemini',
      distributor: 'Google',
      name: 'Google Gemini',
      featured: false,
      tag: 'Multimodal AI',
      logo: '/tools/gemini-icon.webp',
      logoFit: 'padded',
      desc: t('Multimodal reference research, visual moodboard analysis, creative concept breakdown and cross-domain media intelligence synthesis.', 'Nghiên cứu tư liệu đa phương thức, phân tích moodboard hình ảnh, mổ xẻ ý tưởng visual và tổng hợp tri thức media đa nền tảng.'),
      subchips: []
    }
  ];

  const aiTools = [
    {
      id: 'google',
      distributor: 'Google DeepMind',
      name: 'Google Flow AI',
      featured: true,
      tag: t('Frontier Models · 2 Models', 'Mô hình tiên phong · 2 mô hình'),
      logo: '/tools/google-flow.webp',
      desc: t('Flagship generative intelligence suite combining cinematic video model Veo 3.1 with next-generation multimodal vision foundation Nano Banana Pro.', 'Hệ sinh thái AI tạo sinh đỉnh cao kết hợp mô hình video điện ảnh Veo 3.1 và nền tảng thị giác đa phương thức thế hệ mới Nano Banana Pro.'),
      subchips: [
        { key: 'Veo 3.1', name: '', role: t('Cinematic Video Generation', 'Tạo video điện ảnh sắc nét') },
        { key: 'Nano Banana Pro', name: '', role: t('Multimodal Visual Foundation', 'Mô hình thị giác cao cấp') }
      ]
    },
    {
      id: 'bytedance-ai',
      distributor: 'ByteDance / BytePlus',
      name: 'BytePlus AI',
      featured: true,
      tag: t('Generative Models · 2 Models', 'Mô hình tạo sinh · 2 mô hình'),
      logo: '/tools/byteplus-icon.png',
      logoFit: 'padded',
      desc: t('Enterprise generative video and visual intelligence platform powering cinematic motion video with Seedance and ultra high-fidelity diffusion imagery with Seedream.', 'Nền tảng AI tạo sinh chuẩn doanh nghiệp vận hành mô hình sinh video chuyển động mượt mà Seedance và mô hình tạo ảnh phân giải cao Seedream.'),
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
      logo: '/tools/runway-icon.png',
      desc: t('World simulation models, dynamic camera choreography and temporal scene transitions for cinematic worldbuilding.', 'Mô hình mô phỏng bối cảnh thế giới, chuyển động máy quay đa chiều và chuyển cảnh mượt mà chuẩn điện ảnh.'),
      subchips: []
    },
    {
      id: 'kling',
      distributor: 'Kuaishou',
      name: 'Kling AI',
      featured: false,
      tag: 'Kling 1.5',
      logo: '/tools/kling-icon.png',
      desc: t('Realistic physical world simulation, fluid motion dynamics, complex prompt adherence and multi-angle cinematic scenes.', 'Mô phỏng vật lý chuyển động thế giới thực, chuyển động tự nhiên, bám sát prompt và góc quay điện ảnh đa chiều.'),
      subchips: []
    },
    {
      id: 'elevenlabs',
      distributor: 'ElevenLabs',
      name: 'ElevenLabs',
      featured: false,
      tag: 'Voice & SFX AI',
      logo: '/tools/elevenlabs-icon.png',
      desc: t('Emotionally expressive neural voice cloning, multilingual dialogue dubbing, acoustic pacing and Foley sound effect synthesis.', 'Nhân bản giọng nói AI truyền cảm, lồng tiếng đa ngôn ngữ, chuẩn nhịp cảm xúc và tạo hiệu ứng âm thanh Foley điện ảnh.'),
      subchips: []
    },
    {
      id: 'higgsfield',
      distributor: 'Higgsfield',
      name: 'Higgsfield AI',
      featured: false,
      tag: 'Cinema Video AI',
      logo: '/tools/higgsfield-icon.png',
      desc: t('Specialized cinema camera angles, dynamic body control, realistic kinetic action and character-consistent narrative generation.', 'Điều khiển góc máy điện ảnh chuyên biệt, chuyển động cơ thể sống động và duy trì tính nhất quán nhân vật trong phân cảnh.'),
      subchips: []
    },
    {
      id: 'midjourney',
      distributor: 'Midjourney Inc.',
      name: 'Midjourney',
      featured: false,
      tag: 'v6 / Niji',
      logo: '/tools/midjourney-icon.png',
      desc: t('Photorealistic concept art, lighting textures, key visual exploration, atmosphere creation and cinematic storyboards.', 'Phác thảo concept visual chân thực, moodboard ánh sáng, khám phá ý tưởng thẩm mỹ và phân cảnh storyboard chi tiết.'),
      subchips: []
    },
    {
      id: 'minimax',
      distributor: 'MiniMax (Hailuo AI)',
      name: 'MiniMax',
      featured: false,
      tag: 'Cinematic Video Model',
      logo: '/tools/minimax-icon.png',
      logoFit: 'padded',
      desc: t('Next-generation high-definition text-to-video engine with organic character movement, cinematic composition and high physical fidelity.', 'Mô hình tạo sinh video điện ảnh thế hệ mới với chuyển động nhân vật tự nhiên, góc quay đậm chất điện ảnh và độ chân thực cao.'),
      subchips: []
    },
    {
      id: 'vbee',
      distributor: 'Vbee',
      name: 'Vbee AI',
      featured: false,
      tag: 'Vietnamese Neural TTS',
      logo: '/tools/vbee-badge.png',
      desc: t('Natural Vietnamese neural speech synthesis tailored for commercial ads, campaign spots and broadcast narration across dialects.', 'Giọng đọc AI tiếng Việt tự nhiên, đa ngữ điệu vùng miền chuẩn xác cho video quảng cáo và phóng sự truyền hình.'),
      subchips: []
    }
  ];

  const renderToolCard = (item) => {
    const subchipsHtml = item.subchips && item.subchips.length > 0
      ? `<div class="tool-subchips">${item.subchips.map(sc => `<span class="tool-subchip"><strong class="subchip-key">${sc.key}</strong>${sc.name ? `<span class="subchip-name">${sc.name}</span>` : ''}<span class="subchip-role">${sc.role}</span></span>`).join('')}</div>`
      : '';
    const logoHtml = item.logo
      ? `<div class="tool-logo-frame" ${item.logoFit ? `data-fit="${item.logoFit}"` : ''}><img class="tool-logo-img" src="${item.logo}" alt="${item.name} logo" width="36" height="36" loading="lazy" decoding="async"></div>`
      : (item.svg || '');
    return `<article class="tool-card ${item.featured ? 'tool-card-featured' : ''}" data-tool="${item.id}"><div class="tool-card-head"><div class="tool-card-brand">${logoHtml}<div><h5 class="tool-name">${item.name}</h5><span class="tool-distributor">${item.distributor}</span></div></div><span class="tool-model-tag">${item.tag}</span></div><p class="tool-desc">${item.desc}</p>${subchipsHtml}</article>`;
  };

  const toolkitHtml = `<div class="shell toolkit"><div class="toolkit-top"><div><span class="eyebrow">${t('TOOLS OF THE TRADE', 'BỘ CÔNG CỤ')}</span><h3>${t('Software & AI Stack', 'Công cụ & Mô hình AI')}</h3><p class="toolkit-lead">${t('An integrated pipeline combining industry-standard post-production suites with next-generation generative AI video and visual models.', 'Quy trình hậu kỳ hợp nhất kết hợp phần mềm sáng tạo tiêu chuẩn điện ảnh và các mô hình AI tạo sinh đa phương thức tiên tiến nhất.')}</p></div><div class="credentials"><span class="eyebrow">${t('RECOGNITION & LEARNING', 'GHI NHẬN & HỌC TẬP')}</span><p><strong>${t('Sony Alpha Vietnam', 'Sony Alpha Việt Nam')}</strong><br>${t('Selection of the Month · August 2024', 'Video ấn tượng nhất tháng · 08.2024')}</p><details><summary>${t('Courses & credentials', 'Khóa học & Chứng chỉ')} <span>+</span></summary><ul><li>AI Video School: Veo 3.1, Kling, Sora+ — Udemy, 27h, 03.2026</li><li>Diffusion Mastery: Flux, Stable Diffusion, Midjourney — Udemy, 22.5h, 03.2026</li><li>IELTS Academic 6.0 — IDP, 2019</li></ul></details></div></div><div class="toolkit-groups"><div class="tool-group"><div class="tool-group-header"><div class="tool-group-title-wrap"><span class="tool-group-badge tool-badge-app">${t('CREATIVE APPLICATIONS', 'PHẦN MỀM SÁNG TẠO')}</span><h4>${t('Post-Production & Creative Suites', 'Hệ phần mềm dựng phim & sáng tạo')}</h4></div><span class="tool-group-count">${appTools.length} ${t('APPLICATIONS', 'ỨNG DỤNG')}</span></div><div class="tool-grid tool-grid-apps">${appTools.map(renderToolCard).join('')}</div></div><div class="tool-group"><div class="tool-group-header"><div class="tool-group-title-wrap"><span class="tool-group-badge tool-badge-ai">${t('AI TOOL MODELS & ENGINES', 'MÔ HÌNH AI & CÔNG NGHỆ TẠO SINH')}</span><h4>${t('Generative Video & Multimodal Engines', 'Mô hình sinh video & công nghệ AI')}</h4></div><span class="tool-group-count">${aiTools.length} ${t('MODELS & ENGINES', 'MÔ HÌNH & ENGINE')}</span></div><div class="tool-grid tool-grid-ai">${aiTools.map(renderToolCard).join('')}</div></div></div></div>`;

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
