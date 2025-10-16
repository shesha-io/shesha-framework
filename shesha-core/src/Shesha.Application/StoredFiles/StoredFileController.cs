using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.ObjectMapping;
using Abp.Reflection;
using Abp.Runtime.Session;
using Abp.Runtime.Validation;
using Abp.UI;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.StoredFiles.Dto;
using Shesha.StoredFiles.Enums;
using Shesha.Utilities;
using Shesha.Validations;
using SkiaSharp;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ReflectionHelper = Shesha.Reflection.ReflectionHelper;

namespace Shesha.StoredFiles
{
    [Route("api/[controller]")]
    [ApiController]
    [SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
    public class StoredFileController : ControllerBase, ITransientDependency
    {
        private readonly IStoredFileService _fileService;
        private readonly IRepository<StoredFile, Guid> _fileRepository;
        private readonly IRepository<StoredFileVersion, Guid> _fileVersionRepository;
        private readonly IRepository<StoredFileVersionDownload, Guid> _fileVersionDownloadRepository;
        private readonly IDynamicRepository _dynamicRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly TypeFinder _typeFinder;
        private readonly IAbpSession _abpSession;

        /// <summary>
        /// Reference to the object to object mapper.
        /// </summary>
        public IObjectMapper ObjectMapper { get; set; } = NullObjectMapper.Instance;

        public StoredFileController(IRepository<StoredFile, Guid> fileRepository,
            IRepository<StoredFileVersion, Guid> fileVersionRepository, IStoredFileService fileService,
            IDynamicRepository dynamicRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<Person, Guid> personRepository,
            TypeFinder typeFinder
, IAbpSession abpSession, IRepository<StoredFileVersionDownload, Guid> fileVersionDownloadRepository)
        {
            _fileService = fileService;
            _fileRepository = fileRepository;
            _fileVersionRepository = fileVersionRepository;
            _dynamicRepository = dynamicRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _personRepository = personRepository;
            _typeFinder = typeFinder;
            _abpSession = abpSession;
            _fileVersionDownloadRepository = fileVersionDownloadRepository;
        }

        [HttpGet, Route("Download")]
        public async Task<ActionResult> DownloadAsync(Guid id, int? versionNo)
        {
            var fileVersion = await GetStoredFileVersionAsync(id, versionNo);

            await _fileService.MarkDownloadedAsync(fileVersion);

            if (fileVersion.Id.ToString().ToLower() == HttpContext.Request.Headers.IfNoneMatch.ToString().ToLower())
            {
                return StatusCode(304);
            }
                                
#pragma warning disable IDISP001 // Dispose created. Note: this stream will be disposed by FileStreamResult
            var fileContents = await _fileService.GetStreamAsync(fileVersion);
#pragma warning restore IDISP001 // Dispose created

            HttpContext.Response.Headers.CacheControl = "no-cache, max-age=600"; //ten minuts
            HttpContext.Response.Headers.ETag = fileVersion.Id.ToString().ToLower();

            return File(fileContents, fileVersion.FileType.GetContentType(), fileVersion.FileName);
        }

        [HttpGet, Route("HasDownloaded")]
        public async Task<ActionResult> HasDownloadedAsync(Guid storedFileId)
        {
            var currentLoggedInUserId = _abpSession.UserId;
            var hasDownloaded = await _fileVersionDownloadRepository.GetAll()
                .Where((x => x.FileVersion.File.Id == storedFileId && x.CreatorUserId == currentLoggedInUserId))
               .AnyAsync();
            return Ok(new { hasDownloaded });

        }

        [HttpGet, Route("Base64String")]
        public async Task<IActionResult> GetBase64StringAsync(Guid id, int? versionNo)
        {
            var fileVersion = await GetStoredFileVersionAsync(id, versionNo);

            using (var fileContents = await _fileService.GetStreamAsync(fileVersion))
            {
                using (var memoryStream = new MemoryStream())
                {
                    await fileContents.CopyToAsync(memoryStream);
                    var base64String = Convert.ToBase64String(memoryStream.ToArray());
                    return Ok(new { Base64String = base64String });
                }
            }
        }

        private async Task<StoredFileVersion> GetStoredFileVersionAsync(Guid id, int? versionNo)
        {
            var file = await _fileRepository.GetAsync(id);
            if (file == null)
                throw new UserFriendlyException("File not found");

            var fileVersion = !versionNo.HasValue
                ? file.LastVersion()
                : _fileVersionRepository.GetAll()
                    .FirstOrDefault(v => v.File == file && v.VersionNo == versionNo.Value);

            if (fileVersion == null)
                throw new Exception("File version not found");

            return fileVersion;
        }

        [HttpPost, Route("Upload")]
        [Consumes("multipart/form-data")]
        public async Task<StoredFileDto> UploadAsync([FromForm] UploadFileInput input)
        {
            #region validation

            var validationResults = new ValidationResults();
            if (input.File == null)
                validationResults.Add($"{nameof(input.File)} must not be null", [nameof(input.File)]);

            if (string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId))
                validationResults.Add($"{nameof(input.OwnerType)} must not be null when {nameof(input.OwnerId)} is specified", [nameof(input.OwnerType)]);

            if (validationResults.Any())
                throw new AbpValidationException("An error occured", validationResults);
        
            #endregion

            input.EnsureFile();

            object? owner = null;

            if (!string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId))
            {
                owner = await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId);
                if (owner == null)
                    throw new Exception($"Owner not found (type = '{input.OwnerType}', id = '{input.OwnerId}')");
            }

