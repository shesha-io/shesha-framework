using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.ObjectMapping;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Application.Services;
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
        private IRepository<PermissionedObjectFull, Guid> _permissionedObjectFullRepository;
        private IUnitOfWorkManager _unitOfWorkManager;
        private IObjectMapper _objectMapper;
        private readonly IRepository<Module, Guid> _moduleReporsitory;


        // TODO: AS - optimize getting permissioned objects
        List<PermissionedObjectFull> _allPermissions;
        private List<PermissionedObjectFull> AllPermissions 
        {
            get
            {
                using var uow = _unitOfWorkManager.Begin();
                _allPermissions = _allPermissions ?? _permissionedObjectFullRepository.GetAllList();
                uow.Complete();
                return _allPermissions;
            }
        }

        public PermissionedObjectManager(
            IRepository<PermissionedObject, Guid> permissionedObjectRepository,
            IRepository<PermissionedObjectFull, Guid> permissionedObjectFullRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IObjectMapper objectMapper,
            IRepository<Module, Guid> moduleReporsitory
        )
        {
            _permissionedObjectRepository = permissionedObjectRepository;
            _permissionedObjectFullRepository = permissionedObjectFullRepository;
            _unitOfWorkManager = unitOfWorkManager;
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
            var root = (await AllPermissions.AsQueryable()
                .WhereIf(!string.IsNullOrEmpty(type?.Trim()), x => x.Type == type)
                .WhereIf(!withHidden, x => !x.Hidden)
                .ToListAsync())
                .Select(x => _objectMapper.Map<PermissionedObjectDto>(x))
                .OrderBy(x => x.Name)
                .ToList();

            if (withNested && !string.IsNullOrEmpty(type?.Trim()))
            {
                var nested = (await AllPermissions.AsQueryable()
                        .Where(x => x.Type.Contains($"{type}@"))
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
        public virtual List<PermissionedObjectDto> GetAllTree(string type = null, bool withHidden = false)
        {
            var allObjects = AllPermissions.AsQueryable()
                .WhereIf(!string.IsNullOrEmpty(type?.Trim()), x => x.Type == type)
                .WhereIf(!withHidden, x => !x.Hidden)
                .Where(x => x.Parent == null || x.Parent == "");
            return allObjects
                .OrderBy(x => x.Name)
                .Select(x => GetObjectWithChild(x, withHidden))
                .ToList();
        }

        public virtual PermissionedObjectDto GetObjectWithChild(string objectName, bool withHidden = false)
        {
            var allObjects = AllPermissions.AsQueryable()
                .WhereIf(!withHidden, x => !x.Hidden)
                .Where(x => x.Parent == null || x.Parent == "");

            var obj = allObjects.FirstOrDefault();
            return GetObjectWithChild(obj, withHidden);
        }

        private PermissionedObjectDto GetObjectWithChild(PermissionedObjectFull obj, bool withHidden = false)
        {
            var dto = _objectMapper.Map<PermissionedObjectDto>(obj);

            var childQuery = AllPermissions.Where(x => x.Parent == obj.Object);
            if (!withHidden)
                childQuery = childQuery.Where(x => !x.Hidden);

            var child = childQuery
                .OrderBy(x => x.Name)
                .ToList();
            foreach (var permissionedObject in child)
            {
                dto.Children.Add(GetObjectWithChild(permissionedObject, withHidden));
            }
            return dto;
        }

        public virtual PermissionedObjectDto Get(string objectName, string objectType = null, bool useInherited = true, bool useHidden = false)
        {
            return AsyncHelper.RunSync(() => GetAsync(objectName, objectType, useInherited, useHidden));
        }

        public List<string> GetActualPermissions(string objectName, string objectType = null, bool useInherited = true)
        {
            var obj = Get(objectName, objectType, useInherited);
            return obj?.Permissions ?? new List<string>();
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

        private async Task<PermissionedObjectDto> GetDtoAsync(PermissionedObject dbObj, bool useInherited = true, bool useHidden = false)
        {
            // Check hidden and inherited
            if (dbObj != null)
            {
                var obj = _objectMapper.Map<PermissionedObjectDto>(dbObj);

                obj.ActualPermissions = obj.Access == RefListPermissionedAccess.RequiresPermissions ? obj.Permissions : new List<string>();
                obj.ActualAccess = obj.Access;

                // skip hidden
                if (!useHidden && obj.Hidden)
                    return null;

                var parent = !string.IsNullOrEmpty(obj.Parent)
                    ? await GetAsync(obj.Parent, "", true, useHidden)
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
                }
                return obj;
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
        public virtual async Task<PermissionedObjectDto> GetOrCreateAsync(string objectName, string objectType, string inheritedFromName = null,
            bool useInherited = true, bool useHidden = false)
        {
            PermissionedObjectDto obj = null;
            var dbObj = await _permissionedObjectRepository.GetAll().Where(x => x.Object == objectName).FirstOrDefaultAsync();
            if (dbObj != null)
            {
                obj = _objectMapper.Map<PermissionedObjectDto>(dbObj);
            }
            else
            {
                obj = await CreateAsync(objectName, objectType, inheritedFromName);
            }

            return obj;
        }

        public virtual async Task<PermissionedObjectDto> GetAsync(Guid id, bool useInherited = true, bool useHidden = false)
        {
            var dbObj = AllPermissions.FirstOrDefault(x => x.Id == id);
            return await Task.FromResult(_objectMapper.Map<PermissionedObjectDto>(dbObj));
        }

        public virtual async Task<PermissionedObjectDto> GetAsync(string objectName, string objectType = null, bool useInherited = true, bool useHidden = false)
        {

            using var unitOfWork = _unitOfWorkManager.Begin();
            var dbObj = AllPermissions.AsQueryable()
                .WhereIf(!objectType.IsNullOrEmpty(), x => x.Type == objectType)
                .Where(x => x.Object == objectName)
                .FirstOrDefault();
            await unitOfWork.CompleteAsync();

            if (dbObj != null)
                return _objectMapper.Map<PermissionedObjectDto>(dbObj);
            
            var obj = await GetDtoAsync(InternalCreate(objectName, objectType));
            return obj;
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

            var newPermissionedObject = await GetDtoAsync(newObj);

            return newPermissionedObject;
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
            return dto;
        }

        public async Task<PermissionedObjectDto> CopyAsync(string srcObjectName, string dstObjectName, string srcObjectType = null, string dstObjectType = null)
        {
            var permission = await GetAsync(srcObjectName, srcObjectType);
            permission.Id = Guid.Empty;
            permission.Object = dstObjectName;
            permission.Type = dstObjectType != null ? dstObjectType : permission.Type;
            return await SetAsync(permission);
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

                var permission = await GetAsync(obj, ShaPermissionedObjectsTypes.WebApiAction);
                return permission == null || permission.ActualAccess != RefListPermissionedAccess.Disable;
            }
            return true;
        }
    }

}