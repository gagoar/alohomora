import program from 'commander';
import { listParameters, getParameter, setParameter, deleteParameter } from '../';
import { setAWSCredentials } from '../utils/setAWSCredentials';

interface Options { prefix: string, awsProfile?: string, environment?: string, awsRegion?: string, awsAccessKeyId?: string, awsSecretAccessKey?: string, awsSessionToken?: string }

type PossibleCredentials = { profile?: string, accessKeyId?: string, secretAccessKey?: string, sessionToken?: string };
type Parameters = { prefix: string, region?: string, environment?: string }
interface Command { parent: Options }

const getGlobalOptions = (command: Command): { params: Parameters, credentials: PossibleCredentials } => {
  const {
    parent:
    {
      environment,
      prefix,
      awsRegion: region,
      awsProfile: profile,
      awsAccessKeyId: accessKeyId,
      awsSecretAccessKey: secretAccessKey,
      awsSessionToken: sessionToken
    }
  } = command

  return {
    credentials: { profile, accessKeyId, secretAccessKey, sessionToken },
    params: { prefix, region, environment }
  }
}
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
  .action(async (command: Command): Promise<void> => {

    const { params, credentials } = getGlobalOptions(command);

    setAWSCredentials(credentials);
    const response = await listParameters(params);

    console.log(response);
  });

program
  .command('get <name>')
  .description('Get secret')
  .action(async (name: string, command: Command): Promise<void> => {

    const { params, credentials } = getGlobalOptions(command);

    setAWSCredentials(credentials);
    const response = await getParameter({ ...params, name });
    console.log(response);
  });

program
  .command('set <name> <value> [description]')
  .description('Set secret')
  .action(async (name: string, value: string, description: string | null, command: Command): Promise<void> => {

    const { params, credentials } = getGlobalOptions(command);

    setAWSCredentials(credentials);
    const response = await setParameter({ ...params, name, value, description: description ? description : undefined });
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
  .description('export all keys, a template can be chosen out of the built ones or specify a --customTemplate, by default it exports to the shell')
  .option('--customTemplate <path/to/the/custom/function.js>, pass the arguments to customTemplate that should be a js function exporting by default the handler')


program.parse(process.argv);


