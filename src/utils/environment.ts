import envalid, { str, bool } from "envalid";
export const env = envalid.cleanEnv(process.env, {
  TASK_ID: str({ devDefault: "alohomora" }),
  USE_CONSOLE_LOG: bool({ devDefault: false }),
  DEBUG: str({ devDefault: "alohomora:*" }),
  // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
  AWS_ACCESS_KEY_ID: str({ devDefault: '' }),
  AWS_SECRET_ACCESS_KEY: str({ devDefault: '' }),
  AWS_SESSION_TOKEN: str({ devDefault: '' })
});
