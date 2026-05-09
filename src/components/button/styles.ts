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
});
