import type { Generated } from "kysely";

interface UserTable {
  id: Generated<number>;
  email: string;
  nickname: string;
  password: string;
}

declare module "./index" {
  interface Database {
    user: UserTable;
  }
}
