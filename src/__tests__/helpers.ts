type Response = (...args: unknown[]) => unknown;
export const createHandler = (response: Response = () => undefined) => {
  return jest.fn(response);
}