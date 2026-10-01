'use client';

import React from 'react';

interface BrandLogoProps {
  brandName?: string;
  brandId?: string;
  className?: string;
  size?: number;
}

export default function BrandLogo({ brandName = '', brandId = '', className = '', size = 28 }: BrandLogoProps) {
  const norm = (brandName || brandId).toLowerCase().replace(/[^a-z0-9]/g, '');

  const commonSvgProps = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    className: `inline-block shrink-0 transition-transform ${className}`,
    fill: 'currentColor',
  };

  // --- CAR BRANDS ---

  // 1. Maruti Suzuki
  if (norm.includes('maruti') || norm.includes('suzuki')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <path
          d="M10 14L34 14L14 34L38 34"
          fill="none"
          stroke="#E11D48"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 14L28 14L10 32L26 32" fill="none" stroke="#2563EB" strokeWidth="3" />
      </svg>
    );
  }

  // 2. Hyundai
  if (norm.includes('hyundai')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <ellipse cx="24" cy="24" rx="20" ry="14" fill="none" stroke="#002C6C" strokeWidth="3" />
        <path
          d="M16 15C18 22 20 28 22 33M32 15C30 22 28 28 26 33M18 24C22 23 26 23 30 24"
          fill="none"
          stroke="#002C6C"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 3. Mahindra (Twin Peaks butterfly M)
  if (norm.includes('mahindra')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <path
          d="M8 34L20 14C21 12 23 12 24 14L20 34Z"
          fill="#DC2626"
        />
        <path
          d="M40 34L28 14C27 12 25 12 24 14L28 34Z"
          fill="#0F172A"
          className="dark:fill-slate-200"
        />
        <circle cx="24" cy="14" r="3" fill="#DC2626" />
      </svg>
    );
  }

  // 4. Tata
  if (norm.includes('tata')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="19" fill="none" stroke="#0284C7" strokeWidth="2.5" />
        <path
          d="M14 18C20 18 24 22 24 33M34 18C28 18 24 22 24 33"
          fill="none"
          stroke="#0284C7"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 5. Toyota
  if (norm.includes('toyota')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <ellipse cx="24" cy="24" rx="20" ry="14" fill="none" stroke="#DC2626" strokeWidth="2.8" />
        <ellipse cx="24" cy="20" rx="9" ry="6" fill="none" stroke="#DC2626" strokeWidth="2.4" />
        <ellipse cx="24" cy="24" rx="3.5" ry="12" fill="none" stroke="#DC2626" strokeWidth="2.4" />
      </svg>
    );
  }

  // 6. Kia (Connected KN / KIA)
  if (norm.includes('kia')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <path
          d="M10 16L10 32M10 24L18 16M14 20L22 32M24 16L24 32M28 32L34 16L40 32"
          fill="none"
          stroke="#0F172A"
          strokeWidth="4"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className="dark:stroke-white"
        />
      </svg>
    );
  }

  // 7. MG (Morris Garages)
  if (norm.includes('mg')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <polygon
          points="24,6 40,15 40,33 24,42 8,33 8,15"
          fill="none"
          stroke="#DC2626"
          strokeWidth="3"
        />
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fontSize="14"
          fontWeight="900"
          fontFamily="system-ui"
          fill="#DC2626"
        >
          MG
        </text>
      </svg>
    );
  }

  // 8. Honda (Cars)
  if (norm.includes('hondacar') || (norm.includes('honda') && !norm.includes('2w') && !norm.includes('motor'))) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <rect
          x="8"
          y="10"
          width="32"
          height="28"
          rx="5"
          fill="none"
          stroke="#334155"
          strokeWidth="3"
          className="dark:stroke-slate-200"
        />
        <path
          d="M16 16L19 32M32 16L29 32M17 25H31"
          fill="none"
          stroke="#334155"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="dark:stroke-slate-200"
        />
      </svg>
    );
  }

  // 9. Volkswagen (VW)
  if (norm.includes('vw') || norm.includes('volkswagen')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="19" fill="none" stroke="#001E50" strokeWidth="3" className="dark:stroke-blue-400" />
        <path
          d="M14 15L20 29L24 19L28 29L34 15M17 33L24 19M31 33L24 19"
          fill="none"
          stroke="#001E50"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="dark:stroke-blue-400"
        />
      </svg>
    );
  }

  // 10. Skoda
  if (norm.includes('skoda')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="19" fill="none" stroke="#16A34A" strokeWidth="3" />
        <path
          d="M24 12C28 16 32 20 32 24C32 28 28 32 24 32M24 12L16 26H28"
          fill="none"
          stroke="#16A34A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="18" r="2" fill="#16A34A" />
      </svg>
    );
  }

  // 11. Renault
  if (norm.includes('renault')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <polygon
          points="24,8 36,24 24,40 12,24"
          fill="none"
          stroke="#EAB308"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <polygon
          points="24,15 30,24 24,33 18,24"
          fill="none"
          stroke="#EAB308"
          strokeWidth="2"
        />
      </svg>
    );
  }

  // 12. Nissan
  if (norm.includes('nissan')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="16" fill="none" stroke="#C2410C" strokeWidth="3" />
        <rect x="8" y="21" width="32" height="6" rx="1" fill="#C2410C" />
        <text
          x="24"
          y="26"
          textAnchor="middle"
          fontSize="5"
          fontWeight="bold"
          fontFamily="system-ui"
          fill="#FFFFFF"
        >
          NISSAN
        </text>
      </svg>
    );
  }

  // 13. Citroen
  if (norm.includes('citroen')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <path
          d="M12 20L24 11L36 20M12 31L24 22L36 31"
          fill="none"
          stroke="#DC2626"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 14. Jeep
  if (norm.includes('jeep')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <rect
          x="6"
          y="18"
          width="36"
          height="14"
          rx="3"
          fill="#0F172A"
          className="dark:fill-slate-800"
        />
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui"
          fill="#FFFFFF"
          letterSpacing="1"
        >
          Jeep
        </text>
      </svg>
    );
  }

  // --- BIKE & 2W BRANDS ---

  // 15. Hero MotoCorp
  if (norm.includes('hero')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <path d="M12 12V36L20 36V28L28 28V36L36 36V12L28 12V20L20 20V12Z" fill="#DC2626" />
      </svg>
    );
  }

  // 16. Honda 2W (Motorcycle Wing)
  if (norm.includes('honda2w') || norm.includes('wing') || norm.includes('activa')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <path
          d="M10 32C18 30 26 24 38 12C32 20 26 26 18 28M14 26C20 24 28 18 36 10C30 16 24 22 18 24M18 20C24 18 30 14 34 8"
          fill="none"
          stroke="#DC2626"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path d="M10 34L26 34" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 17. TVS Motor (Jumping Horse)
  if (norm.includes('tvs')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <path
          d="M12 30C16 28 18 24 20 20C22 16 26 14 32 14C34 16 34 18 30 20C26 22 24 26 22 30M24 18L36 22C34 26 30 28 24 30"
          fill="none"
          stroke="#1E40AF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <text
          x="24"
          y="38"
          textAnchor="middle"
          fontSize="9"
          fontWeight="900"
          fontFamily="system-ui"
          fill="#DC2626"
        >
          TVS
        </text>
      </svg>
    );
  }

  // 18. Bajaj Auto
  if (norm.includes('bajaj')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="19" fill="none" stroke="#2563EB" strokeWidth="2.5" />
        <path
          d="M16 16L24 24L16 32M24 16L32 24L24 32"
          fill="none"
          stroke="#2563EB"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 19. Royal Enfield
  if (norm.includes('re') || norm.includes('royalenfield')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="19" fill="none" stroke="#B45309" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="15" fill="none" stroke="#B45309" strokeWidth="1" strokeDasharray="2 2" />
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="serif"
          fill="#B45309"
        >
          RE
        </text>
      </svg>
    );
  }

  // 20. Yamaha
  if (norm.includes('yamaha')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="19" fill="none" stroke="#DC2626" strokeWidth="2.5" />
        {/* 3 Tuning forks */}
        <path
          d="M24 24V10M24 24L12 32M24 24L36 32M21 12H27M13 28L17 34M35 28L31 34"
          fill="none"
          stroke="#DC2626"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 21. KTM
  if (norm.includes('ktm')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <rect x="6" y="15" width="36" height="18" rx="4" fill="#F97316" />
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui"
          fill="#FFFFFF"
          fontStyle="italic"
        >
          KTM
        </text>
      </svg>
    );
  }

  // 22. Vespa
  if (norm.includes('vespa')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <ellipse cx="24" cy="24" rx="20" ry="14" fill="#0284C7" />
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fontStyle="italic"
          fontFamily="cursive, system-ui"
          fill="#FFFFFF"
        >
          Vespa
        </text>
      </svg>
    );
  }

  // 23. Aprilia
  if (norm.includes('aprilia')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <rect x="6" y="16" width="36" height="16" rx="3" fill="#000000" />
        <rect x="6" y="16" width="10" height="16" fill="#DC2626" />
        <text
          x="28"
          y="28"
          textAnchor="middle"
          fontSize="8"
          fontWeight="900"
          fontFamily="system-ui"
          fill="#FFFFFF"
        >
          aprilia
        </text>
      </svg>
    );
  }

  // 24. Kawasaki
  if (norm.includes('kawasaki')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <rect x="6" y="16" width="36" height="16" rx="3" fill="#16A34A" />
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fontSize="8"
          fontWeight="900"
          fontFamily="system-ui"
          fill="#FFFFFF"
          letterSpacing="0.5"
        >
          Kawasaki
        </text>
      </svg>
    );
  }

  // 25. Harley-Davidson
  if (norm.includes('harley') || norm.includes('davidson')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <path
          d="M8 20L24 10L40 20V30L24 38L8 30Z"
          fill="#EA580C"
        />
        <rect x="6" y="21" width="36" height="6" fill="#000000" />
        <text
          x="24"
          y="26"
          textAnchor="middle"
          fontSize="4"
          fontWeight="900"
          fontFamily="system-ui"
          fill="#FFFFFF"
        >
          MOTOR HARLEY-DAVIDSON
        </text>
      </svg>
    );
  }

  // 26. Triumph
  if (norm.includes('triumph')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <path
          d="M10 18H38M24 18V34M14 26C20 26 28 30 34 34"
          fill="none"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="dark:stroke-slate-200"
        />
      </svg>
    );
  }

  // 27. BMW
  if (norm.includes('bmw')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="19" fill="#000000" stroke="#94A3B8" strokeWidth="2" />
        <path d="M24 8A16 16 0 0 1 40 24H24Z" fill="#0284C7" />
        <path d="M8 24A16 16 0 0 1 24 8V24Z" fill="#FFFFFF" />
        <path d="M24 24V40A16 16 0 0 1 8 24Z" fill="#0284C7" />
        <path d="M24 24H40A16 16 0 0 1 24 40Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 28. Mercedes-Benz
  if (norm.includes('mercedes') || norm.includes('benz')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="19" fill="none" stroke="#64748B" strokeWidth="2.5" />
        <path
          d="M24 24L24 6M24 24L9 33M24 24L39 33"
          fill="none"
          stroke="#64748B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 29. Ather Energy
  if (norm.includes('ather')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="18" fill="#10B981" />
        <path d="M24 12L32 28H16Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 30. Ola Electric
  if (norm.includes('ola')) {
    return (
      <svg {...commonSvgProps} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="18" fill="#EAB308" />
        <circle cx="24" cy="24" r="8" fill="#0F172A" />
      </svg>
    );
  }

  // Fallback icon for any unlisted brand
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-[11px] shadow-xs shrink-0 ${className}`}
    >
      {(brandName || 'AP').substring(0, 2).toUpperCase()}
    </div>
  );
}
