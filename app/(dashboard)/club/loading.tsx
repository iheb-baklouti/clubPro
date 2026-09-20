import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <Skeleton className="h-9 w-40" />
        </CardContent>
      </Card>
    </div>
  );
}
