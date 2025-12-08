import { ImageResponse } from 'next/og';
import { getSeoMetadata, CategoryId } from '@/lib/seo-config';

export const runtime = 'edge';

// Image metadata
export const alt = 'Headlined News Coverage';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { view: string; slug: string } }) {
    const { view, slug } = await params;

    // Fetch rich data
    const seo = getSeoMetadata(view as CategoryId, slug);
    const categoryLabel = view.charAt(0).toUpperCase() + view.slice(1);

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #09090b, #18181b)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '80px',
                    justifyContent: 'space-between',
                    fontFamily: '"Inter", sans-serif',
                }}
            >
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #3f3f46 2%, transparent 0%), radial-gradient(circle at 75px 75px, #3f3f46 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                    opacity: 0.1,
                }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#27272a',
                        padding: '12px 24px',
                        borderRadius: '100px',
                        border: '1px solid #3f3f46'
                    }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 24, fontWeight: 600, color: '#e4e4e7', letterSpacing: '-0.02em' }}>
                            {categoryLabel} Tracker
                        </span>
                    </div>
                    <span style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>Headlined.</span>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10 }}>
                    <h1 style={{
                        fontSize: 84,
                        fontWeight: 800,
                        color: 'white',
                        lineHeight: 1.1,
                        margin: 0,
                        letterSpacing: '-0.03em',
                        textShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                        {seo.richTitle}
                    </h1>

                    {seo.aliases && seo.aliases.length > 0 && (
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {seo.aliases.slice(0, 3).map((alias: string) => (
                                <div key={alias} style={{
                                    fontSize: 24,
                                    color: '#a1a1aa',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '8px 20px',
                                    borderRadius: '12px'
                                }}>
                                    #{alias}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: 24, color: '#a1a1aa' }}>Live Coverage & Analysis</span>
                        <div style={{ width: '80px', height: '4px', background: '#3b82f6', borderRadius: '2px' }} />
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            // Fonts would ideally be loaded here if custom fonts are needed
        }
    );
}
