import { Skeleton } from "@/components/ui/Skeleton";

export default function CatalogLoading() {
  return (
    <div className="container-editorial pb-24 pt-32 md:pt-44" aria-busy="true" aria-label="Carregando produtos">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-6 h-[clamp(5rem,14vw,16rem)] w-3/4" />
      <Skeleton className="mt-16 h-14 w-full" />
      <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="mt-4 h-3 w-1/3" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </li>
        ))}
      </ul>
    </div>
  );
}
