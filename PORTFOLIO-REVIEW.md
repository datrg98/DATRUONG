# Portfolio review and redesign

## What the original portfolio did well

- A substantial body of actual work: four widescreen films and fourteen social edits.
- Recognizable commercial clients and a clear progression into senior editing and team leadership.
- Useful English and Vietnamese versions, plus direct email and phone contact details.

## What needed improvement

- A long introduction and résumé appeared before the work. Visitors had to scroll through considerable text to see the editing itself.
- Repeated descriptions, star ratings and an endlessly restarting reactions counter weakened the hierarchy.
- Video cards depended on loading video metadata rather than purpose-made poster images. Playing a card forced fullscreen and lacked an accessible button-based player.
- The contact form displayed “Request Sent” after a timer without actually transmitting a request.
- The two language versions duplicated large amounts of markup, making consistent future updates difficult.

## Implemented direction

- An editorial layout on a fixed deep-space backdrop: near-black base, 60 px grid, drifting indigo/cyan/pink light and fine grain, with indigo accents and glass panels throughout (the biography section is now dark to keep the backdrop continuous).
- A 40-brand client logo wall (section 02): brand-colour marks (black artwork shown in white) in a hairline grid, sized by optical area, with a pointer spotlight and staggered entrance.
- Editing-themed motion: a running 25 fps timecode with a playhead sweeping a ruler under the introduction, a viewfinder frame with a REC indicator on the portrait, and a pointer-lit grid.
- A locally bundled Manrope variable font replaces the system sans/serif mixture. The name, section titles, project titles, body copy and metadata follow a consistent hierarchy in English and Vietnamese.
- A concise identity-led introduction, larger work heading, aligned project captions, and consistent margins make the project library easier to scan. Contact pages use the same typography, a clear enquiry heading and visibly bounded fields.
- Brand cards expand to one column on phones, social work retains a two-column 9:16 gallery, and filters use generous two-column touch targets. Shared spacing and responsive type rules replace the accumulated style overrides.
- The supplied **Những điều ta quên** film is the lead project. The title follows the supplied artwork; the original filename is different.
- All 18 original videos remain available. There are now **19 projects**: one featured AI film, four brand films, and fourteen social edits.
- A full-width 21:9 feature, generated WebP posters, category filters, and an expandable social gallery prioritize the work. The complete poster is preserved with contain sizing, no zoom or parallax, and its play control outside the artwork. Both poster variants are exact 21:9 (2016 × 864 and 1008 × 432).
- A single native video player supports controls, sound and fullscreen. Opening a project loads its video; closing the dialog stops it, releases the source, and restores keyboard focus.
- Career entries, services, tools and credentials remain accessible in a shorter presentation.
- The contact form prepares an email draft and provides a copy option. Visitors review and send it in their own email application; the website does not claim delivery.
- Both languages and both contact pages share content and rendering logic. The built pages are static HTML, with small JavaScript enhancements.
- The three headline statistics count up over approximately 2.4 seconds when they enter view, then retain their final values. Restrained entrances, hover feedback and a scroll-progress line add motion. Keyboard focus cancels entrance effects on the focused control; reduced-motion preferences show final numbers immediately and disable decorative movement.

## Media handling

The original files in `C:/DATRG/AI/HIGGSFIELD FILM CONTEST` were left untouched. The film was copied into the portfolio with its H.264 video and AAC audio streams preserved, and its MP4 metadata moved to the beginning for progressive playback. Runtime: 4:48; frame size: 2520 × 1080. The website copy is approximately 354 MB and only loads when a visitor opens it. Posters total approximately 1.4 MB across the complete library and the smaller hero variant.

## Validation

- Production build passes for all four routes.
- Browser checks cover desktop and phone layouts, including 320 px and 390 px widths without horizontal overflow.
- The featured film reaches active playback with the expected duration and resolution.
- Video close and Escape stop playback; focus returns to the project button.
- All category filters, expansion to fourteen social edits, and collapse work.
- Mobile navigation, English/Vietnamese switching, and native FAQ disclosure work.
- Required-field and email validation reject incomplete briefs. Both language versions prepare correctly encoded email drafts with the selected service.
- Local links, assets and video/poster pairs are checked before delivery.

This is a local implementation and production build. It has not been published to an external hosting service.
