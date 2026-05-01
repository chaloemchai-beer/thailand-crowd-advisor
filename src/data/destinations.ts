export type CrowdLevel = "low" | "medium" | "high";

export interface Destination {
  id: string;
  name: string;
  nameTh: string;
  region: string;
  category: string;
  basePopularity: number;
  image: string;
  description: string;
  lat: number;
  lng: number;
}

export const destinations: Destination[] = [
  {
    id: "grand-palace",
    name: "Grand Palace",
    nameTh: "พระบรมมหาราชวัง",
    region: "Bangkok",
    category: "Heritage",
    basePopularity: 0.95,
    image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80",
    description: "แลนด์มาร์กหลักของกรุงเทพฯ คนหนาแน่นเกือบทั้งวัน โดยเฉพาะสายถึงบ่าย",
    lat: 13.75,
    lng: 100.49,
  },
  {
    id: "wat-pho",
    name: "Wat Pho",
    nameTh: "วัดโพธิ์",
    region: "Bangkok",
    category: "Temple",
    basePopularity: 0.85,
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    description: "พระนอนองค์ใหญ่ ใกล้พระบรมมหาราชวัง เหมาะกับการวางแผนเที่ยวต่อเนื่อง",
    lat: 13.7465,
    lng: 100.4927,
  },
  {
    id: "wat-arun",
    name: "Wat Arun",
    nameTh: "วัดอรุณ",
    region: "Bangkok",
    category: "Temple",
    basePopularity: 0.8,
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
    description: "พระปรางค์ริมแม่น้ำเจ้าพระยา สวยช่วงเช้าและช่วงพระอาทิตย์ตก",
    lat: 13.7437,
    lng: 100.4889,
  },
  {
    id: "chatuchak",
    name: "Chatuchak Market",
    nameTh: "ตลาดนัดจตุจักร",
    region: "Bangkok",
    category: "Market",
    basePopularity: 0.9,
    image: "https://images.unsplash.com/photo-1555529669-2269763671c0?w=800&q=80",
    description: "ตลาดนัดสุดสัปดาห์ขนาดใหญ่ ช่วงเที่ยงถึงบ่ายมักแออัดมาก",
    lat: 13.7997,
    lng: 100.5503,
  },
  {
    id: "wat-saket",
    name: "Wat Saket (Golden Mount)",
    nameTh: "วัดสระเกศ",
    region: "Bangkok",
    category: "Temple",
    basePopularity: 0.45,
    image: "https://images.unsplash.com/photo-1601999710614-e1f9c8a89c84?w=800&q=80",
    description: "ภูเขาทอง วิวกรุงเทพฯ 360 องศา คนเบากว่าแลนด์มาร์กหลัก",
    lat: 13.7537,
    lng: 100.5066,
  },
  {
    id: "talad-noi",
    name: "Talad Noi",
    nameTh: "ตลาดน้อย",
    region: "Bangkok",
    category: "Cultural",
    basePopularity: 0.35,
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
    description: "ย่านเก่าริมเจ้าพระยาที่มีสตรีทอาร์ต คาเฟ่ และจุดถ่ายรูปซ่อนตัว",
    lat: 13.7349,
    lng: 100.5135,
  },
  {
    id: "doi-suthep",
    name: "Doi Suthep",
    nameTh: "ดอยสุเทพ",
    region: "Chiang Mai",
    category: "Temple",
    basePopularity: 0.78,
    image: "https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=800&q=80",
    description: "วัดบนดอย สัญลักษณ์ของเชียงใหม่ เหมาะไปเช้าก่อนกรุ๊ปทัวร์หนาแน่น",
    lat: 18.8048,
    lng: 98.9216,
  },
  {
    id: "phra-nang",
    name: "Phra Nang Beach",
    nameTh: "หาดพระนาง",
    region: "Krabi",
    category: "Beach",
    basePopularity: 0.7,
    image: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=800&q=80",
    description: "หาดสวยล้อมด้วยหน้าผาหินปูน ช่วงสายถึงบ่ายมีเรือนำเที่ยวมาก",
    lat: 8.0094,
    lng: 98.8378,
  },
  {
    id: "maya-bay",
    name: "Maya Bay",
    nameTh: "อ่าวมาหยา",
    region: "Krabi",
    category: "Beach",
    basePopularity: 0.92,
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    description: "อ่าวชื่อดังในหมู่เกาะพีพี ควรตรวจรอบเรือและข้อจำกัดการเข้าอุทยาน",
    lat: 7.6776,
    lng: 98.7656,
  },
  {
    id: "ayutthaya",
    name: "Ayutthaya Historical Park",
    nameTh: "อุทยานประวัติศาสตร์อยุธยา",
    region: "Ayutthaya",
    category: "Heritage",
    basePopularity: 0.65,
    image: "https://images.unsplash.com/photo-1555921015-5532091f6026?w=800&q=80",
    description: "เมืองเก่ามรดกโลก เหมาะกับการเลือกช่วงเช้าหรือเย็นเพื่อลดทั้งคนและแดด",
    lat: 14.3532,
    lng: 100.5683,
  },
];

export const crowdLabels: Record<CrowdLevel, { th: string; en: string; pct: string }> = {
  low: { th: "คนน้อย", en: "Low", pct: "<35%" },
  medium: { th: "ปานกลาง", en: "Medium", pct: "35-70%" },
  high: { th: "หนาแน่น", en: "High", pct: ">70%" },
};
