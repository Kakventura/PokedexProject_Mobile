export type PokemonType =
  | 'fogo' | 'água' | 'grama' | 'elétrico' | 'psíquico' | 'gelo'
  | 'dragão' | 'trevas' | 'fada' | 'lutador' | 'veneno' | 'terra'
  | 'pedra' | 'inseto' | 'fantasma' | 'aço' | 'voador' | 'normal';

export interface Pokemon {
  id: string;
  displayName: string;
  image: string;
  description: string;
  types: PokemonType[];
  height: string;
  weight: string;
  ability: string;
}

// Credencial única de acesso ao sistema
export const VALID_USER = {
  name: 'Kleber Nunes',
  password: 'kleber123',
};

// 4 Pokémons exibidos no dashboard após login
export const DASHBOARD_POKEMONS: Pokemon[] = [
  {
    id: '025',
    displayName: 'Pikachu',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    description: 'Quando vários se reúnem, sua eletricidade pode causar tempestades de raios.',
    types: ['elétrico'],
    height: '0,4 m',
    weight: '6,0 kg',
    ability: 'Static',
  },
  {
    id: '001',
    displayName: 'Bulbasaur',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    description: 'Uma semente estranha foi plantada em suas costas ao nascer e cresce com ele.',
    types: ['grama', 'veneno'],
    height: '0,7 m',
    weight: '6,9 kg',
    ability: 'Overgrow',
  },
  {
    id: '006',
    displayName: 'Charizard',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    description: 'Cospe fogo intenso o suficiente para derreter pedregulhos. Pode causar incêndios florestais.',
    types: ['fogo', 'voador'],
    height: '1,7 m',
    weight: '90,5 kg',
    ability: 'Blaze',
  },
  {
    id: '039',
    displayName: 'Jigglypuff',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png',
    description: 'Canta uma melodia que adormece qualquer um que a ouça, sem jamais parar de respirar.',
    types: ['normal', 'fada'],
    height: '0,5 m',
    weight: '5,5 kg',
    ability: 'Cute Charm',
  },
];

export function validateLogin(name: string, password: string): boolean {
  return (
    name.trim().toLowerCase() === VALID_USER.name.toLowerCase() &&
    password.trim() === VALID_USER.password
  );
}
