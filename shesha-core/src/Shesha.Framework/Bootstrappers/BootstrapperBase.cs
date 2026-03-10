using Abp.Domain.Uow;
using Castle.Core.Logging;
using Shesha.Domain;
using Shesha.Reflection;
using Shesha.Startup;
using System;
using System.Reflection;
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
            IBootstrapperStartupService bootstrapperStartupService,
            ILogger logger
        )
        {
            UnitOfWorkManager = unitOfWorkManager;
            StartupSession = startupSession;
            BootstrapperStartupService = bootstrapperStartupService;
            //_logger = logger;
        }

        protected virtual void LogInfo(string message)
        {
            Context.AddLog(message);
            Logger.Warn(message);
        }

        public async Task<bool> ProcessAsync(bool force)
        {
            var bootstrapperType = GetType().StripCastleProxyType();

            using (var unitOfWork = UnitOfWorkManager.Begin())
            {
                var forced = await BootstrapperStartupService.IsForcedAsync(bootstrapperType);
                /*if (skipBootstrappers && !forced)
                {
                    await BootstrapperStartupService.SkipBootstrapperAsync(bootstrapperType, $"Bootstrapper skipped due to configuration (`{SkipBootstrappersSetting}` is {skipBootstrappers})");
                    continue;
                }*/
                if (StartupSession.AllAssembliesStayUnchanged && !forced)
                {
                    await BootstrapperStartupService.SkipBootstrapperAsync(bootstrapperType, $"Bootstrapper skipped. Previous startup was full, successful and all assemblies stay unchanged");
                    return false;
                }

                BootstrapInfo = await BootstrapperStartupService.StartBootstrapperAsync(bootstrapperType);
                ForceUpdate = force || await BootstrapperStartupService.IsForcedAsync(bootstrapperType);
                await unitOfWork.CompleteAsync();
            }
            var isError = false;
            try
            {
                var method = bootstrapperType.GetMethod(nameof(ProcessInternalAsync), BindingFlags.Instance | BindingFlags.NonPublic).NotNull();
                var unitOfWorkAttribute = method.GetAttributeOrNull<UnitOfWorkAttribute>(true);
                var useDefaultUnitOfWork = unitOfWorkAttribute == null || !unitOfWorkAttribute.IsDisabled;

                if (useDefaultUnitOfWork)
                {
                    using (var unitOfWork = UnitOfWorkManager.Begin())
                    {
                        await ProcessInternalAsync();
                        await unitOfWork.CompleteAsync();
                    }
                }
                else
                    await ProcessInternalAsync();
            }
            catch (Exception e)
            {
                isError = true;
                Context.AddLog($"{e.Message}; \nStack trace: {e.StackTrace}");
                throw;
            }
            finally
            {
                using (var unitOfWork = UnitOfWorkManager.Begin())
                {
                    if (isError)
                        await BootstrapperStartupService.FailedBootstrapperAsync(BootstrapInfo, $"Bootstrap failed", Context);
                    else
                        await BootstrapperStartupService.CompleteBootstrapperAsync(BootstrapInfo, $"Bootstrap finished successfully", Context);

                    await unitOfWork.CompleteAsync();
                }
            }


            return true;
        }

        protected abstract Task ProcessInternalAsync();
    }
}
