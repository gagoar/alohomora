import listParametersPayload from '../__mocks__/describeParameters.json';
import SSM from '../__mocks__/aws-sdk/clients/ssm';
import { listParameters } from '../';
import { mockProcessExit } from 'jest-mock-process';
import { listCommand } from '../actions/commands';

const realConsoleLog = console.log;
const consoleLogMock = jest.fn();
const realConsoleError = console.error;
const consoleErrorMock = jest.fn();
describe('listParameters', () => {
  beforeAll(() => {
    global.console.log = consoleLogMock;
    global.console.error = consoleErrorMock;
  });

  afterAll(() => {
    global.console.log = realConsoleLog;
    global.console.error = realConsoleError;
  });

  beforeEach(() => {
    consoleLogMock.mockReset();
    consoleErrorMock.mockReset();
  });
  it('request fails', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn().mockImplementationOnce(() => {
      throw new Error('Some fatal error ocurred');
    });

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({ prefix, ci: true });
    expect(response).toMatchSnapshot();
  });

  it('gets parameters', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn(() => ({ Parameters: listParametersPayload }));

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({
      prefix,
      environment: 'production',
      ci: true,
    });
    expect(response).toMatchSnapshot();
  });

  it('gets parameters, grouped by Name', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn(() => ({ Parameters: listParametersPayload }));

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({
      prefix,
      environment: 'production',
      groupBy: 'name',
      ci: true,
    });
    expect(response).toMatchSnapshot();
  });

  it('gets parameters, grouped by Environment', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn(() => ({ Parameters: listParametersPayload }));

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({
      prefix,
      environment: 'production',
      groupBy: 'environment',
      ci: true,
    });
    expect(response).toMatchSnapshot();
  });
  it('gets parameters, using nextToken', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest
      .fn()
      .mockImplementationOnce(() => ({
        Parameters: listParametersPayload.slice(0, 4),
        NextToken: 'MokeskinPouch',
      }))
      .mockImplementationOnce(() => ({
        Parameters: listParametersPayload.slice(5, 9),
      }));

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({ prefix, ci: true });
    expect(response).toMatchSnapshot();
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('via command invocation', async () => {
    const prefix = 'my-company/my-app';
    const handler = jest.fn(() => ({ Parameters: listParametersPayload }));
    SSM.__setResponseForMethods({ describeParameters: handler });

    await listCommand({ parent: { prefix } });

    expect(consoleLogMock).toHaveBeenCalled();
  });

  it('via command invocation, with an invalid groupBy set', async () => {
    const prefix = 'my-company/my-app';
    const mockExit = mockProcessExit();
    const handler = jest.fn(() => ({ Parameters: listParametersPayload }));
    SSM.__setResponseForMethods({ describeParameters: handler });

    await listCommand({ parent: { prefix }, groupBy: 'Bogart' });

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(consoleErrorMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "groupBy is no valid, please try name | environment",
        ],
      ]
    `);
  });

  it('via command invocation, with a valid groupBy', async () => {
    const prefix = 'my-company/my-app';
    const mockExit = mockProcessExit();
    const handler = jest.fn(() => ({ Parameters: listParametersPayload }));
    SSM.__setResponseForMethods({ describeParameters: handler });

    await listCommand({ parent: { prefix }, groupBy: 'name' });

    expect(mockExit).not.toHaveBeenCalled();

  });
});
