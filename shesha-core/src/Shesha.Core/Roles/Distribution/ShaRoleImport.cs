using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Roles.Distribution.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class ShaRoleImport : ConfigurationItemImportBase<ShaRole, ShaRoleRevision, DistributedShaRole>, IShaRoleImport, ITransientDependency
    {
        private readonly IRepository<ShaRolePermission, Guid> _rolePermissionRepo;
        public string ItemType => ShaRole.ItemTypeName;

        public ShaRoleImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<ShaRole, Guid> repository,
            IRepository<ShaRoleRevision, Guid> revisionRepository,
            IRepository<ShaRolePermission, Guid> rolePermissionRepo
        ) : base (repository, revisionRepository, moduleRepo, frontEndAppRepo)
        {
            _rolePermissionRepo = rolePermissionRepo;
        }

        private async Task ImportPermissionsAsync(ShaRole item, ShaRoleRevision revision, DistributedShaRole distributedItem) 
        {
            // TODO_V1: implement add/remove/update
            foreach (var perm in distributedItem.Permissions)
            {
                await _rolePermissionRepo.InsertAsync(new ShaRolePermission()
                {
                    RoleRevision = revision,
                    Permission = perm.Permission,
                    IsGranted = perm.IsGranted,
                });
            }
        }

        protected override async Task<bool> CustomPropsAreEqualAsync(ShaRole item, ShaRoleRevision revision, DistributedShaRole distributedItem)
        {
            var equals = revision.NameSpace == distributedItem.NameSpace &&
                revision.HardLinkToApplication == distributedItem.HardLinkToApplication;

            if (!equals)
                return false;

            return await PermissionsAreEqualAsync(revision, distributedItem);
        }

        private Task<bool> PermissionsAreEqualAsync(ShaRoleRevision revision, DistributedShaRole distributedItem)
        {
            // TODO_V1: implement permissions comparison
            throw new NotImplementedException();
        }

        protected override async Task MapCustomPropsToItemAsync(ShaRole item, ShaRoleRevision revision, DistributedShaRole distributedItem)
        {
            revision.NameSpace = distributedItem.NameSpace;
            revision.SetHardLinkToApplication(distributedItem.HardLinkToApplication);

            await ImportPermissionsAsync(item, revision, distributedItem);
        }
    }
}