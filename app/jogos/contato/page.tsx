"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Radio, RotateCcw, Sparkles, Users } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import ContatoSetupModal from "@/components/ContatoSetupModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Fase = "setup" | "revelando" | "jogando" | "fim";

function RegrasContato() {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Um jogador guarda a palavra secreta e conta apenas a primeira letra
        para os outros. Os demais tentam adivinhar a palavra pensando em outra
        que comece com essa letra.
      </p>
      <p className="text-sm text-muted-foreground">
        Quando alguém acha que sabe, grita &quot;Contato!&quot;. Todos que
        quiserem tentar contam juntos &quot;1... 2... 3...&quot; e falam sua
        palavra ao mesmo tempo. Se combinarem, o jogador da vez confirma o
        contato.
      </p>
      <p className="text-sm text-muted-foreground">
        O dono da palavra pode gritar &quot;Não é!&quot; antes da contagem
        acabar para cancelar um contato que ele saiba estar errado. A cada
        contato correto, libera-se a próxima letra da dica, até alguém
        acertar a palavra.
      </p>
    </>
  );
}

export default function Contato() {
  const [palavras, setPalavras] = useState<string[]>([]);
  const [fase, setFase] = useState<Fase>("setup");
  const [numJogadores, setNumJogadores] = useState(0);
  const [palavraSecreta, setPalavraSecreta] = useState("");
  const [donoIndex, setDonoIndex] = useState(-1);
  const [letrasReveladas, setLetrasReveladas] = useState(1);
  const [revelado, setRevelado] = useState(false);
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    fetch("/api/palavras-contato")
      .then((res) => res.json())
      .then((data: string[]) => setPalavras(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao carregar as palavras:", err));
  }, []);

  function sortear(n: number) {
    const palavra = palavras[Math.floor(Math.random() * palavras.length)] ?? "Palavra";
    const dono = Math.floor(Math.random() * n);

    setNumJogadores(n);
    setPalavraSecreta(palavra);
    setDonoIndex(dono);
    setLetrasReveladas(1);
    setRevelado(false);
    setVisto(false);
    setFase("revelando");
  }

  function handleConfirmJogadores(n: number) {
    sortear(n);
  }

  function comecarDicas() {
    setFase("jogando");
  }

  function liberarLetra() {
    setLetrasReveladas((p) => Math.min(p + 1, palavraSecreta.length));
  }

  function encerrarRodada() {
    setFase("fim");
  }

  function novaPalavra() {
    sortear(numJogadores);
  }

  const dica = palavraSecreta
    .split("")
    .map((letra, i) => (i < letrasReveladas ? letra.toUpperCase() : "_"))
    .join(" ");

  const todasLetrasReveladas = letrasReveladas >= palavraSecreta.length;

  return (
    <main className="min-h-screen w-full px-4 py-10">
      {fase === "setup" && <ContatoSetupModal onConfirm={handleConfirmJogadores} />}

      <div className="mx-auto max-w-md">
        <GameHeader titulo="Contato" icone={Radio} regras={<RegrasContato />} />

        {fase === "revelando" && (
          <div className="mt-10 flex flex-col items-center gap-6">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              <Users className="size-3.5" />
              Jogador {donoIndex + 1} guarda a palavra
            </Badge>

            <div className="carta-container">
              <div className={`carta-inner ${revelado ? "" : "capa-inicial"}`}>
                <div className="carta-front relative">
                  <Card className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border-primary/30 bg-linear-to-br from-card to-background p-8 text-center">
                    <Eye className="size-14 text-primary" />
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      A palavra secreta é
                    </p>
                    <p className="text-3xl font-extrabold text-primary">{palavraSecreta}</p>
                    <p className="text-sm text-muted-foreground">
                      Conte só a primeira letra para os outros. Guarde bem o resto!
                    </p>
                  </Card>
                </div>
                <div className="carta-back">
                  <Card className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-primary/30 bg-linear-to-br from-card to-background p-8 text-center">
                    <Radio className="size-14 text-primary/60" />
                    <p className="text-lg font-bold text-foreground">
                      Jogador {donoIndex + 1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Toque no card para ver a palavra. Não deixe os outros verem!
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

            {revelado && !visto && (
              <Button onClick={() => setVisto(true)} className="w-full max-w-xs">
                Memorizei a palavra
              </Button>
            )}

            {visto && (
              <Button onClick={comecarDicas} className="w-full max-w-xs">
                Começar as dicas
              </Button>
            )}
          </div>
        )}

        {fase === "jogando" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              {letrasReveladas} de {palavraSecreta.length} letras liberadas
            </Badge>

            <Card className="flex w-full max-w-xs flex-col items-center gap-4 border-primary/30 bg-linear-to-br from-card to-background p-8">
              <p className="text-sm text-muted-foreground">Dica para os outros jogadores</p>
              <p className="text-3xl font-extrabold tracking-widest text-primary">{dica}</p>
            </Card>

            <p className="text-sm text-muted-foreground">
              Só o Jogador {donoIndex + 1} usa os botões abaixo, de acordo com o que
              acontecer na mesa.
            </p>

            <div className="flex w-full flex-col gap-3">
              <Button onClick={liberarLetra} disabled={todasLetrasReveladas} className="w-full">
                <Sparkles className="size-4" />
                Contato válido! Liberar próxima letra
              </Button>
              <Button onClick={encerrarRodada} variant="outline" className="w-full">
                Acertaram a palavra! Encerrar rodada
              </Button>
            </div>
          </div>
        )}

        {fase === "fim" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              Contato dado!
            </Badge>

            <Card className="w-full gap-3 border-primary/30 p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                A palavra era
              </p>
              <p className="text-2xl font-extrabold text-primary">{palavraSecreta}</p>
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
