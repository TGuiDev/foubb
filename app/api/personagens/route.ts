import { NextRequest, NextResponse } from "next/server";
import famosos from "@/data/personagens-famosos.json";
import { embaralhar } from "@/lib/shuffle";

type Personagem = {
  nome: string;
  imagem?: string;
};

const CATEGORIAS = ["famosos", "pokemon", "rickandmorty"] as const;
type Categoria = (typeof CATEGORIAS)[number];

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function buscarFamosos(quantidade: number): Personagem[] {
  return embaralhar(famosos as string[])
    .slice(0, quantidade)
    .map((nome) => ({ nome }));
}

async function buscarPokemon(quantidade: number): Promise<Personagem[]> {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=898", {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) throw new Error("Falha ao buscar PokéAPI");

  const data: { results: { name: string; url: string }[] } = await res.json();
  const sorteados = embaralhar(data.results).slice(0, quantidade);

  return sorteados.map(({ name, url }) => {
    const id = url.split("/").filter(Boolean).pop();
    return {
      nome: capitalizar(name),
      imagem: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    };
  });
}

async function buscarRickAndMorty(quantidade: number): Promise<Personagem[]> {
  const ids = new Set<number>();
  while (ids.size < quantidade) {
    ids.add(Math.floor(Math.random() * 826) + 1);
  }

  const res = await fetch(`https://rickandmortyapi.com/api/character/${[...ids].join(",")}`, {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) throw new Error("Falha ao buscar Rick and Morty API");

  const data = await res.json();
  const lista: { name: string; image: string }[] = Array.isArray(data) ? data : [data];

  return lista.map((c) => ({ nome: c.name, imagem: c.image }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoriaParam = searchParams.get("categoria") ?? "famosos";
  const categoria: Categoria = CATEGORIAS.includes(categoriaParam as Categoria)
    ? (categoriaParam as Categoria)
    : "famosos";
  const quantidade = Math.max(1, Number(searchParams.get("quantidade")) || 10);

  try {
    let personagens: Personagem[];

    if (categoria === "pokemon") {
      personagens = await buscarPokemon(quantidade);
    } else if (categoria === "rickandmorty") {
      personagens = await buscarRickAndMorty(quantidade);
    } else {
      personagens = buscarFamosos(quantidade);
    }

    return NextResponse.json(personagens);
  } catch (err) {
    console.error("Erro ao buscar personagens, usando lista local:", err);
    return NextResponse.json(buscarFamosos(quantidade));
  }
}
