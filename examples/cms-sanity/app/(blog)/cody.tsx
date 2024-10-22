"use client";

import { useDraftModeEnvironment } from "next-sanity/hooks";

export default function Cody() {
  const env = useDraftModeEnvironment();
  return <div>Cody: {env}</div>;
}
