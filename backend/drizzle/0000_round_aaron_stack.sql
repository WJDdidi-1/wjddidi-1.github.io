CREATE TABLE `analytics_daily` (
	`day` text NOT NULL,
	`country` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `country`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`country` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_events_day_idx` ON `analytics_events` (`day`);