using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Startup;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Permissions
{
    public class EntityPermissionedObjectProvider : PermissionedObjectProviderBase, IPermissionedObjectProvider
    {

        private readonly IApplicationStartupSession _startupSession;
        private readonly IRepository<PermissionedObject, Guid> _permissionedObjectRepository;

        public EntityPermissionedObjectProvider(
            IAssemblyFinder assembleFinder,
            IModuleManager moduleManager,
            IUnitOfWorkManager unitOfWorkManager,
            IApplicationStartupSession startupSession,
            IRepository<PermissionedObject, Guid> permissionedObjectRepository
            ) : base(assembleFinder, moduleManager, unitOfWorkManager)
        {
            _startupSession = startupSession;
            _permissionedObjectRepository = permissionedObjectRepository;
        }

        public List<string> GetObjectTypes()
        {
            return new List<string>() { ShaPermissionedObjectsTypes.Entity };
        }

        public string? GetObjectType(Type type)
        {
            return type.IsPublic && !type.IsAbstract && type.IsEntityType()
                   ? ShaPermissionedObjectsTypes.Entity
                   : null;
        }

        public async Task<List<PermissionedObjectDto>> GetAllAsync(string? objectType = null, bool skipUnchangedAssembly = false)
        {
            var list = new List<PermissionedObjectDto>();

            var hardcoded = (await _permissionedObjectRepository.GetAll()
                .Where(x =>
                    (x.Type == ShaPermissionedObjectsTypes.Entity || x.Type == ShaPermissionedObjectsTypes.EntityAction)
                    &&
                    x.Hardcoded == true
                ).ToListAsync()).Select(x => { return x.Object.Split("@")[0]; }).Distinct().ToList();

            if (objectType != null && !GetObjectTypes().Contains(objectType))
                return list;

            var assemblies = _assembleFinder.GetAllAssemblies()
                .Distinct(new AssemblyFullNameComparer())
                .Where(a => !a.IsDynamic && a.GetTypes().Any(MappingHelper.IsEntity))
                .ToList();
            assemblies = assemblies.Where(x => !_startupSession.AssemblyStaysUnchanged(x)).ToList();

            foreach (var assembly in assemblies)
            {
                using (var unitOfWork = _unitOfWorkManager.Begin())
                {
                    using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        list.AddRange(await ProcessAssemblyAsync(assembly, hardcoded));
                    }
                    await unitOfWork.CompleteAsync();
                }
            }

            return list;
        }

        private async Task<List<PermissionedObjectDto>> ProcessAssemblyAsync(Assembly assembly, List<string> hardcoded)
        {
            var module = await _moduleManager.GetOrCreateModuleAsync(assembly);
            var crudActions = new List<CrudAction> { CrudAction.Create, CrudAction.Read, CrudAction.Update, CrudAction.Delete };

            var entityTypes = assembly.GetTypes().Where(MappingHelper.IsEntity).ToList();

            var list = new List<PermissionedObjectDto>();

            foreach (var entityType in entityTypes)
            {
                var config = EntityCrudHelper.GetHardcodedEntityCrudConfig(entityType);

                var parent = new PermissionedObjectDto(module)
                {
                    Name = entityType.Name,
                    Object = entityType.GetRequiredFullName(),
                    Type = ShaPermissionedObjectsTypes.Entity,
                    Description = GetDescription(entityType),
                    Hardcoded = !config.IsConfigurable,
                };
                parent.Md5 = GetMd5(parent);
                list.Add(parent);

                foreach (var crudAction in crudActions)
                {
                    var name = CrudAction2Name(crudAction);
                    var objectName = GetObjectName(entityType, crudAction);

                    var child = new PermissionedObjectDto(module)
                    {
                        Name = name,
                        Object = objectName,
                        Type = ShaPermissionedObjectsTypes.EntityAction,
                        Parent = parent.Object,
                        Description = name,

                        Hardcoded = !config.IsConfigurable || config.IsImmutable && crudAction != CrudAction.Read,
                    };

                    // fill access
                    if (EntityCrudHelper.IsActionDisabled(config, crudAction))
                    {
                        child.Access = RefListPermissionedAccess.Disable;
                    }
                    else
                    {
                        var actionConfig = EntityCrudHelper.GetCodebasedCrudActionConfig(entityType, crudAction);
                        switch (actionConfig.CrudActionsAccess)
                        {
                            case CrudActionsAccess.Inherited:
                                child.Access = RefListPermissionedAccess.Inherited;
                                break;
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
                    list.Add(child);
                }
            }
            return list;
        }

        private static string CrudAction2Name(CrudAction action)
        {
            switch (action)
            {
                case CrudAction.Create: return "Create";
                case CrudAction.Update: return "Update";
                case CrudAction.Delete: return "Delete";
                case CrudAction.Read: return "Get";
                default: throw new ArgumentException($"Unknown action: ${action}");
            }
        }

        private static string GetObjectName(Type entityType, CrudAction action)
        {
            return $"{entityType.FullName}@{CrudAction2Name(action)}";
        }
    }
}