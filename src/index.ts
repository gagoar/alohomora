
import 'aws-sdk/lib/node_loader'; // Hack needed before the first import
import SSM from 'aws-sdk/clients/ssm';
import { SharedIniFileCredentials, Config } from 'aws-sdk/lib/core'; // or any other `aws-sdk` export

const API_VERSION = '2014-11-06';
type CredentialsOptions = {
  accessKeyId: string,
  secretAccessKey: string,
  awsSessionToken?: string,
  profile?: string
}
// type LoginOptions = { credentials?: CredentialsOptions };
// type Login = (credentials?: LoginOptions) => void;

// const login: Login = (credentials) => {
//   return void;
// }


enum Environment {
  development = 'development',
  production = 'production',
  staging = 'staging',
  test = 'test',
  all = 'all'
}

// enum Actions {
//   LIST = 'LIST',
//   GET = 'get',
//   SET = 'set',
//   REMOVE = 'remove',
//   EXPORT = 'export',
// }

type Options = { environment?: Environment | string, key?: string, prefix: string, region?: string };

export const list = async (credentialsOptions: CredentialsOptions | null, { environment, prefix, region = 'us-east-1' }: Options): Promise<string | undefined> => {

  if (credentialsOptions) {
    const credentials = credentialsOptions.profile ? new SharedIniFileCredentials({ profile: credentialsOptions.profile }) : credentialsOptions;
    new Config({ credentials });
  }

  const ssm = new SSM({ apiVersion: API_VERSION, region });


  const path = environment ? `/${prefix}/${environment}/` : `/${prefix}`;

  console.log(path)
  const parameterFilters = [
    {
      Key: 'Name',
      Option: 'Contains',
      Values: [path]
    }
  ]

  const params = {
    MaxResults: 10,
    ParameterFilters: parameterFilters,
  };

  try {
    const response = await ssm.describeParameters(params).promise();
    debugger;
    const parameters = response.Parameters ? response.Parameters.map(({ Name: name }) => name!) : [];
    return JSON.stringify({ parameters }, null, 2);
  } catch (e) {
    console.log('error pulling list', e);
    throw e;
  }

}
// type GetVersionsInput = { FunctionName: string; Marker?: string };
// type GetVersionsOutput = Lambda.FunctionList;
// type GetVersions = (params: GetVersionsInput) => Promise<GetVersionsOutput>;
// const getVersions: GetVersions = async params => {
//   try {
//     const {
//       Versions: data = [],
//       NextMarker
//     } = await lambda.listVersionsByFunction(params).promise();
//     if (NextMarker) {
//       const moreData = await getVersions({ ...params, Marker: NextMarker });
//       return [...data, ...moreData];
//     } else {
//       return data;
//     }
//   } catch (err) {
//     log(
//       `ERROR:getVersions:${params.FunctionName}:${
//         params.Marker
//       }:${err.toString()}`
//     );
//     throw err;
//   }
// };
// const get = (options: Options): string | undefined => {

// }


// const set = (options: Options): boolean => {

// }

// const remove = (options: Options): boolean => {

// }

// type ExportOptions = { template?: string = 'shell', custom?: string };

// const exportOutput = (options: Options, template?: string = 'shell', custom?: string): string => {

// }


// export const main = (credentials: CredentialsOptions, options: Options, exportOptions?: ExportOptions): string | undefined => {

// }

