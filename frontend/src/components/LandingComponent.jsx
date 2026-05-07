import ProductCard from "./ProductCard";
import ScrollBanner from "./ScrollBanner.jsx";
import { useShop } from "../utils/context.jsx";
import ItemButton from "./ItemButton.jsx";
import { Link } from "react-router-dom";

function LandingComponent() {
	const {
		products,
		productsLoading,
		productsError,
		activeCategory,
		searchedProducts,
	} = useShop();

	const discountedProducts = products.filter((p) => p.reducedPrice);

	// Slides
	const slidesData = discountedProducts.map((u) => ({
		id: u.id,
		image: u.imageUrl,
		subtitle: u.shortDesc.slice(0, 100),
		price: u.reducedPrice,
		originalPrice: u.price,
	}));

	if (productsLoading) return <p>Loading products...</p>;
	if (productsError) return <p>Something went wrong!</p>;

	return (
		<div className="content">
			<ScrollBanner slides={slidesData} />

			<ProductCard />

			<Link to="/orderHistory">
				<ItemButton
					title="Order History"
					text="Order historik"
					className="orderHistory"
				/>
			</Link>
		</div>
	);
}

export default LandingComponent;
