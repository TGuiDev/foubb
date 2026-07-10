"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Drama, Loader2, Medal, RotateCcw, SkipForward, Timer, Trophy } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import MimicaSetupModal, { type Categoria } from "@/components/MimicaSetupModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { embaralhar } from "@/lib/shuffle";

type Fase = "setup" | "carregando" | "intro-turno" | "jogando" | "resumo-turno" | "fim";

function proximaDaFila(fila: string[], banco: string[]): [string | null, string[]] {
  if (fila.length > 0) return [fila[0], fila.slice(1)];
  if (banco.length === 0) return [null, []];
  const nova = embaralhar(banco);
  return [nova[0], nova.slice(1)];
}

function RegrasMimica() {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Na sua vez, você vê uma palavra e precisa representá-la com gestos, sem
        falar nem soletrar. Os outros jogadores tentam adivinhar em voz alta antes
        do tempo acabar.
      </p>
      <p className="text-sm text-muted-foreground">
        Acertou? Toque em "Acertou!" e vai para a próxima palavra. Travou? Toque em
        "Pular" para tentar outra. Quem acertar mais palavras na rodada vence!
      </p>
    </>
  );
}

export default function Mimica() {
  const [fase, setFase] = useState<Fase>("setup");
  const [numJogadores, setNumJogadores] = useState(0);
  const [duracaoRodada, setDuracaoRodada] = useState(60);
  const [categoria, setCategoria] = useState<Categoria>("acoes");
  const [bancoPalavras, setBancoPalavras] = useState<string[]>([]);
  const [fila, setFila] = useState<string[]>([]);
  const [palavraAtual, setPalavraAtual] = useState<string | null>(null);
  const [jogadorAtual, setJogadorAtual] = useState(0);
  const [pontuacoes, setPontuacoes] = useState<number[]>([]);
  const [acertosTurno, setAcertosTurno] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (fase !== "jogando") return;
    if (tempoRestante <= 0) {
      setFase("resumo-turno");
      return;
    }
    const timer = setTimeout(() => setTempoRestante((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [fase, tempoRestante]);

  async function buscarPalavras(cat: Categoria): Promise<string[]> {
    if (cat === "acoes") {
      const res = await fetch("/api/palavras-mimica");
      const data: string[] = await res.json();
      return Array.isArray(data) ? data : [];
    }
    const res = await fetch(`/api/personagens?categoria=${cat}&quantidade=40`);
    const data: { nome: string }[] = await res.json();
    return Array.isArray(data) ? data.map((p) => p.nome) : [];
  }

  async function sortear(n: number, duracao: number, cat: Categoria) {
    setFase("carregando");
    setErro("");
    try {
      const palavras = await buscarPalavras(cat);
      setBancoPalavras(palavras);
      setFila(embaralhar(palavras));
      setNumJogadores(n);
      setDuracaoRodada(duracao);
      setCategoria(cat);
      setPontuacoes(Array(n).fill(0));
      setJogadorAtual(0);
      setFase("intro-turno");
    } catch (err) {
      console.error("Erro ao buscar palavras da mímica:", err);
      setErro("Não foi possível buscar as palavras. Tente novamente.");
      setFase("setup");
    }
  }

  function iniciarTurno() {
    const [primeira, resto] = proximaDaFila(fila, bancoPalavras);
    setPalavraAtual(primeira);
    setFila(resto);
    setAcertosTurno(0);
    setTempoRestante(duracaoRodada);
    setFase("jogando");
  }

  function acertou() {
    setPontuacoes((p) => p.map((v, i) => (i === jogadorAtual ? v + 1 : v)));
    setAcertosTurno((a) => a + 1);
    const [proxima, resto] = proximaDaFila(fila, bancoPalavras);
    setPalavraAtual(proxima);
    setFila(resto);
  }

  function pular() {
    const filaComPulada = palavraAtual ? [...fila, palavraAtual] : fila;
    const [proxima, resto] = proximaDaFila(filaComPulada, bancoPalavras);
    setPalavraAtual(proxima);
    setFila(resto);
  }

  function proximoJogador() {
    if (jogadorAtual + 1 >= numJogadores) {
      setFase("fim");
      return;
    }
    setJogadorAtual((p) => p + 1);
    setFase("intro-turno");
  }

  function novaRodada() {
    sortear(numJogadores, duracaoRodada, categoria);
  }

  const ranking = pontuacoes
    .map((pontos, i) => ({ jogador: i + 1, pontos }))
    .sort((a, b) => b.pontos - a.pontos);

  const medalhas = ["text-yellow-400", "text-zinc-300", "text-amber-700"];

  return (
    <main className="min-h-screen w-full px-4 py-10">
      {fase === "setup" && (
        <MimicaSetupModal onConfirm={(n, d, cat) => sortear(n, d, cat)} />
      )}

      <div className="mx-auto max-w-md">
        <GameHeader titulo="Mímica" icone={Drama} regras={<RegrasMimica />} />

        {erro && <p className="mt-4 text-center text-sm text-destructive">{erro}</p>}

        {fase === "carregando" && (
          <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Preparando as palavras...</p>
          </div>
        )}

        {fase === "intro-turno" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              Jogador {jogadorAtual + 1} de {numJogadores}
            </Badge>

            <Card className="flex w-full flex-col items-center gap-4 border-primary/30 bg-linear-to-br from-card to-background p-8">
              <Drama className="size-14 text-primary" />
              <p className="text-xl font-bold text-foreground">
                Passe o celular para o Jogador {jogadorAtual + 1}
              </p>
              <p className="text-sm text-muted-foreground">
                Você terá {duracaoRodada} segundos para representar o máximo de
                palavras possível, sem falar nada!
              </p>
            </Card>

            <Button onClick={iniciarTurno} className="w-full max-w-xs">
              Estou pronto! Iniciar mímica
            </Button>
          </div>
        )}

        {fase === "jogando" && (
          <div className="mt-8 flex flex-col items-center gap-5">
            <div className="flex w-full items-center justify-between">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                Jogador {jogadorAtual + 1}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 bg-primary/10 px-3 py-1 text-primary"
              >
                <Timer className="size-3.5" />
                {tempoRestante}s
              </Badge>
              <Badge variant="outline" className="border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                {acertosTurno} acertos
              </Badge>
            </div>

            <Card className="flex min-h-52 w-full flex-col items-center justify-center gap-2 border-primary/30 bg-linear-to-br from-card to-background p-8 text-center">
              <p className="text-3xl font-extrabold text-primary">
                {palavraAtual ?? "Sem mais palavras!"}
              </p>
            </Card>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={pular}
                className="h-14 w-full text-base"
                disabled={!palavraAtual}
              >
                <SkipForward className="size-5" />
                Pular
              </Button>
              <Button onClick={acertou} className="h-14 w-full text-base" disabled={!palavraAtual}>
                <Check className="size-5" />
                Acertou!
              </Button>
            </div>
          </div>
        )}

        {fase === "resumo-turno" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              Tempo esgotado!
            </Badge>

            <Card className="flex w-full flex-col items-center gap-3 border-primary/30 p-8">
              <Trophy className="size-12 text-primary" />
              <p className="text-lg font-semibold text-foreground">
                Jogador {jogadorAtual + 1} acertou
              </p>
              <p className="text-4xl font-extrabold text-primary">{acertosTurno}</p>
              <p className="text-sm text-muted-foreground">
                {acertosTurno === 1 ? "palavra" : "palavras"}
              </p>
            </Card>

            <Button onClick={proximoJogador} className="w-full max-w-xs">
              {jogadorAtual + 1 >= numJogadores ? "Ver placar final" : "Próximo jogador"}
            </Button>
          </div>
        )}

        {fase === "fim" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              Fim de jogo!
            </Badge>

            <Card className="w-full gap-3 border-primary/30 p-6">
              <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-foreground">
                <Trophy className="size-5 text-primary" />
                Placar final
              </h2>
              <div className="mt-2 flex flex-col gap-2">
                {ranking.map((r, i) => (
                  <div
                    key={r.jogador}
                    className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/40 px-4 py-2"
                  >
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      {i < 3 ? (
                        <Medal className={`size-4 ${medalhas[i]}`} />
                      ) : (
                        <span className="w-4 text-center text-xs text-muted-foreground">{i + 1}º</span>
                      )}
                      Jogador {r.jogador}
                    </span>
                    <span className="font-bold text-primary">{r.pontos}</span>
                  </div>
                ))}
              </div>
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
