using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.ObjectMapping;
using Abp.Runtime.Caching;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Controllers;
using NetTopologySuite.Index.HPRtree;
using Shesha.Application.Services;
using Shesha.Authorization;
using Shesha.Cache;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.Extensions;
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
        private const string PermissionedObjectsCacheName = "PermissionedObjectsCache";

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


        private readonly IRepository<PermissionedObject, Guid> _permissionedObjectRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IObjectMapper _objectMapper;
        private readonly IRepository<Module, Guid> _moduleReporsitory;
        private readonly ICacheManager _cacheManager;

        private readonly ITypedCache<string, PermissionedObjectRelations> RelationsCache;
        private readonly ITypedCache<string, CacheItemWrapper<PermissionedObjectDto>> PermissionedObjectsCache;

        public PermissionedObjectManager(
            IRepository<PermissionedObject, Guid> permissionedObjectRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IObjectMapper objectMapper,
            ICacheManager cacheManager,
            IRepository<Module, Guid> moduleReporsitory
        )
        {
            _permissionedObjectRepository = permissionedObjectRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _objectMapper = objectMapper;
            _cacheManager = cacheManager;
            _moduleReporsitory = moduleReporsitory;

            var cache = _cacheManager.GetPermissionedObjectCache();
            cache.DefaultSlidingExpireTime = TimeSpan.FromHours(24);
            PermissionedObjectsCache = cache;

            var relationCache = cacheManager.GetCache<string, PermissionedObjectRelations>($"Relations-{PermissionedObjectDto.CacheStoreName}");
            relationCache.DefaultSlidingExpireTime = TimeSpan.FromHours(24);
            RelationsCache = relationCache;
        }

        private string GetCacheKey(string objectName, string objectType)
        {
            return $"{objectName}"; // TODO: AS review using Permissioned objects types _{objectType}";
        }

        public virtual string GetObjectType(Type type)
        {
            var providers = IocManager.Instance.ResolveAll<IPermissionedObjectProvider>();
            foreach (var permissionedObjectProvider in providers)
            {
                var objType = permissionedObjectProvider.GetObjectType(type);
                if (!string.IsNullOrEmpty(objType))
                    return objType;
            }

            return null;
        }

        private async Task SetCacheAsync(PermissionedObjectDto dto, CacheItemWrapper<PermissionedObjectDto> item = null)
        {
            var parentKey = GetCacheKey(dto.Parent, dto.Type);
            var childKey = GetCacheKey(dto.Object, dto.Type);
            await PermissionedObjectsCache.SetAsync(childKey, item ?? new CacheItemWrapper<PermissionedObjectDto>(dto, dto));
            var cache = await RelationsCache.TryGetValueAsync(parentKey);
            var relation = cache.HasValue ? cache.Value : new PermissionedObjectRelations();
            relation.AddChildren(childKey);
            await RelationsCache.SetAsync(parentKey, relation);
        }

        [UnitOfWork]
        public virtual async Task<List<PermissionedObjectDto>> GetAllFlatAsync(string type = null, bool withNested = true, bool withHidden = false)
        {
            var root = (await _permissionedObjectRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(type?.Trim()), x => x.Type == type)
                .WhereIf(!withHidden, x => !x.Hidden)
                .ToListAsync())
                .Select(async x => {
                    var dto = await GetDtoAsync(x);
                    await SetCacheAsync(dto);
                    return dto;
                })
                .Select(x => x.Result)
                .OrderBy(x => x.Name)
                .ToList();

            if (withNested && !string.IsNullOrEmpty(type?.Trim()))
            {
                var nested = (await _permissionedObjectRepository.GetAll()
                    .Where(x => x.Type.StartsWith($"{type}."))
                    .WhereIf(!withHidden, x => !x.Hidden)
                    .ToListAsync())
                    .Select(async x => {
                        var dto = await GetDtoAsync(x);
                        await SetCacheAsync(dto);
                        return dto;
                    })
                    .Select(x => x.Result)
                    .OrderBy(x => x.Name)
                    .ToList();
                root.AddRange(nested);
            }

            return root;
        }

        [UnitOfWork]
        public virtual async Task<List<PermissionedObjectDto>> GetAllTreeAsync(string type = null, bool withHidden = false)
        {
            var allTyped = await GetAllFlatAsync(type, true);

            var allRoots = allTyped.Where(x => x.Parent == null || x.Parent == "");
            return allRoots
                .OrderBy(x => x.Name)
                .Select(x => GetObjectWithChild(x, allTyped, withHidden))
                .ToList();
        }

        public virtual async Task<PermissionedObjectDto> GetObjectWithChildAsync(string objectName, string type = null, bool withHidden = false)
        {
            var pObject = (await _permissionedObjectRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(type?.Trim()), x => x.Type == type)
                .WhereIf(!withHidden, x => !x.Hidden)
                .FirstOrDefaultAsync());
            if (pObject == null)
                return null;

            var obj = await GetDtoAsync(pObject);
            var allTyped = await GetAllFlatAsync($"{pObject.Type}.", true);
            return GetObjectWithChild(obj, allTyped, withHidden);
        }

        private PermissionedObjectDto GetObjectWithChild(PermissionedObjectDto dto, List<PermissionedObjectDto> list, bool withHidden = false)
        {
            var childQuery = list.Where(x => x.Parent == dto.Object);
            if (!withHidden)
                childQuery = childQuery.Where(x => !x.Hidden);

            var child = childQuery
                .OrderBy(x => x.Name)
                .ToList();
            foreach (var permissionedObject in child)
            {
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
            return obj != null 
                ? useInherited
                    ? obj.ActualPermissions
                    : obj.Permissions 
                : new List<string>();
        }

        private PermissionedObject InternalCreate(string objectName, string objectType, string inheritedFromName = null, Module module = null)
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
                Parent = inh,
                Access = RefListPermissionedAccess.Inherited,
                Module = module,
                Type = objectType
            };

            return dbObj;
        }

        private PermissionedObjectDto InternalDtoCreate(string objectName, string objectType, string inheritedFromName = null, Module module = null)
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
                Parent = inh,
                Access = RefListPermissionedAccess.Inherited,
                Module = module?.Name,
                ModuleId = module?.Id,
                Type = objectType
            };

            return dtoObj;
        }

        private async Task<PermissionedObjectDto> GetDtoAsync(PermissionedObjectDto dtoObj, bool useInherited = true, bool useHidden = false)
        {
            // Check hidden and inherited
            if (dtoObj != null)
            {
                dtoObj.ActualPermissions = dtoObj.Access == RefListPermissionedAccess.RequiresPermissions ? dtoObj.Permissions : new List<string>();
                dtoObj.ActualAccess = dtoObj.Access;

                // skip hidden
                if (!useHidden && dtoObj.Hidden)
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
            return null;
        }

        private async Task<PermissionedObjectDto> GetDtoAsync(PermissionedObject dbObj, bool useInherited = true, bool useHidden = false)
        {
            // Check hidden and inherited
            if (dbObj != null)
            {
                var obj = _objectMapper.Map<PermissionedObjectDto>(dbObj);

                return await GetDtoAsync(obj, useInherited, useHidden);
            }
            return null;
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> CreateAsync(string objectName, string objectType, string inheritedFromName = null)
        {
            var dbObj = InternalCreate(objectName, objectType, inheritedFromName);
            await _permissionedObjectRepository.InsertAsync(dbObj);
            var obj = await GetDtoAsync(dbObj);
            
            return obj;
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> GetOrCreateAsync(string objectName, string objectType, string inheritedFromName = null)
        {
            PermissionedObjectDto obj = null;
            var dbObj = await _permissionedObjectRepository.GetAll().Where(x => x.Object == objectName).FirstOrDefaultAsync();
            if (dbObj != null)
            {
                obj = await GetDtoAsync(dbObj);
            }
            else
            {
                obj = await CreateAsync(objectName, objectType, inheritedFromName);
            }

            return obj;
        }

        public virtual async Task<PermissionedObjectDto> GetAsync(Guid id)
        {
            var dbObj = _permissionedObjectRepository.GetAll().FirstOrDefault(x => x.Id == id);
            var dto = await GetDtoAsync(dbObj);
            await SetCacheAsync(dto);

            return dto;
        }

        public virtual async Task<CacheItemWrapper<PermissionedObjectDto>> GetInternalAsync(string objectName, string objectType)
        {
            var key = GetCacheKey(objectName, objectType);
            var cacheObj = await PermissionedObjectsCache.TryGetValueAsync(key);
            if (cacheObj.HasValue)
                return cacheObj.Value;

            CacheItemWrapper<PermissionedObjectDto> item = null;
            using (var uow = _unitOfWorkManager.Current == null ? _unitOfWorkManager.Begin() : null)
            {
                var dbObj = await _permissionedObjectRepository.GetAll()
                    .WhereIf(!objectType.IsNullOrEmpty(), x => x.Type == objectType)
                    .Where(x => x.Object == objectName)
                    .FirstOrDefaultAsync();
                var dto = dbObj != null
                    ? await GetDtoAsync(dbObj)
                    : null;
                if (uow != null)
                    await uow.CompleteAsync();

                var def = await GetDtoAsync(InternalDtoCreate(objectName, objectType));
                item = new CacheItemWrapper<PermissionedObjectDto>(def, dto);
                await SetCacheAsync(def, item);
            }
            return item;
        }

        public virtual async Task<PermissionedObjectDto> GetOrNullAsync(string objectName, string objectType)
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
                    ? _moduleReporsitory.FirstOrDefault(x => x.Id == permissionedObject.ModuleId)
                    : !permissionedObject.Module.IsNullOrEmpty()
                        ? _moduleReporsitory.FirstOrDefault(x => x.Name == permissionedObject.Module)
                        : null,
                    Parent = permissionedObject.Parent,
                    Name = permissionedObject.Name ?? permissionedObject.Object,
                };

            obj.Category = permissionedObject.Category;
            obj.Description = permissionedObject.Description;
            obj.Permissions = string.Join(",", permissionedObject.Permissions ?? new List<string>());
            obj.Hidden = permissionedObject.Hidden;
            obj.Access = permissionedObject.Access ?? RefListPermissionedAccess.Inherited;

            var newObj = await _permissionedObjectRepository.InsertOrUpdateAsync(obj);

            var dto = await GetDtoAsync(newObj);
            return dto;
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> SetPermissionsAsync(string objectName, RefListPermissionedAccess access, List<string> permissions)
        {
            // ToDo: AS - check permission names exist
            var obj = await _permissionedObjectRepository.GetAll().Where(x => x.Object == objectName).FirstOrDefaultAsync();

            if (obj == null) return null;

            obj.Permissions = string.Join(",", permissions ?? new List<string>());
            obj.Access = (RefListPermissionedAccess)access;
            await _permissionedObjectRepository.InsertOrUpdateAsync(obj);

            var dto = await GetDtoAsync(obj);
            return dto;
        }

        public async Task<PermissionedObjectDto> CopyAsync(string srcObjectName, string dstObjectName, string srcObjectType, string dstObjectType = null)
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

        public async Task<bool> IsActionDescriptorEnabled(ActionDescriptor actionDescriptor)
        {
            if (actionDescriptor is ControllerActionDescriptor descriptor)
            {
                // remove disabled endpoints
                var method = PermissionedObjectManager.CrudMethods.ContainsKey(descriptor.MethodInfo.Name.RemovePostfix("Async"))
                    ? PermissionedObjectManager.CrudMethods[descriptor.MethodInfo.Name.RemovePostfix("Async")]
                    : null;

                var obj = "";
                if (descriptor.ControllerTypeInfo.ImplementsGenericInterface(typeof(IEntityAppService<,>)) && !method.IsNullOrEmpty())
                {
                    // entity service
                    var genericInterface = descriptor.ControllerTypeInfo.GetGenericInterfaces(typeof(IEntityAppService<,>)).FirstOrDefault();
                    var entityType = genericInterface.GenericTypeArguments.FirstOrDefault();
                    obj = $"{entityType.FullName}@{method}";
                }
                else
                    // api service
                    obj = $"{descriptor.ControllerTypeInfo.FullName}@{descriptor.MethodInfo.Name}";

                var permission = await GetOrDefaultAsync(obj, ShaPermissionedObjectsTypes.WebApiAction);
                return permission == null || permission.ActualAccess != RefListPermissionedAccess.Disable;
            }
            return true;
        }

        private void RemoveCache(string key)
        {
            PermissionedObjectsCache.Remove(key);
            PermissionedObjectRelations relation;
            if (RelationsCache.TryGetValue(key, out relation))
            {
                foreach(var childKey in relation.Children)
                {
                    RemoveCache(childKey);
                }
            };
        }

        public void HandleEvent(EntityChangedEventData<PermissionedObject> eventData)
        {
            RemoveCache(GetCacheKey(eventData.Entity.Object, eventData.Entity.Type));
        }

        private class PermissionedObjectRelations
        {
            public PermissionedObjectRelations()
            {
                Children = new List<string>();
            }

            public List<string> Children { get; set; }

            public void AddChildren(string key)
            {
                if (!Children.Contains(key))
                    Children.Add(key);
            }
        }
    }
}