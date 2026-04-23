interface CardProjectTitleProps {
  title: string;
  href: string;
}

export default function CardProjectTitle({
  title,
  href,
}: CardProjectTitleProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-base font-bold hover:text-black hover:no-underline"
    >
      {title}
    </a>
  );
}
