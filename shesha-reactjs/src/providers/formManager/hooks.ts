import { useEffect, useRef, useState } from "react";
import { useFormManager } from ".";
import { GetFormByMarkupPayload } from "./contexts";
import { FormLoadingState, UpToDateForm } from "./interfaces";

export interface GetFormByMarkupResponse {
    state: FormLoadingState;
    form?: UpToDateForm;
    error?: string;
    promise: Promise<UpToDateForm>;
}

export const useFormByMarkup = (props: GetFormByMarkupPayload): GetFormByMarkupResponse => {
    const { getFormByMarkupLoader } = useFormManager();

    const [loader, setLoader] = useState<GetFormByMarkupResponse>(() => getFormByMarkupLoader(props));
    const initialLoaderState = useRef(loader.state);

    useEffect(() => {
        if (initialLoaderState.current !== 'ready')
            loader.promise.then(() => {
                setLoader({...loader});
            });
    }, []);

    return loader;
};