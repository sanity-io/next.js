"use client";

import { NextStudio } from "next-sanity/studio";

import config from "@/sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
  // return <Studio config={config} unstable_globalStyles />;
}
