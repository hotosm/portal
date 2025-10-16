import WaCard from "@awesome.me/webawesome/dist/react/card/index.js";

export interface CardProps extends React.ComponentProps<typeof WaCard> {
  children?: React.ReactNode;
}

function Card({ children, ...props }: CardProps) {
  return (
    <WaCard {...props}>
      {children}
    </WaCard>
  );
}

export default Card;
