using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Locks
{
    public class NamedLockFactory : ILockFactory
    {
        private readonly ConcurrentDictionary<string, SemaphoreSlim> _semaphoreDict = new();

        public async Task<bool> DoExclusiveAsync(
            string resource,
            TimeSpan expiryTime,
            TimeSpan waitTime,
            TimeSpan retryTime,
            Func<Task> action)
        {
            if (action == null) throw new ArgumentNullException(nameof(action));

            var semaphore = _semaphoreDict.GetOrAdd(resource, _ => new SemaphoreSlim(1, 1));

            bool lockTaken = false;
            bool isAcquired = false;

            try
            {
                lockTaken = await semaphore.WaitAsync(waitTime);
                if (lockTaken)
                {
                    await action();
                    isAcquired = true;
                }
            }
            finally
            {
                if (lockTaken)
                {
                    semaphore.Release();
                }
            }

            return isAcquired;
        }

        public bool DoExclusive(
            string resource,
            TimeSpan expiryTime,
            TimeSpan waitTime,
            TimeSpan retryTime,
            Action action)
        {
            if (action == null) throw new ArgumentNullException(nameof(action));

            var semaphore = _semaphoreDict.GetOrAdd(resource, _ => new SemaphoreSlim(1, 1));

            bool lockTaken = false;
            bool isAcquired = false;

            try
            {
                lockTaken = semaphore.Wait(waitTime);
                if (lockTaken)
                {
                    action();
                    isAcquired = true;
                }
            }
            finally
            {
                if (lockTaken)
                {
                    semaphore.Release();
                }
            }

            return isAcquired;
        }
    }
}