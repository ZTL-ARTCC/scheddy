ALTER TABLE `session` ADD `createdBy` int;--> statement-breakpoint
ALTER TABLE `session` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_createdBy_user_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;