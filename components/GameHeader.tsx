import Link from "next/link";
import { ArrowLeft, BookOpen, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function GameHeader({
  titulo,
  icone: Icone,
  regras,
}: {
  titulo: string;
  icone: LucideIcon;
  regras: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Voltar ao menu
        </Link>

        <Dialog>
          <DialogTrigger
            render={
              <Button variant="outline" size="sm">
                <BookOpen className="size-4" />
                Regras
              </Button>
            }
          />
          <DialogContent className="text-center">
            <DialogHeader className="items-center py-3">
              <Icone className="size-8 text-primary" />
              <DialogTitle className="text-xl">Como jogar</DialogTitle>
              <DialogDescription className="sr-only">Regras do jogo {titulo}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 text-left">{regras}</div>
          </DialogContent>
        </Dialog>
      </div>

      <h1 className="mt-6 flex items-center justify-center gap-2 text-center text-3xl font-extrabold text-foreground sm:text-4xl">
        <Icone className="size-8 text-primary" />
        {titulo}
      </h1>
    </>
  );
}
