import { Context } from "aws-lambda";
import lambda, { Event } from "./src/index";
import { logger } from "./src/utils/debug";

const TASK_ID = "HANDLER";
const log = logger(TASK_ID);
export const handler = (
  event: Event,
  _context: Context,
  callback: Function
) => {
  lambda(event)
    .then(data => {
      log(`SUCCESS: ${data}`);
      callback(null, data);
    })
    .catch(err => {
      log(`ERROR: ${err}`);
      callback(err);
    });
};
