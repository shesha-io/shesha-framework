using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Castle.Core.Internal;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Startup;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Module = Shesha.Domain.Module;

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

        private PermissionedObjectDto MakeDto(
            string objectName,
            string? parent,
            string name,
            string description,
            Module? module,
            RefListPermissionedAccess? access,
            List<string>? permissions,
            bool hardcoded,
            string type
            )
        {
            RefListPermissionedAccess? _access = access;
            var _permissions = new List<string>();
            if (_access == RefListPermissionedAccess.RequiresPermissions)
            {
                _access = permissions?.Any() ?? false
                    ? RefListPermissionedAccess.RequiresPermissions
                    : RefListPermissionedAccess.AnyAuthenticated;
                _permissions = permissions?.ToList();
            }

            var dto = new PermissionedObjectDto()
            {
                Object = objectName,
                Parent = parent ?? string.Empty,
                ModuleId = module?.Id,
                Module = module?.Name,
                Name = name,
                Type = type,
                Description = description,
                Access = _access,
                Permissions = _permissions,
                Hardcoded = hardcoded,
            };
            dto.Md5 = GetMd5(dto);
            return dto;
        }

        private async Task<List<PermissionedObjectDto>> ProcessAssemblyAsync(Assembly assembly, List<string> hardcoded)
        {
            var m = await _moduleManager.GetOrCreateModuleAsync(assembly);

            var entityTypes = assembly.GetTypes().Where(MappingHelper.IsEntity).ToList();

            var list = new List<PermissionedObjectDto>();

            foreach (var et in entityTypes)
            {
                // Get all CrudAccessAttribute
                var accessAttributes = et.GetAttributes<CrudAccessAttribute>();
                var disableAttribute = et.GetAttribute<CrudDisableActionsAttribute>();
                if (disableAttribute == null && !accessAttributes.Any() && !hardcoded.Contains(et.GetRequiredFullName()))
                    continue;

                // But use only one for each type of action
                var all = accessAttributes.FirstOrDefault(x => x.All != null);
                var c = accessAttributes.FirstOrDefault(x => x.Create != null);
                var r = accessAttributes.FirstOrDefault(x => x.Read != null);
                var u = accessAttributes.FirstOrDefault(x => x.Update != null);
                var d = accessAttributes.FirstOrDefault(x => x.Delete != null);
                var fn = et.GetRequiredFullName();
                var e = ShaPermissionedObjectsTypes.Entity;
                var ea = ShaPermissionedObjectsTypes.EntityAction;

                if (disableAttribute != null)
                {
                    if (disableAttribute.Disable.HasFlag(CrudActions.All))
                        all = new CrudAccessAttribute(CrudActions.All, false);
                    if (disableAttribute.Disable.HasFlag(CrudActions.Create))
                        c = new CrudAccessAttribute(CrudActions.Create, false);
                    if (disableAttribute.Disable.HasFlag(CrudActions.Read))
                        r = new CrudAccessAttribute(CrudActions.Read, false);
                    if (disableAttribute.Disable.HasFlag(CrudActions.Update))
                        u = new CrudAccessAttribute(CrudActions.Update, false);
                    if (disableAttribute.Disable.HasFlag(CrudActions.Delete))
                        d = new CrudAccessAttribute(CrudActions.Delete, false);
                }

                list.Add(MakeDto(fn, null, et.Name, GetDescription(et), m, all?.All ?? RefListPermissionedAccess.Inherited, all?.AllPermissions, all != null, e));
                list.Add(MakeDto($"{fn}@Create", fn, "Create", "Create CRUD operation", m, c?.Create, c?.CreatePermissions, c != null, ea));
                list.Add(MakeDto($"{fn}@Get", fn, "Get", "Read CRUD operation", m, r?.Read, r?.ReadPermissions, r != null, ea));
                list.Add(MakeDto($"{fn}@Update", fn, "Update", "Update CRUD operation", m, u?.Update, u?.UpdatePermissions, u != null, ea));
                list.Add(MakeDto($"{fn}@Delete", fn, "Delete", "Delete CRUD operation", m, d?.Delete, d?.DeletePermissions, d != null, ea));
            }
            return list;
        }
    }
}