import AWS from 'aws-sdk';
import { setAWSCredentials } from '../utils/setAWSCredentials';

describe('setAWSCredentials', () => {
  it('sets sharedCredentials when profile is provided', async () => {
    setAWSCredentials({ profile: 'someAlterProfile' });

    expect(AWS.config.credentials).toMatchInlineSnapshot(`
      SharedIniFileCredentials {
        "accessKeyId": undefined,
        "disableAssumeRole": false,
        "expireTime": null,
        "expired": false,
        "filename": undefined,
        "httpOptions": null,
        "preferStaticCredentials": false,
        "profile": "someAlterProfile",
        "refreshCallbacks": Array [],
        "sessionToken": undefined,
        "tokenCodeFn": null,
      }
    `);
  });
  it('does not sets any credentials when none provided', async () => {
    setAWSCredentials(null);

    expect(AWS.config.credentials).toMatchInlineSnapshot(`
      SharedIniFileCredentials {
        "accessKeyId": undefined,
        "disableAssumeRole": false,
        "expireTime": null,
        "expired": false,
        "filename": undefined,
        "httpOptions": null,
        "preferStaticCredentials": false,
        "profile": "someAlterProfile",
        "refreshCallbacks": Array [],
        "sessionToken": undefined,
        "tokenCodeFn": null,
      }
    `);
  });
  it('sets credentials when provided', async () => {
    setAWSCredentials({
      accessKeyId: 'someKeyId',
      secretAccessKey: 'someAccessKey',
    });

    expect(AWS.config.credentials).toMatchInlineSnapshot(`
      Object {
        "accessKeyId": "someKeyId",
        "secretAccessKey": "someAccessKey",
      }
    `);
  });
});
