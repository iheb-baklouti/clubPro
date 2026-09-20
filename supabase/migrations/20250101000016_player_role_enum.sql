-- ============================================================================
-- ClubPro — Migration 16 : nouveau rôle "joueur" (portail joueur).
-- Isolée dans sa propre migration : PostgreSQL interdit d'utiliser une
-- nouvelle valeur d'enum dans la même transaction que celle qui l'ajoute.
-- ============================================================================
alter type public.user_role add value 'joueur';