            var uploadedFile = new StoredFileDto();
            var fileName = input.File.FileName.CleanupFileName();

            if (owner != null && !string.IsNullOrWhiteSpace(input.PropertyName))
            {
                StoredFileVersion? fileVersion = null;

                // single file upload (stored as a property of an entity)
                var property = ReflectionHelper.GetProperty(owner, input.PropertyName, out owner);

                if (!typeof(StoredFile).IsAssignableFrom(property.PropertyType))
                    throw new AbpValidationException(
                        $"Wrong type of '{owner.GetType().Name}.{input.PropertyName}' property (actual: '{property.PropertyType.FullName}', expected: '{nameof(StoredFile)}')");

                if (property.GetValue(owner, null) is StoredFile storedFile)
                {
                    storedFile.IsVersionControlled = true;
                    fileVersion = await _fileService.GetNewOrDefaultVersionAsync(storedFile);
                    fileVersion.FileName = fileName;
                    fileVersion.FileType = Path.GetExtension(fileName);
                    await _fileVersionRepository.InsertOrUpdateAsync(fileVersion);

                    await using (var fileStream = input.File.OpenReadStream())
                    {
                        await _fileService.UpdateVersionContentAsync(fileVersion, fileStream);
                    }

                    // copy to the main todo: remove duplicated properties (filename, filetype), add a link to the last version and update it using triggers
                    storedFile.FileName = fileVersion.FileName;
                    storedFile.FileType = fileVersion.FileType;
                    await _fileRepository.UpdateAsync(storedFile);
                }
                else
                {
                    await using (var fileStream = input.File.OpenReadStream())
                    {
                        fileVersion = await _fileService.CreateFileAsync(fileStream, fileName);
                        storedFile = fileVersion.File;

                        property.SetValue(owner, storedFile, null);
                    }
                }

                await _unitOfWorkManager.Current.SaveChangesAsync();
                MapStoredFile(fileVersion, uploadedFile);
            }
            else
            {
                // add file as an attachment (linked to an entity using OwnerType and OwnerId)
                await using (var fileStream = input.File.OpenReadStream())
                {
                    var fileVersion = await _fileService.CreateFileAsync(fileStream, fileName, file =>
                    {
                        if (owner != null)
                        {
                            // Set owner
                            if (!string.IsNullOrWhiteSpace(input.OwnerName))
                            {
                                var prop = ReflectionHelper.GetProperty(owner, input.OwnerName);
                                if (prop == null)
                                    throw new Exception($"Property '{input.OwnerName}' not found in class '{owner.GetType().FullName}'");
                                owner = prop.GetValue(owner);
                            }

                            if (owner != null)
                                file.Owner = new GenericEntityReference(owner);
                            else
                                file.Temporary = true;
                        }
                        else
                        {
                            if (!string.IsNullOrWhiteSpace(input.OwnerType))
                            {
                                // otherwise - mark as temporary
                                file.Temporary = true;
                            }
                        }
                        file.Category = input.FilesCategory?.ToCamelCase();
                    });

                    await _unitOfWorkManager.Current.SaveChangesAsync();
                    MapStoredFile(fileVersion, uploadedFile);
                }
            }

