import { useParams, useNavigate } from "react-router-dom";
import { priceInfo } from "../utils/priceSetter.jsx";
import ItemButton from "./ItemButton.jsx";
import { useShop } from "../utils/context.jsx";
import { AddIcon, RemoveIcon, ReturnIcon } from "../assets/Icons.jsx";

const ProductDetails = () => {
	const navigate = useNavigate();
	const {
		addedProducts,
		handleQuantityChange,
		products,
		productsLoading,
		productsError,
		getProductQuantity,
		increaseProduct,
		decreaseProduct,
	} = useShop();

	const { id } = useParams();

	// Fetch product details by ID
	const selectedProduct = products.find((p) => String(p.id) === id);

	if (productsLoading) return <p>Loading product...</p>;
	if (productsError) return <p>Something went wrong!</p>;
	if (!selectedProduct) return <p>Product not found!</p>;

	const quantity = getProductQuantity(selectedProduct.id);

	return (
		<div className="productDetails">
			<div className="productInfo">
				<div className="productNameImg">
					<img
						className="productDetailsImage"
						src={selectedProduct.imageUrl}></img>
					<div className="productNameCategory">
						<p className="productName">{selectedProduct.name}</p>
						<p className="productCategory">
							{selectedProduct.category}
						</p>
						<div className="productPrice">
							{priceInfo(selectedProduct)}
						</div>
					</div>
				</div>
				<div className="productDescriptionContainer">
					<p className="productDescription">
						{selectedProduct.description || "Beskrivning saknas"}
					</p>
				</div>
			</div>
			<div className="cardButtons productPageButtons">
				{quantity > 0 ? (
					<>
						<ItemButton
							title="Remove one product"
							className="removeButton"
							icon={<RemoveIcon />}
							onClick={() => {
								decreaseProduct(selectedProduct);
							}}
						/>

						<p>{quantity}</p>
						<ItemButton
							title="Add one product"
							className="addButton"
							icon={<AddIcon />}
							onClick={() => increaseProduct(selectedProduct)}
						/>
					</>
				) : (
					<ItemButton
						className="buyButton"
						title="Buy"
						text="Köp"
						onClick={() => {
							increaseProduct(selectedProduct);
						}}
					/>
				)}
			</div>
			<ItemButton
				className="returnBtn"
				title="Go back"
				icon={<ReturnIcon />}
				onClick={() => navigate("/")}
			/>
		</div>
	);
};

export default ProductDetails;
