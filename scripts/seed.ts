import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  countriesTable,
  toursTable,
  tourPricingTable,
  visaServicesTable,
} from "../lib/db/src/index.js";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const db = drizzle(client);

// Check if already seeded
const existingCountries = await db.select().from(countriesTable);
if (existingCountries.length > 0) {
  console.log(`Already have ${existingCountries.length} countries — skipping seed.`);
  await client.end();
  process.exit(0);
}

// 1. Origin countries (flight hubs)
const origins = [
  { name: "United States", code: "US", type: "origin" },
  { name: "United Kingdom", code: "GB", type: "origin" },
  { name: "Canada", code: "CA", type: "origin" },
  { name: "Germany", code: "DE", type: "origin" },
  { name: "France", code: "FR", type: "origin" },
  { name: "Australia", code: "AU", type: "origin" },
  { name: "Netherlands", code: "NL", type: "origin" },
  { name: "UAE", code: "AE", type: "origin" },
  { name: "China", code: "CN", type: "origin" },
  { name: "Brazil", code: "BR", type: "origin" },
];

// 2. Destination countries
const destinations = [
  { name: "Kenya", code: "KE", type: "destination" },
  { name: "Tanzania", code: "TZ", type: "destination" },
  { name: "South Africa", code: "ZA", type: "destination" },
  { name: "Morocco", code: "MA", type: "destination" },
  { name: "Egypt", code: "EG", type: "destination" },
  { name: "Rwanda", code: "RW", type: "destination" },
  { name: "Ethiopia", code: "ET", type: "destination" },
  { name: "Ghana", code: "GH", type: "destination" },
  { name: "Senegal", code: "SN", type: "destination" },
  { name: "Zanzibar (Tanzania)", code: "ZN", type: "destination" },
  { name: "Uganda", code: "UG", type: "destination" },
  { name: "Botswana", code: "BW", type: "destination" },
];

const insertedOrigins = await db.insert(countriesTable).values(origins as any).returning();
const insertedDests = await db.insert(countriesTable).values(destinations as any).returning();
console.log(`✓ Inserted ${insertedOrigins.length} origin + ${insertedDests.length} destination countries`);

const dest = (name: string) => insertedDests.find(c => c.name.startsWith(name))!;
const orig = (code: string) => insertedOrigins.find(c => c.code === code)!;

