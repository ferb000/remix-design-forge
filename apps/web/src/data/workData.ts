import imgNordic from '../assets/images/arch_hero_nordic_1791042685381.jpg';
import imgMonolith from '../assets/images/arch_monolith_museum_1791042697346.jpg';
import imgInterior from '../assets/images/arch_interior_loft_1791042707674.jpg';
import imgKyoto from '../assets/images/arch_kyoto_sanctuary_1791042718246.jpg';
import imgDesert from '../assets/images/arch_desert_villa_1791046593942.jpg';
import imgSpiral from '../assets/images/arch_spiral_gallery_1791046607463.jpg';
import imgAlpine from '../assets/images/arch_alpine_chalet_1791046619292.jpg';
import imgTower from '../assets/images/arch_glass_tower_1791046631981.jpg';

export interface WorkProject {
  id: string;
  title: string;
  category: 'Still Images' | 'Animations' | '360 Panoramas' | 'Virtual Reality';
  categoryLabel: string;
  location: string;
  year: string;
  architect: string;
  pipeline: string;
  aspect: string;
  image: string;
  description: string;
}

export const WORK_PROJECTS: WorkProject[] = [
  // Stills
  {
    id: 'nordic-cantilever',
    title: 'Nordic Basalt Villa',
    category: 'Still Images',
    categoryLabel: 'Exterior & Landscape Stills',
    location: 'Vestland, Norway',
    year: '2026',
    architect: 'Lund Hagem Arkitekter',
    pipeline: 'Corona 12 / 3ds Max · 8K Linear EXR',
    aspect: '35mm · F/2.0 · Dawn Fog',
    image: imgNordic,
    description: 'Cantilevered basalt slabs anchored into fjord granite cliffs, framing raw atmospheric reflections.'
  },
  {
    id: 'metropolitan-penthouse',
    title: 'Manhattan Penthouse Salon',
    category: 'Still Images',
    categoryLabel: 'Luxury Interior Stills',
    location: 'New York, USA',
    year: '2025',
    architect: 'Atelier Bow-Wow',
    pipeline: 'Path Tracer 8K · Fluted Nero Marquina Shaders',
    aspect: '50mm · F/1.8 · Twilight',
    image: imgInterior,
    description: 'Double-height volume framing the Manhattan twilight, smoked oak millwork, and fluted hearth.'
  },
  {
    id: 'desert-pavilion',
    title: 'Amangiri Basalt Sanctuary',
    category: 'Still Images',
    categoryLabel: 'Desert Exterior Stills',
    location: 'Canyon Point, Utah',
    year: '2026',
    architect: 'Rick Joy Architects',
    pipeline: 'V-Ray 6 · Spectral Dust Dispersion',
    aspect: '28mm · F/4.0 · Sandstone Dusk',
    image: imgDesert,
    description: 'Monolithic raw concrete embedded into red rock strata with mirror infinity reflection pool.'
  },
  {
    id: 'spiral-atrium',
    title: 'Basel Kunsthalle Pavilion',
    category: 'Still Images',
    categoryLabel: 'Civic Architecture Stills',
    location: 'Basel, Switzerland',
    year: '2025',
    architect: 'Herzog & de Meuron',
    pipeline: 'Unreal Engine 5.5 · Lumen Subsurface Scattering',
    aspect: '24mm · F/3.5 · Diffuse Daylight',
    image: imgSpiral,
    description: 'Continuous sculptural travertine ramp orbiting an overhead celestial oculus aperture.'
  },

  // Animations
  {
    id: 'monolith-museum',
    title: 'Monolith Solar Pavilion Film',
    category: 'Animations',
    categoryLabel: 'Cinematic 3D Motion (60 FPS)',
    location: 'Ticino, Switzerland',
    year: '2026',
    architect: 'Tadao Ando Architect & Associates',
    pipeline: 'Unreal Engine 5.5 · 4K 60FPS Camera Path',
    aspect: 'Dolly & Drone Glides · ACEScg',
    image: imgMonolith,
    description: 'Cinematic daylight sweep tracking solar slits across board-formed concrete galleries.'
  },
  {
    id: 'alpine-retreat-film',
    title: 'Engadin Alpine Sanctuary',
    category: 'Animations',
    categoryLabel: 'Atmospheric Walkthrough Film',
    location: 'St. Moritz, Switzerland',
    year: '2026',
    architect: 'Peter Zumthor Studio',
    pipeline: 'DaVinci Resolve Studio 19 · 10-bit HDR Motion',
    aspect: '65mm Anamorphic · Snowfall Simulation',
    image: imgAlpine,
    description: 'Slow-motion aerial approach over snow-laden firs, transitioning to cozy interior fireplace glow.'
  },
  {
    id: 'tower-skyline-motion',
    title: 'Madison Botanical Spire',
    category: 'Animations',
    categoryLabel: 'Masterplan Cinematics',
    location: 'New York, USA',
    year: '2025',
    architect: 'Foster + Partners',
    pipeline: 'Redshift 3.6 / Houdini · Cloud Volumetrics',
    aspect: 'Macro Drone Sweep · Twilight',
    image: imgTower,
    description: 'Dynamic evening time-lapse tracking cantilevered sky gardens and metropolitan traffic caustics.'
  },

  // 360 Panoramas
  {
    id: 'kyoto-water-360',
    title: 'Kyoto Tea Pavilion 360°',
    category: '360 Panoramas',
    categoryLabel: 'Equirectangular 16K Panorama',
    location: 'Arashiyama, Kyoto',
    year: '2026',
    architect: 'Kengo Kuma & Associates',
    pipeline: '16K Spherical Render · WebGL Interactive Horizon',
    aspect: 'Full 360° × 180° Spatial Immersion',
    image: imgKyoto,
    description: 'Interactive high-dynamic range panorama looking across mirror water gardens and charred cedar veranda.'
  },
  {
    id: 'desert-atrium-360',
    title: 'Utah Canyon Oasis 360°',
    category: '360 Panoramas',
    categoryLabel: 'Immersive Spherical Tour',
    location: 'Sedona / Utah Ridge',
    year: '2026',
    architect: 'Olson Kundig',
    pipeline: 'Stereoscopic 360 EXR · Interactive Hotspots',
    aspect: '360° Ambient Spatial Audio',
    image: imgDesert,
    description: 'Full spherical immersion standing on the cantilever terrace as twilight colors the red canyon horizon.'
  },
  {
    id: 'penthouse-salon-360',
    title: 'Sky Salon 360° Virtual Twin',
    category: '360 Panoramas',
    categoryLabel: 'Interior Panoramic Configurator',
    location: 'Tribeca, New York',
    year: '2025',
    architect: 'Studio Liaigre',
    pipeline: 'Cubemap 12K · Day/Night Lighting Switcher',
    aspect: 'Dynamic Light Slider 360°',
    image: imgInterior,
    description: 'Rotatable 360° view with instant toggle between bright morning daylight and golden twilight hour.'
  },

  // Virtual Reality
  {
    id: 'ue5-kyoto-vr',
    title: 'Kyoto Nanite Digital Twin',
    category: 'Virtual Reality',
    categoryLabel: 'Real-Time Unreal Engine 5.5',
    location: 'Kyoto, Japan',
    year: '2026',
    architect: 'Design Forge Labs',
    pipeline: 'UE 5.5 · Lumen Global Illumination · Nanite',
    aspect: 'Apple Vision Pro & Meta Quest 3 Native',
    image: imgKyoto,
    description: 'Fully interactive real-time spatial experience allowing physical room-scale walkthrough with real-time water caustics.'
  },
  {
    id: 'ue5-tower-vr',
    title: 'Botanical Spire Penthouse VR',
    category: 'Virtual Reality',
    categoryLabel: 'Real-Time Spatial Walkthrough',
    location: 'Manhattan, New York',
    year: '2026',
    architect: 'Foster + Partners',
    pipeline: 'Pixel Streaming 4K · 90 FPS Low Latency',
    aspect: 'Real-time Material & Furniture Configurator',
    image: imgTower,
    description: 'Explore the master penthouse in real-time, configure stone slabs, adjust sun azimuth, and step onto balcony.'
  },
  {
    id: 'ue5-museum-vr',
    title: 'Monolith Travertine VR Gallery',
    category: 'Virtual Reality',
    categoryLabel: 'Interactive Cultural Twin',
    location: 'Basel, Switzerland',
    year: '2026',
    architect: 'Tadao Ando Architect',
    pipeline: 'Hardware Ray-Tracing · Spatial Binaural Audio',
    aspect: 'Multi-User Remote Client Presentation',
    image: imgMonolith,
    description: 'Host remote collaborative design meetings inside the unbuilt museum with photorealistic avatars.'
  }
];

