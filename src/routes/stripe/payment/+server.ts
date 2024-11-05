import { SECRET_STRIPE_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripe = new Stripe(SECRET_STRIPE_KEY);

export async function POST({ request }) {
	const body = await request.json();
	if (body.orderData.amount < 1) {
		return json({ error: 'Invalid amount' });
	}
	const paymentIntent = await stripe.paymentIntents.create({
		amount: body.orderData.amount * 100,
		currency: 'usd',
		payment_method_types: ['card']
	});

	return json({ clientSecret: paymentIntent.client_secret });
}
