import { Platform, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
    input: {
        width: '100%',
        height: isWeb ? 52 : 48,
        borderRadius: isWeb ? 12 : 10,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 14,
        fontSize: isWeb ? 15 : 14,
        color: '#FFFFFF',
        ...Platform.select({
            web: {
                outlineColor: '#FF6B35',
            } as any,
        }),
    },

    // ── Android — Material filled text field ──────────────────────────
    // Caixa preenchida com cantos arredondados só no topo e uma barra
    // indicadora na base, que engrossa e fica laranja quando em foco.
    fieldAndroid: {
        width: '100%',
        backgroundColor: '#252528',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        paddingTop: 18,
        paddingHorizontal: 14,
        paddingBottom: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    fieldAndroidFocused: {
        backgroundColor: '#2c2c30',
    },
    labelAndroid: {
        position: 'absolute',
        top: 6,
        left: 14,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
        color: 'rgba(255,255,255,0.45)',
    },
    labelAndroidFocused: {
        color: '#FF6B35',
    },
    inputAndroid: {
        height: 30,
        fontSize: 16,
        color: '#FFFFFF',
        padding: 0,
    },
    indicatorAndroid: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    indicatorAndroidFocused: {
        height: 2.5,
        backgroundColor: '#FF6B35',
    },
});
