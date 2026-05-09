// Cost of Living Index by Country (relative to USA = 100)
// Updated for 2026 - includes accommodation, food, transport, activities
export const COST_OF_LIVING_INDEX = {
  // Asia
  'India': 35,
  'Thailand': 45,
  'Vietnam': 40,
  'Cambodia': 38,
  'Philippines': 42,
  'Indonesia': 48,
  'Malaysia': 55,
  'Japan': 85,
  'South Korea': 75,
  'Taiwan': 65,
  'China': 50,
  'Mongolia': 45,
  'Laos': 42,
  'Bangladesh': 32,
  'Pakistan': 38,
  'Sri Lanka': 40,
  'Nepal': 33,
  'Bhutan': 50,

  // Southeast Asia
  'Myanmar': 42,
  'Singapore': 95,
  'Hong Kong': 105,
  'Macao': 100,

  // South Asia
  'Afghanistan': 35,

  // Middle East
  'United Arab Emirates': 92,
  'Saudi Arabia': 85,
  'Qatar': 110,
  'Bahrain': 88,
  'Kuwait': 95,
  'Lebanon': 50,
  'Jordan': 60,
  'Israel': 95,
  'Turkey': 58,
  'Iran': 48,

  // Europe
  'Albania': 45,
  'Bosnia and Herzegovina': 50,
  'Bulgaria': 52,
  'Croatia': 65,
  'Czech Republic': 70,
  'Greece': 68,
  'Hungary': 60,
  'Latvia': 65,
  'Lithuania': 62,
  'Poland': 62,
  'Romania': 55,
  'Serbia': 50,
  'Slovakia': 65,
  'Slovenia': 75,
  'Belarus': 48,
  'Ukraine': 42,
  'Moldova': 45,
  'Russia': 65,

  // Western Europe
  'Austria': 88,
  'Belgium': 85,
  'France': 82,
  'Germany': 85,
  'Ireland': 90,
  'Netherlands': 88,
  'Switzerland': 128,
  'Sweden': 95,
  'Norway': 112,
  'Denmark': 100,
  'Finland': 92,
  'United Kingdom': 88,
  'Portugal': 72,
  'Spain': 75,
  'Italy': 78,

  // Americas - North
  'Canada': 95,
  'United States': 100,
  'Mexico': 62,

  // Americas - Central
  'Belize': 68,
  'Costa Rica': 72,
  'El Salvador': 55,
  'Guatemala': 48,
  'Honduras': 50,
  'Nicaragua': 48,
  'Panama': 70,

  // Americas - South
  'Argentina': 55,
  'Bolivia': 42,
  'Brazil': 58,
  'Chile': 75,
  'Colombia': 52,
  'Ecuador': 50,
  'Guyana': 60,
  'Paraguay': 48,
  'Peru': 50,
  'Suriname': 65,
  'Uruguay': 78,
  'Venezuela': 40,

  // Caribbean
  'Bahamas': 95,
  'Barbados': 85,
  'Cuba': 50,
  'Dominican Republic': 60,
  'Haiti': 45,
  'Jamaica': 65,
  'Puerto Rico': 90,
  'Trinidad and Tobago': 75,

  // Africa - North
  'Algeria': 50,
  'Egypt': 42,
  'Libya': 55,
  'Morocco': 50,
  'Tunisia': 48,

  // Africa - West
  'Benin': 48,
  'Burkina Faso': 42,
  'Cape Verde': 68,
  'Côte d\'Ivoire': 48,
  'Gambia': 45,
  'Ghana': 48,
  'Guinea': 42,
  'Guinea-Bissau': 40,
  'Liberia': 45,
  'Mali': 40,
  'Mauritania': 45,
  'Niger': 40,
  'Nigeria': 50,
  'Senegal': 48,
  'Sierra Leone': 42,
  'Togo': 45,

  // Africa - Central
  'Cameroon': 45,
  'Central African Republic': 40,
  'Chad': 42,
  'Republic of the Congo': 48,
  'Democratic Republic of the Congo': 40,
  'Equatorial Guinea': 60,
  'Gabon': 62,
  'São Tomé and Príncipe': 55,

  // Africa - East
  'Burundi': 38,
  'Comoros': 50,
  'Djibouti': 65,
  'Eritrea': 45,
  'Ethiopia': 38,
  'Kenya': 48,
  'Madagascar': 42,
  'Malawi': 40,
  'Mauritius': 72,
  'Mozambique': 40,
  'Rwanda': 42,
  'Seychelles': 95,
  'Somalia': 42,
  'South Sudan': 45,
  'Sudan': 45,
  'Tanzania': 42,
  'Uganda': 40,
  'Zambia': 42,
  'Zimbabwe': 45,

  // Africa - South
  'Angola': 55,
  'Botswana': 62,
  'Eswatini': 50,
  'Lesotho': 45,
  'Namibia': 60,
  'South Africa': 65,

  // Oceania
  'Australia': 105,
  'Fiji': 70,
  'Kiribati': 80,
  'Marshall Islands': 85,
  'Micronesia': 85,
  'Nauru': 90,
  'New Zealand': 105,
  'Palau': 95,
  'Papua New Guinea': 65,
  'Samoa': 80,
  'Solomon Islands': 75,
  'Tonga': 80,
  'Tuvalu': 85,
  'Vanuatu': 75,
};

// Daily cost estimates (per person) for different budget levels in USD
export const BASE_DAILY_COSTS = {
  budget: 50,      // Hostels, street food, public transport
  'mid-range': 100, // Mid-range hotels, casual dining, local tours
  luxury: 200,      // 4-5 star hotels, fine dining, premium experiences
};

export function getCountryCostIndex(country) {
  return COST_OF_LIVING_INDEX[country] || 65; // Default to 65 if country not found
}

export function calculateAdjustedDailyCost(country, budgetLevel) {
  const costIndex = getCountryCostIndex(country);
  const baseCost = BASE_DAILY_COSTS[budgetLevel] || BASE_DAILY_COSTS['mid-range'];
  const adjustedCost = (baseCost * costIndex) / 100;
  return Math.round(adjustedCost);
}

export function calculateTripCost(country, duration, budgetLevel) {
  const dailyCost = calculateAdjustedDailyCost(country, budgetLevel);
  return dailyCost * duration;
}

export function calculatePriceRange(country, duration, budgetLevel) {
  const dailyCost = calculateAdjustedDailyCost(country, budgetLevel);
  
  // Add 15% buffer for contingencies
  const minDailyCost = Math.round(dailyCost * 0.85);
  const maxDailyCost = Math.round(dailyCost * 1.15);
  
  const minPrice = minDailyCost * duration;
  const maxPrice = maxDailyCost * duration;
  
  return {
    minPrice,
    maxPrice,
    average: Math.round((minPrice + maxPrice) / 2),
    dailyMin: minDailyCost,
    dailyMax: maxDailyCost,
    dailyAverage: dailyCost,
  };
}
