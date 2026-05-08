import ProductCard from "./components/ProductCard";
import "./App.css";
import LandingComponent from "./components/LandingComponent";
import ProductDetails from "./components/ProductDetails";
import ItemHeader from "./components/ItemHeader";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ShopProvider } from "./utils/context";
import CheckoutComponent from "./components/CheckoutComponent";
import OrderHistory from "./components/OrderHistory";
import OrderCompleted from "./components/OrderCompleted";

function App() {
	return (
		<div>
			<Router>
				<ShopProvider>
					<ItemHeader />

					<Routes>
						<Route path="/" element={<LandingComponent />} />
						<Route
							path="/product/:id"
							element={<ProductDetails />}
						/>
						<Route
							path="/orderHistory"
							element={<OrderHistory />}
						/>
						<Route
							path="/checkout"
							element={<CheckoutComponent />}
						/>
						<Route
							path="/orderComplete/:id"
							element={<OrderCompleted />}
						/>
					</Routes>
				</ShopProvider>
			</Router>
		</div>
	);
}

export default App;
