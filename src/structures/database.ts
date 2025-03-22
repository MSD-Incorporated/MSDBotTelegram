// TODO: Recode
import { SQL } from "bun";
import { and, eq, type DBQueryConfig, type ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, type BunSQLDatabase } from "drizzle-orm/bun-sql";
import type { Chat, ChatMember, Chat as TelegramChat, User as TelegramUser } from "typegram";
import * as schema from "../drizzle/index";

export type Schema = typeof schema;
export type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
	"one" | "many",
	boolean,
	TSchema,
	TSchema[TableName]
>["with"];

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE, DATABASE_URL } = process.env;

export class Database {
	readonly client = new SQL({
		host: "localhost",
		port: 5432,
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
		database: POSTGRES_DATABASE,
		ssl: DATABASE_URL ? true : false,
	});

	public db: BunSQLDatabase<Schema>;

	constructor() {
		this.db = drizzle(this.client, { schema });
	}

	public readonly connect = async () => {
		await this.client.connect();
	};

	readonly resolveDick = async <
		U extends TelegramUser | { id: number },
		CINE extends boolean,
		I extends IncludeRelation<"dicks">,
	>(
		user: U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const searchResult = await this.db.query.dicks
			.findFirst({ where: eq(schema.dicks.user_id, user.id) })
			.execute();

		if (!searchResult && createIfNotExists && (user as TelegramUser)?.first_name) {
			await this.resolveUser(user as TelegramUser, true);
			await this.writeDick(user as TelegramUser);
		}

		return this.db.query.dicks.findFirst({ where: eq(schema.dicks.user_id, user.id), with: include }).execute();
	};

	readonly writeDick = async <U extends TelegramUser | { id: number }, D extends schema.TDick>(
		{ id }: U,
		data?: Partial<D>
	) => {
		return this.db
			.insert(schema.dicks)
			.values({ ...data, user_id: id })
			.execute();
	};

	readonly updateDick = async <U extends TelegramUser, D extends schema.TDick>({ id }: U, data: Partial<D>) => {
		return this.db.update(schema.dicks).set(data).where(eq(schema.dicks.user_id, id)).execute();
	};

	readonly resolveDickHistory = async <
		U extends TelegramUser & { id: number },
		CINE extends boolean,
		I extends IncludeRelation<"dick_history">,
	>(
		user: U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const searchResult = await this.db.query.dick_history
			.findFirst({ where: eq(schema.dick_history.user_id, user.id) })
			.execute();

		if (!searchResult && createIfNotExists && (user as TelegramUser)?.first_name) {
			await this.resolveUser(user as TelegramUser, true);
			await this.resolveDick(user as TelegramUser, true);
			await this.writeDickHistory(user);
		}

		return this.db.query.dick_history
			.findMany({ where: eq(schema.dick_history.user_id, user.id), with: include })
			.execute();
	};

	readonly writeDickHistory = async <
		U extends { id: number; size?: number; difference?: number },
		D extends schema.TDickHistory,
	>(
		{ id, size, difference }: U,
		data?: Partial<D>
	) => {
		return this.db
			.insert(schema.dick_history)
			.values({ ...data, user_id: id, size: size ?? 0, difference: difference ?? 0 })
			.execute();
	};

	readonly updateDickHistory = async <U extends TelegramUser & { dick_id: number }, D extends schema.TDickHistory>(
		{ id, dick_id }: U,
		data: Partial<D>
	) => {
		return this.db
			.update(schema.dick_history)
			.set(data)
			.where(and(eq(schema.dick_history.user_id, id), eq(schema.dick_history.id, dick_id)))
			.execute();
	};

	readonly resolveUser = async <
		U extends TelegramUser | { id: number },
		CINE extends boolean,
		I extends IncludeRelation<"users">,
	>(
		user: U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const searchResult = await this.db.query.users
			.findFirst({ where: eq(schema.users.user_id, user.id), with: include })
			.execute();

		if (!searchResult && createIfNotExists && (user as TelegramUser)?.first_name) {
			await this.writeUser(user as TelegramUser);
		}

		return this.db.query.users.findFirst({ where: eq(schema.users.user_id, user.id), with: include }).execute();
	};

	readonly resolveUsers = async <I extends IncludeRelation<"users">>(include: I = {} as I) => {
		return this.db.query.users.findMany({ with: include }).execute();
	};

	readonly writeUser = async <U extends TelegramUser, D extends schema.TUser>(
		{ id, first_name, last_name, username, is_premium }: U,
		data?: Partial<D>
	) => {
		return this.db
			.insert(schema.users)
			.values({
				...data,
				user_id: id,
				first_name,
				last_name,
				username,
				is_premium,
				status: data?.status ?? "user",
			})
			.execute();
	};

	readonly updateUser = async <U extends TelegramUser, D extends schema.TUser>({ id }: U, data: Partial<D>) => {
		return this.db.update(schema.users).set(data).where(eq(schema.users.user_id, id)).execute();
	};

	readonly resolveUserButtons = async <
		U extends TelegramUser | { id: number },
		I extends IncludeRelation<"user_buttons">,
	>(
		user: U,
		include: I = {} as I
	) => {
		return this.db.query.user_buttons
			.findMany({ where: eq(schema.user_buttons.user_id, user.id), with: include })
			.execute();
	};

	readonly writeUserButton = async <
		U extends TelegramUser | { id: number },
		B extends { link: string; text: string },
		D extends schema.TUserButton,
	>(
		{ id }: U,
		{ link, text }: B,
		data?: Partial<D>
	) => {
		return this.db
			.insert(schema.user_buttons)
			.values({ ...data, user_id: id, text: text ?? null, link: link ?? null })
			.execute();
	};

