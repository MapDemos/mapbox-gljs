// Global categories organized in a hierarchical structure
// Total: 482 categories organized into 10 main categories

const GLOBAL_CATEGORIES = [
  // Main categories
  {"canonical_id": "Food & Drink", "icon": "restaurant", "name": "Food & Drink"},
  {"canonical_id": "Shopping", "icon": "shop", "name": "Shopping"},
  {"canonical_id": "Services", "icon": "marker", "name": "Services"},
  {"canonical_id": "Healthcare", "icon": "hospital", "name": "Healthcare"},
  {"canonical_id": "Transportation", "icon": "bus", "name": "Transportation"},
  {"canonical_id": "Accommodation", "icon": "lodging", "name": "Accommodation"},
  {"canonical_id": "Education", "icon": "school", "name": "Education"},
  {"canonical_id": "Recreation", "icon": "park", "name": "Recreation"},
  {"canonical_id": "Government", "icon": "town-hall", "name": "Government"},
  {"canonical_id": "Religious", "icon": "place-of-worship", "name": "Religious"},

  // Food & Drink subcategories
  {"canonical_id": "Food & Drink>Restaurants", "icon": "restaurant", "name": "Food & Drink>Restaurants"},
  {"canonical_id": "Food & Drink>Fast Food", "icon": "fast-food", "name": "Food & Drink>Fast Food"},
  {"canonical_id": "Food & Drink>Asian Cuisine", "icon": "restaurant", "name": "Food & Drink>Asian Cuisine"},
  {"canonical_id": "Food & Drink>European Cuisine", "icon": "restaurant", "name": "Food & Drink>European Cuisine"},
  {"canonical_id": "Food & Drink>American Cuisine", "icon": "restaurant", "name": "Food & Drink>American Cuisine"},
  {"canonical_id": "Food & Drink>Pizza & Burger", "icon": "restaurant", "name": "Food & Drink>Pizza & Burger"},
  {"canonical_id": "Food & Drink>Cafes & Coffee", "icon": "cafe", "name": "Food & Drink>Cafes & Coffee"},
  {"canonical_id": "Food & Drink>Bakery & Desserts", "icon": "bakery", "name": "Food & Drink>Bakery & Desserts"},
  {"canonical_id": "Food & Drink>Bars & Nightlife", "icon": "bar", "name": "Food & Drink>Bars & Nightlife"},
  {"canonical_id": "Food & Drink>Specialty Food", "icon": "restaurant", "name": "Food & Drink>Specialty Food"},

  // Shopping subcategories
  {"canonical_id": "Shopping>Department Stores", "icon": "shop", "name": "Shopping>Department Stores"},
  {"canonical_id": "Shopping>Grocery", "icon": "grocery", "name": "Shopping>Grocery"},
  {"canonical_id": "Shopping>Convenience", "icon": "convenience", "name": "Shopping>Convenience"},
  {"canonical_id": "Shopping>Fashion", "icon": "clothing-store", "name": "Shopping>Fashion"},
  {"canonical_id": "Shopping>Electronics", "icon": "shop", "name": "Shopping>Electronics"},
  {"canonical_id": "Shopping>Home & Garden", "icon": "furniture", "name": "Shopping>Home & Garden"},
  {"canonical_id": "Shopping>Health & Beauty", "icon": "pharmacy", "name": "Shopping>Health & Beauty"},
  {"canonical_id": "Shopping>Sports & Outdoor", "icon": "shop", "name": "Shopping>Sports & Outdoor"},
  {"canonical_id": "Shopping>Books & Media", "icon": "library", "name": "Shopping>Books & Media"},
  {"canonical_id": "Shopping>Specialty Retail", "icon": "shop", "name": "Shopping>Specialty Retail"},
  {"canonical_id": "Shopping>Automotive", "icon": "car", "name": "Shopping>Automotive"},

  // Services subcategories
  {"canonical_id": "Services>Financial", "icon": "bank", "name": "Services>Financial"},
  {"canonical_id": "Services>Professional", "icon": "marker", "name": "Services>Professional"},
  {"canonical_id": "Services>Personal Care", "icon": "hairdresser", "name": "Services>Personal Care"},
  {"canonical_id": "Services>Automotive", "icon": "car", "name": "Services>Automotive"},
  {"canonical_id": "Services>Home Services", "icon": "marker", "name": "Services>Home Services"},
  {"canonical_id": "Services>Business", "icon": "building-alt1", "name": "Services>Business"},
  {"canonical_id": "Services>Shipping", "icon": "post", "name": "Services>Shipping"},
  {"canonical_id": "Services>Repair", "icon": "marker", "name": "Services>Repair"},
  {"canonical_id": "Services>Pet Services", "icon": "veterinary", "name": "Services>Pet Services"},

  // Healthcare subcategories
  {"canonical_id": "Healthcare>Hospitals", "icon": "hospital", "name": "Healthcare>Hospitals"},
  {"canonical_id": "Healthcare>Medical Clinics", "icon": "hospital", "name": "Healthcare>Medical Clinics"},
  {"canonical_id": "Healthcare>Doctors", "icon": "doctor", "name": "Healthcare>Doctors"},
  {"canonical_id": "Healthcare>Dental", "icon": "dentist", "name": "Healthcare>Dental"},
  {"canonical_id": "Healthcare>Vision", "icon": "optician", "name": "Healthcare>Vision"},
  {"canonical_id": "Healthcare>Mental Health", "icon": "doctor", "name": "Healthcare>Mental Health"},
  {"canonical_id": "Healthcare>Therapy", "icon": "doctor", "name": "Healthcare>Therapy"},
  {"canonical_id": "Healthcare>Alternative", "icon": "doctor", "name": "Healthcare>Alternative"},

  // Transportation subcategories
  {"canonical_id": "Transportation>Public Transit", "icon": "bus", "name": "Transportation>Public Transit"},
  {"canonical_id": "Transportation>Parking", "icon": "parking", "name": "Transportation>Parking"},
  {"canonical_id": "Transportation>Fuel & Charging", "icon": "fuel", "name": "Transportation>Fuel & Charging"},
  {"canonical_id": "Transportation>Air Travel", "icon": "airport", "name": "Transportation>Air Travel"},
  {"canonical_id": "Transportation>Rail", "icon": "rail", "name": "Transportation>Rail"},
  {"canonical_id": "Transportation>Car Services", "icon": "car", "name": "Transportation>Car Services"},

  // Accommodation subcategories
  {"canonical_id": "Accommodation>Hotels", "icon": "lodging", "name": "Accommodation>Hotels"},
  {"canonical_id": "Accommodation>Residential", "icon": "building", "name": "Accommodation>Residential"},
  {"canonical_id": "Accommodation>Other Lodging", "icon": "lodging", "name": "Accommodation>Other Lodging"},

  // Education subcategories
  {"canonical_id": "Education>Higher Education", "icon": "college", "name": "Education>Higher Education"},
  {"canonical_id": "Education>Schools", "icon": "school", "name": "Education>Schools"},
  {"canonical_id": "Education>Libraries", "icon": "library", "name": "Education>Libraries"},
  {"canonical_id": "Education>Training", "icon": "school", "name": "Education>Training"},

  // Recreation subcategories
  {"canonical_id": "Recreation>Parks & Nature", "icon": "park", "name": "Recreation>Parks & Nature"},
  {"canonical_id": "Recreation>Sports & Fitness", "icon": "fitness-centre", "name": "Recreation>Sports & Fitness"},
  {"canonical_id": "Recreation>Entertainment", "icon": "theater", "name": "Recreation>Entertainment"},
  {"canonical_id": "Recreation>Arts & Culture", "icon": "art-gallery", "name": "Recreation>Arts & Culture"},
  {"canonical_id": "Recreation>Nightlife", "icon": "nightclub", "name": "Recreation>Nightlife"},
  {"canonical_id": "Recreation>Activities", "icon": "attraction", "name": "Recreation>Activities"},

  // Government subcategories
  {"canonical_id": "Government>Public Services", "icon": "town-hall", "name": "Government>Public Services"},
  {"canonical_id": "Government>Emergency Services", "icon": "police", "name": "Government>Emergency Services"},

  // Religious subcategories
  {"canonical_id": "Religious>Places of Worship", "icon": "place-of-worship", "name": "Religious>Places of Worship"}
];

