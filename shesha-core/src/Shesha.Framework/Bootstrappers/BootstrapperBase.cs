using Abp.Domain.Uow;
using Castle.Core.Logging;
using Shesha.Domain;
using Shesha.Reflection;
using Shesha.Startup;
using System;
using System.Threading.Tasks;

namespace Shesha.Bootstrappers
{
    public abstract class BootstrapperBase: IBootstrapper
    {
        protected readonly IUnitOfWorkManager UnitOfWorkManager;
        protected readonly IApplicationStartupSession StartupSession;
        protected readonly IBootstrapperStartupService BootstrapperStartupService;

        private ILogger Logger { get; set; } = NullLogger.Instance;
        protected BootstrapperStartupContext Context = new BootstrapperStartupContext();
        protected bool ForceUpdate;
        protected BootstrapperStartup BootstrapInfo;


        public BootstrapperBase(
            IUnitOfWorkManager unitOfWorkManager,
            IApplicationStartupSession startupSession,
            IBootstrapperStartupService bootstrapperStartupService
        )
        {
            UnitOfWorkManager = unitOfWorkManager;
            StartupSession = startupSession;
            BootstrapperStartupService = bootstrapperStartupService;
        }

        protected virtual void LogInfo(string message)
        {
            Context.AddLog(message);
            Logger.Info(message);
        }

        public async Task ProcessAsync()
        {
            var bootstrapperType = GetType().StripCastleProxyType();

            BootstrapInfo = await BootstrapperStartupService.StartBootstrapperAsync(bootstrapperType);
            ForceUpdate = await BootstrapperStartupService.IsForcedAsync(bootstrapperType);
            try
            {
                await ProcessInternalAsync();
            }
            catch(Exception e)
            {
                Context.AddLog($"{e.Message}; \nStack trace: {e.StackTrace}");
                await BootstrapperStartupService.FailedBootstrapperAsync(BootstrapInfo, $"Bootstrap failed", Context);
                throw;
            }

            await BootstrapperStartupService.CompleteBootstrapperAsync(BootstrapInfo, $"Bootstrap finished successfully", Context);
        }

        protected abstract Task ProcessInternalAsync();
    }
}
