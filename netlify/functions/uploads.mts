// Serves images uploaded through /api/upload from Netlify Blobs.
import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (_req: Request, context: Context) => {
  const key = context.params.key;
  if (!key) return new Response("Not found", { status: 404 });

  const result = await getStore("uploads").getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(result.data, {
    headers: {
      "Content-Type": String(result.metadata?.contentType || "application/octet-stream"),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};

export const config: Config = {
  path: "/uploads/:key",
  // Files already committed in public/uploads keep being served statically
  preferStatic: true,
};
