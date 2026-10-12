using Abp.Domain.Uow;
using Shesha.Application.Services;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Permissions;
using Shesha.Services;
using Shesha.Utilities;
using Swashbuckle.AspNetCore.SwaggerUI;
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
            var entityConfigManager = StaticContext.IocManager.Resolve<IModelConfigurationManager>();
            var pmo = StaticContext.IocManager.Resolve<IPermissionedObjectManager>();
            var _uowManager = StaticContext.IocManager.Resolve<IUnitOfWorkManager>();

            var types = SwaggerHelper.ServiceTypesFunc();

            var permissioned = new List<TypeInfo>();
            using (var uow = _uowManager.Begin())
            {
                foreach (var service in types)
                {
                    if (AppServiceHelper.IsDynamicAppService(service))
                    {
                        var entityType = AppServiceHelper.GetEntityTypeFromDynamicAppService(service);

                        // If CRUD can't be enabled by configuration - skip DB read
                        if (EntityCrudHelper.IsApisTotallyDisabledInCode(entityType))
                            continue;

                        var model = AsyncHelper.RunSync(() => entityConfigManager.GetModelConfigurationOrNullAsync(entityType.Namespace, entityType.Name));
                        if (model == null || model.AppServiceDisabled)
                            continue;
                    }
                    else
                    {
                        // api service
                        var obj = $"{service.FullName}";
                        var permission = pmo.Get(obj, ShaPermissionedObjectsTypes.WebApi);
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
