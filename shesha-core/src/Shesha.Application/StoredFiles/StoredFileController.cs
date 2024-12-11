using Abp.AspNetCore.Mvc.Authorization;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.ObjectMapping;
using Abp.Runtime.Validation;
using Abp.UI;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.OutputCaching;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.EntityReferences;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.StoredFiles.Dto;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
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
        private readonly IDynamicRepository _dynamicRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Person, Guid> _personRepository;

        /// <summary>
        /// Reference to the object to object mapper.
        /// </summary>
        public IObjectMapper ObjectMapper { get; set; }

        public StoredFileController(IRepository<StoredFile, Guid> fileRepository,
            IRepository<StoredFileVersion, Guid> fileVersionRepository, IStoredFileService fileService,
            IDynamicRepository dynamicRepository, 
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<Person, Guid> personRepository)
        {
            _fileService = fileService;
            _fileRepository = fileRepository;
            _fileVersionRepository = fileVersionRepository;
            _dynamicRepository = dynamicRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _personRepository = personRepository;
        }

        [HttpGet, Route("Download")]
        public async Task<ActionResult> Download(Guid id, int? versionNo)
        {
            var fileVersion = await GetStoredFileVersionAsync(id, versionNo);

            if (fileVersion.Id.ToString().ToLower() == HttpContext.Request.Headers.IfNoneMatch.ToString().ToLower())
                return StatusCode(304);

            var fileContents = await _fileService.GetStreamAsync(fileVersion);
            await _fileService.MarkDownloadedAsync(fileVersion);

            HttpContext.Response.Headers.CacheControl = "no-cache, max-age=600"; //ten minuts
            HttpContext.Response.Headers.ETag = fileVersion.Id.ToString().ToLower();

            return File(fileContents, fileVersion.FileType.GetContentType(), fileVersion.FileName);
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
            if (input.File == null)
                ModelState.AddModelError(nameof(input.File), $"{nameof(input.File)} must not be null");

            if (string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId))
                ModelState.AddModelError(nameof(input.OwnerType), $"{nameof(input.OwnerType)} must not be null when {nameof(input.OwnerId)} is specified");

            if (!ModelState.IsValid)
                throw new AbpValidationException("An error occured");//, ModelState.Keys.Select(k => new ValidationResult(ModelState.Values[k], new List<string>() { k })));

            object owner = null;

            if (!input.OwnerType.IsNullOrEmpty() && !input.OwnerId.IsNullOrEmpty())
            {
                owner = await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId);
                if (owner == null)
                    throw new Exception($"Owner not found (type = '{input.OwnerType}', id = '{input.OwnerId}')");
            }

            var uploadedFile = new StoredFileDto();
            var fileName = input.File.FileName.CleanupFileName();

            if (owner != null && !input.PropertyName.IsNullOrWhiteSpace())
            {
                StoredFileVersion fileVersion = null;

                // single file upload (stored as a property of an entity)
                var property = ReflectionHelper.GetProperty(owner, input.PropertyName, out owner);
                if (property == null || property.PropertyType != typeof(StoredFile))
                    throw new AbpValidationException(
                        $"Property '{input.PropertyName}' not found in class '{owner.GetType().FullName}'");
                if (property != null && !typeof(StoredFile).IsAssignableFrom(property.PropertyType))
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
                            if (!input.OwnerName.IsNullOrEmpty())
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
                            if (!input.OwnerType.IsNullOrEmpty())
                            { 
                                // otherwise - mark as temporary
                                file.Temporary = true;
                            }
                        }
                        file.Category = input.FilesCategory.ToCamelCase();
                    });

                    await _unitOfWorkManager.Current.SaveChangesAsync();
                    MapStoredFile(fileVersion, uploadedFile);
                }
            }

            /*
             * 1. property of entity (ownerid+type+property)
             * 2. attachments list (ownerid+type+category)
             * 3. direct upload using id (id)
             */

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
            if (input.File == null)
                ModelState.AddModelError(nameof(input.File), $"{nameof(input.File)} must not be null");

            if (!ModelState.IsValid)
                throw new AbpValidationException("An error occured");//, ModelState.Keys.Select(k => new ValidationResult(ModelState.Values[k], new List<string>() { k })));

            var uploadedFile = new StoredFileDto();
            var fileName = input.File.FileName.CleanupFileName();

            StoredFile storedFile;

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
                        file.Category = input.FilesCategory.ToCamelCase();
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


        private List<ValidationResult> GetValidationResults(ModelStateDictionary modelState)
        {
            var idx = 0;
            var values = modelState.Values.Select(v => new { Idx = idx++, Value = v }).ToList();
            idx = 0;
            var keys = modelState.Keys.Select(k => new { Idx = idx++, Key = k }).ToList();

            var errors = values.Where(v => v.Value.Errors.Any()).Select(v => new
            {
                Key = keys[v.Idx].Key,
                State = v.Value.Errors.Select(e => e.ErrorMessage)

            })
                .Select(s => new ValidationResult(StringHelper.Delimited(s.State, "; "), new List<string> { s.Key }))
                .ToList();

            return errors;
        }

        [HttpPost, Route("UploadNewVersion")]
        [Consumes("multipart/form-data")]
        public async Task<StoredFileDto> UploadNewVersionAsync([FromForm] UploadFileVersionInput input)
        {
            var storedFile = await _fileRepository.GetAsync(input.Id);

            if (input.File == null)
                ModelState.AddModelError(nameof(input.File), $"{nameof(input.File)} must not be null");

            if (!ModelState.IsValid)
                throw new AbpValidationException("An error occured", GetValidationResults(ModelState));

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

        private StoredFileDto GetFileDto(StoredFileVersion fileVersion)
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
        public async Task<bool> Delete([FromQuery] DeleteStoredFileInput input)
        {
            var ownerSpecified =
                !string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId);

            if (input.FileId == null && string.IsNullOrWhiteSpace(input.OwnerId) && !string.IsNullOrWhiteSpace(input.OwnerType))
                ModelState.AddModelError(nameof(input.OwnerId), $"{nameof(input.OwnerId)} must not be null when {nameof(input.OwnerType)} is specified");

            if (input.FileId == null && string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId))
                ModelState.AddModelError(nameof(input.OwnerType), $"{nameof(input.OwnerType)} must not be null when {nameof(input.OwnerId)} is specified");

            if (input.FileId == null && string.IsNullOrWhiteSpace(input.PropertyName))
            {
                ModelState.AddModelError(nameof(input.FileId), $"Id must not be null");
            }

            var owner = ownerSpecified
                ? await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId)
                : null;
            if (ownerSpecified && owner == null)
            if (ownerSpecified && owner == null)
            {
                ModelState.AddModelError(input.OwnerId, $"Owner not found (type = '{input.OwnerType}', id = '{input.OwnerId}')");
            }

            var processAsProperty = owner != null && !string.IsNullOrWhiteSpace(input.PropertyName);
            var property = processAsProperty
                ? ReflectionHelper.GetProperty(owner, input.PropertyName, out owner)
                : null;
            if (processAsProperty)
            {
                if (property == null)
                    ModelState.AddModelError(nameof(input.PropertyName), $"Property '{owner.GetType().Name}.{input.PropertyName}' not found");

                if (property != null && !typeof(StoredFile).IsAssignableFrom(property.PropertyType))
                    ModelState.AddModelError(nameof(input.PropertyName), $"Wrong type of '{owner.GetType().Name}.{input.PropertyName}' property (actual: '{property.PropertyType.FullName}', expected: '{nameof(StoredFile)}')");
            }

            if (!ModelState.IsValid)
                throw new AbpValidationException("Failed to delete file", GetValidationResults(ModelState));

            var storedFile = input.FileId != null
                ? await _fileRepository.GetAll().FirstOrDefaultAsync(f => f.Id == input.FileId.Value)
                : property != null
                    ? property.GetValue(owner) as StoredFile
                    : !input.FileCategory.IsNullOrWhiteSpace()
                        ? await _fileRepository.GetAll().FirstOrDefaultAsync(f => f.Owner == null && f.Category == input.FileCategory)
                        : null;

            if (storedFile != null)
            {
                // if the `property` is specified - then it's direct link and we should set it to null
                if (property != null)
                {
                    property.SetValue(owner, null, null);
                    await _dynamicRepository.SaveOrUpdateAsync(owner);
                }

                await _fileService.DeleteAsync(storedFile);
            }

            return true;
        }

        /// <summary>
        /// Download zip archive of all files linked to a specified entity
        /// </summary>
        [HttpGet, Route("DownloadZip")]
        public async Task<FileStreamResult> DownloadZipAsync([FromQuery] FilesListInput input)
        {
            IList<StoredFile> files = new List<StoredFile>();
            if (input.OwnerId.IsNullOrEmpty())
            {
                if (input.FilesId?.Count > 0)
                {
                    foreach (var fileId in input.FilesId)
                    {
                        files.Add(_fileService.GetOrNull(fileId));
                    }
                    files = files.Where(x => x != null).ToList();
                }
            }
            else
            {
                var ownerId = input.OwnerId;
                var ownerType = input.OwnerType;
                if (!input.OwnerName.IsNullOrEmpty())
                {
                    var owner = await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId);
                    var prop = ReflectionHelper.GetProperty(owner, input.OwnerName, out owner);
                    if (prop == null)
                        throw new AbpValidationException($"Property '{input.OwnerName}' not found in class '{owner.GetType().FullName}'");
                    owner = prop.GetValue(owner);
                    if (owner == null)
                        throw new AbpValidationException($"Owner '{input.OwnerName}' is empty");
                    ownerId = owner.GetType().GetProperty("Id")?.GetValue(owner, null).ToString();
                    ownerType = owner.GetType().StripCastleProxyType().FullName;
                }

                files = input.FilesCategory.IsNullOrEmpty()
                    ? await _fileService.GetAttachmentsAsync(ownerId, ownerType)
                    : await _fileService.GetAttachmentsOfCategoryAsync(ownerId, ownerType, input.FilesCategory.ToCamelCase());
            }

            if (files?.Count > 0)
            {
                // todo: move zip support to the FileService, current implementation doesn't support Azure
                var list = _fileService.MakeUniqueFileNames(files);

                var compressedStream = await CompressionService.CompressFilesAsync(list);

                // note: compressedStream will be disposed automatically in the FileStreamResult
                return File(compressedStream, "multipart/x-zip", "files.zip");
            }

            throw new AbpValidationException("Files not found");
        }

        /// <summary>
        /// Get list of files attached to a specified entity
        /// </summary>
        [HttpGet, Route("FilesList")]
        public async Task<List<StoredFileDto>> FilesList([FromQuery] FilesListInput input)
        {
            if (string.IsNullOrEmpty(input.OwnerType))
                throw new Exception($"`{nameof(input.OwnerType)}` must not be null");
            if (string.IsNullOrEmpty(input.OwnerId))
                throw new Exception($"`{nameof(input.OwnerId)}` must not be null");

            var owner = await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId);

            if (owner == null)
                throw new Exception($"Entity `{input.OwnerType}` `{input.OwnerId}` not found");

            if (!input.OwnerName.IsNullOrEmpty())
            {
                var prop = ReflectionHelper.GetProperty(owner, input.OwnerName, out owner);
                owner = prop.GetValue(owner);
                if (owner == null)
                    return new List<StoredFileDto>();
            }

            var id = owner.GetId();
            var type = owner.GetType().StripCastleProxyType().FullName;
            var fileVersions = input.FilesCategory.IsNullOrEmpty()
                ? await _fileService.GetLastVersionsOfAttachmentsAsync(id, type)
                : await _fileService.GetLastVersionsOfAttachmentsAsync(id, type, input.FilesCategory.ToCamelCase());

            var list = fileVersions.Select(v => GetFileDto(v)).ToList();
            return list;
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
            if (input.File == null)
                ModelState.AddModelError(nameof(input.File), $"{nameof(input.File)} must not be null");

            var ownerSpecified =
                !string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId);

            if (string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId))
                ModelState.AddModelError(nameof(input.OwnerType), $"{nameof(input.OwnerType)} must not be null when {nameof(input.OwnerId)} is specified");

            if (input.Id == null && input.PropertyName.IsNullOrWhiteSpace() && !ownerSpecified && input.FilesCategory.IsNullOrWhiteSpace())
            {
                ModelState.AddModelError(nameof(input.Id), $"Id must not be null");
            }

            var hasProperty = !string.IsNullOrWhiteSpace(input.PropertyName);

            var owner = ownerSpecified && hasProperty
                ? await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId)
                : null;
            if (ownerSpecified && owner == null)
            {
                ModelState.AddModelError(input.OwnerId, $"Owner not found (type = '{input.OwnerType}', id = '{input.OwnerId}')");
            }

            var uploadAsProperty = owner != null && hasProperty;
            var property = uploadAsProperty
                ? ReflectionHelper.GetProperty(owner, input.PropertyName, out owner)
                : null;
            if (uploadAsProperty)
            {
                if (property == null)
                    ModelState.AddModelError(nameof(input.PropertyName), $"Property '{owner.GetType().Name}.{input.PropertyName}' not found");

                if (property != null && !typeof(StoredFile).IsAssignableFrom(property.PropertyType))
                    ModelState.AddModelError(nameof(input.PropertyName), $"Wrong type of '{owner.GetType().Name}.{input.PropertyName}' property (actual: '{property.PropertyType.FullName}', expected: '{nameof(StoredFile)}')");
            }

            if (!ModelState.IsValid)
                throw new AbpValidationException("Failed to upload file", GetValidationResults(ModelState));

            StoredFile storedFile;
            StoredFileVersion fileVersion;
            // allow to use predefined Id and re-activate existing storedfile
            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                storedFile = input.Id != null
                    ? await _fileRepository.GetAll().FirstOrDefaultAsync(f => f.Id == input.Id.Value)
                    : property != null && owner != null
                        ? property.GetValue(owner) as StoredFile
                        : !input.FilesCategory.IsNullOrWhiteSpace()
                            ? await _fileRepository.FirstOrDefaultAsync(x => x.Owner == null && x.Category == input.FilesCategory)
                            : null;
            }

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

                    if (ownerSpecified)
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
        public async Task<StoredFileDto> GetAsync(Guid id)
        {
            var storedFile = await _fileRepository.GetAsync(id);

            return storedFile != null && !storedFile.IsDeleted
                ? GetFileDto(storedFile.LastVersion())
                : null;
        }

        /// <summary>
        /// Get file as property of the entity
        /// </summary>
        /// <returns></returns>
        [HttpGet, Route("EntityProperty")]
        public async Task<StoredFileDto> GetEntityPropertyAsync([FromQuery] StoredFileAsPropertyDto input)
        {
            var hasOwner = !input.OwnerType.IsNullOrWhiteSpace() && !input.OwnerId.IsNullOrWhiteSpace();
            var hasProperty = !input.PropertyName.IsNullOrWhiteSpace();
            var hasCategory = !input.FileCategory.IsNullOrWhiteSpace();
            if ((!hasOwner || !hasProperty) && !hasCategory)
                return null;

            if (hasOwner)
            {
                var entity = await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId);
                if (entity == null)
                    return null;

                var property = ReflectionHelper.GetProperty(entity, input.PropertyName, out var owner);
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
                    return  GetFileDto(version);
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

        private string GetUploadedBy(Int64? userId) 
        {
            if (userId == null) 
                return string.Empty;

            var person = _personRepository.GetAll().FirstOrDefault(p => p.User != null && p.User.Id == userId);
            return person?.FullName;
        }

        #endregion
    }
}
