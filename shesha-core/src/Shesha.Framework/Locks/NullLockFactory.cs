using System;
using System.Threading.Tasks;

namespace Shesha.Locks
{
    /// <summary>
    /// Implements null object pattern for <see cref="ILockFactory"/>.
    /// </summary>
    public class NullLockFactory: ILockFactory
    {
        /// inheritedDoc
        public async Task<bool> DoExclusiveAsync(string resource, TimeSpan expiryTime, TimeSpan waitTime, TimeSpan retryTime, Func<Task> action)
        {
            await action.Invoke();
            return true;
        }

        /// inheritedDoc
        public bool DoExclusive(string resource, TimeSpan expiryTime, TimeSpan waitTime, TimeSpan retryTime, Action action)
        {
            action.Invoke();
            return true;
        }
    }
}
