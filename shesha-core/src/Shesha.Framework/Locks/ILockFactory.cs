using System;
using System.Threading.Tasks;

namespace Shesha.Locks
{
    /// <summary>
    /// Interface of the lock factory. Is used for local or distributed locks
    /// </summary>
    public interface ILockFactory
    {
        /// <summary>
        /// Perform an exclusive action
        /// </summary>
        /// <param name="resource">Name of the resource to lock</param>
        /// <param name="expiryTime">Lock expiration time</param>
        /// <param name="action">Action to perform</param>
        /// <returns></returns>
        Task<bool> DoExclusiveAsync(string resource, TimeSpan expiryTime, TimeSpan waitTime, TimeSpan retryTime, Func<Task> action);

        /// <summary>
        /// Perform an exclusive action
        /// </summary>
        /// <param name="resource">Name of the resource to lock</param>
        /// <param name="expiryTime">Lock expiration time</param>
        /// <param name="action">Action to perform</param>
        /// <returns></returns>
        bool DoExclusive(string resource, TimeSpan expiryTime, TimeSpan waitTime, TimeSpan retryTime, Action action);
    }
}
