import SSM from '../../__mocks__/aws-sdk/clients/ssm';
import { deleteParameter } from '../../';
import { deleteCommand } from '../../actions/commands';
import { stopAndPersist, fail } from '../../__mocks__/ora';
import { createHandler } from '../helpers';

describe('deleteParameters', () => {
  beforeEach(() => {
    stopAndPersist.mockReset();
    fail.mockReset();
  });

  it('request fails', async () => {
    const prefix = 'my-company/my-app';

    SSM.__setResponseForMethods({
      deleteParameter: createHandler(() => {
        throw new Error('Some fatal error ocurred');
      })
    });

    const response = await deleteParameter({
      name: 'Vault_713',
      environment: 'production',
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

  it('deletes the parameter', async () => {
    const prefix = 'my-company/my-app';

    SSM.__setResponseForMethods({ deleteParameter: createHandler() });

    const response = await deleteParameter({
      name: 'Vault_713',
      environment: 'production',
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

  it('deletes the parameter [ ParameterNotFound ]', async () => {
    const prefix = 'my-company/my-app';

    const error = { code: 'ParameterNotFound', name: 'ParameterNotFound' };

    SSM.__setResponseForMethods({ deleteParameter: createHandler(() => { throw error }) });

    const response = await deleteParameter({
      name: 'Vault_713',
      environment: 'production',
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

  it('via command invocation', async () => {
    const prefix = 'my-company/my-app';

    SSM.__setResponseForMethods({ deleteParameter: createHandler() });

    await deleteCommand('Vault_713', { parent: { prefix } });

    expect(stopAndPersist).toHaveBeenCalled();
  });
});
