import imgNordic from '../assets/images/arch_hero_nordic_1791042685381.jpg';
import imgMonolith from '../assets/images/arch_monolith_museum_1791042697346.jpg';
import imgInterior from '../assets/images/arch_interior_loft_1791042707674.jpg';
import imgKyoto from '../assets/images/arch_kyoto_sanctuary_1791042718246.jpg';

export interface SceneItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: string;
  location: string;
  year: string;
  focal: string;
  renderEngine: string;
  image: string;
  description: string;
}

export const SHOWREEL_SCENES: SceneItem[] = [
  {
    id: 'nordic-cantilever',
    code: '01',
    title: 'Nordic Cantilever Residence',
    subtitle: 'Brutalist concrete & basalt water pavilion',
    category: 'Residential Architecture',
    location: 'Vestland, Norway',
    year: '2026',
    focal: '35mm · F/1.8 · ISO 100',
    renderEngine: 'Unreal Engine 5.5 · Lumen Global Illumination',
    image: imgNordic,
    description: 'A monolithic private residence embedded into the granite ridge line overlooking the Norwegian fjords. Featuring board-formed dark basalt slabs and full-height thermal glazing.'
  },
  {
    id: 'monolith-museum',
    code: '02',
    title: 'The Monolith Contemporary Pavilion',
    subtitle: 'Curved concrete gallery & solar slit corridors',
    category: 'Cultural & Civic',
    location: 'Basel, Switzerland',
    year: '2026',
    focal: '24mm · F/4.0 · ISO 64',
    renderEngine: 'Path Tracer 8K · Custom Spectral Dispersion',
    image: imgMonolith,
    description: 'Monumental curved board-formed concrete volumes sculpted around celestial solar apertures. Natural sunbeams sweep across raw honed travertine galleries.'
  },
  {
    id: 'metropolitan-penthouse',
    code: '03',
    title: 'Metropolitan Penthouse Salon',
    subtitle: 'Smoked oak, fluted nero marquina & twilight horizon',
    category: 'Luxury Interior',
    location: 'Manhattan, New York',
    year: '2025',
    focal: '50mm · F/2.0 · ISO 200',
    renderEngine: 'Corona 12 / 3ds Max · Volumetric Smoked Atmosphere',
    image: imgInterior,
    description: 'Double-height private living space framing the Manhattan skyline during the twilight hour. Custom bespoke joinery, charcoal bouclé textiles, and fluted marble hearth.'
  },
  {
    id: 'kyoto-sanctuary',
    code: '04',
    title: 'Kyoto Water Pavilion & Tea Pavilion',
    subtitle: 'Charred cedar, dark titanium & mirror reflection pond',
    category: 'Hospitality & Wellness',
    location: 'Kyoto, Japan',
    year: '2026',
    focal: '40mm · F/2.8 · ISO 80',
    renderEngine: 'Unreal Engine 5.5 · Real-time Nanite Water Caustics',
    image: imgKyoto,
    description: 'A serene contemporary retreat cantilevered over mirror-like dark granite pools. Crafted with traditional yakisugi charred cedar, dark anodized titanium, and soft morning fog.'
  }
];

export interface ServicePackage {
  id: string;
  number: string;
  name: string;
  tagline: string;
  turnaround: string;
  deliverables: string[];
  idealFor: string;
}

export const STUDIO_SERVICES: ServicePackage[] = [
  {
    id: 'cinematic-cgi',
    number: '01',
    name: 'Cinematic Still Visualizations',
    tagline: 'Hyper-realistic exterior & interior perspectives with atmospheric lighting',
    turnaround: '5–10 Business Days',
    deliverables: [
      '8K Resolution final mastered stills',
      'Art direction, material sourcing & custom lighting moods (Dawn, Golden Hour, Twilight, Fog)',
      'High-detail 3D landscape and contextual foliage integration',
      'Post-production color grading in 32-bit linear EXR'
    ],
    idealFor: 'Architects, Developers, Real Estate Luxury Marketing & Competitions'
  },
  {
    id: 'showreel-animation',
    number: '02',
    name: 'Architectural Film & Cinematic Showreels',
    tagline: 'Moving narrative cinematography with bespoke spatial soundscapes',
    turnaround: '2–4 Weeks',
    deliverables: [
      '60 FPS 4K Cinema camera movements (drone sweeping, dolly glide, macro textures)',
      'Dynamic daylight cycle & weather simulations',
      'Bespoke original audio soundscape & voiceover mastering',
      'Motion graphics, title typography, and branding packaging'
    ],
    idealFor: 'Masterplans, High-End Developments, Investor Pitches & Exhibition Displays'
  },
  {
    id: 'realtime-interactive',
    number: '03',
    name: 'Unreal Engine 5 Real-Time Experiences',
    tagline: 'Interactive digital twins, virtual walkthroughs and VR spatial tours',
    turnaround: '3–6 Weeks',
    deliverables: [
      'Lumen real-time dynamic lighting and Nanite geometry',
      'Real-time material and furniture customization configurator',
      'Deployable to PC standalone, Web Pixel Streaming, or Apple Vision Pro / Meta Quest',
      'Interactive floor plan navigation with camera teleportation'
    ],
    idealFor: 'Off-plan sales centers, VIP client presentations & architectural showrooms'
  },
  {
    id: 'urban-masterplans',
    number: '04',
    name: 'Urban Scale Masterplans & Competitions',
    tagline: 'Strategic visualizations for large-scale city developments and bids',
    turnaround: '1–3 Weeks',
    deliverables: [
      'Aerial bird’s-eye masterplan photomontages and drone integration',
      'Diagrammatic architectural axonometrics and massing studies',
      'Phasing animation sequences and public infrastructure context',
      'Fast-track delivery for urgent architectural design competition deadlines'
    ],
    idealFor: 'Urban design firms, Municipal authorities, Global architectural competitions'
  }
];

export const STUDIO_INFO = {
  name: 'Design Forge',
  tagline: 'Give your dream a shape of reality',
  subheading: 'High-end architectural visualization & spatial motion studio',
  email: 'designforge25@gmail.com',
  phone: '+1 (555) 894-3200',
  locations: ['Zurich', 'London', 'New York'],
  leadTime: 'Currently booking Q2 / Q3 2026',
  stats: [
    { label: 'Completed Renders', value: '450+' },
    { label: 'International Awards', value: '18' },
    { label: 'Render Resolution', value: '8K UHD' },
    { label: 'Client Retention', value: '98%' }
  ],
  quote: 'We don’t just render buildings. We forge the emotional weight of space, stone, light, and shadow before the first foundation is ever poured.'
};
