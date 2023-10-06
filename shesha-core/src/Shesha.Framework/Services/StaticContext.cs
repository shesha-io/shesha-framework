using Abp.Dependency;
using Abp.Domain.Uow;
using Castle.Core.Logging;
using Shesha.Extensions;
using Shesha.Utilities;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Services
{
    /// <summary>
    /// Static context, is used as a temporary solution for unit tests
    /// </summary>
    public static class StaticContext
    {
        private static IIocManager _iocManager;

        /// <summary>
        /// Ioc manager
        /// </summary>
        public static IIocManager IocManager => _iocManager ?? Abp.Dependency.IocManager.Instance;

        /// <summary>
        /// Set IocManager, is used in unit tests only
        /// </summary>
        /// <param name="iocManager"></param>
        public static void SetIocManager(IIocManager iocManager)
        {
            _iocManager = iocManager;
        }

        public static void LogUow(string message)
        {
            var ioc = StaticContext.IocManager;
            var logger = ioc.Resolve<ILogger>();
            var uowManager = ioc.Resolve<IUnitOfWorkManager>();
            var activeUow = uowManager.Current;

            var uow = activeUow as IUnitOfWork;

            var chain = uow?.GetFullChain(u => u.Outer) ?? new List<IUnitOfWork>();
            chain.Reverse();
            var chainIds = chain.Select(u => u.Id).Delimited(" -> ");

            logger.Warn($"UOW ({message}): {activeUow != null}, id: {uow?.Id}, chain: {chainIds}");
        }        
    }
}
