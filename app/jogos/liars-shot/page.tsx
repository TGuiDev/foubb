"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { Crown, Martini, Spade, Timer, Trophy, Users } from "lucide-react";
import GameHeader from "@/components/GameHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SERVER_URL = process.env.NEXT_PUBLIC_LIARS_SHOT_SERVER_URL ?? "http://localhost:4000";
const SESSION_KEY = "liars-shot:session";

const NOME_CARTA: Record<string, string> = {
  K: "Rei",
  Q: "Dama",
  A: "Ace",
  J: "Coringa",
  C: "Chaos",
};

const IMG_CARTA: Record<string, string> = {
  K: "/liars_shot/king.png",
  Q: "/liars_shot/queen.png",
  A: "/liars_shot/ace.png",
  J: "/liars_shot/joker.png",
  C: "/liars_shot/chaos.png",
};

type YouState = {
  token: string;
  nickname: string;
  seatIndex: number;
  hand: string[];
  shotsTaken: number;
  eliminated: boolean;
  isHost: boolean;
};

type PlayerPublic = {
  token: string;
  nickname: string;
  seatIndex: number;
  connected: boolean;
  cardCount: number;
  shotsTaken: number;
  eliminated: boolean;
  isHost: boolean;
};

type RoundState = {
  tableType: string | null;
  turnOrder: string[];
  currentTurnToken: string | null;
  lastPlay: { playerToken: string | null; cardCount: number; cards: string[]; revealed: boolean };
  lastPlaySeq: number;
  deadlineMs: number | null;
};

type RoundOutcome = { playerToken: string; isLethal: boolean };

type RoundResult = {
  callerToken: string;
  accusedToken: string;
  wasLying: boolean;
  chaosTriggered: boolean;
  outcomes: RoundOutcome[];
  revealedCards: string[];
};

type MesaJogada = { seq: number; playerToken: string; count: number };

const VERSO_CARTA = "/liars_shot/capa.png";
// 6 Reis + 6 Damas + 6 Ases + 4 Coringas + 1 Chaos, igual ao baralho montado no servidor.
const BARALHO_COMPLETO: string[] = [
  ...Array(6).fill("K"),
  ...Array(6).fill("Q"),
  ...Array(6).fill("A"),
  ...Array(3).fill("J"),
  "C",
];

type RoomState = {
  code: string;
  status: "lobby" | "playing" | "ended";
  settings: { maxShots: number };
  hostPlayerToken: string;
  winnerToken: string | null;
  you: YouState | null;
  players: PlayerPublic[];
  round: RoundState | null;
  mustCallLiar: boolean;
};

type Session = { code: string; token: string };

const CARTAS_REGRA: { carta: string; efeito: string }[] = [
  { carta: "K", efeito: "Inocente quando o Rei é a carta da mesa. Do contrário, é mentirosa." },
  { carta: "Q", efeito: "Inocente quando a Dama é a carta da mesa. Do contrário, é mentirosa." },
  { carta: "A", efeito: "Inocente quando o Ás é a carta da mesa. Do contrário, é mentirosa." },
  { carta: "J", efeito: "Sempre inocente, não importa qual seja a carta da mesa." },
  {
    carta: "C",
    efeito:
      "Sempre conta como mentirosa. Se aparecer entre as cartas reveladas no MENTIROSO, todos os jogadores com cartas na mão bebem — exceto o acusado.",
  },
];

