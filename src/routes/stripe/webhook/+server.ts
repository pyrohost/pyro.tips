// handle stripe webhook
import { env } from '$env/dynamic/private';
import { prisma } from '$lib/server/db/index.js';
import type { Member } from '$lib/types/index.js';
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';

export async function POST({ request }) {
	const stripe = new Stripe(env.SECRET_STRIPE_KEY);
	const endpointSecret = env.WEBHOOK_SIGNING_SECRET;

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
			const staff = (await prisma.staffMember.findMany()).map((x) => x.data) as unknown as Member[];
			const recipient = staff.find((r) => r.user.id === metadata.recipient)!;
			try {
				const isPyro = recipient.user.id === '1237177197094113321';
				await fetch(env.DISCORD_WEBHOOK_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						avatar_url:
							'https://cdn.discordapp.com/avatars/1237177197094113321/1831aa88532a30eaaf023cac5aec8633.webp?size=128',
						username: 'pyro.tips',
						content: isPyro ? '<@&1104932372467695768>' : `<@${recipient.user.id}>`,
						embeds: [
							{
								author: {
									name: 'pyro.tips // new donation!',
									icon_url:
										'https://cdn.discordapp.com/avatars/1247401390083539025/1daacad0dd2e9dfeb215681354db20e1.webp?size=80',
									url: 'https://pyro.tips'
								},
								title: `$${parseInt(metadata.amount.toString()).toFixed(2)} donation from ${
									metadata.email
								}`,
								fields: [
									{
										name: 'from',
										value: `\`${metadata.email}\``,
										inline: true
									},
									{
										name: 'to',
										value: isPyro ? '**THE ENTIRE TEAM!!!**' : `<@${recipient.user.id}>`,
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
			} catch (e) {
				console.error(e);
			}
			break;
		}
	}
}
