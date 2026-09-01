using System;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using Shesha.Authorization;
using Shesha.Authorization.Users;
using Shesha.AutoMapper.Dto;

namespace Shesha.CacheTests.Host.TestTargets
{
    /// <summary>
    /// Grants every permission to the "admin" user.
    ///
    /// The suite authenticates as admin and calls endpoints guarded by the Maintenance permission
    /// (Settings/UpdateValue, PermissionedObject/*). Those calls used to succeed only because the
    /// functional-test application shipped its own ICustomPermissionChecker doing exactly this, and
    /// this host inherited it by referencing that application. Dropping the reference dropped the
    /// grant with it, so the rig carries its own.
    ///
    /// TEST HOST ONLY. It never ships: a blanket grant is appropriate for a throwaway rig whose
    /// whole job is exercising cache coherence, and nowhere else.
    /// </summary>
    public class CacheTestsPermissionChecker : ICustomPermissionChecker
    {
        private const string AdminUserName = "admin";

        private readonly IRepository<User, long> _userRepository;

        public CacheTestsPermissionChecker(IRepository<User, long> userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> IsGrantedAsync(long userId, string permissionName) =>
            await IsAdminAsync(userId);

        public bool IsGranted(long userId, string permissionName) =>
            IsAdmin(userId);

        public async Task<bool> IsGrantedAsync(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity) =>
            await IsAdminAsync(userId);

        public bool IsGranted(long userId, string permissionName, EntityReferenceDto<string> permissionedEntity) =>
            IsAdmin(userId);

        private async Task<bool> IsAdminAsync(long userId)
        {
            var user = await _userRepository.FirstOrDefaultAsync(userId);
            return IsAdmin(user);
        }

        private bool IsAdmin(long userId) => IsAdmin(_userRepository.FirstOrDefault(userId));

        private static bool IsAdmin(User? user) =>
            user != null && string.Equals(user.UserName, AdminUserName, StringComparison.OrdinalIgnoreCase);
    }
}
