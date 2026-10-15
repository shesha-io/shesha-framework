using Abp.Authorization;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Permissions.Entity;
using System;
using System.Reflection;
using Xunit;

namespace Shesha.Tests.Security
{
    /// <summary>
    /// Issue #4774: dynamic LINQ sorting must not allow ordering by properties
    /// marked with [JsonIgnore], otherwise an authenticated user can observe
    /// the ordering of sensitive fields (e.g. password hashes) reachable via
    /// navigation properties — the JsonIgnore filter on metadata/GraphQL types
    /// alone does not cover the sort path.
    /// </summary>
    public class SortingValidator_Tests
    {
        public class SampleNested
        {
            public virtual string Visible { get; set; }

            [Newtonsoft.Json.JsonIgnore]
            public virtual string SecretNewtonsoft { get; set; }

            [System.Text.Json.Serialization.JsonIgnore]
            public virtual string SecretSystemTextJson { get; set; }

            [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, "test")]
            public virtual SampleNested AuthNested { get; set; }

        }

        public class SampleEntity
        {
            public virtual string Name { get; set; }
            public virtual SampleNested Child { get; set; }

            [Newtonsoft.Json.JsonIgnore]
            public virtual SampleNested Hidden { get; set; }
            
            [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, ["test"])]
            public virtual SampleNested Auth { get; set; }
        }

        public class PermissionedEntityProviderMock : IPermissionedEntityProvider
        {
            public PermissionedEntityProviderMock(string allowedPermission)
            {
                _allowedPermission = allowedPermission;
            }

            private string _allowedPermission;

            public T GetPermissionedEntity<T>(T entity) where T : notnull
            {
                throw new NotImplementedException();
            }

            public T GetPermissionedEntityOrEntity<T>(T entity) where T : notnull
            {
                throw new NotImplementedException();
            }

            public bool IsEntityTypePermissioned<T>(T entity) where T : notnull
            {
                throw new NotImplementedException();
            }

            public bool IsPropertyGranted(PropertyInfo propertyInfo)
            {
                var permission = propertyInfo.GetCustomAttribute<SheshaAuthorizeAttribute>()?.Permissions[0];
                return permission == null || permission == _allowedPermission;
            }
        }

        [Theory]
        [InlineData("Auth")]
        [InlineData("Auth desc")]
        [InlineData("Auth.Visible")]
        [InlineData("Child.AuthNested")]
        [InlineData("Name asc, Auth desc")]
        public void EnsureSortingAllowed_AllowPermissioned(string sorting)
        {
            SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), sorting, new PermissionedEntityProviderMock("test"));
        }

        [Theory]
        [InlineData("Auth")]
        [InlineData("Auth desc")]
        [InlineData("Auth.Visible")]
        [InlineData("Child.AuthNested")]
        [InlineData("Name asc, Auth desc")]
        public void EnsureSortingAllowed_RejectsPermissioned(string sorting)
        {
            Assert.Throws<AbpAuthorizationException>(() =>
                SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), sorting, new PermissionedEntityProviderMock("")));
        }

        [Theory]
        [InlineData("Name")]
        [InlineData("Name asc")]
        [InlineData("Name desc")]
        [InlineData("Name asc, Child.Visible desc")]
        [InlineData("")]
        [InlineData(null)]
        public void EnsureSortingAllowed_AllowsVisibleProperties(string sorting)
        {
            SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), sorting);
        }

        [Theory]
        [InlineData("Hidden")]
        [InlineData("Hidden desc")]
        [InlineData("Hidden.Visible")]
        [InlineData("Name asc, Hidden desc")]
        public void EnsureSortingAllowed_RejectsJsonIgnoreNavigation(string sorting)
        {
            Assert.Throws<ArgumentException>(() =>
                SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), sorting));
        }

        [Theory]
        [InlineData("Child.SecretNewtonsoft")]
        [InlineData("Child.SecretSystemTextJson")]
        [InlineData("Child.SecretNewtonsoft desc")]
        public void EnsureSortingAllowed_RejectsJsonIgnoreLeaf(string sorting)
        {
            Assert.Throws<ArgumentException>(() =>
                SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), sorting));
        }

        [Fact]
        public void EnsureSortingAllowed_IsCaseInsensitive()
        {
            Assert.Throws<ArgumentException>(() =>
                SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), "hidden"));
        }

        [Fact]
        public void EnsureSortingAllowed_IgnoresUnknownProperties()
        {
            // Unknown segments are left for the actual OrderBy call to surface
            // a clearer error — the validator only blocks known-but-hidden fields.
            SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), "DoesNotExist");
        }
    }
}
