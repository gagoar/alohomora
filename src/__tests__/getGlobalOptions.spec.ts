import { mockProcessExit } from 'jest-mock-process';
import { getGlobalOptions } from '../utils/getGlobalOptions';
import { search } from '../__mocks__/cosmiconfig';

const realConsoleLog = global.console.log;
const consoleLogMock = jest.fn();
const realConsoleError = global.console.error;
const consoleErrorMock = jest.fn();
describe('getGlobalOptions', () => {
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
  it('global Options come from customConfig', async () => {
    search.mockImplementation(() =>
      Promise.resolve({
        isEmpty: false,
        filepath: '/some/package.json',
        config: {
          prefix: 'my-company/my-app',
          region: 'us-west-2',
          environment: 'production',
        },
      })
    );

    const response = await getGlobalOptions({ parent: {} });

    expect(response).toMatchInlineSnapshot(`
      Object {
        "credentials": Object {
          "accessKeyId": undefined,
          "profile": undefined,
          "secretAccessKey": undefined,
          "sessionToken": undefined,
        },
        "params": Object {
          "environment": "production",
          "prefix": "my-company/my-app",
          "region": "us-west-2",
        },
      }
    `);
  });
  it('no prefix is found in global input or custom Config', async () => {
    const mockExit = mockProcessExit();
    search.mockImplementation(() => Promise.resolve());

    await getGlobalOptions({ parent: {} });
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(consoleErrorMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "prefix not provided, try again with --prefix option",
        ],
      ]
    `);
  });

  it("there's an unexpected error retrieving the data", async () => {
    const mockExit = mockProcessExit();
    search.mockImplementation(() => {
      throw new Error('something horrible happened');
    });

    await getGlobalOptions({ parent: {} });

    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("there's config but is not valid", async () => {
    const mockExit = mockProcessExit();
    search.mockImplementation(() =>
      Promise.resolve({
        isEmpty: false,
        filepath: '/some/package.json',
        config: 'vault713',
      })
    );
    await getGlobalOptions({ parent: {} });

    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("there's config but is not valid", async () => {
    const mockExit = mockProcessExit();
    search.mockImplementation(() =>
      Promise.resolve({
        isEmpty: false,
        filepath: '/some/package.json',
        config: {
          randomkey: 'bla',
        },
      })
    );
    await getGlobalOptions({ parent: {} });

    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
