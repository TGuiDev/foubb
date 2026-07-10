"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2, RotateCcw, UserRoundSearch, Users } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import QuemSouEuSetupModal, { type Categoria } from "@/components/QuemSouEuSetupModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Personagem = {
  nome: string;
  imagem?: string;
};

type Fase = "setup" | "carregando" | "jogando" | "fim";

function RegrasQuemSouEu() {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Cada jogador recebe um personagem secreto, mas não pode ver! Segure o
        celular na testa (ou peça para alguém segurar) virado para os outros, sem
        espiar a tela.
      </p>
      <p className="text-sm text-muted-foreground">
        Os outros jogadores enxergam o personagem e o jogador da vez faz perguntas
        de sim ou não para tentar descobrir quem é. Quando acertar, passa a vez
        para o próximo.
      </p>
    </>
  );
}

export default function QuemSouEu() {
  const [fase, setFase] = useState<Fase>("setup");
  const [numJogadores, setNumJogadores] = useState(0);
  const [categoria, setCategoria] = useState<Categoria>("famosos");
  const [personagens, setPersonagens] = useState<Personagem[]>([]);
  const [jogadorAtual, setJogadorAtual] = useState(0);
  const [erro, setErro] = useState("");

  async function sortear(n: number, cat: Categoria) {
    setFase("carregando");
    setErro("");
    try {
      const res = await fetch(`/api/personagens?categoria=${cat}&quantidade=${n}`);
      const data: Personagem[] = await res.json();
      setPersonagens(Array.isArray(data) ? data : []);
      setNumJogadores(n);
      setCategoria(cat);
      setJogadorAtual(0);
      setFase("jogando");
    } catch (err) {
      console.error("Erro ao sortear personagens:", err);
      setErro("Não foi possível buscar os personagens. Tente novamente.");
      setFase("setup");
    }
  }

  function proximoJogador() {
    if (jogadorAtual + 1 >= numJogadores) {
      setFase("fim");
      return;
    }
    setJogadorAtual((p) => p + 1);
  }

  function novaRodada() {
    sortear(numJogadores, categoria);
  }

  const personagemAtual = personagens[jogadorAtual];

  return (
    <main className="min-h-screen w-full px-4 py-10">
      {fase === "setup" && (
        <QuemSouEuSetupModal onConfirm={(n, cat) => sortear(n, cat)} />
      )}

      <div className="mx-auto max-w-md">
        <GameHeader titulo="Quem Sou Eu?" icone={UserRoundSearch} regras={<RegrasQuemSouEu />} />

        {erro && <p className="mt-4 text-center text-sm text-destructive">{erro}</p>}

        {fase === "carregando" && (
          <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Sorteando personagens...</p>
          </div>
        )}

        {fase === "jogando" && personagemAtual && (
          <div className="mt-10 flex flex-col items-center gap-6">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              <Users className="size-3.5" />
              Jogador {jogadorAtual + 1} de {numJogadores}
            </Badge>

            <Card className="flex w-full max-w-xs flex-col items-center gap-4 border-primary/30 bg-linear-to-br from-card to-background p-8 text-center">
              {personagemAtual.imagem && (
                <img
                  src={personagemAtual.imagem}
                  alt="Personagem secreto"
                  className="size-32 rounded-full border-4 border-primary/40 bg-background object-contain p-2"
                />
              )}
              <p className="text-2xl font-extrabold text-primary">{personagemAtual.nome}</p>
              <p className="text-sm font-semibold text-destructive">
                Não deixe o Jogador {jogadorAtual + 1} ver a tela!
              </p>
              <p className="text-sm text-muted-foreground">
                Segure o celular na testa dele(a) e responda perguntas de sim ou não.
              </p>
            </Card>

            <Button onClick={proximoJogador} className="w-full max-w-xs">
              {jogadorAtual + 1 >= numJogadores ? "Concluir" : "Já descobriu! Próximo jogador"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {fase === "fim" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              Todos jogaram!
            </Badge>

            <Card className="w-full gap-3 border-primary/30 p-6 text-left">
              <h2 className="text-center text-xl font-bold text-foreground">Fim de rodada</h2>
              <RegrasQuemSouEu />
            </Card>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button onClick={novaRodada} className="w-full">
                <RotateCcw className="size-4" />
                Nova rodada
              </Button>
              <Button variant="outline" className="w-full" render={<Link href="/" />}>
                Voltar ao menu
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
