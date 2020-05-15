import program from 'commander';
import { listCommand, getCommand, setCommand, deleteCommand, exportCommand } from '../actions/commands';

program
  .name('alohomora')
  .version('1.0.0')
  .description('✨AWS Systems Manager Parameter Store (ssm) cli 🔏')
  .requiredOption('-p, --prefix <prefix>', 'the prefix used to store the key')
  .option('--aws-region <region>', 'the aws region where the secret has been created, by default we use us-east-1')
  .option('--environment <environment>', 'the environment where this key lives, by default we will list all environments')
  .option('--aws-access-key-id <AWS_ACCESS_KEY_ID>', 'following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html')
  .option('--aws-secret-access-key <AWS_SECRET_ACCESS_KEY>', 'following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html')
  .option('--aws-session-token <AWS_SESSION_TOKEN>', 'following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html')
  .option('--aws-profile <AWS_PROFILE>', ' following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html')

program
  .command('list')
  .description('List all the environment variables under a given prefix')
  .action(listCommand);

program
  .command('get <name>')
  .description('Get secret')
  .action(getCommand);

program
  .command('set <name> <value> [description]')
  .description('Set secret')
  .action(setCommand);

program
  .command('delete <name>')
  .description('delete secret, if environment is not provided it will only delete the secret matching environment all')
  .action(deleteCommand);

program
  .command('export [templateName]')
  .description('export all keys, a template can be chosen between json or shell, by default it uses shell')
  .action(exportCommand);

program.parse(process.argv);