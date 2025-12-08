import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { urls } = body;

        if (!urls || !Array.isArray(urls)) {
            return NextResponse.json({ error: 'Invalid URL list' }, { status: 400 });
        }

        const apiKey = process.env.INDEXNOW_KEY || 'default-key-placeholder'; // Should be in env
        const host = 'headlined.app';

        // Ping Bing (which shares with Yandex)
        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                host,
                key: apiKey,
                keyLocation: `https://${host}/${apiKey}.txt`, // Standard verification file location
                urlList: urls,
            }),
        });

        if (!response.ok) {
            console.error('IndexNow Error', await response.text());
            return NextResponse.json({ success: false, error: 'Failed to submit to IndexNow' }, { status: response.status });
        }

        return NextResponse.json({ success: true, count: urls.length });

    } catch (e) {
        console.error("IndexNow API Route Error", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
