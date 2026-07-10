import Link from "next/link";
import { ArrowRight, Drama, Lock, PartyPopper, Play, Spade, Star, UserRoundSearch, VenetianMask } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Jogo = {
  slug: string;
  nome: string;
  descricao: string;
  imagem?: string;
  icone?: typeof VenetianMask;
  disponivel: boolean;
};

const jogos: Jogo[] = [
  {
    slug: "faz-ou-bebe",
    nome: "Faz ou Bebe",
    descricao: "O clássico jogo de desafios e goles para animar a resenha.",
    imagem: "/img/baralho.png",
    disponivel: true,
  },
  {
    slug: "impostor",
    nome: "Impostor",
    descricao: "Um jogador não sabe a palavra secreta e precisa se disfarçar sem ser pego.",
    icone: VenetianMask,
    disponivel: true,
  },
  {
    slug: "quem-sou-eu",
    nome: "Quem Sou Eu?",
    descricao: "Personagem na testa: adivinhe quem você é fazendo perguntas de sim ou não.",
    icone: UserRoundSearch,
    disponivel: true,
  },
  {
    slug: "mimica",
    nome: "Mímica",
    descricao: "Represente a palavra com gestos e corra contra o tempo para os outros adivinharem.",
    icone: Drama,
    disponivel: true,
  },
  {
    slug: "qual-e-a-nota",
    nome: "Qual é a Nota?",
    descricao: "Um jogador recebe uma nota secreta e responde categorias de acordo com ela.",
    icone: Star,
    disponivel: true,
  },
];

function CapaJogo({ jogo }: { jogo: Jogo }) {
  if (jogo.imagem) {
    return (
      <img
        src={jogo.imagem}
        alt={jogo.nome}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    );
  }

  const Icone = jogo.icone ?? Spade;
  return (
    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 via-background to-background">
      <Icone className="size-16 text-primary/70 transition-transform duration-500 group-hover:scale-110" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-16 sm:py-24">
      {/* Glow decorativo de fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[10%] h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute right-[5%] bottom-[10%] h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <Badge
          variant="outline"
          className="gap-1.5 border-primary/30 bg-primary/5 text-primary uppercase tracking-wide"
        >
          <PartyPopper className="size-3.5" />
          {jogos.filter((j) => j.disponivel).length} jogos disponíveis
        </Badge>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Joguinhos dos Rangers
        </h1>
      </div>

      <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        {jogos.map((jogo) =>
          jogo.disponivel ? (
            <Link key={jogo.slug} href={`/jogos/${jogo.slug}`} className="group">
              <Card className="h-full gap-0 overflow-hidden rounded-2xl py-0 ring-1 ring-primary/10 transition-all duration-300 hover:-translate-y-1.5 hover:ring-primary/50 hover:shadow-[0_20px_45px_-15px_oklch(0.75_0.12_85/0.4)]">
                <div className="relative h-48 w-full overflow-hidden bg-background">
                  <CapaJogo jogo={jogo} />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
                  <Badge className="absolute top-3 right-3 gap-1 bg-primary/90 text-primary-foreground shadow">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
                    Disponível
                  </Badge>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex size-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur">
                      <Play className="size-6 translate-x-0.5 fill-current" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 p-6">
                  <h2 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                    {jogo.nome}
                  </h2>
                  <p className="text-sm text-muted-foreground">{jogo.descricao}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Jogar <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Card>
            </Link>
          ) : (
            <Card
              key={jogo.slug}
              className="h-full cursor-not-allowed gap-0 overflow-hidden rounded-2xl py-0 opacity-60 grayscale"
            >
              <div className="relative h-48 w-full overflow-hidden bg-background">
                <CapaJogo jogo={jogo} />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
              </div>
              <div className="flex flex-col gap-1.5 p-6">
                <h2 className="text-xl font-bold text-muted-foreground">{jogo.nome}</h2>
                <p className="text-sm text-muted-foreground">{jogo.descricao}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Lock className="size-4" /> Em breve
                </span>
              </div>
            </Card>
          )
        )}
      </div>

      <p className="mt-16 text-center text-xs text-muted-foreground/70">
        Beba com responsabilidade. Divirta-se com moderação.
      </p>
    </main>
  );
}
