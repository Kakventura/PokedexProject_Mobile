import { useEffect, useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, Platform, Image,
    TouchableOpacity, ActivityIndicator, Alert,
    Animated, Dimensions, ScrollView,
    LayoutAnimation, UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { getPokemons } from '@/integration/pokemonIntegration';
import { getCaptured, addCaptured, removeCaptured } from '@/integration/apiService';
import { getTypeTheme, getTypeLabel } from '@/constants/colors';
import { Pokemon } from '@/@types/pokemon';
import { getBattleHandIds, saveBattleHandIds } from '@/utils/battleHand';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const isWeb = Platform.OS === 'web';
const BATTLE_SLOTS = 5;
const W = Dimensions.get('window').width;
// Grid da pokédex: 3 colunas no mobile, 6 no web
const MINI_COLS = isWeb ? 6 : 3;
const MINI_W = isWeb ? 108 : Math.floor((W - 40) / MINI_COLS);

type PokemonEx = Pokemon & { numId: number };

// ─── Slot da Mão de Batalha ───────────────────────────────────────────────────
function BattleSlot({ pokemon, onRemove }: { pokemon: PokemonEx | null; onRemove?: () => void }) {
    const theme = pokemon ? getTypeTheme(pokemon.tipos) : null;
    const name = pokemon ? pokemon.nome.charAt(0).toUpperCase() + pokemon.nome.slice(1) : null;

    if (!pokemon || !theme) {
        return (
            <View style={styles.slotEmpty}>
                <Text style={styles.slotEmptyIcon}>?</Text>
            </View>
        );
    }
    return (
        <View style={[styles.slot, { borderColor: theme.accent, backgroundColor: theme.bg }]}>
            <TouchableOpacity style={styles.slotRemoveBtn} onPress={onRemove}>
                <Text style={styles.slotRemoveText}>✕</Text>
            </TouchableOpacity>
            <Image source={{ uri: pokemon.imagem }} style={styles.slotImg} resizeMode="contain" />
            <Text style={styles.slotName} numberOfLines={1}>{name}</Text>
            <View style={[styles.slotBadge, { backgroundColor: theme.accent }]}>
                <Text style={styles.slotBadgeText}>{getTypeLabel(pokemon.tipos[0])}</Text>
            </View>
        </View>
    );
}

// ─── Card capturado ───────────────────────────────────────────────────────────
function CapturedCard({
    pokemon, onAddToBattle, onRelease, inBattleHand,
}: {
    pokemon: PokemonEx;
    onAddToBattle: (p: PokemonEx) => void;
    onRelease: () => void;
    inBattleHand: boolean;
}) {
    const theme = getTypeTheme(pokemon.tipos);
    const name = pokemon.nome.charAt(0).toUpperCase() + pokemon.nome.slice(1);
    const scale = useRef(new Animated.Value(1)).current;

    function press() {
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start(() => onAddToBattle(pokemon));
    }

    return (
        <Animated.View style={[styles.capturedCard, { borderColor: theme.accent, backgroundColor: theme.bg, transform: [{ scale }] }]}>
            <Image source={{ uri: pokemon.imagem }} style={styles.capturedImg} resizeMode="contain" />
            <View style={{ flex: 1, gap: 5 }}>
                <Text style={styles.capturedName}>{name}</Text>
                <Text style={[styles.capturedId, { color: theme.accent }]}>#{pokemon.index}</Text>
                <View style={styles.typesRow}>
                    {pokemon.tipos.map((t) => {
                        const th = getTypeTheme([t]);
                        return (
                            <View key={t} style={[styles.typeBadge, { backgroundColor: th.accent }]}>
                                <Text style={styles.typeBadgeText}>{getTypeLabel(t)}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
            <View style={{ gap: 8, alignItems: 'center' }}>
                <TouchableOpacity
                    style={[styles.battleBtn, inBattleHand && styles.battleBtnActive]}
                    onPress={press}
                >
                    <Text style={[styles.battleBtnText, { color: inBattleHand ? theme.accent : '#fff' }]}>
                        {inBattleHand ? '⚔ Na mão' : '+ Batalha'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.releaseBtn} onPress={onRelease}>
                    <Text style={styles.releaseBtnText}>Soltar</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function TeamScreen() {
    const { userId } = useAuth();

    const [allPokemons, setAllPokemons] = useState<PokemonEx[]>([]);
    const [capturedData, setCapturedData] = useState<PokemonEx[]>([]);
    const [battleHand, setBattleHand] = useState<(PokemonEx | null)[]>(Array(BATTLE_SLOTS).fill(null));
    const [loading, setLoading] = useState(true);

    // Slot picker: qual pokémon estamos alocando
    const [picking, setPicking] = useState<PokemonEx | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const all = await getPokemons(151);
            const allEx: PokemonEx[] = all.map((p) => ({ ...p, numId: parseInt(p.index) }));
            setAllPokemons(allEx);

            if (userId) {
                const cacheKey = `@Captured:${userId}`;

                // 1. Carrega o cache local imediatamente (resposta rápida)
                const cached = await AsyncStorage.getItem(cacheKey);
                const localIds: number[] = cached ? JSON.parse(cached) : [];

                // 2. Tenta buscar da API
                const apiIds = await getCaptured(userId).catch(() => null);

                // 3. Decide qual lista usar:
                //    - Se API retornou dados, usa ela (fonte de verdade) e atualiza cache
                //    - Se API falhou/retornou vazio, usa o cache local como fallback
                let finalIds: number[];
                if (apiIds !== null && apiIds.length > 0) {
                    finalIds = apiIds.map(Number).filter((n) => !isNaN(n));
                    await AsyncStorage.setItem(cacheKey, JSON.stringify(finalIds));
                } else if (apiIds !== null && apiIds.length === 0 && localIds.length > 0) {
                    // API retornou vazio mas temos cache → usa cache (provável problema de parsing)
                    finalIds = localIds;
                } else {
                    finalIds = localIds;
                }

                const fetched = finalIds
                    .map((id) => allEx.find((p) => p.numId === id))
                    .filter(Boolean) as PokemonEx[];
                setCapturedData(fetched);

                // 4. Carrega a mão de batalha registrada para esta conta
                //    (sorteada com 5 pokémons aleatórios no momento do cadastro)
                // getBattleHandIds já retorna array de tamanho fixo com nulls nas posições vazias
                const handSlots = await getBattleHandIds(userId);
                const hand: (PokemonEx | null)[] = handSlots.map((id) => {
                    if (id === null) return null;
                    return allEx.find((p) => p.numId === id) ?? null;
                });
                // Garante exatamente BATTLE_SLOTS posições
                while (hand.length < BATTLE_SLOTS) hand.push(null);
                setBattleHand(hand.slice(0, BATTLE_SLOTS));
            }
        } catch (err) {
            console.error('Erro ao carregar:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Persiste a mão de batalha sempre que ela muda, vinculada à conta logada.
    // O `loading` evita sobrescrever o registro salvo com o array vazio inicial
    // antes do carregamento terminar.
    useEffect(() => {
        if (!loading && userId) {
            saveBattleHandIds(userId, battleHand.map((p) => (p ? p.numId : null)));
        }
    }, [battleHand, userId, loading]);

    function handleAddToBattle(pokemon: PokemonEx) {
        // Se já está na mão, remove
        const idx = battleHand.findIndex((p) => p?.numId === pokemon.numId);
        if (idx !== -1) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setBattleHand((prev) => { const n = [...prev]; n[idx] = null; return n; });
            return;
        }
        // Abre o picker de slot
        setPicking(pokemon);
    }

    function assignSlot(slotIdx: number) {
        if (!picking) return;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBattleHand((prev) => {
            const n = [...prev];
            // Remove se já estava em outro slot
            const old = n.findIndex((p) => p?.numId === picking.numId);
            if (old !== -1) n[old] = null;
            n[slotIdx] = picking;
            return n;
        });
        setPicking(null);
    }

    function removeFromSlot(idx: number) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBattleHand((prev) => { const n = [...prev]; n[idx] = null; return n; });
    }

    async function handleCapture(pokemon: PokemonEx) {
        if (!userId || capturedData.some((p) => p.numId === pokemon.numId)) return;

        // Atualiza UI e cache local imediatamente (otimistic update)
        const newCaptured = [...capturedData, pokemon];
        setCapturedData(newCaptured);
        const cacheKey = `@Captured:${userId}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(newCaptured.map((p) => p.numId)));

        // Tenta salvar na API (falha silenciosa — cache local garante persistência)
        try {
            await addCaptured(userId, pokemon.numId);
        } catch (err) {
            console.error('Erro ao capturar (API):', err);
            // Não reverte: o cache local já garantiu que o dado fica salvo
        }
    }

    async function handleRelease(pokemon: PokemonEx) {
        if (!userId) return;

        // Atualiza UI e cache local imediatamente
        const newCaptured = capturedData.filter((p) => p.numId !== pokemon.numId);
        setCapturedData(newCaptured);
        setBattleHand((prev) => prev.map((p) => (p?.numId === pokemon.numId ? null : p)));
        const cacheKey = `@Captured:${userId}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(newCaptured.map((p) => p.numId)));

        // Tenta remover da API
        try {
            await removeCaptured(userId, pokemon.numId);
        } catch (err) {
            console.error('Erro ao soltar (API):', err);
        }
    }

    const battleHandIds = new Set(battleHand.filter(Boolean).map((p) => p!.numId));

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Carregando time...</Text>
            </View>
        );
    }

    return (
        <View style={styles.wrapper}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── MÃO DE BATALHA ─────────────────────────────────────── */}
                <Text style={styles.sectionTitle}>⚔ MÃO DE BATALHA</Text>
                <Text style={styles.sectionSub}>
                    {battleHand.filter(Boolean).length}/5 slots · toque "+ Batalha" nos seus pokémons
                </Text>
                <View style={styles.teamGrid}>
                    {battleHand.map((p, i) => (
                        <BattleSlot key={i} pokemon={p} onRemove={p ? () => removeFromSlot(i) : undefined} />
                    ))}
                </View>

                {/* ── SLOT PICKER (aparece quando o usuário aperta "+ Batalha") ── */}
                {picking && (
                    <View style={styles.slotPicker}>
                        <Text style={styles.slotPickerTitle}>
                            Escolher slot para{' '}
                            <Text style={{ color: getTypeTheme(picking.tipos).accent }}>
                                {picking.nome.charAt(0).toUpperCase() + picking.nome.slice(1)}
                            </Text>
                        </Text>
                        <View style={styles.slotPickerRow}>
                            {battleHand.map((p, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.slotPickerSlot, p && { borderColor: getTypeTheme(p.tipos).accent }]}
                                    onPress={() => assignSlot(i)}
                                >
                                    {p ? (
                                        <Image source={{ uri: p.imagem }} style={styles.slotPickerImg} resizeMode="contain" />
                                    ) : (
                                        <Text style={styles.slotPickerEmpty}>+</Text>
                                    )}
                                    <Text style={styles.slotPickerNum}>{i + 1}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.slotPickerCancel} onPress={() => setPicking(null)}>
                            <Text style={styles.slotPickerCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── MEUS POKÉMONS ──────────────────────────────────────── */}
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🎒 MEUS POKÉMONS</Text>
                <Text style={styles.sectionSub}>
                    {capturedData.length} capturado{capturedData.length !== 1 ? 's' : ''}
                </Text>
                {capturedData.length === 0 ? (
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>
                            Você ainda não capturou nenhum pokémon.{'\n'}
                            Toque em qualquer pokémon na Pokédex abaixo!
                        </Text>
                    </View>
                ) : (
                    capturedData.map((pokemon) => (
                        <CapturedCard
                            key={pokemon.numId}
                            pokemon={pokemon}
                            inBattleHand={battleHandIds.has(pokemon.numId)}
                            onAddToBattle={handleAddToBattle}
                            onRelease={() => handleRelease(pokemon)}
                        />
                    ))
                )}

                {/* ── POKÉDEX (grade para capturar) ──────────────────────── */}
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>📖 POKÉDEX</Text>
                <Text style={styles.sectionSub}>Toque para capturar · pokémons capturados ficam coloridos</Text>
                <View style={styles.pokedexGrid}>
                    {allPokemons.map((pokemon) => {
                        const captured = capturedData.some((p) => p.numId === pokemon.numId);
                        const theme = getTypeTheme(pokemon.tipos);
                        return (
                            <TouchableOpacity
                                key={pokemon.numId}
                                style={[
                                    styles.miniCard,
                                    { borderColor: captured ? theme.accent : '#1e1e1e' },
                                    captured && { backgroundColor: theme.bg },
                                ]}
                                onPress={() => !captured && handleCapture(pokemon)}
                                activeOpacity={captured ? 1 : 0.65}
                            >
                                <Image
                                    source={{ uri: pokemon.imagem }}
                                    style={[styles.miniImg, !captured && styles.miniImgGray]}
                                    resizeMode="contain"
                                />
                                <Text
                                    style={[styles.miniName, captured && { color: theme.accent }]}
                                    numberOfLines={1}
                                >
                                    {pokemon.nome.charAt(0).toUpperCase() + pokemon.nome.slice(1)}
                                </Text>
                                <Text style={styles.miniId}>#{pokemon.index}</Text>
                                <View style={styles.miniTypes}>
                                    {pokemon.tipos.map((t) => {
                                        const th = getTypeTheme([t]);
                                        return (
                                            <View key={t} style={[styles.miniTypeBadge, { backgroundColor: th.accent }]}>
                                                <Text style={styles.miniTypeBadgeText}>{getTypeLabel(t)}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                                {captured && (
                                    <View style={styles.capturedCheck}>
                                        <Text style={styles.capturedCheckText}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#080808' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080808', gap: 12 },
    loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
    scrollContent: {
        paddingBottom: 60, paddingTop: 8,
        ...(isWeb ? { maxWidth: 760, alignSelf: 'center' as any, width: '100%' } : {}),
    },

    sectionTitle: {
        color: '#FF6B35', fontSize: 11, fontWeight: '800',
        letterSpacing: 2, textTransform: 'uppercase',
        paddingHorizontal: 16, paddingTop: 12, marginBottom: 2,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    sectionSub: {
        color: 'rgba(255,255,255,0.3)', fontSize: 12,
        paddingHorizontal: 16, marginBottom: 12,
    },

    // Mão de batalha
    teamGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        paddingHorizontal: 16, gap: 10,
        justifyContent: 'center', marginBottom: 6,
    },
    slot: {
        width: isWeb ? 112 : 90, backgroundColor: '#111',
        borderWidth: 1.5, borderRadius: 14,
        alignItems: 'center', padding: 8, gap: 4, position: 'relative',
    },
    slotEmpty: {
        width: isWeb ? 112 : 90, height: isWeb ? 130 : 108,
        backgroundColor: '#111', borderWidth: 1.5, borderColor: '#222',
        borderRadius: 14, borderStyle: 'dashed',
        alignItems: 'center', justifyContent: 'center',
    },
    slotEmptyIcon: { color: '#2a2a2a', fontSize: 28, fontWeight: '900' },
    slotImg: { width: isWeb ? 76 : 60, height: isWeb ? 76 : 60 },
    slotName: { color: '#fff', fontSize: isWeb ? 10 : 9, fontWeight: '700', textAlign: 'center' },
    slotBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
    slotBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
    slotRemoveBtn: {
        position: 'absolute', top: 4, right: 4,
        backgroundColor: 'rgba(255,50,50,0.2)', borderRadius: 99,
        width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    },
    slotRemoveText: { color: '#ff5555', fontSize: 9, fontWeight: '900' },

    // Slot picker
    slotPicker: {
        marginHorizontal: 16, backgroundColor: '#111',
        borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,107,53,0.5)',
        padding: 16, gap: 12, marginBottom: 4,
    },
    slotPickerTitle: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' },
    slotPickerRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
    slotPickerSlot: {
        width: 56, height: 64, backgroundColor: '#1a1a1a',
        borderRadius: 10, borderWidth: 1.5, borderColor: '#333',
        alignItems: 'center', justifyContent: 'center', gap: 2,
    },
    slotPickerImg: { width: 40, height: 40 },
    slotPickerEmpty: { color: '#555', fontSize: 24, fontWeight: '700' },
    slotPickerNum: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '700' },
    slotPickerCancel: { alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 20 },
    slotPickerCancelText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },

    // Capturados
    capturedCard: {
        borderRadius: 14, borderWidth: 1.5,
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 14, gap: 12,
        marginHorizontal: 16, marginTop: 8,
    },
    capturedImg: { width: 68, height: 68, flexShrink: 0 },
    capturedName: { color: '#fff', fontSize: 16, fontWeight: '800' },
    capturedId: { fontSize: 12, fontWeight: '700' },
    typesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    typeBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
    typeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    battleBtn: {
        backgroundColor: 'rgba(255,107,53,0.15)', borderWidth: 1.5, borderColor: '#FF6B35',
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    },
    battleBtnActive: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' },
    battleBtnText: { fontSize: 12, fontWeight: '800' },
    releaseBtn: {
        backgroundColor: 'rgba(139,0,0,0.3)', borderWidth: 1, borderColor: '#8B0000',
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    },
    releaseBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700' },

    // Mini grid pokédex
    emptyWrap: { padding: 28, alignItems: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: 13, lineHeight: 22 },
    pokedexGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        paddingHorizontal: 16, gap: 8,
    },
    miniCard: {
        width: MINI_W, backgroundColor: '#111',
        borderRadius: 12, borderWidth: 1.5,
        alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6, gap: 4,
        position: 'relative',
    },
    miniImg: { width: MINI_W - 20, height: MINI_W - 20 },
    miniImgGray: { opacity: 0.3 },
    miniName: {
        color: 'rgba(255,255,255,0.5)', fontSize: 9,
        fontWeight: '700', textAlign: 'center',
    },
    miniId: { color: '#333', fontSize: 8 },
    miniTypes: { flexDirection: 'row', gap: 3, flexWrap: 'wrap', justifyContent: 'center' },
    miniTypeBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 999 },
    miniTypeBadgeText: { color: '#fff', fontSize: 7, fontWeight: '800' },
    capturedCheck: {
        position: 'absolute', top: 4, right: 4,
        backgroundColor: 'rgba(0,200,0,0.2)', borderRadius: 99,
        width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
    },
    capturedCheckText: { color: '#4caf50', fontSize: 10, fontWeight: '900' },
});
