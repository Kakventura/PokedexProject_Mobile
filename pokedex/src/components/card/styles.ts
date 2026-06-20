import { Platform, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
    card: {
        backgroundColor: '#111111',
        borderRadius: isWeb ? 20 : 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255,107,53,0.25)',
        padding: isWeb ? 24 : 18,
        gap: 14,
        ...Platform.select({
            web: {
                boxShadow: '0 0 40px rgba(255,107,53,0.1), 0 0 80px rgba(0,0,0,0.6)',
            } as any,
            default: {
                shadowColor: '#FF6B35',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 6,
            },
        }),
    },
});
