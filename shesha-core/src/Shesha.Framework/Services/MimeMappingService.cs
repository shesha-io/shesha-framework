using Abp.Dependency;

namespace Shesha.Services
{
    public class MimeMappingService : IMimeMappingService, ITransientDependency
    {
        private readonly FileExtensionContentTypeProvider _contentTypeProvider;

        public MimeMappingService()
        {
            // todo: remove local copy of FileExtensionContentTypeProvider when it will be available in the .Net Core 3 or later
            _contentTypeProvider = new FileExtensionContentTypeProvider();
        }

        public string Map(string fileName)
        {
            return _contentTypeProvider.TryGetContentType(fileName, out var contentType)
                ? contentType
                : "application/octet-stream";
        }
    }
}
