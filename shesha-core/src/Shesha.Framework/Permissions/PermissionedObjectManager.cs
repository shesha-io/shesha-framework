using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.ObjectMapping;
using Abp.Runtime.Caching;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Application.Services;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Permissions.Enum;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Permissions
{
    public class PermissionedObjectManager : IPermissionedObjectManager, ITransientDependency
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


        private IRepository<PermissionedObject, Guid> _permissionedObjectRepository;
        private IUnitOfWorkManager _unitOfWorkManager;
        private ICacheManager _cacheManager;
        private IObjectMapper _objectMapper;
        private readonly IRepository<Module, Guid> _moduleReporsitory;

        public PermissionedObjectManager(
            IRepository<PermissionedObject, Guid> permissionedObjectRepository,
            IUnitOfWorkManager unitOfWorkManager,
            ICacheManager cacheManager,
            IObjectMapper objectMapper,
            IRepository<Module, Guid> moduleReporsitory
        )
        {
            _permissionedObjectRepository = permissionedObjectRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _cacheManager = cacheManager;
            _objectMapper = objectMapper;
            _moduleReporsitory = moduleReporsitory;
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

        [UnitOfWork]
        public virtual async Task<List<PermissionedObjectDto>> GetAllFlatAsync(string type = null, bool withNested = true, bool withHidden = false)
        {
            var root = (await _permissionedObjectRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(type?.Trim()), x => x.Type == type)
                .WhereIf(!withHidden, x => !x.Hidden)
                .ToListAsync())
                .Select(x => _objectMapper.Map<PermissionedObjectDto>(x))
                .OrderBy(x => x.Name)
                .ToList();

            if (withNested && !string.IsNullOrEmpty(type?.Trim()))
            {
                var nested = (await _permissionedObjectRepository.GetAll()
                        .Where(x => x.Type.Contains($"{type}."))
                        .WhereIf(!withHidden, x => !x.Hidden)
                        .ToListAsync())
                    .Select(x => _objectMapper.Map<PermissionedObjectDto>(x))
                    .OrderBy(x => x.Name)
                    .ToList();
                root.AddRange(nested);
            }

            return root;
        }

        [UnitOfWork]
        public virtual async Task<List<PermissionedObjectDto>> GetAllTreeAsync(string type = null, bool withHidden = false)
        {
            return (await _permissionedObjectRepository.GetAll()
                .WhereIf(!string.IsNullOrEmpty(type?.Trim()), x => x.Type == type)
                .WhereIf(!withHidden, x => !x.Hidden)
                .Where(x => x.Parent == null || x.Parent == "")
                .ToListAsync())
                .OrderBy(x => x.Name)
                .Select(x => GetObjectWithChild(x, withHidden))
                .ToList();
        }

        public virtual async Task<PermissionedObjectDto> GetObjectWithChild(string objectName, bool withHidden = false)
        {
            var obj = await _permissionedObjectRepository.GetAll()
                .WhereIf(!withHidden, x => !x.Hidden)
                .Where(x => x.Parent == null || x.Parent == "")
                .FirstOrDefaultAsync();
            return GetObjectWithChild(obj, withHidden);
        }

        private PermissionedObjectDto GetObjectWithChild(PermissionedObject obj, bool withHidden = false)
        {
            var dto = _objectMapper.Map<PermissionedObjectDto>(obj);

            // ToDo: need to check deeper
            /*if (dto.Access == RefListPermissionedAccess.Inherited && !dto.Parent.IsNullOrEmpty())
            {
                var parent = _permissionedObjectRepository.FirstOrDefault(x => x.Object == dto.Parent);
                dto.ActualAccess = parent?.Access;
                dto.ActualPermissions = parent?.Permissions.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
            }*/
            var child = _permissionedObjectRepository.GetAll()
                .WhereIf(!withHidden, x => !x.Hidden)
                .Where(x => x.Parent == obj.Object)
                .OrderBy(x => x.Name)
                .ToList();
            foreach (var permissionedObject in child)
            {
                dto.Children.Add(GetObjectWithChild(permissionedObject, withHidden));
            }
            return dto;
        }

        public virtual PermissionedObjectDto Get(string objectName, bool useInherited = true,
            UseDependencyType useDependency = UseDependencyType.Before, bool useHidden = false)
        {
            return AsyncHelper.RunSync(() => GetAsync(objectName, useInherited, useDependency, useHidden));
        }

        public List<string> GetActualPermissions(string objectName, bool useInherited = true,
            UseDependencyType useDependency = UseDependencyType.Before)
        {
            var obj = Get(objectName, useInherited, useDependency);
            return obj?.Permissions ?? new List<string>();
        }

        private PermissionedObject InternalCreate(string objectName, string objectType, string inheritedFromName = null, string dependentFromName = null, Module module = null)
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
                Dependency = dependentFromName,
                Parent = inh,
                Access = RefListPermissionedAccess.Inherited,
                Module = module,
                Type = objectType
            };
            return dbObj;
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> CreateAsync(string objectName, string objectType, string inheritedFromName = null, string dependentFromName = null)
        {
            var dbObj = InternalCreate(objectName, objectType, inheritedFromName, dependentFromName);
            await _permissionedObjectRepository.InsertAsync(dbObj);
            var obj = _objectMapper.Map<PermissionedObjectDto>(dbObj);
            _cacheManager.GetPermissionedObjectCache().Set(objectName, obj);
            
            return await Task.FromResult(obj);
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> GetOrCreateAsync(string objectName, string objectType, string inheritedFromName = null, string dependentFromName = null,
            bool useInherited = true, UseDependencyType useDependency = UseDependencyType.Before, bool useHidden = false)
        {
            var obj = await _cacheManager.GetPermissionedObjectCache().GetOrDefaultAsync(objectName);

            if (obj == null || obj.Type == PermissionedObjectsSheshaTypes.Cache)
            {
                var dbObj = await _permissionedObjectRepository.GetAll().Where(x => x.Object == objectName).FirstOrDefaultAsync();
                if (dbObj != null)
                {
                    obj = _objectMapper.Map<PermissionedObjectDto>(dbObj);
                    _cacheManager.GetPermissionedObjectCache().Set(objectName, obj);
                }
                else
                {
                    obj = await CreateAsync(objectName, objectType, inheritedFromName, dependentFromName);
                }
            }

            return await GetAsync(objectName, useInherited, useDependency, useHidden);
        }

        public virtual async Task<PermissionedObjectDto> GetAsync(string objectName, bool useInherited = true,
            UseDependencyType useDependency = UseDependencyType.Before, bool useHidden = false)
        {
            var obj = await _cacheManager.GetPermissionedObjectCache().GetOrDefaultAsync(objectName);

            if (obj == null)
            {
                using var unitOfWork = _unitOfWorkManager.Begin();
                var dbObj = await _permissionedObjectRepository.GetAll().Where(x => x.Object == objectName).FirstOrDefaultAsync() 
                    ?? InternalCreate(objectName, PermissionedObjectsSheshaTypes.Cache);
                if (dbObj != null)
                {
                    obj = _objectMapper.Map<PermissionedObjectDto>(dbObj);
                    _cacheManager.GetPermissionedObjectCache().Set(objectName, obj);
                }
                await unitOfWork.CompleteAsync();
            }

            // Check hidden, dependency and inherited
            if (obj != null)
            {
                obj.ActualPermissions = obj.Access == RefListPermissionedAccess.RequiresPermissions ? obj.Permissions : new List<string>();
                obj.ActualAccess = obj.Access;

                // skip hidden
                if (!useHidden && obj.Hidden)
                    return null;

                // get dependency
                var dep = !string.IsNullOrEmpty(obj.Dependency)
                    ? await GetAsync(obj.Dependency, true, useDependency, useHidden)
                    : null;

                // check dependency before
                if (useDependency == UseDependencyType.Before && dep != null && dep.ActualAccess != RefListPermissionedAccess.Inherited)
                {
                    obj.ActualPermissions = dep.ActualPermissions;
                    obj.ActualAccess = dep.ActualAccess;
                    return obj;
                }

                var parent = !string.IsNullOrEmpty(obj.Parent)
                    ? await GetAsync(obj.Parent, true, useDependency, useHidden)
                    : null;
                obj.InheritedAccess = RefListPermissionedAccess.Inherited;

                // check parent
                if (parent != null)
                {
                    obj.InheritedPermissions = parent.ActualPermissions;
                    obj.InheritedAccess = parent.ActualAccess;
                }

                // if current object is inherited
                if (useInherited && obj.Inherited && parent != null)
                {
                    // check parent
                    if (parent.ActualAccess != RefListPermissionedAccess.Inherited)
                    {
                        obj.ActualPermissions = parent.ActualPermissions;
                        obj.ActualAccess = parent.ActualAccess;
                        return obj;
                    }

                    // check dependency after
                    if (useDependency == UseDependencyType.After && dep != null && dep.ActualAccess != RefListPermissionedAccess.Inherited)
                    {
                        obj.ActualPermissions = dep.ActualPermissions;
                        obj.ActualAccess = dep.ActualAccess;
                        return obj;
                    }
                }
            }

            return obj;
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> SetAsync(PermissionedObjectDto permissionedObject)
        {
            // ToDo: AS - check if permission names exist
            var obj = await _permissionedObjectRepository.GetAll().Where(x => x.Object == permissionedObject.Object && x.Type == permissionedObject.Type).FirstOrDefaultAsync()
                      ??
                      new PermissionedObject()
                      {
                          Object = permissionedObject.Object,
                          Type = permissionedObject.Type,
                          Module = _moduleReporsitory.FirstOrDefault(x => x.Id == permissionedObject.ModuleId),
                          Parent = permissionedObject.Parent,
                          Name = permissionedObject.Name,
                      };

            obj.Category = permissionedObject.Category;
            obj.Description = permissionedObject.Description;
            obj.Permissions = string.Join(",", permissionedObject.Permissions ?? new List<string>());
            obj.Type = permissionedObject.Type;
            //obj.Inherited = permissionedObject.Inherited;
            obj.Hidden = permissionedObject.Hidden;
            obj.Access = permissionedObject.Access ?? RefListPermissionedAccess.Inherited;

            await _permissionedObjectRepository.InsertOrUpdateAsync(obj);

            await _cacheManager.GetPermissionedObjectCache().SetAsync(permissionedObject.Object, permissionedObject);

            return permissionedObject;
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

            var dto = _objectMapper.Map<PermissionedObjectDto>(obj);
            await _cacheManager.GetPermissionedObjectCache().SetAsync(objectName, dto);
            return dto;
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

                var permission = await GetAsync(obj);
                return permission == null || permission.ActualAccess != RefListPermissionedAccess.Disable;
            }
            return true;
        }

        public virtual async Task ClearCacheAsync()
        {
            await _cacheManager.GetPermissionedObjectCache().ClearAsync();
        }
    }

}