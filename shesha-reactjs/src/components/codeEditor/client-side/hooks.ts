import { IDisposable } from "monaco-editor";
import { useEffect, useRef } from "react";

export type SubscriptionsManager = {
    add: (subscription: IDisposable) => void;
    clear: () => void;
    count: number;
};

export const useDisposableSubscriptions = (): SubscriptionsManager => {
    const subscriptions = useRef<IDisposable[]>([]);
    const addSubscription = (subscription: IDisposable) => {
        subscriptions.current?.push(subscription);
    };

    const clearSubscriptions = () => {
        subscriptions.current?.forEach(s => s.dispose());
        subscriptions.current = [];
    };

    useEffect(() => {
        return () => clearSubscriptions();
    }, []);

    return {
        add: addSubscription,
        clear: clearSubscriptions,
        count: subscriptions.current.length,
    };  
};