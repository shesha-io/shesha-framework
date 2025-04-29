using Moq;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Dtos;
using Shesha.Metadata;
using Shesha.Tests.DynamicEntities.Dtos;
using Shesha.Tests.Fixtures;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.DynamicEntities
{
    [Collection(SqlServerCollection.Name)]
    public class DynamicDto_Tests : SheshaNhTestBase
    {
        public DynamicDto_Tests(SqlServerFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task BuildFullDynamicDto_TestAsync()
        {
            var entityConfigCacheMock = new Mock<IEntityConfigCache>();
            
            entityConfigCacheMock.Setup(x => x.GetEntityPropertiesAsync(It.IsAny<Type>()))
                .Returns(() => {
                    var result = new EntityPropertyDtoList();
                    result.AddString("Name", "Name...");
                    result.AddString("Description", "Description...");
                    

                    var r = result as List<EntityPropertyDto>;
                    return Task.FromResult<List<EntityPropertyDto>?>(r);
                });

            var entityConfigStore = LocalIocManager.Resolve<IEntityConfigurationStore>();
            var fullProxyCacheHolder = LocalIocManager.Resolve<IFullProxyCacheHolder>();
            var dynamicTypeCacheHolder = LocalIocManager.Resolve<IDynamicTypeCacheHolder>();

            var builder = new DynamicDtoTypeBuilder(entityConfigCacheMock.Object, entityConfigStore, fullProxyCacheHolder, dynamicTypeCacheHolder);

            var baseDtoType = typeof(DynamicDto<Person, Guid>);

            var context = new DynamicDtoTypeBuildingContext() { 
                ModelType = baseDtoType,
                AddFormFieldsProperty = true,
            };
            var proxyType = await builder.BuildDtoFullProxyTypeAsync(baseDtoType, context);

            var properties = proxyType.GetProperties();

            properties.ShouldContain(p => p.Name == "Name");
            properties.ShouldContain(p => p.Name == "Description");
            properties.ShouldContain(p => p.Name == nameof(IHasFormFieldsList._formFields));

            proxyType.ShouldNotBeAssignableTo(typeof(IHasFormFieldsList));
        }

        [Fact]
        public async Task BuildFullDynamicDto_HasNoSideEffect_TestAsync() 
        {
            var entityConfigCacheMock = new Mock<IEntityConfigCache>();

            entityConfigCacheMock.Setup(x => x.GetEntityPropertiesAsync(It.IsAny<Type>()))
                .Returns(() => {
                    var result = new EntityPropertyDtoList();
                    var r = result as List<EntityPropertyDto>;
                    return Task.FromResult<List<EntityPropertyDto>?>(r);
                });

            var entityConfigStore = LocalIocManager.Resolve<IEntityConfigurationStore>();
            var fullProxyCacheHolder = LocalIocManager.Resolve<IFullProxyCacheHolder>();
            var dynamicTypeCacheHolder = LocalIocManager.Resolve<IDynamicTypeCacheHolder>();

            var builder = new DynamicDtoTypeBuilder(entityConfigCacheMock.Object, entityConfigStore, fullProxyCacheHolder, dynamicTypeCacheHolder);

            var baseDtoType = typeof(DynamicDto<Person, Guid>);

            var proxyType1 = await builder.BuildDtoFullProxyTypeAsync(baseDtoType, new DynamicDtoTypeBuildingContext()
            {
                ModelType = baseDtoType,
                AddFormFieldsProperty = true,
            });

            var proxyType2 = await builder.BuildDtoFullProxyTypeAsync(baseDtoType, new DynamicDtoTypeBuildingContext()
            {
                ModelType = baseDtoType,
                AddFormFieldsProperty = false,
            });

            proxyType1.GetProperties().ShouldContain(p => p.Name == nameof(IHasFormFieldsList._formFields));
            proxyType2.GetProperties().ShouldNotContain(p => p.Name == nameof(IHasFormFieldsList._formFields), $"Check internal cache in the '{nameof(DynamicDtoTypeBuilder)}'. Looks like property `{nameof(IHasFormFieldsList._formFields)}` exists in the result type because of caching");
        }

        [Fact]
        public async Task BuildDynamicDto_TestAsync()
        {
            var entityConfigCacheMock = new Mock<IEntityConfigCache>();

            const string supervisorPropName = "Supervisor";
            const string supervisorFirstNamePropName = "FirstName";
            const string supervisorLastNamePropName = "LastName";

            entityConfigCacheMock.Setup(x => x.GetEntityPropertiesAsync(It.IsAny<Type>()))
                .Returns(() => {
                    var result = new EntityPropertyDtoList();
                    result.AddString("Name", "Name...");
                    result.AddString("Description", "Description...");

                    var nested = new EntityPropertyDto { 
                        Name = supervisorPropName,
                        DataType = DataTypes.Object,
                        Properties = new List<EntityPropertyDto>(),
                    };
                    nested.Properties.Add(new EntityPropertyDto { Name = supervisorFirstNamePropName, DataType = DataTypes.String });
                    nested.Properties.Add(new EntityPropertyDto { Name = supervisorLastNamePropName, DataType = DataTypes.String });

                    result.Add(nested);


                    var r = result as List<EntityPropertyDto>;
                    return Task.FromResult<List<EntityPropertyDto>?>(r);
                });

            var entityConfigStore = LocalIocManager.Resolve<IEntityConfigurationStore>();
            var fullProxyCacheHolder = LocalIocManager.Resolve<IFullProxyCacheHolder>();
            var dynamicTypeCacheHolder = LocalIocManager.Resolve<IDynamicTypeCacheHolder>();

            var builder = new DynamicDtoTypeBuilder(entityConfigCacheMock.Object, entityConfigStore, fullProxyCacheHolder, dynamicTypeCacheHolder);

            var baseDtoType = typeof(DynamicDto<Person, Guid>);

            var context = new DynamicDtoTypeBuildingContext() { 
                ModelType = baseDtoType,
                // AddFormFieldsProperty = false // note: false is a default value for AddFormFieldsProperty. Leave it blank to test default value 
            };
            var proxyType = await builder.BuildDtoFullProxyTypeAsync(baseDtoType, context);

            proxyType.Assembly.IsDynamic.ShouldBeTrue();

            var properties = proxyType.GetProperties();

            properties.ShouldContain(p => p.Name == "Name");
            properties.ShouldContain(p => p.Name == "Description");
            properties.ShouldNotContain(p => p.Name == nameof(IHasFormFieldsList._formFields));
            proxyType.ShouldNotBeAssignableTo(typeof(IHasFormFieldsList));

            var supervisorProp = properties.FirstOrDefault(p => p.Name == supervisorPropName);
            supervisorProp.ShouldNotBeNull($"{supervisorPropName} property is missing in the created DTO");

            // nested object should be dynamic
            supervisorProp.PropertyType.Assembly.IsDynamic.ShouldBeTrue();
            typeof(IDynamicNestedObject).IsAssignableFrom(supervisorProp.PropertyType).ShouldBeTrue($"Dynamic nested object must implement {nameof(IDynamicNestedObject)}");

            var nestedProperties = supervisorProp.PropertyType.GetProperties();
            nestedProperties.ShouldContain(p => p.Name == supervisorFirstNamePropName);
            nestedProperties.ShouldContain(p => p.Name == supervisorLastNamePropName);
        }
    }
}