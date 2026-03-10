namespace Shesha.BackgroundProcesses
{
    /// <summary>
    /// Process monitor provider
    /// </summary>
    public interface IProcessMonitorProvider
    {
        /// <summary>
        /// Returns process monitor for a specified <paramref name="processType"/>
        /// </summary>
        /// <param name="processType">Process type</param>
        /// <returns></returns>
        IProcessMonitor GetProcessMonitor(string processType);
    }
}
