const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const ACTIVITY_POOL = {
    morning: ["Sunrise hike", "Heritage breakfast", "Cathedral visit", "Botanical gardens", "Old town exploration", "Art museum", "Yoga by lake", "Food tasting", "Photography walk", "Famous landmark"],
    afternoon: ["Cooking class", "Fashion shopping", "River cruise", "Medieval fortress", "Science center", "Beer tasting", "Park picnic", "Artisan workshop", "Street art tour", "Rooftop lunch"],
    evening: ["Skyline dinner", "Jazz performance", "Night market", "Starlit walk", "Cultural show", "Speakeasy bar", "Street food crawl", "Theater play", "Glow kayaking", "Spa treatment"],
    tips: ["Carry water", "Use transport apps", "Book skip-line tickets", "Keep local currency", "Dress in layers", "Respect customs", "Try specialty dishes", "Join free tours", "Wear walking shoes", "Download offline maps"]
};

const DAY_THEMES = ["Culture & Heritage", "Nature & Adventure", "Food & Flavors", "Modern Vibes", "Relaxation", "Hidden Gems", "Art & Creativity", "History", "Local Life", "Grand Finale"];

function generateItinerary(destination, days, budget, interests) {
    const itinerary = [];
    for (let i = 0; i < days; i++) {
        const p = (i + destination.length) % 10;
        itinerary.push({
            day: i + 1, title: DAY_THEMES[i % 10],
            morning: ACTIVITY_POOL.morning[(p + i) % 10],
            afternoon: ACTIVITY_POOL.afternoon[(p + i + 2) % 10],
            evening: ACTIVITY_POOL.evening[(p + i + 4) % 10],
            tip: ACTIVITY_POOL.tips[(p + i) % 10]
        });
    }
    return { destination, days, budget, interests, itinerary };
}

app.post('/api/chat', (req, res) => {
    const { message, state, userData } = req.body;
    if (state === 'DESTINATION') return res.json({ reply: `Wow, ${message}! How many days?`, nextState: 'DAYS', updatedData: { ...userData, destination: message } });
    if (state === 'DAYS') {
        const d = parseInt(message);
        if (isNaN(d) || d <= 0) return res.json({ reply: "Please enter a valid number of days.", nextState: 'DAYS', updatedData: userData });
        return res.json({ reply: `Got it! What is your budget?`, nextState: 'BUDGET', options: ["Economy", "Standard", "Luxury"], updatedData: { ...userData, days: d } });
    }
    if (state === 'BUDGET') return res.json({ reply: `What are you interested in?`, nextState: 'INTERESTS', options: ["Sightseeing", "Food", "Adventure", "Relaxation"], updatedData: { ...userData, budget: message } });
    if (state === 'INTERESTS') {
        const finalData = { ...userData, interests: message };
        return res.json({ reply: `Itinerary Ready! ✨`, itinerary: generateItinerary(finalData.destination, finalData.days, finalData.budget, finalData.interests), nextState: 'COMPLETE', updatedData: finalData });
    }
    return res.status(400).json({ error: "Invalid state" });
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));
