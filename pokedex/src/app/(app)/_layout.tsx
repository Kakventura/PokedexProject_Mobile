import { Tabs, Redirect } from "expo-router";
import { ActivityIndicator, View, Platform, Text } from "react-native";
import { useAuth } from "@/context/AuthContext";

const isAndroid = Platform.OS === "android";

// ── Ícone de aba ────────────────────────────────────────────────────────
// No Android, o item ativo ganha um indicador em pílula atrás do ícone
// (padrão de Navigation Bar do Material 3). Nas outras plataformas o
// ícone fica apenas mais opaco/translúcido quando inativo.
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
    if (isAndroid) {
        return (
            <View
                style={{
                    width: 56, height: 32, borderRadius: 16,
                    alignItems: "center", justifyContent: "center",
                    backgroundColor: focused ? "rgba(255,107,53,0.18)" : "transparent",
                }}
            >
                <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
            </View>
        );
    }
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function AppLayout() {
    const { isAuthenticated, isLoading } = useAuth(); //verifica se está autenticado 

    // Carregamento caso tenha demora na autenticacao
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#080808' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    // Redirecionamento caso não esteja autenticado
    if (!isAuthenticated) {
        return <Redirect href="/" />;
    }

    // Se estiver autenticado, mostra as informações
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: isAndroid ? {
                    // ── Material 3 Navigation Bar: superfície tonal elevada,
                    // sem borda neon, cantos superiores arredondados ──
                    backgroundColor: '#161618',
                    borderTopWidth: 0,
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22,
                    height: 64,
                    paddingTop: 10,
                    paddingBottom: 10,
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                } : {
                    backgroundColor: '#0e0e0e',
                    borderTopColor: 'rgba(255,107,53,0.15)',
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 82 : 62,
                    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
                    paddingTop: 6,
                },
                tabBarActiveTintColor: '#FF6B35',
                tabBarInactiveTintColor: 'rgba(255,255,255,0.25)',
                tabBarLabelStyle: isAndroid ? {
                    fontSize: 11, fontWeight: '600', letterSpacing: 0, marginTop: 2,
                } : {
                    fontSize: 10, fontWeight: '700', letterSpacing: 0.5,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Pokédex',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="📖" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="team"
                options={{
                    title: 'Meu Time',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="⚔️" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
                }}
            />
        </Tabs>
    );
}
