using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Threading;
using Shesha.Application.Services;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Extensions;
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
            var entityConfigManager = StaticContext.IocManager.Resolve<IModelConfigurationManager>();
            var pmo = StaticContext.IocManager.Resolve<IPermissionedObjectManager>();
            var uowManager = StaticContext.IocManager.Resolve<IUnitOfWorkManager>();
            var types = SwaggerHelper.ServiceTypesFunc();

            var permissioned = new List<TypeInfo>();
            using (var uow = uowManager.Begin())
            {
                var disabledEntities = GetEntityWithDisabledAppServices();

                foreach (var service in types)
                {
                    if (AppServiceHelper.IsDynamicAppService(service))
                    {
                        var entityType = AppServiceHelper.GetEntityTypeFromDynamicAppService(service);

                        // If CRUD can't be enabled by configuration - skip DB read
                        if (EntityCrudHelper.IsApisTotallyDisabledInCode(entityType))
                            continue;

                        var fullName = GetFullName(entityType.Namespace, entityType.Name);
                        if (disabledEntities.Contains(fullName))
                            continue;

                        var model = AsyncHelper.RunSync(() => entityConfigManager.GetCachedModelConfigurationOrNullAsync(null, entityType.Namespace, entityType.Name, true));
                        if (model == null || model.AppServiceDisabled)
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

            var services = permissioned.Select(x => new { Key = MvcHelper.GetControllerName(x), Value = x }).ToList();
            // found duplicates of services by name
            var duplicates = services.GroupBy(x => x.Key).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
            var sorted = services.OrderBy(x => MvcHelper.GetControllerName(x.Value)).ToList();
            foreach (var service in sorted)
            {
                var postfix = string.Empty;
                if (duplicates.Contains(service.Key))
                {
                    if (service.Value.ImplementsGenericInterface(typeof(IEntityAppService<,>)))
                    {
                        // if service has duplicate name and it is EntityAppService then
                        var entityType = service.Value.GetGenericInterfaces(typeof(IEntityAppService<,>)).FirstOrDefault()?.GetGenericArguments()[0];
                        // add postfix with Entity.Assembly
                        // This is necessary to separate definitions for Entities with the same names (but different Assemblies)
                        postfix = entityType != null ? $" ({entityType.Assembly.GetName().Name})" : string.Empty;
                    }
                }
                yield return new UrlDescriptor { Name = MvcHelper.GetControllerName(service.Value) + postfix, Url = $"swagger/{SwaggerHelper.GetDocumentNameForService(service.Value)}/swagger.json" };
            }
        }

        private string GetFullName(string? @namespace, string name)
        {
            return !string.IsNullOrWhiteSpace(@namespace)
                ? @namespace + "." + name
                : name;
        }

        private List<string> GetEntityWithDisabledAppServices()
        {
            var entityConfigRepo = StaticContext.IocManager.Resolve<IRepository<EntityConfig, Guid>>();
            var entities = entityConfigRepo.GetAll()
                .Where(e => !e.IsDeleted && !e.GenerateAppService)
                .Select(e => new { e.ClassName, e.Namespace })
                .ToList();
            return entities.Select(e => GetFullName(e.Namespace, e.ClassName)).ToList();
        }


        IEnumerator IEnumerable.GetEnumerator() => this.GetEnumerator();
    }
}