            return uploadedFile;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <exception cref="AbpValidationException"></exception>
        [HttpPost, Route("UploadStatic")]
        [Consumes("multipart/form-data")]
        public async Task<StoredFileDto> UploadStaticAsync([FromForm] StaticFileInput input)
        {
            var validationResults = new ValidationResults();
            if (input.File == null)
                validationResults.Add($"{nameof(input.File)} must not be null", [nameof(input.File)]);

            if (validationResults.Any())
                throw new AbpValidationException("An error occured", validationResults);

            input.EnsureFile();

            var uploadedFile = new StoredFileDto();
            var fileName = input.File.FileName.CleanupFileName();

            StoredFile? storedFile;

            // allow to use predefined Id and re-activate existing storedfile
            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                storedFile = input.Id != null && input.Id.HasValue && input.Id.Value != Guid.Empty
                    ? await _fileRepository.GetAll().FirstOrDefaultAsync(f => f.Id == input.Id.Value)
                    : null;
            }

            if (storedFile == null)
            {
                await using (var fileStream = input.File.OpenReadStream())
                {
                    var fileVersion = await _fileService.CreateFileAsync(fileStream, fileName, file =>
                    {
                        if (input.Id.HasValue && input.Id.Value != Guid.Empty)
                            file.Id = input.Id.Value;
                        file.Category = input.FilesCategory.ToCamelCaseOrNull();
                    });

                    await _unitOfWorkManager.Current.SaveChangesAsync();
                    MapStoredFile(fileVersion, uploadedFile);
                }
            }
            else
            {
                storedFile.IsDeleted = false;
                storedFile.IsVersionControlled = true;
                var version = await _fileService.GetNewOrDefaultVersionAsync(storedFile);
                version.FileName = fileName;
                version.FileType = Path.GetExtension(fileName);
                await _fileVersionRepository.InsertOrUpdateAsync(version);

                await using (var fileStream = input.File.OpenReadStream())
                {
                    await _fileService.UpdateVersionContentAsync(version, fileStream);
                }

                // copy to the main todo: remove duplicated properties (filename, filetype), add a link to the last version and update it using triggers
                storedFile.FileName = version.FileName;
                storedFile.FileType = version.FileType;
                await _fileRepository.UpdateAsync(storedFile);

                MapStoredFile(version, uploadedFile);
            }

