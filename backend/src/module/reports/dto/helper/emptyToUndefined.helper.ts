export const emptyToUndefined = <T>(value: T): T | undefined => {
  if (value === "") {
    return undefined;
  }

  return value;
};
