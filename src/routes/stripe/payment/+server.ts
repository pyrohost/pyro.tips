import { SECRET_STRIPE_KEY } from '$env/static/private';
import { HookManager } from '$lib/hook-manager/index.js';
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';

const stripe = new Stripe(SECRET_STRIPE_KEY);

export async function POST({ request }) {
	const body = await request.json();
	if (
		typeof body.recipient !== 'string' ||
		!HookManager.staff.some((r) => r.user.id === body.recipient)
	) {
		return json({ error: 'Invalid recipient' });
	}
	if (body.orderData.amount < 1) {
		return json({ error: 'Invalid amount' });
	}
	if (body.orderData.amount > 1000) {
		return json({ error: 'Amount too high' });
	}
	if (!body.orderData || !body.orderData.amount || !body.orderData.email) {
		return json({ error: 'Invalid order data' });
	}
	const paymentIntent = await stripe.paymentIntents.create({
		amount: body.orderData.amount * 100,
		currency: 'usd',
		payment_method_types: ['card'],
		metadata: {
			...body.orderData,
			recipient: body.recipient
		}
	});

	return json({ clientSecret: paymentIntent.client_secret });
}
