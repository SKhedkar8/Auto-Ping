const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '..', 'public', 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

const logos = {
  'brand-bmw.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="48" fill="#000000" stroke="#94A3B8" stroke-width="2"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#FFFFFF" stroke-width="1"/>
    <circle cx="50" cy="50" r="32" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
    <path d="M50,50 L50,18 A32,32 0 0,1 82,50 Z" fill="#FFFFFF"/>
    <path d="M50,50 L82,50 A32,32 0 0,1 50,82 Z" fill="#0066B1"/>
    <path d="M50,50 L50,82 A32,32 0 0,1 18,50 Z" fill="#FFFFFF"/>
    <path d="M50,50 L18,50 A32,32 0 0,1 50,18 Z" fill="#0066B1"/>
    <text x="50" y="15" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#FFFFFF" text-anchor="middle">M</text>
    <text x="31" y="19" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#FFFFFF" text-anchor="middle">B</text>
    <text x="69" y="19" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#FFFFFF" text-anchor="middle">W</text>
  </svg>`,

  'brand-bmw-moto.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="42" r="36" fill="#000000" stroke="#94A3B8" stroke-width="1.5"/>
    <circle cx="50" cy="42" r="24" fill="none" stroke="#FFFFFF" stroke-width="1"/>
    <path d="M50,42 L50,18 A24,24 0 0,1 74,42 Z" fill="#FFFFFF"/>
    <path d="M50,42 L74,42 A24,24 0 0,1 50,66 Z" fill="#0066B1"/>
    <path d="M50,42 L50,66 A24,24 0 0,1 26,42 Z" fill="#FFFFFF"/>
    <path d="M50,42 L26,42 A24,24 0 0,1 50,18 Z" fill="#0066B1"/>
    <text x="50" y="14" font-family="Arial, sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" text-anchor="middle">M</text>
    <text x="36" y="17" font-family="Arial, sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" text-anchor="middle">B</text>
    <text x="64" y="17" font-family="Arial, sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" text-anchor="middle">W</text>
    <rect x="10" y="82" width="80" height="14" rx="4" fill="#0066B1"/>
    <text x="50" y="92" font-family="Arial, sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">MOTORRAD</text>
  </svg>`,

  'brand-mercedes.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="46" fill="#0F172A"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" stroke-width="3"/>
    <polygon points="50,14 54,48 50,50 46,48" fill="#FFFFFF"/>
    <polygon points="50,14 50,50 54,48" fill="#94A3B8"/>
    <polygon points="81,68 48,52 50,50 52,50" fill="#FFFFFF"/>
    <polygon points="81,68 50,50 48,52" fill="#94A3B8"/>
    <polygon points="19,68 48,50 50,50 52,52" fill="#FFFFFF"/>
    <polygon points="19,68 50,50 52,52" fill="#CBD5E1"/>
  </svg>`,

  'brand-audi.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" width="120" height="60">
    <rect width="120" height="60" rx="8" fill="#0F172A"/>
    <circle cx="27" cy="30" r="16" fill="none" stroke="#E2E8F0" stroke-width="4"/>
    <circle cx="49" cy="30" r="16" fill="none" stroke="#E2E8F0" stroke-width="4"/>
    <circle cx="71" cy="30" r="16" fill="none" stroke="#E2E8F0" stroke-width="4"/>
    <circle cx="93" cy="30" r="16" fill="none" stroke="#E2E8F0" stroke-width="4"/>
  </svg>`,

  'brand-ford.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70" width="120" height="70">
    <ellipse cx="60" cy="35" rx="58" ry="32" fill="#002C6C" stroke="#FFFFFF" stroke-width="2.5"/>
    <ellipse cx="60" cy="35" rx="53" ry="27" fill="none" stroke="#818CF8" stroke-width="1.2"/>
    <text x="60" y="46" font-family="'Times New Roman', Georgia, serif" font-style="italic" font-weight="bold" font-size="34" fill="#FFFFFF" text-anchor="middle">Ford</text>
  </svg>`,

  'brand-lexus.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="16" fill="#0F172A"/>
    <ellipse cx="50" cy="50" rx="42" ry="32" fill="none" stroke="#E2E8F0" stroke-width="4.5"/>
    <path d="M66,28 L36,66 L64,66" fill="none" stroke="#E2E8F0" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  'brand-volvo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="46" cy="54" r="34" fill="none" stroke="#1E293B" stroke-width="6"/>
    <line x1="70" y1="30" x2="88" y2="12" stroke="#1E293B" stroke-width="6" stroke-linecap="square"/>
    <polygon points="88,12 74,12 88,26" fill="#1E293B"/>
    <rect x="8" y="46" width="76" height="16" fill="#003057" rx="3"/>
    <text x="46" y="58" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">VOLVO</text>
  </svg>`,

  'brand-ducati.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M50,8 L88,22 C88,64 50,92 50,92 C50,92 12,64 12,22 Z" fill="#CC0000" stroke="#990000" stroke-width="2"/>
    <path d="M50,16 L82,27 C82,58 50,84 50,84 C50,84 18,58 18,27 Z" fill="#E50000"/>
    <path d="M26,42 Q50,66 74,38" fill="none" stroke="#FFFFFF" stroke-width="6.5" stroke-linecap="round"/>
    <text x="50" y="32" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">DUCATI</text>
  </svg>`,

  'brand-ather.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="48" fill="#0F172A"/>
    <path d="M50,20 L74,68 L60,68 L50,48 L40,68 L26,68 Z" fill="#00E59B"/>
    <circle cx="50" cy="34" r="4.5" fill="#FFFFFF"/>
    <text x="50" y="85" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">ATHER</text>
  </svg>`,

  'brand-ola.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="48" fill="#0F172A"/>
    <circle cx="50" cy="42" r="22" fill="none" stroke="#A3E635" stroke-width="7"/>
    <text x="50" y="82" font-family="Arial, sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">OLA</text>
  </svg>`,

  'brand-bounce.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="48" fill="#FF5722"/>
    <path d="M34,42 C25,42 21,48 21,53 C21,58 25,64 34,64 C42,64 48,53 50,53 C52,53 58,64 66,64 C75,64 79,58 79,53 C79,48 75,42 66,42 C58,42 52,53 50,53 C48,53 42,42 34,42 Z" fill="none" stroke="#FFFFFF" stroke-width="6.5" stroke-linecap="round"/>
    <text x="50" y="82" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">BOUNCE</text>
  </svg>`
};

for (const [filename, content] of Object.entries(logos)) {
  const filePath = path.join(logosDir, filename);
  fs.writeFileSync(filePath, content.trim(), 'utf8');
  console.log('Created SVG:', filename);
}
