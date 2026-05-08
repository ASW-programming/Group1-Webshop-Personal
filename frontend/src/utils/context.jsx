import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getProducts } from "./calls.js";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

const ShopContext = createContext();

export function ShopProvider({ children }) {
	// HOOKS AND VARIABLES
	const {
		data: products = [],
		isLoading: productsLoading,
		isError: productsError,
	} = useQuery({
		queryKey: ["products"],
		queryFn: getProducts,
	});

	const [searchParams, setSearchParams] = useSearchParams();

	const [displayQuantity, setDisplayQuantity] = useState({});
	const [activeCategory, setActiveCategory] = useState(null);

	const [addedProducts, setAddedProducts] = useState(() => {
		const saved = localStorage.getItem("shoppingCart");
		return saved ? JSON.parse(saved) : [];
	});

	// Maps out categories. Removes duplicates and converts back into array.
	const categories = [...new Set(products.map((p) => p.category))];

	// ===== CART FUNCTIONALITY =====
	const increaseProduct = (product) => {
		setDisplayQuantity((prev) => {
			const newQty = (prev[product.id] ?? 0) + 1;
			return { ...prev, [product.id]: newQty };
		});
		setAddedProducts((prev) => {
			const exists = prev.find((p) => p.id === product.id);
			const newQuantity = (exists?.quantity ?? 0) + 1;

			if (newQuantity <= 0)
				return prev.filter((p) => p.id !== product.id);
			if (exists)
				return prev.map((p) =>
					p.id === product.id ? { ...p, quantity: newQuantity } : p,
				);
			return [...prev, { ...product, quantity: newQuantity }];
		});
	};

	const decreaseProduct = (product) => {
		setDisplayQuantity((prev) => {
			const newQty = (prev[product.id] ?? 0) - 1;
			if (newQty <= 0) {
				const updated = { ...prev };
				delete updated[product.id];
				return updated;
			}
			return { ...prev, [product.id]: newQty };
		});
		setAddedProducts((prev) => {
			const exists = prev.find((p) => p.id === product.id);
			const newQuantity = (exists?.quantity ?? 0) - 1;

			if (newQuantity <= 0)
				return prev.filter((p) => p.id !== product.id);
			if (exists)
				return prev.map((p) =>
					p.id === product.id ? { ...p, quantity: newQuantity } : p,
				);
			return [...prev, { ...product, quantity: newQuantity }];
		});
	};

	const clearCart = () => {
		setAddedProducts([]);
		setDisplayQuantity({});
		localStorage.removeItem("shoppingCart");
	};

	// Update localStorage everytime addedProducts changes
	useEffect(() => {
		localStorage.setItem("shoppingCart", JSON.stringify(addedProducts));
	}, [addedProducts]);

	// ===== PRODUCTCARD AND PRODUCTDETAIL Functionality =====

	const getProductQuantity = (productId) => {
		const found = addedProducts.find((p) => p.id === productId);
		return found ? found.quantity : 0;
	};
	//===== HAMBURGERMENU =====

	const selectCategory = (category) => {
		setActiveCategory((prev) => (prev === category ? null : category)); // Select same category => reset category
	};

	const totalPrice = (addedProducts ?? []).reduce((sum, item) => {
		const price = item.reducedPrice || item.price;
		return sum + price * item.quantity;
	}, 0);

	const input = searchParams.get("q")?.toLowerCase() ?? "";
	const searchedProducts = input
		? products.filter((p) => {
				const search = input.toLowerCase();

				const tags = Array.isArray(p.tags) ? p.tags : [];

				return (
					p.name?.toLowerCase().includes(search) ||
					tags.some((tag) => tag.toLowerCase() === search) ||
					p.category?.toLowerCase() === search
				);
			})
		: products;

	const value = {
		// product data
		products,
		productsLoading,
		productsError,
		categories,

		// cart functionality
		displayQuantity,
		addedProducts,
		clearCart,
		getProductQuantity,
		totalPrice,
		increaseProduct,
		decreaseProduct,

		//HamburgerMenu
		activeCategory,
		selectCategory,

		//Search bar
		searchedProducts,
	};

	return (
		<ShopContext.Provider value={value}>{children}</ShopContext.Provider>
	);
}

export const useShop = () => useContext(ShopContext);
