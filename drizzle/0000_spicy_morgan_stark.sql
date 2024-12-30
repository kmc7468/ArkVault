CREATE TABLE `client` (
	`id` integer PRIMARY KEY NOT NULL,
	`public_key` text NOT NULL
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
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `client_master_encryption_key` (
	`user_id` integer NOT NULL,
	`client_id` integer NOT NULL,
	`master_encryption_key_version` integer NOT NULL,
	`encrypted_master_encryption_key` text NOT NULL,
	PRIMARY KEY(`client_id`, `master_encryption_key_version`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`,`master_encryption_key_version`) REFERENCES `master_encryption_key`(`user_id`,`version`) ON UPDATE no action ON DELETE no action
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
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `client_public_key_unique` ON `client` (`public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_client_challenge_challenge_unique` ON `user_client_challenge` (`challenge`);--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_token_user_id_client_id_unique` ON `refresh_token` (`user_id`,`client_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);