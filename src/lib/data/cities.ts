/**
 * AutoPing — City Registry
 */

export interface CityDivision {
  name: string;
}

export interface CityMeta {
  id: string;
  name: string;
  displayName: string;
  state: string;
  stateCode: string;
  accentColor: string;
  landmarkName: string;
  landmarkSvg: string;
  viewBox: string;
  divisions: CityDivision[];
}

export const CITIES: CityMeta[] = [
  {
    id: 'city-pune',
    name: 'Pune',
    displayName: 'Pune',
    state: 'Maharashtra',
    stateCode: 'MH',
    accentColor: '#f97316',
    landmarkName: 'Shaniwar Wada',
    viewBox: '0 0 120 80',
    landmarkSvg: '<rect x="10" y="50" width="100" height="22" rx="2" fill="currentColor" opacity="0.8"/><rect x="20" y="35" width="80" height="17" rx="1" fill="currentColor" opacity="0.9"/><rect x="30" y="22" width="60" height="15" rx="1" fill="currentColor"/><rect x="50" y="12" width="20" height="12" rx="1" fill="currentColor"/><polygon points="60,4 52,12 68,12" fill="currentColor"/><rect x="14" y="30" width="6" height="22" fill="currentColor" opacity="0.7"/><polygon points="17,26 14,30 20,30" fill="currentColor" opacity="0.8"/><rect x="100" y="30" width="6" height="22" fill="currentColor" opacity="0.7"/><polygon points="103,26 100,30 106,30" fill="currentColor" opacity="0.8"/>',
    divisions: [
      { name: 'Baner / Balewadi' },
      { name: 'Hinjewadi / Wakad' },
      { name: 'Shivajinagar / Deccan' },
      { name: 'Kothrud / Karve Nagar' },
      { name: 'Hadapsar / Magarpatta' },
      { name: 'Kharadi / Viman Nagar' },
      { name: 'Camp / Koregaon Park' },
      { name: 'Pimpri-Chinchwad' },
      { name: 'Katraj / Kondhwa' },
      { name: 'Warje / Dhayari' },
    ],
  },
  {
    id: 'city-mumbai',
    name: 'Mumbai',
    displayName: 'Mumbai',
    state: 'Maharashtra',
    stateCode: 'MH',
    accentColor: '#0ea5e9',
    landmarkName: 'Gateway of India',
    viewBox: '0 0 120 80',
    landmarkSvg: '<rect x="35" y="58" width="50" height="14" rx="2" fill="currentColor" opacity="0.8"/><rect x="42" y="42" width="36" height="18" rx="1" fill="currentColor" opacity="0.85"/><path d="M42 42 Q60 22 78 42 Z" fill="currentColor"/><rect x="44" y="52" width="6" height="20" fill="currentColor" opacity="0.7"/><rect x="70" y="52" width="6" height="20" fill="currentColor" opacity="0.7"/><rect x="37" y="54" width="46" height="6" fill="currentColor"/><rect x="5" y="70" width="110" height="4" rx="2" fill="currentColor" opacity="0.3"/>',
    divisions: [
      { name: 'Andheri / Jogeshwari' },
      { name: 'Bandra / Khar' },
      { name: 'Borivali / Kandivali' },
      { name: 'Dadar / Parel' },
      { name: 'Goregaon / Malad' },
      { name: 'Kurla / Ghatkopar' },
      { name: 'Lower Parel / Worli' },
      { name: 'Navi Mumbai' },
      { name: 'Thane City' },
      { name: 'Vasai-Virar' },
    ],
  },
  {
    id: 'city-delhi',
    name: 'Delhi',
    displayName: 'New Delhi',
    state: 'Delhi NCR',
    stateCode: 'DL',
    accentColor: '#8b5cf6',
    landmarkName: 'India Gate',
    viewBox: '0 0 120 80',
    landmarkSvg: '<rect x="46" y="60" width="28" height="12" rx="1" fill="currentColor" opacity="0.8"/><rect x="50" y="52" width="20" height="10" rx="1" fill="currentColor" opacity="0.85"/><path d="M50 52 Q60 28 70 52 Z" fill="currentColor"/><rect x="58" y="20" width="4" height="32" rx="1" fill="currentColor"/><rect x="54" y="18" width="12" height="4" rx="2" fill="currentColor"/><rect x="56" y="14" width="8" height="5" rx="1" fill="currentColor" opacity="0.8"/><rect x="57" y="10" width="6" height="5" rx="1" fill="currentColor" opacity="0.7"/><rect x="58" y="6" width="4" height="5" rx="1" fill="currentColor" opacity="0.6"/><rect x="10" y="68" width="100" height="4" rx="2" fill="currentColor" opacity="0.4"/>',
    divisions: [
      { name: 'Connaught Place / Karol Bagh' },
      { name: 'Dwarka / Uttam Nagar' },
      { name: 'Faridabad' },
      { name: 'Gurgaon / Cyber City' },
      { name: 'Lajpat Nagar / Greater Kailash' },
      { name: 'Noida / Greater Noida' },
      { name: 'Rohini / Pitampura' },
      { name: 'Saket / Malviya Nagar' },
      { name: 'Vasant Kunj / Mehrauli' },
      { name: 'Janakpuri / Palam' },
    ],
  },
  {
    id: 'city-bengaluru',
    name: 'Bengaluru',
    displayName: 'Bengaluru',
    state: 'Karnataka',
    stateCode: 'KA',
    accentColor: '#10b981',
    landmarkName: 'Vidhana Soudha',
    viewBox: '0 0 120 80',
    landmarkSvg: '<rect x="8" y="56" width="104" height="16" rx="2" fill="currentColor" opacity="0.7"/><rect x="16" y="44" width="88" height="14" rx="1" fill="currentColor" opacity="0.8"/><rect x="24" y="34" width="72" height="12" rx="1" fill="currentColor" opacity="0.85"/><rect x="32" y="26" width="56" height="10" rx="1" fill="currentColor"/><rect x="40" y="20" width="40" height="8" rx="1" fill="currentColor"/><polygon points="60,8 46,20 74,20" fill="currentColor"/><rect x="57" y="4" width="6" height="6" rx="1" fill="currentColor" opacity="0.8"/>',
    divisions: [
      { name: 'Indiranagar / Domlur' },
      { name: 'Koramangala / HSR Layout' },
      { name: 'Whitefield / ITPL' },
      { name: 'Electronic City' },
      { name: 'Hebbal / Yelahanka' },
      { name: 'Jayanagar / Banashankari' },
      { name: 'Marathahalli / Sarjapur' },
      { name: 'Rajajinagar / Malleshwaram' },
      { name: 'BTM Layout / JP Nagar' },
      { name: 'Bellandur / Outer Ring Road' },
    ],
  },
  {
    id: 'city-hyderabad',
    name: 'Hyderabad',
    displayName: 'Hyderabad',
    state: 'Telangana',
    stateCode: 'TS',
    accentColor: '#f59e0b',
    landmarkName: 'Charminar',
    viewBox: '0 0 120 80',
    landmarkSvg: '<rect x="36" y="56" width="48" height="16" rx="2" fill="currentColor" opacity="0.7"/><rect x="44" y="44" width="8" height="14" rx="1" fill="currentColor"/><rect x="68" y="44" width="8" height="14" rx="1" fill="currentColor"/><rect x="44" y="30" width="8" height="16" fill="currentColor" opacity="0.9"/><rect x="68" y="30" width="8" height="16" fill="currentColor" opacity="0.9"/><rect x="42" y="26" width="12" height="6" rx="3" fill="currentColor"/><rect x="66" y="26" width="12" height="6" rx="3" fill="currentColor"/><rect x="42" y="14" width="4" height="14" fill="currentColor" opacity="0.7"/><rect x="74" y="14" width="4" height="14" fill="currentColor" opacity="0.7"/><polygon points="44,10 42,14 46,14" fill="currentColor"/><polygon points="76,10 74,14 78,14" fill="currentColor"/><rect x="52" y="40" width="16" height="16" rx="1" fill="currentColor" opacity="0.85"/>',
    divisions: [
      { name: 'Banjara Hills / Jubilee Hills' },
      { name: 'Gachibowli / Financial District' },
      { name: 'Hitech City / Madhapur' },
      { name: 'Kondapur / Manikonda' },
      { name: 'Kukatpally / Miyapur' },
      { name: 'LB Nagar / Dilsukhnagar' },
      { name: 'Secunderabad / Malkajgiri' },
      { name: 'Uppal / Habsiguda' },
      { name: 'Ameerpet / SR Nagar' },
      { name: 'Shamshabad / Airport Zone' },
    ],
  },
  {
    id: 'city-chennai',
    name: 'Chennai',
    displayName: 'Chennai',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    accentColor: '#ec4899',
    landmarkName: 'Marina Beach Lighthouse',
    viewBox: '0 0 120 80',
    landmarkSvg: '<rect x="54" y="48" width="12" height="24" rx="2" fill="currentColor" opacity="0.8"/><polygon points="60,8 50,48 70,48" fill="currentColor"/><ellipse cx="60" cy="8" rx="5" ry="4" fill="currentColor" opacity="0.9"/><rect x="50" y="46" width="20" height="4" rx="2" fill="currentColor" opacity="0.7"/><rect x="48" y="66" width="24" height="6" rx="2" fill="currentColor" opacity="0.6"/><circle cx="60" cy="8" r="2" fill="white" opacity="0.9"/>',
    divisions: [
      { name: 'Anna Nagar / Kilpauk' },
      { name: 'Adyar / Besant Nagar' },
      { name: 'Ambattur / Avadi' },
      { name: 'Chromepet / Pallavaram' },
      { name: 'Guindy / Nandanam' },
      { name: 'Medavakkam / Sholinganallur' },
      { name: 'Perambur / Kolathur' },
      { name: 'Porur / Mogappair' },
      { name: 'Tambaram / Pallikkaranai' },
      { name: 'T. Nagar / Nungambakkam' },
    ],
  },
  {
    id: 'city-kolkata',
    name: 'Kolkata',
    displayName: 'Kolkata',
    state: 'West Bengal',
    stateCode: 'WB',
    accentColor: '#14b8a6',
    landmarkName: 'Howrah Bridge',
    viewBox: '0 0 120 80',
    landmarkSvg: '<rect x="5" y="60" width="20" height="16" rx="1" fill="currentColor" opacity="0.8"/><rect x="95" y="60" width="20" height="16" rx="1" fill="currentColor" opacity="0.8"/><rect x="8" y="44" width="14" height="18" rx="1" fill="currentColor" opacity="0.85"/><rect x="98" y="44" width="14" height="18" rx="1" fill="currentColor" opacity="0.85"/><path d="M15 32 Q60 8 105 32" stroke="currentColor" stroke-width="3" fill="none"/><path d="M15 40 Q60 20 105 40" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.6"/><rect x="5" y="54" width="110" height="6" rx="3" fill="currentColor" opacity="0.9"/>',
    divisions: [
      { name: 'Park Street / Esplanade' },
      { name: 'Salt Lake / New Town' },
      { name: 'Howrah / Santragachi' },
      { name: 'Dum Dum / Baranagar' },
      { name: 'Behala / Tollygunge' },
      { name: 'Jadavpur / Garia' },
      { name: 'Rajarhat / Action Area' },
      { name: 'Gariahat / Ballygunge' },
      { name: 'Barrackpore / Serampore' },
      { name: 'Ultadanga / Phool Bagan' },
    ],
  },
  {
    id: 'city-ahmedabad',
    name: 'Ahmedabad',
    displayName: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: 'GJ',
    accentColor: '#6366f1',
    landmarkName: 'Sabarmati Ashram',
    viewBox: '0 0 120 80',
    landmarkSvg: '<rect x="10" y="58" width="100" height="14" rx="2" fill="currentColor" opacity="0.6"/><rect x="18" y="46" width="84" height="14" rx="2" fill="currentColor" opacity="0.7"/><rect x="26" y="36" width="68" height="12" rx="2" fill="currentColor" opacity="0.8"/><rect x="36" y="28" width="48" height="10" rx="2" fill="currentColor" opacity="0.85"/><rect x="44" y="20" width="32" height="10" rx="2" fill="currentColor"/><polygon points="60,8 46,20 74,20" fill="currentColor"/><rect x="56" y="4" width="8" height="6" rx="1" fill="currentColor" opacity="0.7"/>',
    divisions: [
      { name: 'Bopal / South Bopal' },
      { name: 'Chandkheda / Motera' },
      { name: 'CG Road / Navrangpura' },
      { name: 'Gota / Ghatlodiya' },
      { name: 'Maninagar / Vatva' },
      { name: 'Naroda / Vastral' },
      { name: 'Prahlad Nagar / Satellite' },
      { name: 'SG Highway / Thaltej' },
      { name: 'Gandhinagar' },
      { name: 'Sarkhej / Juhapura' },
    ],
  },
];

export const CITY_MAP: Record<string, CityMeta> = Object.fromEntries(
  CITIES.map((c) => [c.name, c])
);

export const ALL_CITY_NAMES = CITIES.map((c) => c.name);
