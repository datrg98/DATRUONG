import { writeFileSync, readFileSync, existsSync, statSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const fontBase64 = readFileSync('public/fonts/manrope-variable.ttf').toString('base64');
const photoBase64 = readFileSync('public/profile.jpg').toString('base64');

// High-end, executive 1-page A4 resume design
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Đạt Trương — Senior Video Editor & Media Specialist</title>
<style>
@font-face {
  font-family: 'Manrope';
  src: url('data:font/truetype;charset=utf-8;base64,${fontBase64}') format('truetype');
  font-weight: 300 800;
  font-style: normal;
}

@page {
  size: A4 portrait;
  margin: 0;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  background: #ffffff;
  color: #1e293b;
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 8.5pt;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  overflow: hidden;
}

.page {
  width: 210mm;
  height: 297mm;
  padding: 12mm 15mm 10mm 15mm;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding-bottom: 11px;
  border-bottom: 2px solid #0f172a;
}

.header-left {
  flex: 1;
}

.header-name {
  font-size: 24pt;
  font-weight: 800;
  letter-spacing: -0.02em;
  word-spacing: 0.08em;
  color: #090d16;
  line-height: 1.05;
}

.header-name span.accent {
  color: #4f46e5;
}

.header-title {
  font-size: 10pt;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #4f46e5;
  margin-top: 4px;
  margin-bottom: 9px;
}

.header-contacts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 18px;
  font-size: 8.3pt;
  color: #475569;
}

.header-contact-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  color: #475569;
}

.header-contact-item.portfolio {
  color: #0f172a;
  font-weight: 700;
  background: #f1f5f9;
  padding: 2.5px 8px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
}

.header-contact-item svg {
  width: 12px;
  height: 12px;
  stroke: #4f46e5;
  stroke-width: 2;
  fill: none;
  flex-shrink: 0;
}

.header-photo {
  width: 72px;
  height: 88px;
  border-radius: 6px;
  overflow: hidden;
  border: 1.5px solid #cbd5e1;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  background: #0f172a;
  position: relative;
}

.header-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 25% 10%;
  transform: scale(1.22);
}

/* Summary */
.summary {
  margin-top: 9px;
  padding: 7px 12px;
  background: #f8fafc;
  border-left: 3.5px solid #4f46e5;
  border-radius: 0 5px 5px 0;
  font-size: 8.2pt;
  line-height: 1.45;
  color: #334155;
}

.summary strong {
  color: #0f172a;
  font-weight: 700;
}

/* Highlights Banner */
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 11px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  padding: 5px 8px;
  text-align: center;
}

.metric-value {
  font-size: 11.2pt;
  font-weight: 800;
  color: #4f46e5;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.metric-label {
  font-size: 6.9pt;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-top: 2px;
}

/* Layout Columns */
.main-grid {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 16px;
  flex: 1;
}

/* Section Headings */
.section-title {
  font-size: 8.8pt;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 3.5px;
  margin-bottom: 8px;
  border-bottom: 1.2px solid #e2e8f0;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 3.5px;
  height: 11px;
  background: #4f46e5;
  border-radius: 1px;
}

