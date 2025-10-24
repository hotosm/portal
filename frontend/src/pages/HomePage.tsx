import ProductCard from "../components/shared/ProductCard";
import { getProductsData } from "../constants/productsData";
import { useLanguage } from "../contexts/LanguageContext";

function HomePage() {
  const { currentLanguage: _currentLanguage } = useLanguage(); // suscribe to force re-render on language change
  const productsData = getProductsData();

  return (
    <div className="p-xl bg-hot-gray-50 rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {productsData.map((product) => (
          <ProductCard
            key={product.id}
            title={product.title}
            subtitle={product.subtitle}
            iconName={product.iconName}
            href={product.href}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
