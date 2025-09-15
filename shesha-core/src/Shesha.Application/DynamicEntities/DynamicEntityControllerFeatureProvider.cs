using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Castle.Core.Logging;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Extensions;
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
            var entityConfigurationStore = _iocManager.Resolve<IEntityConfigurationStore>();

            var existingControllers = feature.Controllers.ToDictionary(MvcHelper.GetControllerName).OrderBy(x => x.Key).ToDictionary();

            // configured registrations
            var _unitOfWorkManager = _iocManager.Resolve<IUnitOfWorkManager>();
            using (var uow = _unitOfWorkManager.Begin())
            {
                var entityConfigRepo = _iocManager.Resolve<IRepository<EntityConfig, Guid>>();
                var entityToApp = entityConfigRepo.GetAll().ToList();

                _logger.Warn($"Create AppServices: {entityToApp.Count}");
                foreach (var entityConfig in entityToApp)
                {
                    try
                    {
                        var entityConfiguration = entityConfigurationStore.GetOrNull($"{entityConfig.FullClassName}");
                        var entityType = entityConfiguration?.EntityType;
                        if (entityType == null) 
                            continue;

                        var appServiceType = entityConfiguration?.ApplicationServiceType;

                        if (appServiceType == null)
                        {
                            appServiceType = DynamicAppServiceHelper.MakeApplicationServiceType(entityType);
                            if (appServiceType == null)
                                continue;
                            if (entityConfig.Source == Domain.Enums.MetadataSourceType.UserDefined)
                                _logger.Warn($"Create AppServices for dynamic entity: {entityConfig.FullClassName} - {appServiceType.Name}");
                        }
                        else
                            if (entityConfig.Source == Domain.Enums.MetadataSourceType.UserDefined)
                                _logger.Warn($"AppServices for dynamic entity: {entityConfig.FullClassName} is already exist {entityConfiguration?.ApplicationServiceType?.Name}");

                        var controllerName = MvcHelper.GetControllerName(appServiceType);
                        var controller = existingControllers.TryGetValue(controllerName, out TypeInfo? value) ? value : null;
                        if (controller != null)
                        {
                            feature.Controllers.Remove(controller);
                        }
                        controller = appServiceType.GetTypeInfo();
                        entityConfigurationStore.SetDefaultAppService(entityType, appServiceType);
                        feature.Controllers.Add(controller);

                        if (!_iocManager.IsRegistered(appServiceType))
                            _iocManager.Register(appServiceType, lifeStyle: DependencyLifeStyle.Transient);

                        // NOTE: temp fix to. Alex, please remove this line after proper fix 
                        existingControllers.Add(controllerName, controller);
                    }
                    catch { }
                }
                uow.Complete();

                _logger.Warn($"Create AppServices complete");

            }
        }
    }
}
