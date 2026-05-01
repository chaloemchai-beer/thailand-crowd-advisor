export type CrowdLevel = "low" | "medium" | "high";

export interface Destination {
  id: string;
  name: string;
  nameTh: string;
  region: string;
  category: string;
  basePopularity: number;
  image: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  description: string;
  lat: number;
  lng: number;
  osmQuery: string;
  osm: {
    displayName: string;
    osmType: "node" | "way" | "relation";
    osmId: number;
    type: string;
    importance: number;
    wikidata?: string;
    wikipedia?: string;
  };
}

export const destinations: Destination[] = [
  {
    id: "grand-palace",
    name: "Grand Palace",
    nameTh: "Phra Borom Maha Ratcha Wang",
    region: "Bangkok",
    category: "Heritage",
    basePopularity: 0.95,
    image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80",
    description: "Major Bangkok landmark. Usually busy from late morning through afternoon.",
    lat: 13.7493514,
    lng: 100.4918643,
    osmQuery: "Grand Palace Bangkok Thailand",
    osm: {
      displayName: "Grand Palace, Phra Nakhon, Bangkok, Thailand",
      osmType: "way",
      osmId: 23482754,
      type: "attraction",
      importance: 0.4821004088859831,
      wikidata: "Q873769",
      wikipedia: "th:Phra Borom Maha Ratcha Wang",
    },
  },
  {
    id: "wat-pho",
    name: "Wat Pho",
    nameTh: "Wat Phra Chetuphon",
    region: "Bangkok",
    category: "Temple",
    basePopularity: 0.85,
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    description: "Large royal temple near the Grand Palace, useful for connected trip planning.",
    lat: 13.7463456,
    lng: 100.4927381,
    osmQuery: "Wat Pho Bangkok Thailand",
    osm: {
      displayName: "Wat Phra Chetuphon, Phra Nakhon, Bangkok, Thailand",
      osmType: "relation",
      osmId: 11169995,
      type: "place_of_worship",
      importance: 0.4177265377721238,
      wikidata: "Q1059910",
      wikipedia: "th:Wat Phra Chetuphon",
    },
  },
  {
    id: "wat-arun",
    name: "Wat Arun",
    nameTh: "Wat Arun",
    region: "Bangkok",
    category: "Temple",
    basePopularity: 0.8,
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
    description: "Riverside temple on the Chao Phraya, popular in morning and sunset windows.",
    lat: 13.7438976,
    lng: 100.4885137,
    osmQuery: "Wat Arun Bangkok Thailand",
    osm: {
      displayName: "Wat Arun, Bangkok Yai, Bangkok, Thailand",
      osmType: "way",
      osmId: 23481741,
      type: "place_of_worship",
      importance: 0.4162648857824267,
      wikidata: "Q724970",
      wikipedia: "th:Wat Arun",
    },
  },
  {
    id: "chatuchak",
    name: "Chatuchak Market",
    nameTh: "Chatuchak Weekend Market",
    region: "Bangkok",
    category: "Market",
    basePopularity: 0.9,
    image: "https://images.unsplash.com/photo-1555529669-2269763671c0?w=800&q=80",
    description: "Large weekend market. Midday through afternoon is typically the busiest period.",
    lat: 13.8002651,
    lng: 100.5511228,
    osmQuery: "Chatuchak Weekend Market Bangkok Thailand",
    osm: {
      displayName: "Chatuchak Weekend Market, Chatuchak, Bangkok, Thailand",
      osmType: "way",
      osmId: 37911198,
      type: "marketplace",
      importance: 0.3623846332493779,
      wikidata: "Q1068311",
      wikipedia: "th:Chatuchak Weekend Market",
    },
  },
  {
    id: "wat-saket",
    name: "Wat Saket (Golden Mount)",
    nameTh: "Wat Saket Ratchawora Mahawihan",
    region: "Bangkok",
    category: "Temple",
    basePopularity: 0.45,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Wat%20Saket%2C%20Golden%20Mount%2C%20Bangkok%2C%20Thailand.jpg?width=800",
    imageCredit: "Vyacheslav Argenberg / Wikimedia Commons / CC BY 4.0",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Wat_Saket,_Golden_Mount,_Bangkok,_Thailand.jpg",
    description: "Golden Mount temple with a central Bangkok viewpoint. Usually lighter than the main palace cluster.",
    lat: 13.7538492,
    lng: 100.5066941,
    osmQuery: "Wat Saket Bangkok Thailand",
    osm: {
      displayName: "Wat Saket Ratchawora Mahawihan, Pom Prap Sattru Phai, Bangkok, Thailand",
      osmType: "way",
      osmId: 88359228,
      type: "place_of_worship",
      importance: 0.00007662546730750008,
    },
  },
  {
    id: "talad-noi",
    name: "Talad Noi",
    nameTh: "Talat Noi",
    region: "Bangkok",
    category: "Cultural",
    basePopularity: 0.35,
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
    description: "Historic riverside neighborhood with street art, cafes, and smaller walking routes.",
    lat: 13.7334519,
    lng: 100.5129672,
    osmQuery: "Talat Noi Bangkok Thailand",
    osm: {
      displayName: "Talat Noi, Samphanthawong, Bangkok, Thailand",
      osmType: "relation",
      osmId: 11371472,
      type: "administrative",
      importance: 0.18674329213397417,
    },
  },
  {
    id: "doi-suthep",
    name: "Doi Suthep",
    nameTh: "Wat Phra That Doi Suthep",
    region: "Chiang Mai",
    category: "Temple",
    basePopularity: 0.78,
    image: "https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800&q=80",
    description: "Hilltop temple and Chiang Mai landmark. Morning visits help avoid heavier tour groups.",
    lat: 18.8035942,
    lng: 98.9202265,
    osmQuery: "Wat Phra That Doi Suthep Chiang Mai Thailand",
    osm: {
      displayName: "Wat Phra That Doi Suthep, Mueang Chiang Mai, Chiang Mai, Thailand",
      osmType: "node",
      osmId: 4228028194,
      type: "place_of_worship",
      importance: 0.000061879148546532654,
    },
  },
  {
    id: "phra-nang",
    name: "Phra Nang Beach",
    nameTh: "Phra Nang Beach",
    region: "Krabi",
    category: "Beach",
    basePopularity: 0.7,
    image: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&q=80",
    description: "Limestone-cliff beach near Railay. Boat-tour traffic usually grows from late morning.",
    lat: 8.005943,
    lng: 98.8376609,
    osmQuery: "Phra Nang Beach Krabi Thailand",
    osm: {
      displayName: "Phra Nang Beach, Ao Railay, Mueang Krabi, Krabi, Thailand",
      osmType: "relation",
      osmId: 19741816,
      type: "beach",
      importance: 0.10670466849774927,
    },
  },
  {
    id: "maya-bay",
    name: "Maya Bay",
    nameTh: "Maya Bay",
    region: "Krabi",
    category: "Beach",
    basePopularity: 0.92,
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    description: "Famous Phi Phi bay. Trip planning should account for boat schedules and park rules.",
    lat: 7.6766252,
    lng: 98.7661169,
    osmQuery: "Maya Bay Krabi Thailand",
    osm: {
      displayName: "Maya Bay, Ao Nang, Mueang Krabi, Krabi, Thailand",
      osmType: "node",
      osmId: 5314772921,
      type: "viewpoint",
      importance: 0.00000999999999995449,
      wikidata: "Q13024284",
    },
  },
  {
    id: "ayutthaya",
    name: "Ayutthaya Historical Park",
    nameTh: "Ayutthaya Historical Park",
    region: "Ayutthaya",
    category: "Heritage",
    basePopularity: 0.65,
    image: "https://images.unsplash.com/photo-1555921015-5532091f6026?w=800&q=80",
    description: "World heritage historic park. Morning or late afternoon reduces heat and crowd pressure.",
    lat: 14.3535461,
    lng: 100.5622548,
    osmQuery: "Ayutthaya Historical Park Thailand",
    osm: {
      displayName: "Ayutthaya Historical Park, Phra Nakhon Si Ayutthaya, Thailand",
      osmType: "way",
      osmId: 79265090,
      type: "park",
      importance: 0.4069980038678312,
      wikidata: "Q1025100",
    },
  },
];

export const crowdLabels: Record<CrowdLevel, { th: string; en: string; pct: string }> = {
  low: { th: "Low crowd", en: "Low", pct: "<35%" },
  medium: { th: "Moderate crowd", en: "Medium", pct: "35-70%" },
  high: { th: "High crowd", en: "High", pct: ">70%" },
};
