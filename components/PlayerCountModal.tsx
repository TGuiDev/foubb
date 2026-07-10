"use client";

import { useState } from "react";
import { Users } from "lucide-react";
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

export default function PlayerCountModal({
  onConfirm,
}: {
  onConfirm: (numJogadores: number) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleConfirm() {
    const n = parseInt(value, 10);
    if (isNaN(n) || n <= 0) {
      setError("Informe um número válido de jogadores.");
      return;
    }
    onConfirm(n);
  }

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} className="text-center">
        <DialogHeader className="items-center py-3">
          <DialogTitle className="text-xl">Quantos vão jogar?</DialogTitle>
          <DialogDescription>
            Informe o número de jogadores para começar a partida.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 text-left">
          <Label htmlFor="numJogadores">Número de jogadores</Label>
          <Input
            id="numJogadores"
            type="number"
            min={1}
            placeholder="Ex: 4"
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
            Começar a jogar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
