import SSM from '../../__mocks__/aws-sdk/clients/ssm';
import { setParameter } from '../../';
import { setCommand } from '../../actions/commands';
import { unMockConsole, mockConsole } from '../helpers';

const realDate = Date.now

const setParameterPayload = {
  'Version': 1,
};

describe('setParameters', () => {

  let consoleLogMock: jest.Mock;
  beforeAll(() => {
    consoleLogMock = mockConsole('log');
    Date.now = jest.fn(() =>
      new Date('2020-05-14T04:21:40.029Z').getTime()
    )
  })

  afterAll(() => {
    unMockConsole('log');
    Date.now = realDate;
  });

  it('request fails', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn()
      .mockImplementationOnce(() => { throw new Error('Some fatal error ocurred') });

    SSM.__setResponseForMethods({ putParameter: handler });

    const response = await setParameter({ name: 'Vault_713', value: 'Boggart', environment: 'production', prefix });
    expect(response).toBe('');

  });

  it('sets the parameter', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn(() => setParameterPayload);

    SSM.__setResponseForMethods({ putParameter: handler });

    const response = await setParameter({ name: 'Vault_713', value: 'Boggart', environment: 'production', prefix, ci: true });
    expect(response).toMatchSnapshot();
  });

  it('via command invocation', async () => {
    const prefix = 'my-company/my-app';
    const handler = jest.fn(() => setParameterPayload);

    SSM.__setResponseForMethods({ getParameter: handler });

    await setCommand('Vault_713', 'Boggart', 'A serious artifact', { parent: { prefix } });

    expect(consoleLogMock).toHaveBeenCalled();
  });
});
