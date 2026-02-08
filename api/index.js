const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    const { title } = req.query;
    if (!title) return res.json({ success: false });

    try {
        // Skúsime hľadať bez prípony "cz", niekedy to robí problém
        const searchUrl = `https://prehrajto.cz/search/score?q=${encodeURIComponent(title)}`;

        const response = await axios.get(searchUrl, {
            headers: {
                // Tvárime sa ako Google bot
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept-Language': 'cs-CZ,cs;q=0.9',
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 10000
        });

        // Vytiahneme prvé ID videa, ktoré nájdeme
        const html = response.data;
        const regex = /\/video\/([a-zA-Z0-9-]+)/;
        const match = html.match(regex);

        if (match && match[1]) {
            return res.json({ success: true, videoId: match[1] });
        } else {
            return res.json({ success: false, note: "Nenašlo ID v HTML" });
        }
    } catch (error) {
        return res.json({ success: false, error: "Prehrajto blokuje IP adresu servera" });
    }
};
