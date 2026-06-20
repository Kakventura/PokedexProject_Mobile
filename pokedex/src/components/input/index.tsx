import { useState } from "react";
import { TextInput, TextInputProps, View, Text, Platform } from "react-native"
import { styles } from "./styles";

type Props = TextInputProps & {
    placeholder: string;
    /** Rótulo do campo. No Android é desenhado como label flutuante (Material). */
    label?: string;
}

const isAndroid = Platform.OS === "android";

export function Input({ label, ...rest }: Props) {
    const [focused, setFocused] = useState(false);

    // ── Android: campo estilo Material (filled, com indicador inferior) ──
    if (isAndroid) {
        return (
            <View
                style={[
                    styles.fieldAndroid,
                    focused && styles.fieldAndroidFocused,
                ]}
            >
                {!!label && (
                    <Text style={[styles.labelAndroid, focused && styles.labelAndroidFocused]}>
                        {label}
                    </Text>
                )}
                <TextInput
                    style={styles.inputAndroid}
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    {...rest}
                    onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
                />
                <View style={[styles.indicatorAndroid, focused && styles.indicatorAndroidFocused]} />
            </View>
        );
    }

    // ── iOS / Web: campo padrão (caixa com borda) ──
    return (
        <TextInput
            style={styles.input}
            {...rest}
        />
    )
}
