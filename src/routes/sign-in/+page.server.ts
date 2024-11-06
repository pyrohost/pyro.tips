import {
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	DISCORD_REDIRECT_URI
} from '$env/static/private';
import { prisma } from '$lib/server/db/index.js';
import type { Member } from '$lib/types';
import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
	const code = url.searchParams.get('code');
	if (!code) return { redirectUri: DISCORD_REDIRECT_URI };
	await processCode(code); // you can remove the await but it wont show the user on redirect
	return redirect(303, '/');
}

async function processCode(code: string) {
	const response = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: DISCORD_CLIENT_ID,
			client_secret: DISCORD_CLIENT_SECRET,
			grant_type: 'authorization_code',
			code,
			redirect_uri: DISCORD_REDIRECT_URI
		})
	});
	const body = (await response.json()) as {
		token_type: string;
		access_token: string;
	};
	const guildResponse = await fetch(
		'https://discord.com/api/users/@me/guilds/1098606295868788876/member',
		{
			headers: {
				Authorization: `${body.token_type} ${body.access_token}`
			}
		}
	);
	const guildBody = await guildResponse.json();
	if (!guildBody.roles.includes('1104932372467695768')) {
		return;
	}
	const existingStaff = await prisma.staffMember.findMany();
	const existingStaffIds = existingStaff.map((staff) => (staff.data as unknown as Member)?.user.id);
	if (existingStaffIds.includes(guildBody.user.id)) {
		return;
	}
	await prisma.staffMember.create({
		data: {
			data: guildBody
		}
	});
}
