using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Application.Services;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Controller provider that generates dynamic applicaiton services (controllers) for registered entities
    /// </summary>
    public class DynamicEntityControllerFeatureProvider : IApplicationFeatureProvider<ControllerFeature>
    {
        private readonly IIocManager _iocManager;
        private readonly ILogger _logger;

        public DynamicEntityControllerFeatureProvider(IIocManager iocManager)
        {
            _iocManager = iocManager;
            _logger = _iocManager.Resolve<ILogger>();
        }

        public void PopulateFeature(IEnumerable<ApplicationPart> parts, ControllerFeature feature)
        {
            var entityConfigurationStore = _iocManager.Resolve<IEntityTypeConfigurationStore>();

            // All existing controllers
            var existingControllers = feature.Controllers.ToDictionary(MvcHelper.GetControllerName).OrderBy(x => x.Key).ToDictionary();
            // Existing entity controllers
            var entityControllers = existingControllers.Where(c => c.Value.ImplementsGenericInterface(typeof(IEntityAppService<,>))).ToDictionary();

            // configured registrations
            var _unitOfWorkManager = _iocManager.Resolve<IUnitOfWorkManager>();
            using (var uow = _unitOfWorkManager.Begin())
            {
                var entityConfigRepo = _iocManager.Resolve<IRepository<EntityConfig, Guid>>();
                // Get ALL entity configs
                var entityToApp = entityConfigRepo.GetAll().Where(x => x.ExposedFrom == null).ToList();

                _logger.Warn($"Create AppServices: {entityToApp.Count}");
                foreach (var entityConfig in entityToApp)
                {
                    try
                    {
                        // Get EntityType and skip if not found
                        var entityConfiguration = entityConfigurationStore.GetOrNull($"{entityConfig.FullClassName}");
                        var entityType = entityConfiguration?.EntityType;
                        if (entityType == null)
                            continue;

                        // Get default AppServiceType
                        var defaultAppServiceType = entityConfiguration?.DefaultAppServiceType;
                        if (defaultAppServiceType == null)
                        {
                            // try to find hardcoded controller
                            defaultAppServiceType = entityControllers.FirstOrDefault(x =>
                                x.Value.GetGenericInterfaces(typeof(IEntityAppService<,>)).FirstOrDefault()?.GetGenericArguments().FirstOrDefault() == entityType
                            ).Value;
                        }

                        // get dynamic AppServiceType
                        var dynamicAppServiceType = entityConfiguration?.DynamicAppServiceType;
                        if (dynamicAppServiceType == null)
                        {
                            if (entityConfig.GenerateAppService)
                            {
                                // create dynamic AppService if not exist and needed
                                dynamicAppServiceType = DynamicAppServiceHelper.MakeApplicationServiceType(entityType);
                                if (dynamicAppServiceType != null)
                                    defaultAppServiceType = dynamicAppServiceType;
                                if (dynamicAppServiceType != null && entityConfig.Source == Domain.Enums.MetadataSourceType.UserDefined)
                                    _logger.Warn($"Create AppServices for dynamic entity: {entityConfig.FullClassName} - {dynamicAppServiceType.Name}");
                            }
                        }
                        else
                            if (entityConfig.Source == Domain.Enums.MetadataSourceType.UserDefined)
                                _logger.Warn($"AppServices for dynamic entity: {entityConfig.FullClassName} is already exist {dynamicAppServiceType.Name}");

                        // Set default AppService if exist
                        if (defaultAppServiceType != null)
                            entityConfigurationStore.SetDefaultAppService(entityType, defaultAppServiceType);

                        // register dynamic AppService if exist
                        if (dynamicAppServiceType != null)
                        {
                            var controller = dynamicAppServiceType.GetTypeInfo();
                            if (!feature.Controllers.Contains(controller))
                                feature.Controllers.Add(controller);
                            entityConfigurationStore.SetDynamicAppService(entityType, dynamicAppServiceType);

                            if (!_iocManager.IsRegistered(dynamicAppServiceType))
                                _iocManager.Register(dynamicAppServiceType, lifeStyle: DependencyLifeStyle.Transient);
                        }
                    }
                    catch { }
                }
                uow.Complete();

                _logger.Warn($"Create AppServices complete");

            }
        }
    }
}
