"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserRoundSearch } from "lucide-react";
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

export type Categoria = "famosos" | "pokemon" | "rickandmorty";

const CATEGORIAS: { valor: Categoria; label: string; descricao: string }[] = [
  { valor: "famosos", label: "Famosos & Personagens", descricao: "Celebridades, super-heróis e desenhos" },
  { valor: "pokemon", label: "Pokémon", descricao: "Via PokéAPI" },
  { valor: "rickandmorty", label: "Rick and Morty", descricao: "Via Rick and Morty API" },
];

export default function QuemSouEuSetupModal({
  onConfirm,
}: {
  onConfirm: (numJogadores: number, categoria: Categoria) => void;
}) {
  const [value, setValue] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("famosos");
  const [error, setError] = useState("");

  function handleConfirm() {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < MIN_JOGADORES) {
      setError(`São necessários pelo menos ${MIN_JOGADORES} jogadores.`);
      return;
    }
    onConfirm(n, categoria);
  }

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="text-center">
        <DialogHeader className="items-center py-3">
          <UserRoundSearch className="size-8 text-primary" />
          <DialogTitle className="text-xl">Quem Sou Eu?</DialogTitle>
          <DialogDescription>
            Cada jogador recebe um personagem secreto e precisa adivinhar quem é
            fazendo perguntas para os outros.
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
          <Label>Categoria de personagens</Label>
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
            Sortear personagens
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
