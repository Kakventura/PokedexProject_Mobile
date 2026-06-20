import { TouchableOpacity, Pressable, Text, TouchableOpacityProps, StyleProp, ViewStyle, Platform } from "react-native"
import { styles } from "./styles";

type Props = TouchableOpacityProps & {
    title: string;
    style?: StyleProp<ViewStyle>;
}

const isAndroid = Platform.OS === "android";

export function Button({ title, style, disabled, onPress }: Props) {
    // ── Android — botão Material "filled", pill-shaped, com ripple nativo ──
    if (isAndroid) {
        return (
            <Pressable
                onPress={onPress}
                disabled={disabled}
                android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
                style={({ pressed }) => [
                    styles.buttonAndroid,
                    disabled && styles.buttonAndroidDisabled,
                    pressed && !disabled && styles.buttonAndroidPressed,
                    style,
                ]}
            >
                <Text style={styles.titleAndroid}>{title}</Text>
            </Pressable>
        );
    }

    // ── iOS / Web — botão padrão ──
    return (
        <TouchableOpacity
            activeOpacity={0.5}
            style={[styles.button, style]}
            disabled={disabled}
            onPress={onPress}
        >
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    )
}
