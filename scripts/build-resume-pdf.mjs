import { writeFileSync, readFileSync, existsSync, statSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const fontBase64 = readFileSync('public/fonts/manrope-variable.ttf').toString('base64');

// Professional, ATS-friendly, Executive 1-page A4 Resume (Distinct from the CV)
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Dat Truong — Senior Video Editor & Post-Production Specialist Resume</title>
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
  font-size: 8.4pt;
  line-height: 1.42;
  -webkit-font-smoothing: antialiased;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  overflow: hidden;
}

.resume-page {
  width: 210mm;
  height: 297mm;
  padding: 12mm 15mm 10mm 15mm;
  display: flex;
  flex-direction: column;
}

/* Header: Clean, corporate, ATS-friendly executive header */
.header {
  border-bottom: 2px solid #0f172a;
  padding-bottom: 9px;
  margin-bottom: 9px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.name {
  font-size: 22pt;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #090d16;
  line-height: 1;
}

.title-tag {
  font-size: 9.6pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #1e40af;
}

.contact-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  margin-top: 6px;
  font-size: 8.2pt;
  color: #475569;
}

.contact-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #334155;
  text-decoration: none;
}

.contact-item.highlight {
  font-weight: 700;
  color: #1e40af;
}

.contact-divider {
  color: #cbd5e1;
}

/* Sections */
.section {
  margin-bottom: 8.5px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 8.8pt;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #0f172a;
  padding-bottom: 2.5px;
  margin-bottom: 5.5px;
  border-bottom: 1.2px solid #cbd5e1;
}

.section-header::before {
  content: '';
  display: inline-block;
  width: 3.5px;
  height: 10px;
  background: #1e40af;
  border-radius: 1px;
}

/* Summary */
.summary-text {
  font-size: 8.1pt;
  line-height: 1.42;
  color: #334155;
  text-align: justify;
}

.summary-text strong {
  color: #0f172a;
  font-weight: 700;
}

/* Competencies Grid */
.competencies-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 14px;
  background: #f8fafc;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.comp-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.comp-title {
  font-size: 7.8pt;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.comp-desc {
  font-size: 7.5pt;
  color: #475569;
  line-height: 1.34;
}

