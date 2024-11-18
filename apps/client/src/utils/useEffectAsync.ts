import { useEffect } from "react";

export type Awaiter = <T>(awaitable: Promise<T>) => Promise<T>;
type Callback = (
  awaitable: Awaiter,
  registerDestructor: (destructor: () => void) => void,
) => Promise<unknown>;
type OnUnmount = (reason?: Unmounted) => void;

export class Unmounted {
  message = "Unmounted";
}

/**
 * useEffectAsync provides a way to run asynchronous operations that are automatically
 * cancelled when the component which owns the useEffectAsync hook is unmounted.
 *
 * @example
 * This shows how to use awaiter to automically cancel on unmount, if the component is
 * unmounted then the `await` will never return, so the setState will not be applied
 * after unmount.
 * ```
 * const [state, setState] = useState("");
 * useEffectAsync(async (awaiter) => {
 *   await awaiter(someAsyncOperation());
 *   setState("completed");
 * });
 * ```
 *
 * @example
 * This shows how to register a destructor, this is the same function that would
 * be returned in `useEffect`, this function must be called before the first
 * async operation.
 * ```
 * useEffectAsync(async (awaiter, setDestructor) => {
 *   setDestructor(() => {
 *     console.log("cleanup operation");
 *   });
 *   await awaiter(someAsyncOperation());
 * });
 * ```
 *
 * @example
 * This shows how to deal with unmount operations:
 * useEffectAsync(async (awaiter, setDestructor) => {
 *   try {
 *     await awaiter(someAsyncOperation());
 *   } catch (e) {
 *     if (e instanceof Unmount) {
 *       console.log("component was unmounted");
 *     }
 *   }
 * });
 */
export function useEffectAsync(
  callback: Callback,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: readonly any[],
): void {
  useEffect(() => {
    let tooLateToRegisterDestructor = false;
    let onDestroy: (() => void) | undefined;

    const setDestructor = (newOnDestroy: () => void): void => {
      if (tooLateToRegisterDestructor) {
        throw new Error("Cannot register destructor after first asynchronous operation");
      }
      onDestroy = newOnDestroy;
    };

    let onUnmount: OnUnmount | undefined;
    const unmountPromise = new Promise((_, reject) => {
      onUnmount = reject;
    });

    const awaiter = <T>(awaitable: Promise<T>): Promise<T> => {
      tooLateToRegisterDestructor = true;
      return Promise.race([awaitable, unmountPromise as Promise<T>]);
    };

    unmountPromise.catch(() => {
      // ensure the error is caught at least once, when the callee never uses awaiter
      // this will prevent an uncaught promise rejection from being logged
    });

    callback(awaiter, setDestructor).then(
      () => {
        onUnmount = undefined;
      },
      e => {
        if (!(e instanceof Unmounted)) {
          throw e;
        }
      },
    );

    return () => {
      if (onUnmount) {
        onUnmount(new Unmounted());
      }

      if (onDestroy) {
        onDestroy();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
