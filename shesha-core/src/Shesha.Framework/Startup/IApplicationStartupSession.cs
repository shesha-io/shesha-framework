using Shesha.Domain;
using System;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Startup
{
    public interface IApplicationStartupSession
    {
        /// <summary>
        /// Log application startup
        /// </summary>
        /// <param name="arguments"></param>
        /// <returns></returns>
        Task<ApplicationStartupDto> LogApplicationStartAsync(LogApplicationStartArgs arguments);

        /// <summary>
        /// Check is DB support logging of application startup
        /// </summary>
        /// <returns></returns>
        Task<bool> DbIsReadyForLoggingAsync();

        /// <summary>
        /// Mark startup as successful
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task StartupSuccessAsync(Guid id);

        /// <summary>
        /// Mark startup as failed
        /// </summary>
        /// <param name="id"></param>
        /// <param name="e"></param>
        /// <returns></returns>
        Task StartupFailedAsync(Guid id, Exception e);

        /// <summary>
        /// Information about previous startup
        /// </summary>
        ApplicationStartupDto PreviousStartup { get; }

        /// <summary>
        /// Information about current startup
        /// </summary>
        ApplicationStartupDto CurrentStartup { get; }

        /// <summary>
        /// Checks is assembly was not changed since previous startup session
        /// </summary>
        /// <param name="assembly"></param>
        /// <returns></returns>
        bool AssemblyStaysUnchanged(Assembly assembly);
        
        /// <summary>
        /// If true, indicates that all assemblies stays unchanged since previous startup
        /// </summary>
        bool AllAssembliesStayUnchanged { get; }
    }
}
