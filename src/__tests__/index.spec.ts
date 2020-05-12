import request from "request";
import lambda from "../index";

const requestMock = (request as unknown) as jest.Mock;

const event = {
  to: "testing-gago-channel",
  message: "some content to *show* how _amazing_ this ~is~"
};
describe("on Post on Slack", () => {
  beforeEach(() => {
    requestMock.mockClear();
  });
  it("should send proper default arguments", async () => {
    await lambda(event);
    const slackRequest = requestMock.mock.calls.find(([{ url }]) =>
      url.endsWith("chat.postMessage")
    );
    expect(slackRequest[0].body.parse).toEqual("full");
    expect(slackRequest[0]).toMatchSnapshot();
  });

  it("should post to a channel with the right parameters", () => {
    return expect(lambda(event)).resolves.toMatchSnapshot();
  });

  it("should fail with the wrong parameters", () => {
    return expect(lambda({})).rejects.toMatchSnapshot();
  });

  it("should post a DM with the right parameters", () => {
    return expect(
      lambda({ ...event, to: "gago@coursera.org" })
    ).resolves.toMatchSnapshot();
  });

  it("allows overriding of the `parse` parameter", async () => {
    await lambda({ ...event, to: "gago@coursera.org", parse: "none" });
    const slackRequest = requestMock.mock.calls.find(([{ url }]) =>
      url.endsWith("chat.postMessage")
    );
    expect(slackRequest[0].body.parse).toEqual("none");
    expect(slackRequest[0]).toMatchSnapshot();
  });
});
