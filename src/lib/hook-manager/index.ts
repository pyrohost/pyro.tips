interface Member {
	avatar: null | string;
	banner: null | string;
	communication_disabled_until: null;
	flags: number;
	joined_at: string;
	nick: null | string;
	pending: boolean;
	premium_since: null | string;
	roles: string[];
	unusual_dm_activity_until: null;
	user: User;
	mute: boolean;
	deaf: boolean;
}

interface User {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	public_flags: number;
	flags: number;
	banner: null;
	accent_color: null | number;
	global_name: null | string;
	avatar_decoration_data: Avatardecorationdatum | null;
	banner_color: null | string;
	clan: Clan | null;
}

interface Clan {
	identity_guild_id: string;
	identity_enabled: boolean;
	tag: string;
	badge: string;
}

interface Avatardecorationdatum {
	asset: string;
	sku_id: string;
	expires_at: null;
}

export class HookManager {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static interval: any;
	public static staff: Member[] = [];
}
