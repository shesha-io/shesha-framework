using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Permissions;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Permissions
{
    public class PermissionedObjectSetPermissions_Tests : SheshaNhTestBase
    {
        private readonly IUnitOfWorkManager _uowManager;
        private readonly IRepository<PermissionedObject, Guid> _repository;
        private readonly IPermissionedObjectManager _manager;

        public PermissionedObjectSetPermissions_Tests()
        {
            _uowManager = Resolve<IUnitOfWorkManager>();
            _repository = Resolve<IRepository<PermissionedObject, Guid>>();
            _manager = Resolve<IPermissionedObjectManager>();
        }

        [Fact]
        public async Task SetPermissions_ShouldNotChange_HardcodedObject_TestAsync()
        {
            var objectName = $"MyModule.Services.HardcodedAppService@Create_{Guid.NewGuid():N}";
            await InsertAsync(objectName, hardcoded: true, RefListPermissionedAccess.RequiresPermissions, "app:Administer");

            try
            {
                using (var uow = _uowManager.Begin())
                {
                    await _manager.SetPermissionsAsync(objectName, RefListPermissionedAccess.AllowAnonymous, new List<string>());
                    await uow.CompleteAsync();
                }

                var row = await GetRowAsync(objectName);
                row.Access.ShouldBe(RefListPermissionedAccess.RequiresPermissions, "Access of a hardcoded object must not be changed at runtime");
                row.Permissions.ShouldBe("app:Administer");
            }
            finally
            {
                await DeleteAsync(objectName);
            }
        }

        [Fact]
        public async Task SetPermissions_ShouldChange_ConfigurableObject_TestAsync()
        {
            var objectName = $"MyModule.Services.ConfigurableAppService@Create_{Guid.NewGuid():N}";
            await InsertAsync(objectName, hardcoded: false, RefListPermissionedAccess.RequiresPermissions, "app:Administer");

            try
            {
                using (var uow = _uowManager.Begin())
                {
                    await _manager.SetPermissionsAsync(objectName, RefListPermissionedAccess.AnyAuthenticated, new List<string>());
                    await uow.CompleteAsync();
                }

                var row = await GetRowAsync(objectName);
                row.Access.ShouldBe(RefListPermissionedAccess.AnyAuthenticated);
            }
            finally
            {
                await DeleteAsync(objectName);
            }
        }

        private async Task InsertAsync(string objectName, bool hardcoded, RefListPermissionedAccess access, string permissions)
        {
            using (var uow = _uowManager.Begin())
            {
                await _repository.InsertAsync(new PermissionedObject
                {
                    Object = objectName,
                    Name = objectName,
                    Type = ShaPermissionedObjectsTypes.WebApiAction,
                    Access = access,
                    Permissions = permissions,
                    Hardcoded = hardcoded,
                });
                await uow.CompleteAsync();
            }
        }

        private async Task<PermissionedObject> GetRowAsync(string objectName)
        {
            using (var uow = _uowManager.Begin())
            {
                var row = _repository.GetAll().First(x => x.Object == objectName);
                await uow.CompleteAsync();
                return row;
            }
        }

        private async Task DeleteAsync(string objectName)
        {
            using (var uow = _uowManager.Begin())
            {
                await _repository.HardDeleteAsync(x => x.Object == objectName);
                await uow.CompleteAsync();
            }
        }
    }
}
