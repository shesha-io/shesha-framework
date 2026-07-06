using NSubstitute;
using Shesha.Configuration.Runtime;
using Shesha.Generators;
using Shesha.Metadata;
using System.Linq;
using Xunit;

namespace Shesha.Tests.Metadata
{
    /// <summary>
    /// Unit tests for <see cref="HardcodeMetadataProvider"/>. Constructs the
    /// provider directly with a mocked <see cref="IEntityTypeConfigurationStore"/>
    /// so the test does not require the full ABP/NHibernate harness.
    /// </summary>
    public class HardcodeMetadataProvider_Tests
    {
        // Issue #4774: properties decorated with [JsonIgnore] (Newtonsoft or
        // System.Text.Json) must not appear in generated metadata, otherwise
        // they remain reachable via dynamic LINQ sorting / property projection
        // on Dynamic CRUD endpoints.
        [Fact]
        public void GetProperties_ShouldExclude_JsonIgnoreProperties()
        {
            var entityConfigurationStore = Substitute.For<IEntityTypeConfigurationStore>();
            var nameGenerator = Substitute.For<INameGenerator>();
            var provider = new HardcodeMetadataProvider(entityConfigurationStore, nameGenerator);

            var properties = provider.GetProperties(typeof(EntityWithJsonIgnoreProps));
            var paths = properties.Select(p => p.Path).ToList();

            Assert.Contains(nameof(EntityWithJsonIgnoreProps.Name), paths);
            Assert.Contains(nameof(EntityWithJsonIgnoreProps.Visible), paths);
            Assert.DoesNotContain(nameof(EntityWithJsonIgnoreProps.SecretNewtonsoft), paths);
            Assert.DoesNotContain(nameof(EntityWithJsonIgnoreProps.SecretSystemTextJson), paths);
        }
    }
}
