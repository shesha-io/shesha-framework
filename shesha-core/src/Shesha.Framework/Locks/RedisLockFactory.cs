using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedLockNet.SERedis;
using RedLockNet.SERedis.Configuration;
using StackExchange.Redis;

namespace Shesha.Locks
{
    /// <summary>
    /// Redis lock factory
    /// </summary>
    public class RedisLockFactory: ILockFactory, IDisposable
    {
        private readonly RedLockFactory _redLockFactory;

        public RedisLockFactory(string connectionString)
        {
            var multiplexer = ConnectionMultiplexer.Connect(connectionString);
            _redLockFactory = RedLockFactory.Create(new List<RedLockMultiplexer> { multiplexer });
        }

        /// <summary>
        /// Perform an exclusive action
        /// </summary>
        /// <param name="resource">Name of the resource to lock</param>
        /// <param name="expiryTime">Lock expiration time</param>
        /// <param name="action">Action to perform</param>
        /// <returns></returns>
        public async Task<bool> DoExclusiveAsync(string resource, TimeSpan expiryTime, TimeSpan waitTime, TimeSpan retryTime, Func<Task> action)
        {
            using (var redLock = await _redLockFactory.CreateLockAsync(resource, expiryTime))
            {
                // make sure we got the lock
                if (redLock.IsAcquired)
                {
                    await action.Invoke();
                }

                return redLock.IsAcquired;
            }
        }

        /// <summary>
        /// Perform an exclusive action
        /// </summary>
        /// <param name="resource">Name of the resource to lock</param>
        /// <param name="expiryTime">Lock expiration time</param>
        /// <param name="action">Action to perform</param>
        /// <returns></returns>
        public bool DoExclusive(string resource, TimeSpan expiryTime, TimeSpan waitTime, TimeSpan retryTime, Action action)
        {
            using (var redLock = _redLockFactory.CreateLock(resource, expiryTime, waitTime, retryTime))
            {
                // make sure we got the lock
                if (redLock.IsAcquired)
                {
                    action.Invoke();
                }
                return redLock.IsAcquired;
            }
            /*
            using (var redLock = _redLockFactory.CreateLock(resource, expiryTime))
            {
                // make sure we got the lock
                if (redLock.IsAcquired)
                {
                    action.Invoke();
                }
                return redLock.IsAcquired;
            }
            */
        }

        /// <summary>
        /// Dispose lock factory
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            // Cleanup
            _redLockFactory?.Dispose();
        }
    }
}
