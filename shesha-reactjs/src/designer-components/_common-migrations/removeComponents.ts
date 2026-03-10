export const removeComponents = <T>(prev: T): T => {
  const result = { ...prev };
  delete result["components"];
  return result as T;
};
