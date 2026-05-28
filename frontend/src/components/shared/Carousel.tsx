import React, { useState } from "react";
import WaCarousel from "@awesome.me/webawesome/dist/react/carousel/index.js";
import { useIsMobile } from "../../hooks/useIsMobile";
import Icon from "./Icon";

export interface CarouselProps extends Omit<
  React.ComponentProps<typeof WaCarousel>,
  "onWaSlideChange"
> {
  children?: React.ReactNode;
  onSlideChange?: (event: CustomEvent) => void;
}

function ImgWithFallback({
  className,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-100 text-neutral-400 ${className ?? ""}`}
      >
        <Icon name="image" style={{ fontSize: "2rem" }} />
      </div>
    );
  }

  return (
    <img
      {...props}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
    />
  );
}

function withImageFallback(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    if (child.type === "img") {
      return (
        <ImgWithFallback
          {...(child.props as React.ImgHTMLAttributes<HTMLImageElement>)}
        />
      );
    }

    const props = child.props as { children?: React.ReactNode };
    if (props.children) {
      return React.cloneElement(
        child as React.ReactElement<{ children?: React.ReactNode }>,
        { children: withImageFallback(props.children) },
      );
    }

    return child;
  });
}

function Carousel({
  children,
  onSlideChange,
  className,
  style,
  ...props
}: CarouselProps) {
  const count = React.Children.count(children);
  const isMobile = useIsMobile();

  const handleSlideChange = (event: any) => {
    if (onSlideChange) {
      onSlideChange(event);
    }
  };

  const processed = withImageFallback(children);

  if (count <= 1) {
    return (
      <div className={className} style={style}>
        {processed}
      </div>
    );
  }

  if (count === 2 && !isMobile) {
    return (
      <div className={`flex gap-4 ${className ?? ""}`} style={style}>
        {processed}
      </div>
    );
  }

  return (
    <WaCarousel
      onWaSlideChange={handleSlideChange}
      navigation={count > 2}
      className={className}
      style={style}
      {...props}
    >
      {processed}
    </WaCarousel>
  );
}

export default Carousel;
