"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Car, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCarpoolOffer,
  deleteCarpoolOffer,
  joinCarpool,
  leaveCarpool,
} from "@/app/(dashboard)/calendrier/carpool-actions";

interface Player {
  id: string;
  full_name: string;
}

interface Offer {
  id: string;
  driverPlayerId: string;
  driverName: string;
  seatsTotal: number;
  departureLocation: string | null;
  notes: string | null;
  passengers: { id: string; playerId: string; name: string }[];
}

export function CarpoolBoard({
  matchId,
  players,
  offers,
  currentPlayerId,
  canManageAll = false,
}: {
  matchId: string;
  players: Player[];
  offers: Offer[];
  currentPlayerId: string | null;
  /** Direction/coach : peuvent gérer (supprimer) n'importe quelle offre. */
  canManageAll?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [driverId, setDriverId] = useState(currentPlayerId ?? "");
  const [seats, setSeats] = useState(3);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createCarpoolOffer(matchId, driverId, seats, location, notes);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setLocation("");
      setNotes("");
      router.refresh();
    });
  }

  function handleJoin(offerId: string) {
    if (!currentPlayerId) return;
    startTransition(async () => {
      await joinCarpool(offerId, matchId, currentPlayerId);
      router.refresh();
    });
  }

  function handleLeave(passengerId: string) {
    startTransition(async () => {
      await leaveCarpool(passengerId, matchId);
      router.refresh();
    });
  }

  function handleDeleteOffer(offerId: string) {
    startTransition(async () => {
      await deleteCarpoolOffer(offerId, matchId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" size="sm">
            <Plus className="h-4 w-4" />
            Proposer un trajet
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proposer un trajet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Conducteur</Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un joueur" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="seats">Places disponibles</Label>
                <Input
                  id="seats"
                  type="number"
                  min={1}
                  max={8}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="location">Lieu de départ</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleCreate} disabled={isPending || !driverId}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Proposer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {offers.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Car className="h-4 w-4" />
          Aucun trajet proposé pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-2">
          {offers.map((offer) => {
            const seatsLeft = offer.seatsTotal - offer.passengers.length;
            const isDriver = currentPlayerId === offer.driverPlayerId;
            const alreadyJoined = offer.passengers.some((p) => p.playerId === currentPlayerId);

            return (
              <div key={offer.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      <Car className="mr-1 inline h-3.5 w-3.5 text-primary" />
                      {offer.driverName} — {seatsLeft > 0 ? `${seatsLeft} place(s) libre(s)` : "Complet"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {offer.departureLocation ? `Départ : ${offer.departureLocation}` : ""}
                      {offer.notes ? ` · ${offer.notes}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentPlayerId && !isDriver && seatsLeft > 0 && !alreadyJoined && (
                      <Button type="button" size="sm" variant="outline" onClick={() => handleJoin(offer.id)}>
                        Rejoindre
                      </Button>
                    )}
                    {(isDriver || canManageAll) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Supprimer l'offre"
                        onClick={() => handleDeleteOffer(offer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {offer.passengers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {offer.passengers.map((p) => (
                      <span
                        key={p.id}
                        className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                      >
                        {p.name}
                        {p.playerId === currentPlayerId && (
                          <button
                            type="button"
                            aria-label="Quitter"
                            onClick={() => handleLeave(p.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
