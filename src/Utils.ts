export const propertyToArrayed = (obj: any, key: string): any[] => {
  return Array.isArray(obj[key])
    ? obj[key]
    : [obj[key]].filter((x) => x !== undefined);
};

export const groupByWithOmitKey = <T, K extends keyof T>(
  values: Array<T>,
  key: K
): ReadonlyMap<string, Omit<T, K>[]> =>
  values.reduce((prev, curr) => {
    const next = new Map(prev);
    const v = { ...curr };
    const valueKey = v[key] as unknown as string;
    delete v[key];
    const prevValue = next.get(valueKey);
    if (prevValue === undefined) {
      next.set(valueKey, [v]);
    } else {
      next.set(valueKey, [...prevValue, v]);
    }
    return next;
  }, new Map<string, Omit<T, K>[]>());

export const detectSeparator = (content: string): "\r" | "\r\n" =>
  content.includes("\r\n") ? "\r\n" : "\r";
