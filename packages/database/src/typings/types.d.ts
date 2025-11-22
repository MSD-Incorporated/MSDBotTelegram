import { type DBQueryConfig, type ExtractTablesWithRelations } from "drizzle-orm";

export type Schema = typeof schema;
export type TSchema = ExtractTablesWithRelations<Schema>;

export type Relation<TableName extends keyof TSchema> = DBQueryConfig<
	"one" | "many",
	boolean,
	TSchema,
	TSchema[TableName]
>;
export type IncludeRelation<TableName extends keyof TSchema> = Relation<TableName>["with"];
export type ColumnRelation<TableName extends keyof TSchema> = Relation<TableName>["columns"];
