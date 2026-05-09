import {
    View,
    Text,
    StyleSheet,
    Platform,
    Image,
    FlatList,
} from 'react-native';
import { Button } from '@/components/button';
import { useAuth } from '@/context/AuthContext';
import { DASHBOARD_POKEMONS, Pokemon } from '@/data/pokemons';
import { getTypeTheme } from '@/constants/colors';

function PokemonMiniCard({ item }: { item: Pokemon }) {
    const theme = getTypeTheme(item.types);

    return (
        <View style={[styles.card, { borderColor: theme.accent }]}>
            

            {/* Imagem */}
            <View style={styles.imageWrap}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>

            {/* Conteúdo de texto */}
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.pokemonName}>{item.displayName}</Text>
                    <Text style={[styles.pokemonId, { color: theme.accent }]}>#{item.id}</Text>
                </View>

                <View style={styles.typesRow}>
                    {item.types.map((t) => (
                        <View key={t} style={[styles.typeBadge, { backgroundColor: theme.accent }]}>
                            <Text style={styles.typeBadgeText}>{t.toUpperCase()}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.description} numberOfLines={3}>
                    {item.description}
                </Text>
            </View>
        </View>
    );
}

export default function Dashboard() {
    const { user, signOut } = useAuth();

    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.welcomeLabel}>BEM-VINDO,</Text>
                    <Text style={styles.welcomeName}>{user}</Text>
                </View>
                <Button title="Sair" onPress={signOut} style={styles.logoutBtn} />
            </View>

            <Text style={styles.sectionTitle}>Seus Pokémons</Text>

            <FlatList
                data={DASHBOARD_POKEMONS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PokemonMiniCard item={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#080808',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: isWeb ? 28 : 20,
        paddingTop: isWeb ? 28 : 20,
        paddingBottom: 8,
    },
    headerLeft: { gap: 2 },
    welcomeLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: isWeb ? 11 : 10,
        fontWeight: '800',
        letterSpacing: 3,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    welcomeName: {
        color: '#FFFFFF',
        fontSize: isWeb ? 20 : 17,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    logoutBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#FF6B35',
        height: 36,
        width: isWeb ? 100 : 80,
        borderRadius: 20,
    },
    sectionTitle: {
        color: '#FF6B35',
        fontSize: isWeb ? 11 : 10,
        fontWeight: '800',
        letterSpacing: 3,
        textTransform: 'uppercase',
        paddingHorizontal: isWeb ? 28 : 20,
        marginTop: 8,
        marginBottom: 4,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    listContent: {
        paddingHorizontal: isWeb ? 28 : 16,
        paddingBottom: 40,
        paddingTop: 8,
        gap: 14,
        ...(isWeb ? { maxWidth: 600, alignSelf: 'center' as any, width: '100%' } : {}),
    },

    // ── Card ──
    card: {
        backgroundColor: '#111111',
        borderRadius: isWeb ? 18 : 14,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        padding: isWeb ? 16 : 14,
        gap: isWeb ? 16 : 12,
        overflow: 'hidden',
        position: 'relative',
        // Sem shadowColor / elevation / boxShadow — sem reluzente
    },
    bgCircle: {
        position: 'absolute',
        width: 130,
        height: 130,
        borderRadius: 65,
        right: -35,
        top: -35,
        opacity: 0.05,
    },
    imageWrap: {
        width: isWeb ? 86 : 76,
        height: isWeb ? 86 : 76,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    image: {
        width: isWeb ? 82 : 72,
        height: isWeb ? 82 : 72,
    },
    content: {
        flex: 1,
        gap: 6,
        zIndex: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pokemonName: {
        color: '#FFFFFF',
        fontSize: isWeb ? 18 : 16,
        fontWeight: '900',
        letterSpacing: 0.5,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    pokemonId: {
        fontSize: isWeb ? 12 : 11,
        fontWeight: '800',
        opacity: 0.7,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    typesRow: { flexDirection: 'row', gap: 6 },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 999,
    },
    typeBadgeText: {
        color: '#fff',
        fontSize: isWeb ? 10 : 9,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    description: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: isWeb ? 13 : 12,
        lineHeight: isWeb ? 20 : 18,
    },
});
