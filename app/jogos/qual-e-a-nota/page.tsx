"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircleQuestion, RotateCcw, Star, Users } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import NotaSetupModal from "@/components/NotaSetupModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Fase = "setup" | "intro-turno" | "revelando" | "perguntando" | "resumo-turno" | "fim";

const TEMPO_REVELACAO_MS = 3000;

function classificarNota(nota: number) {
  if (nota <= 2) return { emoji: "🗑️", label: "Categoria lixo" };
  if (nota <= 4) return { emoji: "😬", label: "Fraquinho" };
  if (nota <= 6) return { emoji: "😐", label: "Mediano" };
  if (nota <= 8) return { emoji: "😎", label: "Muito bom" };
  return { emoji: "🔥", label: "Impecável!" };
}

function RegrasNota() {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        O jogador da vez recebe, em segredo, uma nota de 0 a 10. Os outros
        inventam categorias na hora (ex: "um personagem!", "uma comida!") e ele
        responde com um exemplo que, na opinião dele, combine com a nota secreta.
      </p>
      <p className="text-sm text-muted-foreground">
        Depois de algumas perguntas, o grupo tenta adivinhar qual era a nota. Aí é
        só revelar e ver quem chegou mais perto!
      </p>
    </>
  );
}

export default function QualEANota() {
  const [fase, setFase] = useState<Fase>("setup");
  const [numJogadores, setNumJogadores] = useState(0);
  const [notas, setNotas] = useState<number[]>([]);
  const [jogadorAtual, setJogadorAtual] = useState(0);
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    if (fase !== "revelando" || !revelado) return;
    const timer = setTimeout(() => {
      setRevelado(false);
      setFase("perguntando");
    }, TEMPO_REVELACAO_MS);
    return () => clearTimeout(timer);
  }, [fase, revelado]);

  function sortear(n: number) {
    const novasNotas = Array.from({ length: n }, () => Math.floor(Math.random() * 11));
    setNumJogadores(n);
    setNotas(novasNotas);
    setJogadorAtual(0);
    setFase("intro-turno");
  }

  function iniciarRevelacao() {
    setRevelado(false);
    setFase("revelando");
  }

  function encerrarTurno() {
    setFase("resumo-turno");
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
    sortear(numJogadores);
  }

  const notaAtual = notas[jogadorAtual];
  const classificacaoAtual = notaAtual !== undefined ? classificarNota(notaAtual) : null;

  return (
    <main className="min-h-screen w-full px-4 py-10">
      {fase === "setup" && <NotaSetupModal onConfirm={sortear} />}

      <div className="mx-auto max-w-md">
        <GameHeader titulo="Qual é a Nota?" icone={Star} regras={<RegrasNota />} />

        {fase === "intro-turno" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              <Users className="size-3.5" />
              Jogador {jogadorAtual + 1} de {numJogadores}
            </Badge>

            <Card className="flex w-full flex-col items-center gap-4 border-primary/30 bg-linear-to-br from-card to-background p-8">
              <Star className="size-14 text-primary" />
              <p className="text-xl font-bold text-foreground">
                Passe o celular para o Jogador {jogadorAtual + 1}
              </p>
              <p className="text-sm text-muted-foreground">
                Você vai receber uma nota secreta de 0 a 10. Não deixe os outros
                verem!
              </p>
            </Card>

            <Button onClick={iniciarRevelacao} className="w-full max-w-xs">
              Estou pronto! Ver minha nota
            </Button>
          </div>
        )}

        {fase === "revelando" && (
          <div className="mt-10 flex flex-col items-center gap-6">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              <Users className="size-3.5" />
              Jogador {jogadorAtual + 1} de {numJogadores}
            </Badge>

            <div className="carta-container">
              <div className={`carta-inner ${revelado ? "" : "capa-inicial"}`}>
                <div className="carta-front relative">
                  <Card className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border-primary/30 bg-linear-to-br from-card to-background p-8 text-center">
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Sua nota secreta é
                    </p>
                    <p className="text-7xl font-extrabold text-primary">{notaAtual}</p>
                    <p className="text-sm text-muted-foreground">
                      Memorize! Quando o grupo perguntar, responda com exemplos que
                      combinem com essa nota.
                    </p>
                  </Card>
                </div>
                <div className="carta-back">
                  <Card className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-primary/30 bg-linear-to-br from-card to-background p-8 text-center">
                    <Star className="size-14 text-primary/60" />
                    <p className="text-lg font-bold text-foreground">
                      Jogador {jogadorAtual + 1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Toque no card para ver sua nota. Não deixe os outros verem!
                    </p>
                  </Card>
                </div>
              </div>
            </div>

            {!revelado && (
              <Button onClick={() => setRevelado(true)} className="w-full max-w-xs">
                Toque para revelar
              </Button>
            )}
            {revelado && (
              <p className="text-sm text-muted-foreground">
                Memorize! A carta esconde sozinha em alguns segundos...
              </p>
            )}
          </div>
        )}

        {fase === "perguntando" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              <Users className="size-3.5" />
              Jogador {jogadorAtual + 1} de {numJogadores}
            </Badge>

            <Card className="flex w-full flex-col items-center gap-3 border-primary/30 bg-linear-to-br from-card to-background p-8">
              <MessageCircleQuestion className="size-10 text-primary" />
              <p className="text-lg font-semibold text-foreground">
                Agora é com o grupo!
              </p>
              <p className="text-sm text-muted-foreground">
                Gritem categorias à vontade (ex: "um personagem!", "uma comida!")
                e deixem o Jogador {jogadorAtual + 1} responder de acordo com a
                nota secreta. Perguntem quantas vezes quiser.
              </p>
            </Card>

            <Button onClick={encerrarTurno} className="w-full max-w-xs">
              Revelar nota
            </Button>
          </div>
        )}

        {fase === "resumo-turno" && classificacaoAtual && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              Nota revelada!
            </Badge>

            <Card className="flex w-full flex-col items-center gap-3 border-primary/30 p-8">
              <p className="text-lg font-semibold text-foreground">
                A nota do Jogador {jogadorAtual + 1} era
              </p>
              <p className="text-6xl font-extrabold text-primary">{notaAtual}</p>
              <p className="text-lg text-muted-foreground">
                {classificacaoAtual.emoji} {classificacaoAtual.label}
              </p>
            </Card>

            <Button onClick={proximoJogador} className="w-full max-w-xs">
              {jogadorAtual + 1 >= numJogadores ? "Ver resumo final" : "Próximo jogador"}
            </Button>
          </div>
        )}

        {fase === "fim" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              Fim de rodada!
            </Badge>

            <Card className="w-full gap-3 border-primary/30 p-6">
              <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-foreground">
                <Star className="size-5 text-primary" />
                Resumo das notas
              </h2>
              <div className="mt-2 flex flex-col gap-2">
                {notas.map((nota, i) => {
                  const c = classificarNota(nota);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/40 px-4 py-2"
                    >
                      <span className="font-semibold text-foreground">Jogador {i + 1}</span>
                      <span className="flex items-center gap-2 font-bold text-primary">
                        {nota} {c.emoji}
                      </span>
                    </div>
                  );
                })}
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
