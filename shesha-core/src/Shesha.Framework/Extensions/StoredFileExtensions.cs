using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Shesha.Domain;
using Shesha.Services;
using Shesha.Services.Urls;
using System;

namespace Shesha.Extensions
{
    public static class StoredFileExtensions
    {
        public static StoredFileVersion LastVersion(this StoredFile file)
        {
            var repository = StaticContext.IocManager.Resolve<IRepository<StoredFileVersion, Guid>>();
            return repository.FirstOrDefault(v => v.File == file && v.IsLast);
        }

        public static string GetContentType(this string fileName)
        {
            return StaticContext.IocManager.Resolve<IMimeMappingService>().Map(fileName);
        }

        /// <summary>
        /// Get absolute url for downloading of the StoredFile
        /// </summary>
        /// <param name="storedFile"></param>
        /// <returns></returns>
        public static string? GetFileUrl(this StoredFile storedFile)
        {
            return GetUrl("Download", "StoredFile", new { Id = storedFile.Id });
        }

        /// <summary>
        /// Get absolute url for downloading of the StoredFileVersion
        /// </summary>
        /// <param name="storedFileVersion"></param>
        /// <returns></returns>
        public static string? GetFileVersionUrl(this StoredFileVersion storedFileVersion)
        {
            return GetUrl("Download", "StoredFile", new { Id = storedFileVersion.File.Id, versionNo = storedFileVersion.VersionNo });
        }

        private static string? GetUrl(string action, string controller, object values) 
        {
            var linkGeneratorContext = StaticContext.IocManager.Resolve<ILinkGeneratorContext>();
            var linkGenerator = StaticContext.IocManager.Resolve<LinkGenerator>();
            if (linkGeneratorContext.State == null)
                return string.Empty;

            if (string.IsNullOrWhiteSpace(linkGeneratorContext.State.Scheme) || string.IsNullOrWhiteSpace(linkGeneratorContext.State.Host))
                return string.Empty;

            var port = linkGeneratorContext.State.Port;

            return linkGenerator.GetUriByAction(
                action, 
                controller, 
                values,
                linkGeneratorContext.State.Scheme,
                port > 0 
                    ? new HostString(linkGeneratorContext.State.Host, port)
                    : new HostString(linkGeneratorContext.State.Host),
                linkGeneratorContext.State.PathBase
            );
        }

        private static string? GetPath(string action, string controller, object values) 
        {
            var linkGenerator = StaticContext.IocManager.Resolve<LinkGenerator>();

            return linkGenerator.GetPathByAction(action, controller, values);
        }

        /// <summary>
        /// Get relative path for downloading of the StoredFile
        /// </summary>
        /// <param name="storedFile"></param>
        /// <returns></returns>
        public static string? GetFilePath(this StoredFile storedFile)
        {
            return GetPath("Download", "StoredFile", new { Id = storedFile.Id });
        }

        /// <summary>
        /// Get relative path for downloading of the StoredFileVersion
        /// </summary>
        /// <param name="storedFileVersion"></param>
        /// <returns></returns>
        public static string? GetFileVersionPath(this StoredFileVersion storedFileVersion)
        {
            return GetPath("Download", "StoredFile", new { Id = storedFileVersion.File.Id, versionNo = storedFileVersion.VersionNo });
        }
    }
}
