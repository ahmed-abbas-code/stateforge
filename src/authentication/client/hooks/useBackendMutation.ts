// src/authentication/client/hooks/useBackendMutation.ts
import useSWRMutation from 'swr/mutation';
import { mutate as revalidateCache } from 'swr';
import { fetcher } from './useBackend';

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface MutationOptions<Data, Err> {
  revalidate?: boolean | string[];
  onSuccess?: (data: Data) => void | Promise<void>;
  onError?: (err: Err) => void;
}

export function useBackendMutation<
  Body = unknown,
  Data = unknown,
  Err = unknown
>(
  path: string,
  method: HttpMethod,
  opts: MutationOptions<Data, Err> = {}
) {
  const {
    revalidate: revalidateOpt = true,
    onSuccess,
    onError,
    ...swrCfg
  } = opts;

  const key = [path, method] as const;

  const mutationFetcher = async (
    _key: typeof key,
    { arg }: { arg: Body }
  ): Promise<Data> => {
    const init: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: arg === undefined ? undefined : JSON.stringify(arg),
    };
    return fetcher(path, init) as Promise<Data>;
  };

  const { trigger, isMutating: loading, error } =
    useSWRMutation<Data, Err, typeof key, Body>(key, mutationFetcher, {
      ...swrCfg,
      onSuccess: async (data, k, cfg) => {
        if (revalidateOpt === true) {
          revalidateCache((cacheKey: unknown) =>
            typeof cacheKey === 'string' && cacheKey.startsWith(path)
          );
        } else if (Array.isArray(revalidateOpt)) {
          await Promise.all(revalidateOpt.map(k2 => revalidateCache(k2)));
        }
        await onSuccess?.(data);
        cfg?.onSuccess?.(data, k, cfg);
      },
      onError: (err, k, cfg) => {
        onError?.(err);
        cfg?.onError?.(err, k, cfg);
      },
    });

  // unify SWR’s union-trigger into one callable signature
  const triggerFn = trigger as unknown as (arg?: Body) => Promise<Data>;

  /* eslint-disable no-redeclare */
  // Overload #1: no-arg version for Body = undefined
  function run(): Promise<Data>;
  // Overload #2: single-arg version for Body ≠ undefined
  function run(arg: Body): Promise<Data>;
  // Implementation
  function run(arg?: Body): Promise<Data> {
    return triggerFn(arg as Body);
  }
  /* eslint-enable no-redeclare */

  return { run, loading, error };
}
