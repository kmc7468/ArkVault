CREATE TABLE `client` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`encryption_public_key` text NOT NULL,
	`signature_public_key` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_client` (
	`user_id` integer NOT NULL,
	`client_id` integer NOT NULL,
	`state` text DEFAULT 'challenging' NOT NULL,
	PRIMARY KEY(`client_id`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_client_challenge` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`client_id` integer NOT NULL,
	`challenge` text NOT NULL,
	`allowed_ip` text NOT NULL,
	`expires_at` integer NOT NULL,
	`is_used` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `directory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`parent_id` integer,
	`user_id` integer NOT NULL,
	`master_encryption_key_version` integer NOT NULL,
	`encrypted_data_encryption_key` text NOT NULL,
	`data_encryption_key_version` integer NOT NULL,
	`encrypted_name` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_id`) REFERENCES `directory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`,`master_encryption_key_version`) REFERENCES `master_encryption_key`(`user_id`,`version`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `file` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`parent_id` integer,
	`created_at` integer NOT NULL,
	`user_id` integer NOT NULL,
	`master_encryption_key_version` integer NOT NULL,
	`encrypted_data_encryption_key` text NOT NULL,
	`data_encryption_key_version` integer NOT NULL,
	`content_type` text NOT NULL,
	`encrypted_content_iv` text NOT NULL,
	`encrypted_name` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `directory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`,`master_encryption_key_version`) REFERENCES `master_encryption_key`(`user_id`,`version`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `client_master_encryption_key` (
	`user_id` integer NOT NULL,
	`client_id` integer NOT NULL,
	`version` integer NOT NULL,
	`encrypted_key` text NOT NULL,
	`encrypted_key_signature` text NOT NULL,
	PRIMARY KEY(`client_id`, `user_id`, `version`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`,`version`) REFERENCES `master_encryption_key`(`user_id`,`version`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `master_encryption_key` (
	`user_id` integer NOT NULL,
	`version` integer NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`state` text NOT NULL,
	`retired_at` integer,
	PRIMARY KEY(`user_id`, `version`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `refresh_token` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`client_id` integer,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `client_encryption_public_key_unique` ON `client` (`encryption_public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_signature_public_key_unique` ON `client` (`signature_public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_encryption_public_key_signature_public_key_unique` ON `client` (`encryption_public_key`,`signature_public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_client_challenge_challenge_unique` ON `user_client_challenge` (`challenge`);--> statement-breakpoint
CREATE UNIQUE INDEX `directory_encrypted_data_encryption_key_unique` ON `directory` (`encrypted_data_encryption_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `file_path_unique` ON `file` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `file_encrypted_data_encryption_key_unique` ON `file` (`encrypted_data_encryption_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_token_user_id_client_id_unique` ON `refresh_token` (`user_id`,`client_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `token_upgrade_challenge_challenge_unique` ON `token_upgrade_challenge` (`challenge`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);