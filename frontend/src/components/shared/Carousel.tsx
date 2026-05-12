import React from "react";
import WaCarousel from "@awesome.me/webawesome/dist/react/carousel/index.js";

export interface CarouselProps
  extends Omit<
    React.ComponentProps<typeof WaCarousel>,
    "onWaSlideChange"
  > {
  children?: React.ReactNode;
  onSlideChange?: (event: CustomEvent) => void;
}

function Carousel({ children, onSlideChange, className, style, ...props }: CarouselProps) {
  const count = React.Children.count(children);

  const handleSlideChange = (event: any) => {
    if (onSlideChange) {
      onSlideChange(event);
    }
  };

  if (count <= 1) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  if (count === 2) {
    return (
      <WaCarousel
        onWaSlideChange={handleSlideChange}
        className={className}
        style={style}
        {...props}
        navigation={false}
      >
        {children}
      </WaCarousel>
    );
  }

  return (
    <WaCarousel
      onWaSlideChange={handleSlideChange}
      navigation
      className={className}
      style={style}
      {...props}
    >
      {children}
    </WaCarousel>
  );
}

export default Carousel;
