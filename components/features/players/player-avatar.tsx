import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Couleur de fond déterministe (dérivée de l'id joueur) pour distinguer les
 * avatars entre eux sans dépendre d'un service externe : ni requête réseau
 * par joueur, ni visage généré (donc pas de genre incorrect implicite).
 */
function hashHue(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

export function PlayerAvatar({
  playerId,
  fullName,
  photoUrl,
  className,
}: {
  playerId: string;
  fullName: string;
  photoUrl?: string | null;
  className?: string;
}) {
  const hue = hashHue(playerId);

  return (
    <Avatar className={cn("h-9 w-9", className)}>
      {photoUrl && <AvatarImage src={photoUrl} alt={fullName} />}
      <AvatarFallback
        className="font-semibold text-white"
        style={{ backgroundColor: `hsl(${hue} 55% 42%)` }}
      >
        {initials(fullName)}
      </AvatarFallback>
    </Avatar>
  );
}
