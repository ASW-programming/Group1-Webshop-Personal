import { useState, useEffect, useRef } from "react";
import ItemButton from "./ItemButton";
import { ArrowIcon } from "../assets/Icons";
import { useNavigate } from "react-router-dom";

const ScrollBanner = ({ slides = [] }) => {
	const [current, setCurrent] = useState(0);
	const intervalRef = useRef(null);
	const navigate = useNavigate();

	// Start / Restart timer.
	const startTimer = () => {
		clearInterval(intervalRef.current);

		intervalRef.current = setInterval(() => {
			setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
		}, 4000);
	};

	// Next.
	const nextSlide = () => {
		setCurrent(
			(prev) => (prev === slides.length - 1 ? 0 : prev + 1), // Is it last (?) Go back to the first one (0) else go to next (+1).
		);
		startTimer(); // Reset timer.
	};

	// Prev.
	const prevSlide = () => {
		setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
		startTimer(); // Reset timer.
	};

	// Start timer when component loads.
	useEffect(() => {
		if (slides.length === 0) return;

		startTimer();

		return () => clearInterval(intervalRef.current);
	}, [slides.length]);

	if (slides.length === 0) {
		return <div>No images found</div>;
	}

	const slide = slides[current];

	return (
		<div className="scrollBannerContainer">
			<div className="scrollBanner">
				<ItemButton
					title="Previous"
					className="arrowButton"
					onClick={prevSlide}
					icon={<ArrowIcon width="20px" height="20px" />}
				/>
				<div
					className="bannerContent"
					onClick={() => navigate(`/product/${slide.id}`)}>
					<img
						src={slide.image}
						alt="banner"
						className="banner-image"
					/>

					<div className="bannerText">
						{slide.subtitle && <p>{slide.subtitle}</p>}

						{slide.price && (
							<div className="banner-price">
								<span className="sale-price">
									{slide.price} kr
								</span>
								<span
									className="original-price"
									style={{
										textDecoration: "line-through",
										marginLeft: "10px",
									}}>
									{slide.originalPrice} kr
								</span>
							</div>
						)}
					</div>
				</div>
				<ItemButton
					title="Next"
					className="arrowButton"
					onClick={nextSlide}
					icon={<ArrowIcon transform={"rotate(180 16 16)"} />}
				/>
			</div>
		</div>
	);
};

export default ScrollBanner;
