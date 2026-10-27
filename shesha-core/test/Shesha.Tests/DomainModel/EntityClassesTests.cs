using Shesha.Testing.Fixtures;
using Shouldly;
using System.Linq;
using System.Reflection;
using System.Text;
using Xunit;

namespace Shesha.Tests.DomainModel
{
    [Collection(SqlServerCollection.Name)]
    public class EntityClassesTests : SheshaNhTestBase
    {
        public EntityClassesTests(SqlServerFixture fixture) : base(fixture)
        {
        }
        
        [Fact]
        public void EntityProperties_ShouldBeVirtual()
        {
            var types = EntityTestsHelper.GetEntityTypesWithoutIgnored();
            var sb = new StringBuilder();
            foreach (var type in types)
            {
                if (!string.IsNullOrWhiteSpace(type.FullName) && type.FullName.StartsWith("Abp."))
                    continue;

                var properties = type.GetProperties(BindingFlags.DeclaredOnly | BindingFlags.GetProperty | BindingFlags.Public | BindingFlags.Instance);
                var nonVirtual = properties.Where(p => !IsExplicitlyVirtual(p)).ToList();
                if (nonVirtual.Any())
                {
                    sb.AppendLine(type.FullName);
                    foreach (var property in nonVirtual)
                        sb.AppendLine($"    {property.Name}");
                }
            }

            sb.Length.ShouldBe(0, "Found non virtual properties in entity classes: \r\n\r\n" + sb.ToString());
        }

        public static bool IsExplicitlyVirtual(PropertyInfo property)
        {
            var accessor = property.GetGetMethod(true) ?? property.GetSetMethod(true);

            // True only if:
            // 1. IsVirtual is true
            // 2. Not an interface implementation
            // 3. Not from a proxy class
            // 4. Not an override
            return accessor != null &&
                   accessor.IsVirtual &&
                   !accessor.IsFinal /*&&
                   accessor.GetBaseDefinition().DeclaringType == property.DeclaringType*/;
        }
    }
}
