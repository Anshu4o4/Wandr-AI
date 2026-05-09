import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { calculatePriceRange } from '../data/costOfLivingIndex.js';

dotenv.config();

let groq = null;

const getGroqClient = () => {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
};

// Helper function to extract country name from destination string
// e.g., "Barot, Himachal Pradesh, India" -> "India"
const extractCountry = (destination) => {
  const parts = destination.split(',').map(p => p.trim());
  return parts[parts.length - 1] || destination;
};

// Calculate realistic estimated cost based on destination and parameters
const calculateEstimatedCost = (destination, days, budget, groupSize = 1) => {
  try {
    const country = extractCountry(destination);
    const priceData = calculatePriceRange(country, days, budget);
    const totalPerPerson = priceData.averagePrice;
    const totalForGroup = totalPerPerson * groupSize;
    return `$${priceData.minPrice * groupSize} - $${priceData.maxPrice * groupSize}`;
  } catch (error) {
    console.error('Error calculating cost:', error);
    // Fallback to default ranges
    return budget === 'luxury' ? '$2,500 - $4,000' : budget === 'mid-range' ? '$1,200 - $2,000' : '$600 - $1,000';
  }
};

export const generateItinerary = async (params, retries = 2) => {
  const { destination, days, budget, interests, groupSize } = params;

  const systemPrompt = `You are Wandr AI, a prestigious world-travel expert and local fix-it. 
  Your mission is to generate itineraries that are not just lists of sights, but cohesive, locally authentic experiences. 
  Focus on:
  1. Logical flow: Group activities by neighborhood to minimize transit time.
  2. Local flavor: Include "off-the-beaten-path" gems and cultural etiquette.
  3. Context: Consider the current season and typical weather for the destination.
  4. Accuracy: Ensure all JSON fields are strictly populated according to the schema.
  Always respond with valid JSON only. No markdown, no preamble.`;
  
  const userPrompt = `Create a highly detailed ${days}-day itinerary for ${destination} for ${groupSize} traveler(s) with a ${budget} budget. 
  Interests: ${interests.join(', ') || 'General exploration'}.
  
  Requirements:
  - Estimated Cost: Provide a total range string (e.g., "$1,200 - $1,800").
  - Activities: Each day should have 3-4 distinct activities with specific times, precise locations, and types.
  - Logical Sequencing: Sequence activities to minimize travel distance.
  - Local Tips: Provide 4-5 high-value tips regarding safety, cultural norms, or hidden gems.
  - Packing: Suggest 5 essential items specific to this destination and typical weather.
  - Dining: Recommend specific meal types (e.g., "Street Food", "Fine Dining") that match the ${budget} budget.

  Return JSON matching this schema: 
  { 
    "title": "...", 
    "description": "...", 
    "destination": "...", 
    "duration": ${days}, 
    "estimatedCost": "...", 
    "itinerary": [
      { 
        "day": 1, 
        "title": "...", 
        "theme": "...", 
        "activities": [
          { "time": "...", "activity": "...", "location": "...", "type": "...", "estimatedCost": "...", "tips": "..." }
        ], 
        "accommodation": { "name": "...", "type": "...", "pricePerNight": "..." }, 
        "meals": [
          { "time": "...", "name": "...", "cuisine": "...", "priceRange": "..." }
        ] 
      }
    ], 
    "packingList": [], 
    "localTips": [] 
  }`;

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('dummy') || process.env.GROQ_API_KEY.includes('placeholder')) {
    console.log('Using Mock AI Service for Itinerary Generation');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          title: `Magical ${days}-Day Journey through ${destination}`,
          description: `A perfectly balanced adventure in ${destination}, tailored for ${groupSize} traveler(s) with a focus on ${interests.join(', ') || 'authentic local experiences'}.`,
          destination,
          duration: days,
          estimatedCost: calculateEstimatedCost(destination, days, budget, groupSize),
          itinerary: Array.from({ length: days }, (_, i) => ({
            day: i + 1,
            title: i === 0 ? 'Arrival & Orientation' : i === days - 1 ? 'Lasting Memories & Departure' : `Exploring the Heart of ${destination}`,
            theme: i % 2 === 0 ? 'Cultural Immersion' : 'Adventure & Nature',
            activities: [
              {
                time: '09:00 AM',
                activity: 'Local Exploration & Landmarks',
                location: `Central ${destination}`,
                activityType: 'Sightseeing',
                estimatedCost: '$20',
                tips: 'Book tickets in advance to skip the line.'
              },
              {
                time: '01:00 PM',
                activity: 'Authentic Local Lunch',
                location: 'Old Town District',
                activityType: 'Dining',
                estimatedCost: '$30',
                tips: 'Try the specialty dish recommended by the waiter.'
              },
              {
                time: '04:00 PM',
                activity: 'Guided Walking Tour',
                location: 'Riverside / Main Square',
                activityType: 'Culture',
                estimatedCost: 'Free',
                tips: 'Wear comfortable walking shoes.'
              }
            ],
            accommodation: {
              name: `${destination} Boutique Hotel`,
              accommodationType: 'Boutique',
              pricePerNight: '$150'
            },
            meals: [
              { time: 'Breakfast', name: 'Hotel Buffet', cuisine: 'International', priceRange: 'Included' },
              { time: 'Dinner', name: 'Sunset Bistro', cuisine: 'Local Fusion', priceRange: '$$' }
            ]
          })),
          packingList: ['Comfortable walking shoes', 'Power adapter', 'Reusable water bottle', 'Local currency', 'Travel insurance documents'],
          localTips: [
            'Learn a few basic phrases in the local language.',
            'Use public transport; it is safe and reliable.',
            'Tipping is appreciated but not mandatory.',
            'Always carry a light jacket, even in summer.'
          ]
        });
      }, 1500);
    });
  }

  try {
    // Use AbortController for timeout protection (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await getGroqClient().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
      }, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      return parsed;
    } catch (err) {
      clearTimeout(timeoutId);
      
      // Handle timeout error
      if (err.name === 'AbortError') {
        throw new Error('AI request timed out. Please try again.');
      }
      throw err;
    }
  } catch (error) {
    if (retries > 0) {
      // Handle rate limit - retry after delay
      if (error.status === 429) {
        console.log(`Groq rate limit hit. Retrying in 2s... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return generateItinerary(params, retries - 1);
      }
      console.log(`Groq API generation failed. Retrying... (${retries} retries left)`);
      return generateItinerary(params, retries - 1);
    }
    
    // Handle authentication error
    if (error.status === 401) {
      throw new Error('AI configuration error: Invalid or missing API key');
    }
    
    throw new Error(`AI Itinerary Generation failed: ${error.message}`);
  }
};

export const suggestTrips = async (preferences) => {
  const systemPrompt = "You are an expert travel agent. Suggest exactly 3 attractive trip destinations based on user preferences. Always respond with valid JSON only. No markdown.";
  const userPrompt = `Suggest 3 trips based on these preferences: ${JSON.stringify(preferences)}. Return JSON matching this schema: { suggestions: [{ title, destination, reason, estimatedBudget, bestTimeToVisit }] }`;

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('dummy') || process.env.GROQ_API_KEY.includes('placeholder')) {
    console.log('Using Mock AI Service for Trip Suggestions');
    return [
      { title: "Bali Beach Escape", destination: "Bali, Indonesia", reason: "Perfect for a balanced mix of relaxation, beaches, and temple experiences", estimatedBudget: "$1,200 - $1,800", bestTimeToVisit: "April–October" },
      { title: "Manali Valley Retreat", destination: "Manali, India", reason: "Great for cool weather, mountain scenery, and short adventure escapes", estimatedBudget: "$650 - $950", bestTimeToVisit: "March–June" },
      { title: "Dubai Skyline & Desert", destination: "Dubai, UAE", reason: "Ideal for premium city stays, shopping, and desert experiences", estimatedBudget: "$2,300 - $3,200", bestTimeToVisit: "November–March" }
    ];
  }

  try {
    // Use AbortController for timeout protection (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await getGroqClient().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
      }, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return JSON.parse(response.choices[0].message.content).suggestions;
    } catch (err) {
      clearTimeout(timeoutId);
      
      // Handle timeout error
      if (err.name === 'AbortError') {
        throw new Error('AI request timed out. Please try again.');
      }
      throw err;
    }
  } catch (error) {
    if (error.status === 429) {
      throw new Error('AI service is busy, please try again in a moment');
    }
    if (error.status === 401) {
      throw new Error('AI configuration error, please contact support');
    }
    throw new Error(`AI Trip Suggestion failed: ${error.message}`);
  }
};

export const travelChatStream = async (messages, context, res) => {
  const systemPrompt = "You are Wandr AI, a friendly and knowledgeable travel assistant. Help users plan trips, answer travel questions, suggest destinations, and provide visa/safety/cultural tips. Be concise, friendly, and specific.";

  // Keep last 10 messages for context
  const history = messages.slice(-10).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('dummy') || process.env.GROQ_API_KEY.includes('placeholder')) {
    console.log('Using Mock AI Service for Chat Stream');
    res.write('data: {"content":"Hi! I\'m Wandr AI (mock mode). I can help you plan amazing trips! What destination are you thinking about?"\n\n');
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  try {
    // Use AbortController for timeout protection (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const stream = await getGroqClient().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt + (context ? ` Context: ${JSON.stringify(context)}` : '') },
          ...history
        ],
        stream: true,
      }, {
        signal: controller.signal
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      clearTimeout(timeoutId);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      clearTimeout(timeoutId);
      
      // Handle timeout error
      if (err.name === 'AbortError') {
        res.write(`data: ${JSON.stringify({ error: 'AI request timed out. Please try again.' })}\n\n`);
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error("Groq stream error:", error);
    
    // Handle specific error status codes
    if (error.status === 429) {
      res.write(`data: ${JSON.stringify({ error: 'AI service is busy, please try again.' })}\n\n`);
    } else if (error.status === 401) {
      res.write(`data: ${JSON.stringify({ error: 'AI service configuration error.' })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: 'AI service unavailable. Please try again.' })}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  }
};
