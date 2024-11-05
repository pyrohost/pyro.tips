// handle stripe webhook
import {
	DISCORD_WEBHOOK_URL,
	SECRET_STRIPE_KEY,
	WEBHOOK_SIGNING_SECRET
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import DiscordWebhook from 'discord-webhook-ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const webhook = new (DiscordWebhook as any).default(DISCORD_WEBHOOK_URL) as DiscordWebhook;

const stripe = new Stripe(SECRET_STRIPE_KEY);

export async function POST({ request }) {
	const endpointSecret = WEBHOOK_SIGNING_SECRET;

	const sig = request.headers.get('stripe-signature') || '';
	const payload = await request.text();
	let event;

	try {
		event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
	} catch (err) {
		return json({ error: `Webhook Error: ${err}` }, { status: 400 });
	}

	handleEvent(event);

	return new Response(null, { status: 200 });
}

async function handleEvent(event: Stripe.Event) {
	switch (event.type) {
		case 'payment_intent.succeeded': {
			const paymentIntent = event.data.object;
			await webhook.execute({
				content: `Payment succeeded: ${paymentIntent.id}`
			});
			break;
		}
	}
}
