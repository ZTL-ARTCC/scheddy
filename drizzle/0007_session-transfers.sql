CREATE TABLE `transfers` (
	`oldMentor` int NOT NULL,
	`newMentor` int NOT NULL,
	`sessionId` varchar(26) NOT NULL,
	CONSTRAINT `transfers_sessionId` PRIMARY KEY(`sessionId`)
);
--> statement-breakpoint
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_oldMentor_user_id_fk` FOREIGN KEY (`oldMentor`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_newMentor_user_id_fk` FOREIGN KEY (`newMentor`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;