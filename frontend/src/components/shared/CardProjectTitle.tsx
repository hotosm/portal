interface CardProjectTitleProps {
  title: string;
  href: string;
}

export default function CardProjectTitle({
  title,
  href,
}: CardProjectTitleProps) {
  const isExternal = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
      className="text-base font-bold hover:text-black hover:no-underline line-clamp-2 min-h-[3em]"
    >
      {title}
    </a>
  );
}
