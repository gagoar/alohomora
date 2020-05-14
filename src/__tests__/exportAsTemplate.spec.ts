import getParametersByPathPayload from "../__mocks__/getParametersByPath.json";
import SSM from "../__mocks__/aws-sdk/clients/ssm";
// import { stopAndPersist, fail } from "../__mocks__/ora";
import { exportAsTemplate } from "..";
import { Template } from "../utils/constants";

const realConsoleLog = global.console.log;
const consoleLogMock = jest.fn();
describe("exportAsTemplate", () => {
  beforeEach(() => {
    global.console.error = consoleLogMock;
  });

  afterAll(() => {
    global.console.error = realConsoleLog;
  });

  afterEach(() => {
    consoleLogMock.mockReset();
  });
  it("request fails", async () => {
    const prefix = "my-company/my-app";

    const handler = jest.fn().mockImplementationOnce(() => {
      throw new Error("Some fatal error ocurred");
    });

    SSM.__setResponseForMethods({ getParametersByPath: handler });

    try {
      await exportAsTemplate({ prefix });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`[Error: Some fatal error ocurred]`);
      expect(consoleLogMock.mock.calls).toMatchInlineSnapshot(`
        Array [
          Array [
            "We found an error trying to retrieve secrets",
            [Error: Some fatal error ocurred],
          ],
        ]
      `);
    }
  });

  it("export parameters in a shell as a template by default", async () => {
    const prefix = "my-company/my-app";

    const handler = jest.fn(() => ({ Parameters: getParametersByPathPayload }));

    SSM.__setResponseForMethods({ getParametersByPath: handler });

    const response = await exportAsTemplate({ prefix });
    expect(response).toMatchSnapshot();
  });

  it("export parameters in a shell as a template by default, using production as environment", async () => {
    const prefix = "my-company/my-app";

    const handler = jest.fn(() => ({ Parameters: getParametersByPathPayload }));

    SSM.__setResponseForMethods({ getParametersByPath: handler });

    const response = await exportAsTemplate({ prefix, environment: 'production' });
    expect(response).toMatchSnapshot();
  })

  it("export parameters in json format, using nextToken", async () => {
    const prefix = "my-company/my-app";

    const handler = jest
      .fn()
      .mockImplementationOnce(() => ({
        Parameters: getParametersByPathPayload.slice(0, 3),
        NextToken: "MokeskinPouch",
      }))
      .mockImplementationOnce(() => ({
        Parameters: getParametersByPathPayload.slice(4, 8),
      }));

    SSM.__setResponseForMethods({ getParametersByPath: handler });

    const response = await exportAsTemplate({
      prefix,
      templateName: Template.json,
    });
    expect(response).toMatchSnapshot();
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
