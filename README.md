# PokédexLogin 🔴

Projeto Expo + React Native com tela de login autenticada por nome/senha de Pokémon e dashboard com card estilizado ao estilo dark do PokedexLoginApp.

---

## 📁 Estrutura de Pastas

```
pokedex-login/
├── assets/images/            # Ícones e splash (herdados do projeto base)
├── src/
│   ├── app/
│   │   ├── _layout.tsx            # Root layout (AuthProvider + injeção de fontes web)
│   │   ├── (auth)/
│   │   │   └── index.tsx          # Tela de Login
│   │   └── (app)/
│   │       ├── _layout.tsx        # Guard de autenticação
│   │       └── dashboard.tsx      # Tela Dashboard
│   ├── components/
│   │   ├── alert/                 # Alert multiplataforma (web / android / ios)
│   │   ├── button/                # Botão estilizado
│   │   ├── card/                  # Card genérico
│   │   ├── icon/                  # Ícone SVG
│   │   ├── input/                 # Input estilizado (dark theme)
│   │   └── list/                  # Lista com FlatList
│   ├── constants/
│   │   └── colors.ts              # Paleta + cores por tipo de Pokémon
│   ├── context/
│   │   └── AuthContext.tsx        # Contexto de autenticação
│   └── data/
│       └── pokemons.ts            # Dados estáticos dos Pokémons autenticados
├── package.json
├── app.json
├── metro.config.js
└── tsconfig.json
```

---

## 🔐 Credenciais para Teste

| Nome (login)  | Senha           | Tipo(s)          |
|---------------|-----------------|------------------|
| bulbasaur     | venusaur123     | Grass / Poison   |
| charmander    | charizard456    | Fire             |
| squirtle      | blastoise789    | Water            |
| pikachu       | raichu321       | Electric         |
| jigglypuff    | wigglytuff000   | Normal / Fairy   |
| gengar        | haunter666      | Ghost / Poison   |
| snorlax       | munchlax999     | Normal           |
| dragonite     | dratini777      | Dragon / Flying  |

> ⚠️ O nome deve ser escrito em **letras minúsculas** (ex: `pikachu`, não `Pikachu`).

---

## 🚀 Passo a Passo para Inicializar

### Pré-requisitos

- **Node.js** >= 18
- **npm** ou **yarn**
- Para Android: Android Studio + emulador configurado (ou dispositivo físico com Expo Go)
- Para iOS: Xcode (Mac only)

### 1. Instalar dependências

```bash
cd pokedex-login
npm install
```

### 2. Rodar no Web

```bash
npx expo start --web
```

Abrirá automaticamente em `http://localhost:8081` (ou porta disponível).  
Funciona em qualquer navegador moderno.

### 3. Rodar no Android

**Opção A — Expo Go (mais rápido)**
```bash
npx expo start
```
Escaneie o QR Code com o app **Expo Go** (disponível na Play Store).

**Opção B — Emulador Android Studio**
```bash
npx expo start --android
```
O emulador deve estar aberto antes de rodar o comando.

### 4. Rodar no iOS (Mac only)

```bash
npx expo start --ios
```
Requer Xcode instalado. Pode também usar o **Expo Go** no iPhone escaneando o QR.

---

## 🎨 Diferenças entre Web e Android

| Aspecto                   | Web                                      | Android / iOS                          |
|---------------------------|------------------------------------------|----------------------------------------|
| Fonte do título           | `Press Start 2P` (Google Fonts)          | Fonte padrão do sistema (bold)         |
| Orbs decorativos          | Visíveis (blur via CSS `filter`)         | Ocultados (não suportado RN)           |
| Sombra do card            | `box-shadow` (CSS)                       | `elevation` + `shadowColor` (nativo)  |
| Tamanho dos elementos     | Ligeiramente maior (padding, fontes)     | Compacto para tela mobile              |
| Input outline focus       | Borda laranja `#FF6B35` no foco (CSS)    | Padrão nativo                          |
| Glow da imagem Pokémon    | `filter: blur(40px)` CSS                 | Círculo colorido com opacidade         |

---

## 🛠️ Tecnologias

- **Expo SDK 54** + **Expo Router v6**
- **React Native 0.81**
- **TypeScript**
- **AsyncStorage** (persistência de sessão)
- **Platform.select** para diferenciação web/nativo
- Imagens dos Pokémons via CDN estático do PokeAPI (sem chamadas de API dinâmicas)
