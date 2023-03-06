using Abp.Runtime.Caching;
using Abp.TestBase;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Newtonsoft.Json;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Dtos;
using Shesha.Tests.DynamicEntities.Mvc;
using Shouldly;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.DynamicEntities
{
    public class DynamicDtoModelBinder_Tests : AbpIntegratedTestBase<SheshaTestModule>
    {
        [Fact]
        public async Task BindFlatModel_Test()
        {
            var bindingResult = await BindAsync<PersonDynamicDto>("flatModel.json", "flatModel.metadata.json");

            // Assert
            Assert.True(bindingResult.IsModelSet);

            var model = bindingResult.Model;

            var testItems = new Dictionary<string, object>
            {
                { "FirstName", "John" },
                { "LastName", "Doe" },
                { "Title", (int)RefListPersonTitle.Mr },
                { "DynamicDate", new DateTime(2022, 1, 4) },
                { "DynamicDateTime", new DateTime(2021, 4, 8, 21, 15, 10) },
                { "DynamicBool", true },
            };

            foreach (var item in testItems)
            {
                var (prop, value) = GetPropertyAndValue(model, item.Key);
                value.ShouldBe(item.Value);
            }
        }

        [Fact]
        public async Task Bind2NestedLevels_Test()
        {
            var bindingResult = await BindAsync<PersonDynamicDto>("nested2Levels.json", "nested2Levels.metadata.json");

            // Assert
            Assert.True(bindingResult.IsModelSet);

            var model = bindingResult.Model;

            var (level1_Prop, level1_Value) = GetPropertyAndValue(model, "NestedLevel1");
            var (level1_Prop1_Prop, level1_Prop1_Value) = GetPropertyAndValue(level1_Value, "NestedLevel1_Prop1");
            level1_Prop1_Value.ShouldBe("NestedLevel1_Prop1 string value");
        }

        [Fact]
        public async Task Bind3NestedLevels_Test()
        {
            var bindingResult = await BindAsync<PersonDynamicDto>("nested3Levels.json", "nested3Levels.metadata.json");

            // Assert
            Assert.True(bindingResult.IsModelSet);

            var model = bindingResult.Model;

            var (level1_Prop, level1_Value) = GetPropertyAndValue(model, "NestedLevel1");
            var (level1_Prop1_Prop, level1_Prop1_Value) = GetPropertyAndValue(level1_Value, "NestedLevel1_Prop1");
            level1_Prop1_Value.ShouldBe("NestedLevel1_Prop1 string value");

            var (level1_level2_Prop, level1_level2_Value) = GetPropertyAndValue(level1_Value, "NestedLevel2");

            var (level1_level2_Prop1_Prop, level1_level2_Prop1_Value) = GetPropertyAndValue(level1_level2_Value, "NestedLevel2_Prop1");
            level1_level2_Prop1_Value.ShouldBe("NestedLevel2_Prop1 string value");
        }

        [Fact]
        public async Task BindEntityReference_DtoMode_Test()
        {
            var bindingResult = await BindAsync<PersonDynamicDto>("entityReference_DtoMode.json", "entityReference_DtoMode.metadata.json");

            // Assert
            Assert.True(bindingResult.IsModelSet);

            var model = bindingResult.Model;

            var testItems = new Dictionary<string, object>
            {
                { "FirstName", "John" },
                { "LastName", "Doe" },
                { "Title", (int)RefListPersonTitle.Mr },
                { "DynamicDate", new DateTime(2022, 1, 4) },
                { "DynamicDateTime", new DateTime(2021, 4, 8, 21, 15, 10) },
                { "DynamicBool", true },
            };

            foreach (var item in testItems)
            {
                var (prop, value) = GetPropertyAndValue(model, item.Key);
                value.ShouldBe(item.Value);
            }
        }

        #region private methods

        private (PropertyInfo, object) GetPropertyAndValue(object container, string propertyName, bool requireProperty = true, bool requireValue = true)
        {
            var property = container.GetType().GetProperty(propertyName);
            if (requireProperty && property == null)
                property.ShouldNotBeNull($"'{propertyName}' property is missing in the '{container.GetType().FullName}' class");

            var value = property?.GetValue(container);
            if (requireValue && value == null)
                property.ShouldNotBeNull($"'{propertyName}' property must not be null");

            return (property, value);
        }

        private async Task<ModelBindingResult> BindAsync<TModel>(string jsonResourceName, string schemaResourceName)
        {
            // Arrange
            var mockInputFormatter = new Mock<IInputFormatter>();
            mockInputFormatter.Setup(f => f.CanRead(It.IsAny<InputFormatterContext>()))
                .Returns(true)
                .Verifiable();
            mockInputFormatter.Setup(o => o.ReadAsync(It.IsAny<InputFormatterContext>()))
                              .Returns(async (InputFormatterContext context) =>
                              {
                                  var model = await ReadJsonRequestAsync(context.ModelType, jsonResourceName);
                                  return InputFormatterResult.Success(model);
                              })
                              .Verifiable();
            var inputFormatter = mockInputFormatter.Object;

            var bindingContext = GetBindingContext(typeof(TModel));

            var mockDtoBuilder = await GetDtoBuilderAsync(schemaResourceName);

            var binder = CreateBinder(new[] { inputFormatter }, mockDtoBuilder);

            // Act
            await binder.BindModelAsync(bindingContext);

            // Assert
            mockInputFormatter.Verify(v => v.CanRead(It.IsAny<InputFormatterContext>()), Times.Once);
            mockInputFormatter.Verify(v => v.ReadAsync(It.IsAny<InputFormatterContext>()), Times.Once);
            Assert.True(bindingContext.Result.IsModelSet);

            return bindingContext.Result;
        }

        private async Task<object> ReadJsonRequestAsync(Type modelType, string jsonResourceName)
        {
            var content = await GetResourceStringAsync($"{this.GetType().Namespace}.Resources.{jsonResourceName}", this.GetType().Assembly);
            var deserialized = JsonConvert.DeserializeObject(content, modelType);
            return deserialized;
        }

        private async Task<string> GetResourceStringAsync(string resourceName, Assembly assembly)
        {
            using (var stream = assembly.GetManifestResourceStream(resourceName))
            {
                using (var sr = new StreamReader(stream))
                {
                    return await sr.ReadToEndAsync();
                }
            }
        }

        private static DynamicDtoModelBinder CreateBinder(IList<IInputFormatter> formatters, IDynamicDtoTypeBuilder dtoBuilder)
        {
            var options = new MvcOptions();
            var binder = CreateBinder(formatters, options, dtoBuilder);
            //binder.AllowEmptyBody = treatEmptyInputAsDefaultValueOption;

            return binder;
        }

        private static DynamicDtoModelBinder CreateBinder(IList<IInputFormatter> formatters, MvcOptions mvcOptions, IDynamicDtoTypeBuilder dtoBuilder)
        {
            return new DynamicDtoModelBinder(formatters, new TestHttpRequestStreamReaderFactory(), NullLoggerFactory.Instance, mvcOptions, dtoBuilder);
        }

        private static DefaultModelBindingContext GetBindingContext(
            Type modelType,
            HttpContext httpContext = null,
            IModelMetadataProvider metadataProvider = null)
        {
            if (httpContext == null)
            {
                httpContext = new DefaultHttpContext();
            }

            if (metadataProvider == null)
            {
                metadataProvider = new EmptyModelMetadataProvider();
            }

            var bindingContext = new DefaultModelBindingContext
            {
                ActionContext = new ActionContext()
                {
                    HttpContext = httpContext,
                },
                //FieldName = "someField",
                IsTopLevelObject = true,
                ModelMetadata = metadataProvider.GetMetadataForType(modelType),
                ModelName = "",
                ValueProvider = Mock.Of<IValueProvider>(),
                ModelState = new ModelStateDictionary(),
                BindingSource = BindingSource.Body,
            };

            return bindingContext;
        }

        private Task<IDynamicDtoTypeBuilder> GetDtoBuilderAsync(string schemaResourceName)
        {
            var entityConfigCacheMock = new Mock<IEntityConfigCache>();

            entityConfigCacheMock.Setup(x => x.GetEntityPropertiesAsync(It.IsAny<Type>()))
                .Returns(async () =>
                {
                    var schema = await ReadJsonRequestAsync(typeof(List<EntityPropertyDto>), schemaResourceName) as List<EntityPropertyDto>;
                    return schema;
                });

            var entityConfigStore = LocalIocManager.Resolve<IEntityConfigurationStore>();
            var cacheManager = LocalIocManager.Resolve<ICacheManager>();
            var builder = new DynamicDtoTypeBuilder(entityConfigCacheMock.Object, entityConfigStore, cacheManager);

            return Task.FromResult<IDynamicDtoTypeBuilder>(builder);
        }

        #endregion

        public class PersonDynamicDto : DynamicDto<Person, Guid>
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
        }
    }
}
