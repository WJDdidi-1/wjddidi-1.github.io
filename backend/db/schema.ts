import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const analyticsEvents = sqliteTable('analytics_events', {
  id: text('id').primaryKey(), day: text('day').notNull(), country: text('country').notNull(),
}, table => [index('analytics_events_day_idx').on(table.day)]);
export const analyticsDaily = sqliteTable('analytics_daily', {
  day: text('day').notNull(), country: text('country').notNull(), views: integer('views').notNull().default(0),
}, table => [primaryKey({columns:[table.day,table.country]})]);
