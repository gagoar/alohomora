import SSM from '../__mocks__/aws-sdk/clients/ssm';
import { getParameter } from '..';
import { getCommand } from '../actions/commands';
import { stopAndPersist, fail } from '../__mocks__/ora';
import { mockConsole, unMockConsole } from './helpers';

const getParameterPayload = {
  'Name': '/my-company/my-app/production/Vault_713',
  'Type': 'String',
  'Value': "Philosopher's Stone",
  'Version': 1,
  'LastModifiedDate': '2020-04-26T02:03:31.132Z',
  'ARN': 'arn:aws:ssm:us-west-2:687711712713:parameter/my-company/my-app/production/Vault_713',
  'DataType': 'text'
};


describe('getParameters', () => {
  let consoleLogMock: jest.Mock;
  beforeAll(() => {
    consoleLogMock = mockConsole('log');
  });

  afterAll(() => {
    unMockConsole('log');
  });

  beforeEach(() => {
    stopAndPersist.mockReset();
    fail.mockReset();
    consoleLogMock.mockReset();
  });

  it('request fails', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn()
      .mockImplementationOnce(() => { throw new Error('Some fatal error ocurred') });

    SSM.__setResponseForMethods({ getParameter: handler });

    const response = await getParameter({ name: 'Vault_713', environment: 'production', prefix });

    expect(fail).toHaveBeenCalledTimes(1);
    expect(response).toBe('');
  });

  it('gets the parameter', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn(() => ({ Parameter: getParameterPayload }));

    SSM.__setResponseForMethods({ getParameter: handler });

    const response = await getParameter({ name: 'Vault_713', environment: 'production', prefix, ci: true });
    expect(stopAndPersist).toHaveBeenCalledTimes(1);
    expect(response).toMatchSnapshot();
  });

  it('does not find the parameter', async () => {
    const prefix = 'my-company/my-app';

    const error = { code: 'ParameterNotFound', name: 'ParameterNotFound' };

    const handler = jest.fn(() => { throw error; });

    SSM.__setResponseForMethods({ getParameter: handler });

    const response = await getParameter({ name: 'Vault_713', environment: 'production', prefix });
    expect(stopAndPersist).toHaveBeenCalledTimes(1);
    expect(response).toBe('');
  })

  it('does not find the parameter, but it returns Parameter empty, without throwing an Error', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn(() => ({ Parameter: undefined }));

    SSM.__setResponseForMethods({ getParameter: handler });

    const response = await getParameter({ name: 'Vault_713', environment: 'production', prefix });
    expect(stopAndPersist).toHaveBeenCalledTimes(1);
    expect(response).toBe('');
  })

  it('via command invocation', async () => {
    const prefix = 'my-company/my-app';
    const handler = jest.fn(() => ({ Parameter: getParameterPayload }));

    SSM.__setResponseForMethods({ getParameter: handler });

    await getCommand('Vault_713', { parent: { prefix } });

    expect(consoleLogMock).toHaveBeenCalled();
  });
});
