import listParametersPayload from '../__mocks__/describeParameters.json';
import SSM from '../__mocks__/aws-sdk/clients/ssm';
import { listParameters } from '../';
import { listCommand } from '../actions/commands';

const realConsoleLog = console.log;
const consoleLogMock = jest.fn();
describe('listParameters', () => {
  beforeAll(() => {
    global.console.log = consoleLogMock;
  });

  afterAll(() => {
    global.console.log = realConsoleLog;
  });

  beforeEach(() => {
    consoleLogMock.mockReset();
  })
  it('request fails', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn()
      .mockImplementationOnce(() => { throw new Error('Some fatal error ocurred') });

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({ prefix, cli: true });
    expect(response).toMatchSnapshot();

  });

  it('gets parameters', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn(() => ({ Parameters: listParametersPayload }));

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({ prefix, environment: 'production', cli: true });
    expect(response).toMatchSnapshot();
  });
  it('gets parameters, using nextToken', async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn()
      .mockImplementationOnce(() => ({ Parameters: listParametersPayload.slice(0, 4), NextToken: 'MokeskinPouch' }))
      .mockImplementationOnce(() => ({ Parameters: listParametersPayload.slice(5, 9) }));

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({ prefix, cli: true });
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

});
