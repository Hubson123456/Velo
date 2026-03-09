export interface Climb {
  id: string;
  name: string;
  location: string;
  distance: number; // km
  avgGradient: number; // %
  elevationGain: number; // m
  description: string;
  image: string;
}

export const FAMOUS_CLIMBS: Climb[] = [
  {
    id: 'alpe-dhuez',
    name: "Alpe d'Huez",
    location: "France (Alps)",
    distance: 13.8,
    avgGradient: 8.1,
    elevationGain: 1118,
    description: "The most iconic climb in the Tour de France, famous for its 21 hairpin bends.",
    image: "https://picsum.photos/seed/alpe/800/400"
  },
  {
    id: 'mont-ventoux',
    name: "Mont Ventoux",
    location: "France (Provence)",
    distance: 21.4,
    avgGradient: 7.5,
    elevationGain: 1605,
    description: "The 'Giant of Provence', known for its lunar landscape and exposed, windy summit.",
    image: "https://picsum.photos/seed/ventoux/800/400"
  },
  {
    id: 'stelvio',
    name: "Passo dello Stelvio",
    location: "Italy (Dolomites)",
    distance: 24.3,
    avgGradient: 7.4,
    elevationGain: 1808,
    description: "The highest paved mountain pass in the Eastern Alps, featuring 48 legendary hairpins.",
    image: "https://picsum.photos/seed/stelvio/800/400"
  },
  {
    id: 'tourmalet',
    name: "Col du Tourmalet",
    location: "France (Pyrenees)",
    distance: 17.1,
    avgGradient: 7.3,
    elevationGain: 1248,
    description: "The most used climb in Tour de France history, a true Pyrenean giant.",
    image: "https://picsum.photos/seed/tourmalet/800/400"
  },
  {
    id: 'mortirolo',
    name: "Passo del Mortirolo",
    location: "Italy (Lombardy)",
    distance: 12.4,
    avgGradient: 10.5,
    elevationGain: 1300,
    description: "Considered one of the toughest climbs in professional cycling due to its relentless steepness.",
    image: "https://picsum.photos/seed/mortirolo/800/400"
  },
  {
    id: 'angliru',
    name: "Alto de l'Angliru",
    location: "Spain (Asturias)",
    distance: 12.5,
    avgGradient: 10.1,
    elevationGain: 1262,
    description: "A brutal climb with sections reaching 24% gradient, often deciding the Vuelta a España.",
    image: "https://picsum.photos/seed/angliru/800/400"
  },
  {
    id: 'sa-calobra',
    name: "Sa Calobra",
    location: "Spain (Mallorca)",
    distance: 9.4,
    avgGradient: 7.0,
    elevationGain: 658,
    description: "A masterpiece of engineering with a 360-degree 'tie knot' turn and stunning coastal views.",
    image: "https://picsum.photos/seed/calobra/800/400"
  },
  {
    id: 'koppenberg',
    name: "Koppenberg",
    location: "Belgium (Flanders)",
    distance: 0.6,
    avgGradient: 11.6,
    elevationGain: 70,
    description: "A short but legendary cobbled climb in the Tour of Flanders, reaching 22% at its steepest.",
    image: "https://picsum.photos/seed/koppenberg/800/400"
  }
];
