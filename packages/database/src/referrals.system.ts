import { eq } from "drizzle-orm";

import * as schema from "./drizzle";
import Database from "./index";
import type { ColumnRelation, IncludeRelation } from "./typings/types";
import type { TelegramUser } from "./user.system";

type ReferralParams<
	CreateIfNotExist extends boolean,
	Include extends IncludeRelation<"referrals">,
	Columns extends ColumnRelation<"referrals">,
> = Partial<{
	createIfNotExist?: CreateIfNotExist;
	referrerId?: CreateIfNotExist extends true ? number : never;
	include?: Include;
	columns?: Columns;
}>;

export class ReferralSystem {
	private readonly database: (typeof Database)["db"];

	constructor(database: (typeof Database)["db"]) {
		this.database = database;
	}

	public async resolve<
		CreateIfNotExist extends boolean = false,
		Include extends IncludeRelation<"referrals"> = {},
		Columns extends ColumnRelation<"referrals"> = {},
	>(
		user: CreateIfNotExist extends true ? TelegramUser : { id: number },
		params: ReferralParams<CreateIfNotExist, Include, Columns> = {}
	) {
		const { createIfNotExist, referrerId, include, columns } = params;
		const searchResult = await this.find<Include, Columns>(user, { include, columns });

		if (searchResult) return searchResult as Exclude<typeof searchResult, undefined>;

		if (createIfNotExist && referrerId) {
			const payload = user as TelegramUser;
			const created = await this.create(payload, { id: referrerId });

			if (!created) return undefined as Exclude<typeof searchResult, undefined>;

			if (include && Object.keys(include).length > 0)
				return (await this.find<Include, Columns>(user, { include, columns }))!;

			return created as unknown as Exclude<typeof searchResult, undefined>;
		}

		return undefined as Exclude<typeof searchResult, undefined>;
	}

	public readonly find = async <
		Include extends IncludeRelation<"referrals"> = {},
		Columns extends ColumnRelation<"referrals"> = {},
	>(
		{ id }: { id: number },
		{ include, columns }: ReferralParams<false, Include, Columns> = {}
	) =>
		this.database.query["referrals"].findFirst({
			columns: columns as Columns,
			where: eq(schema.referrals.referral, id),
			with: include as Include,
		});

	public readonly create = async (payload: TelegramUser, { id: referrerId }: { id: number }) => {
		await this.database
			.insert(schema.users)
			.values({
				id: payload.id,
				first_name: payload.first_name,
				last_name: payload.last_name ?? null,
				username: payload.username ?? null,
				is_premium: payload.is_premium ?? false,
			})
			.onConflictDoNothing();

		try {
			return (
				await this.database
					.insert(schema.referrals)
					.values({
						referral: payload.id,
						referrer: referrerId,
					})
					.onConflictDoNothing()
					.returning()
			)[0];
		} catch (e) {
			return undefined;
		}
	};
}
