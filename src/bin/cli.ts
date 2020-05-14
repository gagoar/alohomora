import program from 'commander';
import { setAWSCredentials } from '../utils/setAWSCredentials';
import { getParameter, setParameter, deleteParameter, exportAsTemplate } from '../';
import { listCommand } from '../actions/commands';
import { isValidTemplate } from '../utils/guards';
import { Template } from '../utils/constants';
import { Command, getGlobalOptions } from '../utils/getGlobalOptions';

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
  .action();

program
  .command('set <name> <value> [description]')
  .description('Set secret')
  .action(async (name: string, value: string, description: string | undefined, command: Command): Promise<void> => {

    const { params, credentials } = getGlobalOptions(command);

    setAWSCredentials(credentials);
    const response = await setParameter({ ...params, name, value, description: description });
    console.log(response);

  });

program
  .command('delete <name>')
  .description('delete secret, if environment is not provided it will only delete the secret matching environment all')
  .action(async (name: string, command: Command): Promise<void> => {

    const { params, credentials } = getGlobalOptions(command);

    setAWSCredentials(credentials);
    await deleteParameter({ ...params, name });
  });

program
  .command('export [templateName]')
  .description('export all keys, a template can be chosen between json or shell, by default it uses shell')
  .action(async (templateName: string = Template.shell, command: Command): Promise<void> => {

    if (isValidTemplate(templateName)) {
      const { params, credentials } = getGlobalOptions(command);

      setAWSCredentials(credentials);
      const response = await exportAsTemplate({ ...params, templateName });
      console.log(response);
    } else {
      console.error(`please provide a valid templateName (${Template})`);
      process.exit(1)
    }

  });

program.parse(process.argv);