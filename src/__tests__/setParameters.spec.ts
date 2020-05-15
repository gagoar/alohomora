import SSM from '../__mocks__/aws-sdk/clients/ssm';
import { setParameter } from '..';
import { setCommand } from '../actions/commands';

const RealDate = Date.now

const setParameterPayload = {
  "Version": 1,
};

const realConsoleLog = console.log;
const consoleLogMock = jest.fn();

describe("setParameters", () => {

  beforeAll(() => {
    global.console.log = consoleLogMock;
    Date.now = jest.fn(() =>
      new Date('2020-05-14T04:21:40.029Z').getTime()
    )
  })

  afterAll(() => {
    global.console.log = realConsoleLog;
    Date.now = RealDate;
  });

  it("request fails", async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn()
      .mockImplementationOnce(() => { throw new Error('Some fatal error ocurred') });

    SSM.__setResponseForMethods({ putParameter: handler });

    const response = await setParameter({ name: 'Vault_713', value: "Boggart", environment: 'production', prefix });
    expect(response).toBe('');

  });

  it("sets the parameter", async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn(() => setParameterPayload);

    SSM.__setResponseForMethods({ putParameter: handler });

    const response = await setParameter({ name: 'Vault_713', value: "Boggart", environment: 'production', prefix, cli: true });
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
