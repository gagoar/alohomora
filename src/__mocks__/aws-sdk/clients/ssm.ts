/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SSM as RealSSM } from 'aws-sdk';
type SSMMOCKS = Record<string, any>
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
  const [filter] = props.ParameterFilters!;

  if (filter && filter.Key in ssmMocks) {
    return ssmMocks[filter.Key];
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