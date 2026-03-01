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
import type * as adminTasks from "../adminTasks.js";
import type * as analytics from "../analytics.js";
import type * as analyticsCleanup from "../analyticsCleanup.js";
import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as blog from "../blog.js";
import type * as chat from "../chat.js";
import type * as claimGuest from "../claimGuest.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as donations from "../donations.js";
import type * as eventSettings from "../eventSettings.js";
import type * as feedback from "../feedback.js";
import type * as fixData from "../fixData.js";
import type * as gdpr from "../gdpr.js";
import type * as internal_ from "../internal.js";
import type * as media from "../media.js";
import type * as mediaMetadata from "../mediaMetadata.js";
import type * as migrateMediaMetadata from "../migrateMediaMetadata.js";
import type * as participant from "../participant.js";
import type * as prCommunicatie from "../prCommunicatie.js";
import type * as public_ from "../public.js";
import type * as register from "../register.js";
import type * as registerGuest from "../registerGuest.js";
import type * as seedEventSettings from "../seedEventSettings.js";
import type * as seedPrData from "../seedPrData.js";
import type * as seedTeam from "../seedTeam.js";
import type * as seed_donations from "../seed_donations.js";
import type * as socialPosts from "../socialPosts.js";
import type * as socialReactions from "../socialReactions.js";
import type * as syncParticipantCount from "../syncParticipantCount.js";
import type * as team from "../team.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminTasks: typeof adminTasks;
  analytics: typeof analytics;
  analyticsCleanup: typeof analyticsCleanup;
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  blog: typeof blog;
  chat: typeof chat;
  claimGuest: typeof claimGuest;
  contact: typeof contact;
  crons: typeof crons;
  donations: typeof donations;
  eventSettings: typeof eventSettings;
  feedback: typeof feedback;
  fixData: typeof fixData;
  gdpr: typeof gdpr;
  internal: typeof internal_;
  media: typeof media;
  mediaMetadata: typeof mediaMetadata;
  migrateMediaMetadata: typeof migrateMediaMetadata;
  participant: typeof participant;
  prCommunicatie: typeof prCommunicatie;
  public: typeof public_;
  register: typeof register;
  registerGuest: typeof registerGuest;
  seedEventSettings: typeof seedEventSettings;
  seedPrData: typeof seedPrData;
  seedTeam: typeof seedTeam;
  seed_donations: typeof seed_donations;
  socialPosts: typeof socialPosts;
  socialReactions: typeof socialReactions;
  syncParticipantCount: typeof syncParticipantCount;
  team: typeof team;
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
