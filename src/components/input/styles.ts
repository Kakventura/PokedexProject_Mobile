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
});
