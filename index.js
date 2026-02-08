const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/search-cz', async (req, res) => {
    const title = req.query.title;
    if (!title) return res.status(400).json({ success: false, message: "Chýba názov filmu" });

    // Skúsime hľadať s dabingom
    const searchUrl = `https://prehrajto.cz/hledej/${encodeURIComponent(title + " cz dabing")}`;

    try {
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(data);
        
        // Nájdeme prvý odkaz na video
        const firstLink = $('.video-item a').first().attr('href');

        if (firstLink) {
            const videoId = firstLink.split('/').pop();
            res.json({ success: true, videoId: videoId });
        } else {
            res.json({ success: false, message: "Nenašlo sa žiadne video" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: "Chyba pri kontaktovaní Prehrajto" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scraper beží na porte ${PORT}`));