function RegrasLiarsShot() {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        A cada rodada, um tipo de carta (Rei, Dama ou Ás) vira a carta da mesa.
        Na sua vez, jogue de 1 a 3 cartas viradas para baixo afirmando que são
        do tipo da mesa, ou grite MENTIROSO para o jogador anterior.
      </p>
      <p className="text-sm text-muted-foreground">
        Se a acusação estiver certa, quem jogou bebe um shot. Se estiver
        errada, quem acusou bebe. Cada shot conta para o limite da sala —
        ao atingi-lo, o jogador está fora. Último de pé vence!
      </p>

      <div className="flex flex-col gap-2">
        {CARTAS_REGRA.map(({ carta, efeito }) => (
          <div key={carta} className="flex items-center gap-3 rounded-lg border border-border p-2">
            <img
              src={IMG_CARTA[carta]}
              alt={NOME_CARTA[carta]}
              className="h-16 w-11 shrink-0 rounded-md border border-border object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">{NOME_CARTA[carta]}</p>
              <p className="text-xs text-muted-foreground">{efeito}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
}

export default function LiarsShot() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [nickname, setNickname] = useState("");
  const [maxShots, setMaxShots] = useState(3);
  const [codigoInput, setCodigoInput] = useState("");

  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  const [agora, setAgora] = useState(Date.now());
  const [ultimoResultado, setUltimoResultado] = useState<string>("");
  const [cartasReveladas, setCartasReveladas] = useState<string[]>([]);
  const [mesaJogada, setMesaJogada] = useState<MesaJogada | null>(null);
  const mesaSeqRef = useRef(0);
  const roomRef = useRef<RoomState | null>(null);
  const [distribuindo, setDistribuindo] = useState(false);
  const statusAnteriorRef = useRef<RoomState["status"] | null>(null);
  const distribuindoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const anexarListeners = useCallback((socket: Socket) => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("room:state", (state: RoomState) => {
      roomRef.current = state;
      setRoom(state);
      setSelecionadas([]);
      const seq = state.round?.lastPlaySeq ?? 0;
      const jogador = state.round?.lastPlay.playerToken ?? null;
      if (jogador && seq !== mesaSeqRef.current) {
        mesaSeqRef.current = seq;
        setMesaJogada({ seq, playerToken: jogador, count: state.round!.lastPlay.cardCount });
        setUltimoResultado("");
        setCartasReveladas([]);
      }
      if (!jogador) {
        mesaSeqRef.current = 0;
      }

      if (statusAnteriorRef.current !== "playing" && state.status === "playing") {
        setDistribuindo(true);
        if (distribuindoTimerRef.current) clearTimeout(distribuindoTimerRef.current);
        distribuindoTimerRef.current = setTimeout(() => setDistribuindo(false), 1600);
      }
      statusAnteriorRef.current = state.status;
    });
    socket.on("room:roundResult", (result: RoundResult) => {
      const jogadores = roomRef.current?.players ?? [];
      const nomeDe = (t: string) => jogadores.find((p) => p.token === t)?.nickname ?? "Jogador";

      let frase: string;
      if (result.chaosTriggered) {
        const letais = result.outcomes.filter((o) => o.isLethal).map((o) => nomeDe(o.playerToken));
        frase = `CHAOS! Todos com cartas na mão bebem, exceto ${nomeDe(result.accusedToken)}.`;
        if (letais.length > 0) frase += ` ${letais.join(", ")} tomou shot de verdade!`;
      } else {
        const consequencia = result.outcomes[0]?.isLethal ? "bebeu um shot!" : "passou sem shot.";
        frase = result.wasLying
          ? `${nomeDe(result.accusedToken)} estava mentindo e ${consequencia}`
          : `${nomeDe(result.accusedToken)} estava dizendo a verdade. ${nomeDe(result.callerToken)} errou a acusação e ${consequencia}`;
      }
      setUltimoResultado(frase);
      setCartasReveladas(result.revealedCards);
    });
  }, []);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ["websocket"], autoConnect: true });
    socketRef.current = socket;
    anexarListeners(socket);

    const session = loadSession();
    if (session) {
      socket.emit(
        "room:join",
        { code: session.code, playerToken: session.token, nickname: "" },
        (res: { code?: string; token?: string; error?: string }) => {
          if (res?.error) {
            saveSession(null);
          } else if (res?.code && res?.token) {
            saveSession({ code: res.code, token: res.token });
          }
          setCarregando(false);
        }
      );
    } else {
      setCarregando(false);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (room?.status !== "playing") return;
    const interval = setInterval(() => setAgora(Date.now()), 500);
    return () => clearInterval(interval);
  }, [room?.status]);

  const criarSala = useCallback(() => {
    const nome = nickname.trim();
    if (!nome) return setErro("Digite um apelido.");
    setErro("");
    socketRef.current?.emit(
      "room:create",
      { nickname: nome, maxShots },
      (res: { code?: string; token?: string; error?: string }) => {
        if (res?.error) return setErro(res.error);
        if (res?.code && res?.token) saveSession({ code: res.code, token: res.token });
      }
    );
  }, [nickname, maxShots]);

  const entrarSala = useCallback(() => {
    const nome = nickname.trim();
    const codigo = codigoInput.trim().toUpperCase();
    if (!nome) return setErro("Digite um apelido.");
    if (!codigo) return setErro("Digite o código da sala.");
    setErro("");
    socketRef.current?.emit(
      "room:join",
      { code: codigo, nickname: nome },
      (res: { code?: string; token?: string; error?: string }) => {
        if (res?.error) return setErro(res.error);
        if (res?.code && res?.token) saveSession({ code: res.code, token: res.token });
      }
    );
  }, [nickname, codigoInput]);

  const iniciarJogo = useCallback(() => {
    setErro("");
    socketRef.current?.emit("room:start", {}, (res: { error?: string }) => {
      if (res?.error) setErro(res.error);
    });
  }, []);

  const jogarCartas = useCallback(() => {
    if (selecionadas.length < 1) return;
    setErro("");
    setUltimoResultado("");
    setCartasReveladas([]);
    socketRef.current?.emit(
      "game:playCards",
      { cardIndexes: selecionadas },
      (res: { error?: string }) => {
        if (res?.error) setErro(res.error);
      }
    );
  }, [selecionadas]);

  const gritarMentiroso = useCallback(() => {
    setErro("");
    socketRef.current?.emit("game:callLiar", {}, (res: { error?: string }) => {
      if (res?.error) setErro(res.error);
    });
  }, []);

  const sairDaSala = useCallback(() => {
    saveSession(null);
    setRoom(null);
    roomRef.current = null;
    mesaSeqRef.current = 0;
    setMesaJogada(null);
    setUltimoResultado("");
    setCartasReveladas([]);
    statusAnteriorRef.current = null;
    setDistribuindo(false);
    socketRef.current?.disconnect();
    socketRef.current = io(SERVER_URL, { transports: ["websocket"] });
    anexarListeners(socketRef.current);
  }, [anexarListeners]);

  const sairDaPartida = useCallback(() => {
    socketRef.current?.emit("game:leave", {}, () => {
      sairDaSala();
    });
  }, [sairDaSala]);

  function toggleCarta(index: number) {
    setSelecionadas((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= 3) return prev;
      return [...prev, index];
    });
  }

  const ehMinhaVez = !!room?.you && room.round?.currentTurnToken === room.you.token;
  const segundosRestantes =
    room?.round?.deadlineMs != null ? Math.max(0, Math.ceil((room.round.deadlineMs - agora) / 1000)) : null;

  return (
    <main className="min-h-screen w-full px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <GameHeader titulo="Liar's Shot" icone={Spade} regras={<RegrasLiarsShot />} />

        {!connected && (
          <p className="mt-6 text-center text-sm text-muted-foreground">Conectando ao servidor...</p>
        )}

        {connected && carregando && (
          <p className="mt-6 text-center text-sm text-muted-foreground">Carregando sala...</p>
        )}

        {connected && !carregando && !room && (
          <div className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nickname">Seu apelido</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Bia"
                maxLength={20}
              />
            </div>

            <Card className="gap-3 border-primary/30 p-5">
              <h2 className="text-lg font-bold text-foreground">Criar sala</h2>
              <div className="flex flex-col gap-2">
                <Label htmlFor="maxShots">Shots até sair do jogo</Label>
                <Input
                  id="maxShots"
                  type="number"
                  min={1}
                  max={10}
                  value={maxShots}
                  onChange={(e) => setMaxShots(Number(e.target.value) || 1)}
                />
              </div>
              <Button onClick={criarSala} className="w-full">
                Criar sala
              </Button>
            </Card>

            <Card className="gap-3 border-primary/30 p-5">
              <h2 className="text-lg font-bold text-foreground">Entrar em uma sala</h2>
              <div className="flex flex-col gap-2">
                <Label htmlFor="codigo">Código da sala</Label>
                <Input
                  id="codigo"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                  placeholder="Ex: ABCD"
                  maxLength={4}
                />
              </div>
              <Button onClick={entrarSala} variant="outline" className="w-full">
                Entrar
              </Button>
            </Card>

            {erro && <p className="text-center text-sm text-destructive">{erro}</p>}
          </div>
        )}

        {room && room.status === "lobby" && (
          <div className="mt-8 flex flex-col items-center gap-6 text-center">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              Código da sala
            </Badge>
            <p className="text-4xl font-extrabold tracking-widest text-foreground">{room.code}</p>
            <p className="text-sm text-muted-foreground">
              Compartilhe esse código para outros jogadores entrarem (2 a 4 jogadores).
            </p>

            <Card className="w-full gap-3 border-primary/30 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Jogadores</h2>
                <Badge variant="secondary">
                  <Users className="size-3.5" />
                  {room.players.length}/4
                </Badge>
              </div>
              <ul className="flex flex-col gap-2 text-left">
                {room.players.map((p) => (
                  <li key={p.token} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      {p.isHost && <Crown className="size-4 text-primary" />}
                      {p.nickname}
                      {!p.connected && <span className="text-xs text-muted-foreground">(desconectado)</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {room.you?.isHost ? (
              <Button onClick={iniciarJogo} disabled={room.players.length < 2} className="w-full">
                Iniciar partida
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Aguardando o host iniciar a partida...</p>
            )}

            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <Button variant="ghost" onClick={sairDaSala} className="text-muted-foreground">
              Sair da sala
            </Button>
          </div>
        )}

        {room && room.status === "playing" && room.you && room.round && distribuindo && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="grid grid-cols-6 gap-2 items-center justify-center text-center ">
              {BARALHO_COMPLETO.map((carta, i) => (
                <img
                  key={i}
                  src={IMG_CARTA[carta]}
                  alt={NOME_CARTA[carta] ?? carta}
                  className="hand-carta-anim w-16 rounded-md border border-border object-cover shadow-sm"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground">Embaralhando e distribuindo as cartas...</p>
          </div>
        )}

        {room && room.status === "playing" && room.you && room.round && !distribuindo && (
          <div className="mt-6 flex flex-col gap-5">
            <div className="flex gap-2">
              <div className="flex flex-col items-center justify-between">
                <div className="text-center border-primary/30 bg-primary/10 rounded-md px-3 py-1 text-white">
                  {room.round.tableType && IMG_CARTA[room.round.tableType] && (
                    <img
                      src={IMG_CARTA[room.round.tableType]}
                      alt={NOME_CARTA[room.round.tableType] ?? room.round.tableType}
                      className="w-32 rounded-xs"
                    />
                  )}
                  Carta da vez
                  {/* {NOME_CARTA[room.round.tableType ?? ""] ?? "?"} */}
                </div>
              </div>
              <div className="flex flex-col items-left gap-2">
                <Card className="gap-2 border-primary/30 p-4">
                  <div className="flex flex-wrap gap-2">
                    {room.players.map((p) => (
                      <Badge
                        key={p.token}
                        variant={p.token === room.round?.currentTurnToken ? "default" : "outline"}
                        className={p.eliminated ? "opacity-50 border-none rounded-sm" : "border-none rounded-sm"}
                      >
                        {p.nickname} · {p.cardCount} cartas
                        {p.shotsTaken > 0 && (
                          <span className="ml-1 inline-flex items-center gap-0.5">
                            <Martini className="size-3" />
                            {p.shotsTaken}/{room.settings.maxShots}
                          </span>
                        )}
                        {p.eliminated && " · fora"}
                      </Badge>
                    ))}
                  </div>
                </Card>
                {segundosRestantes != null && (
                  <Badge variant={segundosRestantes <= 10 ? "destructive" : "secondary"}>
                    <Timer className="size-3.5" />
                    {segundosRestantes}s
                  </Badge>
                )}
              </div>
            </div>

            <Card className="items-center gap-3 border-primary/30 p-2">
              <p className="text-sm text-muted-foreground">
                {mesaJogada
                  ? `${room.players.find((p) => p.token === mesaJogada.playerToken)?.nickname ?? "?"} jogou ${mesaJogada.count} carta(s)`
                  : "Nenhuma carta na mesa ainda nesta rodada"}
              </p>
              {mesaJogada && (
                <div className="flex gap-1.5">
                  {Array.from({ length: mesaJogada.count }).map((_, i) => {
                    const revelada = i < cartasReveladas.length;
                    const carta = cartasReveladas[i];
                    return (
                      <div key={`${mesaJogada.seq}-${i}`} className="mesa-carta-container">
                        <div
                          className={`mesa-carta-inner ${revelada ? "revelada" : ""}`}
                          style={{ transitionDelay: `${i * 350}ms` }}
                        >
                          <div className="mesa-carta-front">
                            <img src={VERSO_CARTA} alt="Carta virada para baixo" />
                          </div>
                          <div className="mesa-carta-back">
                            {carta && (
                              <img src={IMG_CARTA[carta]} alt={NOME_CARTA[carta] ?? carta} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {ultimoResultado && (
                <p className="text-center text-sm font-medium text-foreground">{ultimoResultado}</p>
              )}
            </Card>

            {ehMinhaVez && !room.you.eliminated && (
              <div className="flex flex-col gap-2">
                {!!room.round.lastPlay.playerToken && (
                  <Button onClick={gritarMentiroso} variant="destructive" className="w-full">
                    MENTIROSO!
                  </Button>
                )}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">
                Sua mão {room.you.eliminated && "(você está fora)"}
              </p>
              <div className="flex flex-wrap gap-2 justify-between">
                {room.you.hand.map((carta, i) => (
                  <button
                    key={`${carta}-${i}`}
                    onClick={() => toggleCarta(i)}
                    disabled={!ehMinhaVez || room.you!.eliminated}
                    style={{ animationDelay: `${i * 120}ms` }}
                    className={`hand-carta-anim flex h-32 w-20 flex-col items-center justify-end overflow-hidden rounded-lg transition-colors ${selecionadas.includes(i)
                      ? "border-primary ring-2 ring-primary/50"
                      : "border-border"
                      } disabled:opacity-50`}
                  >
                    {IMG_CARTA[carta] ? (
                      <img
                        src={IMG_CARTA[carta]}
                        alt={NOME_CARTA[carta] ?? carta}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-card text-sm font-bold text-foreground">
                        {NOME_CARTA[carta] ?? carta}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {ehMinhaVez && !room.you.eliminated && (
              <div className="flex flex-col gap-2">
                {!room.mustCallLiar && (
                  <Button onClick={jogarCartas} disabled={selecionadas.length < 1} className="w-full">
                    Jogar {selecionadas.length || ""} carta(s)
                  </Button>
                )}
                {/* {!!room.round.lastPlay.playerToken && (
                  <Button onClick={gritarMentiroso} variant="destructive" className="w-full">
                    MENTIROSO!
                  </Button>
                )} */}
              </div>
            )}

            {!ehMinhaVez && !room.you.eliminated && (
              <p className="text-center text-sm text-muted-foreground">
                Aguardando {room.players.find((p) => p.token === room.round?.currentTurnToken)?.nickname ?? "outro jogador"}...
              </p>
            )}

            {erro && <p className="text-center text-sm text-destructive">{erro}</p>}

            <Button variant="ghost" onClick={sairDaPartida} className="text-muted-foreground">
              Sair da partida
            </Button>
          </div>
        )}

        {room && room.status === "ended" && (
          <div className="mt-10 flex flex-col items-center gap-6 text-center">
            <Trophy className="size-14 text-primary" />
            <p className="text-2xl font-extrabold text-foreground">
              {room.players.find((p) => p.token === room.winnerToken)?.nickname ?? "Alguém"} venceu!
            </p>
            <div className="flex w-full flex-col gap-3">
              <Button onClick={sairDaSala} className="w-full">
                Jogar novamente
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
