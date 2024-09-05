using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Locks
{
    public class NamedLockFactory : ILockFactory
    {

        private readonly ConcurrentDictionary<string, object> _lockDict = new ConcurrentDictionary<string, object>();

        public async Task<bool> DoExclusiveAsync(string resource, TimeSpan expiryTime, TimeSpan waitTime, TimeSpan retryTime, Func<Task> action)
        {
            var lockObj = _lockDict.GetOrAdd(resource, s => new object());

            bool lockTaken = false;
            bool isAcquired = false;

            try
            {
                Monitor.TryEnter(lockObj, waitTime, ref lockTaken);
                if (lockTaken)
                {
                    var task = action.Invoke();
                    try
                    {
                        await task;
                        isAcquired = true;
                    }
                    finally
                    {
                        if (task.IsCompleted)
                            task.Dispose();
                    }
                }
            }
            finally
            {
                if (lockTaken)
                    Monitor.Exit(lockObj);
            }

            return isAcquired;
        }

        public bool DoExclusive(string resource, TimeSpan expiryTime, TimeSpan waitTime, TimeSpan retryTime, Action action)
        {
            if (action == null) throw new ArgumentNullException(nameof(action));
            var lockObj = _lockDict.GetOrAdd(resource, s => new object());

            bool lockTaken = false;
            bool isAcquired = false;

            try
            {
                Monitor.TryEnter(lockObj, waitTime, ref lockTaken);
                if (lockTaken)
                {
                    action.Invoke();
                    isAcquired = true;
                }
            }
            finally
            {
                if (lockTaken)
                    Monitor.Exit(lockObj);
            }

            return isAcquired;
        }
    }
}