import SSM from "../__mocks__/aws-sdk/clients/ssm";
import { deleteParameter } from "..";
import { stopAndPersist, fail } from "../__mocks__/ora";

describe("deleteParameters", () => {
  beforeEach(() => {
    stopAndPersist.mockReset();
    fail.mockReset();
  });

  it("request fails", async () => {
    const prefix = "my-company/my-app";

    const handler = jest.fn().mockImplementationOnce(() => {
      throw new Error("Some fatal error ocurred");
    });

    SSM.__setResponseForMethods({ deleteParameter: handler });

    const response = await deleteParameter({
      name: "Vault_713",
      environment: "production",
      prefix,
    });
    expect(fail.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "Something went wrong deleting the key /my-company/my-app/production/Vault_713, Error: Some fatal error ocurred",
        ],
      ]
    `);
    expect(response).toBe(undefined);
  });

  it("deletes the parameter", async () => {
    const prefix = "my-company/my-app";

    const handler = jest.fn(() => undefined);

    SSM.__setResponseForMethods({ deleteParameter: handler });

    const response = await deleteParameter({
      name: "Vault_713",
      environment: "production",
      prefix,
    });
    expect(stopAndPersist.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "symbol": "💫",
            "text": "deleted /my-company/my-app/production/Vault_713 (us-east-1)",
          },
        ],
      ]
    `);
    expect(response).toBe(undefined);
  });

  it("deletes the parameter [ ParameterNotFound ]", async () => {
    const prefix = "my-company/my-app";

    const error = { code: "ParameterNotFound", name: "ParameterNotFound" };
    const handler = jest.fn(() => {
      throw error;
    });

    SSM.__setResponseForMethods({ deleteParameter: handler });

    const response = await deleteParameter({
      name: "Vault_713",
      environment: "production",
      prefix,
    });
    expect(stopAndPersist.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "symbol": "💫",
            "text": "parameter /my-company/my-app/production/Vault_713 not found (us-east-1)",
          },
        ],
      ]
    `);
    expect(response).toBe(undefined);
  });
});
