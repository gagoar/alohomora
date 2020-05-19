import listParametersPayload from '../__mocks__/describeParameters.json';
import SSM from '../__mocks__/aws-sdk/clients/ssm';
import { listParameters } from '../';
import { mockProcessExit } from 'jest-mock-process';
import { listCommand } from '../actions/commands';
import { mockConsole, unMockConsole } from './helpers';

describe('listParameters', () => {
  let consoleErrorMock: jest.Mock;
  let consoleLogMock: jest.Mock;

  const prefix = 'my-company/my-app';
  beforeAll(() => {
    consoleLogMock = mockConsole('log');
    consoleErrorMock = mockConsole('error');
  });

  afterAll(() => {
    unMockConsole('log');
    unMockConsole('error');
  });

  beforeEach(() => {
    consoleLogMock.mockReset();
    consoleErrorMock.mockReset();
  });
  it('request fails', async () => {

    const handler = jest.fn().mockImplementationOnce(() => {
      throw new Error('Some fatal error ocurred');
    });

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({ prefix, ci: true });
    expect(response).toMatchSnapshot();
  });

  it('gets parameters', async () => {

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
    const handler = jest.fn(() => ({ Parameters: listParametersPayload }));
    SSM.__setResponseForMethods({ describeParameters: handler });

    await listCommand({ parent: { prefix } });

    expect(consoleLogMock).toHaveBeenCalled();
  });

  it('via command invocation, with an invalid groupBy set', async () => {
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
    const mockExit = mockProcessExit();
    const handler = jest.fn(() => ({ Parameters: listParametersPayload }));
    SSM.__setResponseForMethods({ describeParameters: handler });

    await listCommand({ parent: { prefix }, groupBy: 'name' });

    expect(mockExit).not.toHaveBeenCalled();

  });
});