            return uploadedFile;
        }

        [HttpPost, Route("UploadNewVersion")]
        [Consumes("multipart/form-data")]
        public async Task<StoredFileDto> UploadNewVersionAsync([FromForm] UploadFileVersionInput input)
        {
            var storedFile = await _fileRepository.GetAsync(input.Id);

            if (input.File == null)
                throw new AbpValidationException("An error occured", [new ValidationResult($"{nameof(input.File)} must not be null")]);

            var uploadedFile = new StoredFileDto();
            var fileName = input.File.FileName.CleanupFileName();

            storedFile.IsVersionControlled = true;
            var version = await _fileService.GetNewOrDefaultVersionAsync(storedFile);
            version.FileName = fileName;
            version.FileType = Path.GetExtension(fileName);
            await _fileVersionRepository.InsertOrUpdateAsync(version);

            await using (var fileStream = input.File.OpenReadStream())
            {
                await _fileService.UpdateVersionContentAsync(version, fileStream);
            }

            // copy to the main todo: remove duplicated properties (filename, filetype), add a link to the last version and update it using triggers
            storedFile.FileName = version.FileName;
            storedFile.FileType = version.FileType;
            await _fileRepository.UpdateAsync(storedFile);

            await _unitOfWorkManager.Current.SaveChangesAsync();

            MapStoredFile(version, uploadedFile);
            return uploadedFile;
        }

        private StoredFileDto? GetFileDto(StoredFileVersion fileVersion)
        {
            if (fileVersion == null)
                return null;

            var dto = new StoredFileDto();
            MapStoredFile(fileVersion, dto);
            return dto;
        }

        private void MapStoredFile(StoredFileVersion fileVersion, StoredFileDto fileDto)
        {
            fileDto.Id = fileVersion.File.Id;
            fileDto.FileCategory = fileVersion.File.Category;
            fileDto.Name = fileVersion.FileName;
            fileDto.Url = Url.Action("Download", new { fileVersion.File.Id });
            fileDto.Size = fileVersion.FileSize;
            fileDto.Type = !string.IsNullOrWhiteSpace(fileVersion.FileName)
                ? Path.GetExtension(fileVersion.FileName)
                : null;
            fileDto.Temporary = fileVersion.File.Temporary;
        }

        /// <summary>
        /// Delete file
        /// </summary>
        [HttpDelete, Route("Delete")]
        public async Task<bool> DeleteAsync([FromQuery] DeleteStoredFileInput input)
        {
            var ownerSpecified = !string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId);

            var validationResults = new ValidationResults();
            if (input.FileId == null && string.IsNullOrWhiteSpace(input.OwnerId) && !string.IsNullOrWhiteSpace(input.OwnerType))
                validationResults.Add($"{nameof(input.OwnerId)} must not be null when {nameof(input.OwnerType)} is specified", [nameof(input.OwnerId)]);

            if (input.FileId == null && string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId))
                validationResults.Add($"{nameof(input.OwnerType)} must not be null when {nameof(input.OwnerId)} is specified", [nameof(input.OwnerType)]);

            if (input.FileId == null && string.IsNullOrWhiteSpace(input.PropertyName))
                validationResults.Add($"Id must not be null", [nameof(input.FileId)]);

            var ownerType = _typeFinder.FindAll().FirstOrDefault(x => x.IsEntityType() && (x.FullName == input.OwnerType || x.GetTypeShortAliasOrNull() == input.OwnerType));
            if (ownerSpecified && ownerType == null)
                validationResults.Add($"Owner type not found (type = '{input.OwnerType}')", [nameof(input.OwnerId)]);

            var owner = ownerSpecified && ownerType != null
                ? await _dynamicRepository.GetAsync(ownerType.GetRequiredFullName(), input.OwnerId.NotNull())
                : null;
            if (ownerSpecified && owner == null)
                validationResults.Add($"Owner not found (type = '{input.OwnerType}', id = '{input.OwnerId}')", [nameof(input.OwnerId)]);

            PropertyInfo? property = null;
            if (owner != null && !string.IsNullOrWhiteSpace(input.PropertyName)) 
            {
                var accessor = ReflectionHelper.GetPropertyValueAccessor(owner, input.PropertyName);
                if (accessor.PropInfo == null)
                    validationResults.Add($"Property '{owner.GetType().Name}.{input.PropertyName}' not found", [nameof(input.PropertyName)]);

                if (property != null && !typeof(StoredFile).IsAssignableFrom(property.PropertyType))
                    validationResults.Add($"Wrong type of '{owner.GetType().Name}.{input.PropertyName}' property (actual: '{property.PropertyType.FullName}', expected: '{nameof(StoredFile)}')", [nameof(input.PropertyName)]);
                
                owner = accessor.Parent;
                property = accessor.PropInfo;
            }

            if (validationResults.Any())
                throw new AbpValidationException("Failed to delete file", validationResults);

            var storedFile = input.FileId != null
                ? await _fileRepository.GetAll().FirstOrDefaultAsync(f => f.Id == input.FileId.Value)
                : property != null
                    ? property.GetValue(owner) as StoredFile
                    : !string.IsNullOrWhiteSpace(input.FileCategory)
                        ? await _fileRepository.GetAll().FirstOrDefaultAsync(f => f.Owner == null && f.Category == input.FileCategory)
                        : null;

            if (storedFile != null)
            {
                // if the `property` is specified - then it's direct link and we should set it to null
                if (property != null)
                {
                    property.SetValue(owner, null, null);
                    await _dynamicRepository.SaveOrUpdateAsync(owner.NotNull());
                }

                await _fileService.DeleteAsync(storedFile);
            }

            return true;
        }

        private async Task<object> GetOwnerAsync(string ownerType, string ownerId, string? ownerName)
        {
            var owner = await _dynamicRepository.GetAsync(ownerType, ownerId);
            if (owner == null)
                throw new AbpValidationException($"Owner '{ownerType}:{ownerId}' not found");
            if (!string.IsNullOrWhiteSpace(ownerName))
            {
                var prop = ReflectionHelper.GetPropertyOrNull(owner, ownerName, out owner);
                if (prop == null)
                    throw new AbpValidationException($"Property '{ownerName}' not found in class '{owner.NotNull().GetType().FullName}'");
                owner = prop.GetValue(owner);
                if (owner == null)
                    throw new AbpValidationException($"Field '{ownerName}' of '{ownerType}:{ownerId}' is empty");
            }
            return owner;
        }

        /// <summary>
        /// Download zip archive of all files linked to a specified entity
        /// </summary>
        [HttpGet, Route("DownloadZip")]
        public async Task<FileStreamResult> DownloadZipAsync([FromQuery] FilesListInput input)
        {
            IList<StoredFile> files = new List<StoredFile>();
            if (string.IsNullOrWhiteSpace(input.OwnerId) || string.IsNullOrWhiteSpace(input.OwnerType))
            {
                if (input.FilesId?.Count > 0)
                {
                    foreach (var fileId in input.FilesId)
                    {
                        var file = await _fileService.GetOrNullAsync(fileId);
                        if (file != null)
                            files.Add(file);
                    }
                }
            }
            else
            {
                var owner = await GetOwnerAsync(input.OwnerType, input.OwnerId, input.OwnerName);
                var ownerId = owner.NotNull().GetId()?.ToString();
                var ownerType = owner.GetType().StripCastleProxyType().GetRequiredFullName();

                files = string.IsNullOrWhiteSpace(input.FilesCategory)
                    ? await _fileService.GetAttachmentsAsync(ownerId, ownerType)
                    : await _fileService.GetAttachmentsOfCategoryAsync(ownerId, ownerType, input.FilesCategory?.ToCamelCase());
            }

            if (files?.Count > 0)
            {
                    foreach (var file in files)
                    {
                        await _fileService.MarkDownloadedAsync(file.LastVersion());
                    }
                // todo: move zip support to the FileService, current implementation doesn't support Azure
                var list = _fileService.MakeUniqueFileNames(files);

#pragma warning disable IDISP001 // Dispose created. Note: compressedStream will be disposed automatically in the FileStreamResult
                var compressedStream = await CompressionService.CompressFilesAsync(list);
#pragma warning restore IDISP001 // Dispose created

                return File(compressedStream, "multipart/x-zip", "files.zip");
            }

            throw new AbpValidationException("Files not found");
        }

        /// <summary>
        /// Get list of files attached to a specified entity
        /// </summary>
        [HttpGet, Route("FilesList")]
        public async Task<List<StoredFileDto>> FilesListAsync([FromQuery] FilesListInput input)
        {
            if (string.IsNullOrEmpty(input.OwnerType))
                throw new Exception($"`{nameof(input.OwnerType)}` must not be null");
            if (string.IsNullOrEmpty(input.OwnerId))
                throw new Exception($"`{nameof(input.OwnerId)}` must not be null");

            var owner = await GetOwnerAsync(input.OwnerType, input.OwnerId, input.OwnerName);
            var id = owner.GetId();
            var type = owner.GetType().StripCastleProxyType().GetRequiredFullName();
            var fileVersions = string.IsNullOrWhiteSpace(input.FilesCategory)
                ? await _fileService.GetLastVersionsOfAttachmentsAsync(id, type)
                : await _fileService.GetLastVersionsOfAttachmentsAsync(id, type, input.FilesCategory.ToCamelCase());

            var currentUserId = _abpSession.UserId;

            if (currentUserId == null)
                return fileVersions.Select(GetFileDto).WhereNotNull().ToList();

            var fileIds = fileVersions.Select(v => v.File.Id).ToList();
            var downloadedFileIds = await _fileVersionDownloadRepository.GetAll()
                .Where(x => x.CreatorUserId == currentUserId && fileIds.Contains(x.FileVersion.File.Id))
                .Select(x => x.FileVersion.File.Id)
                .ToListAsync();

            return fileVersions.Select(v =>
            {
                var dto = GetFileDto(v);
                dto!.UserHasDownloaded = downloadedFileIds.Contains(v.File.Id);
                return dto;
            }).ToList();
        }

        #region REST

        /// <summary>
        /// Update existing file
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPut, Route("")]
        [Consumes("multipart/form-data")]
        public async Task<StoredFileDto> CreateOrUpdateAsync([FromForm] CreateStoredFileInput input)
        {
            #region validation and preparation

            var validations = new ValidationResults();
            if (input.File == null)
                validations.Add($"{nameof(input.File)} must not be null", [nameof(input.File)]);

            var ownerSpecified = !string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId);
            var hasProperty = !string.IsNullOrWhiteSpace(input.PropertyName);

            if (string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId))
                validations.Add($"{nameof(input.OwnerType)} must not be null when {nameof(input.OwnerId)} is specified", [nameof(input.OwnerType)]);

            if (input.Id == null && string.IsNullOrWhiteSpace(input.PropertyName) && !ownerSpecified && string.IsNullOrWhiteSpace(input.FilesCategory))
                validations.Add($"Id must not be null", [nameof(input.Id)]);

            var ownerType = _typeFinder.FindAll().FirstOrDefault(x => x.IsEntityType() && (x.FullName == input.OwnerType || x.GetTypeShortAliasOrNull() == input.OwnerType));
            if (ownerSpecified && ownerType == null)
                validations.Add($"Owner type not found (type = '{input.OwnerType}')", [nameof(input.OwnerId)]);

            var owner = ownerType != null && !string.IsNullOrWhiteSpace(input.OwnerId)
                ? await _dynamicRepository.GetAsync(ownerType.GetRequiredFullName(), input.OwnerId)
                : null;
            if (ownerSpecified && owner == null)
                validations.Add($"Owner not found (type = '{input.OwnerType}', id = '{input.OwnerId}')", [nameof(input.OwnerId)]);

            PropertyInfo? property = null;
            if (owner != null && !string.IsNullOrWhiteSpace(input.PropertyName))
            {
                property = ReflectionHelper.GetPropertyOrNull(owner, input.PropertyName, out owner);

                if (property == null)
                    validations.Add($"Property '{owner?.GetType().Name}.{input.PropertyName}' not found", [nameof(input.PropertyName)]);

                if (property != null && !typeof(StoredFile).IsAssignableFrom(property.PropertyType))
                    validations.Add($"Wrong type of '{owner?.GetType().Name}.{input.PropertyName}' property (actual: '{property.PropertyType.FullName}', expected: '{nameof(StoredFile)}')", [nameof(input.PropertyName)]);
            }

            if (validations.Any())
                throw new AbpValidationException("Failed to upload file", validations);

            #endregion

            StoredFile? storedFile;
            StoredFileVersion fileVersion;
            // allow to use predefined Id and re-activate existing storedfile
            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                storedFile = input.Id != null
                    ? await _fileRepository.GetAll().FirstOrDefaultAsync(f => f.Id == input.Id.Value)
                    : property != null && owner != null
                        ? property.GetValue(owner) as StoredFile
                        : !string.IsNullOrWhiteSpace(input.FilesCategory)
                            ? await _fileRepository.FirstOrDefaultAsync(x => x.Owner == null && x.Category == input.FilesCategory)
                            : null;
            }

            input.EnsureFile();

            var fileName = input.File.FileName.CleanupFileName();

            if (storedFile == null)
            {
                await using (var fileStream = input.File.OpenReadStream())
                {
                    fileVersion = await _fileService.CreateFileAsync(fileStream, fileName, file =>
                    {
                        // set predefined Id
                        if (input.Id.HasValue && input.Id.Value != Guid.Empty)
                            file.Id = input.Id.Value;
                    });
                    storedFile = fileVersion.File;

                    // set property if needed
                    if (property != null && owner != null)
                    {
                        property.SetValue(owner, storedFile, null);
                        await _dynamicRepository.SaveOrUpdateAsync(owner);
                    }
                    else if (owner == null && hasProperty)
                    {
                        storedFile.Temporary = true;
                    }

                    if (!string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId))
                    {
                        storedFile.SetOwner(input.OwnerType, input.OwnerId);
                    }

                    storedFile.Category = input.FilesCategory;
                }
            }
            else
            {
                storedFile.IsDeleted = false;
                storedFile.IsVersionControlled = true;
                fileVersion = await _fileService.GetNewOrDefaultVersionAsync(storedFile);
                fileVersion.FileName = fileName;
                fileVersion.FileType = Path.GetExtension(fileName);
                await _fileVersionRepository.InsertOrUpdateAsync(fileVersion);

                await using (var fileStream = input.File.OpenReadStream())
                {
                    await _fileService.UpdateVersionContentAsync(fileVersion, fileStream);
                }

                // copy to the main todo: remove duplicated properties (filename, filetype), add a link to the last version and update it using triggers
                storedFile.FileName = fileVersion.FileName;
                storedFile.FileType = fileVersion.FileType;
                storedFile.Category = input.FilesCategory;
                await _fileRepository.UpdateAsync(storedFile);
            }

            var uploadedFile = new StoredFileDto();
            await _unitOfWorkManager.Current.SaveChangesAsync();
            MapStoredFile(fileVersion, uploadedFile);

            return uploadedFile;
        }

        /// <summary>
        /// Get file by <paramref name="id"/>
        /// </summary>
        /// <returns></returns>
        [HttpGet, Route("")]
        public async Task<StoredFileDto?> GetAsync(Guid id)
        {
            var storedFile = await _fileRepository.GetAsync(id);

            if (storedFile == null || storedFile.IsDeleted)
                return null;

            var fileVersion = storedFile.LastVersion();
            var dto = GetFileDto(fileVersion);

            var currentUserId = _abpSession.UserId;
            if (currentUserId.HasValue)
            {
                dto!.UserHasDownloaded = await _fileVersionDownloadRepository.GetAll()
                    .AnyAsync(x => x.CreatorUserId == currentUserId.Value &&
                                   x.FileVersion.File.Id == storedFile.Id);
            }

            return dto;
        }


        /// <summary>
        /// Get file as property of the entity
        /// </summary>
        /// <returns></returns>
        [HttpGet, Route("EntityProperty")]
        public async Task<StoredFileDto?> GetEntityPropertyAsync([FromQuery] StoredFileAsPropertyDto input)
        {
            var hasOwner = !string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId);
            var hasProperty = !string.IsNullOrWhiteSpace(input.PropertyName);
            var hasCategory = !string.IsNullOrWhiteSpace(input.FileCategory);
            if ((!hasOwner || !hasProperty) && !hasCategory)
                return null;

            if (hasOwner)
            {
                var entity = await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId);
                if (entity == null)
                    return null;

                if (string.IsNullOrEmpty(input.PropertyName))
                    throw new Exception($"`{nameof(input.PropertyName)}` must not be null");
                var property = ReflectionHelper.GetPropertyOrNull(entity, input.PropertyName, out var owner);
                if (owner == null)
                    throw new AbpValidationException($"Field '{input.PropertyName}' of '{input.OwnerType}:{input.OwnerId}' is empty");
                if (property == null)
                    throw new Exception($"Property '{input.PropertyName}' not found in the class {owner.GetType().Name}");

                if (!(property.GetValue(owner) is StoredFile storedFile && !storedFile.IsDeleted))
                    return null;

                return GetFileDto(storedFile.LastVersion());
            }
            else
            {
                if (hasCategory)
                {
                    var version = await _fileVersionRepository.GetAll().FirstOrDefaultAsync(x => x.IsLast && x.File.Owner == null && x.File.Category == input.FileCategory);
                    return GetFileDto(version);
                }
            }
            return null;
        }

        /// <summary>
        /// Delete file
        /// </summary>
        [HttpDelete, Route("")]
        public async Task<bool> DeleteFileAsync(Guid id)
        {
            var file = await _fileRepository.GetAsync(id);
            await _fileService.DeleteAsync(file);

            return true;
        }

        /// <summary>
        /// Get versions of the file with specified Id
        /// </summary>
        /// <param name="fileId">Id of the file</param>
        /// <returns></returns>
        [HttpGet, Route("StoredFile/{fileId}/Versions")]
        public async Task<List<StoredFileVersionInfoDto>> GetFileVersionsAsync(Guid fileId)
        {
            var documentUploads = await _fileVersionRepository.GetAll()
                .Where(c => c.File.Id == fileId)
                .OrderBy(u => u.CreationTime)
                .ToListAsync();

            return documentUploads.Select(v => ObjectMapper.Map<StoredFileVersionInfoDto>(v)).ToList();
        }

        #endregion

        /// <summary>
        /// Download Thumbnail of the uploaded image.
        /// </summary>
        /// <param name="id">id of uploaded file that you need to download</param>
        /// <param name="width">Thumbnail width</param>
        /// <param name="height">Thumbnail height</param>
        /// <param name="fitOption">Fit options (FitToHeight = 1 or FitToWidth = 2 or AutoFit = 3)</param>
        /// <param name="versionNo"></param>
        /// <returns></returns>
        [HttpGet, Route("DownloadThumbnail")]
        public async Task<ActionResult> DownloadThumbnailAsync(Guid id, int width, int height, FitOptions fitOption, int? versionNo)
        {
            var fileVersion = await GetStoredFileVersionAsync(id, versionNo);

            if (fileVersion.Id.ToString().ToLower() == HttpContext.Request.Headers.IfNoneMatch.ToString().ToLower())
                return StatusCode(304);

            using var fileContents = await _fileService.GetStreamAsync(fileVersion);

            // Get the file name
            string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileVersion.FileName);
            string fileExtension = Path.GetExtension(fileVersion.FileName);
            string fileName = $"{fileNameWithoutExtension}_w{width}h{height}{fileExtension}";

            // Read stream and reset position
            using var stream = new MemoryStream();
            await fileContents.CopyToAsync(stream);
            stream.Seek(0, SeekOrigin.Begin);

            // Decode the image
            using var originalImage = SKBitmap.Decode(stream);

            // Generate the thumbnail
            using var resizedImage = GenerateThumbnail(originalImage, width, height, fitOption);

            // Convert the resized image to a byte array
            using var skImage = SKImage.FromBitmap(resizedImage);
            using var data = skImage.Encode(SKEncodedImageFormat.Png, 100);

            // Save to result stream
