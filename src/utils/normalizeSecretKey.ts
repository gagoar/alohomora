export const normalizeSecretKey = (key: string, prefix: string): { environment: string, name: string } => {
  const [, environment, name] = key.replace(`/${prefix}`, '').split('/');
  return { environment, name };
};