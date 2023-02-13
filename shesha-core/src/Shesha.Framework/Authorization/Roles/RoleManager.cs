using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp;
using Abp.Authorization;
using Abp.Authorization.Roles;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Organizations;
using Abp.Runtime.Caching;
using Abp.UI;
using Abp.Zero.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Shesha.Authorization.Users;

namespace Shesha.Authorization.Roles
{
    public class RoleManager : AbpRoleManager<Role, User>
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Role> _roleRepository;
        public RoleManager(
            RoleStore store,
            IEnumerable<IRoleValidator<Role>> roleValidators,
            ILookupNormalizer keyNormalizer,
            IdentityErrorDescriber errors,
            ILogger<AbpRoleManager<Role, User>> logger,
            IPermissionManager permissionManager,
            ICacheManager cacheManager,
            IUnitOfWorkManager unitOfWorkManager,
            IRoleManagementConfig roleManagementConfig,
            IRepository<OrganizationUnit, long> organizationUnitRepository,
            IRepository<OrganizationUnitRole, long> organizationUnitRoleRepository,
            IRepository<Role> roleRepository)
            : base(
                  store,
                  roleValidators,
                  keyNormalizer,
                  errors, logger,
                  permissionManager,
                  cacheManager,
                  unitOfWorkManager,
                  roleManagementConfig,
                organizationUnitRepository,
                organizationUnitRoleRepository)
        {
            _unitOfWorkManager = unitOfWorkManager;
            _roleRepository = roleRepository;
        }

        public override async Task<IdentityResult> CheckDuplicateRoleNameAsync(int? expectedRoleId, string name, string displayName)
        {
            try
            {
                // note: have to use _roleRepository Instead of AbpStore.Roles just to not include unneeded NH dependency
                var duplicate = await _roleRepository.FirstOrDefaultAsync(r => r.Name == name && r.Id != expectedRoleId);
                if (duplicate != null)
                {
                    throw new UserFriendlyException(string.Format(L("RoleNameIsAlreadyTaken"), name));
                }

                if (!string.IsNullOrWhiteSpace(displayName))
                {
                    duplicate = await _roleRepository.FirstOrDefaultAsync(u => u.DisplayName == displayName && u.Id != expectedRoleId);
                    if (duplicate != null)
                    {
                        throw new UserFriendlyException(string.Format(L("RoleDisplayNameIsAlreadyTaken"), displayName));
                    }
                }
                return IdentityResult.Success;
            }
            catch
            {
                throw;
            }
        }


        /// <summary>
        /// Gets a role by given name.
        /// Throws exception if no role with given roleName.
        /// </summary>
        /// <param name="roleName">Role name</param>
        /// <returns>Role</returns>
        /// <exception cref="AbpException">Throws exception if no role with given roleName</exception>
        public override Role GetRoleByName(string roleName)
        {
            var role = AbpStore.FindByName(roleName.ToUpperInvariant()/* note: workaround to fix ABP bug */);
            if (role == null)
            {
                throw new AbpException("There is no role with name: " + roleName);
            }

            return role;
        }
    }
}
