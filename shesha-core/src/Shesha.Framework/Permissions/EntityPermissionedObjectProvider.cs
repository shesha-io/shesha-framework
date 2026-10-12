using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Reflection;
using Shesha.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Permission
{
    public class EntityPermissionedObjectProvider : PermissionedObjectProviderBase, IPermissionedObjectProvider, ITransientDependency
    {
        public EntityPermissionedObjectProvider(IAssemblyFinder assembleFinder, IModuleManager moduleManager) : base(assembleFinder, moduleManager)
        {
        }

        public List<string> GetObjectTypes()
        {
            return new List<string> { ShaPermissionedObjectsTypes.Entity };
        }

        public string GetObjectType(Type type)
        {
            var entityType = typeof(IEntity<>);

            return type.IsPublic && !type.IsAbstract
                   && type.GetInterfaces().Any(x =>
                       x.IsGenericType &&
                       x.GetGenericTypeDefinition() == entityType)
                ? ShaPermissionedObjectsTypes.Entity
                : null;
        }

        public async Task<List<PermissionedObjectDto>> GetAllAsync(string objectType = null, bool skipUnchangedAssembly = false)
        {
            if (!GetObjectTypes().Contains(objectType)) return new List<PermissionedObjectDto>();

            var assemblies = _assembleFinder.GetAllAssemblies().Distinct(new AssemblyFullNameComparer()).Where(a => !a.IsDynamic).ToList();
            var allPermissions = new List<PermissionedObjectDto>();
            var crudActions = new List<CrudAction> { CrudAction.Create, CrudAction.Read, CrudAction.Update, CrudAction.Delete };

            foreach (var assembly in assemblies)
            {
                var module = await GetModuleOfAssemblyAsync(assembly);

                var entityTypes = assembly.GetTypes()
                    .Where(t => t.IsEntityType())
                    .ToList();
                foreach (var entityType in entityTypes)
                {
                    var config = EntityCrudHelper.GetHardcodedEntityCrudConfig(entityType);
                    
                    var parent = new PermissionedObjectDto(module)
                    {
                        Name = entityType.Name,
                        Object = entityType.FullName,
                        Type = ShaPermissionedObjectsTypes.Entity,
                        Description = GetDescription(entityType),
                        Hardcoded = !config.IsConfigurable,
                    };
                    parent.Md5 = GetMd5(parent);
                    allPermissions.Add(parent);

                    foreach (var crudAction in crudActions) 
                    {
                        var name = CrudAction2Name(crudAction);
                        var objectName = GetObjectName(entityType, crudAction);

                        var child = new PermissionedObjectDto(module)
                        {
                            Name = name,
                            Object = objectName,
                            Type = ShaPermissionedObjectsTypes.EntityAction,
                            Parent = entityType.FullName,
                            Description = name,
                            
                            Hardcoded = !config.IsConfigurable || config.IsImmutable && crudAction != CrudAction.Read,
                        };

                        // fill access
                        if (EntityCrudHelper.IsActionDisabled(config, crudAction))
                        {
                            child.Access = RefListPermissionedAccess.Disable;
                        }
                        else {
                            var actionConfig = EntityCrudHelper.GetCodebasedCrudActionConfig(entityType, crudAction);
                            switch (actionConfig.CrudActionsAccess)
                            {
                                case CrudActionsAccess.AllowAnonymous:
                                    child.Access = RefListPermissionedAccess.AllowAnonymous;
                                    break;
                                case CrudActionsAccess.AnyAuthenticated:
                                    child.Access = RefListPermissionedAccess.AnyAuthenticated;
                                    break;
                                case CrudActionsAccess.RequiresPermissions:
                                    child.Access = RefListPermissionedAccess.RequiresPermissions;
                                    child.Permissions = actionConfig.CrudActionsPermissions?.ToList() ?? new List<string>();
                                    break;
                            }
                        }
                        child.Md5 = GetMd5(child);
                        allPermissions.Add(child);
                    }
                }
            }

            return allPermissions;
        }        

        public static string CrudAction2Name(CrudAction action) 
        { 
            switch (action) { 
                case CrudAction.Create: return "Create"; 
                case CrudAction.Update: return "Update"; 
                case CrudAction.Delete: return "Delete"; 
                case CrudAction.Read: return "Get"; 
                default: throw new ArgumentException($"Unknown action: ${action}");
            };
        }

        public static string GetObjectName(Type entityType, CrudAction action) 
        { 
            return $"{entityType.FullName}@{CrudAction2Name(action)}";
        }
    }
}