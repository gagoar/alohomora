/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SSM as RealSSM } from 'aws-sdk';
enum Methods {
  describeParameters = 'describeParameters'
}
type SSMMOCKS = Record<Methods, (input: any) => any>
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

const handleDescribeParameters = async (props: RealSSM.DescribeParametersRequest): Promise<Record<string, any>> => {
  if (Methods.describeParameters in ssmMocks) {
    return ssmMocks[Methods.describeParameters](props);
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

  describeParameters(props: RealSSM.DescribeParametersRequest, callback?: Function) {
    const promise = handleDescribeParameters(props);

    return dispatch(promise, callback);

  }
}