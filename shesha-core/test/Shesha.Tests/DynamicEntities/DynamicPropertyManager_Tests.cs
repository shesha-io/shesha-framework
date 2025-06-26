using Abp.Domain.Repositories;
using Moq;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Dtos;
using Shesha.Metadata;
using Shesha.Reflection;
using Shesha.Services;
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
    public class DynamicPropertyManager_Tests : SheshaNhTestBase
    {
        private readonly IRepository<EntityPropertyValue, Guid> _propertyValueRepo;
        private readonly IRepository<EntityProperty, Guid> _propertyRepo;

        public DynamicPropertyManager_Tests(SqlServerFixture fixture) : base(fixture)
        {
            _propertyValueRepo = Resolve<IRepository<EntityPropertyValue, Guid>>();
            _propertyRepo = Resolve<IRepository<EntityProperty, Guid>>();
        }

        [Fact]
        public async Task SaveLoad_TestAsync()
        {
            LoginAsHostAdmin();

            // test data
            var props = new Dictionary<EntityPropertyDto, object>
                {
                    {new EntityPropertyDto
                    {
                        Name = "UnitTestDynamicString", DataType = DataTypes.String, Source = MetadataSourceType.UserDefined
                    }, "testString"},
                    {new EntityPropertyDto
                    {
                        Name = "UnitTestDynamicDate", DataType = DataTypes.Date, Source = MetadataSourceType.UserDefined
                    }, DateTime.Today},
                    {new EntityPropertyDto
                    {
                        Name = "UnitTestDynamicDateTime", DataType = DataTypes.DateTime, Source = MetadataSourceType.UserDefined
                    }, DateTime.Now},
                    {new EntityPropertyDto
                    {
                        Name = "UnitTestDynamicBoolean", DataType = DataTypes.Boolean, Source = MetadataSourceType.UserDefined
                    }, true},
                    {new EntityPropertyDto
                    {
                        Name = "UnitTestDynamicNumber", DataType = DataTypes.Number, Source = MetadataSourceType.UserDefined
                    }, (decimal) 123.45},
                    {
                        new EntityPropertyDto
                        {
                            Name = "UnitTestDynamicObject", DataType = DataTypes.Object, Source = MetadataSourceType.UserDefined,
                            Properties = new List<EntityPropertyDto>()
                            {
                                new EntityPropertyDto {Name = "UnitTestObjectProperty1", DataType = DataTypes.String, Source = MetadataSourceType.UserDefined},
                                new EntityPropertyDto {Name = "UnitTestObjectProperty2", DataType = DataTypes.String, Source = MetadataSourceType.UserDefined}
                            }
                        },
                        new {UnitTestObjectProperty1 = "testObjectProperty1", UnitTestObjectProperty2 = "testObjectProperty2"}
                    }
                };

            // configure DTO
            var entityConfigCacheMock = new Mock<IEntityConfigCache>();
            entityConfigCacheMock.Setup(x => x.GetEntityPropertiesAsync(It.IsAny<Type>()))
                .Returns(() =>
                {
                    var result = new List<EntityPropertyDto>();
                    foreach (var prop in props)
                    {
                        result.Add(prop.Key);
                    }
                    return Task.FromResult<List<EntityPropertyDto>?>(result);
                });

            var entityConfigStore = Resolve<IEntityConfigurationStore>();
            var fullProxyCacheHolder = Resolve<IFullProxyCacheHolder>();
            var dynamicTypeCacheHolder = Resolve<IDynamicTypeCacheHolder>();
            var builder = new DynamicDtoTypeBuilder(entityConfigCacheMock.Object, entityConfigStore, fullProxyCacheHolder, dynamicTypeCacheHolder);
            var baseDtoType = typeof(DynamicDto<Person, Guid>);
            var context = new DynamicDtoTypeBuildingContext() { ModelType = baseDtoType };
            var dtoType = await builder.BuildDtoFullProxyTypeAsync(baseDtoType, context);
            var dto = Activator.CreateInstance(dtoType) as DynamicDto<Person, Guid>;
            dto.ShouldNotBeNull();

            var properties = dto.GetType().GetProperties();

            var serializationManager = Resolve<ISerializationManager>();

            // Update DTO properties values with test data
            foreach (var prop in props)
            {
                var p = properties.Single(x => prop.Key.Name.ToLower() == x.Name.ToLower());
                var val = prop.Value;
                if (prop.Key.DataType == DataTypes.Object)
                {
                    val = serializationManager.DeserializeProperty(p.PropertyType, serializationManager.SerializeProperty(prop.Key, val));
                }
                p.SetValue(dto, val);
            }

            using (var uow = NewNhUnitOfWork())
            {
#pragma warning disable IDISP001 // Dispose created
                var session = uow.GetSession();
#pragma warning restore IDISP001 // Dispose created

                // Create temporary Entity Properties configs
                var entityConfigRepo = Resolve<IRepository<EntityConfig, Guid>>();
                var entityPropRepo = Resolve<IRepository<EntityProperty, Guid>>();
                var config = entityConfigRepo.GetAll().First(x => x.TypeShortAlias == typeof(Person).GetEntityConfiguration().TypeShortAlias);
                foreach (var prop in props)
                {
                    var propConf = new EntityProperty()
                    {
                        EntityConfig = config,
                        Name = prop.Key.Name,
                        DataType = prop.Key.DataType,
                        Source = MetadataSourceType.UserDefined
                    };
                    prop.Key.Id = (await entityPropRepo.InsertAsync(propConf)).Id;
                    foreach (var childProp in prop.Key.Properties)
                    {
                        var childPropConf = new EntityProperty()
                        {
                            ParentProperty = propConf,
                            EntityConfig = config,
                            Name = childProp.Name,
                            DataType = childProp.DataType,
                            Source = MetadataSourceType.UserDefined
                        };
                        childProp.Id = (await entityPropRepo.InsertAsync(childPropConf)).Id;
                    }
                }

                session.Flush();

                try
                {
                    var personRepo = Resolve<IRepository<Person, Guid>>();
                    var dynamicPropertyManager = new DynamicPropertyManager(
                        Resolve<IRepository<EntityProperty, Guid>>(),
                        Resolve<IRepository<EntityPropertyValue, Guid>>(),
                        Resolve<IEntityConfigurationStore>(),
                        Resolve<IDynamicRepository>()
                        )
                    { DtoTypeBuilder = builder, SerializationManager = serializationManager };

                    // Create temporary entity
                    var entity = new Person();
                    var id = (await personRepo.InsertAsync(entity)).Id;
                    try
                    {
                        // Save dynamic properties to DB
                        await dynamicPropertyManager.MapDtoToEntityAsync<DynamicDto<Person, Guid>, Person, Guid>(dto,
                            entity);
                        session.Flush();

                        session.Clear();

                        // Get entity from DB
                        var newEntity = await personRepo.GetAsync(id);

                        // Create new DTO and map values from entity to DTO
                        var newDto = Activator.CreateInstance(dtoType) as DynamicDto<Person, Guid>;
                        newDto.ShouldNotBeNull();
                        await dynamicPropertyManager.MapEntityToDtoAsync<DynamicDto<Person, Guid>, Person, Guid>(newEntity, newDto);

                        // Check values. Values from the DB should be the same as from the test list
                        var newProperties = newDto?.GetType().GetProperties();
                        foreach (var prop in props)
                        {
                            var p = newProperties?.FirstOrDefault(x => prop.Key.Name.ToLower() == x.Name.ToLower());
                            var dtoValue = p?.GetValue(newDto);
                            if (prop.Key.DataType == DataTypes.Object)
                            {
                                var childProperties = dtoValue.NotNull().GetType().GetProperties();
                                foreach (var childProp in prop.Key.Properties)
                                {
                                    var childP = childProperties.First(x => childProp.Name.ToLower() == x.Name.ToLower());
                                    var dtoChildValue = childP.GetValue(dtoValue);
                                    dtoChildValue.ShouldBe(prop.Value.NotNull().GetType().GetRequiredProperty(childProp.Name).GetValue(prop.Value));
                                }
                            }
                            else
                            {
                                dtoValue.ShouldBe(prop.Value);
                            }
                        }
                    }
                    finally
                    {
                        // delete temporary entity
                        session.CreateSQLQuery($"delete from Core_Persons where id = '{id}'").ExecuteUpdate();
                    }
                }
                finally
                {
                    var propertyRepo = Resolve<IRepository<EntityPropertyValue, Guid>>();
                    // delete temporary values and properties configs
                    foreach (var prop in props)
                    {
                        await DeletePropertyAsync(prop.Key);
                    }
                }
            }
        }

        private async Task DeletePropertyAsync(EntityPropertyDto dto) 
        {
            await _propertyValueRepo.HardDeleteAsync(e => e.EntityProperty != null && e.EntityProperty.Id == dto.Id);
            if (dto.DataType == DataTypes.Object)
            {
                foreach (var childProp in dto.Properties)
                    await DeletePropertyAsync(childProp);
            }

            await _propertyRepo.HardDeleteAsync(e => e.Id == dto.Id);
        }
    }
}
