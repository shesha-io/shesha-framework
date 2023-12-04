using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Application.Services;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Attributes;
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

        public DynamicEntityControllerFeatureProvider(IIocManager iocManager)
        {
            _iocManager = iocManager;
        }

        public void PopulateFeature(IEnumerable<ApplicationPart> parts, ControllerFeature feature)
        {
            var entityConfigurationStore = _iocManager.Resolve<IEntityConfigurationStore>();

            var entityControllers = feature.Controllers.Where(c => c.AsType().ImplementsGenericInterface(typeof(IEntityAppService<,>))).ToList();
            foreach (var controller in entityControllers)
            {
                var genericInterface = controller.AsType().GetGenericInterfaces(typeof(IEntityAppService<,>)).FirstOrDefault();

                var entityType = genericInterface.GenericTypeArguments.FirstOrDefault();

                entityConfigurationStore.SetDefaultAppService(entityType, controller);
            }

            var existingControllerNames = feature.Controllers.Select(c => MvcHelper.GetControllerName(c)).OrderBy(i => i).ToList();

            // configured registrations
            var _unitOfWorkManager = _iocManager.Resolve<IUnitOfWorkManager>();
            using (var uow = _unitOfWorkManager.Begin())
            {
                var entityConfigRepo = _iocManager.Resolve<IRepository<EntityConfig, Guid>>();
                var entityToApp = entityConfigRepo.GetAll().ToList();
                foreach (var entityConfig in entityToApp)
                {
                    try
                    {
                        var entityType = entityConfigurationStore.Get($"{entityConfig.FullClassName}")?.EntityType;
                        if (entityType == null) 
                            continue;

                        var entityAttribute = entityType.GetAttribute<EntityAttribute>();
                        if (entityAttribute != null 
                            && entityAttribute.GenerateApplicationService != GenerateApplicationServiceState.UseConfiguration
                            && entityConfig.GenerateAppService ^ entityAttribute.GenerateApplicationService == GenerateApplicationServiceState.AlwaysGenerateApplicationService)
                        {
                            entityConfig.GenerateAppService = entityAttribute.GenerateApplicationService == GenerateApplicationServiceState.AlwaysGenerateApplicationService;
                            entityConfigRepo.Update(entityConfig);
                        }

                        if (!entityConfig.GenerateAppService) 
                            continue;

                        var appServiceType = DynamicAppServiceHelper.MakeApplicationServiceType(entityType);
                        if (appServiceType == null) 
                            continue;

                        var controllerName = MvcHelper.GetControllerName(appServiceType);
                        if (!existingControllerNames.Contains(controllerName))
                        {
                            entityConfigurationStore.SetDefaultAppService(entityType, appServiceType);
                            feature.Controllers.Add(appServiceType.GetTypeInfo());

                            if (!_iocManager.IsRegistered(appServiceType))
                                _iocManager.Register(appServiceType, lifeStyle: DependencyLifeStyle.Transient);

                            // NOTE: temp fix to. Alex, please remove this line after proper fix 
                            existingControllerNames.Add(controllerName);
                        }
                    }
                    catch { }
                }
                uow.Complete();
            }
        }
    }
}
