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
	`answer` text NOT NULL,
	`allowed_ip` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`,`client_id`) REFERENCES `user_client`(`user_id`,`client_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `directory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
CREATE TABLE `directory_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`directory_id` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`action` text NOT NULL,
	`new_name` text,
	FOREIGN KEY (`directory_id`) REFERENCES `directory`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `file` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parent_id` integer,
	`user_id` integer NOT NULL,
	`path` text NOT NULL,
	`master_encryption_key_version` integer NOT NULL,
	`encrypted_data_encryption_key` text NOT NULL,
	`data_encryption_key_version` integer NOT NULL,
	`hmac_secret_key_version` integer,
	`content_hmac` text,
	`content_type` text NOT NULL,
	`encrypted_content_iv` text NOT NULL,
	`encrypted_name` text NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `directory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`,`master_encryption_key_version`) REFERENCES `master_encryption_key`(`user_id`,`version`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`,`hmac_secret_key_version`) REFERENCES `hmac_secret_key`(`user_id`,`version`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `file_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_id` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`action` text NOT NULL,
	`new_name` text,
	FOREIGN KEY (`file_id`) REFERENCES `file`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `hmac_secret_key` (
	`user_id` integer NOT NULL,
	`version` integer NOT NULL,
	`state` text NOT NULL,
	`master_encryption_key_version` integer NOT NULL,
	`encrypted_key` text NOT NULL,
	PRIMARY KEY(`user_id`, `version`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`,`master_encryption_key_version`) REFERENCES `master_encryption_key`(`user_id`,`version`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `hmac_secret_key_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`hmac_secret_key_version` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`action` text NOT NULL,
	`action_by` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`action_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`,`hmac_secret_key_version`) REFERENCES `hmac_secret_key`(`user_id`,`version`) ON UPDATE no action ON DELETE no action
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
	`state` text NOT NULL,
	`retired_at` integer,
	PRIMARY KEY(`user_id`, `version`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `master_encryption_key_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`master_encryption_key_version` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`action` text NOT NULL,
	`action_by` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`action_by`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`,`master_encryption_key_version`) REFERENCES `master_encryption_key`(`user_id`,`version`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`client_id` integer,
	`created_at` integer NOT NULL,
	`last_used_at` integer NOT NULL,
	`last_used_by_ip` text,
	`last_used_by_user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session_upgrade_challenge` (
	`id` integer PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`client_id` integer NOT NULL,
	`answer` text NOT NULL,
	`allowed_ip` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`nickname` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `client_encryption_public_key_unique` ON `client` (`encryption_public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_signature_public_key_unique` ON `client` (`signature_public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_encryption_public_key_signature_public_key_unique` ON `client` (`encryption_public_key`,`signature_public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_client_challenge_answer_unique` ON `user_client_challenge` (`answer`);--> statement-breakpoint
CREATE UNIQUE INDEX `directory_encrypted_data_encryption_key_unique` ON `directory` (`encrypted_data_encryption_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `file_path_unique` ON `file` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `file_encrypted_data_encryption_key_unique` ON `file` (`encrypted_data_encryption_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `hmac_secret_key_encrypted_key_unique` ON `hmac_secret_key` (`encrypted_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_user_id_client_id_unique` ON `session` (`user_id`,`client_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_upgrade_challenge_session_id_unique` ON `session_upgrade_challenge` (`session_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_upgrade_challenge_answer_unique` ON `session_upgrade_challenge` (`answer`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);