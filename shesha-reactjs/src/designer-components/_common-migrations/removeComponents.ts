export const removeComponents = <T extends object>(prev: T): T => {
  const result = { ...prev };
  if ("components" in result)
    delete result["components"];
  return result as T;
};
