export type Product = {
  id: string;
  name: string;
  pack: string;
  price: number;
  category: string;
  inStock: boolean;
  description: string;
  icon: string;
};

export const CATEGORIES = [
  "Fever & Pain",
  "Cold & Cough",
  "Stomach",
  "First Aid",
  "Wellness",
  "Baby Care",
] as const;

export const ZONES = [
  "Durgapur A Zone",
  "Durgapur B Zone",
  "Durgapur C Zone",
  "City Centre, Durgapur",
  "Kabiguru, Durgapur",
  "Urvashi, Durgapur",
  "Sepco, Durgapur",
];

export const DELIVERY_FEE = 20;
export const SUPPORT_PHONE = "+91 98765 43210";

export const CATALOG: Product[] = [
  { id: "p1", name: "Paracetamol 500mg", pack: "Strip of 10", price: 25, category: "Fever & Pain", inStock: true, description: "For fever and mild pain relief.", icon: "💊" },
  { id: "p2", name: "Ibuprofen 400mg", pack: "Strip of 10", price: 45, category: "Fever & Pain", inStock: true, description: "Anti-inflammatory pain reliever.", icon: "💊" },
  { id: "p3", name: "Aspirin 75mg", pack: "Strip of 14", price: 30, category: "Fever & Pain", inStock: false, description: "Low-dose aspirin.", icon: "💊" },
  { id: "p4", name: "Cough Syrup", pack: "100 ml", price: 95, category: "Cold & Cough", inStock: true, description: "Dry cough relief syrup.", icon: "🧴" },
  { id: "p5", name: "Cetirizine 10mg", pack: "Strip of 10", price: 35, category: "Cold & Cough", inStock: true, description: "Anti-allergic tablet.", icon: "💊" },
  { id: "p6", name: "Vicks VapoRub", pack: "25 g", price: 90, category: "Cold & Cough", inStock: true, description: "Menthol chest rub.", icon: "🧴" },
  { id: "p7", name: "Steam Inhaler Menthol", pack: "5 capsules", price: 60, category: "Cold & Cough", inStock: true, description: "Steam inhalation capsules.", icon: "🌿" },
  { id: "p8", name: "ORS Sachet Orange", pack: "Pack of 5", price: 75, category: "Stomach", inStock: true, description: "Oral rehydration salts.", icon: "🥤" },
  { id: "p9", name: "Digene Antacid", pack: "200 ml", price: 130, category: "Stomach", inStock: true, description: "Antacid gel for acidity.", icon: "🧴" },
  { id: "p10", name: "Loperamide 2mg", pack: "Strip of 10", price: 40, category: "Stomach", inStock: true, description: "Anti-diarrheal tablet.", icon: "💊" },
  { id: "p11", name: "Pudin Hara Pearls", pack: "Strip of 10", price: 45, category: "Stomach", inStock: true, description: "Mint pearls for indigestion.", icon: "🌿" },
  { id: "p12", name: "Band-Aid Flexible", pack: "Pack of 20", price: 55, category: "First Aid", inStock: true, description: "Fabric adhesive bandages.", icon: "🩹" },
  { id: "p13", name: "Dettol Antiseptic", pack: "125 ml", price: 85, category: "First Aid", inStock: true, description: "Antiseptic liquid.", icon: "🧴" },
  { id: "p14", name: "Cotton Roll", pack: "50 g", price: 40, category: "First Aid", inStock: true, description: "Absorbent cotton.", icon: "☁️" },
  { id: "p15", name: "Crepe Bandage", pack: "6 cm x 4 m", price: 70, category: "First Aid", inStock: true, description: "Elastic support bandage.", icon: "🩹" },
  { id: "p16", name: "Volini Spray", pack: "40 g", price: 175, category: "First Aid", inStock: true, description: "Pain relief spray.", icon: "🧴" },
  { id: "p17", name: "Vitamin C 500mg", pack: "Bottle of 30", price: 220, category: "Wellness", inStock: true, description: "Immunity support tablets.", icon: "🍊" },
  { id: "p18", name: "Multivitamin Daily", pack: "Bottle of 30", price: 350, category: "Wellness", inStock: true, description: "Daily multivitamin capsules.", icon: "💊" },
  { id: "p19", name: "Zinc + Vitamin D3", pack: "Strip of 10", price: 165, category: "Wellness", inStock: true, description: "Immune boost tablets.", icon: "☀️" },
  { id: "p20", name: "Chyawanprash", pack: "500 g", price: 280, category: "Wellness", inStock: true, description: "Ayurvedic health supplement.", icon: "🍯" },
  { id: "p21", name: "Honitus Cough Drops", pack: "Pack of 20", price: 50, category: "Wellness", inStock: true, description: "Herbal throat lozenges.", icon: "🍬" },
  { id: "p22", name: "Baby Paracetamol Syrup", pack: "60 ml", price: 65, category: "Baby Care", inStock: true, description: "Fever relief for infants.", icon: "🍼" },
  { id: "p23", name: "Baby Nasal Drops", pack: "10 ml", price: 55, category: "Baby Care", inStock: true, description: "Saline nasal drops.", icon: "🍼" },
  { id: "p24", name: "Diaper Rash Cream", pack: "50 g", price: 190, category: "Baby Care", inStock: true, description: "Soothing zinc oxide cream.", icon: "🧴" },
  { id: "p25", name: "Baby Thermometer", pack: "Digital", price: 240, category: "Baby Care", inStock: true, description: "Digital fever thermometer.", icon: "🌡️" },
  { id: "p26", name: "Baby Wipes", pack: "Pack of 72", price: 160, category: "Baby Care", inStock: true, description: "Gentle cleansing wipes.", icon: "🧻" },
  { id: "p27", name: "Electrolyte Drink Lemon", pack: "200 ml", price: 30, category: "Stomach", inStock: true, description: "Ready-to-drink hydration.", icon: "🥤" },
  { id: "p28", name: "Iodex Balm", pack: "16 g", price: 60, category: "Fever & Pain", inStock: true, description: "Muscle pain balm.", icon: "🧴" },
  { id: "p29", name: "Throat Lozenges Honey", pack: "Pack of 10", price: 40, category: "Cold & Cough", inStock: true, description: "Soothing throat lozenges.", icon: "🍬" },
  { id: "p30", name: "Hand Sanitizer", pack: "100 ml", price: 75, category: "Wellness", inStock: true, description: "70% alcohol sanitizer.", icon: "🧴" },
  { id: "p31", name: "Face Mask N95", pack: "Pack of 5", price: 120, category: "Wellness", inStock: true, description: "N95 respirator masks.", icon: "😷" },
  { id: "p32", name: "Thermometer Digital", pack: "Adult", price: 210, category: "First Aid", inStock: true, description: "Fast-read digital thermometer.", icon: "🌡️" },
];