using Abp.Domain.Repositories;
using Abp.Json;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using ElmahCore;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json;
using Shesha;
using Shesha.Domain;
using Shesha.DynamicEntities.EntityTypeBuilder;
using Shesha.DynamicEntities.ErrorHandler;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Services;
using Shesha.Services.Urls;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class PlaygroundAppService: SheshaAppServiceBase
    {

        private readonly IRepository<TestClass, Guid> _testClassRepo;
        private readonly DynamicEntityTypeBuilder _dynamicEntityTypeBuilder;

        public PlaygroundAppService(
            IRepository<TestClass, Guid> testClassRepo,
            DynamicEntityTypeBuilder dynamicEntityTypeBuilder
            )
        {
            _testClassRepo = testClassRepo;
            _dynamicEntityTypeBuilder = dynamicEntityTypeBuilder;
        }

        public string CreateType()
        {
            return "Ok";
            /*var type = _dynamicEntityTypeBuilder.CreateType(new EntityConfig
            {
                Namespace = "TestNamespace",
                ClassName = "TestClassName"
            }, null);

            return type.Name;*/
        }

        public class TestDto
        {
            public string Name { get; set; }
            public GenericEntityReference Test { get; set; }
        }

        public async Task<string> TestGenericEntityReferenceAsync()
        {
            var test = await _testClassRepo.GetAll().FirstOrDefaultAsync();
            var dto = new TestDto
            {
                Name = "Test",
                Test = test
            };

            var json = dto.ToJsonString();
            var obj = json.FromJsonString<TestDto>();

            var newRef = obj.Test;
            var newTest = (TestClass)obj.Test;

            return "OK";
        }

        public async Task TestJsonWithGenericEntityReferenceAsync(Guid id)
        {
            var test = await _testClassRepo.GetAsync(id);
            if (test.JsonProp is TestJsonWithGenericEntityReference json)
            {
                var entity = json.Entity;
                var person = (Person)json.Entity;
            }
        }

        public async Task<string?> TestFileVersionUrlAsync(Guid id) 
        {
            var repo = IocManager.Resolve<IRepository<StoredFileVersion, Guid>>();
            var version = await repo.GetAsync(id);

            var linkGeneratorContext = StaticContext.IocManager.Resolve<ILinkGeneratorContext>();
            if (linkGeneratorContext == null)
                throw new Exception("linkGeneratorContext is null");
            if (linkGeneratorContext.State == null)
                throw new Exception("linkGeneratorContext.State is null");

            var linkGenerator = StaticContext.IocManager.Resolve<LinkGenerator>();
            if (linkGenerator == null)
                throw new Exception("linkGenerator is null");

            var url = version.GetFileVersionUrl();
            return url;
        }


        public Task<string> TestLinkStateAsync() 
        {
            var linkGeneratorContext = StaticContext.IocManager.Resolve<ILinkGeneratorContext>();
            if (linkGeneratorContext == null)
                throw new Exception("linkGeneratorContext is null");
            if (linkGeneratorContext.State == null)
                throw new Exception("linkGeneratorContext.State is null");

            return Task.FromResult(JsonConvert.SerializeObject(linkGeneratorContext.State) ?? string.Empty);
        }        

        public async Task TestElmahAsync()
        {
            ElmahExtensions.RiseError(new Exception("Shurik"));
            await Task.CompletedTask;
        }
    }
}