/* Experience */
.experience-container {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.job {
  display: flex;
  flex-direction: column;
  gap: 1.5px;
}

.job-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.job-title-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.job-role {
  font-size: 8.7pt;
  font-weight: 700;
  color: #0f172a;
}

.job-company {
  font-size: 8pt;
  font-weight: 700;
  color: #1e40af;
  letter-spacing: 0.02em;
}

.job-meta {
  font-size: 7.7pt;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.job-bullets {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 1.5px;
}

.job-bullets li {
  position: relative;
  padding-left: 10px;
  font-size: 7.85pt;
  line-height: 1.36;
  color: #334155;
  text-align: justify;
}

.job-bullets li::before {
  content: '▪';
  position: absolute;
  left: 1px;
  top: -0.5px;
  color: #1e40af;
  font-size: 7.5pt;
}

.job-bullets li strong {
  color: #0f172a;
  font-weight: 700;
}

/* Split Columns for Achievements & Education */
.bottom-split {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 14px;
}

/* Achievements */
.achieve-list {
  display: flex;
  flex-direction: column;
  gap: 3.5px;
}

.achieve-item {
  display: flex;
  gap: 6px;
  align-items: baseline;
  font-size: 7.7pt;
  line-height: 1.35;
  color: #334155;
}

.achieve-bullet {
  color: #1e40af;
  font-size: 7.5pt;
  flex-shrink: 0;
}

.achieve-item strong {
  color: #0f172a;
  font-weight: 700;
}

/* Education & Certs */
.edu-block {
  display: flex;
  flex-direction: column;
  gap: 3.5px;
}

.edu-entry {
  display: flex;
  flex-direction: column;
  gap: 0.5px;
}

.edu-school {
  font-size: 8pt;
  font-weight: 700;
  color: #0f172a;
}

.edu-degree {
  font-size: 7.6pt;
  color: #334155;
}

.edu-date {
  font-size: 7.2pt;
  color: #64748b;
  font-weight: 600;
}

/* Client Brands Strip */
.brands-strip {
  font-size: 7.3pt;
  color: #475569;
  line-height: 1.38;
  background: #f8fafc;
  padding: 4.5px 8px;
  border-radius: 3px;
  border: 1px solid #e2e8f0;
}

.brands-strip strong {
  color: #0f172a;
}

/* Footer note */
.footer-note {
  margin-top: auto;
  padding-top: 4px;
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
<div class="resume-page">

  <!-- Header -->
  <header class="header">
    <div class="header-top">
      <h1 class="name">ĐẠT TRƯƠNG</h1>
      <span class="title-tag">Senior Video Editor &amp; Post-Production Specialist</span>
    </div>
    <div class="contact-bar">
      <span class="contact-item">Ho Chi Minh City, Vietnam</span>
      <span class="contact-divider">|</span>
      <a class="contact-item" href="tel:+84708814771">+84 708 814 771</a>
      <span class="contact-divider">|</span>
      <a class="contact-item" href="mailto:dattvq98@gmail.com">dattvq98@gmail.com</a>
      <span class="contact-divider">|</span>
      <a class="contact-item highlight" href="https://datruong.vercel.app" target="_blank">Portfolio: datruong.vercel.app</a>
      <span class="contact-divider">|</span>
      <a class="contact-item" href="https://facebook.com/tvqdat" target="_blank">facebook.com/tvqdat</a>
    </div>
  </header>

  <!-- Professional Summary -->
  <section class="section">
    <h2 class="section-header">Professional Summary</h2>
    <p class="summary-text">
      <strong>Senior Video Editor &amp; Post-Production Specialist</strong> with 5+ years of experience leading end-to-end commercial post-production for <strong>40+ tier-1 &amp; multinational brands</strong> (including Adidas, Puma, Converse, Gillette, Olay, Rohto, P&amp;G, Unilever, and LG). Proven track record standardizing high-velocity editing workflows, managing editor cohorts, integrating cutting-edge Generative AI suites (Runway Gen-3, Kling, Vbee) into commercial production lines, and utilizing viewer retention data to deliver <strong>11.6M+ peak views</strong> and high-conversion campaign outcomes.
    </p>
  </section>

  <!-- Core Competencies -->
  <section class="section">
    <h2 class="section-header">Core Competencies &amp; Technical Stack</h2>
    <div class="competencies-grid">
      <div class="comp-group">
        <span class="comp-title">Post-Production &amp; Motion Design</span>
        <span class="comp-desc">Adobe Premiere Pro, After Effects, CapCut Pro, DaVinci Resolve, Kinetic Typography, Motion Graphics</span>
      </div>
      <div class="comp-group">
        <span class="comp-title">Generative AI Video Pipelines</span>
        <span class="comp-desc">Runway (Gen-2 / Gen-3), Kling AI, Vbee AI, Midjourney, Stable Diffusion / Flux, Sora+ Workflows</span>
      </div>
      <div class="comp-group">
        <span class="comp-title">Audio Mixing &amp; Visual Assets</span>
        <span class="comp-desc">Adobe Audition, Photoshop, Illustrator, Multi-track Sound Design, Audio Restoration, Color Grading</span>
      </div>
      <div class="comp-group">
        <span class="comp-title">Production Leadership &amp; Analytics</span>
        <span class="comp-desc">Post-Production QC &amp; Mentorship, Audience Retention Optimization, Studio Lighting, Multi-cam Live Ops</span>
      </div>
    </div>
  </section>

  <!-- Professional Experience -->
  <section class="section">
    <h2 class="section-header">Professional Experience</h2>
    <div class="experience-container">

      <!-- Role 1 -->
      <div class="job">
        <div class="job-top">
          <div class="job-title-group">
            <span class="job-role">Senior Video Editor</span>
            <span class="job-company">ONPOINT E-COMMERCE ENABLER</span>
          </div>
          <span class="job-meta">03.2026 — Present | Ho Chi Minh City</span>
        </div>
        <ul class="job-bullets">
          <li><strong>Team Leadership &amp; QC:</strong> Lead and mentor the post-production editing team; standardized operational workflows and quality control frameworks, accelerating project delivery speed while maintaining consistent brand benchmarks.</li>
          <li><strong>Client Creative Direction:</strong> Act as primary technical and creative advisor in direct corporate meetings with brand partners, aligning pacing, visual hooks, color grading, and sonic identity with brand guidelines.</li>
          <li><strong>Retention Optimization:</strong> Analyze video performance data and audience drop-off metrics across TikTok, Reels, and YouTube to iteratively refine opening hooks, transitions, and narrative rhythm, maximizing viewer retention.</li>
        </ul>
      </div>

      <!-- Role 2 -->
      <div class="job">
        <div class="job-top">
          <div class="job-title-group">
            <span class="job-role">Commercial Video Editor</span>
            <span class="job-company">ONPOINT E-COMMERCE ENABLER</span>
          </div>
          <span class="job-meta">10.2024 — 03.2026 | Ho Chi Minh City</span>
        </div>
        <ul class="job-bullets">
          <li><strong>Commercial Campaign Delivery:</strong> Spearheaded comprehensive video editing and motion graphics for major brand portfolios, including Rohto, Nivea, Romano, and UI MASS, for high-stakes Mega Day and Brand Day shopping festivals.</li>
          <li><strong>Generative AI Pipeline Integration:</strong> Pioneered the operational adoption of generative AI video tools (Runway, Kling, Vbee) into commercial workflows, delivering surreal creative sequences with accelerated turnarounds.</li>
          <li><strong>Business Development:</strong> Produced high-concept pitch showreels and commercial sizzle reels that directly helped secure multiple new corporate accounts and commercial campaign contracts.</li>
        </ul>
      </div>

      <!-- Role 3 -->
      <div class="job">
        <div class="job-top">
          <div class="job-title-group">
            <span class="job-role">Commercial Videographer &amp; Editor</span>
            <span class="job-company">NEW ERA MEDIA</span>
          </div>
          <span class="job-meta">12.2023 — 10.2024 | Ho Chi Minh City</span>
        </div>
        <ul class="job-bullets">
          <li><strong>Production Execution:</strong> Produced, captured, and edited corporate content libraries, high-end product reviews, and live promotional events from multi-camera setups to final master delivery.</li>
          <li><strong>Studio &amp; Gear Management:</strong> Managed cinema camera systems, lens packages, and lighting gear for on-location and multi-camera studio productions.</li>
        </ul>
      </div>

      <!-- Role 4 -->
      <div class="job">
        <div class="job-top">
          <div class="job-title-group">
            <span class="job-role">Commercial Photographer &amp; Retoucher</span>
            <span class="job-company">WONDERJOY STUDIO</span>
          </div>
          <span class="job-meta">12.2023 — 10.2024 | Ho Chi Minh City</span>
        </div>
        <ul class="job-bullets">
          <li><strong>Studio Lighting &amp; Retouching:</strong> Executed commercial studio photography and precision digital skin/product retouching for corporate and lifestyle clients; developed custom technical studio lighting maps.</li>
        </ul>
      </div>

      <!-- Role 5 -->
      <div class="job">
        <div class="job-top">
          <div class="job-title-group">
            <span class="job-role">Media Specialist (Part-Time)</span>
            <span class="job-company">GREEN ACADEMY VIETNAM</span>
          </div>
          <span class="job-meta">08.2023 — 12.2023 | Ho Chi Minh City</span>
        </div>
        <ul class="job-bullets">
          <li><strong>Digital Content Production:</strong> Produced and edited promotional interview formats and video advertisements; designed foundational commercial collateral, marketing brochures, and course catalogs.</li>
        </ul>
      </div>

    </div>
  </section>

  <!-- Bottom Section: Achievements & Education/Credentials -->
  <div class="bottom-split section">
    
    <!-- Key Achievements & Industry Honors -->
    <div>
      <h2 class="section-header">Key Achievements &amp; Honors</h2>
      <div class="achieve-list">
        <div class="achieve-item">
          <span class="achieve-bullet">▪</span>
          <span><strong>11.6M+ Peak Video Views:</strong> Generated high-velocity engagement across viral brand and e-commerce campaigns.</span>
        </div>
        <div class="achieve-item">
          <span class="achieve-bullet">▪</span>
          <span><strong>AI Film Contest Finalist:</strong> Directed &amp; edited sci-fi AI short film <em>"Những điều ta quên"</em> (21:9 format, 4:48) for Higgsfield Film Contest.</span>
        </div>
        <div class="achieve-item">
          <span class="achieve-bullet">▪</span>
          <span><strong>Sony Alpha Vietnam Selection of the Month:</strong> Awarded Most Impressive Video (August 2024).</span>
        </div>
        <div class="achieve-item">
          <span class="achieve-bullet">▪</span>
          <span><strong>Teaching Assistant of the Year:</strong> Vietnam USA Society (VUS, 2019) · OISP Presentation Contest 2nd Prize (2016).</span>
        </div>
      </div>
    </div>

    <!-- Education & Credentials -->
    <div>
      <h2 class="section-header">Education &amp; Credentials</h2>
      <div class="edu-block">
        <div class="edu-entry">
          <span class="edu-school">HCM City University of Technology (HCMUT - BKU)</span>
          <span class="edu-degree">B.Sc. in Computer Engineering (2016 — 2024)</span>
          <span class="edu-date">Strong foundation in digital media systems, codecs &amp; automation</span>
        </div>
        <div class="edu-entry">
          <span class="edu-degree"><strong>IELTS Academic:</strong> Overall Band 6.0 (IDP, 2019)</span>
          <span class="edu-date"><strong>Udemy Certifications (2026):</strong> AI Video School (27h) · Diffusion Mastery (22.5h)</span>
        </div>
      </div>
    </div>

  </div>

  <!-- Key Client Brands -->
  <section class="section">
    <div class="brands-strip">
      <strong>Selected Client Brands (40+):</strong> Adidas, Puma, Converse, Gillette, Olay, Oral-B, Rohto, Belcube, Betadine, P&amp;G, Unilever, LG, Kenvue, CeraVe, The Body Shop, Logitech, Sensodyne, Swisse, Blackmores, Aptamil, Coolmate, Romano.
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer-note">
    <span>Interactive Portfolio &amp; Film Reels: <a href="https://datruong.vercel.app">https://datruong.vercel.app</a></span>
    <span>Trương Văn Quang Đạt — Professional Resume · 2026</span>
  </footer>

</div>
</body>
</html>`;

writeFileSync('tmp/resume-standalone.html', html, 'utf8');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = resolve('tmp/resume-standalone.html');
const outPdf1 = resolve('output/pdf/TRUONG_VAN_QUANG_DAT_RESUME.pdf');
const outPdf2 = resolve('output/pdf/Dat-Truong-Resume.pdf');
const publicPdf = resolve('public/Dat-Truong-Resume.pdf');

// Render with headless Chrome
const cmd = `"${chrome}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outPdf1}" "${htmlPath}"`;
execSync(cmd);

copyFileSync(outPdf1, outPdf2);
copyFileSync(outPdf1, publicPdf);

// Check page count
const buf = readFileSync(outPdf1);
const matches = buf.toString('binary').match(/\/Type\s*\/Page\b/g);
const pageCount = matches ? matches.length : 1;
const size = statSync(outPdf1).size;

console.log(JSON.stringify({
  success: true,
  resumeFiles: [outPdf1, outPdf2, publicPdf],
  sizeBytes: size,
  pageCount: pageCount
}, null, 2));
