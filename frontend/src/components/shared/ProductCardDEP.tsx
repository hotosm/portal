import Card from "./Card";
import Icon from "./Icon";

interface ProductCardProps {
  title: string;
  subtitle: string;
  iconName: string;
  href: string;
}

function ProductCard({
  title,
  subtitle,
  iconName,
  href = "#",
}: ProductCardProps) {
  return (
    <Card className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105">
      <a href={href} className="block p-6 h-full relative hover:no-underline">
        <div className="h-full min-h-[120px]">
          <div slot="header">
            <h3 className="text-2xl leading-none mb-sm">{title}</h3>
            <p className="text-lg">{subtitle}</p>
          </div>
        </div>

        <div className="absolute inset-0 flex items-end justify-end pointer-events-none opacity-10 group-hover:opacity-30 transition-opacity duration-300">
          <Icon
            name={iconName}
            className="text-9xl text-hot-red-400 transform  group-hover:rotate-2 transition-transform duration-500"
            label="Background icon"
          />
        </div>
      </a>
    </Card>
  );
}

export default ProductCard;
