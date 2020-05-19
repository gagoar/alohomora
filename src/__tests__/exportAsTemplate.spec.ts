import { mockProcessExit } from 'jest-mock-process';
import getParametersByPathPayload from '../__mocks__/getParametersByPath.json';
import SSM from '../__mocks__/aws-sdk/clients/ssm';
import { exportAsTemplate } from '..';
import { exportCommand } from '../actions/commands';
import { Template } from '../utils/constants';
import { createHandler } from './helpers';

const realConsoleLog = global.console.log;
const consoleLogMock = jest.fn();
const realConsoleError = global.console.error;
const consoleErrorMock = jest.fn();
describe('exportAsTemplate', () => {
  beforeEach(() => {
    global.console.error = consoleErrorMock;
    global.console.log = consoleLogMock;
  });

  afterAll(() => {
    global.console.error = realConsoleLog;
    global.console.log = realConsoleError;
  });

  afterEach(() => {
    consoleErrorMock.mockReset();
    consoleLogMock.mockReset();
  });
  it('request fails', async () => {
    const prefix = 'my-company/my-app';

    SSM.__setResponseForMethods({
      getParametersByPath: createHandler(() => {
        throw new Error('Some fatal error ocurred');
      })
    });

    try {
      await exportAsTemplate({ prefix });
    } catch (e) {
      expect(e).toMatchInlineSnapshot('[Error: Some fatal error ocurred]');
      expect(consoleErrorMock.mock.calls).toMatchInlineSnapshot(`
        Array [
          Array [
            "We found an error trying to retrieve secrets",
            [Error: Some fatal error ocurred],
          ],
        ]
      `);
    }
  });

  it('export parameters in a shell as a template by default', async () => {
    const prefix = 'my-company/my-app';
    SSM.__setResponseForMethods({ getParametersByPath: createHandler(() => ({ Parameters: getParametersByPathPayload })) });

    const response = await exportAsTemplate({ prefix });
    expect(response).toMatchSnapshot();
  });

  it('export parameters in a shell as a template by default, using production as environment', async () => {
    const prefix = 'my-company/my-app';

    SSM.__setResponseForMethods({ getParametersByPath: createHandler(() => ({ Parameters: getParametersByPathPayload })) });

    const response = await exportAsTemplate({ prefix, environment: 'production' });
    expect(response).toMatchSnapshot();
  })

  it('export parameters in json format, using nextToken', async () => {
    const prefix = 'my-company/my-app';

    const handler = createHandler()
      .mockImplementationOnce(() => ({
        Parameters: getParametersByPathPayload.slice(0, 3),
        NextToken: 'MokeskinPouch',
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

  it('via command invocation, with default template', async () => {
    const prefix = 'my-company/my-app';
    SSM.__setResponseForMethods({ getParametersByPath: createHandler(() => ({ Parameters: getParametersByPathPayload })) });

    await exportCommand(undefined, { parent: { prefix } });

    expect(consoleLogMock).toHaveBeenCalled();
  });

  it('via command invocation, with a valid template', async () => {
    const prefix = 'my-company/my-app';
    SSM.__setResponseForMethods({ getParametersByPath: createHandler(() => ({ Parameters: getParametersByPathPayload })) });

    await exportCommand('json', { parent: { prefix } });

    expect(consoleLogMock).toHaveBeenCalled();
  });
  it('via command invocation, with invalid template', async () => {
    const prefix = 'my-company/my-app';

    const mockExit = mockProcessExit();
    SSM.__setResponseForMethods({ getParametersByPath: createHandler(() => ({ Parameters: getParametersByPathPayload })) });

    await exportCommand('boggart', { parent: { prefix } });

    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
