import fetch from 'node-fetch';

export function getKlarnaAuth() {
	const username = process.env.PUBLIC_KEY;
	const password = process.env.SECRET_KEY;
	const auth = `Basic ${Buffer.from(username + ':' + password).toString('base64')}`;
	return auth;
}

// Skapar en order hos Klarna
export async function createOrder(product) {
	const path = '/checkout/v3/orders';
	const auth = getKlarnaAuth();
	//https://api.playground.klarna.com/checkout/vs/orders
	const url = process.env.BASE_URL + path;
	console.log(url);
	const method = 'POST';
	const headers = {
		'Content-Type': 'application/json',
		Authorization: auth
	};

	// Priskalkulering och moms
	const quantity = 1;
	const price = product.price * 100;
	const total_amount = price * quantity;
	const tax_rate = 2500;
	const total_tax_amount = total_amount * 0.2;
	console.log("DEBug: ", product)

	const payload = {
		purchase_country: 'SE',
		purchase_currency: 'SEK',
		locale: 'sv-SE',
		order_amount: total_amount,
		order_tax_amount: total_tax_amount,
		order_lines: [
			{
				type: 'physical',
				reference: product.id,
				name: product.title,
				quantity,
				quantity_unit: 'pcs',
				unit_price: price,
				tax_rate: 2500,
				total_amount,
				total_discount_amount: 0,
				total_tax_amount,
				image_url: product.image
			}
		],
		merchant_urls: {
			"terms": "https://www.example.com/terms.html",
        	"checkout": "https://www.example.com/checkout.html",
			"confirmation": `${process.env.CONFIRMATION_URL}?klarna_order_id={checkout.order.id}`,
			"push": "https://www.example.com/api/push"
		}
	};

	const body = JSON.stringify(payload);
	const response = await fetch(url, { method, headers, body });
	const json = await response.json();

	if (response.status === 200 || response.status === 201) {
		return json;
	} else {
		console.error('Error', json);
		return {
			html_snippet: `<h1>${JSON.stringify(json)}</h1>`
		};
	}
}

// Hämtar en order hos Klarna
export async function retrieveOrder(order_id) {
	const path = `/checkout/v3/orders/${order_id}`;
	console.log('path:', path);
	const auth = getKlarnaAuth();
	const url = `${process.env.BASE_URL}${path}`;
	const method = 'GET';
	const headers = { Authorization: auth };
	const response = await fetch(url, { method, headers });

	if (response.status === 200 || response.status === 201) {
		const json = await response.json();
		return json;
	} else {
		return {
			html_snippet: `<h1>${response.status}${response.statusText}</h1>`
		};
	}
}