/* Experience Block */
.experience-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.job {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.job-role {
  font-size: 8.8pt;
  font-weight: 700;
  color: #0f172a;
}

.job-date {
  font-size: 7.7pt;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.job-company {
  font-size: 7.9pt;
  font-weight: 700;
  color: #4f46e5;
  letter-spacing: 0.02em;
  margin-bottom: 2.5px;
}

.job-bullets {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2.6px;
}

.job-bullets li {
  position: relative;
  padding-left: 10px;
  font-size: 7.9pt;
  line-height: 1.38;
  color: #334155;
}

.job-bullets li::before {
  content: '•';
  position: absolute;
  left: 1px;
  top: -0.5px;
  color: #4f46e5;
  font-size: 9pt;
}

/* Right Column Panels */
.right-col {
  display: flex;
  flex-direction: column;
  gap: 9.5px;
}

.side-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skill-group {
  margin-bottom: 5px;
}

.skill-group:last-child {
  margin-bottom: 0;
}

.skill-group-title {
  font-size: 7.8pt;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2.5px;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3.5px;
}

.badge {
  font-size: 7.1pt;
  font-weight: 600;
  padding: 1.5px 5.5px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 3px;
  color: #334155;
}

.badge.primary {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #3730a3;
}

.edu-item {
  margin-bottom: 4.5px;
}

.edu-item:last-child {
  margin-bottom: 0;
}

.edu-school {
  font-size: 8.1pt;
  font-weight: 700;
  color: #0f172a;
}

.edu-degree {
  font-size: 7.7pt;
  color: #334155;
}

.edu-date {
  font-size: 7.3pt;
  color: #64748b;
  font-weight: 600;
}

.award-item {
  margin-bottom: 4px;
}

.award-item:last-child {
  margin-bottom: 0;
}

.award-name {
  font-size: 7.8pt;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.award-org {
  font-size: 7.3pt;
  color: #64748b;
}

.brands-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 5px;
  background: #f8fafc;
  padding: 5px 7px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.brand-pill {
  font-size: 7.1pt;
  color: #334155;
  font-weight: 500;
}

.brand-pill::after {
  content: '·';
  margin-left: 5px;
  color: #94a3b8;
}

.brand-pill:last-child::after {
  content: '';
}

.brand-pill.more {
  color: #4f46e5;
  font-weight: 700;
}

/* Footer Note */
.footer-note {
  margin-top: auto;
  padding-top: 5px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 6.8pt;
  color: #94a3b8;
}

.footer-note a {
  color: #64748b;
  text-decoration: none;
}
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <h1 class="header-name">ĐẠT TRƯƠNG<span class="accent">.</span></h1>
      <div class="header-title">Senior Video Editor &amp; Media Specialist</div>
      <div class="header-contacts">
        <a class="header-contact-item" href="tel:+84708814771">
          <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          +84 708 814 771
        </a>
        <a class="header-contact-item" href="mailto:dattvq98@gmail.com">
          <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          dattvq98@gmail.com
        </a>
        <span class="header-contact-item">
          <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          District 3, Ho Chi Minh City
        </span>
        <a class="header-contact-item portfolio" href="https://datruong.vercel.app" target="_blank">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>
          datruong.vercel.app
        </a>
        <a class="header-contact-item" href="https://facebook.com/tvqdat" target="_blank">
          <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          facebook.com/tvqdat
        </a>
      </div>
    </div>
    <div class="header-photo">
      <img src="data:image/jpeg;base64,${photoBase64}" alt="Đạt Trương">
    </div>
  </header>

  <!-- Summary -->
  <section class="summary">
    <strong>Senior Video Editor &amp; Media Specialist</strong> with extensive experience directing post-production for <strong>40+ tier-1 &amp; global brands</strong> (Adidas, Puma, Converse, Gillette, Olay, Rohto, P&amp;G, Unilever, LG). Combines commercial cinematography, kinetic motion design, and cutting-edge generative AI workflows (Runway, Kling, Vbee) with audience retention analytics to deliver high-converting campaigns and cinematic storytelling.
  </section>

  <!-- Metrics -->
  <section class="metrics">
    <div class="metric-card">
      <div class="metric-value">11.6M+</div>
      <div class="metric-label">Peak Video Views</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">40+</div>
      <div class="metric-label">Client Brands</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">AI Film</div>
      <div class="metric-label">Higgsfield Contest Finalist</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">Sony Alpha</div>
      <div class="metric-label">Selection of the Month</div>
    </div>
  </section>

  <!-- Two-Column Body -->
  <div class="main-grid">

    <!-- Left Column: Work Experience -->
    <div class="left-col">
      <h2 class="section-title">Professional Experience</h2>
      <div class="experience-list">

        <!-- Job 1 -->
        <div class="job">
          <div class="job-header">
            <span class="job-role">Senior Video Editor</span>
            <span class="job-date">03.2026 — Present</span>
          </div>
          <div class="job-company">ONPOINT E-COMMERCE ENABLER</div>
          <ul class="job-bullets">
            <li>Lead and mentor the post-production video editing unit; standardize daily operational workflows and implement strict QC frameworks to ensure rapid, consistent campaign delivery.</li>
            <li>Act as key technical &amp; creative consultant in direct brand client meetings to align visual pacing, color grading, tone, and sound design with brand identity.</li>
            <li>Analyze video performance and audience retention curves to iteratively engineer opening hooks, narrative transitions, and pacing for maximum watch-time.</li>
          </ul>
        </div>

        <!-- Job 2 -->
        <div class="job">
          <div class="job-header">
            <span class="job-role">Video Editor</span>
            <span class="job-date">10.2024 — 03.2026</span>
          </div>
          <div class="job-company">ONPOINT E-COMMERCE ENABLER</div>
          <ul class="job-bullets">
            <li>Spearheaded comprehensive commercial video editing and kinetic motion graphics for Rohto, Nivea, Romano, and UI MASS for high-stakes Mega Day &amp; Brand Day campaigns.</li>
            <li>Pioneered operational integration of generative AI suites (Runway, Kling, Vbee) into commercial timelines to deliver striking visual sequences with high speed and low cost.</li>
            <li>Produced high-concept pitch showreels and commercial sizzles that helped secure multiple corporate enterprise accounts and brand contracts.</li>
          </ul>
        </div>

        <!-- Job 3 -->
        <div class="job">
          <div class="job-header">
            <span class="job-role">Videographer &amp; Video Editor</span>
            <span class="job-date">12.2023 — 10.2024</span>
          </div>
          <div class="job-company">NEW ERA MEDIA</div>
          <ul class="job-bullets">
            <li>Produced, captured, and edited corporate content libraries, high-end product reviews, and live promotional events from multi-camera setups to final master exports.</li>
            <li>Managed studio camera readiness, cinema lens packages, and lighting equipment for multi-camera on-location productions.</li>
          </ul>
        </div>

        <!-- Job 4 -->
        <div class="job">
          <div class="job-header">
            <span class="job-role">Photographer &amp; Retoucher</span>
            <span class="job-date">12.2023 — 10.2024</span>
          </div>
          <div class="job-company">WONDERJOY STUDIO</div>
          <ul class="job-bullets">
            <li>Produced commercial studio photography and precision skin/product retouching for corporate and lifestyle clients; developed custom studio lighting schematics.</li>
          </ul>
        </div>

        <!-- Job 5 -->
        <div class="job">
          <div class="job-header">
            <span class="job-role">Media Specialist (Part-Time)</span>
            <span class="job-date">08.2023 — 12.2023</span>
          </div>
          <div class="job-company">GREEN ACADEMY VIETNAM</div>
          <ul class="job-bullets">
            <li>Filmed and edited promotional interview series and video ads; designed foundational commercial collateral, marketing brochures, and course catalogs.</li>
          </ul>
        </div>

      </div>
    </div>

    <!-- Right Column: Skills, Education, Awards, Brands -->
    <div class="right-col">

      <!-- Technical Skills -->
      <div class="side-block">
        <h2 class="section-title">Technical Expertise</h2>
        
        <div class="skill-group">
          <div class="skill-group-title">Post-Production &amp; Motion</div>
          <div class="badge-row">
            <span class="badge primary">Premiere Pro</span>
            <span class="badge primary">After Effects</span>
            <span class="badge">CapCut Pro</span>
            <span class="badge">DaVinci Resolve</span>
            <span class="badge">Audition</span>
          </div>
        </div>

        <div class="skill-group">
          <div class="skill-group-title">Generative AI Video Pipelines</div>
          <div class="badge-row">
            <span class="badge primary">Runway Gen-3</span>
            <span class="badge primary">Kling AI</span>
            <span class="badge">Vbee AI</span>
            <span class="badge">Midjourney</span>
            <span class="badge">Flux / SD</span>
            <span class="badge">Sora+</span>
          </div>
        </div>

        <div class="skill-group">
          <div class="skill-group-title">Design, Audio &amp; Camera</div>
          <div class="badge-row">
            <span class="badge">Photoshop</span>
            <span class="badge">Illustrator</span>
            <span class="badge">Sound Design</span>
            <span class="badge">Color Grading</span>
            <span class="badge">Cinematography</span>
            <span class="badge">Studio Lighting</span>
          </div>
        </div>
      </div>

      <!-- Core Strengths -->
      <div class="side-block">
        <h2 class="section-title">Core Strengths</h2>
        <div class="badge-row">
          <span class="badge">Pipeline QC</span>
          <span class="badge">Team Mentorship</span>
          <span class="badge">Retention Analytics</span>
          <span class="badge">Storyboarding</span>
          <span class="badge">Brand Pitching</span>
          <span class="badge">Multi-cam Ops</span>
        </div>
      </div>

      <!-- Education & Credentials -->
      <div class="side-block">
        <h2 class="section-title">Education &amp; Credentials</h2>
        <div class="edu-item">
          <div class="edu-school">HCM City University of Technology</div>
          <div class="edu-degree">B.Sc. in Computer Engineering</div>
          <div class="edu-date">2016 — 2024 · HCMUT - BKU</div>
        </div>
        <div class="edu-item">
          <div class="edu-school">IELTS Academic — Band 6.0</div>
          <div class="edu-degree">Issued by IDP (2019)</div>
        </div>
        <div class="edu-item">
          <div class="edu-school">Udemy Professional Courses (2026)</div>
          <div class="edu-degree">• AI Video School: Veo3, Kling, Sora+ (27h)</div>
          <div class="edu-degree">• Diffusion Mastery: Flux, SD, Midjourney (22.5h)</div>
        </div>
      </div>

      <!-- Honors & Awards -->
      <div class="side-block">
        <h2 class="section-title">Honors &amp; Awards</h2>
        <div class="award-item">
          <div class="award-name">Selection of the Month — Most Impressive Video</div>
          <div class="award-org">Sony Alpha Vietnam Workshop · Aug 2024</div>
        </div>
        <div class="award-item">
          <div class="award-name">Teaching Assistant of the Year</div>
          <div class="award-org">Vietnam USA Society (VUS) · 2019</div>
        </div>
        <div class="award-item">
          <div class="award-name">Presentation Contest — Second Prize</div>
          <div class="award-org">OISP | HCMUT · 2016</div>
        </div>
      </div>

      <!-- Select Brands -->
      <div class="side-block">
        <h2 class="section-title">Key Client Brands (40+)</h2>
        <div class="brands-wrap">
          <span class="brand-pill">Adidas</span>
          <span class="brand-pill">Puma</span>
          <span class="brand-pill">Converse</span>
          <span class="brand-pill">Gillette</span>
          <span class="brand-pill">Olay</span>
          <span class="brand-pill">Oral-B</span>
          <span class="brand-pill">Rohto</span>
          <span class="brand-pill">Belcube</span>
          <span class="brand-pill">Betadine</span>
          <span class="brand-pill">P&amp;G</span>
          <span class="brand-pill">Unilever</span>
          <span class="brand-pill">LG</span>
          <span class="brand-pill">CeraVe</span>
          <span class="brand-pill">The Body Shop</span>
          <span class="brand-pill">Logitech</span>
          <span class="brand-pill">Sensodyne</span>
          <span class="brand-pill">Swisse</span>
          <span class="brand-pill">Coolmate</span>
          <span class="brand-pill">Romano</span>
          <span class="brand-pill more">+20 more</span>
        </div>
      </div>

    </div>

  </div>

  <!-- Subtle Footer -->
  <footer class="footer-note">
    <span>Portfolio &amp; Interactive Work: <a href="https://datruong.vercel.app">https://datruong.vercel.app</a></span>
    <span>Trương Văn Quang Đạt — Curriculum Vitae · 2026</span>
  </footer>

</div>
</body>
</html>`;

writeFileSync('tmp/resume.html', html, 'utf8');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = resolve('tmp/resume.html');
const outPdf = resolve('output/pdf/TRUONG_VAN_QUANG_DAT_CV.pdf');
const publicPdf1 = resolve('public/Dat-Truong-CV.pdf');
const publicPdf2 = resolve('public/TRUONG_VAN_QUANG_DAT_CV.pdf');

// Render with headless Chrome
const cmd = `"${chrome}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outPdf}" "${htmlPath}"`;
execSync(cmd);

copyFileSync(outPdf, publicPdf1);
copyFileSync(outPdf, publicPdf2);

// Check page count
const buf = readFileSync(outPdf);
const matches = buf.toString('binary').match(/\/Type\s*\/Page\b/g);
const pageCount = matches ? matches.length : 1;
const size = statSync(outPdf).size;

console.log(JSON.stringify({
  success: true,
  output: outPdf,
  publicPdf: publicPdf1,
  sizeBytes: size,
  pageCount: pageCount
}, null, 2));
