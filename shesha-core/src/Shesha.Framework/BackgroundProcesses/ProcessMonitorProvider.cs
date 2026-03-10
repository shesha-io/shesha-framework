using Abp.Dependency;
using System;
using System.Linq;

namespace Shesha.BackgroundProcesses
{
    /// <summary>
    /// Process monitor provider
    /// </summary>
    public class ProcessMonitorProvider : IProcessMonitorProvider, ITransientDependency
    {
        private readonly IIocResolver _iocResolver;
        public ProcessMonitorProvider(IIocResolver iocResolver)
        {
            _iocResolver = iocResolver;
        }
        /// <summary>
        /// Returns process monitor for a specified <paramref name="processType"/>
        /// </summary>
        /// <param name="processType">Process type</param>
        /// <returns></returns>
        public IProcessMonitor GetProcessMonitor(string processType)
        {
            var monitors = _iocResolver.ResolveAll<IProcessMonitor>();
            var monitor = monitors.SingleOrDefault(r => r.ProcessType == processType);
            return monitor ?? throw new NotSupportedException($"Process monitor for '{processType}' is not supported.");
        }
    }
}
