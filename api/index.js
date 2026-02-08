const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    // Toto povolí tvojmu webu komunikovať so serverom bez chýb
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Odpoveď na predbežnú požiadavku prehliadača (pre istotu)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ success: false, message: "Chýba názov filmu." });
    }

    try {
        // Vyčistíme názov pre lepšie hľadanie
        const cleanTitle = title.replace(/[^\w\s]/gi, '');
        const searchUrl = `https://prehrajto.cz/hledej/${encodeURIComponent(cleanTitle + " cz dabing")}`;

        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            },
            timeout: 8000 // Server počká max 8 sekúnd
        });

        const $ = cheerio.load(data);
        
        // Hľadáme prvý odkaz na video na Prehraj.to
        const firstLink = $('.video-item a').first().attr('href');

        if (firstLink) {
            // Získame ID videa z odkazu (napr. z /v/abcde získa abcde)
            const videoId = firstLink.split('/').filter(Boolean).pop();
            return res.status(200).json({ success: true, videoId: videoId });
        } else {
            return res.status(200).json({ success: false, message: "Nenašlo sa žiadne video." });
        }
    } catch (error) {
        console.error("Chyba scrapera:", error.message);
        return res.status(500).json({ success: false, error: "Chyba pripojenia k zdroju." });
    }
};
