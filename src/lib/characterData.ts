export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  image: string;
  color: string;
  badgeBg: string;
  quote: string;
  voice: {
    pitch: number;
    rate: number;
    preferredVoiceGender?: 'male' | 'female';
  };
  intro: string;
  reactions: {
    oil: string;
    brakes: string;
    tyres: string;
    battery: string;
    general: string;
    ac: string;
    engine: string;
    other: string;
  };
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'schumacher',
    name: 'Michael Schumacher Ferrari',
    title: '7-Time World Champion & Ferrari F430',
    image: '/characters/schumacher.jpg',
    color: '#DC2626', // Scuderia Ferrari Rosso Corsa
    badgeBg: 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-900',
    quote: '"Lightning McQueen told me this was the best place in the world to get tires."',
    voice: { pitch: 0.98, rate: 0.96, preferredVoiceGender: 'male' },
    intro: "Hi. Lightning McQueen told me this was the best place in the world to get tires. Spero che il tuo amico si riprenda presto!",
    reactions: {
      oil: "An oil change with genuine Ferrari-certified synthetic oil ensures your engine revs up to 8,500 RPM flawlessly.",
      brakes: "Carbon-ceramic brake check! Precision stopping power is what allows you to brake late into every turn.",
      tyres: "Tires! Just like Luigi and Guido's Casa Della Tires, premier rubber is everything on the asphalt.",
      battery: "Electrical and telemetry diagnostics! Clean, instant ignition for championship performance.",
      general: "Full Scuderia-grade multi-point inspection! Every component calibrated to championship tolerances.",
      ac: "Cabin climate calibration! Staying cool in the cockpit keeps your focus razor sharp.",
      engine: "V8 powertrain tune-up! Let us unleash that legendary Maranello engine note.",
      other: "Understood. We will have the master technicians inspect every detail to perfection.",
    },
  },
  {
    id: 'mcqueen',
    name: 'Lightning McQueen',
    title: '#95 Piston Cup Champion',
    image: '/characters/mcqueen.jpg',
    color: '#E11D48',
    badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900',
    quote: '"Ka-Chow! Speed, I am speed!"',
    voice: { pitch: 1.18, rate: 1.08, preferredVoiceGender: 'male' },
    intro: "Ka-Chow! I'm Lightning McQueen! Ready to get your machine dialed in for peak racetrack performance?",
    reactions: {
      oil: "Oil change? Ka-Chow! Fresh high-performance synthetic oil is how I won seven Piston Cups!",
      brakes: "Brake service? Smart move! You can't attack the apex if your stopping power isn't razor sharp!",
      tyres: "New rubber! Nothing beats fresh treads with maximum grip on high-speed curves!",
      battery: "Electrical check! Full voltage ignition gives you that instant throttle launch!",
      general: "Full multi-point tune-up! Let's get every cylinder firing in perfect harmony!",
      ac: "AC service! Gotta keep the cockpit ice-cold when you're pushing through intense traffic!",
      engine: "Engine diagnostics! Let's make that powertrain roar with maximum horsepower!",
      other: "You got it! Whatever your ride needs, we'll get it championship ready!",
    },
  },
  {
    id: 'mater',
    name: 'Tow Mater',
    title: 'World Champion Backwards Driver',
    image: '/characters/mater.jpg',
    color: '#D97706',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    quote: '"Dad-gum! Towing and road assistance expert!"',
    voice: { pitch: 0.82, rate: 0.94, preferredVoiceGender: 'male' },
    intro: "Well howdy there! I'm Mater, like Tow Mater! I'll help you get your ride running smooth as butter, no tow hook needed!",
    reactions: {
      oil: "An oil change? Now that's what I'm talkin' about! Fresh golden oil makes an engine purr like a kitten!",
      brakes: "Brake pads check? Mighty wise! Don't wanna be slidin' backwards through the cactus patches like I do!",
      tyres: "Tyres and wheel rotation! Good treads keep your wheels glued to the blacktop, partner!",
      battery: "Battery checkup! Need that strong spark to crank up the engine on cold frosty mornings!",
      general: "Full periodic checkup! We'll look under the hood and inspect everything from bumper to bumper!",
      ac: "AC cooling! You betcha, nothing feels better than ice-cold breeze on a blazing hot Radiator Springs day!",
      engine: "Engine check! Don't you worry buddy, we'll listen for any squeaks and clunks!",
      other: "Dad-gum, whatever's ailin' your car, we're gonna get it fixed right up!",
    },
  },
  {
    id: 'sally',
    name: 'Sally Carrera',
    title: 'Precision Sports Coupe & Navigator',
    image: '/characters/sally.jpg',
    color: '#2563EB',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    quote: '"Smooth precision, scenic comfort."',
    voice: { pitch: 1.05, rate: 1.0, preferredVoiceGender: 'female' },
    intro: "Hey there! I'm Sally Carrera. Let's find you the highest-rated, certified service center with complete peace of mind.",
    reactions: {
      oil: "An oil change is essential for engine longevity. Let's ensure you get genuine certified fluids.",
      brakes: "Brake maintenance is top priority for passenger safety. I'll connect you with certified brake specialists.",
      tyres: "Proper tyre balance ensures that smooth, scenic cruising ride we all love.",
      battery: "Reliable battery health means zero unexpected road delays. Excellent decision.",
      general: "Comprehensive service scheduled. It preserves vehicle resale value and peak reliability.",
      ac: "Cabin climate control is vital for everyday driving comfort. Let's refresh that filter.",
      engine: "Powertrain diagnostics will pinpoint any subtle anomalies before they become costly repairs.",
      other: "Understood. I will help you find the right certified workshop tailored to your exact need.",
    },
  },
  {
    id: 'cruz',
    name: 'Cruz Ramirez',
    title: '#51 Racing Trainer & Tech Specialist',
    image: '/characters/cruz.jpg',
    color: '#EAB308',
    badgeBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
    quote: '"Use that motivation! Peak aerodynamics!"',
    voice: { pitch: 1.15, rate: 1.1, preferredVoiceGender: 'female' },
    intro: "Hey! I'm Cruz Ramirez! Ready to analyze your vehicle's telemetry and optimize performance stats?",
    reactions: {
      oil: "Oil change logged! Friction reduction directly boosts efficiency by up to 4.2%!",
      brakes: "High-coefficient brake inspection! Controlled deceleration is crucial for confident handling!",
      tyres: "Tyre inspection! Checking tread depth and contact patch distribution right away!",
      battery: "State-of-charge diagnostics! Ensuring optimal cold cranking amps across all cells!",
      general: "Multi-point telemetry service! We'll benchmark every metric against OEM tolerances!",
      ac: "HVAC efficiency test! Clean air intake improves cabin airflow dynamics!",
      engine: "Engine calibration check! Let's ensure every sensor and valve is performing at peak spec!",
      other: "Great initiative! Addressing specific symptoms early keeps your machine running at its best!",
    },
  },
  {
    id: 'holley',
    name: 'Holley Shiftwell',
    title: 'Intelligence & High-Tech Diagnostics',
    image: '/characters/holley.jpg',
    color: '#9333EA',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    quote: '"Advanced sensors and tactical precision."',
    voice: { pitch: 1.08, rate: 1.04, preferredVoiceGender: 'female' },
    intro: "Greetings. I'm Holley Shiftwell. My high-precision diagnostic scanners are primed to inspect your vehicle's systems.",
    reactions: {
      oil: "Fluid analysis initiated. Fresh viscosity grade prevents thermal breakdown in high-stress drives.",
      brakes: "Hydraulic pressure & rotor thickness check. Vital for evasive maneuver capability.",
      tyres: "Tread depth and alignment scans active. Ensures optimal traction under all road conditions.",
      battery: "Electrical circuit telemetry scanned. Maintaining stable voltage prevents electronic failure.",
      general: "Complete systematic diagnostic protocol engaged. Scanning all onboard control units.",
      ac: "Thermal regulation systems being checked. Ensures clean climate management.",
      engine: "ECU sensor analysis ready. Pinpointing exact air-fuel ratio and combustion metrics.",
      other: "Target requirement locked. Scanning local authorized facilities for specialized diagnostics.",
    },
  },
  {
    id: 'finn',
    name: 'Finn McMissile',
    title: 'British Intelligence Master Agent',
    image: '/characters/finn.jpg',
    color: '#0D9488',
    badgeBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    quote: '"A gentleman never overlooks proper maintenance."',
    voice: { pitch: 0.95, rate: 1.0, preferredVoiceGender: 'male' },
    intro: "Good day. Finn McMissile here. A sophisticated machine demands nothing less than premier craftsmanship.",
    reactions: {
      oil: "Splendid choice. Premium synthetic lubricant guarantees silent, stealthy engine refinement.",
      brakes: "Braking calipers in prime condition. One must be prepared to halt impeccably on a sixpence.",
      tyres: "Tyre tread integrity verified. Superior grip is essential when outmaneuvering obstacles.",
      battery: "Auxiliary power verified. Uninterrupted electrical continuity is paramount.",
      general: "A comprehensive inspection. Impeccable standard maintenance separates the amateurs from the masters.",
      ac: "Climate circulation refined. One must always remain composed and cool under pressure.",
      engine: "Powertrain examination. Ensuring that cylinder compression is entirely beyond reproach.",
      other: "Quite right. We shall engage an elite workshop to attend to your precise specifications.",
    },
  },
  {
    id: 'doc',
    name: 'Doc Hudson',
    title: 'The Fabulous Hudson Hornet & Master Mechanic',
    image: '/characters/doc.jpg',
    color: '#1E3A8A',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
    quote: '"Turn right to go left. Respect the craft."',
    voice: { pitch: 0.88, rate: 0.96, preferredVoiceGender: 'male' },
    intro: "Doc Hudson here. Three Piston Cups and fifty years under the hood taught me: take care of your car, and it'll take care of you.",
    reactions: {
      oil: "Good call, kid. Change that oil regularly and your internal bearings will last half a million miles.",
      brakes: "Never skimp on brakes. If you can't stop smoothly, horsepower doesn't mean a thing.",
      tyres: "Tyre pressure and balance. If your rubber isn't dialed in, you'll fight the steering wheel all day.",
      battery: "Strong alternator and battery. That's the heartbeat of your starting cycle.",
      general: "Full checkup. Just like a proper medical check, preventative care keeps you out of trouble.",
      ac: "AC compressor and refrigerant. Keeps the cabin clear of fog and heat. Let's inspect it.",
      engine: "Listen to the valves and lifters. We'll get that motor tuned like a vintage thoroughbred.",
      other: "Tell me what's wrong, kid. Between me and the garage, there's no problem we can't solve.",
    },
  },
  {
    id: 'king',
    name: 'The King (Strip Weathers)',
    title: '#43 Dinoco Racing Legend',
    image: '/characters/king.jpg',
    color: '#0284C7',
    badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900',
    quote: '"Consistency and patience win championships."',
    voice: { pitch: 0.9, rate: 0.98, preferredVoiceGender: 'male' },
    intro: "Hello friend, I'm Strip Weathers. In forty-three years of racing, regular pit-stop maintenance was my golden secret to victory.",
    reactions: {
      oil: "An oil service is the best pit stop you can give your engine. Let's keep it running clean.",
      brakes: "Proper braking pads keep your car safe and predictable. Trust the process.",
      tyres: "Fresh tyres keep you stable on wet tarmac and long highway miles. Good choice.",
      battery: "Electrical checkup. You want instant ignition every single morning without hesitation.",
      general: "Full multi-point inspection. Consistency in service is what gives a car legendary reliability.",
      ac: "Cabin comfort check. Keeps long road journeys relaxing for the whole family.",
      engine: "Engine checkup. We'll make sure every mechanical linkage operates seamlessly.",
      other: "Understood friend. Let's get your vehicle the exact care it deserves.",
    },
  },
  {
    id: 'chick',
    name: 'Chick Hicks',
    title: '#86 Piston Cup Competitor & Commentator',
    image: '/characters/chick.jpg',
    color: '#16A34A',
    badgeBg: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900',
    quote: '"Ka-Chicka, Ka-Chicka! Number 86!"',
    voice: { pitch: 1.12, rate: 1.12, preferredVoiceGender: 'male' },
    intro: "Ka-Chicka! Ka-Chicka! Chick Hicks is in the house! Let's get your maintenance done faster and sharper than anyone else!",
    reactions: {
      oil: "Ka-Chicka! Slick oil means less drag and more overtaking power on the highway!",
      brakes: "Brake service! Hard braking into turns is how you hold the lead, baby!",
      tyres: "Tyres! Sticky rubber so nobody can pass you on the corners!",
      battery: "High-voltage battery check! Need that spark to ignite the competition!",
      general: "Complete overhaul! Let's make sure nothing slows you down out there!",
      ac: "Cold AC! You gotta look cool and stay cool when you take the checkered flag!",
      engine: "Engine check! Let's hear that exhaust roar louder than all the other cars!",
      other: "Ka-Chicka! Whatever you need, we're locking it in right now!",
    },
  },
  {
    id: 'sarge',
    name: 'Sarge',
    title: 'Military Veteran & Surplus Specialist',
    image: '/characters/sarge.jpg',
    color: '#4D7C0F',
    badgeBg: 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-900',
    quote: '"Order! Routine discipline wins every mission."',
    voice: { pitch: 0.86, rate: 0.98, preferredVoiceGender: 'male' },
    intro: "Attention! Sarge reporting for duty. A clean, disciplined vehicle inspection is standard operating readiness for any mission!",
    reactions: {
      oil: "Oil change protocol confirmed! Heavy-duty lubrication ensures mission success in all terrains!",
      brakes: "Brake inspection underway! Dependable stopping distance is mandatory for tactical convoy maneuvers!",
      tyres: "All-terrain tyre readiness! Checking tread depth and inflation pressure to military standards!",
      battery: "Electrical reserves inspected! Battery voltage must never fail during field operations!",
      general: "Full tactical multi-point inspection! Bumper to bumper, no excuses soldier!",
      ac: "Cabin climate control! Keeping the crew mission-ready in desert heat or mountain chills!",
      engine: "Powerplant inspection! We'll have this engine firing with military precision!",
      other: "Special requirement acknowledged! Proceeding to mobilize nearest certified workshop unit!",
    },
  },
];
