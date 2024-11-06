import { prisma } from '$lib/server/db';
import type { Member } from '$lib/types';

export const load = async ({ url }) => {
	// get all staff from prisma
	const staff = (await prisma.staffMember.findMany()).map((x) => x.data) as unknown as Member[];
	return {
		pathname: url.pathname,
		staff
	};
};
