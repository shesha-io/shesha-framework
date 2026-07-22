using Abp.Domain.Uow;
using NSubstitute;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Cache;
using Shesha.GraphQL.Provider.GraphTypes;
using Xunit;

namespace Shesha.Tests.GraphQL
{
    /// <summary>
    /// Tests for issue #4774: properties decorated with [JsonIgnore]
    /// (Newtonsoft or System.Text.Json) must not be exposed as GraphQL fields,
    /// otherwise sensitive data (e.g. password hashes) can leak through the
    /// GraphQL endpoint.
    /// </summary>
    public class JsonIgnoreFiltering_Tests
    {
        public class SampleModel
        {
            public virtual string Name { get; set; }
            public virtual string Visible { get; set; }

            [Newtonsoft.Json.JsonIgnore]
            public virtual string SecretNewtonsoft { get; set; }

            [System.Text.Json.Serialization.JsonIgnore]
            public virtual string SecretSystemTextJson { get; set; }
        }

        [Fact]
        public void GraphQLGenericType_ShouldExclude_JsonIgnoreProperties()
        {
            var dynamicPropertyManager = Substitute.For<IDynamicPropertyManager>();
            var entityConfigCache = Substitute.For<IEntityConfigCache>();
            var dynamicDtoTypeBuilder = Substitute.For<IDynamicDtoTypeBuilder>();
            var unitOfWorkManager = Substitute.For<IUnitOfWorkManager>();

            var graphType = new GraphQLGenericType<SampleModel>(
                dynamicPropertyManager,
                entityConfigCache,
                dynamicDtoTypeBuilder,
                unitOfWorkManager);

            Assert.True(graphType.HasField(nameof(SampleModel.Name)));
            Assert.True(graphType.HasField(nameof(SampleModel.Visible)));
            Assert.False(graphType.HasField(nameof(SampleModel.SecretNewtonsoft)));
            Assert.False(graphType.HasField(nameof(SampleModel.SecretSystemTextJson)));
        }

        [Fact]
        public void GraphQLInputGenericType_ShouldExclude_JsonIgnoreProperties()
        {
            var inputType = new GraphQLInputGenericType<SampleModel>();

            Assert.True(inputType.HasField(nameof(SampleModel.Name)));
            Assert.True(inputType.HasField(nameof(SampleModel.Visible)));
            Assert.False(inputType.HasField(nameof(SampleModel.SecretNewtonsoft)));
            Assert.False(inputType.HasField(nameof(SampleModel.SecretSystemTextJson)));
        }
    }
}
