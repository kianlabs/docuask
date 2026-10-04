/**
 * Renders a JSON-LD block for search engines. Kept as a tiny wrapper so pages
 * declare structured data declaratively and the escaping lives in one place.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Serialised JSON-LD; the only user-controlled values are static strings
      // defined in this repo, and `<` is escaped to keep the tag from breaking.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** Convenience for pages that render several graphs. */
export function JsonLdGraph({ nodes }: { nodes: Record<string, unknown>[] }) {
  return <JsonLd data={{ "@context": "https://schema.org", "@graph": nodes }} />;
}
