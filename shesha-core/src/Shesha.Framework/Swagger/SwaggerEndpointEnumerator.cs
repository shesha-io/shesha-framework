using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Application.Services;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.Permissions;
using Shesha.Reflection;
using Shesha.Services;
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
            var pmo = StaticContext.IocManager.Resolve<IPermissionedObjectManager>();
            var _uowManager = StaticContext.IocManager.Resolve<IUnitOfWorkManager>();
            var types = SwaggerHelper.ServiceTypesFunc();

            var permissioned = new List<TypeInfo>();
            using (var uow = _uowManager.Begin())
            {
                var entityConfigs = StaticContext.IocManager.Resolve<IRepository<EntityConfig, Guid>>();
                var configs = entityConfigs.GetAllList();

                foreach (var service in types)
                {
                    if (service.ImplementsGenericInterface(typeof(IEntityAppService<,>)))
                    {
                        // entity service
                        var genericInterface = service.GetGenericInterfaces(typeof(IEntityAppService<,>)).First();
                        var entityType = genericInterface.GenericTypeArguments.First();
                        var model = configs.FirstOrDefault(x => x.Namespace == entityType.Namespace.NotNull() && x.ClassName == entityType.Name);
                        model.NotNull();
                        var entityAttribute = entityType.GetAttributeOrNull<EntityAttribute>();
                        var crudAttribute = entityType.GetAttributeOrNull<CrudAccessAttribute>();
                        var permission = pmo.Get($"{entityType.FullName}", ShaPermissionedObjectsTypes.Entity);
                        if (entityAttribute?.GenerateApplicationService == GenerateApplicationServiceState.DisableGenerateApplicationService
                            || (permission != null && permission.ActualAccess == RefListPermissionedAccess.Disable)
                            || crudAttribute?.All == RefListPermissionedAccess.Disable
                            || !model.GenerateAppService)
                            continue;
                    }
                    else
                    {
                        // api service
                        var permission = pmo.Get($"{service.FullName}", ShaPermissionedObjectsTypes.WebApi);
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