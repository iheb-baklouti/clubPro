"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TeamFilterSelect({ teams }: { teams: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("team") ?? "all";

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all") {
          params.delete("team");
        } else {
          params.set("team", value);
        }
        router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
      }}
    >
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue placeholder="Toutes les équipes" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Toutes les équipes</SelectItem>
        {teams.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {t.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
