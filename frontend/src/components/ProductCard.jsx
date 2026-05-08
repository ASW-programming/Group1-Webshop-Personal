import ItemButton from "./ItemButton";
import { priceInfo } from "../utils/priceSetter.jsx";
import { Link } from "react-router-dom";
import { useShop } from "../utils/context.jsx";
import { AddIcon, RemoveIcon } from "../assets/Icons.jsx";
import { useState } from "react";

function ProductCard() {
	const {
		handleQuantityChange,
		getProductQuantity,
		products,
		activeCategory,
		increaseProduct,
		decreaseProduct,
	} = useShop();
	const [sortBy, setSortBy] = useState("");

	const filteredProducts = products.filter(
		(u) => !activeCategory || u.category === activeCategory,
	);

	const sortedProducts = [...filteredProducts].sort((a, b) => {
		const priceA = a.reducedPrice ?? a.price;
		const priceB = b.reducedPrice ?? b.price;

		switch (sortBy) {
			case "price-asc":
				return priceA - priceB;
			case "price-desc":
				return priceB - priceA;
			case "name-asc":
				return a.name.localeCompare(b.name, "sv-SE");
			case "name-desc":
				return b.name.localeCompare(a.name, "sv-SE");
			default:
				return a.category.localeCompare(b.category, "sv-SE");
		}
	});

	return (
		<>
			<select
				className="sortSelect"
				onChange={(e) => setSortBy(e.target.value)}
				value={sortBy}>
				<option value="">Kategori</option>
				<option value="price-asc">Pris: lågt → högt</option>
				<option value="price-desc">Pris: högt → lågt</option>
				<option value="name-asc">A → Ö</option>
				<option value="name-desc">Ö → A</option>
			</select>

			{sortedProducts.length === 0 ? (
				<h3 className="errorMessage">Inga produkter hittades.</h3>
			) : (
				<ul className="productList">
					{sortedProducts.map((u) => {
						const quantity = getProductQuantity(u.id);
						return (
							<li key={u.id} className="productListElement">
								<Link to={`/product/${u.id}`}>
									<div className="productInformation">
										<img
											className="productImage"
											src={u.imageUrl}></img>
										<span className="productName">
											{u.name}
										</span>
										<span className="productCategory">
											{u.category}
										</span>
										<span className="productPrice">
											{priceInfo(u)}
										</span>
										<span className="productShortDescription">
											{u.shortDesc || "Ingen Beskrivning"}
										</span>
									</div>
								</Link>
								<div
									className="cardButtons"
									onClick={(e) => {
										e.stopPropagation();
									}}>
									{quantity > 0 ? (
										<>
											<ItemButton
												className="removeButton"
												title="Remove one product"
												icon={<RemoveIcon />}
												onClick={() => {
													decreaseProduct(u);
												}}
											/>

											<p>{quantity}</p>
											<ItemButton
												className="addButton"
												title="Add one product"
												icon={<AddIcon />}
												onClick={() =>
													increaseProduct(u)
												}
											/>
										</>
									) : (
										<ItemButton
											title="Buy"
											className="buyButton"
											text="Köp"
											onClick={() => {
												increaseProduct(u);
											}}
										/>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</>
	);
}

export default ProductCard;
