export const Colors = {
    white: '#FFFFFF',
    black: '#000000',
    background: '#080808',
    surface: '#111111',

    btnPrimary: '#FF6B35',
    labelPrimary: '#FFFFFF',
    txtPrimary: '#FFFFFF',

    semantic: {
        error: { bg: '#2a0800', border: '#FF6B35', text: '#FF6B35' },
        success: { bg: '#001a00', border: '#66BB6A', text: '#66BB6A' },
        warning: { bg: '#1a1400', border: '#FFD600', text: '#FFD600' },
        info: { bg: '#00091a', border: '#4FC3F7', text: '#4FC3F7' },
    },

    gray: {
        100: '#F2F2F2',
        500: '#999999',
        800: '#333333',
    },

    // Mapeamento EM INGLÊS (como a PokeAPI retorna) + português como alias
    types: {
        // ── Inglês (PokeAPI) ──────────────────────────────────────────────
        fire:     { bg: '#1a0a00', accent: '#FF6B35', glow: 'rgba(255,107,53,0.5)',   label: 'FOGO' },
        water:    { bg: '#00091a', accent: '#4FC3F7', glow: 'rgba(79,195,247,0.5)',   label: 'ÁGUA' },
        grass:    { bg: '#001a00', accent: '#66BB6A', glow: 'rgba(102,187,106,0.5)',  label: 'GRAMA' },
        electric: { bg: '#1a1400', accent: '#FFD600', glow: 'rgba(255,214,0,0.5)',    label: 'ELÉTRICO' },
        psychic:  { bg: '#1a0010', accent: '#F06292', glow: 'rgba(240,98,146,0.5)',   label: 'PSÍQUICO' },
        ice:      { bg: '#001218', accent: '#80DEEA', glow: 'rgba(128,222,234,0.5)',  label: 'GELO' },
        dragon:   { bg: '#06001a', accent: '#7E57C2', glow: 'rgba(126,87,194,0.5)',   label: 'DRAGÃO' },
        dark:     { bg: '#0d0d0d', accent: '#8D6E63', glow: 'rgba(141,110,99,0.5)',   label: 'SOMBRIO' },
        fairy:    { bg: '#1a0018', accent: '#F48FB1', glow: 'rgba(244,143,177,0.5)',  label: 'FADA' },
        fighting: { bg: '#1a0500', accent: '#EF5350', glow: 'rgba(239,83,80,0.5)',    label: 'LUTADOR' },
        poison:   { bg: '#0f001a', accent: '#AB47BC', glow: 'rgba(171,71,188,0.5)',   label: 'VENENO' },
        ground:   { bg: '#1a1000', accent: '#D4A373', glow: 'rgba(212,163,115,0.5)',  label: 'TERRA' },
        rock:     { bg: '#141008', accent: '#BCAAA4', glow: 'rgba(188,170,164,0.5)',  label: 'PEDRA' },
        bug:      { bg: '#0a1400', accent: '#AED581', glow: 'rgba(174,213,129,0.5)',  label: 'INSETO' },
        ghost:    { bg: '#0a0014', accent: '#9575CD', glow: 'rgba(149,117,205,0.5)',  label: 'FANTASMA' },
        steel:    { bg: '#0f0f14', accent: '#90A4AE', glow: 'rgba(144,164,174,0.5)', label: 'AÇO' },
        flying:   { bg: '#000d1a', accent: '#81D4FA', glow: 'rgba(129,212,250,0.5)', label: 'VOADOR' },
        normal:   { bg: '#111111', accent: '#BDBDBD', glow: 'rgba(189,189,189,0.4)', label: 'NORMAL' },

        // ── Português (retrocompatibilidade) ──────────────────────────────
        fogo:     { bg: '#1a0a00', accent: '#FF6B35', glow: 'rgba(255,107,53,0.5)',   label: 'FOGO' },
        'água':   { bg: '#00091a', accent: '#4FC3F7', glow: 'rgba(79,195,247,0.5)',   label: 'ÁGUA' },
        grama:    { bg: '#001a00', accent: '#66BB6A', glow: 'rgba(102,187,106,0.5)',  label: 'GRAMA' },
        'elétrico': { bg: '#1a1400', accent: '#FFD600', glow: 'rgba(255,214,0,0.5)', label: 'ELÉTRICO' },
        'psíquico': { bg: '#1a0010', accent: '#F06292', glow: 'rgba(240,98,146,0.5)',label: 'PSÍQUICO' },
        gelo:     { bg: '#001218', accent: '#80DEEA', glow: 'rgba(128,222,234,0.5)',  label: 'GELO' },
        'dragão': { bg: '#06001a', accent: '#7E57C2', glow: 'rgba(126,87,194,0.5)',   label: 'DRAGÃO' },
        trevas:   { bg: '#0d0d0d', accent: '#8D6E63', glow: 'rgba(141,110,99,0.5)',   label: 'SOMBRIO' },
        fada:     { bg: '#1a0018', accent: '#F48FB1', glow: 'rgba(244,143,177,0.5)',  label: 'FADA' },
        lutador:  { bg: '#1a0500', accent: '#EF5350', glow: 'rgba(239,83,80,0.5)',    label: 'LUTADOR' },
        veneno:   { bg: '#0f001a', accent: '#AB47BC', glow: 'rgba(171,71,188,0.5)',   label: 'VENENO' },
        terra:    { bg: '#1a1000', accent: '#D4A373', glow: 'rgba(212,163,115,0.5)',  label: 'TERRA' },
        pedra:    { bg: '#141008', accent: '#BCAAA4', glow: 'rgba(188,170,164,0.5)',  label: 'PEDRA' },
        inseto:   { bg: '#0a1400', accent: '#AED581', glow: 'rgba(174,213,129,0.5)',  label: 'INSETO' },
        fantasma: { bg: '#0a0014', accent: '#9575CD', glow: 'rgba(149,117,205,0.5)',  label: 'FANTASMA' },
        'aço':    { bg: '#0f0f14', accent: '#90A4AE', glow: 'rgba(144,164,174,0.5)', label: 'AÇO' },
        voador:   { bg: '#000d1a', accent: '#81D4FA', glow: 'rgba(129,212,250,0.5)', label: 'VOADOR' },
    } as Record<string, { bg: string; accent: string; glow: string; label: string }>,
} as const;

export function getTypeTheme(types: string[]): { bg: string; accent: string; glow: string; label: string } {
    const primary = types[0] ?? 'normal';
    return Colors.types[primary] ?? Colors.types['normal'];
}

/** Retorna label em português para um tipo (inglês ou português) */
export function getTypeLabel(type: string): string {
    return Colors.types[type]?.label ?? type.toUpperCase();
}
