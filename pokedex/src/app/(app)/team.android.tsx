/**
 * team.android.tsx
 * Design exclusivo para Android — Material Design 3 com estilo Pokémon escuro.
 * Este arquivo é carregado APENAS no Android pelo bundler do Expo/Metro.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, Platform, Image,
    TouchableOpacity, ActivityIndicator,
    Animated, Dimensions, ScrollView,
    LayoutAnimation, UIManager, StatusBar,
    Modal, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { getPokemons } from '@/integration/pokemonIntegration';
import { getCaptured, addCaptured, removeCaptured } from '@/integration/apiService';
import { getTypeTheme, getTypeLabel } from '@/constants/colors';
import { Pokemon } from '@/@types/pokemon';
import { getBattleHandIds, saveBattleHandIds } from '@/utils/battleHand';

if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BATTLE_SLOTS = 5;
const W = Dimensions.get('window').width;
const MINI_COLS = 3;
const MINI_W = Math.floor((W - 48) / MINI_COLS);

type PokemonEx = Pokemon & { numId: number };

// ─── Chip de tipo estilo Material ────────────────────────────────────────────
function TypeChip({ type }: { type: string }) {
    const th = getTypeTheme([type]);
    return (
        <View style={[chipStyles.chip, { backgroundColor: th.accent + '33', borderColor: th.accent + '88' }]}>
            <View style={[chipStyles.dot, { backgroundColor: th.accent }]} />
            <Text style={[chipStyles.text, { color: th.accent }]}>{getTypeLabel(type)}</Text>
        </View>
    );
}

const chipStyles = StyleSheet.create({
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, borderWidth: 1,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});

// ─── Slot da Mão de Batalha (estilo Card Material) ────────────────────────────
function BattleSlot({ pokemon, index, onRemove }: { pokemon: PokemonEx | null; index: number; onRemove?: () => void }) {
    const theme = pokemon ? getTypeTheme(pokemon.tipos) : null;
    const pressAnim = useRef(new Animated.Value(1)).current;

    function handlePress() {
        if (!onRemove) return;
        Animated.sequence([
            Animated.timing(pressAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
            Animated.timing(pressAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start(() => onRemove());
    }

    if (!pokemon || !theme) {
        return (
            <View style={slotStyles.empty}>
                <Text style={slotStyles.emptyNum}>{index + 1}</Text>
                <Text style={slotStyles.emptyIcon}>◯</Text>
                <Text style={slotStyles.emptyLabel}>Vazio</Text>
            </View>
        );
    }

    return (
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
            <TouchableOpacity
                style={[slotStyles.filled, { backgroundColor: theme.bg, borderColor: theme.accent }]}
                onPress={handlePress}
                activeOpacity={0.85}
            >
                {/* Número do slot */}
                <View style={[slotStyles.numBadge, { backgroundColor: theme.accent }]}>
                    <Text style={slotStyles.numText}>{index + 1}</Text>
                </View>
                <Image source={{ uri: pokemon.imagem }} style={slotStyles.img} resizeMode="contain" />
                <Text style={slotStyles.name} numberOfLines={1}>
                    {pokemon.nome.charAt(0).toUpperCase() + pokemon.nome.slice(1)}
                </Text>
                <TypeChip type={pokemon.tipos[0]} />
                {/* Indicador de remover */}
                <Text style={[slotStyles.removeHint, { color: theme.accent + '88' }]}>Toque p/ remover</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const slotStyles = StyleSheet.create({
    empty: {
        width: (W - 48) / 3 - 4,
        backgroundColor: '#16161e', borderRadius: 16,
        borderWidth: 1.5, borderColor: '#2a2a3a', borderStyle: 'dashed',
        alignItems: 'center', paddingVertical: 14, gap: 4,
    },
    emptyNum: { color: '#3a3a4a', fontSize: 10, fontWeight: '700' },
    emptyIcon: { color: '#2a2a3a', fontSize: 22 },
    emptyLabel: { color: '#2a2a3a', fontSize: 9, fontWeight: '600' },
    filled: {
        width: (W - 48) / 3 - 4,
        borderRadius: 16, borderWidth: 1.5,
        alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6, gap: 4,
        position: 'relative',
    },
    numBadge: {
        position: 'absolute', top: -8, left: 8,
        width: 20, height: 20, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    numText: { color: '#fff', fontSize: 10, fontWeight: '900' },
    img: { width: 64, height: 64 },
    name: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center' },
    removeHint: { fontSize: 7, fontWeight: '500', marginTop: 2 },
});

// ─── Card do pokémon capturado (Material Card elevado) ────────────────────────
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
    const ripple = useRef(new Animated.Value(0)).current;

    function handleBattle() {
        Animated.sequence([
            Animated.timing(ripple, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(ripple, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start(() => onAddToBattle(pokemon));
    }

    const cardBg = ripple.interpolate({ inputRange: [0, 1], outputRange: [theme.bg, theme.accent + '22'] });

    return (
        <Animated.View style={[cardStyles.card, { borderLeftColor: theme.accent, backgroundColor: cardBg }]}>
            {/* Faixa colorida lateral */}
            <View style={[cardStyles.stripe, { backgroundColor: theme.accent }]} />

            <Image source={{ uri: pokemon.imagem }} style={cardStyles.img} resizeMode="contain" />

            <View style={cardStyles.info}>
                <View style={cardStyles.nameRow}>
                    <Text style={cardStyles.name}>{name}</Text>
                    <Text style={[cardStyles.id, { color: theme.accent }]}>#{pokemon.index}</Text>
                </View>
                <View style={cardStyles.typesRow}>
                    {pokemon.tipos.map((t) => <TypeChip key={t} type={t} />)}
                </View>

                {/* Botões estilo Material Text/Filled */}
                <View style={cardStyles.actions}>
                    <TouchableOpacity
                        style={[
                            cardStyles.battleBtn,
                            inBattleHand
                                ? [cardStyles.battleBtnActive, { backgroundColor: theme.accent + '22', borderColor: theme.accent }]
                                : { backgroundColor: theme.accent, borderColor: theme.accent },
                        ]}
                        onPress={handleBattle}
                    >
                        <Text style={[cardStyles.battleBtnText, inBattleHand && { color: theme.accent }]}>
                            {inBattleHand ? '⚔ Na mão' : '+ Batalha'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={cardStyles.releaseBtn} onPress={onRelease}>
                        <Text style={cardStyles.releaseBtnText}>Soltar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}

const cardStyles = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 16, marginTop: 10,
        borderRadius: 16, overflow: 'hidden',
        borderWidth: 0,
        // Sombra Android (elevation)
        elevation: 4,
    },
    stripe: { width: 4, alignSelf: 'stretch' },
    img: { width: 80, height: 80, marginLeft: 8, flexShrink: 0 },
    info: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, gap: 6 },
    nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    name: { color: '#fff', fontSize: 17, fontWeight: '800' },
    id: { fontSize: 12, fontWeight: '700' },
    typesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
    battleBtn: {
        paddingHorizontal: 14, paddingVertical: 7,
        borderRadius: 20, borderWidth: 1.5,
    },
    battleBtnActive: {},
    battleBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
    releaseBtn: {
        paddingHorizontal: 14, paddingVertical: 7,
        borderRadius: 20, borderWidth: 1.5,
        borderColor: '#3a1a1a', backgroundColor: '#1a0808',
    },
    releaseBtnText: { color: '#EF5350', fontWeight: '700', fontSize: 12 },
});

// ─── Bottom Sheet estilo Android para picker de slot ─────────────────────────
function SlotPickerSheet({
    visible, pokemon, battleHand, onSelect, onDismiss,
}: {
    visible: boolean;
    pokemon: PokemonEx | null;
    battleHand: (PokemonEx | null)[];
    onSelect: (i: number) => void;
    onDismiss: () => void;
}) {
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
        } else {
            Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start();
        }
    }, [visible]);

    if (!pokemon) return null;
    const theme = getTypeTheme(pokemon.tipos);

    return (
        <Modal transparent visible={visible} onRequestClose={onDismiss} animationType="none">
            <Pressable style={sheetStyles.backdrop} onPress={onDismiss} />
            <Animated.View style={[sheetStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                {/* Handle bar */}
                <View style={sheetStyles.handle} />

                <Text style={sheetStyles.title}>Escolher slot</Text>
                <Text style={sheetStyles.subtitle}>
                    Para{' '}
                    <Text style={{ color: theme.accent, fontWeight: '800' }}>
                        {pokemon.nome.charAt(0).toUpperCase() + pokemon.nome.slice(1)}
                    </Text>
                </Text>

                <View style={sheetStyles.slotsRow}>
                    {battleHand.map((p, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[
                                sheetStyles.slotBtn,
                                p && { borderColor: getTypeTheme(p.tipos).accent + '99' },
                            ]}
                            onPress={() => onSelect(i)}
                        >
                            {p ? (
                                <>
                                    <Image source={{ uri: p.imagem }} style={sheetStyles.slotImg} resizeMode="contain" />
                                    <Text style={sheetStyles.slotLabel} numberOfLines={1}>
                                        {p.nome.charAt(0).toUpperCase() + p.nome.slice(1)}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text style={sheetStyles.slotEmpty}>+</Text>
                                    <Text style={sheetStyles.slotLabel}>Livre</Text>
                                </>
                            )}
                            <View style={[sheetStyles.slotNum, p && { backgroundColor: getTypeTheme(p.tipos).accent }]}>
                                <Text style={sheetStyles.slotNumText}>{i + 1}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={sheetStyles.cancelBtn} onPress={onDismiss}>
                    <Text style={sheetStyles.cancelText}>CANCELAR</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );
}

const sheetStyles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    sheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#1a1a28', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12,
        elevation: 16,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#3a3a55', alignSelf: 'center', marginBottom: 20,
    },
    title: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' },
    subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20 },
    slotsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
    slotBtn: {
        flex: 1, minWidth: (W - 80) / 5,
        backgroundColor: '#12121e', borderRadius: 16, borderWidth: 1.5, borderColor: '#2a2a3a',
        alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, gap: 4, position: 'relative',
    },
    slotImg: { width: 44, height: 44 },
    slotEmpty: { color: '#3a3a55', fontSize: 26, fontWeight: '700', height: 44, textAlignVertical: 'center' },
    slotLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '600', textAlign: 'center' },
    slotNum: {
        position: 'absolute', top: -8, right: 4,
        backgroundColor: '#3a3a55', width: 18, height: 18,
        borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    },
    slotNumText: { color: '#fff', fontSize: 9, fontWeight: '900' },
    cancelBtn: {
        marginTop: 20, paddingVertical: 14, borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    cancelText: { color: '#FF6B35', fontWeight: '800', fontSize: 14, letterSpacing: 1.5 },
});

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function TeamScreen() {
    const { userId } = useAuth();
    const [allPokemons, setAllPokemons] = useState<PokemonEx[]>([]);
    const [capturedData, setCapturedData] = useState<PokemonEx[]>([]);
    const [battleHand, setBattleHand] = useState<(PokemonEx | null)[]>(Array(BATTLE_SLOTS).fill(null));
    const [loading, setLoading] = useState(true);
    const [picking, setPicking] = useState<PokemonEx | null>(null);

    const headerOpacity = useRef(new Animated.Value(0)).current;

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const all = await getPokemons(151);
            const allEx: PokemonEx[] = all.map((p) => ({ ...p, numId: parseInt(p.index) }));
            setAllPokemons(allEx);

            if (userId) {
                const cacheKey = `@Captured:${userId}`;
                const cached = await AsyncStorage.getItem(cacheKey);
                const localIds: number[] = cached ? JSON.parse(cached) : [];
                const apiIds = await getCaptured(userId).catch(() => null);

                let finalIds: number[];
                if (apiIds !== null && apiIds.length > 0) {
                    finalIds = apiIds.map(Number).filter((n) => !isNaN(n));
                    await AsyncStorage.setItem(cacheKey, JSON.stringify(finalIds));
                } else {
                    finalIds = localIds;
                }

                const fetched = finalIds
                    .map((id) => allEx.find((p) => p.numId === id))
                    .filter(Boolean) as PokemonEx[];
                setCapturedData(fetched);

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
            Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        }
    }, [userId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    useEffect(() => {
        if (!loading && userId) {
            saveBattleHandIds(userId, battleHand.map((p) => (p ? p.numId : null)));
        }
    }, [battleHand, userId, loading]);

    function handleAddToBattle(pokemon: PokemonEx) {
        const idx = battleHand.findIndex((p) => p?.numId === pokemon.numId);
        if (idx !== -1) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setBattleHand((prev) => { const n = [...prev]; n[idx] = null; return n; });
            return;
        }
        setPicking(pokemon);
    }

    function assignSlot(slotIdx: number) {
        if (!picking) return;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setBattleHand((prev) => {
            const n = [...prev];
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
        const newCaptured = [...capturedData, pokemon];
        setCapturedData(newCaptured);
        const cacheKey = `@Captured:${userId}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(newCaptured.map((p) => p.numId)));
        try { await addCaptured(userId, pokemon.numId); } catch { }
    }

    async function handleRelease(pokemon: PokemonEx) {
        if (!userId) return;
        const newCaptured = capturedData.filter((p) => p.numId !== pokemon.numId);
        setCapturedData(newCaptured);
        setBattleHand((prev) => prev.map((p) => (p?.numId === pokemon.numId ? null : p)));
        const cacheKey = `@Captured:${userId}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(newCaptured.map((p) => p.numId)));
        try { await removeCaptured(userId, pokemon.numId); } catch { }
    }

    const battleHandIds = new Set(battleHand.filter(Boolean).map((p) => p!.numId));
    const filledSlots = battleHand.filter(Boolean).length;

    if (loading) {
        return (
            <View style={styles.centered}>
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={styles.loadingText}>Carregando time...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.wrapper}>
            <StatusBar backgroundColor="#0d0d18" barStyle="light-content" />

            {/* Header Material fixo */}
            <Animated.View style={[styles.topBar, { opacity: headerOpacity }]}>
                <Text style={styles.topBarTitle}>Meu Time</Text>
                <View style={styles.topBarBadge}>
                    <Text style={styles.topBarBadgeText}>{filledSlots}/5</Text>
                </View>
            </Animated.View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Seção: Mão de Batalha ─────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconWrap}>
                        <Text style={styles.sectionIcon}>⚔</Text>
                    </View>
                    <View>
                        <Text style={styles.sectionTitle}>MÃO DE BATALHA</Text>
                        <Text style={styles.sectionSub}>Selecione até 5 pokémons</Text>
                    </View>
                </View>

                {/* Grid de slots 3+2 */}
                <View style={styles.slotsGrid}>
                    {battleHand.map((p, i) => (
                        <BattleSlot
                            key={i}
                            index={i}
                            pokemon={p}
                            onRemove={p ? () => removeFromSlot(i) : undefined}
                        />
                    ))}
                </View>

                {/* Progresso da mão */}
                <View style={styles.progressWrap}>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                { width: `${(filledSlots / 5) * 100}%` as any },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressLabel}>{filledSlots} de 5 slots preenchidos</Text>
                </View>

                {/* ── Seção: Meus Pokémons ─────────────────────────── */}
                <View style={[styles.sectionHeader, { marginTop: 8 }]}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: '#66BB6A22' }]}>
                        <Text style={styles.sectionIcon}>🎒</Text>
                    </View>
                    <View>
                        <Text style={styles.sectionTitle}>MEUS POKÉMONS</Text>
                        <Text style={styles.sectionSub}>
                            {capturedData.length} capturado{capturedData.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>

                {capturedData.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyTitle}>Nenhum pokémon ainda</Text>
                        <Text style={styles.emptyBody}>
                            Toque em qualquer pokémon na Pokédex abaixo para capturar!
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

                {/* ── Seção: Pokédex ───────────────────────────────── */}
                <View style={[styles.sectionHeader, { marginTop: 8 }]}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: '#4FC3F722' }]}>
                        <Text style={styles.sectionIcon}>📖</Text>
                    </View>
                    <View>
                        <Text style={styles.sectionTitle}>POKÉDEX</Text>
                        <Text style={styles.sectionSub}>Toque para capturar</Text>
                    </View>
                </View>

                <View style={styles.pokedexGrid}>
                    {allPokemons.map((pokemon) => {
                        const captured = capturedData.some((p) => p.numId === pokemon.numId);
                        const theme = getTypeTheme(pokemon.tipos);
                        return (
                            <TouchableOpacity
                                key={pokemon.numId}
                                style={[
                                    styles.miniCard,
                                    captured && { backgroundColor: theme.bg, borderColor: theme.accent + 'aa' },
                                    !captured && { backgroundColor: '#12121e', borderColor: '#1e1e2e' },
                                ]}
                                onPress={() => !captured && handleCapture(pokemon)}
                                activeOpacity={captured ? 1 : 0.7}
                            >
                                <Image
                                    source={{ uri: pokemon.imagem }}
                                    style={[styles.miniImg, !captured && { opacity: 0.25 }]}
                                    resizeMode="contain"
                                />
                                <Text
                                    style={[styles.miniName, captured && { color: theme.accent }]}
                                    numberOfLines={1}
                                >
                                    {pokemon.nome.charAt(0).toUpperCase() + pokemon.nome.slice(1)}
                                </Text>
                                <Text style={[styles.miniId, captured && { color: theme.accent + '66' }]}>
                                    #{pokemon.index}
                                </Text>
                                {captured && (
                                    <View style={[styles.capturedBadge, { backgroundColor: theme.accent }]}>
                                        <Text style={styles.capturedBadgeText}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Bottom Sheet para seleção de slot */}
            <SlotPickerSheet
                visible={!!picking}
                pokemon={picking}
                battleHand={battleHand}
                onSelect={assignSlot}
                onDismiss={() => setPicking(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#0d0d18' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d18' },
    loadingCard: {
        backgroundColor: '#1a1a28', borderRadius: 20, padding: 32,
        alignItems: 'center', gap: 16, elevation: 8,
    },
    loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },

    // Top bar estilo Material 3
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
        backgroundColor: '#0d0d18',
        borderBottomWidth: 1, borderBottomColor: '#1e1e2e',
        elevation: 2,
    },
    topBarTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
    topBarBadge: {
        backgroundColor: '#FF6B35', borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 4,
    },
    topBarBadgeText: { color: '#fff', fontWeight: '900', fontSize: 13 },

    scrollContent: { paddingBottom: 80, paddingTop: 8 },

    // Seção headers com ícone em círculo
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
    },
    sectionIconWrap: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#FF6B3522',
        alignItems: 'center', justifyContent: 'center',
    },
    sectionIcon: { fontSize: 18 },
    sectionTitle: {
        color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1.5,
    },
    sectionSub: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 1 },

    // Grid de slots
    slotsGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        paddingHorizontal: 16, gap: 8,
        justifyContent: 'flex-start',
    },

    // Barra de progresso
    progressWrap: { paddingHorizontal: 16, marginTop: 12, gap: 6 },
    progressBar: {
        height: 4, backgroundColor: '#1e1e2e', borderRadius: 2, overflow: 'hidden',
    },
    progressFill: { height: 4, backgroundColor: '#FF6B35', borderRadius: 2 },
    progressLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center' },

    // Empty state
    emptyCard: {
        marginHorizontal: 16, backgroundColor: '#12121e',
        borderRadius: 20, padding: 28, alignItems: 'center', gap: 8,
        borderWidth: 1, borderColor: '#1e1e2e', elevation: 2,
    },
    emptyIcon: { fontSize: 36, marginBottom: 4 },
    emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
    emptyBody: { color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', lineHeight: 20 },

    // Mini grid pokédex
    pokedexGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        paddingHorizontal: 16, gap: 8,
    },
    miniCard: {
        width: MINI_W, borderRadius: 14, borderWidth: 1.5,
        alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6, gap: 3,
        position: 'relative', elevation: 2,
    },
    miniImg: { width: MINI_W - 22, height: MINI_W - 22 },
    miniName: {
        color: 'rgba(255,255,255,0.35)', fontSize: 9,
        fontWeight: '700', textAlign: 'center',
    },
    miniId: { color: '#2a2a3a', fontSize: 8 },
    capturedBadge: {
        position: 'absolute', top: 5, right: 5,
        width: 18, height: 18, borderRadius: 9,
        alignItems: 'center', justifyContent: 'center',
    },
    capturedBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
});
