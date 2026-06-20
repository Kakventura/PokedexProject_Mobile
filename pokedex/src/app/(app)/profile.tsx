import { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, Platform,
    ActivityIndicator, TouchableOpacity, ScrollView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getStats, updateStats, UserStats } from '@/integration/apiService';

const isWeb = Platform.OS === 'web';

function StatBox({ label, value, accent }: { label: string; value: string; accent: string }) {
    return (
        <View style={[styles.statBox, { borderColor: accent }]}>
            <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

export default function ProfileScreen() {
    const { user, userId, signOut } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        getStats(userId)
            .then(setStats)
            .catch(() => {
                setStats({ userId: userId!, level: '1', vitorias: '0', derrotas: '0' });
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const vitorias = parseInt(stats?.vitorias ?? '0');
    const derrotas = parseInt(stats?.derrotas ?? '0');
    const total = vitorias + derrotas;
    const winrate = total === 0 ? 0 : Math.round((vitorias / total) * 100);
    const level = parseInt(stats?.level ?? '1');
    const xp = vitorias * 120;
    const xpNeeded = level * 500;
    const xpProgress = Math.min(xp / xpNeeded, 1);

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
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.wrapper} contentContainerStyle={styles.scrollContent}>

            {/* Header */}
            <Text style={styles.pageTitle}>👤 PERFIL</Text>

            {/* Avatar + nome */}
            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(user ?? '?').charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.userName}>{user}</Text>
                <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>NÍVEL {stats?.level ?? '1'}</Text>
                </View>
            </View>

            {/* Barra de XP */}
            <View style={styles.xpSection}>
                <View style={styles.xpLabelRow}>
                    <Text style={styles.xpLabel}>EXPERIÊNCIA</Text>
                    <Text style={styles.xpValue}>{xp} / {xpNeeded} XP</Text>
                </View>
                <View style={styles.xpBar}>
                    <View style={[styles.xpFill, { width: `${xpProgress * 100}%` as any }]} />
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <StatBox label="VITÓRIAS" value={String(vitorias)} accent="#66BB6A" />
                <StatBox label="DERROTAS" value={String(derrotas)} accent="#EF5350" />
                <StatBox label="WINRATE" value={`${winrate}%`} accent="#FFD600" />
            </View>

            {/* Simular batalha */}
            <Text style={styles.sectionTitle}>SIMULAR BATALHA</Text>
            <Text style={styles.sectionSub}>Registre o resultado de uma batalha:</Text>

            <View style={styles.battleRow}>
                <TouchableOpacity
                    style={[styles.battleBtn, styles.winBtn]}
                    onPress={() => handleSimulateBattle(true)}
                    disabled={saving}
                >
                    <Text style={styles.battleBtnText}>⚔️  VENCEU</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.battleBtn, styles.loseBtn]}
                    onPress={() => handleSimulateBattle(false)}
                    disabled={saving}
                >
                    <Text style={styles.battleBtnText}>💀  PERDEU</Text>
                </TouchableOpacity>
            </View>

            {saving && <ActivityIndicator color="#FF6B35" style={{ marginTop: 10 }} />}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
                <Text style={styles.signOutText}>Sair da conta</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#080808' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080808' },
    scrollContent: {
        paddingBottom: 60,
        ...(isWeb ? { maxWidth: 520, alignSelf: 'center' as any, width: '100%' } : {}),
    },

    pageTitle: {
        color: '#FF6B35', fontSize: 11, fontWeight: '800', letterSpacing: 2,
        paddingHorizontal: 16, paddingTop: 16, marginBottom: 4,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },

    // Avatar
    avatarSection: { alignItems: 'center', paddingVertical: 22, gap: 10 },
    avatar: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 42, fontWeight: '900' },
    userName: { color: '#fff', fontSize: 24, fontWeight: '900' },
    levelBadge: {
        backgroundColor: 'rgba(255,107,53,0.15)', borderWidth: 1.5, borderColor: '#FF6B35',
        borderRadius: 999, paddingHorizontal: 18, paddingVertical: 5,
    },
    levelText: { color: '#FF6B35', fontWeight: '800', fontSize: 11, letterSpacing: 2 },

    // XP
    xpSection: { paddingHorizontal: 16, marginBottom: 20, gap: 7 },
    xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    xpLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    xpValue: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
    xpBar: { height: 8, backgroundColor: '#1a1a1a', borderRadius: 999 },
    xpFill: { height: 8, backgroundColor: '#FF6B35', borderRadius: 999 },

    // Stats
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: 16, marginBottom: 28, gap: 10,
    },
    statBox: {
        flex: 1, backgroundColor: '#111', borderWidth: 1.5, borderRadius: 16,
        alignItems: 'center', paddingVertical: 18, gap: 5,
    },
    statValue: { fontSize: 30, fontWeight: '900' },
    statLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: '800', letterSpacing: 1 },

    // Batalha
    sectionTitle: {
        color: '#FF6B35', fontSize: 11, fontWeight: '800',
        letterSpacing: 2, paddingHorizontal: 16, marginBottom: 4,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    sectionSub: {
        color: 'rgba(255,255,255,0.35)', fontSize: 13,
        paddingHorizontal: 16, marginBottom: 14,
    },
    battleRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 10 },
    battleBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
    winBtn: { backgroundColor: 'rgba(102,187,106,0.15)', borderWidth: 1.5, borderColor: '#66BB6A' },
    loseBtn: { backgroundColor: 'rgba(239,83,80,0.12)', borderWidth: 1.5, borderColor: '#EF5350' },
    battleBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    errorText: { color: '#EF5350', fontSize: 13, textAlign: 'center', marginTop: 4 },

    signOutBtn: { alignItems: 'center', paddingVertical: 30 },
    signOutText: { color: 'rgba(255,255,255,0.25)', fontSize: 14, fontWeight: '600' },
});
