export interface VendorLocation {
  name_en: string
  name_ar: string
  lat: number
  lng: number
  type: "supermarket" | "bakery" | "restaurant" | "grocery" | "confectionery" | "wholesale"
  phone: string
  address_en: string
  address_ar: string
}

export interface CityInfo {
  slug: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  seoTitle_en: string
  seoTitle_ar: string
  region: string
  lat: number
  lng: number
  vendors: VendorLocation[]
}

export interface LocationCountry {
  slug: string
  name_en: string
  name_ar: string
  cities: CityInfo[]
}

const VENDOR_TYPES = {
  supermarket: { en: "Supermarket", ar: "سوبرماركت" },
  bakery: { en: "Bakery", ar: "مخبز" },
  restaurant: { en: "Restaurant", ar: "مطعم" },
  grocery: { en: "Grocery", ar: "بقالة" },
  confectionery: { en: "Confectionery", ar: "حلويات" },
  wholesale: { en: "Wholesale", ar: "جملة" },
}

export { VENDOR_TYPES }

const IRAQ_CITIES: CityInfo[] = [
  {
    slug: "baghdad",
    name_en: "Baghdad",
    name_ar: "بغداد",
    description_en: "Find Al-Tabakh premium food products at vendors across Baghdad — including Karrada, Mansour, and Adhamiyah districts.",
    description_ar: "اعثر على منتجات مالك الطباخ الغذائية الفاخرة في الباعة عبر بغداد - بما في ذلك الكرادة والمنصور والأعظمية.",
    seoTitle_en: "Al-Tabakh Vendors in Baghdad | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في بغداد | مواقع المتاجر",
    region: "Central Iraq",
    lat: 33.3152,
    lng: 44.3661,
    vendors: [
      { name_en: "Al-Mansour Supermarket", name_ar: "سوبرماركت المنصور", lat: 33.3165, lng: 44.3630, type: "supermarket", phone: "07711223344", address_en: "Al-Mansour District, Abu Nawas St", address_ar: "المنصور، شارع أبو نؤاس" },
      { name_en: "Karrada Bakery Supplies", name_ar: "مستلزمات المخابز - الكرادة", lat: 33.2980, lng: 44.3850, type: "bakery", phone: "07722334455", address_en: "Karrada, Al-Qadisya St", address_ar: "الكرادة، شارع القادسية" },
      { name_en: "Adhamiyah Wholesale", name_ar: "الجملة - الأعظمية", lat: 33.3715, lng: 44.3575, type: "wholesale", phone: "07733445566", address_en: "Adhamiyah, Imam Al-Azam", address_ar: "الأعظمية، الإمام الأعظم" },
      { name_en: "Al-Rasheed Grocery", name_ar: "بقالة الرشيد", lat: 33.3275, lng: 44.3875, type: "grocery", phone: "07744556677", address_en: "Al-Rasheed St, Central Baghdad", address_ar: "شارع الرشيد، وسط بغداد" },
      { name_en: "Sweets & Delights Confectionery", name_ar: "حلويات وبسكويت", lat: 33.3100, lng: 44.3700, type: "confectionery", phone: "07755667788", address_en: "Al-Jadriya, University District", address_ar: "الجادرية، منطقة الجامعة" },
      { name_en: "Abu Nawas Restaurant Supply", name_ar: "مستلزمات مطاعم أبو نؤاس", lat: 33.3200, lng: 44.3580, type: "restaurant", phone: "07766778899", address_en: "Abu Nawas St, near Al-Saadoon", address_ar: "شارع أبو نؤاس، قرب السعدون" },
    ],
  },
  {
    slug: "basra",
    name_en: "Basra",
    name_ar: "البصرة",
    description_en: "Locate Al-Tabakh products at supermarkets, bakeries and restaurants across Basra — from Al-Maqal to Al-Ashar.",
    description_ar: "حدد موقع منتجات مالك الطباخ في السوبرماركت والمخابز والمطاعم عبر البصرة - من المعقل إلى العشار.",
    seoTitle_en: "Al-Tabakh Vendors in Basra | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في البصرة | مواقع المتاجر",
    region: "Southern Iraq",
    lat: 30.5085,
    lng: 47.7824,
    vendors: [
      { name_en: "Al-Maqal Supermarket", name_ar: "سوبرماركت المعقل", lat: 30.5120, lng: 47.7850, type: "supermarket", phone: "07811223344", address_en: "Al-Maqal District, Main St", address_ar: "المعقل، الشارع الرئيسي" },
      { name_en: "Al-Ashar Bakery", name_ar: "مخبز العشار", lat: 30.5050, lng: 47.7900, type: "bakery", phone: "07822334455", address_en: "Al-Ashar, Corniche Rd", address_ar: "العشار، طريق الكورنيش" },
      { name_en: "Basra Wholesale Foods", name_ar: "مواد غذائية بالجملة - البصرة", lat: 30.5200, lng: 47.7750, type: "wholesale", phone: "07833445566", address_en: "Industrial Zone, Al-Hussein", address_ar: "المنطقة الصناعية، الحسين" },
      { name_en: "Shatt Al-Arab Grocery", name_ar: "بقالة شط العرب", lat: 30.4950, lng: 47.7950, type: "grocery", phone: "07844556677", address_en: "Shatt Al-Arab, Al-Jumhuriya St", address_ar: "شط العرب، شارع الجمهورية" },
    ],
  },
  {
    slug: "erbil",
    name_en: "Erbil",
    name_ar: "أربيل",
    description_en: "Discover Al-Tabakh food product vendors in Erbil — from the Citadel area to Ankawa and the new shopping districts.",
    description_ar: "اكتشف باعة منتجات مالك الطباخ الغذائية في أربيل - من منطقة القلعة إلى عنكاوا وأسواق التسوق الجديدة.",
    seoTitle_en: "Al-Tabakh Vendors in Erbil | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في أربيل | مواقع المتاجر",
    region: "Kurdistan Region",
    lat: 36.1911,
    lng: 44.0092,
    vendors: [
      { name_en: "Ankawa Supermarket", name_ar: "سوبرماركت عنكاوا", lat: 36.2260, lng: 43.9970, type: "supermarket", phone: "07511223344", address_en: "Ankawa District, Main Rd", address_ar: "عنكاوا، الطريق الرئيسي" },
      { name_en: "Citadel Bakery", name_ar: "مخبز القلعة", lat: 36.1900, lng: 44.0080, type: "bakery", phone: "07522334455", address_en: "Near Erbil Citadel, Old City", address_ar: "قرب قلعة أربيل، المدينة القديمة" },
      { name_en: "Erbil Wholesale Center", name_ar: "مركز الجملة - أربيل", lat: 36.2050, lng: 44.0200, type: "wholesale", phone: "07533445566", address_en: "Industrial District, 60m Rd", address_ar: "المنطقة الصناعية، شارع ٦٠ م" },
      { name_en: "Italian District Restaurant Supply", name_ar: "مستلزمات مطاعم الحي الإيطالي", lat: 36.2150, lng: 44.0150, type: "restaurant", phone: "07544556677", address_en: "Italian District, Villa Zone", address_ar: "الحي الإيطالي، منطقة الفيلات" },
    ],
  },
  {
    slug: "mosul", name_en: "Mosul", name_ar: "الموصل",
    description_en: "Find Al-Tabakh products in Mosul at vendors across the left and right banks of the Tigris.",
    description_ar: "اعثر على منتجات مالك الطباخ في الموصل في الباعة عبر الضفتين اليسرى واليمنى لدجلة.",
    seoTitle_en: "Al-Tabakh Vendors in Mosul | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في الموصل | مواقع المتاجر", region: "Northern Iraq",
    lat: 36.3400, lng: 43.1300,
    vendors: [
      { name_en: "Al-Noor Supermarket", name_ar: "سوبرماركت النور", lat: 36.3450, lng: 43.1350, type: "supermarket", phone: "07611223344", address_en: "Al-Midan, Left Bank", address_ar: "الميدان، الضفة اليسرى" },
      { name_en: "Nineveh Bakery", name_ar: "مخبز نينوى", lat: 36.3350, lng: 43.1250, type: "bakery", phone: "07622334455", address_en: "Al-Mosul Al-Jadida, Right Bank", address_ar: "الموصل الجديدة، الضفة اليمنى" },
      { name_en: "Al-Hadba Wholesale", name_ar: "الجملة - الحدباء", lat: 36.3550, lng: 43.1100, type: "wholesale", phone: "07633445566", address_en: "Al-Hadba District, Industrial Zone", address_ar: "منطقة الحدباء، الحي الصناعي" },
    ],
  },
  {
    slug: "sulaymaniyah", name_en: "Sulaymaniyah", name_ar: "السليمانية",
    description_en: "Al-Tabakh vendor locations in Sulaymaniyah — including Salim Street, Azadi Park area, and the bazaar district.",
    description_ar: "مواقع باعة مالك الطباخ في السليمانية - بما في ذلك شارع سليم ومنطقة حديقة آزادي ومنطقة البازار.",
    seoTitle_en: "Al-Tabakh Vendors in Sulaymaniyah | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في السليمانية | مواقع المتاجر", region: "Kurdistan Region",
    lat: 35.5550, lng: 45.4325,
    vendors: [
      { name_en: "Salim St Supermarket", name_ar: "سوبرماركت شارع سليم", lat: 35.5580, lng: 45.4350, type: "supermarket", phone: "07751223344", address_en: "Salim St, City Center", address_ar: "شارع سليم، وسط المدينة" },
      { name_en: "Azadi Bakery", name_ar: "مخبز آزادي", lat: 35.5500, lng: 45.4280, type: "bakery", phone: "07752233445", address_en: "Near Azadi Park", address_ar: "قرب حديقة آزادي" },
      { name_en: "Bazaar District Grocery", name_ar: "بقالة منطقة البازار", lat: 35.5600, lng: 45.4400, type: "grocery", phone: "07753334455", address_en: "Old Bazaar, Qaysari", address_ar: "البازار القديم، القيسارية" },
    ],
  },
  {
    slug: "kirkuk", name_en: "Kirkuk", name_ar: "كركوك",
    description_en: "Locate Al-Tabakh products in Kirkuk at vendors around the Citadel, Shorja, and industrial areas.",
    description_ar: "حدد موقع منتجات مالك الطباخ في كركوك لدى الباعة حول القلعة والشورجة والمناطق الصناعية.",
    seoTitle_en: "Al-Tabakh Vendors in Kirkuk | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في كركوك | مواقع المتاجر", region: "Northern Iraq",
    lat: 35.4681, lng: 44.3922,
    vendors: [
      { name_en: "Kirkuk Citadel Supermarket", name_ar: "سوبرماركت قلعة كركوك", lat: 35.4700, lng: 44.3950, type: "supermarket", phone: "07561223344", address_en: "Citadel Area, Old City", address_ar: "منطقة القلعة، المدينة القديمة" },
      { name_en: "Shorja Bakery Supplies", name_ar: "مستلزمات المخابز - الشورجة", lat: 35.4650, lng: 44.3880, type: "bakery", phone: "07562234455", address_en: "Shorja Market, Industrial St", address_ar: "سوق الشورجة، شارع الصناعة" },
    ],
  },
  {
    slug: "najaf", name_en: "Najaf", name_ar: "النجف",
    description_en: "Find Al-Tabakh food vendors in Najaf around the Holy Shrine area, Al-Adala, and the industrial quarter.",
    description_ar: "اعثر على باعة مالك الطباخ في النجف حول منطقة الحرم الشريف والعدالة والحي الصناعي.",
    seoTitle_en: "Al-Tabakh Vendors in Najaf | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في النجف | مواقع المتاجر", region: "Central Iraq",
    lat: 32.0000, lng: 44.3300,
    vendors: [
      { name_en: "Al-Adala Supermarket", name_ar: "سوبرماركت العدالة", lat: 32.0050, lng: 44.3350, type: "supermarket", phone: "07881223344", address_en: "Al-Adala District, Main St", address_ar: "العدالة، الشارع الرئيسي" },
      { name_en: "Shrine Area Confectionery", name_ar: "حلويات منطقة الحرم", lat: 31.9960, lng: 44.3250, type: "confectionery", phone: "07882234455", address_en: "Near Imam Ali Shrine", address_ar: "قرب مرقد الإمام علي" },
      { name_en: "Najaf Wholesale Foods", name_ar: "مواد غذائية بالجملة - النجف", lat: 32.0100, lng: 44.3400, type: "wholesale", phone: "07883234455", address_en: "Industrial Quarter", address_ar: "الحي الصناعي" },
    ],
  },
  {
    slug: "karbala", name_en: "Karbala", name_ar: "كربلاء",
    description_en: "Al-Tabakh products available in Karbala — vendors near the Holy Shrines, Al-Hussein District.",
    description_ar: "منتجات مالك الطباخ متاحة في كربلاء - الباعة قرب الحرمين الشريفين.",
    seoTitle_en: "Al-Tabakh Vendors in Karbala | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في كربلاء | مواقع المتاجر", region: "Central Iraq",
    lat: 32.6167, lng: 44.0333,
    vendors: [
      { name_en: "Al-Hussein Supermarket", name_ar: "سوبرماركت الحسين", lat: 32.6200, lng: 44.0380, type: "supermarket", phone: "07891223344", address_en: "Al-Hussein District, Bab Baghdad", address_ar: "منطقة الحسين، باب بغداد" },
      { name_en: "Hairat Bakery", name_ar: "مخبز الحائر", lat: 32.6120, lng: 44.0280, type: "bakery", phone: "07892234455", address_en: "Near Al-Abbas Shrine", address_ar: "قرب مرقد العباس" },
    ],
  },
  {
    slug: "hillah", name_en: "Hillah", name_ar: "الحلة",
    description_en: "Find Al-Tabakh vendors in Hillah — locations near the city center, Babylon ruins area.",
    description_ar: "اعثر على باعة مالك الطباخ في الحلة - مواقع قرب مركز المدينة ومنطقة آثار بابل.",
    seoTitle_en: "Al-Tabakh Vendors in Hillah | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في الحلة | مواقع المتاجر", region: "Central Iraq",
    lat: 32.4675, lng: 44.4333,
    vendors: [
      { name_en: "Hillah City Center Market", name_ar: "سوق مركز الحلة", lat: 32.4700, lng: 44.4380, type: "supermarket", phone: "07803223344", address_en: "City Center, Al-Kifah St", address_ar: "مركز المدينة، شارع الكفاح" },
      { name_en: "Babylon District Grocery", name_ar: "بقالة منطقة بابل", lat: 32.4600, lng: 44.4280, type: "grocery", phone: "07804234455", address_en: "Near Babylon Ruins", address_ar: "قرب آثار بابل" },
    ],
  },
  {
    slug: "diwaniyah", name_en: "Diwaniyah", name_ar: "الديوانية",
    description_en: "Al-Tabakh vendor map for Diwaniyah — shops and suppliers in the city center and Al-Muthanna district.",
    description_ar: "خريطة باعة مالك الطباخ في الديوانية - المتاجر والموردين في مركز المدينة.",
    seoTitle_en: "Al-Tabakh Vendors in Diwaniyah | Map",
    seoTitle_ar: "باعة مالك الطباخ في الديوانية | خريطة", region: "Southern Iraq",
    lat: 31.9890, lng: 44.9190,
    vendors: [
      { name_en: "Diwaniyah Supermarket", name_ar: "سوبرماركت الديوانية", lat: 31.9920, lng: 44.9220, type: "supermarket", phone: "07813223344", address_en: "City Center, Al-Karama St", address_ar: "مركز المدينة، شارع الكرامة" },
      { name_en: "Al-Muthanna Bakery", name_ar: "مخبز المثنى", lat: 31.9850, lng: 44.9150, type: "bakery", phone: "07814234455", address_en: "Al-Muthanna District", address_ar: "منطقة المثنى" },
    ],
  },
  {
    slug: "amarah", name_en: "Amarah", name_ar: "العمارة",
    description_en: "Locate Al-Tabakh food product vendors across Amarah — city center markets and the Maysan industrial area.",
    description_ar: "حدد موقع باعة منتجات مالك الطباخ الغذائية عبر العمارة.",
    seoTitle_en: "Al-Tabakh Vendors in Amarah | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في العمارة | مواقع المتاجر", region: "Southern Iraq",
    lat: 31.8333, lng: 47.1450,
    vendors: [
      { name_en: "Amarah Central Market", name_ar: "السوق المركزي - العمارة", lat: 31.8360, lng: 47.1480, type: "supermarket", phone: "07823223344", address_en: "City Center, Al-Jumhuriya St", address_ar: "مركز المدينة، شارع الجمهورية" },
      { name_en: "Maysan Wholesale", name_ar: "جملة ميسان", lat: 31.8280, lng: 47.1400, type: "wholesale", phone: "07824234455", address_en: "Industrial Area, Al-Maysan", address_ar: "المنطقة الصناعية، الميسان" },
    ],
  },
  {
    slug: "nasiriyah", name_en: "Nasiriyah", name_ar: "الناصرية",
    description_en: "Find Al-Tabakh products in Nasiriyah — vendors near the Euphrates, Al-Haboubi district.",
    description_ar: "اعثر على منتجات مالك الطباخ في الناصرية.",
    seoTitle_en: "Al-Tabakh Vendors in Nasiriyah | Map",
    seoTitle_ar: "باعة مالك الطباخ في الناصرية | خريطة", region: "Southern Iraq",
    lat: 31.0450, lng: 46.2650,
    vendors: [
      { name_en: "Nasiriyah Supermarket", name_ar: "سوبرماركت الناصرية", lat: 31.0480, lng: 46.2680, type: "supermarket", phone: "07833223344", address_en: "Al-Haboubi, Main Market", address_ar: "الحبوبي، السوق الرئيسي" },
      { name_en: "Euphrates Bakery", name_ar: "مخبز الفرات", lat: 31.0400, lng: 46.2600, type: "bakery", phone: "07834234455", address_en: "Euphrates Corniche", address_ar: "كورنيش الفرات" },
    ],
  },
  {
    slug: "samawah", name_en: "Samawah", name_ar: "السماوة",
    description_en: "Al-Tabakh vendor locations in Samawah — city center and Al-Muthanna province commercial areas.",
    description_ar: "مواقع باعة مالك الطباخ في السماوة.",
    seoTitle_en: "Al-Tabakh Vendors in Samawah | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في السماوة | مواقع المتاجر", region: "Southern Iraq",
    lat: 31.3110, lng: 45.2830,
    vendors: [
      { name_en: "Samawah Central Grocery", name_ar: "البقالة المركزية - السماوة", lat: 31.3140, lng: 45.2860, type: "grocery", phone: "07843223344", address_en: "City Center, Al-Karama St", address_ar: "مركز المدينة، شارع الكرامة" },
    ],
  },
  {
    slug: "ramadi", name_en: "Ramadi", name_ar: "الرمادي",
    description_en: "Locate Al-Tabakh food vendors in Ramadi — locations along the Euphrates and central commercial district.",
    description_ar: "حدد موقع باعة مالك الطباخ في الرمادي.",
    seoTitle_en: "Al-Tabakh Vendors in Ramadi | Map",
    seoTitle_ar: "باعة مالك الطباخ في الرمادي | خريطة", region: "Western Iraq",
    lat: 33.4280, lng: 43.3150,
    vendors: [
      { name_en: "Ramadi Supermarket", name_ar: "سوبرماركت الرمادي", lat: 33.4310, lng: 43.3180, type: "supermarket", phone: "07853223344", address_en: "City Center, Al-Anbar St", address_ar: "مركز المدينة، شارع الأنبار" },
      { name_en: "Euphrates Grocery", name_ar: "بقالة الفرات", lat: 33.4240, lng: 43.3100, type: "grocery", phone: "07854234455", address_en: "Near Euphrates", address_ar: "قرب الفرات" },
    ],
  },
  {
    slug: "tikrit", name_en: "Tikrit", name_ar: "تكريت",
    description_en: "Find Al-Tabakh products in Tikrit — vendors in the city center and Salah Ad Din commercial district.",
    description_ar: "اعثر على منتجات مالك الطباخ في تكريت.",
    seoTitle_en: "Al-Tabakh Vendors in Tikrit | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في تكريت | مواقع المتاجر", region: "Northern Iraq",
    lat: 34.5950, lng: 43.6850,
    vendors: [
      { name_en: "Tikrit City Market", name_ar: "سوق مدينة تكريت", lat: 34.5980, lng: 43.6880, type: "supermarket", phone: "07863223344", address_en: "City Center, Main Square", address_ar: "مركز المدينة، الساحة الرئيسية" },
    ],
  },
  {
    slug: "duhok", name_en: "Duhok", name_ar: "دهوك",
    description_en: "Al-Tabakh vendors in Duhok — locations in the city center, Zakho Road, and Sumel district.",
    description_ar: "باعة مالك الطباخ في دهوك - مواقع في مركز المدينة وطريق زاخو.",
    seoTitle_en: "Al-Tabakh Vendors in Duhok | Store Locations",
    seoTitle_ar: "باعة مالك الطباخ في دهوك | مواقع المتاجر", region: "Kurdistan Region",
    lat: 36.8667, lng: 43.0000,
    vendors: [
      { name_en: "Duhok Supermarket", name_ar: "سوبرماركت دهوك", lat: 36.8700, lng: 43.0030, type: "supermarket", phone: "07573223344", address_en: "City Center, Delal Bridge", address_ar: "مركز المدينة، جسر دلال" },
      { name_en: "Zakho Rd Wholesale", name_ar: "الجملة - طريق زاخو", lat: 36.8780, lng: 43.0100, type: "wholesale", phone: "07574234455", address_en: "Zakho Road, Industrial Zone", address_ar: "طريق زاخو، المنطقة الصناعية" },
    ],
  },
  {
    slug: "kut", name_en: "Kut", name_ar: "الكوت",
    description_en: "Find Al-Tabakh products in Kut — vendors in the city center and along the Tigris riverbank.",
    description_ar: "اعثر على منتجات مالك الطباخ في الكوت.",
    seoTitle_en: "Al-Tabakh Vendors in Kut | Map",
    seoTitle_ar: "باعة مالك الطباخ في الكوت | خريطة", region: "Central Iraq",
    lat: 32.4975, lng: 45.8180,
    vendors: [
      { name_en: "Kut Central Market", name_ar: "السوق المركزي - الكوت", lat: 32.5000, lng: 45.8210, type: "supermarket", phone: "07883223344", address_en: "City Center, Al-Jumhuriya St", address_ar: "مركز المدينة، شارع الجمهورية" },
      { name_en: "Tigris Bakery", name_ar: "مخبز دجلة", lat: 32.4940, lng: 45.8150, type: "bakery", phone: "07884234455", address_en: "Tigris Corniche", address_ar: "كورنيش دجلة" },
    ],
  },
]

export const COUNTRIES: LocationCountry[] = [
  {
    slug: "iraq",
    name_en: "Iraq",
    name_ar: "العراق",
    cities: IRAQ_CITIES,
  },
]

export const CITIES: CityInfo[] = IRAQ_CITIES

export function getCityBySlug(slug: string): CityInfo | undefined {
  return IRAQ_CITIES.find(c => c.slug === slug)
}
