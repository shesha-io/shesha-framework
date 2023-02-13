using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Linq.Extensions;
using Abp.ObjectMapping;
using Abp.Runtime.Caching;
using ConcurrentCollections;
using NHibernate.Linq;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Permissions.Enum;
using Shesha.Utilities;

namespace Shesha.Permissions
{
    public class PermissionedObjectManager : IPermissionedObjectManager, ITransientDependency
    {
        private IRepository<PermissionedObject, Guid> _permissionedObjectRepository;
        private IUnitOfWorkManager _unitOfWorkManager;
        private ICacheManager _cacheManager;
        private IObjectMapper _objectMapper;

        public PermissionedObjectManager(
            IRepository<PermissionedObject, Guid> permissionedObjectRepository,
            IUnitOfWorkManager unitOfWorkManager,
            ICacheManager cacheManager,
            IObjectMapper objectMapper
        )
        {
            _permissionedObjectRepository = permissionedObjectRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _cacheManager = cacheManager;
            _objectMapper = objectMapper;
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
                .FirstOrDefaultAsync(x => x.Parent == null || x.Parent == "");
            return GetObjectWithChild(obj, withHidden);
        }

        private PermissionedObjectDto GetObjectWithChild(PermissionedObject obj, bool withHidden = false)
        {
            var dto = _objectMapper.Map<PermissionedObjectDto>(obj);
            var child = _permissionedObjectRepository.GetAll()
                .WhereIf(!withHidden, x => !x.Hidden)
                .Where(x => x.Parent == obj.Object)
                .OrderBy(x => x.Name)
                .ToList();
            foreach (var permissionedObject in child)
            {
                dto.Child.Add(GetObjectWithChild(permissionedObject, withHidden));
            }
            return dto;
        }



        public virtual PermissionedObjectDto Get(string objectName, bool useInherited = true,
            UseDependencyType useDependency = UseDependencyType.Before, bool useHidden = false)
        {
            return AsyncHelper.RunSync(() => GetAsync(objectName, useInherited, useDependency, useHidden));
        }

        public ConcurrentHashSet<string> GetActualPermissions(string objectName, bool useInherited = true,
            UseDependencyType useDependency = UseDependencyType.Before)
        {
            var obj = Get(objectName, useInherited, useDependency);
            return obj?.Permissions ?? new ConcurrentHashSet<string>();
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> CreateAsync(string objectName, string objectType, string inheritedFromName = null, string dependentFromName = null)
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
                Module = "",
                Type = objectType
            };
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

            if (obj == null)
            {
                var dbObj = await _permissionedObjectRepository.GetAll().FirstOrDefaultAsync(x => x.Object == objectName);
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
                var dbObj = await _permissionedObjectRepository.GetAll().FirstOrDefaultAsync(x => x.Object == objectName);
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
                obj.ActualPermissions = obj.Access == RefListPermissionedAccess.RequiresPermissions ? obj.Permissions : new ConcurrentHashSet<string>();
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


                // if current object is inherited
                if (useInherited && obj.Inherited && !string.IsNullOrEmpty(obj.Parent))
                {
                    var parent = await GetAsync(obj.Parent, true, useDependency, useHidden);

                    // check parent
                    if (parent != null && parent.ActualAccess != RefListPermissionedAccess.Inherited)
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
            var obj = await _permissionedObjectRepository.GetAll().FirstOrDefaultAsync(x =>
                          x.Object == permissionedObject.Object
                          && x.Type == permissionedObject.Type)
                      ??
                      new PermissionedObject()
                      {
                          Object = permissionedObject.Object,
                          Type = permissionedObject.Type,
                          Module = permissionedObject.Module,
                          Parent = permissionedObject.Parent,
                          Name = permissionedObject.Name,
                      };

            obj.Category = permissionedObject.Category;
            obj.Description = permissionedObject.Description;
            obj.Permissions = string.Join(",", permissionedObject.Permissions ?? new ConcurrentHashSet<string>());
            //obj.Inherited = permissionedObject.Inherited;
            obj.Hidden = permissionedObject.Hidden;
            obj.Access = (RefListPermissionedAccess?)permissionedObject.Access ?? RefListPermissionedAccess.Inherited;

            await _permissionedObjectRepository.InsertOrUpdateAsync(obj);

            await _cacheManager.GetPermissionedObjectCache().SetAsync(permissionedObject.Object, permissionedObject);

            return permissionedObject;
        }

        [UnitOfWork]
        public virtual async Task<PermissionedObjectDto> SetPermissionsAsync(string objectName, RefListPermissionedAccess access, List<string> permissions)
        {
            // ToDo: AS - check permission names exist
            var obj = await _permissionedObjectRepository.GetAll().FirstOrDefaultAsync(x => x.Object == objectName);

            if (obj == null) return null;

            obj.Permissions = string.Join(",", permissions ?? new List<string>());
            obj.Access = (RefListPermissionedAccess)access;
            await _permissionedObjectRepository.InsertOrUpdateAsync(obj);

            var dto = _objectMapper.Map<PermissionedObjectDto>(obj);
            await _cacheManager.GetPermissionedObjectCache().SetAsync(objectName, dto);

            return dto;
        }

        public virtual async Task ClearCacheAsync()
        {
            await _cacheManager.GetPermissionedObjectCache().ClearAsync();
        }

    }

}