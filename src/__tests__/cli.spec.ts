import path from 'path';

import { exec, ExecException } from 'child_process';

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
      `ts-node --project tsconfig.node.json ${path.resolve(
        './src/bin/cli'
      )} ${args.join(' ')}`,
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

// Used for manual testing purposes. I trust commander  does what is should do. 
describe.skip('on CLI invoke', () => {
  test('export  --help', async () => {
    const result = await cli(['export', '--help']);
    expect(result.error).toBe(null);
    expect(result.stdout).toMatchInlineSnapshot(`
      "Usage: alohomora export [options] [templateName]

      export all keys, a template can be chosen between json or shell, by default it uses shell

      Options:
        -h, --help  display help for command
      "
    `);
  });
  test('get  --help', async () => {
    const result = await cli(['get', '--help']);
    expect(result.error).toBe(null);
    expect(result.stdout).toMatchInlineSnapshot(`
      "Usage: alohomora get [options] <name>

      Get secret

      Options:
        -h, --help  display help for command
      "
    `);
  });
  test('set  --help', async () => {
    const result = await cli(['set', '--help']);
    expect(result.error).toBe(null);
    expect(result.stdout).toMatchInlineSnapshot(`
      "Usage: alohomora set [options] <name> <value> [description]

      Set secret

      Options:
        -h, --help  display help for command
      "
    `);
  });
  test('list  --help', async () => {
    const result = await cli(['list', '--help']);
    expect(result.error).toBe(null);
    expect(result.stdout).toMatchInlineSnapshot(`
      "Usage: alohomora list [options]

      List all the environment variables under a given prefix

      Options:
        -h, --help  display help for command
      "
    `);
  });
});
