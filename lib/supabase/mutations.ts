/**
 * Une update()/delete() Supabase filtrée par id ne renvoie PAS d'erreur si les
 * policies RLS excluent silencieusement la ligne (using clause qui ne matche
 * plus) : sans .select() pour vérifier les lignes réellement affectées, l'UI
 * croit l'action réussie alors que rien n'a changé. Toujours chaîner
 * `.select("id")` sur l'update/delete puis passer le résultat ici.
 */
export function mutationError(
  error: { message: string } | null,
  data: unknown[] | null,
  context: string,
): string | null {
  if (error) return `${context} : ${error.message}`;
  if (!data || data.length === 0) {
    return `${context} : élément introuvable ou action non autorisée.`;
  }
  return null;
}
