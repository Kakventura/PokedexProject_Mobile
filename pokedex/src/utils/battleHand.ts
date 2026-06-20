import AsyncStorage from '@react-native-async-storage/async-storage';

// Quantidade total de pokémons disponíveis na pokédex (gen 1 - mesmo limite usado em getPokemons(151))
export const TOTAL_POKEMONS = 151;

// Quantidade de slots na mão de batalha
export const BATTLE_HAND_SIZE = 5;

// Quantidade de pokémons aleatórios sorteados quando uma conta é criada
export const INITIAL_BATTLE_HAND_SIZE = 5;

function battleHandKey(userId: string) {
    return `@BattleHand:${userId}`;
}

/** Sorteia `count` ids únicos entre 1 e `max` (inclusive). */
export function generateRandomPokemonIds(count: number, max: number = TOTAL_POKEMONS): number[] {
    const ids = new Set<number>();
    const limit = Math.min(count, max);
    while (ids.size < limit) {
        const id = Math.floor(Math.random() * max) + 1;
        ids.add(id);
    }
    return Array.from(ids);
}

/**
 * Inicializa a mão de batalha de uma conta nova com `INITIAL_BATTLE_HAND_SIZE`
 * pokémons aleatórios e persiste esse registro localmente para a conta (userId).
 * Deve ser chamado uma única vez, no momento do cadastro.
 * 
 * O array salvo tem exatamente BATTLE_HAND_SIZE posições.
 * Posições com pokémon = número do id; posições vazias = null.
 */
export async function initBattleHandForNewUser(userId: string): Promise<number[]> {
    const randomIds = generateRandomPokemonIds(INITIAL_BATTLE_HAND_SIZE);
    // Salva como array de tamanho fixo BATTLE_HAND_SIZE, preenchendo com os ids
    const slots: (number | null)[] = Array(BATTLE_HAND_SIZE).fill(null);
    randomIds.slice(0, BATTLE_HAND_SIZE).forEach((id, i) => { slots[i] = id; });
    await AsyncStorage.setItem(battleHandKey(userId), JSON.stringify(slots));
    return randomIds;
}

/**
 * Lê os ids salvos da mão de batalha da conta.
 * Retorna sempre um array de exatamente BATTLE_HAND_SIZE posições,
 * onde cada posição é um número (id do pokémon) ou null (slot vazio).
 * Preserva a posição de cada slot.
 */
export async function getBattleHandIds(userId: string): Promise<(number | null)[]> {
    const stored = await AsyncStorage.getItem(battleHandKey(userId));
    if (!stored) return Array(BATTLE_HAND_SIZE).fill(null);
    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
            // Garante tamanho fixo e normaliza cada elemento
            const slots: (number | null)[] = Array(BATTLE_HAND_SIZE).fill(null);
            parsed.slice(0, BATTLE_HAND_SIZE).forEach((val, i) => {
                if (val === null || val === undefined) {
                    slots[i] = null;
                } else {
                    const n = Number(val);
                    slots[i] = isNaN(n) ? null : n;
                }
            });
            return slots;
        }
    } catch (_e) {
        // ignora dado corrompido
    }
    return Array(BATTLE_HAND_SIZE).fill(null);
}

/** Salva os ids atuais da mão de batalha (um por slot, null = slot vazio). */
export async function saveBattleHandIds(userId: string, ids: (number | null)[]): Promise<void> {
    // Garante sempre BATTLE_HAND_SIZE posições
    const slots: (number | null)[] = Array(BATTLE_HAND_SIZE).fill(null);
    ids.slice(0, BATTLE_HAND_SIZE).forEach((val, i) => { slots[i] = val ?? null; });
    await AsyncStorage.setItem(battleHandKey(userId), JSON.stringify(slots));
}
