import { useRef, useState } from "react";
import { useFormManager } from ".";
import { GetFormByIdPayload, GetFormByMarkupPayload } from "./contexts";
import { FormLoadingState, UpToDateForm } from "./interfaces";
import { useEffectOnce } from "react-use";

export interface GetFormByMarkupResponse {
  state: FormLoadingState;
  form?: UpToDateForm;
  error?: unknown;
  promise: Promise<UpToDateForm>;
}

export const useFormByMarkup = (props: GetFormByMarkupPayload): GetFormByMarkupResponse => {
  const { getFormByMarkupLoader } = useFormManager();

  const [loader, setLoader] = useState<GetFormByMarkupResponse>(() => getFormByMarkupLoader(props));
  const initialLoaderState = useRef(loader.state);

  useEffectOnce(() => {
    if (initialLoaderState.current !== 'ready')
      loader.promise.then(() => {
        setLoader({ ...loader });
      }).catch((error) => {
        console.error('Failed to fetch form by markup', error);
        throw error;
      });
  });

  return loader;
};

export interface GetFormByIdResponse {
  state: FormLoadingState;
  form?: UpToDateForm;
  error?: unknown;
  promise: Promise<UpToDateForm>;
}

export const useFormById = (props: GetFormByIdPayload): GetFormByIdResponse => {
  const { getFormByIdLoader } = useFormManager();

  const [loader, setLoader] = useState<GetFormByMarkupResponse>(() => getFormByIdLoader(props));
  const initialLoaderState = useRef(loader.state);

  useEffectOnce(() => {
    if (initialLoaderState.current !== 'ready')
      loader.promise.then(() => {
        setLoader({ ...loader });
      }).catch((error) => {
        console.error('Failed to fetch form by id', error);
        throw error;
      }); ;
  });

  return loader;
};