	readonly deleteUserButton = async <
		U extends TelegramUser | { id: number },
		B extends { link: string; text: string },
	>(
		{ id }: U,
		{ link, text }: B
	) => {
		return this.db
			.delete(schema.user_buttons)
			.where(
				and(
					eq(schema.user_buttons.user_id, id),
					eq(schema.user_buttons.link, link),
					eq(schema.user_buttons.text, text)
				)
			)
			.execute();
	};

	/**
	 * Resolves referrers of user
	 */
	readonly resolveReferrers = async <U extends TelegramUser & { id: number }, I extends IncludeRelation<"referrals">>(
		{ id }: U,
		include: I = {} as I
	) => {
		return this.db.query.referrals.findMany({ where: eq(schema.referrals.referral, id), with: include }).execute();
	};

	/**
	 * Resolves referrer by id
	 */
	readonly resolveReferrer = async <U extends TelegramUser & { id: number }, I extends IncludeRelation<"referrals">>(
		{ id }: U,
		include: I = {} as I
	) => {
		return this.db.query.referrals.findFirst({ where: eq(schema.referrals.referrer, id), with: include }).execute();
	};

	readonly writeReferral = async <U extends TelegramUser | { id: number }, D extends schema.TRefferal>(
		referral: U,
		referrer: U,
		data?: Partial<D>
	) => {
		return this.db
			.insert(schema.referrals)
			.values({ ...data, referral: referral.id, referrer: referrer.id })
			.execute();
	};

	readonly resolveChat = async <
		C extends
			| (TelegramChat.GroupChat | TelegramChat.SupergroupChat | TelegramChat.ChannelChat)
			| { id: number; type: Chat.AbstractChat["type"] },
		CINE extends boolean,
		I extends IncludeRelation<"chats">,
	>(
		chat: C,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		if (chat.type == "private") return;

		const searchResult = await this.db.query.chats
			.findFirst({ where: eq(schema.chats.chat_id, chat.id), with: include })
			.execute();

		if (!searchResult && createIfNotExists) {
			await this.writeChat(
				chat as (TelegramChat.GroupChat | TelegramChat.SupergroupChat | TelegramChat.ChannelChat) & {
					is_forum: boolean;
				}
			);
		}

		return this.db.query.chats.findFirst({ where: eq(schema.chats.chat_id, chat.id), with: include }).execute();
	};

	readonly writeChat = async <
		C extends (TelegramChat.GroupChat | TelegramChat.SupergroupChat | TelegramChat.ChannelChat) & {
			username?: string;
			is_forum?: boolean;
		},
		D extends schema.TChat,
	>(
		{ id, type, title, is_forum, username }: C,
		data?: Partial<D>
	) => {
		return this.db
			.insert(schema.chats)
			.values({ ...data, chat_id: id, type, title, username: username ?? null, is_forum: is_forum ?? null })
			.execute();
	};

	readonly updateChat = async <
		C extends (TelegramChat.GroupChat | TelegramChat.SupergroupChat | TelegramChat.ChannelChat) & {
			username?: string;
			is_forum?: boolean;
		},
		D extends schema.TChat,
	>(
		{ id }: C,
		data: Partial<D>
	) => {
		return this.db.update(schema.chats).set(data).where(eq(schema.chats.chat_id, id)).execute();
	};

	readonly resolveChatMember = async <
		C extends (TelegramChat.GroupChat | TelegramChat.SupergroupChat | TelegramChat.ChannelChat) | { id: number },
		U extends ChatMember,
		CINE extends boolean,
		I extends IncludeRelation<"chat_users">,
	>(
		chat: C,
		user: U,
		createIfNotExists: CINE = false as CINE,
		include: I = {} as I
	) => {
		const searchResult = await this.db.query.chat_users
			.findFirst({
				where: and(eq(schema.chat_users.user_id, user.user.id), eq(schema.chat_users.chat_id, chat.id)),
				with: include,
			})
			.execute();

		if (!searchResult && createIfNotExists) {
			await this.writeChatMember(
				chat as TelegramChat.GroupChat | TelegramChat.SupergroupChat | TelegramChat.ChannelChat,
				user
			);
		}

		return this.db.query.chat_users
			.findFirst({
				where: and(eq(schema.chat_users.chat_id, chat.id), eq(schema.chat_users.user_id, user.user.id)),
				with: include,
			})
			.execute();
	};

	readonly resolveChatMembers = async <
		C extends (TelegramChat.GroupChat | TelegramChat.SupergroupChat | TelegramChat.ChannelChat) | { id: number },
		I extends IncludeRelation<"chat_users">,
	>(
		chat: C,
		include: I = {} as I
	) => {
		return this.db.query.chat_users
			.findMany({ where: eq(schema.chat_users.chat_id, chat.id), with: include })
			.execute();
	};

	readonly updateChatMember = async <
		C extends (TelegramChat.GroupChat | TelegramChat.SupergroupChat | TelegramChat.ChannelChat) | { id: number },
		U extends ChatMember | { user: { id: number } },
		D extends schema.TChatUsers,
	>(
		chat: C,
		user: U,
		data: Partial<D>
	) => {
		return this.db
			.update(schema.chat_users)
			.set(data)
			.where(and(eq(schema.chat_users.user_id, user.user.id), eq(schema.chat_users.chat_id, chat.id)))
			.execute();
	};

	readonly writeChatMember = async <
		C extends (TelegramChat.GroupChat | TelegramChat.SupergroupChat | TelegramChat.ChannelChat) | { id: number },
		U extends ChatMember,
		D extends schema.TChatUsers,
	>(
		chat: C,
		user: U,
		data?: Partial<D>
	) => {
		return this.db
			.insert(schema.chat_users)
			.values({ ...data, chat_id: chat.id, user_id: user.user.id, status: user.status })
			.execute();
	};
}
