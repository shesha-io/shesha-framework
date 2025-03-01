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
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IModelConfigurationManager _modelConfigurationManager;
        private readonly ISwaggerProvider _swaggerProvider;
        private readonly IEntityConfigurationStore _entityConfigurationStore;


        public ModelConfigurationsAppService(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IModelConfigurationManager modelConfigurationProvider,
            ISwaggerProvider swaggerProvider,
            IEntityConfigurationStore entityConfigurationStore)
        {
            _entityConfigRepository = entityConfigRepository;
            _entityPropertyRepository = entityPropertyRepository;
            _modelConfigurationManager = modelConfigurationProvider;
            _swaggerProvider = swaggerProvider;
            _entityConfigurationStore = entityConfigurationStore;
        }

        [HttpGet, Route("")]
        public async Task<ModelConfigurationDto> GetByNameAsync(string name, string @namespace)
        {
            var dto = await _modelConfigurationManager.GetModelConfigurationOrNullAsync(@namespace, name);
            if (dto == null)
            {
                var exception = new EntityNotFoundException("Model configuration not found");
                exception.MarkExceptionAsLogged();
                throw exception;
            }

            return dto;
        }

        [HttpGet, Route("{id}")]
        public async Task<ModelConfigurationDto> GetByIdAsync(Guid id)
        {
            var modelConfig = await _entityConfigRepository.FirstOrDefaultAsync(m => m.Id == id);
            if (modelConfig == null)
            {
                var exception = new EntityNotFoundException("Model configuration not found");
                exception.MarkExceptionAsLogged();
                throw exception;
            }

            return await _modelConfigurationManager.GetModelConfigurationAsync(modelConfig);
        }

        [HttpPost, Route("")]
        public async Task<ModelConfigurationDto> CreateAsync(ModelConfigurationDto input)
        {
            return await _modelConfigurationManager.CreateAsync(input);
        }

        [HttpPut, Route("")]
        public async Task<ModelConfigurationDto> UpdateAsync(ModelConfigurationDto input)
        {
            return await _modelConfigurationManager.UpdateAsync(input);
        }

        [HttpPost, Route("merge")]
        public async Task<ModelConfigurationDto> MergeAsync(MergeConfigurationDto input)
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

            // Notify change
            // ASP.Net Core register Controller at runtime
            // https://stackoverflow.com/questions/46156649/asp-net-core-register-controller-at-runtime
            if (SheshaActionDescriptorChangeProvider.Instance != null)
            {
                SheshaActionDescriptorChangeProvider.Instance.HasChanged = true;
                var tokenSource = SheshaActionDescriptorChangeProvider.Instance.TokenSource;
                if (tokenSource != null)
                    await tokenSource.CancelAsync();

                if (_swaggerProvider is CachingSwaggerProvider cachedProvider)
                    await cachedProvider.ClearCacheAsync();
            }

            return await _modelConfigurationManager.GetModelConfigurationAsync(destination);
        }
    }
}
