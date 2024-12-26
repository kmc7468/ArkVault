import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./user";

export enum UserDeviceState {
  PENDING = 0,
  ACTIVE = 1,
}

export const device = sqliteTable("device", {
  id: integer("id").primaryKey(),
  pubKey: text("pub_key").notNull().unique(),
});

export const userDevice = sqliteTable(
  "user_device",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    deviceId: integer("device_id")
      .notNull()
      .references(() => device.id),
    state: integer("state").notNull().default(0),
    encKey: text("enc_key"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.deviceId] }),
  }),
);
