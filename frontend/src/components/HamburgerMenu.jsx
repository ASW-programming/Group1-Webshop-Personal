import ItemButton from "./ItemButton";
import { useShop } from "../utils/context";
import { HamburgerIcon, CancelIcon } from "../assets/Icons";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function HamburgerMenu() {
	const { categories, activeCategory, selectCategory } = useShop();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
	const location = useLocation();
	const navigate = useNavigate();

	const handleCategoryClick = (category) => {
		selectCategory(category);
		toggleMenu();
		if (location.pathname !== "") {
			navigate("/");
		} else {
			navigate(`/${category}`);
		}
	};

	return (
		<div>
			<ItemButton
				title={isMenuOpen ? "Close Menu" : "Show Categories"}
				onClick={toggleMenu}
				className="hamburgerBtn"
				icon={isMenuOpen ? <CancelIcon /> : <HamburgerIcon />}
			/>

			{isMenuOpen && (
				<div className="menuPanel">
					<div
						className={`categoryItem ${!activeCategory ? "activeCategory" : ""}`}
						onClick={() => handleCategoryClick("")}>
						Alla Produkter
					</div>
					{categories?.map((category) => (
						<div
							key={category}
							className={`categoryItem ${activeCategory === category ? "activeCategory" : ""}`}
							onClick={() => handleCategoryClick(category)}>
							<span>
								{activeCategory === category ? "✓ " : ""}
							</span>
							{category}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default HamburgerMenu;