// 3. Tours
const tours = [
  {
    title: "Masai Mara Safari Experience",
    description: "Witness the Great Migration and the Big Five in one of Africa's most iconic wildlife reserves. Traverse golden savannah, spot lion prides, and watch thundering wildebeest cross the Mara River at dawn.",
    durationDays: 7,
    destinationCountryId: dest("Kenya").id,
    basePrice: "2490.00",
    highlights: ["Great Wildebeest Migration", "Big Five game drives", "Masai village visit", "Hot air balloon sunrise (optional)", "Bush dinner under the stars"],
    included: ["4x4 safari vehicle with guide", "All game drives", "Full board accommodation in tented camp", "Park entry fees", "Airport transfers"],
    notIncluded: ["International flights", "Visa fees", "Travel insurance", "Hot air balloon ride", "Gratuities"],
  },
  {
    title: "Serengeti & Ngorongoro Crater",
    description: "Explore Tanzania's two most celebrated ecosystems — from the endless plains of the Serengeti to the prehistoric Ngorongoro Crater teeming with flamingos and black rhino.",
    durationDays: 10,
    destinationCountryId: dest("Tanzania").id,
    basePrice: "3190.00",
    highlights: ["Serengeti infinite plains", "Ngorongoro Crater descent", "Flamingo-fringed soda lakes", "Black rhino tracking", "Maasai cultural evening"],
    included: ["Private 4x4 Land Cruiser", "Expert naturalist guide", "All game drives", "Full board lodges & camps", "Park & conservation fees"],
    notIncluded: ["International flights", "Visa fees", "Balloon safaris", "Travel insurance", "Tips"],
  },
  {
    title: "Cape Town & Garden Route Explorer",
    description: "From the drama of Table Mountain to the whale-watching cliffs of Hermanus and the lagoons of Knysna — South Africa's Garden Route is 300 km of pure wonder.",
    durationDays: 12,
    destinationCountryId: dest("South Africa").id,
    basePrice: "2890.00",
    highlights: ["Table Mountain cable car", "Cape of Good Hope", "Wine tasting in Stellenbosch", "Knysna Heads boat cruise", "Elephant sanctuary visit"],
    included: ["Private guided transportation", "9 nights boutique hotels", "Daily breakfast + 4 dinners", "All entrance fees", "Cape Town airport transfers"],
    notIncluded: ["International flights", "Lunches & most dinners", "Travel insurance", "Optional shark diving", "Gratuities"],
  },
  {
    title: "Morocco Imperial Cities & Sahara",
    description: "Blue Chefchaouen, the rose medina of Marrakech, French-colonial Casablanca, and a night sleeping in a luxury Sahara desert camp — Morocco is a feast for every sense.",
    durationDays: 10,
    destinationCountryId: dest("Morocco").id,
    basePrice: "1890.00",
    highlights: ["Blue streets of Chefchaouen", "Fes el-Bali medina UNESCO walk", "Sahara camel trek", "Night under Sahara stars", "Marrakech souks & Jemaa el-Fna"],
    included: ["Private air-conditioned vehicle", "English-speaking local guide", "9 nights riads & desert camp", "Daily breakfast + 5 dinners", "All entry fees"],
    notIncluded: ["International flights", "Moroccan visa (if applicable)", "Travel insurance", "Personal shopping", "Tips"],
  },
  {
    title: "Nile, Pyramids & Luxor Temples",
    description: "Journey through 5,000 years of civilisation — from the Great Pyramid at Giza to the colossal temples of Luxor and Karnak, sailing the Nile on a traditional dahabiya.",
    durationDays: 9,
    destinationCountryId: dest("Egypt").id,
    basePrice: "2190.00",
    highlights: ["Pyramids of Giza & Great Sphinx", "Valley of the Kings", "Karnak Temple at sunset", "Nile felucca sailing", "Egyptian Museum Cairo"],
    included: ["Expert Egyptologist guide", "Cairo + Luxor + Aswan hotels (4-star)", "Nile cruise (2 nights)", "All entry fees", "Domestic flights Cairo–Luxor–Aswan"],
    notIncluded: ["International flights", "Egyptian e-visa", "Travel insurance", "Lunches", "Gratuities"],
  },
  {
    title: "Rwanda Gorilla Trekking & Kigali",
    description: "Come face to face with endangered mountain gorillas in the mist-shrouded Virunga volcanoes — one of the most profound wildlife encounters on Earth — before exploring vibrant Kigali.",
    durationDays: 6,
    destinationCountryId: dest("Rwanda").id,
    basePrice: "4490.00",
    highlights: ["Mountain gorilla trekking permit", "Hour with a gorilla family", "Volcanoes National Park", "Kigali Genocide Memorial", "Cultural village experience"],
    included: ["Gorilla trekking permit (included)", "5 nights lodges", "All park activities", "Full board in park", "All transfers"],
    notIncluded: ["International flights", "Visa fees", "Travel insurance", "Kigali city meals", "Gratuities"],
  },
  {
    title: "Zanzibar Spice Island Escape",
    description: "White-sand beaches, turquoise Indian Ocean waters, a UNESCO World Heritage Stone Town, and the legendary Spice Route — Zanzibar is the perfect finale to any East African adventure.",
    durationDays: 8,
    destinationCountryId: dest("Zanzibar (Tanzania)").id,
    basePrice: "1790.00",
    highlights: ["Stone Town UNESCO walking tour", "Spice plantation tour & tasting", "Snorkelling at Mnemba Atoll", "Sunset dhow cruise", "Prison Island giant tortoises"],
    included: ["7 nights beachfront resort", "Half board (breakfast + dinner)", "Airport/port transfers", "All guided excursions listed", "Snorkelling equipment"],
    notIncluded: ["International + domestic flights", "Zanzibar visa fees", "Scuba diving", "Travel insurance", "Tips"],
  },
  {
    title: "Uganda Chimp Trekking & Nile Source",
    description: "Trek ancient rainforest to observe wild chimpanzees in Kibale, cruise the Kazinga Channel among hippos and elephants, and visit the Source of the Nile at Jinja.",
    durationDays: 8,
    destinationCountryId: dest("Uganda").id,
    basePrice: "2790.00",
    highlights: ["Chimpanzee trekking in Kibale Forest", "Queen Elizabeth NP game drive", "Kazinga Channel boat cruise", "Source of the Nile visit", "Traditional Ugandan dinner"],
    included: ["Chimp trek permit", "Private 4x4 with guide", "7 nights lodges full board", "All park fees", "Airport transfers Entebbe"],
    notIncluded: ["International flights", "Uganda visa", "Travel insurance", "Gorilla permit add-on", "Gratuities"],
  },
];

const insertedTours = await db.insert(toursTable).values(tours as any).returning();
console.log(`✓ Inserted ${insertedTours.length} tours`);

// 4. Tour pricing per origin (subset of tours)
const pricingRows: any[] = [];
const tourByTitle = (t: string) => insertedTours.find(x => x.title.startsWith(t))!;

