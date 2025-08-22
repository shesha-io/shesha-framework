using Abp.Dependency;
using Abp.Events.Bus.Handlers;
using Castle.Core.Logging;
using Shesha.DynamicEntities;
using Shesha.Reflection;
using Shesha.Swagger;
using System;
using System.Threading.Tasks;

namespace Shesha.Warmup
{
    public class ApplicationWarmupService : IAsyncEventHandler<DatabaseInitializedEventData>, ITransientDependency
    {
        private readonly IModelConfigurationManager _entityConfigs;
        public ILogger Logger = NullLogger.Instance;

        public ApplicationWarmupService(IModelConfigurationManager entityConfigs)
        {
            _entityConfigs = entityConfigs;
        }

        public Task HandleEventAsync(DatabaseInitializedEventData eventData)
        {
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
            var entityTypes = SwaggerHelper.EntityTypesFunc();
            foreach (var entityType in entityTypes)
            {
                await _entityConfigs.GetCachedModelConfigurationOrNullAsync(entityType.Namespace.NotNull(), entityType.Name);
            }
        }
    }
}
