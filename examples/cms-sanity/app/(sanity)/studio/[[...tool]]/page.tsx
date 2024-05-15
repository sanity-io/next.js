import lazy from "next/dynamic";

export const dynamic = "force-static";

const Studio = lazy(() => import("./Studio"), { ssr: false });

export default function StudioPage() {
  return <Studio />;
}
