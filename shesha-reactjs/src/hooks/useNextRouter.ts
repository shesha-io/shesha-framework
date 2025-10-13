import { IRouter } from "@/providers";
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';

const convertSearchParamsToDictionary = (params: ReadonlyURLSearchParams): NodeJS.Dict<string | string[]> => {
  const entries = params.entries();
  const result: NodeJS.Dict<string | string[]> = {};
  for (const [key, value] of entries) { // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  return result;
};

export const useNextRouter = (): IRouter => {
  const router = useRouter();
  const query = useSearchParams();

  const queryParams = convertSearchParamsToDictionary(query);
  const pathname = usePathname();
  const queryString = query.toString();
  const fullPath = queryString
    ? pathname + '?' + queryString
    : pathname;

  return {
    push: router.push,
    back: router.back,
    query: queryParams,
    path: pathname,
    queryString: queryString,
    fullPath: fullPath,
  };
};
