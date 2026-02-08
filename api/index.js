export const config = {
  runtime: 'edge',
};

export default async (req) => {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');

  if (!title) return new Response(JSON.stringify({ success: false }), { status: 400 });

  try {
    // Skúsime vyhľadať priamo cez mobilné rozhranie
    const searchUrl = `https://prehrajto.cz/search/score?q=${encodeURIComponent(title + " cz")}`;

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Referer': 'https://prehrajto.cz/'
      }
    });

    const html = await res.text();
    const match = html.match(/\/video\/([a-zA-Z0-9-]+)/);

    if (match && match[1]) {
      return new Response(JSON.stringify({ success: true, videoId: match[1] }), {
        status: 200,
        headers: { 
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        },
      });
    }

    return new Response(JSON.stringify({ success: false }), { 
        status: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' } 
    });

  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
};
