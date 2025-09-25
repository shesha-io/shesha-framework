export const removeComponents = <T>(prev: T) => {
  const result = {...prev};
  delete result["components"];
  return result as T;
};
