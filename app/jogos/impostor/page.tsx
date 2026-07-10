"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, RotateCcw, Users, VenetianMask } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import ImpostorSetupModal from "@/components/ImpostorSetupModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Fase = "setup" | "revelando" | "debate";

const TEMPO_REVELACAO_MS = 3000;

function RegrasImpostor() {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Cada jogador, na sua vez, dá uma dica curta relacionada à palavra secreta, 
        sem falar a palavra em si. O impostor tenta se disfarçar (ou adivinhar a
        palavra pelas dicas). Depois de uma ou mais rodadas de dicas, todos votam em
        quem acham que é o impostor.
      </p>
      <p className="text-sm text-muted-foreground">
        Se acertarem o impostor, ele revela se conseguiu adivinhar a palavra. Se
        errarem, o impostor vence!
      </p>
    </>
  );
}

export default function Impostor() {
  const [palavras, setPalavras] = useState<string[]>([]);
  const [fase, setFase] = useState<Fase>("setup");
  const [numJogadores, setNumJogadores] = useState(0);
  const [palavraSecreta, setPalavraSecreta] = useState("");
  const [impostorIndex, setImpostorIndex] = useState(-1);
  const [jogadorAtual, setJogadorAtual] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    fetch("/api/palavras-impostor")
      .then((res) => res.json())
      .then((data: string[]) => setPalavras(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao carregar as palavras:", err));
  }, []);

  useEffect(() => {
    if (!revelado) return;
    const timer = setTimeout(() => {
      setRevelado(false);
      setVisto(true);
    }, TEMPO_REVELACAO_MS);
    return () => clearTimeout(timer);
  }, [revelado]);

  function sortear(n: number) {
    const palavra = palavras[Math.floor(Math.random() * palavras.length)] ?? "Palavra";
    const impostor = Math.floor(Math.random() * n);

    setNumJogadores(n);
    setPalavraSecreta(palavra);
    setImpostorIndex(impostor);
    setJogadorAtual(0);
    setRevelado(false);
    setVisto(false);
    setFase("revelando");
  }

  function handleConfirmJogadores(n: number) {
    sortear(n);
  }

  function proximoJogador() {
    if (jogadorAtual + 1 >= numJogadores) {
      setFase("debate");
      return;
    }
    setJogadorAtual((p) => p + 1);
    setRevelado(false);
    setVisto(false);
  }

  function novaPalavra() {
    sortear(numJogadores);
  }

  const ehImpostor = jogadorAtual === impostorIndex;

  return (
    <main className="min-h-screen w-full px-4 py-10">
      {fase === "setup" && <ImpostorSetupModal onConfirm={handleConfirmJogadores} />}

      <div className="mx-auto max-w-md">
        <GameHeader titulo="Impostor" icone={VenetianMask} regras={<RegrasImpostor />} />

        {fase === "revelando" && (
          <div className="mt-10 flex flex-col items-center gap-6">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              <Users className="size-3.5" />
              Jogador {jogadorAtual + 1} de {numJogadores}
            </Badge>

            <div className="carta-container">
              <div className={`carta-inner ${revelado ? "" : "capa-inicial"}`}>
                <div className="carta-front relative">
                  <Card
                    className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border-primary/30 bg-linear-to-br from-card to-background p-8 text-center"
                  >
                    {ehImpostor ? (
                      <>
                        <VenetianMask className="size-14 text-destructive" />
                        <p className="text-2xl font-extrabold text-destructive">
                          Você é o IMPOSTOR
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Você não sabe a palavra secreta. Tente descobrir e não seja pego!
                        </p>
                      </>
                    ) : (
                      <>
                        <Eye className="size-14 text-primary" />
                        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          A palavra secreta é
                        </p>
                        <p className="text-3xl font-extrabold text-primary">{palavraSecreta}</p>
                        <p className="text-sm text-muted-foreground">
                          Dê dicas sem falar a palavra e descubra quem é o impostor.
                        </p>
                      </>
                    )}
                  </Card>
                </div>
                <div className="carta-back">
                  <Card
                    className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-primary/30 bg-linear-to-br from-card to-background p-8 text-center"
                  >
                    <VenetianMask className="size-14 text-primary/60" />
                    <p className="text-lg font-bold text-foreground">
                      Jogador {jogadorAtual + 1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Toque no card para ver seu papel. Não deixe os outros verem!
                    </p>
                  </Card>
                </div>
              </div>
            </div>

            {!visto && !revelado && (
              <Button onClick={() => setRevelado(true)} className="w-full max-w-xs">
                Toque para revelar
              </Button>
            )}

            {revelado && (
              <p className="text-sm text-muted-foreground">
                Memorize! A carta esconde sozinha em alguns segundos...
              </p>
            )}

            {visto && (
              <Button onClick={proximoJogador} className="w-full max-w-xs">
                {jogadorAtual + 1 >= numJogadores ? "Concluir e começar o debate" : "Já vi! Passar o celular"}
              </Button>
            )}
          </div>
        )}

        {fase === "debate" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              Todos já viram seu papel
            </Badge>

            <Card className="w-full gap-3 border-primary/30 p-6 text-left">
              <h2 className="text-center text-xl font-bold text-foreground">Hora do debate!</h2>
              <RegrasImpostor />
            </Card>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button onClick={novaPalavra} className="w-full">
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
