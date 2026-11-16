import { Link } from "react-router-dom";
import Card from "./Card";

export interface MediaCardProps {
  href: string;
  title: string;
  imageSrc?: string | null;
  imageAlt?: string;
  onImageError?: () => void;
  children?: React.ReactNode;
}

function MediaCard({
  href,
  title,
  imageSrc,
  imageAlt = "",
  onImageError,
  children,
}: MediaCardProps) {
  return (
    <Link to={href} className="block h-full no-underline hover:no-underline text-inherit">
      <Card withMedia className="h-full transition-shadow hover:shadow-md">
        {imageSrc ? (
          <img
            slot="media"
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
            className="h-40 w-full object-cover"
            onError={onImageError}
          />
        ) : (
          <div slot="media" className="h-40 w-full bg-hot-gray-300" aria-hidden="true" />
        )}
        <div className="flex flex-col gap-sm">
          <h3 className="m-0 line-clamp-2 text-base font-semibold leading-[1.2] text-hot-neutral-900">
            {title}
          </h3>
          {children}
        </div>
      </Card>
    </Link>
  );
}

export default MediaCard;
