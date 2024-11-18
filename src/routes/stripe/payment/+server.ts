import { env } from '$env/dynamic/private';
import { prisma } from '$lib/server/db/index.js';
import type { Member } from '$lib/types';
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';

export async function POST({ request }) {
	const stripe = new Stripe(env.SECRET_STRIPE_KEY);
	const staff = (await prisma.staffMember.findMany()).map((x) => x.data as unknown as Member);
	const body = await request.json();
	if (typeof body.recipient !== 'string' || !staff.some((r) => r.user.id === body.recipient)) {
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
		automatic_payment_methods: {
			enabled: true
		},
		metadata: {
			...body.orderData,
			recipient: body.recipient
		}
	});

	return json(paymentIntent);
}
