const pattern = /([$][a-zA-Z_][a-zA-Z0-9_]*)|([$]{\s*[a-zA-Z_][a-zA-Z0-9_]*\s*})/g;
const cleanup = /(^[$]({\s*)?)|(\s*}$)/g;

export const envsub = (input: string): string => {
  return input.replace(pattern, needle => {
    const key = needle.replace(cleanup, '');
    return process.env[key] || '';
  });
};
