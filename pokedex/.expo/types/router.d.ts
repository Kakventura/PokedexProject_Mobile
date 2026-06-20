/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(app)'}/dashboard` | `/dashboard`; params?: Router.UnknownInputParams; } | { pathname: `${'/(app)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(app)'}/team` | `/team`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}` | `/`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(app)'}/dashboard` | `/dashboard`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(app)'}/profile` | `/profile`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(app)'}/team` | `/team`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(auth)'}` | `/`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(app)'}/dashboard${`?${string}` | `#${string}` | ''}` | `/dashboard${`?${string}` | `#${string}` | ''}` | `${'/(app)'}/profile${`?${string}` | `#${string}` | ''}` | `/profile${`?${string}` | `#${string}` | ''}` | `${'/(app)'}/team${`?${string}` | `#${string}` | ''}` | `/team${`?${string}` | `#${string}` | ''}` | `${'/(auth)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(app)'}/dashboard` | `/dashboard`; params?: Router.UnknownInputParams; } | { pathname: `${'/(app)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(app)'}/team` | `/team`; params?: Router.UnknownInputParams; } | { pathname: `${'/(auth)'}` | `/`; params?: Router.UnknownInputParams; };
    }
  }
}
