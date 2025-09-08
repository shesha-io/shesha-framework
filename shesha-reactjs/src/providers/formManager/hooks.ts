import { useEffect, useRef, useState } from "react";
import { useFormManager } from ".";
import { GetFormByIdPayload, GetFormByMarkupPayload } from "./contexts";
import { FormLoadingState, UpToDateForm } from "./interfaces";

export interface GetFormByMarkupResponse {
    state: FormLoadingState;
    form?: UpToDateForm;
    error?: any;
    promise: Promise<UpToDateForm>;
}

export const useFormByMarkup = (props: GetFormByMarkupPayload): GetFormByMarkupResponse => {
    const { getFormByMarkupLoader } = useFormManager();

    const [loader, setLoader] = useState<GetFormByMarkupResponse>(() => getFormByMarkupLoader(props));
    const initialLoaderState = useRef(loader.state);

    useEffect(() => {
        if (initialLoaderState.current !== 'ready')
            loader.promise.then(() => {
                setLoader({ ...loader });
            });
    }, []);

    return loader;
};

export interface GetFormByIdResponse {
    state: FormLoadingState;
    form?: UpToDateForm;
    error?: any;
    promise: Promise<UpToDateForm>;
}

export const useFormById = (props: GetFormByIdPayload): GetFormByIdResponse => {
    const { getFormByIdLoader } = useFormManager();

    const [loader, setLoader] = useState<GetFormByMarkupResponse>(() => getFormByIdLoader(props));
    const initialLoaderState = useRef(loader.state);

    useEffect(() => {
        if (initialLoaderState.current !== 'ready')
            loader.promise.then(() => {
                setLoader({ ...loader });
            });
    }, []);

    return loader;
};
