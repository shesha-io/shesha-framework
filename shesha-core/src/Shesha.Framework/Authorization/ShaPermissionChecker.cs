﻿using Abp.Authorization;
using Abp.Domain.Uow;
using Abp.Runtime.Caching;
using Shesha.Authorization.Cache;
using Shesha.Authorization.Dtos;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.AutoMapper.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    /// <summary>
    /// Permissions checker
    /// </summary>
    public class ShaPermissionChecker : PermissionChecker<Role, User>, IShaPermissionChecker
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public Guid Id { get; set; }

        protected readonly ITypedCache<string, CustomUserPermissionCacheItem> CustomUserPermissionCache;

        /// <summary>
        /// Default constructor
        /// </summary>
        public ShaPermissionChecker(UserManager userManager, IUnitOfWorkManager unitOfWorkManager, ICustomUserPermissionCacheHolder cacheHolder)
            : base(userManager)
        {
            _unitOfWorkManager = unitOfWorkManager;

            Id = Guid.NewGuid();
            CustomUserPermissionCache = cacheHolder.Cache;
        }

        private int? GetCurrentTenantId()
        {
            if (_unitOfWorkManager.Current != null)
            {
                return _unitOfWorkManager.Current.GetTenantId();
            }

            return AbpSession.TenantId;
        }


        /// inheritedDoc
        [UnitOfWork]
        public override bool IsGranted(long userId, string permissionName)
        {
            var manager = IocManager.Resolve<IPermissionManager>();

            var granted = base.IsGranted(userId, permissionName);
            if (granted)
                return true;

            var cacheKey = GetPermissionsCacheKey(userId, GetCurrentTenantId());
            var customPermissionsItem = CustomUserPermissionCache.GetOrDefault(cacheKey);

            if (customPermissionsItem != null)
            {
                if (customPermissionsItem.GrantedPermissions.Contains(permissionName))
                    return true;
                if (customPermissionsItem.ProhibitedPermissions.Contains(permissionName))
                    return false;
            }

            customPermissionsItem ??= new CustomUserPermissionCacheItem(userId);
            var isGranted = IsGrantedCustom(userId, permissionName);
            if (isGranted)
                customPermissionsItem.GrantedPermissions.Add(permissionName);
            else
                customPermissionsItem.ProhibitedPermissions.Add(permissionName);

            CustomUserPermissionCache.Set(cacheKey, customPermissionsItem, slidingExpireTime: TimeSpan.FromMinutes(5));

            return isGranted;
        }

        /// inheritedDoc
        [UnitOfWork]
        public override async Task<bool> IsGrantedAsync(long userId, string permissionName)
        {
            var granted = await base.IsGrantedAsync(userId, permissionName);
            if (granted)
                return true;

            var cacheKey = GetPermissionsCacheKey(userId, GetCurrentTenantId());
            var customPermissionsItem = await CustomUserPermissionCache.GetOrDefaultAsync(cacheKey);

            if (customPermissionsItem != null)
            {
                if (customPermissionsItem.GrantedPermissions.Contains(permissionName))
                    return true;
                if (customPermissionsItem.ProhibitedPermissions.Contains(permissionName))
                    return false;
            }

            customPermissionsItem ??= new CustomUserPermissionCacheItem(userId);
            var isGranted = await IsGrantedCustomAsync(userId, permissionName);
            if (isGranted)
                customPermissionsItem.GrantedPermissions.Add(permissionName);
            else
                customPermissionsItem.ProhibitedPermissions.Add(permissionName);

            await CustomUserPermissionCache.SetAsync(cacheKey, customPermissionsItem, slidingExpireTime: TimeSpan.FromMinutes(5));

            return isGranted;
        }

        /// <summary>
        /// Indicates is specified <paramref name="permissionName"/> granted to the user with <paramref name="userId"/> or not
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <param name="permissionName">Permission name</param>
        /// <returns></returns>
        public async Task<bool> IsGrantedCustomAsync(long userId, string permissionName)
        {
            var customCheckers = IocManager.ResolveAll<ICustomPermissionChecker>();
            foreach (var customChecker in customCheckers)
            {
                if (await customChecker.IsGrantedAsync(userId, permissionName))
                    return true;
            }

            return false;
        }

        public async Task<bool> IsGrantedCustomAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            var customCheckers = IocManager.ResolveAll<ICustomPermissionChecker>();
            foreach (var customChecker in customCheckers)
            {
                if (await customChecker.IsGrantedAsync(userId, permissionName, permissionedEntity))
                    return true;
            }

            return false;
        }

        /// <summary>
        /// Indicates is specified <paramref name="permissionName"/> granted to the user with <paramref name="userId"/> or not
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <param name="permissionName">Permission name</param>
        /// <returns></returns>
        public bool IsGrantedCustom(long userId, string permissionName)
        {
            var customCheckers = IocManager.ResolveAll<ICustomPermissionChecker>();
            foreach (var customChecker in customCheckers)
            {
                if (customChecker.IsGranted(userId, permissionName))
                    return true;
            }

            return false;
        }

        public bool IsGrantedCustom(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            var customCheckers = IocManager.ResolveAll<ICustomPermissionChecker>();
            foreach (var customChecker in customCheckers)
            {
                if (customChecker.IsGranted(userId, permissionName, permissionedEntity))
                    return true;
            }

            return false;
        }

        /// <summary>
        /// Returns cache key that is used to store permissions of the user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <param name="tenantId">Tenant Id</param>
        /// <param name="permissionedEntity">Permissioned Entity</param>
        /// <returns></returns>
        private string GetPermissionsCacheKey(long userId, int? tenantId, EntityReferenceDto<string>? permissionedEntity = null)
        {
            if (permissionedEntity == null)
                return userId + "@" + (tenantId ?? 0);
            return userId + "@" + (tenantId ?? 0) + "#" + permissionedEntity._className + "@" + permissionedEntity.Id;
        }

        /// inheritedDoc
        public async Task ClearPermissionsCacheForUserAsync(long userId, int? tenantId)
        {
            var cacheKey = GetPermissionsCacheKey(userId, tenantId);
            await CustomUserPermissionCache.RemoveAsync(cacheKey);
        }

        /// inheritedDoc
        public async Task ClearPermissionsCacheAsync()
        {
            await CustomUserPermissionCache.ClearAsync();
        }

        public async Task<bool> IsGrantedAsync(string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            return AbpSession.UserId.HasValue && await IsGrantedAsync(AbpSession.UserId.Value, permissionName, permissionedEntity);
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            var granted = await base.IsGrantedAsync(userId, permissionName);
            if (granted)
                return true;

            var cacheKey = GetPermissionsCacheKey(userId, GetCurrentTenantId(), permissionedEntity);
            var customPermissionsItem = await CustomUserPermissionCache.GetOrDefaultAsync(cacheKey);

            if (customPermissionsItem != null)
            {
                if (customPermissionsItem.GrantedPermissions.Contains(permissionName))
                    return true;
                if (customPermissionsItem.ProhibitedPermissions.Contains(permissionName))
                    return false;
            }

            customPermissionsItem ??= new CustomUserPermissionCacheItem(userId);
            var isGranted = await IsGrantedCustomAsync(userId, permissionName, permissionedEntity);
            if (isGranted)
                customPermissionsItem.GrantedPermissions.Add(permissionName);
            else
                customPermissionsItem.ProhibitedPermissions.Add(permissionName);

            await CustomUserPermissionCache.SetAsync(cacheKey, customPermissionsItem, slidingExpireTime: TimeSpan.FromMinutes(5));

            return isGranted;
        }

        public bool IsGranted(string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            return AbpSession.UserId.HasValue && IsGranted(AbpSession.UserId.Value, permissionName, permissionedEntity);
        }

        public bool IsGranted(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity)
        {
            var manager = IocManager.Resolve<IPermissionManager>();

            var granted = base.IsGranted(userId, permissionName);
            if (granted)
                return true;

            var cacheKey = GetPermissionsCacheKey(userId, GetCurrentTenantId(), permissionedEntity);
            var customPermissionsItem = CustomUserPermissionCache.GetOrDefault(cacheKey);

            if (customPermissionsItem != null)
            {
                if (customPermissionsItem.GrantedPermissions.Contains(permissionName))
                    return true;
                if (customPermissionsItem.ProhibitedPermissions.Contains(permissionName))
                    return false;
            }

            customPermissionsItem ??= new CustomUserPermissionCacheItem(userId);
            var isGranted = IsGrantedCustom(userId, permissionName, permissionedEntity);
            if (isGranted)
                customPermissionsItem.GrantedPermissions.Add(permissionName);
            else
                customPermissionsItem.ProhibitedPermissions.Add(permissionName);

            CustomUserPermissionCache.Set(cacheKey, customPermissionsItem, slidingExpireTime: TimeSpan.FromMinutes(5));

            return isGranted;

        }
    }
}