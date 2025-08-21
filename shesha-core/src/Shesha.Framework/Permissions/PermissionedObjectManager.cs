using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Linq.Extensions;
using Abp.ObjectMapping;
using Abp.Runtime.Caching;
using Abp.Threading;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Application.Services;
using Shesha.Cache;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Permissions.Cache;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Permissions
{
    public class PermissionedObjectManager : IPermissionedObjectManager, ITransientDependency,
        IEventHandler<EntityChangedEventData<PermissionedObject>>
    {
        public static readonly Dictionary<string, string> CrudMethods =
            new Dictionary<string, string>()
            {
                { "GetAll", "Get" },
                { "QueryAll", "Get" },
                { "Get", "Get" },
                { "Query", "Get" },
                { "Create", "Create" },
                { "CreateGql", "Create" },
                { "Update", "Update" },
                { "UpdateGql", "Update" },
                { "Delete", "Delete" },
            };
        public static string? GetCrudMethod(string method, string? defaultValue = null) =>
            CrudMethods.ContainsKey(method.RemovePostfix("Async")) ? CrudMethods[method.RemovePostfix("Async")] : defaultValue;

        private readonly IRepository<PermissionedObject, Guid> _permissionedObjectRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IObjectMapper _objectMapper;
        private readonly IRepository<Module, Guid> _moduleReporsitory;
        private readonly IIocResolver _iocResolver;

        private readonly ITypedCache<string, PermissionedObjectRelations> _relationsCache;
        private readonly ITypedCache<string, CacheItemWrapper<PermissionedObjectDto>> _permissionedObjectsCache;

        public PermissionedObjectManager(
            IRepository<PermissionedObject, Guid> permissionedObjectRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IObjectMapper objectMapper,
            IRepository<Module, Guid> moduleReporsitory,
            IIocResolver iocResolver,
            IRelationsCacheHolder relationsCacheHolder,
            IPermissionedObjectsCacheHolder permissionedObjectsCacheHolder
        )
        {
            _permissionedObjectRepository = permissionedObjectRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _objectMapper = objectMapper;
            _moduleReporsitory = moduleReporsitory;
            _iocResolver = iocResolver;

            _relationsCache = relationsCacheHolder.Cache;
            _permissionedObjectsCache = permissionedObjectsCacheHolder.Cache;
        }

        private string GetCacheKey(string? objectName, string? objectType)
        {
            return $"{objectName}"; // TODO: AS review using Permissioned objects types _{objectType}";
        }

        public virtual string? GetObjectType(Type type)
        {
            var providers = _iocResolver.ResolveAll<IPermissionedObjectProvider>();
            foreach (var permissionedObjectProvider in providers)
            {
                var objType = permissionedObjectProvider.GetObjectType(type);
                if (!string.IsNullOrEmpty(objType))
                    return objType;
            }

            return null;
        }

        private async Task SetCacheAsync(PermissionedObjectDto dto, CacheItemWrapper<PermissionedObjectDto>? item = null)
        {
            var parentKey = GetCacheKey(dto.Parent, dto.Type);
            var childKey = GetCacheKey(dto.Object, dto.Type);
            await _permissionedObjectsCache.SetAsync(childKey, item ?? new CacheItemWrapper<PermissionedObjectDto>(dto, dto));
            var cache = await _relationsCache.TryGetValueAsync(parentKey);
            var relation = cache.HasValue ? cache.Value : new PermissionedObjectRelations();
            relation.AddChildren(childKey);
            await _relationsCache.SetAsync(parentKey, relation);
        }

        [UnitOfWork]
        public virtual async Task<List<PermissionedObjectDto>> GetAllFlatAsync(string? type = null, bool withNested = true, bool withHidden = false)
        {
            var rootItems = await _permissionedObjectRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(type?.Trim()), x => x.Type == type)
                .WhereIf(!withHidden, x => !x.Hidden)
                .ToListAsync();

            var root = (await rootItems.SelectAsync(async x => await GetCacheOrDtoAsync(x)))
                .OrderBy(x => x.Name)
                .ToList();

            if (withNested && !string.IsNullOrEmpty(type?.Trim()))
            {
                var nestedItems = await _permissionedObjectRepository.GetAll()
                    .Where(x => x.Type != null && x.Type.StartsWith($"{type}."))
                    .WhereIf(!withHidden, x => !x.Hidden)
                    .ToListAsync();
                var nested = (await nestedItems.SelectAsync(async x => await GetCacheOrDtoAsync(x)))
                    .OrderBy(x => x.Name)
                    .ToList();
                root.AddRange(nested);
            }

            return root;
        }

        [UnitOfWork]
        public virtual async Task<List<PermissionedObjectDto>> GetAllTreeAsync(string? type = null, bool withHidden = false)
        {
            var allTyped = await GetAllFlatAsync(type, true);

            var allRoots = allTyped.Where(x => x.Parent == null || x.Parent == "");
            return allRoots
                .OrderBy(x => x.Name)
                .Select(x => GetObjectWithChild(x, allTyped, withHidden))
                .ToList();
        }

        public virtual async Task<PermissionedObjectDto?> GetObjectWithChildOrNullAsync(string objectName, string? type = null, bool withHidden = false)
        {
            var pObject = (await _permissionedObjectRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(type?.Trim()), x => x.Type == type)
                .WhereIf(!withHidden, x => !x.Hidden)
                .FirstOrDefaultAsync());
            if (pObject == null)
                return null;

            var obj = await GetDtoOrNullAsync(pObject);
            if (obj == null)
                return null;
            var allTyped = await GetAllFlatAsync($"{pObject.Type}.", true);
            return GetObjectWithChild(obj, allTyped, withHidden);
        }

        private PermissionedObjectDto GetObjectWithChild(PermissionedObjectDto dto, List<PermissionedObjectDto> list, bool withHidden = false)
        {
            var childQuery = list.Where(x => x.Parent == dto.Object);
            if (!withHidden)
                childQuery = childQuery.Where(x => !(x.Hidden ?? false));

            var child = childQuery
                .OrderBy(x => x.Name)
                .ToList();
            foreach (var permissionedObject in child)
            {
                var ch = dto.Children.FirstOrDefault(x => x.Object == permissionedObject.Object && x.Type == permissionedObject.Type);
                if (ch != null)
                    GetObjectWithChild(ch, list, withHidden);
                else
                    dto.Children.Add(GetObjectWithChild(permissionedObject, list, withHidden));
            }
            return dto;
        }

        public virtual PermissionedObjectDto Get(string objectName, string objectType)
        {
            return AsyncHelper.RunSync(() => GetOrDefaultAsync(objectName, objectType));
        }

        public List<string> GetActualPermissions(string objectName, string objectType, bool useInherited = true)
        {
            var obj = Get(objectName, objectType);
            return (obj != null
                ? useInherited
                    ? obj.ActualPermissions
                    : obj.Permissions
                : null) ?? new List<string>();
        }

        private PermissionedObject InternalCreate(string objectName, string objectType, string? inheritedFromName = null, Module? module = null)
        {
            var inh = inheritedFromName;
            if (inheritedFromName == null)
            {
                var parts = objectName.Split('@');
                if (parts.Length > 1)
                {
                    inh = parts[0];
                    for (var i = 1; i < parts.Length - 1; i++)
                    {
                        inh += "@" + parts[i];
                    }
                }
            }
            var dbObj = new PermissionedObject()
            {
                Object = objectName,
                Name = objectName,
                Parent = inh ?? string.Empty,
                Access = RefListPermissionedAccess.Inherited,
                Module = module,
                Type = objectType
            };

            return dbObj;
        }

        private PermissionedObjectDto InternalDtoCreate(string objectName, string objectType, string? inheritedFromName = null, Module? module = null)
        {
            var inh = inheritedFromName;
            if (inheritedFromName == null)
            {
                var parts = objectName.Split('@');
                if (parts.Length > 1)
                {
                    inh = parts[0];
                    for (var i = 1; i < parts.Length - 1; i++)
                    {
                        inh += "@" + parts[i];
                    }
                }
            }
            var dtoObj = new PermissionedObjectDto()
            {
                Object = objectName,
                Name = objectName,
                Parent = inh ?? string.Empty,
                Access = RefListPermissionedAccess.Inherited,
                Module = module?.Name,
                ModuleId = module?.Id,
                Type = objectType
            };

            return dtoObj;
        }

        private async Task<PermissionedObjectDto?> GetDtoOrNullAsync(PermissionedObjectDto dtoObj, bool useInherited = true, bool useHidden = false)
        {
            dtoObj.ActualPermissions = dtoObj.Access == RefListPermissionedAccess.RequiresPermissions ? dtoObj.Permissions : new List<string>();
            dtoObj.ActualAccess = dtoObj.Access;

            // skip hidden
            if (!useHidden && (dtoObj.Hidden ?? false))
                return null;

            var parent = !string.IsNullOrEmpty(dtoObj.Parent)
                ? await GetOrDefaultAsync(dtoObj.Parent, "")
                : null;
            dtoObj.InheritedAccess = RefListPermissionedAccess.Inherited;

            // check parent
            if (parent != null)
            {
                dtoObj.InheritedPermissions = parent.ActualPermissions;
                dtoObj.InheritedAccess = parent.ActualAccess;
            }

            // if current object is inherited
            if (useInherited && dtoObj.Inherited && parent != null)
            {
                // check parent
                if (parent.ActualAccess != RefListPermissionedAccess.Inherited)
                {
                    dtoObj.ActualPermissions = parent.ActualPermissions;
                    dtoObj.ActualAccess = parent.ActualAccess;
                    return dtoObj;
                }
            }
            return dtoObj;
        }

        private Task<PermissionedObjectDto?> GetDtoOrNullAsync(PermissionedObject dbObj, bool useInherited = true, bool useHidden = false)
        {
            var obj = _objectMapper.Map<PermissionedObjectDto>(dbObj);
            return GetDtoOrNullAsync(obj, useInherited, useHidden);
        }

        private async Task<PermissionedObjectDto> GetCacheOrDtoAsync(PermissionedObject dbObj)
        {
            var key = GetCacheKey(dbObj.Object, dbObj.Type);
            var cacheObj = await _permissionedObjectsCache.TryGetValueAsync(key);
            if (cacheObj.HasValue)
                return cacheObj.Value.DbValue ?? cacheObj.Value.DefaultValue;

            var dto = await GetDtoOrNullAsync(dbObj, true, true);

            await SetCacheAsync(dto.NotNull());
            return dto;
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> CreateAsync(string objectName, string objectType, string? inheritedFromName = null)
        {
            var dbObj = InternalCreate(objectName, objectType, inheritedFromName);
            await _permissionedObjectRepository.InsertAsync(dbObj);
            var obj = await GetDtoOrNullAsync(dbObj, true, true);

            return obj.NotNull();
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> GetOrCreateAsync(string objectName, string objectType, string? inheritedFromName = null)
        {
            var dbObj = await _permissionedObjectRepository.GetAll().Where(x => x.Object == objectName).FirstOrDefaultAsync();
            return dbObj != null
                ? (await GetDtoOrNullAsync(dbObj, true, true)).NotNull()
                : await CreateAsync(objectName, objectType, inheritedFromName);
        }

        public virtual async Task<PermissionedObjectDto> GetAsync(Guid id)
        {
            var dbObj = await _permissionedObjectRepository.GetAll().FirstOrDefaultAsync(x => x.Id == id);
            return await GetCacheOrDtoAsync(dbObj);
        }

        public virtual async Task<CacheItemWrapper<PermissionedObjectDto>> GetInternalAsync(string objectName, string objectType)
        {
            var key = GetCacheKey(objectName, objectType);
            var cacheObj = await _permissionedObjectsCache.TryGetValueAsync(key);
            if (cacheObj.HasValue)
                return cacheObj.Value;

            CacheItemWrapper<PermissionedObjectDto>? item = null;
            using (var uow = _unitOfWorkManager.Current == null ? _unitOfWorkManager.Begin() : null)
            {
                var dbObj = await _permissionedObjectRepository.GetAll()
                    .WhereIf(!string.IsNullOrWhiteSpace(objectType), x => x.Type == objectType)
                    .Where(x => x.Object == objectName)
                    .FirstOrDefaultAsync();
                var dto = dbObj != null
                    ? await GetDtoOrNullAsync(dbObj)
                    : null;
                if (uow != null)
                    await uow.CompleteAsync();

                var def = await GetDtoOrNullAsync(InternalDtoCreate(objectName, objectType), true, true);
                item = new CacheItemWrapper<PermissionedObjectDto>(def.NotNull(), dto);
                await SetCacheAsync(def, item);
            }
            return item;
        }

        public virtual async Task<PermissionedObjectDto?> GetOrNullAsync(string objectName, string objectType)
        {
            var obj = await GetInternalAsync(objectName, objectType);
            return obj.DbValue;
        }


        public virtual async Task<PermissionedObjectDto> GetOrDefaultAsync(string objectName, string objectType)
        {
            var obj = await GetInternalAsync(objectName, objectType);
            return obj.DbValue ?? obj.DefaultValue;
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> SetAsync(PermissionedObjectDto permissionedObject)
        {
            // ToDo: AS - check if permission names exist
            var obj =
                await _permissionedObjectRepository.GetAll()
                    .Where(x => x.Object == permissionedObject.Object && x.Type == permissionedObject.Type).FirstOrDefaultAsync()
                ??
                new PermissionedObject()
                {
                    Object = permissionedObject.Object,
                    Type = permissionedObject.Type,
                    Module = permissionedObject.Module != null
                        ? await _moduleReporsitory.FirstOrDefaultAsync(x => x.Id == permissionedObject.ModuleId)
                        : !string.IsNullOrWhiteSpace(permissionedObject.Module)
                            ? await _moduleReporsitory.FirstOrDefaultAsync(x => x.Name == permissionedObject.Module)
                            : null,
                    Parent = permissionedObject.Parent ?? string.Empty,
                    Name = permissionedObject.Name ?? permissionedObject.Object,
                };

            obj.Category = permissionedObject.Category;
            obj.Description = permissionedObject.Description;
            obj.Permissions = string.Join(",", permissionedObject.Permissions ?? new List<string>());
            obj.Hidden = permissionedObject.Hidden ?? false;
            obj.Access = permissionedObject.Access ?? RefListPermissionedAccess.Inherited;

            var newObj = await _permissionedObjectRepository.InsertOrUpdateAsync(obj);

            var dto = await GetDtoOrNullAsync(newObj, true, true);
            return dto.NotNull();
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto?> SetPermissionsAsync(string objectName, RefListPermissionedAccess access, List<string> permissions)
        {
            // ToDo: AS - check permission names exist
            var obj = await _permissionedObjectRepository.GetAll().Where(x => x.Object == objectName).FirstOrDefaultAsync();

            if (obj == null)
                return null;

            obj.Permissions = string.Join(",", permissions ?? new List<string>());
            obj.Access = (RefListPermissionedAccess)access;
            await _permissionedObjectRepository.InsertOrUpdateAsync(obj);

            var dto = await GetDtoOrNullAsync(obj);
            return dto;
        }

        public async Task<PermissionedObjectDto?> CopyAsync(string srcObjectName, string dstObjectName, string srcObjectType, string? dstObjectType = null)
        {
            var permission = await GetOrNullAsync(srcObjectName, srcObjectType);
            if (permission != null)
            {
                permission.Id = Guid.Empty;
                permission.Object = dstObjectName;
                permission.Type = dstObjectType != null ? dstObjectType : permission.Type;
                return await SetAsync(permission);
            }
            return null;
        }

        public async Task<bool> IsActionDescriptorEnabledAsync(ActionDescriptor actionDescriptor)
        {
            if (actionDescriptor is ControllerActionDescriptor descriptor)
            {
                var methodName = descriptor.MethodInfo.Name.RemovePostfix("Async");
                // remove disabled endpoints
                var method = GetCrudMethod(methodName);

                var obj = "";
                if (descriptor.ControllerTypeInfo.ImplementsGenericInterface(typeof(IEntityAppService<,>)) && !string.IsNullOrWhiteSpace(method))
                {
                    // entity service
                    var genericInterface = descriptor.ControllerTypeInfo.GetGenericInterfaces(typeof(IEntityAppService<,>)).First();
                    var entityType = genericInterface.GenericTypeArguments.First();
                    obj = $"{entityType.FullName}@{method}";
                }
                else
                    // api service
                    obj = $"{descriptor.ControllerTypeInfo.FullName}@{methodName}";

                var permission = await GetOrDefaultAsync(obj, ShaPermissionedObjectsTypes.WebApiAction);
                return permission == null || permission.ActualAccess != RefListPermissionedAccess.Disable;
            }
            return true;
        }

        private void RemoveCache(string key)
        {
            _permissionedObjectsCache.Remove(key);
            PermissionedObjectRelations relation;
            if (_relationsCache.TryGetValue(key, out relation))
            {
                foreach (var childKey in relation.Children)
                {
                    RemoveCache(childKey);
                }
            }
        }

        private void RemoveCache(string objectName, string? objectType, string? parentName)
        {
            var key = "";
            var pkey = GetCacheKey(objectName, objectType);
            var parent = _permissionedObjectsCache.GetOrDefault(pkey);
            while (parent != null)
            {
                key = pkey;
                if (parent != null)
                {
                    pkey = GetCacheKey(parent.DefaultValue.Parent, objectType);
                    parent = _permissionedObjectsCache.GetOrDefault(pkey);
                }
            }

            _permissionedObjectsCache.Remove(key);
            PermissionedObjectRelations relation;
            if (_relationsCache.TryGetValue(key, out relation))
            {
                foreach (var childKey in relation.Children)
                {
                    RemoveCache(childKey);
                }
            }
        }

        public void HandleEvent(EntityChangedEventData<PermissionedObject> eventData)
        {
            RemoveCache(eventData.Entity.Object, eventData.Entity.Type, eventData.Entity.Parent);
        }

        /// <summary>
        /// Gets all permissioned shesha forms with anonymous access
        /// </summary>
        /// <returns></returns>
        public async Task<List<PermissionedObjectDto>> GetObjectsByAccessAsync(string type, RefListPermissionedAccess access)
        {
            var permissionedObjects = await _permissionedObjectRepository.GetAll().Where(o => o.Type == type).ToListAsync();

            var dtos = await permissionedObjects.SelectAsync(async x => await GetCacheOrDtoAsync(x));

            var forms = dtos
                .Where(x => x.ActualAccess == access)
                .ToList();
            return forms;
        }
    }
}