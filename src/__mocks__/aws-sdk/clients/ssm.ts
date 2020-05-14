/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SSM as RealSSM } from 'aws-sdk';
enum Methods {
  describeParameters = 'describeParameters',
  getParameter = 'getParameter',
  putParameter = 'putParameter'
}

type SSMMOCKS = Partial<Record<Methods, (props: any) => any>>;
let ssmMocks = {} as SSMMOCKS;

type Dispatch = (response: Promise<any>, callback?: Function) => { promise: () => Promise<any> } | any
const dispatch: Dispatch = (response, callback?: Function) => {
  if (!callback) {
    return {
      promise: () => response,
    }
  }
  return response.then((result: RealSSM.DescribeParametersResult) => callback(null, result)).catch((err: Error) => callback(err, null));
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
  static __setResponseForMethods(mock: SSMMOCKS) {
    ssmMocks = { ...ssmMocks, ...mock };
  }

  static __showMockedPayloads() {
    return { ...ssmMocks };
  }

  getParameter(props: RealSSM.GetParametersRequest, callback?: Function) {
    const promise = baseHandler(Methods.getParameter, props);

    return dispatch(promise, callback);

  }
  putParameter(props: RealSSM.PutParameterRequest, callback?: Function) {
    const promise = baseHandler(Methods.putParameter, props);

    return dispatch(promise, callback);
  }

  describeParameters(props: RealSSM.DescribeParametersRequest, callback?: Function) {
    const promise = baseHandler(Methods.describeParameters, props);

    return dispatch(promise, callback);

  }
}