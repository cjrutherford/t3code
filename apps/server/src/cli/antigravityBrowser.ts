import { Argument, Command, Flag } from "effect/unstable/cli";
import * as Effect from "effect/Effect";
import {
  ANTIGRAVITY_AUTH_BROWSER_MARKER,
  ANTIGRAVITY_BROWSER_COMMAND,
} from "../provider/antigravityAuthSupport.ts";

const writeBrowserUrl = (url: string) =>
  Effect.promise(
    () =>
      new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          process.stderr.off("error", finish);
          resolve();
        };
        process.stderr.once("error", finish);
        process.stderr.write(`${ANTIGRAVITY_AUTH_BROWSER_MARKER}${JSON.stringify(url)}\n`, finish);
      }),
  );

export const antigravityBrowserCommand = Command.make(ANTIGRAVITY_BROWSER_COMMAND, {
  url: Argument.String("url"),
  // Accepted after the subcommand so the standalone runtime can pass Node's
  // --no-warnings through argv (a bare `t3 --no-warnings …` is rejected before
  // any subcommand runs). Plain `node` consumes the flag itself, so this only
  // ever arrives here from the single-executable, where it is a no-op.
  noWarnings: Flag.Boolean("no-warnings").pipe(Flag.withDefault(false)),
}).pipe(
  Command.unlisted,
  Command.withHandler(({ url }) => writeBrowserUrl(url)),
);
