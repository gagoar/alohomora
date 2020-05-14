import SSM from '../__mocks__/aws-sdk/clients/ssm';
import { setParameter } from '../actions';

const RealDate = Date.now

const setParameterPayload = {
  "Version": 1,
};

describe("setParameters", () => {
  beforeAll(() => {
    Date.now = jest.fn(() =>
      new Date('2020-05-14T04:21:40.029Z').getTime()
    )
  })

  afterAll(() => {
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

    const response = await setParameter({ name: 'Vault_713', value: "Boggart", environment: 'production', prefix });
    expect(response).toMatchSnapshot();
  });

});
