import WaCarousel from "@awesome.me/webawesome/dist/react/carousel/index.js";

export interface CarouselProps
  extends Omit<
    React.ComponentProps<typeof WaCarousel>,
    "onWaSlideChange"
  > {
  children?: React.ReactNode;
  onSlideChange?: (event: CustomEvent) => void;
}

function Carousel({ children, onSlideChange, ...props }: CarouselProps) {
  const handleSlideChange = (event: any) => {
    if (onSlideChange) {
      onSlideChange(event);
    }
  };

  return (
    <WaCarousel onWaSlideChange={handleSlideChange} {...props}>
      {children}
    </WaCarousel>
  );
}

export default Carousel;
