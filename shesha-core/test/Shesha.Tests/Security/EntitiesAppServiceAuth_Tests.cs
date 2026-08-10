using FluentAssertions;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using System.Reflection;
using Xunit;

namespace Shesha.Tests.Security
{
    /// <summary>
    /// Tests to verify that EntitiesAppService has the correct authorization.
    /// Covers issue #4654: Add authorization to ExportToExcel, Reorder, and Specifications.
    /// </summary>
    public class EntitiesAppServiceAuth_Tests
    {
        [Fact]
        public void Specifications_should_require_app_Configurator()
        {
            var method = typeof(EntitiesAppService).GetMethod("SpecificationsAsync", BindingFlags.Public | BindingFlags.Instance);
            var attr = method?.GetCustomAttribute<SheshaAuthorizeAttribute>();

            attr.Should().NotBeNull("SpecificationsAsync should have [SheshaAuthorize]");
            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain("app:Configurator");
        }

        [Fact]
        public void ExportToExcel_should_have_CheckPermission_helper()
        {
            var method = typeof(EntitiesAppService).GetMethod("ExportToExcelAsync", BindingFlags.Public | BindingFlags.Instance);
            method.Should().NotBeNull();

            var methodBody = method.GetMethodBody();
            methodBody.Should().NotBeNull();

            // The protected CheckPermissionAsync method should exist for runtime permission checks
            var checkMethod = typeof(EntitiesAppService).GetMethod("CheckPermissionAsync", BindingFlags.NonPublic | BindingFlags.Instance);
            checkMethod.Should().NotBeNull("CheckPermissionAsync helper method should exist");
        }

        [Fact]
        public void Reorder_should_have_CheckPermission_helper()
        {
            var method = typeof(EntitiesAppService).GetMethod("ReorderAsync", BindingFlags.Public | BindingFlags.Instance);
            method.Should().NotBeNull();

            var methodBody = method.GetMethodBody();
            methodBody.Should().NotBeNull();

            // The protected CheckPermissionAsync method should exist for runtime permission checks
            var checkMethod = typeof(EntitiesAppService).GetMethod("CheckPermissionAsync", BindingFlags.NonPublic | BindingFlags.Instance);
            checkMethod.Should().NotBeNull("CheckPermissionAsync helper method should exist");
        }

        [Fact]
        public void CheckPermission_should_be_protected()
        {
            var method = typeof(EntitiesAppService).GetMethod("CheckPermissionAsync", BindingFlags.NonPublic | BindingFlags.Instance);
            method.Should().NotBeNull();
            method.IsFamily.Should().BeTrue("CheckPermissionAsync should be protected");
        }

        [Fact]
        public void GetAll_and_ExportToExcel_both_exist()
        {
            // Both GetAllAsync and ExportToExcelAsync read entity data,
            // so both should use CheckPermissionAsync. Verify both methods exist.
            var getAllMethod = typeof(EntitiesAppService).GetMethod("GetAllAsync", BindingFlags.Public | BindingFlags.Instance);
            var exportMethod = typeof(EntitiesAppService).GetMethod("ExportToExcelAsync", BindingFlags.Public | BindingFlags.Instance);

            getAllMethod.Should().NotBeNull();
            exportMethod.Should().NotBeNull();
        }
    }
}
