/**
 * profile.android.tsx
 * Design exclusivo para Android — Material Design 3 com estilo Pokémon escuro.
 * Este arquivo é carregado APENAS no Android pelo bundler do Expo/Metro.
 */

import { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet,
    ActivityIndicator, TouchableOpacity, ScrollView,
    Animated, StatusBar, Dimensions,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getStats, updateStats, UserStats } from '@/integration/apiService';

const W = Dimensions.get('window').width;

// ─── Cartão de estatística estilo Material 3 ─────────────────────────────────
function StatCard({ label, value, accent, icon }: {
    label: string;
    value: string;
    accent: string;
    icon: string;
}) {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                statStyles.card,
                { borderColor: accent + '44', transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
        >
            {/* Fundo com gradiente simulado */}
            <View style={[statStyles.iconCircle, { backgroundColor: accent + '22' }]}>
                <Text style={statStyles.icon}>{icon}</Text>
            </View>
            <Text style={[statStyles.value, { color: accent }]}>{value}</Text>
            <Text style={statStyles.label}>{label}</Text>
            {/* Linha de destaque na base */}
            <View style={[statStyles.baseLine, { backgroundColor: accent }]} />
        </Animated.View>
    );
}

const statStyles = StyleSheet.create({
    card: {
        flex: 1, backgroundColor: '#12121e',
        borderRadius: 20, borderWidth: 1.5,
        alignItems: 'center', paddingVertical: 20, paddingHorizontal: 8,
        gap: 6, position: 'relative', overflow: 'hidden',
        elevation: 4,
    },
    iconCircle: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center', marginBottom: 2,
    },
    icon: { fontSize: 20 },
    value: { fontSize: 32, fontWeight: '900' },
    label: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    },
    baseLine: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
    },
});

// ─── Barra de XP animada ─────────────────────────────────────────────────────
function XPBar({ progress, xp, xpNeeded }: { progress: number; xp: number; xpNeeded: number }) {
    const widthAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: progress, duration: 900, useNativeDriver: false,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
            ])
        ).start();
    }, [progress]);

    const barWidth = widthAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={xpStyles.wrap}>
            <View style={xpStyles.labelRow}>
                <Text style={xpStyles.label}>✨ EXPERIÊNCIA</Text>
                <Text style={xpStyles.value}>{xp} / {xpNeeded} XP</Text>
            </View>
            <View style={xpStyles.track}>
                <Animated.View style={[xpStyles.fill, { width: barWidth as any }]}>
                    <Animated.View style={[xpStyles.glow, { opacity: glowAnim }]} />
                </Animated.View>
            </View>
            <Text style={xpStyles.hint}>
                {Math.round(progress * 100)}% para o próximo nível
            </Text>
        </View>
    );
}

const xpStyles = StyleSheet.create({
    wrap: { paddingHorizontal: 16, marginBottom: 24, gap: 8 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
    value: { color: '#FF6B35', fontSize: 12, fontWeight: '700' },
    track: {
        height: 12, backgroundColor: '#1e1e2e',
        borderRadius: 6, overflow: 'hidden',
    },
    fill: {
        height: 12, backgroundColor: '#FF6B35', borderRadius: 6,
        overflow: 'hidden', position: 'relative',
    },
    glow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,200,150,0.4)',
    },
    hint: { color: 'rgba(255,255,255,0.25)', fontSize: 11, textAlign: 'center' },
});

