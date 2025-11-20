export const paperNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`;

export const getPaperStyles = (id: string | number) => {
    // Deterministic randomness based on ID
    const seed = typeof id === 'string' ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : id;
    const random = (min: number, max: number) => {
        const x = Math.sin(seed) * 10000;
        return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };

    return {
        backgroundPosition: `${random(0, 100)}% ${random(0, 100)}%`,
    };
};
