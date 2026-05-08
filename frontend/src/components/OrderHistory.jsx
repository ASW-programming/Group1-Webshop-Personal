import ItemButton from "./ItemButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, deleteOrder } from "../utils/calls.js";
import {
	ReturnIcon,
	HomeIcon,
	EmptyListIcon,
	SortIcon,
} from "../assets/Icons.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function OrderHistory() {
	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const [deletingId, setDeletingId] = useState(null);
	const [sortCategory, setSortCategory] = useState("orderID");
	const [sortAscending, setSortAscending] = useState(true);

	const {
		data: orders,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["orders"],
		queryFn: getOrders,
	});

	const { mutate, isPending } = useMutation({
		mutationFn: deleteOrder,
		async onMutate(deletedOrder) {
			setDeletingId(deletedOrder);

			await new Promise((resolve) => setTimeout(resolve, 750));

			// Stop current fetches
			await queryClient.cancelQueries({ queryKey: ["orders"] });

			// Save current data
			const previousOrders = queryClient.getQueryData(["orders"]);

			//Update Cache with new value
			queryClient.setQueryData(["orders"], (old) =>
				old.filter((u) => u.id !== deletedOrder),
			);

			return { previousOrders };
		},
		onError: (err, newOrder, context) => {
			setDeletingId(null);
			//Undo if it went wrong
			queryClient.setQueryData(["orders"], context.previousOrders);
			console.error("Something went wrong:", err);
		},
		onSettled: () => {
			setDeletingId(null);
			queryClient.invalidateQueries({ queryKey: ["orders"] });
		},
	});

	const formatDate = (createdAt) =>
		createdAt ? new Date(createdAt).toLocaleString("sv-SE") : "Okänt datum";

	const handleSort = (key) => {
		if (sortCategory !== key) setSortAscending(true);
		else setSortAscending((prev) => !prev);
		setSortCategory(key);
	};

	const sortIcons = (category, sortCategory, sortAscending) => ({
		style: { visibility: sortCategory === category ? "visible" : "hidden" },
		transform: sortAscending ? "" : "rotate(180, 8.5, 5.5)",
	});

	if (isLoading) return <p>Loading</p>;
	if (isError) return <p>Error</p>;

	return (
		<div className="orderHistoryContent">
			<div className="navigationBtns">
				<Link to="/">
					<ItemButton title="Homepage" icon={<HomeIcon />} />
				</Link>

				<ItemButton
					title="Go back"
					icon={<ReturnIcon />}
					onClick={() => navigate(-1)}
				/>
			</div>

			{orders.length > 0 ? (
				<table className="orderTable">
					<thead>
						<tr className="orderCategories">
							<th
								className={
									sortCategory === "orderID"
										? "chosen"
										: "notChosen"
								}
								onClick={() => handleSort("orderID")}>
								<SortIcon
									{...sortIcons(
										"orderID",
										sortCategory,
										sortAscending,
									)}
								/>{" "}
								Order #
							</th>
							<th
								className={
									sortCategory === "createdAt"
										? "chosen"
										: "notChosen"
								}
								onClick={() => handleSort("createdAt")}>
								<SortIcon
									{...sortIcons(
										"createdAt",
										sortCategory,
										!sortAscending,
									)}
								/>
								Datum
							</th>
							<th
								className={
									sortCategory === "customer"
										? "chosen"
										: "notChosen"
								}
								onClick={() => handleSort("customer")}>
								<SortIcon
									{...sortIcons(
										"customer",
										sortCategory,
										!sortAscending,
									)}
								/>
								Kund
							</th>
							<th>Produkt</th>
							<th>Antal</th>
							<th>Pris</th>
							<th
								className={
									sortCategory === "totalPrice"
										? "chosen"
										: "notChosen"
								}
								onClick={() => handleSort("totalPrice")}>
								<SortIcon
									{...sortIcons(
										"totalPrice",
										sortCategory,
										sortAscending,
									)}
								/>
								Total
							</th>
							<th
								className={`${
									sortCategory === "totalPrice"
										? "chosen"
										: "notChosen"
								} deleteHeader`}></th>
						</tr>
					</thead>
					<tbody>
						{orders
							?.slice()
							.sort((a, b) => {
								const choiceA = a[sortCategory];
								const choiceB = b[sortCategory];

								if (!sortCategory) return 0;

								// Checks if Choice A is a string and not a date. If not a date then isNaN = true and return to sort String
								if (typeof choiceA === "string") {
									// Checks if A is greater than B with support of Swedish Letters
									const comparison = sortAscending
										? choiceA.localeCompare(
												choiceB,
												"sv-SE",
											)
										: choiceB.localeCompare(
												choiceA,
												"sv-SE",
											);

									// If word starts with identical letters secondary sort by id.
									return comparison !== 0
										? comparison
										: a.id - b.id;
								}

								// Sorts numbers
								return sortAscending
									? choiceB - choiceA
									: choiceA - choiceB;
							})
							.map((o) =>
								o.items.map((i, index) => (
									<tr
										key={`${o.id}-${i.id}`}
										className={`orderRow ${deletingId === o.id ? "slideOutLeft" : ""}`}>
										{index === 0 && (
											<td rowSpan={o.items.length}>
												{o.orderIDFormatted ||
													"Order ID Saknas"}
											</td>
										)}

										{index === 0 && (
											<td rowSpan={o.items.length}>
												{formatDate(o.createdAt)}
											</td>
										)}

										{index === 0 && (
											<td
												rowSpan={o.items.length}
												className="orderCustomer">
												{o.customer}
											</td>
										)}
										<td className="orderImage orderName">
											<img
												src={i.imageUrl}
												className="orderItemImage"
											/>
											{i.name}
										</td>
										<td className="orderQuantity">
											{i.quantity} st
										</td>
										<td className="orderPrice">
											{(i.reducedPrice || i.price) *
												i.quantity}{" "}
											kr
										</td>
										{index === 0 && (
											<td
												rowSpan={o.items.length}
												className="orderTotal">
												{o.totalPrice} kr
											</td>
										)}
										{index === 0 && (
											<td rowSpan={o.items.length}>
												<ItemButton
													className="cartBtnDel"
													title="Delete Order"
													icon={<EmptyListIcon />}
													onClick={() => {
														if (
															window.confirm(
																`Delete order ${o.orderIDFormatted}?`,
															)
														) {
															mutate(o.id);
														}
													}}
													disabled={isPending}
												/>
											</td>
										)}
									</tr>
								)),
							)}
					</tbody>
				</table>
			) : (
				<h2>No orders placed yet</h2>
			)}
		</div>
	);
}

export default OrderHistory;