// ─── Botão de batalha estilo FAB estendido ────────────────────────────────────
function BattleButton({
    label, sublabel, accent, onPress, disabled,
}: {
    label: string;
    sublabel: string;
    accent: string;
    onPress: () => void;
    disabled: boolean;
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    function handlePress() {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start(() => onPress());
    }

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
            <TouchableOpacity
                style={[
                    battleBtnStyles.btn,
                    { backgroundColor: accent + '18', borderColor: accent + '88' },
                ]}
                onPress={handlePress}
                disabled={disabled}
                activeOpacity={0.85}
            >
                <Text style={battleBtnStyles.label}>{label}</Text>
                <Text style={[battleBtnStyles.sub, { color: accent }]}>{sublabel}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const battleBtnStyles = StyleSheet.create({
    btn: {
        borderRadius: 20, borderWidth: 1.5,
        paddingVertical: 18, alignItems: 'center', gap: 4,
        elevation: 2,
    },
    label: { color: '#fff', fontSize: 22, fontWeight: '900' },
    sub: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
});

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function ProfileScreen() {
    const { user, userId, signOut } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Animação do avatar
    const avatarScale = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        getStats(userId)
            .then(setStats)
            .catch(() => {
                setStats({ userId: userId!, level: '1', vitorias: '0', derrotas: '0' });
            })
            .finally(() => {
                setLoading(false);
                // Anima entrada do conteúdo
                Animated.parallel([
                    Animated.spring(avatarScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
                    Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
                ]).start();
            });
    }, [userId]);

    const vitorias = parseInt(stats?.vitorias ?? '0');
    const derrotas = parseInt(stats?.derrotas ?? '0');
    const total = vitorias + derrotas;
    const winrate = total === 0 ? 0 : Math.round((vitorias / total) * 100);
    const level = parseInt(stats?.level ?? '1');
    const xp = vitorias * 120;
    const xpNeeded = level * 500;
    const xpProgress = Math.min(xp / xpNeeded, 1);

    const firstLetter = (user ?? '?').charAt(0).toUpperCase();

    async function handleSimulateBattle(win: boolean) {
        if (!userId || !stats) return;
        setSaving(true);
        setError('');
        try {
            const newVitorias = win ? String(vitorias + 1) : stats.vitorias;
            const newDerrotas = !win ? String(derrotas + 1) : stats.derrotas;
            const totalV = parseInt(newVitorias);
            const newLevel = String(Math.max(1, Math.floor(totalV / 5) + 1));
            const updated = await updateStats(userId, { level: newLevel, vitorias: newVitorias, derrotas: newDerrotas });
            setStats(updated);
        } catch {
            setError('Erro ao salvar resultado.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={styles.loadingText}>Carregando perfil...</Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.wrapper} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <StatusBar backgroundColor="#0d0d18" barStyle="light-content" />

            {/* ── Hero Section com avatar ─────────────────────────── */}
            <View style={styles.hero}>
                {/* Fundo decorativo do hero */}
                <View style={styles.heroBgDecor} />

                {/* Top bar Material */}
                <View style={styles.topBar}>
                    <Text style={styles.topBarTitle}>Perfil</Text>
                </View>

                {/* Avatar com anel e animação */}
                <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarScale }] }]}>
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{firstLetter}</Text>
                        </View>
                    </View>
                    {/* Indicador de nível flutuante */}
                    <View style={styles.levelFloating}>
                        <Text style={styles.levelFloatingText}>NV{stats?.level ?? '1'}</Text>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: contentOpacity, alignItems: 'center', gap: 6 }}>
                    <Text style={styles.userName}>{user}</Text>
                    <Text style={styles.userSub}>Treinador Pokémon</Text>
                </Animated.View>
            </View>

            {/* ── Conteúdo principal ─────────────────────────────── */}
            <Animated.View style={[styles.content, { opacity: contentOpacity }]}>

                {/* Barra de XP */}
                <XPBar progress={xpProgress} xp={xp} xpNeeded={xpNeeded} />

                {/* Stats em cards Material */}
                <View style={styles.statsRow}>
                    <StatCard label="VITÓRIAS" value={String(vitorias)} accent="#66BB6A" icon="🏆" />
                    <StatCard label="DERROTAS" value={String(derrotas)} accent="#EF5350" icon="💀" />
                    <StatCard label="WINRATE" value={`${winrate}%`} accent="#FFD600" icon="⚡" />
                </View>

                {/* ── Simular Batalha ──────────────────────────── */}
                <View style={styles.battleSection}>
                    <View style={styles.battleSectionHeader}>
                        <View style={styles.battleSectionIcon}>
                            <Text>⚔️</Text>
                        </View>
                        <View>
                            <Text style={styles.battleSectionTitle}>SIMULAR BATALHA</Text>
                            <Text style={styles.battleSectionSub}>Registre o resultado</Text>
                        </View>
                    </View>

                    <View style={styles.battleRow}>
                        <BattleButton
                            label="✅"
                            sublabel="VENCEU"
                            accent="#66BB6A"
                            onPress={() => handleSimulateBattle(true)}
                            disabled={saving}
                        />
                        <BattleButton
                            label="❌"
                            sublabel="PERDEU"
                            accent="#EF5350"
                            onPress={() => handleSimulateBattle(false)}
                            disabled={saving}
                        />
                    </View>

                    {saving && (
                        <View style={styles.savingRow}>
                            <ActivityIndicator size="small" color="#FF6B35" />
                            <Text style={styles.savingText}>Salvando...</Text>
                        </View>
                    )}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                {/* ── Conquistas (placeholder decorativo) ─────────── */}
                <View style={styles.achievementsSection}>
                    <Text style={styles.achievementsTitle}>🏅 CONQUISTAS</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                        {[
                            { icon: '🎯', label: 'Primeiro catch', unlocked: total >= 1 },
                            { icon: '⚔', label: '1ª vitória', unlocked: vitorias >= 1 },
                            { icon: '🔥', label: '5 vitórias', unlocked: vitorias >= 5 },
                            { icon: '💎', label: 'Nível 5+', unlocked: level >= 5 },
                            { icon: '👑', label: '10 vitórias', unlocked: vitorias >= 10 },
                        ].map((a, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.achievementChip,
                                    a.unlocked
                                        ? { backgroundColor: '#FF6B3522', borderColor: '#FF6B3566' }
                                        : { backgroundColor: '#12121e', borderColor: '#1e1e2e' },
                                ]}
                            >
                                <Text style={[styles.achievementIcon, !a.unlocked && { opacity: 0.2 }]}>
                                    {a.icon}
                                </Text>
                                <Text style={[styles.achievementLabel, a.unlocked && { color: '#FF6B35' }]}>
                                    {a.label}
                                </Text>
                                {!a.unlocked && (
                                    <Text style={styles.achievementLock}>🔒</Text>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* ── Botão sair ─────────────────────────────────── */}
                <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.7}>
                    <Text style={styles.signOutIcon}>↩</Text>
                    <Text style={styles.signOutText}>Sair da conta</Text>
                </TouchableOpacity>

            </Animated.View>
        </ScrollView>
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
    scrollContent: { paddingBottom: 60 },

    // Hero
    hero: {
        backgroundColor: '#12121e',
        paddingBottom: 32,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 8,
        overflow: 'hidden',
    },
    heroBgDecor: {
        position: 'absolute',
        width: W * 1.5, height: W * 1.5,
        borderRadius: W * 0.75,
        backgroundColor: '#FF6B3508',
        top: -W * 0.9,
        alignSelf: 'center',
    },
    topBar: {
        alignSelf: 'stretch',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    },
    topBarTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },

    avatarWrap: {
        marginBottom: 16, position: 'relative',
    },
    avatarRing: {
        padding: 4,
        borderRadius: 56,
        borderWidth: 2,
        borderColor: '#FF6B35',
        // Efeito de borda dupla
        shadowColor: '#FF6B35',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    avatar: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: '#FF6B35',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 48, fontWeight: '900' },
    levelFloating: {
        position: 'absolute', bottom: -8, right: -8,
        backgroundColor: '#FFD600',
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 12, elevation: 4,
        borderWidth: 2, borderColor: '#0d0d18',
    },
    levelFloatingText: { color: '#000', fontWeight: '900', fontSize: 11 },

    userName: { color: '#fff', fontSize: 26, fontWeight: '900' },
    userSub: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },

    content: { paddingTop: 24 },

    // Stats
    statsRow: {
        flexDirection: 'row', gap: 10,
        paddingHorizontal: 16, marginBottom: 24,
    },

    // Batalha
    battleSection: {
        marginHorizontal: 16, backgroundColor: '#12121e',
        borderRadius: 20, padding: 16, gap: 12,
        marginBottom: 20, elevation: 3,
        borderWidth: 1, borderColor: '#1e1e2e',
    },
    battleSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    battleSectionIcon: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#FF6B3522',
        alignItems: 'center', justifyContent: 'center',
    },
    battleSectionTitle: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
    battleSectionSub: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 1 },
    battleRow: { flexDirection: 'row', gap: 12 },
    savingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
    savingText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
    errorText: { color: '#EF5350', fontSize: 13, textAlign: 'center' },

    // Conquistas
    achievementsSection: {
        marginBottom: 20,
    },
    achievementsTitle: {
        color: 'rgba(255,255,255,0.5)', fontSize: 11,
        fontWeight: '800', letterSpacing: 1.5,
        paddingHorizontal: 16, marginBottom: 10,
    },
    achievementsScroll: { paddingLeft: 16 },
    achievementChip: {
        borderRadius: 16, borderWidth: 1.5,
        padding: 14, marginRight: 8, alignItems: 'center', gap: 6,
        minWidth: 90, elevation: 2,
    },
    achievementIcon: { fontSize: 24 },
    achievementLabel: {
        color: 'rgba(255,255,255,0.35)', fontSize: 9,
        fontWeight: '700', textAlign: 'center', letterSpacing: 0.5,
    },
    achievementLock: { fontSize: 12 },

    // Sign out — estilo texto simples Material
    signOutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 24, marginHorizontal: 16,
        borderTopWidth: 1, borderTopColor: '#1e1e2e',
    },
    signOutIcon: { color: 'rgba(255,255,255,0.2)', fontSize: 18 },
    signOutText: {
        color: 'rgba(255,255,255,0.25)', fontSize: 14, fontWeight: '600',
    },
});
