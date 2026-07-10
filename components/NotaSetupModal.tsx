"use client";

import { useState } from "react";
import { Star } from "lucide-react";
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

const MIN_JOGADORES = 3;

export default function NotaSetupModal({
  onConfirm,
}: {
  onConfirm: (numJogadores: number) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleConfirm() {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < MIN_JOGADORES) {
      setError(`São necessários pelo menos ${MIN_JOGADORES} jogadores.`);
      return;
    }
    onConfirm(n);
  }

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="text-center">
        <DialogHeader className="items-center py-3">
          <Star className="size-8 text-primary" />
          <DialogTitle className="text-xl">Qual é a Nota?</DialogTitle>
          <DialogDescription>
            O jogador da vez recebe uma nota secreta de 0 a 10. Os outros gritam
            categorias e ele responde com um exemplo que combine com a nota. No
            final, todos tentam adivinhar qual era!
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

        <DialogFooter>
          <Button onClick={handleConfirm} className="w-full">
            Sortear nota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
