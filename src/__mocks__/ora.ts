export const stopAndPersist = jest.fn();
export const fail = jest.fn();
export default () =>
  ({
    start: jest.fn(() => ({
      stopAndPersist,
      fail,
    }))
  })