ALTER TABLE `session` ADD `cancelled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `session` ADD `cancellationUserLevel` int;--> statement-breakpoint
ALTER TABLE `session` ADD `cancellationReason` text;