import { useEffect } from "react";

export function usePageMeta({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  useEffect(() => {
    const metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    const previousTitle = document.title;
    const previousDescription = metaDescription?.content;

    document.title = title;
    if (metaDescription) metaDescription.content = description;

    return () => {
      document.title = previousTitle;
      if (metaDescription && previousDescription !== undefined) {
        metaDescription.content = previousDescription;
      }
    };
  }, [title, description]);
}
