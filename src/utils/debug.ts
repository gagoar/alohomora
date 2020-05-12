import { env } from "./environment";
import debug, { Debugger } from "debug";

export function logger(nameSpace: string): Debugger {
  const { USE_CONSOLE_LOG, TASK_ID } = env;
  const log = debug(`${TASK_ID}:${nameSpace}`);

  if (USE_CONSOLE_LOG) {
    log.log = console.log.bind(console);
    log.enabled = true;
  }
  return log;
}
