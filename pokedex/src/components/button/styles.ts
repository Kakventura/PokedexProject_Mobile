import { Platform, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: isWeb ? 52 : 48,
        backgroundColor: '#FF6B35',
        borderRadius: isWeb ? 12 : 10,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            web: {
                boxShadow: '0 4px 16px rgba(255,107,53,0.4)',
            } as any,
            default: {
                shadowColor: '#FF6B35',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
            },
        }),
    },
    title: {
        color: '#fff',
        fontSize: isWeb ? 14 : 13,
        fontWeight: '800',
        letterSpacing: isWeb ? 2 : 1,
        textTransform: 'uppercase',
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },

    // ── Android — botão Material "filled" (pill, elevação neutra, ripple) ──
    buttonAndroid: {
        width: '100%',
        height: 50,
        backgroundColor: '#FF6B35',
        borderRadius: 25, // formato pill (altura / 2)
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // contém o ripple dentro do formato pill
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    buttonAndroidPressed: {
        elevation: 0,
    },
    buttonAndroidDisabled: {
        backgroundColor: '#5c3a26',
        elevation: 0,
    },
    titleAndroid: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2,
        // Material usa sentence case, não caixa alta com tracking largo
        textTransform: 'none',
    },
});
