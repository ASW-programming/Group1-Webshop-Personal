import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../utils/calls.js";
import ItemButton from "./ItemButton";
import { ReturnIcon } from "../assets/Icons";
import { useNavigate, useParams } from "react-router-dom";

function OrderCompleted() {
	const { id } = useParams();
	const navigate = useNavigate();

	const {
		data: orders,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["orders"],
		queryFn: getOrders,
	});

	const lastOrder = orders?.find((p) => Number(p.orderID) === Number(id));

	if (isLoading) return <p>Laddar...</p>;
	if (isError) return <p>Något gick fel</p>;
	if (!lastOrder) return <p>Order hittades inte</p>;

	//When checkout is true show frindly message.
	return (
		<div className="checkoutCart">
			{lastOrder && (
				<div className="checkedOutInfo">
					<h2>
						Tack för din beställning,{" "}
						<span id="lastOrderCustomer">{lastOrder.customer}</span>
						!
					</h2>
					<p>
						Ordernummer{" "}
						{String(lastOrder.orderID).padStart(5, "0000")}
					</p>
					<h3>Produkter:</h3>
					<ul>
						{lastOrder.items.map((i) => (
							<li key={i.id}>
								<div className="checkoutProductInfo">
									<img
										src={i.imageUrl}
										style={{
											width: "35px",
											height: "35px",
										}}
									/>
									<span>{i.name} </span>
									<span>{i.quantity} st</span>
									<span>
										{(i.reducedPrice || i.price) *
											i.quantity}{" "}
										kr
									</span>
								</div>
							</li>
						))}
					</ul>
					<p>Total kostnad: {lastOrder.totalPrice} kr</p>
					<p>
						Vi meddelar dig när din beställning är klar för att
						hämtas!
					</p>
				</div>
			)}

			<ItemButton
				className="goBackButton"
				title="Go back"
				icon={<ReturnIcon />}
				onClick={() => navigate("/")}
			/>
			<img
				className="foodPicture"
				src="/food.webp"
				alt="Food illustration"
			/>
		</div>
	);
}

export default OrderCompleted;
