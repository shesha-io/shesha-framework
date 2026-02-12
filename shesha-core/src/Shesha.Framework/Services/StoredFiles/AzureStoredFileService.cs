using Abp.Dependency;
using Abp.Domain.Repositories;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Shesha.Configuration;
using Shesha.Domain;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Services.StoredFiles
{
    public class AzureStoredFileService : StoredFileServiceBase, IStoredFileService
    {
        private const string ConnectionStringName = "BlobStorage";
        private const string CloudStorageName = "CloudStorage";
        private const string ContainerName = "files";
        private readonly IocManager _iocManager;
        private readonly IConfigurationRoot _configuration;
        private BlobContainerClient? _blobContainerClient;

        public AzureStoredFileService(IRepository<StoredFile, Guid> fileService, IRepository<StoredFileVersion, Guid> versionService, IRepository<StoredFileVersionDownload, Guid> storedFileVersionDownloadService, IocManager iocManager)
            : base(fileService, versionService, storedFileVersionDownloadService)
        {
            _iocManager = iocManager;
            _configuration = GetConfiguration();
        }

        private IConfigurationRoot GetConfiguration()
        {
            var env = _iocManager.Resolve<IWebHostEnvironment>();
            return AppConfigurations.Get(env.ContentRootPath, env.EnvironmentName, env.IsDevelopment());
        }

        /// <summary>
        /// Returns connection string. Note: for the Azure environment - uses standard environment variable
        /// </summary>
        private string GetConnectionString() => _configuration.GetRequiredConnectionString(ConnectionStringName);

        private BlobContainerClient BlobContainerClient
        {
            get
            {
                // If Container name is not passed from the configs then we use the defaults container name which is 'files'
                var containerName = _configuration.GetSection(CloudStorageName).GetValue<string>("ContainerName") ?? ContainerName;

                if (_blobContainerClient != null)
                    return _blobContainerClient;

                var containerClient = new BlobContainerClient(GetConnectionString(), containerName);
                containerClient.CreateIfNotExists();

                // Setup the permissions on the container to be public
                containerClient.SetAccessPolicy(PublicAccessType.BlobContainer);

                _blobContainerClient = containerClient;
                return _blobContainerClient;
            }
        }

        private BlobClient GetBlobClient(string blobName)
        {
            var directoryName = _configuration.GetSection(CloudStorageName).GetValue<string>("DirectoryName");
            return BlobContainerClient.GetBlobClient(Path.Combine(directoryName ?? "", blobName));
        }

        private string GetAzureFileName(StoredFileVersion version) => version.Id + version.FileType;

        private async Task<Stream> GetStreamInternalAsync(string filePath)
        {
            var blob = GetBlobClient(filePath);
            var stream = new MemoryStream();

            var props = await blob.GetPropertiesAsync();
            if (props.Value.ContentLength > 0)
            {
                using var response = await blob.DownloadToAsync(stream);
                stream.Seek(0, SeekOrigin.Begin);
            }

            return stream;
        }

        public override Task<Stream> GetStreamAsync(StoredFileVersion fileVersion) => GetStreamInternalAsync(GetAzureFileName(fileVersion));

        public async Task<Stream> GetStreamAsync(string filePath) => await GetStreamInternalAsync(filePath);

        /// inheritedDo
        public override Stream GetStream(StoredFileVersion fileVersion)
        {
            var blob = GetBlobClient(GetAzureFileName(fileVersion));
            var stream = new MemoryStream();

            // note: Azure throws an exception if file is empty
            var props = blob.GetProperties();
            if (props.Value.ContentLength > 0)
            {
                using var response = blob.DownloadTo(stream);
                stream.Seek(0, SeekOrigin.Begin);
            }

            return stream;
        }

        /// inheritedDo
        public override async Task UpdateVersionContentAsync(StoredFileVersion version, Stream stream)
        {
            if (stream == null)
                throw new Exception($"{nameof(stream)} must not be null");

            var blob = GetBlobClient(GetAzureFileName(version));

            version.FileSize = stream.Length;
            await VersionRepository.UpdateAsync(version);

            await blob.UploadAsync(stream, overwrite: true);
        }

        /// inheritedDo
        protected override void CopyFile(StoredFileVersion source, StoredFileVersion destination)
        {
            var sourceBlob = GetBlobClient(GetAzureFileName(source));
            if (!sourceBlob.Exists())
                return;

            var destinationBlob = GetBlobClient(GetAzureFileName(destination));
            if (destinationBlob.Exists())
                return;

            destinationBlob.StartCopyFromUri(sourceBlob.Uri);
        }

        /// inheritedDo
        protected override async Task DeleteFromStorageAsync(StoredFileVersion version)
        {
            var blob = GetBlobClient(GetAzureFileName(version));
            using var response = await blob.DeleteAsync();
        }

        /// inheritedDoc
        protected override void DeleteFromStorage(StoredFileVersion version)
        {
            var blob = GetBlobClient(GetAzureFileName(version));
            using var response = blob.Delete();
        }

        public override async Task<bool> FileExistsAsync(Guid id)
        {
            var lastVersion = await GetLastVersionAsync(id);
            if (lastVersion == null)
                return false;

            var sourceBlob = GetBlobClient(GetAzureFileName(lastVersion));
            return await sourceBlob.ExistsAsync();
        }
    }
}
