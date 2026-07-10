"use client";

import { useState } from "react";
import { VenetianMask } from "lucide-react";
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

export default function ImpostorSetupModal({
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
          <VenetianMask className="size-8 text-primary" />
          <DialogTitle className="text-xl">Quantos vão jogar?</DialogTitle>
          <DialogDescription>
            Um jogador será sorteado como impostor e não vai saber a palavra secreta.
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
            Sortear impostor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
