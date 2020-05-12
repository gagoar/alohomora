import program from 'commander';
import { listParameters, getParameter } from '../';
import { setAWSCredentials } from '../utils/setAWSCredentials';
interface Options { prefix: string, awsProfile?: string, environment?: string, awsRegion?: string, awsAccessKeyId?: string, awsSecretAccessKey?: string, awsSessionToken?: string }

interface Command { parent: Options }

program
  .name('alohomora')
  .version('1.0.0')
  .description('✨ AWS Systems Manager Parameter Store (ssm) cli  🔏')
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

    const { parent:
      {
        environment,
        prefix,
        awsRegion: region,
        awsProfile: profile,
        awsAccessKeyId: accessKeyId,
        awsSecretAccessKey: secretAccessKey,
        awsSessionToken: sessionToken
      }
    } = command;

    setAWSCredentials({ profile, accessKeyId, secretAccessKey, sessionToken });
    const response = await listParameters({ environment, prefix, region });

    console.log(response);
  });

program
  .command('get <name>')
  .description('Get secret')
  .action(async (name: string, command: Command): Promise<void> => {


    const { parent:
      {
        environment,
        prefix,
        awsRegion: region,
        awsProfile: profile,
        awsAccessKeyId: accessKeyId,
        awsSecretAccessKey: secretAccessKey,
        awsSessionToken: sessionToken
      }
    } = command;


    if (name) {
      setAWSCredentials({ profile, accessKeyId, secretAccessKey, sessionToken });
      const response = await getParameter({ name, environment, prefix, region });
      console.log(response);
    }

  });

program
  .command('set <name> <value>')
  .description('Set secret')
  .action(function (...args: any) {
    console.log('get', args);
  });


program
  .command('export [templateName]')
  .description('export all keys, a template can be chosen out of the built ones or specify a --customTemplate, by default it exports to the shell')
  .option('--customTemplate <path/to/the/custom/function.js>, pass the arguments to customTemplate that should be a js function exporting by default the handler')


program.parse(process.argv);