const pricingMap: Array<{ title: string; prices: Array<{ code: string; price: string }> }> = [
  { title: "Masai Mara", prices: [{ code: "US", price: "2490.00" }, { code: "GB", price: "2290.00" }, { code: "AU", price: "2690.00" }, { code: "DE", price: "2390.00" }, { code: "CA", price: "2550.00" }] },
  { title: "Serengeti", prices: [{ code: "US", price: "3190.00" }, { code: "GB", price: "2990.00" }, { code: "AU", price: "3390.00" }, { code: "DE", price: "3090.00" }] },
  { title: "Cape Town", prices: [{ code: "US", price: "2890.00" }, { code: "GB", price: "2690.00" }, { code: "AU", price: "2990.00" }] },
  { title: "Morocco", prices: [{ code: "US", price: "1890.00" }, { code: "GB", price: "1790.00" }, { code: "FR", price: "1690.00" }, { code: "DE", price: "1750.00" }] },
  { title: "Nile", prices: [{ code: "US", price: "2190.00" }, { code: "GB", price: "2090.00" }, { code: "AE", price: "1990.00" }] },
  { title: "Rwanda", prices: [{ code: "US", price: "4490.00" }, { code: "GB", price: "4290.00" }, { code: "AU", price: "4690.00" }] },
  { title: "Zanzibar", prices: [{ code: "US", price: "1790.00" }, { code: "GB", price: "1690.00" }, { code: "AU", price: "1890.00" }, { code: "AE", price: "1650.00" }] },
  { title: "Uganda", prices: [{ code: "US", price: "2790.00" }, { code: "GB", price: "2590.00" }, { code: "AU", price: "2890.00" }] },
];

for (const p of pricingMap) {
  const tour = tourByTitle(p.title);
  if (!tour) continue;
  for (const { code, price } of p.prices) {
    const origin = insertedOrigins.find(c => c.code === code);
    if (origin) pricingRows.push({ tourId: tour.id, originCountryId: origin.id, price });
  }
}

if (pricingRows.length) {
  await db.insert(tourPricingTable).values(pricingRows);
  console.log(`✓ Inserted ${pricingRows.length} tour pricing rows`);
}

// 5. Visa services
const visaServices = [
  { name: "Kenya Tourist Visa", description: "Single-entry 90-day tourist visa for Kenya, processed via eCitizen with expert document review and follow-up.", fee: "75.00", destinationCountryId: dest("Kenya").id, requirements: ["Valid passport (min 6 months)", "Return flight ticket", "Bank statement (3 months)", "Passport photo", "Yellow fever certificate"], isActive: true },
  { name: "Tanzania Tourist Visa", description: "30-day single-entry visa for Tanzania including Zanzibar. We handle the application and alert you on approval.", fee: "85.00", destinationCountryId: dest("Tanzania").id, requirements: ["Valid passport (min 6 months)", "Confirmed accommodation booking", "Bank statement (3 months)", "Return air ticket", "Passport photo"], isActive: true },
  { name: "South Africa Visitor Visa", description: "Up to 90-day visitor visa for South Africa. Our team pre-checks all documents so your application succeeds first time.", fee: "95.00", destinationCountryId: dest("South Africa").id, requirements: ["Valid passport (6+ months)", "Bank statements (3 months)", "Return ticket", "Travel itinerary", "Proof of accommodation"], isActive: true },
  { name: "Morocco Visa Assistance", description: "Most nationalities enter Morocco visa-free for 90 days. We assist with supporting documents and full applications where required.", fee: "55.00", destinationCountryId: dest("Morocco").id, requirements: ["Valid passport", "Onward/return ticket", "Hotel booking confirmation", "Travel itinerary", "Travel insurance"], isActive: true },
  { name: "Egypt Tourist eVisa", description: "Egyptian single or multiple-entry e-Visa processed entirely online. We submit, track, and download your visa on your behalf.", fee: "65.00", destinationCountryId: dest("Egypt").id, requirements: ["Valid passport (min 6 months)", "Credit card for government fee", "Travel itinerary", "Passport photo (digital)", "Return flight ticket"], isActive: true },
  { name: "Rwanda Tourist Visa", description: "30-day single-entry visa for Rwanda processed via Irembo. Includes gorilla trekking permit coordination for our Rwanda tour holders.", fee: "80.00", destinationCountryId: dest("Rwanda").id, requirements: ["Valid passport (min 6 months)", "Bank statement", "Return ticket", "Passport photo", "Yellow fever certificate"], isActive: true },
  { name: "Uganda Tourist Visa", description: "Single-entry Uganda visa valid 90 days. We expedite the e-Visa and alert you immediately on approval.", fee: "70.00", destinationCountryId: dest("Uganda").id, requirements: ["Valid passport (min 6 months)", "Bank statement (3 months)", "Return ticket", "Proof of accommodation", "Yellow fever certificate"], isActive: true },
  { name: "Ghana Tourist Visa", description: "60-day single-entry visa for Ghana, coordinated with the High Commission in your country of residence.", fee: "90.00", destinationCountryId: dest("Ghana").id, requirements: ["Valid passport (min 6 months)", "Bank statement", "Invitation letter or hotel booking", "Return ticket", "Yellow fever certificate"], isActive: true },
  { name: "Zanzibar Entry & Tanzania Visa", description: "Combined Tanzania mainland + Zanzibar entry visa processing. Zanzibar is part of Tanzania — we handle the unified application.", fee: "85.00", destinationCountryId: dest("Zanzibar").id, requirements: ["Valid passport (min 6 months)", "Return ferry/flight ticket", "Bank statement", "Hotel booking", "Passport photo"], isActive: true },
];

const insertedVisa = await db.insert(visaServicesTable).values(visaServices as any).returning();
console.log(`✓ Inserted ${insertedVisa.length} visa services`);

await client.end();
console.log("\n✅ Seed complete!");
