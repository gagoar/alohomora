/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SSM as RealSSM, AWSError, Request } from 'aws-sdk';


type Return<T> = Request<T, AWSError>;
type Callback<T = any> = (err: AWSError | null, data: T) => void;

enum Methods {
  describeParameters = 'describeParameters',
  getParameter = 'getParameter',
  putParameter = 'putParameter',
  deleteParameter = 'deleteParameter',
  getParametersByPath = 'getParametersByPath'
}

type SSMMOCKS = Partial<Record<Methods, (props: any) => any>>;
let ssmMocks = {} as SSMMOCKS;

type Dispatch = (response: Promise<any>, callback?: Callback) => { promise: () => Promise<any> } | any
const dispatch: Dispatch = (response, callback?: Callback) => {
  if (!callback) {
    return {
      promise: () => response,
    }
  }
  return response.then((result: RealSSM.DescribeParametersResult) => callback(null, result)).catch((err: AWSError) => callback(err, null));
}

const baseHandler = async <T>(method: Methods, props: T): Promise<Record<string, any>> => {
  if (method in ssmMocks) {
    const handler = ssmMocks[method];
    return handler && handler(props);
  } else {
    return {}
  }
};

export default class SSM {
  static __setResponseForMethods(mock: SSMMOCKS): void {
    ssmMocks = { ...ssmMocks, ...mock };
  }

  static __showMockedPayloads(): SSMMOCKS {
    return { ...ssmMocks };
  }

  getParameter(props: RealSSM.GetParametersRequest, callback: Callback<RealSSM.GetParametersResult>): Return<RealSSM.GetParametersResult> {
    const promise = baseHandler(Methods.getParameter, props);

    return dispatch(promise, callback);

  }
  putParameter(props: RealSSM.PutParameterRequest, callback: Callback<RealSSM.PutParameterResult>): Return<RealSSM.PutParameterResult> {
    const promise = baseHandler(Methods.putParameter, props);

    return dispatch(promise, callback);
  }

  deleteParameter(props: RealSSM.DeleteParameterRequest, callback: Callback<RealSSM.DeleteParameterResult>): Return<RealSSM.DeleteParameterResult> {
    const promise = baseHandler(Methods.deleteParameter, props);

    return dispatch(promise, callback);
  }

  getParametersByPath(props: RealSSM.GetParametersByPathRequest, callback: Callback<RealSSM.GetParametersByPathResult>): Return<RealSSM.GetParametersByPathResult> {
    const promise = baseHandler(Methods.getParametersByPath, props);

    return dispatch(promise, callback);
  }

  describeParameters(props: RealSSM.DescribeParametersRequest, callback: Callback<RealSSM.DescribeParametersRequest>): Return<RealSSM.DescribeParametersResult> {
    const promise = baseHandler(Methods.describeParameters, props);

    return dispatch(promise, callback);

  }
}