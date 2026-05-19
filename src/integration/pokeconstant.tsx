import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getPokemon } from '@/integration/pokemonIntegration';
import { Pokemon } from '@/@types/pokemon';

export default function PokemonDetail() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    getPokemon('pikachu') 
      .then(setPokemon)
      .catch((error) => console.error('Erro ao buscar Pokémon', error));
  }, []);

  if (!pokemon) {
    return (
      <View style={styles.loading}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{pokemon.nome}</Text>
      <Text>#{pokemon.index}</Text>
      <Image source={{ uri: pokemon.imagem }} style={styles.image} />
      <Text>Tipos: {pokemon.tipos.join(', ')}</Text>
      {pokemon.poderes.map((p) => (
        <Text key={p.nome}>
          {p.nome}: {p.forca}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { padding: 20 },
  card: { padding: 16 },
  name: { fontSize: 18, fontWeight: '700' },
  image: { width: 120, height: 120 },
});