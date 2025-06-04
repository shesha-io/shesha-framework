using Abp.Application.Services;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.Elmah;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Swagger;
using Shesha.Utilities;
using Swashbuckle.AspNetCore.Swagger;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Model Configurations application service
    /// </summary>
    [Route("api/ModelConfigurations")]
    public class ModelConfigurationsAppService : SheshaAppServiceBase, IApplicationService
    {
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IModelConfigurationManager _modelConfigurationManager;
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly ISwaggerProvider _swaggerProvider;

        public ModelConfigurationsAppService(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IModelConfigurationManager modelConfigurationProvider,
            ISwaggerProvider swaggerProvider,
            IEntityConfigurationStore entityConfigurationStore)
        {
            _entityConfigRepository = entityConfigRepository;
            _modelConfigurationManager = modelConfigurationProvider;
            _entityConfigurationStore = entityConfigurationStore;
            _swaggerProvider = swaggerProvider;
        }

        [HttpGet, Route("")]
        public async Task<ModelConfigurationDto> GetByNameAsync(string className, string @namespace)
        {
            var dto = await _modelConfigurationManager.GetCachedModelConfigurationOrNullAsync(@namespace, className);
            if (dto == null)
            {
                var exception = new EntityNotFoundException("Model configuration not found");
                exception.MarkExceptionAsLogged();
                throw exception;
            }

            return dto;
        }

        [HttpGet, Route("{id}")]
        public async Task<ModelConfigurationDto?> GetByIdAsync(Guid id)
        {
            var modelConfig = await _entityConfigRepository.FirstOrDefaultAsync(m => m.Id == id);
            if (modelConfig == null)
            {
                var exception = new EntityNotFoundException("Model configuration not found");
                exception.MarkExceptionAsLogged();
                throw exception;
            }

            return await _modelConfigurationManager.GetCachedModelConfigurationOrNullAsync(modelConfig.Namespace.NotNull(), modelConfig.ClassName);
        }

        [HttpPost, Route("")]
        public async Task<ModelConfigurationDto> CreateAsync(ModelConfigurationCreateDto input)
        {
            var res = await _modelConfigurationManager.CreateAsync(input);
            await RefreshControllersAsync();
            return res;
        }

        [HttpPut, Route("")]
        public async Task<ModelConfigurationDto> UpdateAsync(ModelConfigurationDto input)
        {
            var res = await _modelConfigurationManager.UpdateAsync(input);
            await RefreshControllersAsync();
            return res;
        }

        [HttpPost, Route("merge")]
        public async Task<ModelConfigurationDto?> MergeAsync(MergeConfigurationDto input)
        {
            var source = await AsyncQueryableExecuter.FirstOrDefaultAsync(_entityConfigRepository.GetAll().Where(x => x.Id == input.SourceId.ToGuid()));
            if (source == null)
                throw new EntityNotFoundException("Source configuration not found");
            var destination = await AsyncQueryableExecuter.FirstOrDefaultAsync(_entityConfigRepository.GetAll().Where(x => x.Id == input.DestinationId.ToGuid()));
            if (destination == null)
                throw new EntityNotFoundException("Destination configuration not found");

            using (var uow = UnitOfWorkManager.Begin())
            {
                await _modelConfigurationManager.MergeConfigurationsAsync(source, destination, input.DeleteAfterMerge,
                    // use deep update if merge from not implemented to implemented application entity
                    source.Source == MetadataSourceType.ApplicationCode
                    && destination.Source == MetadataSourceType.ApplicationCode
                    && _entityConfigurationStore.GetOrNull(source.FullClassName) == null
                    && _entityConfigurationStore.GetOrNull(destination.FullClassName) != null);

                await uow.CompleteAsync();
            }

            await RefreshControllersAsync();

            return await _modelConfigurationManager.GetCachedModelConfigurationOrNullAsync(destination.Namespace.NotNull(), destination.ClassName);
        }

        private async Task RefreshControllersAsync()
        {
            // ToDo: AS - decide if we will generate entities on fly
            //_entityConfigurationStore.ReInitialize();

            // Notify change
            // ASP.Net Core register Controller at runtime
            // https://stackoverflow.com/questions/46156649/asp-net-core-register-controller-at-runtime
            if (SheshaActionDescriptorChangeProvider.Instance != null)
            {
                SheshaActionDescriptorChangeProvider.Instance.HasChanged = true;
                var tokenSource = SheshaActionDescriptorChangeProvider.Instance.TokenSource;
                if (tokenSource != null)
                    await tokenSource.CancelAsync();

                if (_swaggerProvider != null && _swaggerProvider is CachingSwaggerProvider cachedProvider)
                    await cachedProvider.ClearCacheAsync();
            }
        }
    }
}
