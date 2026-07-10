"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Drama } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MIN_JOGADORES = 2;
const DURACOES = [30, 60, 90] as const;

export type Categoria = "acoes" | "famosos" | "pokemon" | "rickandmorty";

const CATEGORIAS: { valor: Categoria; label: string; descricao: string }[] = [
  { valor: "acoes", label: "Ações & Objetos", descricao: "Coisas para representar com o corpo" },
  { valor: "famosos", label: "Famosos & Personagens", descricao: "Celebridades, super-heróis e desenhos" },
  { valor: "pokemon", label: "Pokémon", descricao: "Via PokéAPI" },
  { valor: "rickandmorty", label: "Rick and Morty", descricao: "Via Rick and Morty API" },
];

export default function MimicaSetupModal({
  onConfirm,
}: {
  onConfirm: (numJogadores: number, duracao: number, categoria: Categoria) => void;
}) {
  const [value, setValue] = useState("");
  const [duracao, setDuracao] = useState<number>(60);
  const [categoria, setCategoria] = useState<Categoria>("acoes");
  const [error, setError] = useState("");

  function handleConfirm() {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < MIN_JOGADORES) {
      setError(`São necessários pelo menos ${MIN_JOGADORES} jogadores.`);
      return;
    }
    onConfirm(n, duracao, categoria);
  }

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="text-center">
        <DialogHeader className="items-center py-3">
          <Drama className="size-8 text-primary" />
          <DialogTitle className="text-xl">Mímica</DialogTitle>
          <DialogDescription>
            Na sua vez, represente a palavra sem falar. Os outros tentam adivinhar
            antes do tempo acabar!
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 text-left">
          <Label htmlFor="numJogadores">Número de jogadores</Label>
          <Input
            id="numJogadores"
            type="number"
            min={MIN_JOGADORES}
            placeholder={`Mín. ${MIN_JOGADORES}`}
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            className="text-center text-lg"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="grid gap-2 text-left">
          <Label>Tempo por rodada</Label>
          <div className="grid grid-cols-3 gap-2">
            {DURACOES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuracao(d)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                  duracao === d
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2 text-left">
          <Label>Categoria de palavras</Label>
          <div className="grid gap-2">
            {CATEGORIAS.map((c) => (
              <button
                key={c.valor}
                type="button"
                onClick={() => setCategoria(c.valor)}
                className={cn(
                  "flex flex-col rounded-lg border px-3 py-2 text-left transition-colors",
                  categoria === c.valor
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                )}
              >
                <span className="text-sm font-semibold text-foreground">{c.label}</span>
                <span className="text-xs text-muted-foreground">{c.descricao}</span>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} className="w-full">
            Começar a mímica
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
