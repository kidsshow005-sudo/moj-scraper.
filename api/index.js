const axios = require('axios');

module.exports = async (req, res) => {
    // POVOLENIE PRE TVOJ WEB (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ success: false, error: "Chýba názov filmu" });
    }

    try {
        // Vyhľadávanie na Prehraj.to
        const searchUrl = `https://prehrajto.cz/hladaj/${encodeURIComponent(title)}`;
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        const html = response.data;
        
        // Hľadanie ID videa v HTML kóde pomocou regulárneho výrazu
        // Hľadáme linky typu /video/nieco-id
        const regex = /\/video\/([a-zA-Z0-9-]+)/;
        const match = html.match(regex);

        if (match && match[1]) {
            return res.status(200).json({
                success: true,
                videoId: match[1],
                title: title
            });
        } else {
            return res.status(404).json({ success: false, error: "Video nebolo nájdené" });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
