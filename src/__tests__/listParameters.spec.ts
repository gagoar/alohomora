import listParametersPayload from '../__mocks__/describeParameters.json';
import SSM from '../__mocks__/aws-sdk/clients/ssm';
import { listParameters } from '../';

describe("listParameters", () => {
  it("request fails", async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn()
      .mockImplementationOnce(() => { throw new Error('Some fatal error ocurred') });

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({ prefix });
    expect(response).toMatchSnapshot();

  });

  it("gets parameters", async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn(() => ({ Parameters: listParametersPayload }));

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({ prefix });
    expect(response).toMatchSnapshot();
  });
  it("gets parameters, using nextToken", async () => {
    const prefix = 'my-company/my-app';

    const handler = jest.fn()
      .mockImplementationOnce(() => ({ Parameters: listParametersPayload.slice(0, 4), NextToken: 'MokeskinPouch' }))
      .mockImplementationOnce(() => ({ Parameters: listParametersPayload.slice(5, 9) }));

    SSM.__setResponseForMethods({ describeParameters: handler });

    const response = await listParameters({ prefix });
    expect(response).toMatchSnapshot();
    expect(handler).toHaveBeenCalledTimes(2);
  });

});
