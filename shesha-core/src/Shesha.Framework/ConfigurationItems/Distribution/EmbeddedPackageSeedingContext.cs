using Castle.Core.Logging;
using System.Reflection;
using System.Threading;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Embedded packages seeding context
    /// </summary>
    public class EmbeddedPackageSeedingContext
    {
        /// <summary>
        /// Assembly to be processed
        /// </summary>
        public Assembly Assembly { get; private set; }

        /// <summary>
        /// Logger
        /// </summary>
        public ILogger Logger { get; set; } = NullLogger.Instance;

        /// <summary>
        /// Cancellation token, is used for termination of the seeding process
        /// </summary>
        public CancellationToken CancellationToken { get; set; } = CancellationToken.None;

        public EmbeddedPackageSeedingContext(Assembly assembly)
        {
            Assembly = assembly;
        }
    }
}
