using System;
using System.Linq;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Shesha.Domain;
using Shesha.Services;

namespace Shesha.Extensions
{
    public static class StoredFileExtensions
    {
        public static StoredFileVersion LastVersion(this StoredFile file)
        {
            var repository = StaticContext.IocManager.Resolve<IRepository<StoredFileVersion, Guid>>();
            return repository.GetAll().Where(v => v.File == file).OrderByDescending(v => v.VersionNo).ThenByDescending(v => v.CreationTime).FirstOrDefault();
        }

        public static string GetContentType(this string fileName)
        {
            return StaticContext.IocManager.Resolve<IMimeMappingService>().Map(fileName);
        }

        /// <summary>
        /// Get url for downloading of the StoredFile
        /// </summary>
        /// <param name="storedFile"></param>
        /// <returns></returns>
        public static string GetFileUrl(this StoredFile storedFile)
        {
            var httpContextAccessor = StaticContext.IocManager.Resolve<IHttpContextAccessor>();
            var linkGenerator = StaticContext.IocManager.Resolve<LinkGenerator>();

            return linkGenerator.GetUriByAction(httpContextAccessor.HttpContext, "Download", "StoredFile", new { Id = storedFile.Id });
        }

        /// <summary>
        /// Get url for downloading of the StoredFileVersion
        /// </summary>
        /// <param name="storedFileVersion"></param>
        /// <returns></returns>
        public static string GetFileVersionUrl(this StoredFileVersion storedFileVersion)
        {
            var httpContextAccessor = StaticContext.IocManager.Resolve<IHttpContextAccessor>();
            var linkGenerator = StaticContext.IocManager.Resolve<LinkGenerator>();

            return linkGenerator.GetUriByAction(httpContextAccessor.HttpContext, "Download", "StoredFile", new { Id = storedFileVersion.File.Id, versionNo = storedFileVersion.VersionNo });
        }
    }
}