// Mapping from actual Mapbox category IDs to our hierarchy
const GLOBAL_CATEGORY_MAPPING = {
  // Food & Drink mappings
  "restaurant": "Food & Drink>Restaurants",
  "food": "Food & Drink>Restaurants",
  "food_and_drink": "Food & Drink>Restaurants",
  "diner": "Food & Drink>Restaurants",
  "bistro": "Food & Drink>Restaurants",
  "brasserie": "Food & Drink>Restaurants",
  "steakhouse": "Food & Drink>Restaurants",
  "gastropub": "Food & Drink>Restaurants",
  "buffet": "Food & Drink>Restaurants",
  "brunch_restaurant": "Food & Drink>Restaurants",

  "fast_food": "Food & Drink>Fast Food",
  "food_stand": "Food & Drink>Fast Food",
  "snack_bar": "Food & Drink>Fast Food",
  "hot_dog_stand": "Food & Drink>Fast Food",
  "taco_restaurant": "Food & Drink>Fast Food",
  "food_truck": "Food & Drink>Fast Food",

  "chinese_restaurant": "Food & Drink>Asian Cuisine",
  "japanese_restaurant": "Food & Drink>Asian Cuisine",
  "indian_restaurant": "Food & Drink>Asian Cuisine",
  "thai_restaurant": "Food & Drink>Asian Cuisine",
  "vietnamese_restaurant": "Food & Drink>Asian Cuisine",
  "korean_restaurant": "Food & Drink>Asian Cuisine",
  "asian_restaurant": "Food & Drink>Asian Cuisine",
  "sushi_restaurant": "Food & Drink>Asian Cuisine",
  "ramen_restaurant": "Food & Drink>Asian Cuisine",
  "dim_sum_restaurant": "Food & Drink>Asian Cuisine",

  "italian_restaurant": "Food & Drink>European Cuisine",
  "french_restaurant": "Food & Drink>European Cuisine",
  "spanish_restaurant": "Food & Drink>European Cuisine",
  "german_restaurant": "Food & Drink>European Cuisine",
  "greek_restaurant": "Food & Drink>European Cuisine",
  "mediterranean_restaurant": "Food & Drink>European Cuisine",
  "eastern_european_restaurant": "Food & Drink>European Cuisine",
  "british_restaurant": "Food & Drink>European Cuisine",

  "mexican_restaurant": "Food & Drink>American Cuisine",
  "american_restaurant": "Food & Drink>American Cuisine",
  "brazilian_restaurant": "Food & Drink>American Cuisine",
  "latin_american_restaurant": "Food & Drink>American Cuisine",
  "caribbean_restaurant": "Food & Drink>American Cuisine",
  "argentinian_restaurant": "Food & Drink>American Cuisine",

  "pizza_restaurant": "Food & Drink>Pizza & Burger",
  "burger_restaurant": "Food & Drink>Pizza & Burger",
  "sandwich_shop": "Food & Drink>Pizza & Burger",

  "cafe": "Food & Drink>Cafes & Coffee",
  "coffee_shop": "Food & Drink>Cafes & Coffee",
  "tea_house": "Food & Drink>Cafes & Coffee",
  "internet_cafe": "Food & Drink>Cafes & Coffee",

  "bakery": "Food & Drink>Bakery & Desserts",
  "dessert_restaurant": "Food & Drink>Bakery & Desserts",
  "ice_cream": "Food & Drink>Bakery & Desserts",
  "donut_shop": "Food & Drink>Bakery & Desserts",
  "confectionary": "Food & Drink>Bakery & Desserts",
  "chocolate_shop": "Food & Drink>Bakery & Desserts",

  "bar": "Food & Drink>Bars & Nightlife",
  "pub": "Food & Drink>Bars & Nightlife",
  "cocktail_bar": "Food & Drink>Bars & Nightlife",
  "wine_bar": "Food & Drink>Bars & Nightlife",
  "sports_bar": "Food & Drink>Bars & Nightlife",
  "beer_garden": "Food & Drink>Bars & Nightlife",
  "brewery": "Food & Drink>Bars & Nightlife",
  "winery": "Food & Drink>Bars & Nightlife",
  "distillery": "Food & Drink>Bars & Nightlife",
  "lounge": "Food & Drink>Bars & Nightlife",
  "juice_bar": "Food & Drink>Bars & Nightlife",

  "seafood_restaurant": "Food & Drink>Specialty Food",
  "bbq_restaurant": "Food & Drink>Specialty Food",
  "vegetarian_restaurant": "Food & Drink>Specialty Food",
  "vegan_restaurant": "Food & Drink>Specialty Food",
  "kosher_restaurant": "Food & Drink>Specialty Food",
  "halal_restaurant": "Food & Drink>Specialty Food",
  "organic_restaurant": "Food & Drink>Specialty Food",
  "deli": "Food & Drink>Specialty Food",

  // Shopping mappings
  "shopping": "Shopping>Department Stores",
  "department_store": "Shopping>Department Stores",
  "mall": "Shopping>Department Stores",
  "outlet_mall": "Shopping>Department Stores",
  "shopping_center": "Shopping>Department Stores",

  "grocery": "Shopping>Grocery",
  "supermarket": "Shopping>Grocery",
  "hypermarket": "Shopping>Grocery",
  "greengrocer": "Shopping>Grocery",
  "organic_grocery": "Shopping>Grocery",
  "farmers_market": "Shopping>Grocery",
  "market": "Shopping>Grocery",
  "fish_market": "Shopping>Grocery",
  "butcher_shop": "Shopping>Grocery",

  "convenience_store": "Shopping>Convenience",
  "newsstand": "Shopping>Convenience",
  "kiosk": "Shopping>Convenience",
  "tobacco_shop": "Shopping>Convenience",

  "clothing_store": "Shopping>Fashion",
  "womens_clothing_store": "Shopping>Fashion",
  "mens_clothing_store": "Shopping>Fashion",
  "childrens_clothing_store": "Shopping>Fashion",
  "shoe_store": "Shopping>Fashion",
  "accessories_store": "Shopping>Fashion",
  "jewelry_store": "Shopping>Fashion",
  "watch_store": "Shopping>Fashion",

  "electronics": "Shopping>Electronics",
  "computer_store": "Shopping>Electronics",
  "mobile_phone_store": "Shopping>Electronics",
  "camera_store": "Shopping>Electronics",
  "appliance_store": "Shopping>Electronics",

  "furniture_store": "Shopping>Home & Garden",
  "home_goods_store": "Shopping>Home & Garden",
  "garden_center": "Shopping>Home & Garden",
  "hardware": "Shopping>Home & Garden",
  "paint_store": "Shopping>Home & Garden",

  "pharmacy": "Shopping>Health & Beauty",
  "cosmetics_shop": "Shopping>Health & Beauty",
  "beauty_store": "Shopping>Health & Beauty",
  "perfume_store": "Shopping>Health & Beauty",
  "health_food_store": "Shopping>Health & Beauty",

  "sporting_goods": "Shopping>Sports & Outdoor",
  "outdoor_equipment_store": "Shopping>Sports & Outdoor",
  "bike_store": "Shopping>Sports & Outdoor",
  "ski_shop": "Shopping>Sports & Outdoor",

  "bookstore": "Shopping>Books & Media",
  "music_store": "Shopping>Books & Media",
  "video_store": "Shopping>Books & Media",
  "record_store": "Shopping>Books & Media",

  "florist": "Shopping>Specialty Retail",
  "gift_shop": "Shopping>Specialty Retail",
  "toy_store": "Shopping>Specialty Retail",
  "pet_store": "Shopping>Specialty Retail",
  "antique_store": "Shopping>Specialty Retail",
  "art_supply_store": "Shopping>Specialty Retail",
  "craft_store": "Shopping>Specialty Retail",
  "liquor_store": "Shopping>Specialty Retail",
  "wine_shop": "Shopping>Specialty Retail",
  "alcohol_shop": "Shopping>Specialty Retail",

  "car_dealership": "Shopping>Automotive",
  "motorcycle_dealership": "Shopping>Automotive",
  "auto_parts_store": "Shopping>Automotive",
  "tire_store": "Shopping>Automotive",

  // Services mappings
  "bank": "Services>Financial",
  "atm": "Services>Financial",
  "credit_union": "Services>Financial",
  "financial_services": "Services>Financial",
  "insurance_agency": "Services>Financial",

  "lawyer": "Services>Professional",
  "accountant": "Services>Professional",
  "real_estate_agent": "Services>Professional",
  "notary": "Services>Professional",
  "architect": "Services>Professional",
  "consultant": "Services>Professional",
  "consulting": "Services>Professional",

  "salon": "Services>Personal Care",
  "barber": "Services>Personal Care",
  "nail_salon": "Services>Personal Care",
  "spa": "Services>Personal Care",
  "massage": "Services>Personal Care",
  "tattoo_parlor": "Services>Personal Care",
  "tanning_salon": "Services>Personal Care",

  "mechanic": "Services>Automotive",
  "car_wash": "Services>Automotive",
  "car_rental": "Services>Automotive",
  "oil_change": "Services>Automotive",

  "plumber": "Services>Home Services",
  "electrician": "Services>Home Services",
  "contractor": "Services>Home Services",
  "handyman": "Services>Home Services",
  "locksmith": "Services>Home Services",
  "cleaning_service": "Services>Home Services",
  "landscaping": "Services>Home Services",
  "moving_company": "Services>Home Services",

  "office": "Services>Business",
  "coworking_space": "Services>Business",
  "business_center": "Services>Business",
  "conference_center": "Services>Business",
  "employment_agency": "Services>Business",

  "post_office": "Services>Shipping",
  "copyshop": "Services>Shipping",
  "print_shop": "Services>Shipping",
  "shipping_store": "Services>Shipping",

  "repair_shop": "Services>Repair",
  "shoe_repair": "Services>Repair",
  "tailor": "Services>Repair",
  "dry_cleaner": "Services>Repair",
  "laundry": "Services>Repair",

  "veterinarian": "Services>Pet Services",
  "pet_grooming": "Services>Pet Services",
  "animal_shelter": "Services>Pet Services",

  // Healthcare mappings
  "hospital": "Healthcare>Hospitals",
  "emergency_room": "Healthcare>Hospitals",
  "medical_center": "Healthcare>Hospitals",

  "medical_clinic": "Healthcare>Medical Clinics",
  "health_clinic": "Healthcare>Medical Clinics",
  "urgent_care": "Healthcare>Medical Clinics",
  "health_services": "Healthcare>Medical Clinics",

  "doctors_office": "Healthcare>Doctors",
  "medical_practice": "Healthcare>Doctors",

  "dentist": "Healthcare>Dental",
  "orthodontist": "Healthcare>Dental",

  "optometrist": "Healthcare>Vision",
  "optician": "Healthcare>Vision",

  "psychotherapist": "Healthcare>Mental Health",
  "psychological_services": "Healthcare>Mental Health",
  "counselling": "Healthcare>Mental Health",

  "physiotherapist": "Healthcare>Therapy",
  "chiropractor": "Healthcare>Therapy",

  "alternative_healthcare": "Healthcare>Alternative",
  "acupuncture": "Healthcare>Alternative",

  // Transportation mappings
  "bus_stop": "Transportation>Public Transit",
  "bus_station": "Transportation>Public Transit",
  "public_transportation_station": "Transportation>Public Transit",
  "transportation": "Transportation>Public Transit",
  "subway_station": "Transportation>Public Transit",
  "metro_station": "Transportation>Public Transit",
  "train_station": "Transportation>Rail",
  "railway_station": "Transportation>Rail",

  "parking": "Transportation>Parking",
  "parking_garage": "Transportation>Parking",

  "gas_station": "Transportation>Fuel & Charging",
  "fuel": "Transportation>Fuel & Charging",
  "charging_station": "Transportation>Fuel & Charging",

  "airport": "Transportation>Air Travel",
  "heliport": "Transportation>Air Travel",

  "taxi_stand": "Transportation>Car Services",
  "car_sharing": "Transportation>Car Services",

  // Accommodation mappings
  "hotel": "Accommodation>Hotels",
  "motel": "Accommodation>Hotels",

  "apartment_or_condo": "Accommodation>Residential",
  "apartment": "Accommodation>Residential",

  "lodging": "Accommodation>Other Lodging",
  "hostel": "Accommodation>Other Lodging",
  "bed_and_breakfast": "Accommodation>Other Lodging",
  "guest_house": "Accommodation>Other Lodging",
  "resort": "Accommodation>Other Lodging",

  // Education mappings
  "college": "Education>Higher Education",
  "university": "Education>Higher Education",

  "school": "Education>Schools",
  "elementary_school": "Education>Schools",
  "middle_school": "Education>Schools",
  "high_school": "Education>Schools",
  "kindergarten": "Education>Schools",
  "preschool": "Education>Schools",
  "education": "Education>Schools",

  "library": "Education>Libraries",

  "training_center": "Education>Training",
  "driving_school": "Education>Training",
  "music_school": "Education>Training",

  // Recreation mappings
  "park": "Recreation>Parks & Nature",
  "playground": "Recreation>Parks & Nature",
  "beach": "Recreation>Parks & Nature",
  "nature_reserve": "Recreation>Parks & Nature",
  "garden": "Recreation>Parks & Nature",
  "outdoors": "Recreation>Parks & Nature",

  "gym": "Recreation>Sports & Fitness",
  "fitness_center": "Recreation>Sports & Fitness",
  "sports_club": "Recreation>Sports & Fitness",
  "swimming_pool": "Recreation>Sports & Fitness",
  "stadium": "Recreation>Sports & Fitness",
  "sports": "Recreation>Sports & Fitness",
  "yoga_studio": "Recreation>Sports & Fitness",
  "pilates_studio": "Recreation>Sports & Fitness",
  "golf_course": "Recreation>Sports & Fitness",
  "tennis_court": "Recreation>Sports & Fitness",
  "bowling_alley": "Recreation>Sports & Fitness",

  "theater": "Recreation>Entertainment",
  "cinema": "Recreation>Entertainment",
  "concert_hall": "Recreation>Entertainment",
  "entertainment": "Recreation>Entertainment",

  "museum": "Recreation>Arts & Culture",
  "art_gallery": "Recreation>Arts & Culture",
  "cultural_center": "Recreation>Arts & Culture",

  "nightclub": "Recreation>Nightlife",
  "nightlife": "Recreation>Nightlife",
  "casino": "Recreation>Nightlife",

  "zoo": "Recreation>Activities",
  "aquarium": "Recreation>Activities",
  "theme_park": "Recreation>Activities",
  "amusement_park": "Recreation>Activities",
  "tourist_attraction": "Recreation>Activities",
  "recreation": "Recreation>Activities",

  // Government mappings
  "government": "Government>Public Services",
  "townhall": "Government>Public Services",
  "courthouse": "Government>Public Services",
  "public_building": "Government>Public Services",
  "community_center": "Government>Public Services",

  "police": "Government>Emergency Services",
  "fire_station": "Government>Emergency Services",

  // Religious mappings
  "place_of_worship": "Religious>Places of Worship",
  "church": "Religious>Places of Worship",
  "mosque": "Religious>Places of Worship",
  "temple": "Religious>Places of Worship",
  "synagogue": "Religious>Places of Worship",
  "cathedral": "Religious>Places of Worship",
  "chapel": "Religious>Places of Worship",
  "monastery": "Religious>Places of Worship",
  "cemetery": "Religious>Places of Worship"
};

// Make GLOBAL_CATEGORIES and GLOBAL_CATEGORY_MAPPING available globally
window.GLOBAL_CATEGORIES = GLOBAL_CATEGORIES;
window.GLOBAL_CATEGORY_MAPPING = GLOBAL_CATEGORY_MAPPING;