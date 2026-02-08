const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { title } = req.query;
    if (!title) return res.status(400).json({ success: false, error: "Chýba názov" });

    try {
        // Hľadáme prioritne verzie s CZ dabingom pridaním "cz" k názvu
        const searchQuery = `${title} cz`;
        const searchUrl = `https://prehrajto.cz/search/score?q=${encodeURIComponent(searchQuery)}`;

        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest', // Toto povie serveru, že sme ich vlastný script
                'Referer': 'https://prehrajto.cz/'
            },
            timeout: 5000
        });

        // Prehraj.to vrací HTML kusy vo výsledkoch
        const html = response.data;

        // Vylepšený hľadač ID videa - hľadá prvé ID v zozname výsledkov
        // Formát odkazu je zvyčajne href="/video/nazov-videa-ID"
        const regex = /\/video\/([a-zA-Z0-9-]+)/;
        const match = html.match(regex);

        if (match && match[1]) {
            return res.status(200).json({
                success: true,
                videoId: match[1]
            });
        } else {
            // Ak nenašlo s CZ, skúsime ešte raz bez "cz"
            const fallbackRes = await axios.get(`https://prehrajto.cz/search/score?q=${encodeURIComponent(title)}`);
            const fallbackMatch = fallbackRes.data.match(regex);
            
            if (fallbackMatch && fallbackMatch[1]) {
                return res.status(200).json({ success: true, videoId: fallbackMatch[1] });
            }
            
            return res.status(404).json({ success: false, error: "Nenájdené" });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: "Server error" });
    }
};
