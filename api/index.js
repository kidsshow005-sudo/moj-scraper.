const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    let { title } = req.query;
    if (!title) return res.status(200).json({ success: false });

    try {
        // SKÚŠAME SLOVENSKÚ DOMÉNU
        const searchUrl = `https://prehrajto.sk/search/score?q=${encodeURIComponent(title)}`;

        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            },
            timeout: 7000 
        });

        const regex = /\/video\/([a-zA-Z0-9-]+)/;
        const match = response.data.match(regex);

        if (match && match[1]) {
            return res.status(200).json({ success: true, videoId: match[1] });
        }
        return res.status(200).json({ success: false, error: "Nenájdené na SK" });

    } catch (error) {
        return res.status(200).json({ success: false, error: "Blokované serverom" });
    }
};
