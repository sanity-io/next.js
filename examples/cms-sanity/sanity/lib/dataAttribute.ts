import { studioUrl as baseUrl, dataset, projectId } from "@/sanity/lib/api";
import { createDataAttribute } from "next-sanity";

export function dataAttribute(
  node: Omit<
    Parameters<typeof createDataAttribute>[0],
    "baseUrl" | "workspace" | "tool" | "projectId" | "dataset"
  >,
) {
  return createDataAttribute({
    baseUrl,
    projectId,
    dataset,
    ...node,
  });
}
