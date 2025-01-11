// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import "unplugin-icons/types/svelte";

declare global {
  namespace App {
    interface Locals {
      ip: string;
      userAgent: string;
      session?: {
        id: string;
        userId: number;
        clientId?: number;
      };
    }
  }
}

export {};
