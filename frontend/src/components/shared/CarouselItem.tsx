import WaCarouselItem from "@awesome.me/webawesome/dist/react/carousel-item/index.js";

export interface CarouselItemProps
  extends React.ComponentProps<typeof WaCarouselItem> {
  children?: React.ReactNode;
}

function CarouselItem({ children, ...props }: CarouselItemProps) {
  return <WaCarouselItem {...props}>{children}</WaCarouselItem>;
}

export default CarouselItem;
