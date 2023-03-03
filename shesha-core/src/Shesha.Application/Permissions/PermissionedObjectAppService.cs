using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Permissions
{
    [AbpAuthorize()]
    public class PermissionedObjectAppService : SheshaCrudServiceBase<PermissionedObject, PermissionedObjectDto, Guid>, IPermissionedObjectAppService
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        public PermissionedObjectAppService(
            IRepository<PermissionedObject, Guid> repository,
            IPermissionedObjectManager permissionedObjectManager
            ) : base(repository)
        {
            _permissionedObjectManager = permissionedObjectManager;
        }
        
        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="repository"></param>
        public PermissionedObjectAppService(
            IRepository<PermissionedObject, Guid> repository
            ) : base(repository)
        {
        }

        /// <summary>
        /// Get list of protected objects
        /// </summary>
        /// <param name="type"></param>
        /// <param name="showNested"></param>
        /// <param name="showHidden"></param>
        /// <returns></returns>
        public async Task<List<PermissionedObjectDto>> GetAllFlatAsync(string type, bool showNested = true, bool showHidden = false)
        {
            return await _permissionedObjectManager.GetAllFlatAsync(type, showNested, showHidden);
        }

        /// <summary>
        /// Get hierarchical list of protected objects
        /// </summary>
        /// <param name="type"></param>
        /// <param name="showHidden"></param>
        /// <returns></returns>
        public async Task<List<PermissionedObjectDto>> GetAllTreeAsync(string type, bool showHidden = false)
        {
            return await _permissionedObjectManager.GetAllTreeAsync(type, showHidden);
        }

        /// <summary>
        /// Get protected object by name
        /// </summary>
        /// <param name="objectName"></param>
        /// <returns></returns>
        public async Task<PermissionedObjectDto> GetByObjectNameAsync(string objectName)
        {
            return await _permissionedObjectManager.GetAsync(objectName);
        }

        /// <summary>
        /// Set required permissions for protected object by name
        /// </summary>
        /// <param name="objectName"></param>
        /// <param name="access"></param>
        /// <param name="permissions"></param>
        /// <returns></returns>
        public async Task<PermissionedObjectDto> SetPermissionsAsync(string objectName, RefListPermissionedAccess access, List<string> permissions)
        {
            return await _permissionedObjectManager.SetPermissionsAsync(objectName, access, permissions);
        }

        /// <summary>
        /// Get protected object for API by Service and Action names
        /// </summary>
        /// <param name="serviceName"></param>
        /// <param name="actionName"></param>
        /// <returns></returns>
        public async Task<PermissionedObjectDto> GetApiPermissionsAsync(string serviceName, string actionName)
        {
            var action = string.IsNullOrEmpty(actionName) ? "" : "@" + actionName;
            return await _permissionedObjectManager.GetAsync($"{serviceName}{action}");
        }

        public override async Task<PermissionedObjectDto> GetAsync(EntityDto<Guid> input)
        {
            if (input.Id == Guid.Empty)
                return null;
            var obj = await base.GetAsync(input);
            return await _permissionedObjectManager.GetAsync(obj.Object);
        }

        /// <summary>
        /// Update protected object data
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public override async Task<PermissionedObjectDto> UpdateAsync(PermissionedObjectDto input)
        {
            return await _permissionedObjectManager.SetAsync(input);
        }

        /// <summary>
        /// Set required permissions for API by Service and Action names
        /// </summary>
        /// <param name="serviceName"></param>
        /// <param name="actionName"></param>
        /// <param name="access"></param>
        /// <param name="permissions"></param>
        /// <returns></returns>
        public async Task<PermissionedObjectDto> SetApiPermissionsAsync(string serviceName, string actionName, RefListPermissionedAccess access, List<string> permissions)
        {
            var action = string.IsNullOrEmpty(actionName) ? "" : "@" + actionName;
            return await _permissionedObjectManager.SetPermissionsAsync($"{serviceName}{action}", access, permissions);
        }

        /// <summary>
        /// Clear protected objects cache
        /// </summary>
        /// <returns></returns>
        public async Task ClearCacheAsync()
        {
            await _permissionedObjectManager.ClearCacheAsync();
        }
    }
}