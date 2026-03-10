using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Handlers;
using Castle.Core.Logging;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.Reflection;
using Shesha.Swagger;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Warmup
{
    public class ApplicationWarmupService : IAsyncEventHandler<DatabaseInitializedEventData>, ITransientDependency
    {
        private readonly IModelConfigurationManager _modelConfigurationManager;
        private readonly SheshaFrameworkModule _frameworkModule;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        public ILogger Logger = NullLogger.Instance;

        public ApplicationWarmupService(
            IModelConfigurationManager modelConfigurationManager,
            SheshaFrameworkModule frameworkModule,
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IUnitOfWorkManager unitOfWorkManager
        )
        {
            _modelConfigurationManager = modelConfigurationManager;
            _frameworkModule = frameworkModule;
            _entityConfigRepository = entityConfigRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public Task HandleEventAsync(DatabaseInitializedEventData eventData)
        {
            if (_frameworkModule.SkipAppWarmUp)
                return Task.CompletedTask;

            var task = Task.Run(async () =>
            {
                try
                {
                    await ProcessAsync();
                }
                catch (Exception ex)
                {
                    Logger.Error("", ex);
                }
            });
            return Task.CompletedTask;
        }

        private async Task ProcessAsync()
        {
            using var uow = _unitOfWorkManager.Begin(System.Transactions.TransactionScopeOption.RequiresNew);
            try
            {
                var entityConfigs = await _entityConfigRepository.GetAllListAsync();
                foreach (var entityConfig in entityConfigs)
                {
                    await _modelConfigurationManager.GetCachedModelConfigurationOrNullAsync(entityConfig, false);
                }
            }
            catch (Exception e)
            {
                Logger.Error($"{e.Message}", e);
            }
        }
    }
}
