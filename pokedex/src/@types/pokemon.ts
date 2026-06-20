// Puxando as informações da API Pokemon e foram colocadas no tsconfig
export interface Poder {
    nome: string;
    forca: number;
}

export interface Pokemon {
    index: string;
    nome: string;
    imagem: string;
    tipos: string[];
    poderes: Poder[];
}