import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginApi, register } from "@/integration/apiService";
import { initBattleHandForNewUser } from "@/utils/battleHand";

type AuthContextData = {
    isAuthenticated: boolean;
    user: string | null;
    userId: string | null;
    isLoading: boolean;
    signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            const storageUser = await AsyncStorage.getItem("@Auth:user");
            const storageUserId = await AsyncStorage.getItem("@Auth:userId");
            if (storageUser && storageUserId) {
                setUser(storageUser);
                setUserId(storageUserId);
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        }
        loadStorageData();
    }, []);

    async function signIn(username: string, password: string) {
        try {
            const data = await loginApi(username, password);
            const uid = data.userId;
            const displayName = data.username ?? username;
            setUser(displayName);
            setUserId(uid);
            setIsAuthenticated(true);
            await AsyncStorage.setItem("@Auth:user", displayName);
            await AsyncStorage.setItem("@Auth:userId", uid);
            return { success: true };
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Usuário ou senha incorretos.";
            return { success: false, error: msg };
        }
    }

    async function signUp(username: string, password: string) {
        try {
            const data = await register(username, password);
            const uid = data?.userId;

            if (uid) {
                // Conta nova começa sem nenhum pokémon capturado
                await AsyncStorage.setItem(`@Captured:${uid}`, JSON.stringify([]));
                // Sorteia e registra 5 pokémons aleatórios na mão de batalha (sem capturar nenhum)
                await initBattleHandForNewUser(uid);
            }

            return { success: true };
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? "Erro ao criar conta.";
            return { success: false, error: msg };
        }
    }

    async function signOut() {
        setUser(null);
        setUserId(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem("@Auth:user");
        await AsyncStorage.removeItem("@Auth:userId");
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, userId, signIn, signUp, signOut, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
