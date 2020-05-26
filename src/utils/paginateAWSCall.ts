/* eslint-disable @typescript-eslint/no-explicit-any */

type AWSPromise<T> = {
  promise: () => Promise<T>;
}

type AWSParams = Record<string, any> & { NextToken?: string };

type AWSResponse = { Parameters?: any[], NextToken?: string }

export const paginateAWSCall = async<TParams extends AWSParams, TResult extends AWSResponse, TResponse>
  (params: TParams, getter: (params: TParams) => AWSPromise<TResult>): Promise<TResponse[]> => {

  const { NextToken, Parameters: parameters = [] } = await getter(params).promise()

  if (NextToken) {
    const moreParameters = await paginateAWSCall({ ...params, NextToken }, getter);
    return [...parameters, ...moreParameters];
  } else {
    return parameters;
  }
}
