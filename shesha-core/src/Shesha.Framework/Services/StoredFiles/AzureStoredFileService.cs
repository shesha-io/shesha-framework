using Abp.Dependency;
using Abp.Domain.Repositories;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Castle.Core.Logging;
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
        private readonly ILogger _logger;
        private readonly Lazy<BlobContainerClient> _blobContainerClient;

        public AzureStoredFileService(IRepository<StoredFile, Guid> fileService, IRepository<StoredFileVersion, Guid> versionService, IRepository<StoredFileVersionDownload, Guid> storedFileVersionDownloadService, IocManager iocManager, ILogger logger)
            : base(fileService, versionService, storedFileVersionDownloadService)
        {
            _iocManager = iocManager;
            _configuration = GetConfiguration();
            _blobContainerClient = new Lazy<BlobContainerClient>(CreateBlobContainerClient);
            _logger = logger;
        }

        private IConfigurationRoot GetConfiguration()
        {
            var env = _iocManager.Resolve<IWebHostEnvironment>();
            return AppConfigurations.Get(env.ContentRootPath, env.EnvironmentName, env.IsDevelopment());
        }

        /// <summary>
        /// Returns the raw storage credential value from configuration.
        /// Checks <c>CloudStorage:ConnectionString</c> first (preferred), then falls back
        /// to the classic <c>ConnectionStrings:BlobStorage</c> key for backwards compatibility.
        /// The value can be any of:
        ///   - a classic Azure Storage connection string (DefaultEndpointsProtocol=…)
        ///   - a container-level SAS URL  (https://…/container?sv=…&amp;sig=…)
        ///   - an account-level SAS URL   (https://…?sv=…&amp;sig=…)
        /// </summary>
        private string GetStorageValue()
        {
            var value = _configuration.GetSection(CloudStorageName).GetValue<string>("ConnectionString");
            if (string.IsNullOrWhiteSpace(value))
                value = _configuration.GetConnectionString(ConnectionStringName);
            return value;
        }

        /// <summary>
        /// Creates a <see cref="BlobContainerClient"/> by auto-detecting the authentication
        /// method from the format of the configured storage value.
        /// </summary>
        private BlobContainerClient CreateBlobContainerClient()
        {
            var value = GetStorageValue();
            if (string.IsNullOrWhiteSpace(value))
                throw new InvalidOperationException(
                    "Azure Blob Storage connection is not configured. " +
                    "Set 'CloudStorage:ConnectionString' or 'ConnectionStrings:BlobStorage' " +
                    "to a connection string, SAS URL, or account URL.");

            var containerName = _configuration.GetSection(CloudStorageName)
                .GetValue<string>("ContainerName") ?? ContainerName;

            // URL-based auth: SAS token
            if (value.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(value);
                bool hasSasToken = !string.IsNullOrEmpty(uri.Query);
                // uri.Segments for https://account.blob.core.windows.net/mycontainer?...
                // is ['/', 'mycontainer'] (length 2), indicating container is in the URL path.
                bool hasContainerInPath = uri.Segments.Length > 1 &&
                                          !string.IsNullOrEmpty(uri.Segments[1].Trim('/'));

                if (!hasSasToken)
                    throw new InvalidOperationException(
                        $"The configured storage URL '{uri.Host}' has no SAS token. " +
                        "Provide a SAS URL (https://…?sv=…&sig=…) or a classic connection string.");

                if (hasContainerInPath)
                {
                    // Container-level SAS URL — container name is already in the URI path.
                    // The ContainerName setting from config is ignored to avoid a mismatch.
                    _logger.Warn("SAS URL container differs from configured ContainerName. Using URL container.");
                    return new BlobContainerClient(uri);
                }

                // Account-level SAS URL — combine with the configured container name.
                return new BlobServiceClient(uri).GetBlobContainerClient(containerName);
            }

            // Classic connection string (AccountKey or Azurite emulator).
            // Container is auto-created and set to public blob access on first use.
            var client = new BlobContainerClient(value, containerName);
            client.CreateIfNotExists();
            client.SetAccessPolicy(PublicAccessType.BlobContainer);
            return client;
        }

        private BlobContainerClient BlobContainerClient => _blobContainerClient.Value;

        private BlobClient GetBlobClient(string blobName)
        {
            var directoryName = _configuration.GetSection(CloudStorageName).GetValue<string>("DirectoryName");

            var normalizedDirectory = directoryName?.Replace('\\', '/').Trim('/');

            var normalizedBlobName = blobName.Replace('\\', '/').TrimStart('/');

            var blobPath = string.IsNullOrWhiteSpace(normalizedDirectory)
                ? normalizedBlobName
                : $"{normalizedDirectory}/{blobName}";
            return BlobContainerClient.GetBlobClient(blobPath);
        }

        private static string GetAzureFileName(StoredFileVersion version) => version.Id + version.FileType;

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
                throw new ArgumentException($"{nameof(stream)} must not be null");

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
