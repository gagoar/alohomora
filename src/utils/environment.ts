import envalid, { str, bool } from "envalid";
export const env = envalid.cleanEnv(process.env, {
  TASK_ID: str({ devDefault: "alohomora" }),
  USE_CONSOLE_LOG: bool({ devDefault: false }),
  DEBUG: str({ devDefault: "alohomora:*" }),
});
