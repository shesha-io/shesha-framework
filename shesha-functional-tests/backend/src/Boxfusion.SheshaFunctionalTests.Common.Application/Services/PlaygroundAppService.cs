using Abp.Domain.Repositories;
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
        public async Task<string> TestFileVersionUrl(Guid id) 
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


        public async Task<string> TestLinkState() 
        {
            var linkGeneratorContext = StaticContext.IocManager.Resolve<ILinkGeneratorContext>();
            if (linkGeneratorContext == null)
                throw new Exception("linkGeneratorContext is null");
            if (linkGeneratorContext.State == null)
                throw new Exception("linkGeneratorContext.State is null");

            return JsonConvert.SerializeObject(linkGeneratorContext.State);
        }        
    }
}
