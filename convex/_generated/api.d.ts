/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as donations from "../donations.js";
import type * as eventSettings from "../eventSettings.js";
import type * as internal_ from "../internal.js";
import type * as media from "../media.js";
import type * as mediaMetadata from "../mediaMetadata.js";
import type * as migrateMediaMetadata from "../migrateMediaMetadata.js";
import type * as participant from "../participant.js";
import type * as public_ from "../public.js";
import type * as register from "../register.js";
import type * as registerGuest from "../registerGuest.js";
import type * as seedEventSettings from "../seedEventSettings.js";
import type * as syncParticipantCount from "../syncParticipantCount.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  donations: typeof donations;
  eventSettings: typeof eventSettings;
  internal: typeof internal_;
  media: typeof media;
  mediaMetadata: typeof mediaMetadata;
  migrateMediaMetadata: typeof migrateMediaMetadata;
  participant: typeof participant;
  public: typeof public_;
  register: typeof register;
  registerGuest: typeof registerGuest;
  seedEventSettings: typeof seedEventSettings;
  syncParticipantCount: typeof syncParticipantCount;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
