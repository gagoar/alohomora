import program from 'commander';
import { listCommand, getCommand, setCommand, deleteCommand, exportCommand } from '../actions/commands';
import packageJSON from '../../package.json';
import { Template, Environment } from '../utils/constants';

program
  .name(packageJSON.name)
  .version(packageJSON.version)
  .description(packageJSON.description)
  .option('-p, --prefix [prefix]', 'The prefix used to store the key (it should not start or end with a `/`, ex: if the path to the secret is `/my-app/[env]/secretName`, the prefix will be `my-app` )')
  .option('--aws-region [region]', 'The AWS region code where the secrets have been stored (https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions)', 'us-east-1')
  .option(`--environment [environment]', 'The environment for the secrets [${Object.keys(Environment).join('|')}]`, 'all')
  .option('--aws-access-key-id [AWS_ACCESS_KEY_ID]', 'Following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html', undefined)
  .option('--aws-secret-access-key [AWS_SECRET_ACCESS_KEY]', 'Following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html', undefined)
  .option('--aws-session-token [AWS_SESSION_TOKEN]', 'Following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html', undefined)
  .option('--aws-profile [AWS_PROFILE]', 'Following https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html', undefined)
  .option('--cli', 'Removes colors to avoid odd input', false)

program
  .command('list')
  .description('List all the secrets (without values) under a given prefix')
  .action(listCommand);

program
  .command('get <name>')
  .description('Get secret')
  .action(getCommand);

program
  .command('set <name> <value> [description]')
  .description('Set/Create/Update a secret')
  .action(setCommand);

program
  .command('delete <name>')
  .description('Delete a secret, if no environment is provided, it will only delete the secret matching environment all')
  .action(deleteCommand);

program
  .command('export [templateName]')
  .description(`Export all secrets (including decrypted values), a template can be chosen between [${Object.keys(Template).join('|')}], by default it uses shell`)
  .action(exportCommand);

program.parse(process.argv);