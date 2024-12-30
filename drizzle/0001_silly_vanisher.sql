CREATE TABLE `token_upgrade_challenge` (
	`id` integer PRIMARY KEY NOT NULL,
	`refresh_token_id` text NOT NULL,
	`client_id` integer NOT NULL,
	`challenge` text NOT NULL,
	`allowed_ip` text NOT NULL,
	`expires_at` integer NOT NULL,
	`is_used` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`refresh_token_id`) REFERENCES `refresh_token`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `client` RENAME COLUMN `public_key` TO `encryption_public_key`;--> statement-breakpoint
DROP INDEX IF EXISTS `client_public_key_unique`;--> statement-breakpoint
ALTER TABLE `client` ADD `signature_public_key` text NOT NULL;--> statement-breakpoint
ALTER TABLE `user_client_challenge` ADD `is_used` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `token_upgrade_challenge_challenge_unique` ON `token_upgrade_challenge` (`challenge`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_encryption_public_key_unique` ON `client` (`encryption_public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_signature_public_key_unique` ON `client` (`signature_public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_encryption_public_key_signature_public_key_unique` ON `client` (`encryption_public_key`,`signature_public_key`);