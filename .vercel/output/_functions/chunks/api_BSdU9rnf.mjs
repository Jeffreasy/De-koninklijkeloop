import { jsx } from 'react/jsx-runtime';
import { ConvexReactClient, ConvexProvider } from 'convex/react';
import { componentsGeneric, anyApi } from 'convex/server';

const convex = new ConvexReactClient("https://frugal-goose-15.convex.cloud");
function ConvexClientProvider({ children }) {
  return /* @__PURE__ */ jsx(ConvexProvider, { client: convex, children });
}

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */


/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
const api = anyApi;
componentsGeneric();

export { ConvexClientProvider as C, api as a };
