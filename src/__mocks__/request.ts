import memberIDResponse from "./_slack_get_member_id_response.json";
import imOpenResponse from "./_slack_post_im_open_response.json";
import messageResponse from "./_slack_post_message_response.json";

const RESPONSE_MAP = {
  "users.lookupByEmail": memberIDResponse,
  "im.open": imOpenResponse,
  "chat.postMessage": messageResponse
};

function getResponseForURL(url: string) {
  const api = Object.keys(RESPONSE_MAP).find(key => url.indexOf(key) !== -1);

  return api && RESPONSE_MAP[api as keyof typeof RESPONSE_MAP];
}

const request = jest.fn((options, callback) => {
  const { url } = options;
  const { response = {}, content = {} } = getResponseForURL(url) || {};

  process.nextTick(() => callback(null, response, content));
});

export default request;
