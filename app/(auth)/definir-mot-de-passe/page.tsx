import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SessionFromHashGate } from "@/components/features/auth/session-from-hash-gate";
import { SetPasswordForm } from "@/components/features/auth/set-password-form";

// Pas de vérification de session côté serveur ici : les liens d'invitation
// livrent la session dans le fragment d'URL, invisible du serveur au premier
// chargement. SessionFromHashGate l'établit côté client avant d'afficher le
// formulaire (voir son commentaire pour le détail).
export default function SetPasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Bienvenue sur ClubPro</CardTitle>
          <CardDescription>Définissez votre mot de passe pour accéder au club.</CardDescription>
        </CardHeader>
        <CardContent>
          <SessionFromHashGate>
            <SetPasswordForm />
          </SessionFromHashGate>
        </CardContent>
      </Card>
    </div>
  );
}
