import { HookManager } from '$lib/hook-manager';

export const load = ({ url }) => {
	return {
		staff: HookManager.staff,
		pathname: url.pathname
	};
};
