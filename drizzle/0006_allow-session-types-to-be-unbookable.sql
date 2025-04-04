ALTER TABLE `mentor` ADD `bookableSessionTypes` text;--> statement-breakpoint
ALTER TABLE `sessionType` ADD `bookable` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `student` ADD `bookableSessionTypes` text;--> statement-breakpoint
ALTER TABLE `user` ADD `bookableSessionTypes` text;--> statement-breakpoint
UPDATE `user` SET `bookableSessionTypes` = `allowedSessionTypes`;