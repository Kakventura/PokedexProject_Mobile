import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

import {
    View,
    Text,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Alert } from '@/components/alert';

const isAndroid = Platform.OS === 'android';

export default function Index() {
    const [name, setName] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertData, setAlertData] = useState({
        title: '',
        message: '',
        type: 'error' as 'success' | 'error' | 'warning' | 'info',
    });

    const { signIn, signUp } = useAuth();

    async function handleSubmit() {
        if (!name.trim() || !senha.trim()) {
            setAlertData({
                title: 'Campos obrigatórios',
                message: 'Por favor, preencha o usuário e a senha.',
                type: 'warning',
            });
            setIsAlertVisible(true);
            return;
        }

        setIsLoading(true);
        try {
            if (isRegisterMode) {
                const result = await signUp(name, senha);
                if (result.success) {
                    setAlertData({
                        title: 'Conta criada!',
                        message: 'Cadastro realizado com sucesso. Faça login.',
                        type: 'success',
                    });
                    setIsAlertVisible(true);
                    setIsRegisterMode(false);
                } else {
                    setAlertData({ title: 'Erro', message: result.error ?? 'Erro ao cadastrar.', type: 'error' });
                    setIsAlertVisible(true);
                }
            } else {
                const result = await signIn(name, senha);
                if (result.success) {
                    router.replace('/dashboard');
                } else {
                    setAlertData({ title: 'Acesso negado', message: result.error ?? 'Usuário ou senha incorretos.', type: 'error' });
                    setIsAlertVisible(true);
                }
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                {Platform.OS === 'web' && (
                    <>
                        <View style={styles.orbBlue} />
                        <View style={styles.orbOrange} />
                    </>
                )}

                <View style={styles.header}>
                    <View style={styles.logoRow}>
                        <Text style={{ fontSize: Platform.OS === 'web' ? 28 : 22 }}>⚡</Text>
                        <Text style={styles.logoText}>Pokédex</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        {isRegisterMode
                            ? 'Crie sua conta para começar'
                            : 'Entre com suas credenciais para acessar o sistema'}
                    </Text>
                </View>

                <View style={isAndroid ? styles.cardAndroid : styles.card}>
                    <Text style={isAndroid ? styles.cardTitleAndroid : styles.cardTitle}>
                        {isRegisterMode ? 'Cadastro' : 'Autenticação'}
                    </Text>

                    <View style={styles.fieldGroup}>
                        {!isAndroid && <Text style={styles.label}>Usuário</Text>}
                        <Input
                            label="Usuário"
                            placeholder=""
                            onChangeText={setName}
                            value={name}
                            autoCorrect={false}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        {!isAndroid && <Text style={styles.label}>Senha</Text>}
                        <Input
                            label="Senha"
                            placeholder=""
                            secureTextEntry
                            onChangeText={setSenha}
                            value={senha}
                        />
                    </View>

                    <Button
                        title={isLoading ? 'Aguarde...' : isRegisterMode ? 'Cadastrar' : 'Entrar'}
                        onPress={handleSubmit}
                        style={{ marginTop: 8 }}
                        disabled={isLoading}
                    />

                    {isAndroid ? (
                        <Pressable
                            onPress={() => setIsRegisterMode(!isRegisterMode)}
                            style={styles.switchRowAndroid}
                            android_ripple={{ color: 'rgba(255,107,53,0.15)', borderless: false }}
                        >
                            <Text style={styles.switchTextAndroid}>
                                {isRegisterMode
                                    ? 'Já tem conta? Faça login'
                                    : 'Não tem conta? Cadastre-se'}
                            </Text>
                        </Pressable>
                    ) : (
                        <TouchableOpacity onPress={() => setIsRegisterMode(!isRegisterMode)} style={styles.switchRow}>
                            <Text style={styles.switchText}>
                                {isRegisterMode
                                    ? 'Já tem conta? Faça login'
                                    : 'Não tem conta? Cadastre-se'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            <Alert
                title={alertData.title}
                message={alertData.message}
                type={alertData.type}
                visible={isAlertVisible}
                onClose={() => setIsAlertVisible(false)}
            />
        </KeyboardAvoidingView>
    );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#080808' },
    container: {
        flexGrow: 1,
        backgroundColor: '#080808',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isWeb ? 32 : 24,
        minHeight: '100%' as any,
        gap: 24,
        position: 'relative',
    },
    orbBlue: {
        position: 'absolute', width: 500, height: 500, borderRadius: 250,
        backgroundColor: '#4FC3F7', top: -200, left: -200, opacity: 0.06,
        ...Platform.select({ web: { filter: 'blur(80px)' } as any }),
    },
    orbOrange: {
        position: 'absolute', width: 400, height: 400, borderRadius: 200,
        backgroundColor: '#FF6B35', bottom: -100, right: -150, opacity: 0.06,
        ...Platform.select({ web: { filter: 'blur(80px)' } as any }),
    },
    header: { alignItems: 'center', gap: 8, width: '100%', maxWidth: isWeb ? 440 : undefined },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    logoText: {
        color: '#FFFFFF', fontSize: isWeb ? 22 : 18, fontWeight: '900', letterSpacing: 2,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.4)', fontSize: isWeb ? 13 : 12,
        textAlign: 'center', lineHeight: 20, maxWidth: 300,
    },
    card: {
        width: '100%', maxWidth: isWeb ? 440 : undefined,
        backgroundColor: '#111111', borderRadius: isWeb ? 20 : 16,
        borderWidth: 1.5, borderColor: 'rgba(255,107,53,0.3)',
        padding: isWeb ? 28 : 20, gap: 16,
        ...Platform.select({
            web: { boxShadow: '0 0 40px rgba(255,107,53,0.15), 0 0 80px rgba(0,0,0,0.6)' } as any,
            default: {
                shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
            },
        }),
    },
    cardTitle: {
        color: '#FF6B35', fontSize: isWeb ? 11 : 10, fontWeight: '800',
        letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    fieldGroup: { gap: 6 },
    label: {
        color: 'rgba(255,255,255,0.5)', fontSize: 12,
        fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
    },
    switchRow: { alignItems: 'center', paddingTop: 4 },
    switchText: { color: '#FF6B35', fontSize: 13, fontWeight: '600' },

    // ── Android — Material elevated surface (sem borda neon, elevação neutra) ──
    cardAndroid: {
        width: '100%',
        backgroundColor: '#1C1C1F',
        borderRadius: 28,
        padding: 22,
        gap: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    cardTitleAndroid: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 0,
        textTransform: 'none',
        marginBottom: 2,
    },
    switchRowAndroid: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 20,
    },
    switchTextAndroid: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
});
