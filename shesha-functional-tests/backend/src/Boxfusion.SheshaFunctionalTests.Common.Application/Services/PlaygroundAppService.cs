using Abp.Domain.Repositories;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json;
using Shesha;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Services;
using Shesha.Services.Urls;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services
{
    public class PlaygroundAppService: SheshaAppServiceBase
    {

        private readonly IRepository<TestClass, Guid> _testClassRepo;
        public PlaygroundAppService(
            IRepository<TestClass, Guid> testClassRepo
            )
        {
            _testClassRepo = testClassRepo;
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
    }
}