#pragma warning disable IDISP001 // Dispose created. Note: this stream will be disposed by FileStreamResult
            var resultStream = new MemoryStream();
#pragma warning restore IDISP001 // Dispose created
            data.SaveTo(resultStream);
            resultStream.Seek(0, SeekOrigin.Begin);  // Reset stream position

            // Set response headers
            HttpContext.Response.Headers.CacheControl = "no-cache, max-age=600"; // Ten minutes cache
            HttpContext.Response.Headers.ETag = fileVersion.Id.ToString().ToLower();

            return File(resultStream, fileVersion.FileType.GetContentType(), fileName);
        }

        private static SKBitmap GenerateThumbnail(SKBitmap originalImage, int width, int height, FitOptions fitOption)
        {
            int newWidth = width;
            int newHeight = height;

            // Get original dimensions
            int originalWidth = originalImage.Width;
            int originalHeight = originalImage.Height;

            // Maintain aspect ratio based on the FitOption
            switch (fitOption)
            {
                case FitOptions.FitToHeight:
                    newWidth = (int)((double)originalWidth / originalHeight * height);
                    break;

                case FitOptions.FitToWidth:
                    newHeight = (int)((double)originalHeight / originalWidth * width);
                    break;

                case FitOptions.AutoFit:
                    double aspectRatio = (double)originalWidth / originalHeight;
                    if (originalWidth < originalHeight)
                    {
                        newWidth = (int)(height * aspectRatio);
                    }
                    else
                    {
                        newHeight = (int)(width / aspectRatio);
                    }
                    break;
            }

            // Resize using SkiaSharp
            var thumbnail = new SKBitmap(newWidth, newHeight);
            using var canvas = new SKCanvas(thumbnail);
            canvas.DrawBitmap(originalImage, new SKRect(0, 0, newWidth, newHeight));

            return thumbnail;

        }

    }
}