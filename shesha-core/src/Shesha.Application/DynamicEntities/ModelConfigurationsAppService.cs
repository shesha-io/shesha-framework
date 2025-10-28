using Abp.Application.Services;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Elmah;
using Shesha.Reflection;
using Swashbuckle.AspNetCore.Swagger;
using System;
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
        private readonly IEntityTypeConfigurationStore _entityConfigurationStore;
        private readonly ISwaggerProvider _swaggerProvider;
        //private readonly SwaggerDocumentDictionary? _swaggerDocs;

        public ModelConfigurationsAppService(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IModelConfigurationManager modelConfigurationProvider,
            ISwaggerProvider swaggerProvider,
            IEntityTypeConfigurationStore entityConfigurationStore)
        {
            _entityConfigRepository = entityConfigRepository;
            _modelConfigurationManager = modelConfigurationProvider;
            _entityConfigurationStore = entityConfigurationStore;
            _swaggerProvider = swaggerProvider;
            //_swaggerDocs = swaggerDocs;
        }

        [HttpGet, Route("")]
        public async Task<ModelConfigurationDto> GetByNameAsync(string className, string? @namespace, string? module = null, bool useExposed = true)
        {
            var dto = await _modelConfigurationManager.GetCachedModelConfigurationOrNullAsync(module, @namespace, className, useExposed);
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

            return await _modelConfigurationManager.GetModelConfigurationOrNullAsync(modelConfig);
            //return await _modelConfigurationManager.GetCachedModelConfigurationOrNullAsync(modelConfig.Namespace.NotNull(), modelConfig.ClassName);
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

        //[HttpGet, Route("RefreshControllers")]
        private async Task RefreshControllersAsync()
        {
            await Task.CompletedTask;

            // ToDo: AS - decide if we will generate entities on fly
            //await _entityConfigurationStore.ReInitializeAsync();
            /*
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

                _swaggerDocs?.Clear();
            }
            */
        }
    }
}
