import ItemButton from "./ItemButton";
import { useShop } from "../utils/context.jsx";
import {
	AddIcon,
	CancelIcon,
	RemoveIcon,
	ShoppingCartIcon,
	ClearListIcon,
} from "../assets/Icons";
import { useState } from "react";
import { Link } from "react-router-dom";

function ShoppingCart() {
	const {
		addedProducts,
		getProductQuantity,
		clearCart,
		handleQuantityChange,
		totalPrice,
		increaseProduct,
		decreaseProduct,
	} = useShop();

	const [isCartOpen, setIsCartOpen] = useState(false);
	const toggleCart = () => setIsCartOpen(!isCartOpen);

	return (
		<div>
			<div className="shoppingCartCombo">
				{addedProducts.length > 0 && (
					<p className="quantityCounter">{addedProducts.length}</p>
				)}
				<ItemButton
					title={isCartOpen ? "Close Menu" : "Open Cart"}
					onClick={toggleCart}
					className="shoppingcartBtn"
					icon={isCartOpen ? <CancelIcon /> : <ShoppingCartIcon />}
				/>
			</div>
			{isCartOpen && (
				<div className="shoppingList">
					<h4 className="shoppingListTitle">Valda produkter</h4>
					<table className="productTable shoppingListItems">
						<tbody>
							{addedProducts?.map((product) => (
								<tr key={product.id}>
									<td>
										<img
											src={product.imageUrl}
											style={{
												width: "30px",
												height: "30px",
											}}
										/>
									</td>
									<td className="columnName">
										{product.name}
									</td>
									<td className="columnPrice">
										{(product.reducedPrice ||
											product.price) + " kr"}
									</td>
									<td className="quantityControls">
										<ItemButton
											className="removeButton"
											title="Remove one product"
											icon={<RemoveIcon />}
											onClick={() =>
												decreaseProduct(product)
											}
										/>
										{getProductQuantity(product.id)}
										<ItemButton
											className="addButton"
											title="Add one product"
											icon={<AddIcon />}
											onClick={() =>
												increaseProduct(product)
											}
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<h4>Total: {totalPrice}kr</h4>

					<Link to="/checkout">
						<ItemButton
							title="Checkout"
							text="Checkout"
							className="checkoutButton"
							onClick={() => setIsCartOpen(false)}
						/>
					</Link>
					{addedProducts.length > 0 && (
						<ItemButton
							icon={<ClearListIcon />}
							className="cartDeleteBtn"
							onClick={() => clearCart()}
							title="Clear cart"
						/>
					)}
				</div>
			)}
		</div>
	);
}

export default ShoppingCart;
