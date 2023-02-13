using System;
using System.Collections.Generic;
using System.Linq;
using Abp.Domain.Entities;
using Abp.Modules;
using Abp.Reflection;
using Shesha.Permissions;
using Shesha.Reflection;

namespace Shesha.Permission
{
    public class EntityPermissionedObjectProvider : PermissionedObjectProviderBase, IPermissionedObjectProvider
    {

        public EntityPermissionedObjectProvider(IAssemblyFinder assembleFinder) : base(assembleFinder)
        {
        }

        public List<string> GetObjectTypes()
        {
            return new List<string> {PermissionedObjectsSheshaTypes.Entity} ;
        }

        public string GetObjectType(Type type)
        {
            var entityType = typeof(IEntity<>);

            return type.IsPublic && !type.IsAbstract 
                   && type.GetInterfaces().Any(x =>
                       x.IsGenericType &&
                       x.GetGenericTypeDefinition() == entityType)
                ? PermissionedObjectsSheshaTypes.Entity
                : null;
        }

        public List<PermissionedObjectDto> GetAll(string objectType = null)
        {
            if (!GetObjectTypes().Contains(objectType)) return new List<PermissionedObjectDto>();

            var assemblies = _assembleFinder.GetAllAssemblies().Distinct(new AssemblyFullNameComparer()).Where(a => !a.IsDynamic).ToList();
            var allPermissions = new List<PermissionedObjectDto>();

            var entityType = typeof(IEntity<>);

            foreach (var assembly in assemblies)
            {

                var module = assembly.GetTypes().FirstOrDefault(t =>
                    t.IsPublic && !t.IsAbstract && typeof(AbpModule).IsAssignableFrom(t));

                var services = assembly.GetTypes()
                    .Where(t => t.IsPublic && !t.IsAbstract && t.GetInterfaces().Any(x =>
                                    x.IsGenericType &&
                                    x.GetGenericTypeDefinition() == entityType))
                    .Where(t => !t.Name.EndsWith("Base") && !t.Name.Contains("`"))
                    .ToList();
                foreach (var service in services)
                {
                    var parent = new PermissionedObjectDto()
                    {
                        Name = service.Name,
                        Module = module?.FullName ?? "",
                        Object = service.FullName, 
                        Type = PermissionedObjectsSheshaTypes.Entity, 
                        Description = GetDescription(service)
                    };
                    allPermissions.Add(parent);


                    var child = new PermissionedObjectDto()
                    {
                        Name = "Create",
                        Module = module?.FullName ?? "",
                        Object = service.FullName + "@Create",
                        Type = PermissionedObjectsSheshaTypes.EntityAction, 
                        Parent = service.FullName, 
                        Description = "Create"
                    };
                    allPermissions.Add(child);

                    child = new PermissionedObjectDto()
                    {
                        Name = "Update",
                        Module = module?.FullName ?? "",
                        Object = service.FullName + "@Update",
                        Type = PermissionedObjectsSheshaTypes.EntityAction,
                        Parent = service.FullName,
                        Description = "Update"
                    };
                    allPermissions.Add(child);

                    child = new PermissionedObjectDto()
                    {
                        Name = "Delete",
                        Module = module?.FullName ?? "",
                        Object = service.FullName + "@Delete",
                        Type = PermissionedObjectsSheshaTypes.EntityAction,
                        Parent = service.FullName,
                        Description = "Delete"
                    };
                    allPermissions.Add(child);

                    child = new PermissionedObjectDto()
                    {
                        Name = "Get",
                        Module = module?.FullName ?? "",
                        Object = service.FullName + "@Get",
                        Type = PermissionedObjectsSheshaTypes.EntityAction,
                        Parent = service.FullName,
                        Description = "Get"
                    };
                    allPermissions.Add(child);
                }
            }

            return allPermissions;
            
        }
    }
}