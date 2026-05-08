require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const serviceAccount = {
	type: process.env.FIREBASE_TYPE,
	project_id: process.env.FIREBASE_PROJECT_ID,
	private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
	private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	client_email: process.env.FIREBASE_CLIENT_EMAIL,
	client_id: process.env.FIREBASE_CLIENT_ID,
};

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// hämtar våra produkter
app.get("/api/products", async (req, res) => {
	try {
		const productCollection = db.collection("products");
		const allProductsSnapshot = await productCollection.get();

		if (allProductsSnapshot.empty) {
			return res.status(200).json([]);
		}

		let products = [];

		allProductsSnapshot.forEach((product) => {
			products.push({
				id: product.id,
				...product.data(),
			});
		});

		return res.status(200).json(products);
	} catch (error) {
		console.log("Could not fetch products", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/api/products/:id", async (req, res) => {
	try {
		const productId = req.params.id;

		const productDoc = db.collection("products").doc(productId);
		const productSnapshot = await productDoc.get();

		if (!productSnapshot.exists) {
			return res
				.status(404)
				.json({ error: "There is no product with this id" });
		}

		return res
			.status(200)
			.json({ id: productSnapshot.id, ...productSnapshot.data() });
	} catch (error) {
		console.log("Fel vid hämtning av produkt data", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// ---------------------------------------------------------
// ENDPOINT 1: POST /api/products (För en produkt i taget)
// ---------------------------------------------------------

app.post("/api/addProduct", async (req, res) => {
	try {
		const productData = req.body;

		// Enkel validering
		if (
			!productData.name ||
			!productData.price ||
			!productData.category ||
			!productData.description ||
			!productData.imageUrl ||
			!productData.stock
		) {
			return res.status(400).json({
				error: "Namn, pris, kategori, beskrivning, bild-URL och lager är obligatoriska fält.",
			});
		}

		// Lägg till i Firestore-kollektionen 'products'
		const docRef = await db.collection("products").add(productData);

		res.status(201).json({
			message: "Produkt skapad!",
			id: docRef.id,
			product: productData,
		});
	} catch (error) {
		console.error("Fel vid tillägg av produkt:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// ---------------------------------------------------------
// ENDPOINT 2: POST /api/products/bulk (För att skicka in hela arrayen)
// ---------------------------------------------------------
app.post("/api/products/bulk", async (req, res) => {
	try {
		const productsArray = req.body;

		if (!Array.isArray(productsArray)) {
			return res
				.status(400)
				.json({ error: "Body måste vara en JSON-array." });
		}

		// Använder en batch för att skriva alla på en gång effektivt
		const batch = db.batch();

		productsArray.forEach((product) => {
			// Skapar en ny referens med ett autogenererat ID
			const docRef = db.collection("products").doc();
			batch.set(docRef, product);
		});

		await batch.commit();

		res.status(201).json({
			message: `${productsArray.length} produkter tillagda i databasen via batch!`,
		});
	} catch (error) {
		console.error("Fel vid batch-tillägg:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.route("/api/orders")
	.get(async (req, res) => {
		try {
			const snapshot = await db.collection("orders").get();

			if (snapshot.empty) return res.status(200).json([]);

			const orders = [];

			snapshot.forEach((order) => {
				const data = order.data();
				orders.push({
					id: order.id,
					...data,
					createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
				});
			});

			res.status(200).json(orders);
		} catch (error) {
			console.log("Something wrong with get-endpoint.", error.message);
			res.status(500).json({ error: "Internal server error" });
		}
	})
	.post(async (req, res) => {
		try {
			const { customer, items, totalPrice } = req.body;

			if (!customer || !items || !totalPrice) {
				return res
					.status(400)
					.json({ error: "customer, items och totalPrice krävs." });
			}

			// Get latest orderID from DB.
			const snapshot = await db
				.collection("orders")
				.orderBy("orderID", "desc")
				.limit(1)
				.get();

			let nextNumber = 1;

			if (!snapshot.empty) {
				const lastOrder = snapshot.docs[0].data().orderID;
				nextNumber = lastOrder + 1;
			}

			const formattedID = String(nextNumber).padStart(5, "0");
			const now = admin.firestore.Timestamp.now();

			const docRef = await db.collection("orders").add({
				orderID: nextNumber,
				orderIDFormatted: formattedID,
				customer,
				items,
				totalPrice,
				createdAt: now,
			});

			res.status(200).json({
				id: docRef.id,
				orderID: formattedID,
				customer,
				items,
				totalPrice,
				createdAt: now.seconds,
			});
		} catch (error) {
			console.log("Fel:", error.message);
			res.status(500).json({ error: "Internal server error" });
		}
	});

app.delete("/api/deleteOrders/:id", async (req, res) => {
	try {
		const orderID = req.params.id;

		if (!orderID)
			return res.status(400).json({ error: "Missing order ID" });

		await db.collection("orders").doc(orderID).delete();
		res.status(200).json({ message: "Order deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
