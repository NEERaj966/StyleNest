import { useCallback, useEffect, useRef } from "react";

const useThrottle = (callback, delay = 1000) => {
    const lastCallRef = useRef(0);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        (...args) => {
            const now = Date.now();

            if (now - lastCallRef.current < delay) {
                return;
            }

            lastCallRef.current = now;

            callbackRef.current(...args);
        },
        [delay]
    );
};

export default useThrottle;
