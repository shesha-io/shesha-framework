using Abp.Dependency;
using Abp.Domain.Uow;
using Microsoft.Extensions.DependencyInjection;
using Shesha.Application.Services;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Permissions;
using Shesha.Reflection;
using Shesha.Utilities;
using Swashbuckle.AspNetCore.SwaggerUI;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Shesha.Swagger
{
    public class SwaggerEndpointEnumerator : IEnumerable<UrlDescriptor>
    {
        public SwaggerEndpointEnumerator() 
        {
        }

        public IEnumerator<UrlDescriptor> GetEnumerator()
        {
            var entityConfigs = IocManager.Instance.Resolve<IModelConfigurationManager>();
            var pmo = IocManager.Instance.Resolve<IPermissionedObjectManager>()
            var _uowManager = IocManager.Instance.Resolve<IUnitOfWorkManager>();

            var types = SwaggerHelper.ServiceTypesFunc();

            var permissioned = new List<TypeInfo>();
            using (var uow = _uowManager.Begin())
            {
                foreach (var service in types)
                {
                    if (service.ImplementsGenericInterface(typeof(IEntityAppService<,>)))
                    {
                        // entity service
                        var genericInterface = service.GetGenericInterfaces(typeof(IEntityAppService<,>)).FirstOrDefault();
                        var entityType = genericInterface.GenericTypeArguments.FirstOrDefault();
                        var model = AsyncHelper.RunSync(() => entityConfigs.GetModelConfigurationOrNullAsync(entityType.Namespace, entityType.Name));
                        var entityAttribute = entityType.GetAttribute<EntityAttribute>();
                        if (entityAttribute?.GenerateApplicationService == GenerateApplicationServiceState.DisableGenerateApplicationService
                            || !model.GenerateAppService)
                            continue;
                    }
                    else
                    {
                        // api service
                        var obj = $"{service.FullName}";
                        var permission = pmo.Get(obj);
                        if (permission != null && permission.ActualAccess == RefListPermissionedAccess.Disable)
                            continue;
                    }
                    permissioned.Add(service);
                }
                uow.Complete();
            }
            
            var serviceNames = permissioned.Select(t => MvcHelper.GetControllerName(t)).OrderBy(s => s).ToList();
            foreach (var serviceName in serviceNames)
            {
                yield return new UrlDescriptor { Name = serviceName, Url = $"swagger/{SwaggerHelper.GetDocumentNameForService(serviceName)}/swagger.json" };
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => this.GetEnumerator();
    }
}
