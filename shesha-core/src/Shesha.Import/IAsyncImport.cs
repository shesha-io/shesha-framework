using System;
using System.Threading;
using System.Threading.Tasks;
using log4net;
using Shesha.Domain;

namespace Shesha.Import
{
    /// <summary>
    /// Async import process
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public interface IAsyncImport<T> where T : ImportResult
    {
        /// <summary>
        /// Starts async import
        /// </summary>
        /// <param name="importResultId">Import result id</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns></returns>
        Task ImportAsync(Guid importResultId, CancellationToken cancellationToken);

        /// <summary>
        /// Sets external logger
        /// </summary>
        void SetExternalLogger(ILog logger, string logGroupName);
    }
}
