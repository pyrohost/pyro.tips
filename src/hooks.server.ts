import { DISCORD_TOKEN } from '$env/static/private';
import { HookManager } from '$lib/hook-manager';

if (HookManager.interval) {
	clearInterval(HookManager.interval);
}

async function fetchData() {
	const response = await fetch(
		'https://discord.com/api/v9/guilds/1098606295868788876/members-search',
		{
			headers: {
				Authorization: DISCORD_TOKEN,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				or_query: {},
				and_query: {
					role_ids: {
						and_query: ['1104932372467695768']
					}
				},
				limit: 250
			})
		}
	);
	const data = await response.json();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	HookManager.staff = (data.members.map((m: any) => m.member) as typeof HookManager.staff)
		.sort((a, b) => {
			const aUser = a.nick || a.user.global_name || a.user.username;
			const bUser = b.nick || b.user.global_name || b.user.username;
			return aUser.localeCompare(bUser);
		})
		.map((m) => {
			if (m.user.id !== '1237177197094113321') return m;
			m.nick = 'The Pyro Team';
			return m;
		});
}

if (HookManager.staff.length === 0) {
	fetchData();
}

HookManager.interval = setInterval(fetchData, 1000 * 60 * 60);
