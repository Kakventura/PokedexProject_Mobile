import { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, Platform, Image,
    FlatList, ActivityIndicator, TextInput, TouchableOpacity, Pressable,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getPokemons } from '@/integration/pokemonIntegration';
import { getTypeTheme, getTypeLabel } from '@/constants/colors';
import { Pokemon } from '@/@types/pokemon';

const isWeb = Platform.OS === 'web';
const isAndroid = Platform.OS === 'android';

function translateStat(nome: string): string {
    const map: Record<string, string> = {
        'hp': 'HP', 'attack': 'ATK', 'defense': 'DEF',
        'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', 'speed': 'VEL',
    };
    return map[nome] ?? nome.replace('special-', 'sp.').toUpperCase();
}

// ─── Card padrão (iOS / Web) ───────────────────────────────────────────────
function PokemonCardDefault({ item }: { item: Pokemon }) {
    const theme = getTypeTheme(item.tipos);
    const name = item.nome.charAt(0).toUpperCase() + item.nome.slice(1);

    return (
        <View style={[styles.card, { borderColor: theme.accent, backgroundColor: theme.bg }]}>
            <View style={styles.imageWrap}>
                <Image source={{ uri: item.imagem }} style={styles.image} resizeMode="contain" />
            </View>
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.pokemonName}>{name}</Text>
                    <Text style={[styles.pokemonId, { color: theme.accent }]}>#{item.index}</Text>
                </View>
                <View style={styles.typesRow}>
                    {item.tipos.map((t) => {
                        const th = getTypeTheme([t]);
                        return (
                            <View key={t} style={[styles.typeBadge, { backgroundColor: th.accent }]}>
                                <Text style={styles.typeBadgeText}>{getTypeLabel(t)}</Text>
                            </View>
                        );
                    })}
                </View>
                <View style={styles.statsRow}>
                    {item.poderes.slice(0, 3).map((p) => (
                        <View key={p.nome} style={[styles.statPill, { borderColor: theme.accent + '66' }]}>
                            <Text style={[styles.statLabel, { color: theme.accent }]}>
                                {translateStat(p.nome)}
                            </Text>
                            <Text style={styles.statValue}>{p.forca}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

// ─── Card Material (Android) ───────────────────────────────────────────────
// Superfície elevada neutra com uma faixa de cor do tipo na lateral,
// avatar circular tonalizado e chips retangulares (não em pílula).
function PokemonCardAndroid({ item }: { item: Pokemon }) {
    const theme = getTypeTheme(item.tipos);
    const name = item.nome.charAt(0).toUpperCase() + item.nome.slice(1);

    return (
        <View style={androidStyles.card}>
            <View style={[androidStyles.accentStripe, { backgroundColor: theme.accent }]} />
            <View style={[androidStyles.avatar, { backgroundColor: theme.bg }]}>
                <Image source={{ uri: item.imagem }} style={androidStyles.avatarImg} resizeMode="contain" />
            </View>
            <View style={androidStyles.content}>
                <View style={androidStyles.topRow}>
                    <Text style={androidStyles.pokemonName}>{name}</Text>
                    <Text style={androidStyles.pokemonId}>#{item.index}</Text>
                </View>
                <View style={androidStyles.typesRow}>
                    {item.tipos.map((t) => {
                        const th = getTypeTheme([t]);
                        return (
                            <View
                                key={t}
                                style={[androidStyles.typeChip, { backgroundColor: th.accent + '26', borderColor: th.accent }]}
                            >
                                <Text style={[androidStyles.typeChipText, { color: th.accent }]}>{getTypeLabel(t)}</Text>
                            </View>
                        );
                    })}
                </View>
                <View style={androidStyles.statsRow}>
                    {item.poderes.slice(0, 3).map((p) => (
                        <View key={p.nome} style={[androidStyles.statChip, { backgroundColor: theme.accent + '1A' }]}>
                            <Text style={[androidStyles.statLabel, { color: theme.accent }]}>
                                {translateStat(p.nome)}
                            </Text>
                            <Text style={androidStyles.statValue}>{p.forca}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
    const [filtered, setFiltered] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadPokemons = useCallback(async () => {
        try {
            const data = await getPokemons(151);
            setAllPokemons(data);
            setFiltered(data);
        } catch (err) {
            console.error('Erro ao carregar pokémons:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadPokemons(); }, [loadPokemons]);

    useEffect(() => {
        const q = search.trim().toLowerCase();
        if (!q) { setFiltered(allPokemons); return; }
        setFiltered(
            allPokemons.filter(
                (p) =>
                    p.nome.toLowerCase().includes(q) ||
                    p.index.includes(q) ||
                    String(parseInt(p.index)).includes(q) ||
                    p.tipos.some(t => t.toLowerCase().includes(q)) ||
                    p.tipos.some(t => getTypeLabel(t).toLowerCase().includes(q))
            )
        );
    }, [search, allPokemons]);

    return (
        <View style={styles.wrapper}>
            {/* ── Cabeçalho ─────────────────────────────────────────────── */}
            {isAndroid ? (
                <View style={androidStyles.header}>
                    <View>
                        <Text style={androidStyles.welcomeLabel}>Bem-vindo,</Text>
                        <Text style={androidStyles.welcomeName}>{user}</Text>
                    </View>
                    <Pressable
                        style={androidStyles.logoutBtn}
                        onPress={signOut}
                        android_ripple={{ color: 'rgba(255,107,53,0.3)', radius: 24 }}
                    >
                        <Text style={androidStyles.logoutIcon}>🚪</Text>
                    </Pressable>
                </View>
            ) : (
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeLabel}>BEM-VINDO,</Text>
                        <Text style={styles.welcomeName}>{user}</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ── Busca ─────────────────────────────────────────────────── */}
            {isAndroid ? (
                <View style={androidStyles.searchBar}>
                    <Text style={androidStyles.searchIcon}>🔍</Text>
                    <TextInput
                        style={androidStyles.searchInput}
                        placeholder="Buscar por nome, número ou tipo..."
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        value={search}
                        onChangeText={setSearch}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                </View>
            ) : (
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nome, número ou tipo..."
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={search}
                    onChangeText={setSearch}
                    autoCorrect={false}
                    autoCapitalize="none"
                />
            )}

            {/* ── Título da seção ───────────────────────────────────────── */}
            {isAndroid ? (
                <View style={androidStyles.sectionHeader}>
                    <Text style={androidStyles.sectionTitle}>Pokédex</Text>
                    {!loading && (
                        <Text style={androidStyles.sectionSubtitle}>{filtered.length} pokémons encontrados</Text>
                    )}
                </View>
            ) : (
                <Text style={styles.sectionTitle}>
                    POKÉDEX {!loading && `· ${filtered.length} pokémons`}
                </Text>
            )}

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={styles.loadingText}>Carregando pokédex...</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.index}
                    renderItem={({ item }) =>
                        isAndroid ? <PokemonCardAndroid item={item} /> : <PokemonCardDefault item={item} />
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={12}
                    maxToRenderPerBatch={12}
                    windowSize={5}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#080808' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: isWeb ? 24 : 16, paddingBottom: 8,
    },
    welcomeLabel: {
        color: 'rgba(255,255,255,0.3)', fontSize: 10,
        fontWeight: '800', letterSpacing: 2,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    welcomeName: { color: '#FFFFFF', fontSize: isWeb ? 20 : 18, fontWeight: '900' },
    logoutBtn: {
        borderWidth: 1, borderColor: '#FF6B35', borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 5,
    },
    logoutText: { color: '#FF6B35', fontWeight: '700', fontSize: 13 },
    searchInput: {
        marginHorizontal: 16, marginBottom: 8,
        backgroundColor: '#111', borderWidth: 1, borderColor: '#333',
        borderRadius: 12, color: '#fff', paddingHorizontal: 14,
        paddingVertical: 10, fontSize: 15,
    },
    sectionTitle: {
        color: '#FF6B35', fontSize: 10, fontWeight: '800',
        letterSpacing: 2, textTransform: 'uppercase',
        paddingHorizontal: 16, marginBottom: 6,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
    listContent: {
        paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4, gap: 10,
        ...(isWeb ? { maxWidth: 680, alignSelf: 'center' as any, width: '100%' } : {}),
    },
    // Card principal — maior e mais próximo
    card: {
        borderRadius: 16, borderWidth: 1.5,
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 14, gap: 14,
    },
    imageWrap: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    image: { width: 76, height: 76 },
    content: { flex: 1, gap: 7 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pokemonName: { color: '#fff', fontSize: 17, fontWeight: '900' },
    pokemonId: { fontSize: 12, fontWeight: '800', opacity: 0.85 },
    typesRow: { flexDirection: 'row', gap: 6 },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
    typeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    statsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    statPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
    },
    statLabel: { fontSize: 10, fontWeight: '800' },
    statValue: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700' },
});

// ─── Estilos Material (Android) ─────────────────────────────────────────────
// Superfícies tonais escalonadas (background < surface < surface alto),
// cantos bem arredondados, elevação neutra (sem glow colorido) e chips
// retangulares preenchidos em vez de pílulas com borda.
const androidStyles = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
    },
    welcomeLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '500' },
    welcomeName: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginTop: 2 },
    logoutBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#1C1C1F',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
    },
    logoutIcon: { fontSize: 19 },

    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginBottom: 14,
        backgroundColor: '#1C1C1F', borderRadius: 28,
        paddingHorizontal: 18, height: 52,
        elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3, shadowRadius: 3,
        gap: 10,
    },
    searchIcon: { fontSize: 16, opacity: 0.6 },
    searchInput: { flex: 1, color: '#fff', fontSize: 15, padding: 0 },

    sectionHeader: { paddingHorizontal: 20, marginBottom: 10, gap: 1 },
    sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    sectionSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12.5 },

    // Card
    card: {
        borderRadius: 20, backgroundColor: '#1C1C1F',
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 14, gap: 14,
        overflow: 'hidden', position: 'relative',
        elevation: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25, shadowRadius: 2,
    },
    accentStripe: {
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
    },
    avatar: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 4,
    },
    avatarImg: { width: 48, height: 48 },
    content: { flex: 1, gap: 7 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pokemonName: { color: '#fff', fontSize: 16, fontWeight: '700' },
    pokemonId: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
    typesRow: { flexDirection: 'row', gap: 6 },
    typeChip: {
        paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, borderWidth: 1,
    },
    typeChipText: { fontSize: 10, fontWeight: '700' },
    statsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    statChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
    },
    statLabel: { fontSize: 10, fontWeight: '700' },
    statValue: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600' },
});
