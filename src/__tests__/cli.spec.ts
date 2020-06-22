import path from 'path';

import { exec, ExecException } from 'child_process';

import uuid from 'uuid-random';

async function cli(
  args: string[],
  cwd = '.'
): Promise<{
  code: number;
  error: ExecException | null;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve) => {
    exec(
      `node ${path.resolve('./dist/index.js')} ${args.join(' ')}`,
      { cwd },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr,
        });
      }
    );
  });
}

// Used for manual testing purposes. I trust commander does what it should do.
describe('on CLI invoke', () => {
  const randomSecretName = uuid();
  it('export returns the right combination', async () => {
    const result = await cli([
      '--prefix test',
      '--environment production',
      '--aws-region us-east-2',
      '--aws-profile alohomora-bot',
      'export',
    ]);
    expect(result.error).toBe(null);
    expect(result.stdout).toMatchInlineSnapshot(`
      "export secret_1='SECRET_1_VALUE_PRODUCTION'
      export secret_2='SECRET_2_ALL'
      "
    `);
  });
  it('get parameter', async () => {
    const result = await cli([
      '--prefix test',
      '--environment production',
      '--aws-region us-east-2',
      '--aws-profile alohomora-bot',
      '--ci',
      'get',
      'secret_1',
    ]);
    expect(result.error).toBe(null);
    expect(result.stdout).toMatchInlineSnapshot(`
      "┌──────────┬───────────────────────────┬─────────────┬────────────────────────────────────────────────┬─────────┐
      │ Name     │ Value                     │ Environment │ Updated by                                     │ Version │
      ├──────────┼───────────────────────────┼─────────────┼────────────────────────────────────────────────┼─────────┤
      │ secret_1 │ SECRET_1_VALUE_PRODUCTION │ production  │ Monday, June 22nd, 2020, 3:35:48 AM (GMT+0000) │ 1       │
      └──────────┴───────────────────────────┴─────────────┴────────────────────────────────────────────────┴─────────┘
      "
    `);
  });
  it(`set parameter ${randomSecretName}`, async () => {
    const result = await cli([
      '--prefix test',
      '--environment production',
      '--aws-region us-east-2',
      '--aws-profile alohomora-bot',
      '--ci',
      'set',
      randomSecretName,
      'SECRET_3_VALUE',
    ]);
    expect(result.error).toBe(null);
    expect(result.stdout).toEqual(expect.stringContaining(randomSecretName));
    expect(result.stdout).toEqual(expect.stringContaining('SECRET_3_VALUE'));
  });
  it(`delete ${randomSecretName} `, async () => {
    const result = await cli([
      '--prefix test',
      '--environment production',
      '--aws-region us-east-2',
      '--aws-profile alohomora-bot',
      '--ci',
      'delete',
      randomSecretName,
    ]);
    expect(result.error).toBe(null);
    expect(result.stdout).toMatchInlineSnapshot('""');
  });
});
