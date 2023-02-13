using System;
using System.IO;
using System.Threading.Tasks;
using Abp.Domain.Repositories;
using Shesha.Configuration;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Utilities;

namespace Shesha.Services.StoredFiles
{
    /// <summary>
    /// Stored file service
    /// </summary>
    public class StoredFileService : StoredFileServiceBase, IStoredFileService
    {
        private readonly ISheshaSettings _sheshaSettings;
        private readonly IPathHelper _pathHelper;
        
        public StoredFileService(IRepository<StoredFile, Guid> fileService, IRepository<StoredFileVersion, Guid> versionService, ISheshaSettings sheshaSettings, IPathHelper pathHelper) : base(fileService, versionService)
        {
            _sheshaSettings = sheshaSettings;
            _pathHelper = pathHelper;
        }

        /// <summary>
        /// Returns physical path of the latest version of the specified <paramref name="file"/>
        /// </summary>
        public string PhysicalFilePath(StoredFile file)
        {
            return PhysicalFilePath(file?.LastVersion());
        }

        /// <summary>
        /// Returns physical path of the specified version of the specified <paramref name="file"/>
        /// </summary>
        public string PhysicalFilePath(StoredFileVersion fileVersion)
        {
            if (fileVersion == null)
                return null;

            var folder = fileVersion.File.Folder;
            var path = _pathHelper.Combine(
                !string.IsNullOrWhiteSpace(folder) && (Path.IsPathRooted(folder) || folder.StartsWith("~"))
                    ? ""
                    : _sheshaSettings.UploadFolder,
                folder ?? "",
                fileVersion.Id + fileVersion.FileType);

            return path;
        }

        public override async Task<Stream> GetStreamAsync(StoredFileVersion fileVersion)
        {
            if (fileVersion == null)
                return null;

            await using(var fileStream = new FileStream(PhysicalFilePath(fileVersion), FileMode.Open, FileAccess.Read))
            {
                // copy to MemoryStream to prevent sharing violations
                // todo: add a setting and test with FileStream in the real application (check RAM usage)
                var result = new MemoryStream();
                await fileStream.CopyToAsync(result);
                result.Seek(0, SeekOrigin.Begin);

                return result;
            }
        }

        public override Stream GetStream(StoredFileVersion fileVersion)
        {
            if (fileVersion == null)
                return null;

            using (var fileStream = new FileStream(PhysicalFilePath(fileVersion), FileMode.Open, FileAccess.Read))
            {
                // copy to MemoryStream to prevent sharing violations
                // todo: add a setting and test with FileStream in the real application (check RAM usage)
                var result = new MemoryStream();
                fileStream.CopyTo(result);
                result.Seek(0, SeekOrigin.Begin);

                return result;
            }
        }
        public async Task<Stream> GetStreamAsync(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                return null;

            await using (var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
            {
                // copy to MemoryStream to prevent sharing violations
                // todo: add a setting and test with FileStream in the real application (check RAM usage)
                var result = new MemoryStream();
                await fileStream.CopyToAsync(result);
                result.Seek(0, SeekOrigin.Begin);

                return result;
            }
        }
        /// inheritedDoc
        protected override void CopyFile(StoredFileVersion source, StoredFileVersion destination)
        {
            File.Copy(PhysicalFilePath(source), PhysicalFilePath(destination));
        }

        /// inheritedDoc
        public override async Task UpdateVersionContentAsync(StoredFileVersion version, Stream stream)
        {
            if (stream == null)
                throw new Exception($"{nameof(stream)} must not be null");

            var filePath = PhysicalFilePath(version);

            // delete old file
            if (File.Exists(filePath))
                File.Delete(filePath);

            // create directory if missing
            var dir = Path.GetDirectoryName(filePath);

            if (string.IsNullOrWhiteSpace(dir))
                throw new Exception($"File path is not specified. Possible reason: ({nameof(ISheshaSettings.UploadFolder)} is not specified)");

            if (!Directory.Exists(dir))
                Directory.CreateDirectory(dir);

            // update properties
            version.FileSize = stream.Length;
            await VersionRepository.UpdateAsync(version);

            await using (var fs = new FileStream(filePath, FileMode.Create))
            {
                await stream.CopyToAsync(fs);
            }
        }

        /// inheritedDoc
        protected override Task DeleteFromStorageAsync(StoredFileVersion version)
        {
            DeleteFromStorage(version);

            return Task.CompletedTask;
        }

        /// inheritedDoc
        protected override void DeleteFromStorage(StoredFileVersion version)
        {
            var path = PhysicalFilePath(version);
            if (File.Exists(path))
                File.Delete(path);
        }

      
    }
}
