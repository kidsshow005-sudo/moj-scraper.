const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    let { title } = req.query;
    if (!title) return res.status(400).json({ success: false });

    // Vyčistíme názov od zbytočností
    const cleanTitle = title.split('(')[0].trim();

    try {
        // Skúsime vyhľadať priamo cez mobilnú verziu, ktorá je menej blokovaná
        const searchUrl = `https://prehrajto.cz/search/score?q=${encodeURIComponent(cleanTitle + " cz")}`;

        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
                'Referer': 'https://prehrajto.cz/',
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 9000
        });

        const html = response.data;
        // Hľadáme ID videa (kombinácia písmen a čísiel po /video/)
        const regex = /\/video\/([a-zA-Z0-9-]+)/;
        const match = html.match(regex);

        if (match && match[1]) {
            return res.status(200).json({
                success: true,
                videoId: match[1]
            });
        }

        return res.status(404).json({ success: false, error: "Nenájdené" });

    } catch (error) {
        console.error("Chyba:", error.message);
        return res.status(500).json({ success: false, error: "Server busy" });
    }
};
