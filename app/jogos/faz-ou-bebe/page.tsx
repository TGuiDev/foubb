"use client";

import { useEffect, useState } from "react";
import { History, Layers } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import PlayerCountModal from "@/components/PlayerCountModal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type HistoricoItem = {
  numero: number;
  texto: string;
};

function RegrasFazOuBebe() {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Na sua vez, toque na carta para virar e revelar um desafio ou uma ordem
        para beber. Cumpra o que a carta manda (ou beba, se recusar) e passe a
        vez para o próximo jogador.
      </p>
      <p className="text-sm text-muted-foreground">
        A cada rodada completa (todos os jogadores já jogaram uma vez), o
        contador de rodada avança. O jogo continua até as cartas acabarem!
      </p>
    </>
  );
}

export default function FazOuBebe() {
  const [remaining, setRemaining] = useState<string[]>([]);
  const [numJogadores, setNumJogadores] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const [cartasViradas, setCartasViradas] = useState(0);
  const [rodadaAtual, setRodadaAtual] = useState(0);
  const [primeiraCartaVirada, setPrimeiraCartaVirada] = useState(false);
  const [flipClass, setFlipClass] = useState("capa-inicial");
  const [cardText, setCardText] = useState("");
  const [cardTextOpacity, setCardTextOpacity] = useState(1);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then((data: string[]) => {
        setRemaining(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Erro ao carregar as cartas:", err));
  }, []);

  function handleConfirmJogadores(n: number) {
    setNumJogadores(n);
    setRodadaAtual(1);
    setShowModal(false);
  }

  function getRandomText() {
    if (numJogadores === 0) return;

    if (remaining.length === 0) {
      setCardText("Não há mais desafios!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * remaining.length);
    const texto = remaining[randomIndex];
    const novaRestante = remaining.slice();
    novaRestante.splice(randomIndex, 1);
    setRemaining(novaRestante);

    const primeiraJogada = !primeiraCartaVirada;
    setPrimeiraCartaVirada(true);

    setFlipClass(primeiraJogada ? "flip-inicial" : "flip");

    setTimeout(() => {
      setCardTextOpacity(0);
    }, 400);

    setTimeout(() => {
      setCardText(texto);
      setCardTextOpacity(1);
    }, 500);

    setTimeout(() => {
      setFlipClass("");
    }, 1000);

    const novo = cartasViradas + 1;
    setCartasViradas(novo);
    setHistorico((h) => [{ numero: novo, texto }, ...h]);
    if (novo % numJogadores === 0) {
      setRodadaAtual((r) => r + 1);
    }
  }

  return (
    <main className="min-h-screen w-full px-4 py-10">
      {showModal && <PlayerCountModal onConfirm={handleConfirmJogadores} />}

      <div className="mx-auto max-w-3xl">
        <GameHeader titulo="Faz Ou Bebe" icone={Layers} regras={<RegrasFazOuBebe />} />

        <div className="mt-8 flex flex-col items-center gap-2">
          {numJogadores > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
                Rodada {rodadaAtual}
              </Badge>
              <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
                Cartas viradas: {cartasViradas}
              </Badge>
            </div>
          )}

          <div id="carta" className="carta-container" onClick={getRandomText}>
            <div className={`carta-inner ${flipClass}`}>
              <div className="carta-front relative">
                <img src="/img/card.png" className="rounded" alt="carta" />
                <div
                  id="card-text"
                  className="text-primary absolute top-0 left-0 w-full h-full flex items-center justify-center px-10 text-center text-xl font-semibold drop-shadow-xl"
                  style={{ opacity: cardTextOpacity }}
                >
                  {cardText.split("\n").map((linha, i) => (
                    <span key={i}>
                      {linha}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
              <div className="carta-back">
                <img src="/img/verso.png" className="rounded" alt="verso" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-2">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-primary">
            <History className="size-5" /> Histórico de cartas
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {historico.map((item) => (
              <Card
                key={item.numero}
                className="max-w-xs min-w-62.5 gap-1 border-primary/30 p-4 text-center wrap-break-word select-none"
              >
                <div className="mb-1 font-semibold text-primary">Carta {item.numero}</div>
                <div className="text-sm text-foreground">
                  {item.texto.split("\n").map((linha, i) => (
                    <span key={i}>
                      {linha}
                      <br />
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
