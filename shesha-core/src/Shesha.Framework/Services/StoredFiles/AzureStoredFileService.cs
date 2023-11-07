using System;
using System.IO;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Shesha.Configuration;
using Shesha.Domain;
using Shesha.Services.StoredFiles.Options;

namespace Shesha.Services.StoredFiles
{
    public class AzureStoredFileService : StoredFileServiceBase, IStoredFileService
    {
        private const string ConnectionStringName = "BlobStorage";
        private const string ContainerName = "files";
        private readonly IocManager _iocManager;
        private readonly IConfigurationRoot _configuration;
        private readonly CloudStorageOptions _cloudStorageOptions;

        public AzureStoredFileService(IRepository<StoredFile, Guid> fileService, IRepository<StoredFileVersion, Guid> versionService, IocManager iocManager) : base(fileService, versionService)
        {
            _iocManager = iocManager;
            _configuration = GetConfiguration();
            _cloudStorageOptions = GetCloudStorageConfiguration();
        }

        /// <summary>
        /// Re
        /// </summary>
        /// <returns></returns>
        private IConfigurationRoot GetConfiguration()
        {
            var env = _iocManager.Resolve<IWebHostEnvironment>();
            return AppConfigurations.Get(env.ContentRootPath, env.EnvironmentName, env.IsDevelopment());
        }

        /// <summary>
        /// Returns connection string. Note: for the Azure environment - uses standard environment variable
        /// </summary>
        private string GetConnectionString()
        {
            return _configuration.GetConnectionString(ConnectionStringName);
        }

        /// <summary>
        ///  Returns cloud storage configurations
        /// </summary>
        /// <returns></returns>
        private CloudStorageOptions GetCloudStorageConfiguration()
        {
            var options = new CloudStorageOptions();
            _configuration.GetSection(CloudStorageOptions.CloudStorageConfigurations).Bind(options);
            return options;
        }

        private BlobContainerClient _blobContainerClient;

        protected BlobContainerClient BlobContainerClient
        {
            get
            {
                if (_blobContainerClient != null)
                    return _blobContainerClient;

                var containerClient = new BlobContainerClient(
                    GetConnectionString(),
                    _cloudStorageOptions?.ContainerName ?? ContainerName);
                containerClient.CreateIfNotExists();

                // Setup the permissions on the container to be public
                containerClient.SetAccessPolicy(PublicAccessType.BlobContainer);

                _blobContainerClient = containerClient;
                return _blobContainerClient;
            }
        }

        private BlobClient GetBlobClient(string blobName)
        {
            return BlobContainerClient.GetBlobClient(Path.Combine(_cloudStorageOptions?.DirectoryName, blobName));
        }

        private string GetAzureFileName(StoredFileVersion version)
        {
            return version.Id + version.FileType;
        }

        public override async Task<Stream> GetStreamAsync(StoredFileVersion fileVersion)
        {
            var blob = GetBlobClient(GetAzureFileName(fileVersion));
            var stream = new MemoryStream();

            // note: Azure throws an exception if file is empty
            var props = await blob.GetPropertiesAsync();
            if (props.Value.ContentLength > 0)
            {
                var downloadResult = await blob.DownloadToAsync(stream);
                stream.Seek(0, SeekOrigin.Begin);
            }

            return stream;
        }

        public async Task<Stream> GetStreamAsync(string filePath)
        {
            var blob = GetBlobClient(filePath.ToLower());
            var stream = new MemoryStream();

            // note: Azure throws an exception if file is empty
            var props = await blob.GetPropertiesAsync();
            if (props.Value.ContentLength > 0)
            {
                var downloadResult = await blob.DownloadToAsync(stream);
                stream.Seek(0, SeekOrigin.Begin);
            }

            return stream;
        }

        public override Stream GetStream(StoredFileVersion fileVersion)
        {
            var blob = GetBlobClient(GetAzureFileName(fileVersion));
            var stream = new MemoryStream();

            // note: Azure throws an exception if file is empty
            var props = blob.GetProperties();
            if (props.Value.ContentLength > 0)
            {
                var downloadResult = blob.DownloadTo(stream);
                stream.Seek(0, SeekOrigin.Begin);
            }

            return stream;
        }

        /// inheritedDoc
        public override async Task UpdateVersionContentAsync(StoredFileVersion version, Stream stream)
        {
            if (stream == null)
                throw new Exception($"{nameof(stream)} must not be null");

            var blob = GetBlobClient(GetAzureFileName(version));

            // update properties
            version.FileSize = stream.Length;
            await VersionRepository.UpdateAsync(version);

            await blob.UploadAsync(stream, overwrite: true);
        }

        /// inheritedDoc
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

        /// inheritedDoc
        protected override async Task DeleteFromStorageAsync(StoredFileVersion version)
        {
            var blob = GetBlobClient(GetAzureFileName(version));
            await blob.DeleteAsync();
        }

        /// inheritedDoc
        protected override void DeleteFromStorage(StoredFileVersion version)
        {
            var blob = GetBlobClient(GetAzureFileName(version));
            blob.Delete();
        }
    }
}
