import { useState, useEffect } from "react";
import ItemButton from "./ItemButton";
import ItemInput from "./ItemInput";
import { postOrders } from "../utils/calls.js";
import { useShop } from "../utils/context.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AddIcon,
	RemoveIcon,
	EmptyListIcon,
	ReturnIcon,
	HomeIcon,
	ClearListIcon,
} from "../assets/Icons";
import { Link, useNavigate } from "react-router-dom";

function CheckoutComponent() {
	const queryClient = useQueryClient();
	const [customer, setCustomer] = useState("");
	const [checkout, setCheckout] = useState(false);
	const [error, setError] = useState("");
	const [lastOrder, setLastOrder] = useState("");
	const { addProduct, addedProducts = [], clearCart, totalPrice } = useShop();
	const navigate = useNavigate();

	const { mutate, isPending } = useMutation({
		mutationFn: postOrders,
		onError: (err) => {
			setError("Something went wrong, try again");
			console.error("Something went wrong:", err);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			setLastOrder(data);
			clearCart();
			setCustomer("");
			setError("");
			setCheckout(true);
			navigate(`/orderComplete/${data.orderID}`);
		},
	});

	useEffect(() => {
		const img = new Image();
		img.src = "/food.webp";
	}, []);

	const placeOrders = async (e) => {
		e.preventDefault();

		if (addedProducts.length === 0) {
			setError("Du har inte lagt till några produkter");
			return;
		}

		if (!customer.trim()) {
			setError("Skriv ditt namn innan betalning");
			return;
		}

		mutate({ customer, items: addedProducts, totalPrice: totalPrice });
	};

	return (
		<div className="cartOverview">
			<h2 className="cart-title">Din kundvagn</h2>

			{/* If addedProducts is empty, show the message, else show the list. Create a new HTML-element for each product in the list */}
			{addedProducts.length === 0 ? (
				<p className="cart-empty">Din kundvagn är tom</p>
			) : (
				<table className="cartTable">
					<thead>
						<tr>
							<th>Produkt</th>
							<th>Pris</th>
							<th>Antal</th>
							<th>Totalt</th>
							<th></th>
						</tr>
					</thead>
					<tbody className="cartBody">
						{addedProducts.map((product) => (
							<tr key={product.id} className="cartItem">
								<td className="cart-item-info">
									<img
										src={product.imageUrl}
										alt={product.name}
										className="cart-item-image"
										style={{ height: "15px" }}
									/>
									<span className="cart-Item-name">
										{product.name}
									</span>
								</td>
								<td className="cart-item-price">
									<span className="cart-label-price">
										{`${product.reducedPrice || product.price} kr`}
									</span>
								</td>
								<td className="cartItemControls">
									<ItemButton
										className="removeButton"
										title="Remove one product"
										icon={<RemoveIcon />}
										onClick={() => addProduct(product, -1)}
									/>
									<span className="cartItemQuantity">
										{`${product.quantity} st`}
									</span>
									<ItemButton
										className="addButton"
										title="Add one product"
										icon={<AddIcon />}
										onClick={() => addProduct(product, 1)}
									/>
								</td>
								<td className="cart-item-total">
									<span className="cartTotalPrice">
										{`${(
											(product.reducedPrice ||
												product.price) *
											product.quantity
										).toFixed(2)} kr`}
									</span>
								</td>
								<td>
									<ItemButton
										title="Remove item"
										icon={<EmptyListIcon />}
										className="cartBtnDel"
										onClick={() =>
											addProduct(
												product,
												-product.quantity,
											)
										}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			{addedProducts.length > 0 && (
				<ItemButton
					title="Clear cart"
					icon={<ClearListIcon />}
					className="cartDeleteBtn"
					onClick={() => clearCart()}
				/>
			)}

			<div className="checkoutTotal">
				<span className="cart-total-price-cost">
					{`Total kostnad: ${totalPrice.toFixed(2)}`} kr
				</span>
			</div>

			<div className="checkoutInfo">
				<form onSubmit={placeOrders}>
					{error && <p className="errorMessage">{error}</p>}
					<div className="checkoutName">
						<label
							htmlFor="cart-name-input"
							className="cartNameLabel">
							Ditt namn{" "}
						</label>
						<ItemInput
							className="cartNameInput"
							id="cart-name-input"
							placeholder="Namn..."
							onChange={(e) => {
								setCustomer(e.target.value);
								setError("");
							}}
							value={customer}
						/>
					</div>

					<ItemButton
						title="Place order"
						className="placeOrderBtn"
						type="submit"
						text={isPending ? "Skickar..." : "Order"}
						disabled={isPending}
					/>
				</form>
				<div className="navigationBtns">
					<ItemButton
						className="returnBtn"
						title="Go back"
						icon={<ReturnIcon />}
						onClick={() => navigate("/")}
					/>
					<Link to="/">
						<ItemButton
							icon={<HomeIcon />}
							title="Homepage"
							className="homeBtn"
						/>
					</Link>
				</div>
			</div>
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

export default CheckoutComponent;