export interface CategoryDeck {
  id: string;
  name: string;
  tagline: string;
  description: string;
  count: number;
  cards: WorkProject[];
}

export const WORK_CATEGORIES: CategoryDeck[] = [
  {
    id: 'all',
    name: 'All',
    tagline: 'Curated Architectural Showcase',
    description: 'A comprehensive cross-section of unbuilt architecture, photorealistic CGI, cinematic films, and spatial VR.',
    count: WORK_PROJECTS.length,
    cards: [
      WORK_PROJECTS[0], // Nordic
      WORK_PROJECTS[4], // Monolith
      WORK_PROJECTS[1], // Manhattan
      WORK_PROJECTS[7], // Kyoto
    ]
  },
  {
    id: 'still-images',
    name: 'Still Images',
    tagline: 'Exteriors & Interiors in 8K',
    description: 'Museum-grade still perspectives engineered with meticulous material shaders, natural foliage, and calibrated daylight atmospheres.',
    count: 4,
    cards: [
      WORK_PROJECTS[0], // Nordic
      WORK_PROJECTS[1], // Manhattan
      WORK_PROJECTS[2], // Desert
      WORK_PROJECTS[3], // Spiral
    ]
  },
  {
    id: 'animations',
    name: 'Animations',
    tagline: 'Architectural 3D Motion & Film',
    description: 'Moving narrative cinematography with bespoke spatial sound design, dynamic day-to-night lighting sweeps, and drone glides.',
    count: 3,
    cards: [
      WORK_PROJECTS[4], // Monolith
      WORK_PROJECTS[5], // Alpine
      WORK_PROJECTS[6], // Tower
    ]
  },
  {
    id: '360-panoramas',
    name: '360 Panoramas',
    tagline: 'Interactive Spherical Horizons',
    description: 'Seamless equirectangular 16K panoramas enabling full spatial immersion and day/night environment toggles on any device.',
    count: 3,
    cards: [
      WORK_PROJECTS[7], // Kyoto
      WORK_PROJECTS[8], // Desert
      WORK_PROJECTS[9], // Sky Salon
    ]
  },
  {
    id: 'virtual-reality',
    name: 'Virtual Reality',
    tagline: 'Unreal Engine 5 Real-Time Twins',
    description: 'Hardware ray-traced digital twins powered by Nanite and Lumen. Ready for pixel streaming, PC standalone, and Apple Vision Pro.',
    count: 3,
    cards: [
      WORK_PROJECTS[10], // Kyoto VR
      WORK_PROJECTS[11], // Tower VR
      WORK_PROJECTS[12], // Monolith VR
    ]
  }
];

export const CLIENT_PARTNERS = [
  { name: 'Snøhetta', category: 'Architecture & Landscape', origin: 'Oslo' },
  { name: 'David Chipperfield', category: 'Cultural Architecture', origin: 'London' },
  { name: 'Kengo Kuma', category: 'Contemporary Timber', origin: 'Tokyo' },
  { name: 'Herzog & de Meuron', category: 'Museums & Masterplans', origin: 'Basel' },
  { name: 'Foster + Partners', category: 'High-Density Towers', origin: 'London' },
  { name: 'BIG — Bjarke Ingels', category: 'Civic Innovation', origin: 'Copenhagen' },
  { name: 'Zaha Hadid Architects', category: 'Parametric Futurism', origin: 'London' },
  { name: 'CapitaLand', category: 'Luxury Hospitality', origin: 'Singapore' },
  { name: 'Hines Investment', category: 'Urban Developments', origin: 'Chicago' },
  { name: 'Tadao Ando Associates', category: 'Minimalist Concrete', origin: 'Osaka' },
  { name: 'Studio Gang', category: 'Ecological High-Rise', origin: 'Chicago' },
  { name: 'OMA / Rem Koolhaas', category: 'Urban Strategy', origin: 'Rotterdam' },
];
