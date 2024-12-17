import { config } from 'dotenv';
import express from 'express';
import { getProduct, getProducts } from './services/api.js';
import { createOrder, retrieveOrder } from './services/klarna.js';
const app = express();
config();


app.get('/', async (req, res) => {
	const products = await getProducts();
	console.log(products)
	const markup = products
		.map(
			(p) =>
				`<a style="display: block; color: black; border: solid 2px black; margin: 20px; padding: 10px;" href="/products/${p.id}">${p.title} - ${p.price} kr</a>`
		)
		.join(' ');
	res.send(markup);
});

app.get('/products/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const product = await getProduct(id);
		const klarnaResponse = await createOrder(product);
		const markup = klarnaResponse.html_snippet;
		res.send(markup);
	} catch (error) {
		res.send(500).send(error.message);
	}
});

app.get('/confirmation', async (req, res) => {
	console.log('Query Parameters:', req.query);

	const { klarna_order_id } = req.query;
	console.log("klarna_order_id", klarna_order_id);

	if (!klarna_order_id) {
        return res.status(400).send('Order ID is missing.');
	}
	
	try {
	const klarnaResponse = await retrieveOrder(klarna_order_id);
	console.log('Klarna Response:', klarnaResponse);

	const { html_snippet } = klarnaResponse;
		res.send(html_snippet);
	} catch (error) {
		console.error('Error retrieving Klarna order:', error.message);
		res.status(500).send('Error retrieving Klarna order.')
	}

});

app.listen(process.env.PORT);
