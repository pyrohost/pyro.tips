// handle stripe webhook
import {
	DISCORD_WEBHOOK_URL,
	SECRET_STRIPE_KEY,
	WEBHOOK_SIGNING_SECRET
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { HookManager } from '$lib/hook-manager/index.js';

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
			const metadata = paymentIntent.metadata as unknown as {
				email: string;
				amount: number;
				message?: string;
				recipient: string;
			};
			const recipient = HookManager.staff.find((r) => r.user.id === metadata.recipient)!;
			try {
				const res = await fetch(DISCORD_WEBHOOK_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						content: `<@${recipient.user.id}>`,
						embeds: [
							{
								author: {
									name: 'pyro.food // new meal!',
									icon_url:
										'https://cdn.discordapp.com/avatars/1247401390083539025/1daacad0dd2e9dfeb215681354db20e1.webp?size=80',
									url: 'https://pyro.food'
								},
								title:
									'open up the dungeons where the engineers are kept - a new meal has been received!',
								fields: [
									{
										name: 'from',
										value: `\`${metadata.email}\``,
										inline: true
									},
									{
										name: 'to',
										value: `<@${recipient.user.id}>`,
										inline: true
									},
									{
										name: 'amount',
										value: `$${parseInt(metadata.amount.toString()).toFixed(2)}`,
										inline: true
									},
									...[
										metadata.message?.trim()
											? {
													name: 'reason',
													value: metadata.message.trim()
												}
											: null
									].filter(Boolean)
								],
								color: 16729400,
								footer: {
									text: 'made with <3 by maddie / nullptr',
									icon_url:
										'https://cdn.discordapp.com/avatars/1053012491006910504/670432da161e9bb6137b6f275e80b31f.webp?size=80'
								}
							}
						]
					})
				});
				const body = await res.text();
				console.log(body);
			} catch (e) {
				console.error(e);
			}
			break;
		}

		case 'charge.dispute.created': {
			const dispute = event.data.object;
			console.log('Dispute created:', dispute);
			break;
		}
	}
}
