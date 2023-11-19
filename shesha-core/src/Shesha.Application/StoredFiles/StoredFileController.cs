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
using NHibernate.Linq;
using Shesha.Domain;
using Shesha.EntityReferences;
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
    [AbpMvcAuthorize()]
    public class StoredFileController : ControllerBase, ITransientDependency
    {
        private readonly IStoredFileService _fileService;
        private readonly IRepository<StoredFile, Guid> _fileRepository;
        private readonly IRepository<StoredFileVersion, Guid> _fileVersionRepository;
        private readonly IDynamicRepository _dynamicRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        /// <summary>
        /// Reference to the object to object mapper.
        /// </summary>
        public IObjectMapper ObjectMapper { get; set; }

        public StoredFileController(IRepository<StoredFile, Guid> fileRepository,
            IRepository<StoredFileVersion, Guid> fileVersionRepository, IStoredFileService fileService,
            IDynamicRepository dynamicRepository, IUnitOfWorkManager unitOfWorkManager)
        {
            _fileService = fileService;
            _fileRepository = fileRepository;
            _fileVersionRepository = fileVersionRepository;
            _dynamicRepository = dynamicRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }

        [HttpGet, Route("Download")]
        public async Task<FileStreamResult> Download(Guid id, int? versionNo)
        {
            // todo: convert to async call
            var fileVersion = await GetStoredFileVersionAsync(id, versionNo);
            var fileContents = await _fileService.GetStreamAsync(fileVersion);
            await _fileService.MarkDownloadedAsync(fileVersion);

            // note: fileContents will be disposed automatically in the FileStreamResult 
            return File(fileContents, fileVersion.FileType.GetContentType(), fileVersion.FileName);
        }

        [HttpGet, Route("Base64String")]
        public async Task<IActionResult> GetBase64StringAsync(Guid id, int? versionNo)
        {
            var fileVersion = await GetStoredFileVersionAsync(id, versionNo);
            var fileContents = await _fileService.GetStreamAsync(fileVersion);

            using (var memoryStream = new MemoryStream())
            {
                await fileContents.CopyToAsync(memoryStream);
                var base64String = Convert.ToBase64String(memoryStream.ToArray());

                // You can return the base64 string as a JSON object or any other desired format
                return Ok(new { Base64String = base64String });
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
                // single file upload (stored as a property of an entity)
                var property = ReflectionHelper.GetProperty(owner, input.PropertyName, out owner);
                if (property == null || property.PropertyType != typeof(StoredFile))
                    throw new Exception(
                        $"Property '{input.PropertyName}' not found in class '{owner.GetType().FullName}'");

                if (property.GetValue(owner, null) is StoredFile storedFile)
                {
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
                }
                else
                {
                    await using (var fileStream = input.File.OpenReadStream())
                    {
                        storedFile = await _fileService.SaveFileAsync(fileStream, fileName);
                        property.SetValue(owner, storedFile, null);
                    }
                }

                await _unitOfWorkManager.Current.SaveChangesAsync();
                MapStoredFile(storedFile, uploadedFile);
            }
            else
            {
                // add file as an attachment (linked to an entity using OwnerType and OwnerId)
                await using (var fileStream = input.File.OpenReadStream())
                {
                    var storedFile = await _fileService.SaveFileAsync(fileStream, fileName, file =>
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
                            // otherwise - mark as temporary
                            file.Temporary = true;
                        }
                        file.Category = input.FilesCategory.ToCamelCase();
                    });

                    await _unitOfWorkManager.Current.SaveChangesAsync();
                    MapStoredFile(storedFile, uploadedFile);
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
                    storedFile = await _fileService.SaveFileAsync(fileStream, fileName, file =>
                    {
                        if (input.Id.HasValue && input.Id.Value != Guid.Empty)
                            file.Id = input.Id.Value;
                        file.Category = input.FilesCategory.ToCamelCase();
                    });

                    await _unitOfWorkManager.Current.SaveChangesAsync();
                    MapStoredFile(storedFile, uploadedFile);
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

                MapStoredFile(storedFile, uploadedFile);
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

            MapStoredFile(storedFile, uploadedFile);
            return uploadedFile;
        }

        private StoredFileDto GetFileDto(StoredFile file)
        {
            var dto = new StoredFileDto();
            MapStoredFile(file, dto);
            return dto;
        }

        private void MapStoredFile(StoredFile file, StoredFileDto fileDto)
        {
            fileDto.Id = file.Id;
            fileDto.FileCategory = file.Category;
            fileDto.Name = file.FileName;
            fileDto.Url = Url.Action("Download", new { file.Id });
            fileDto.Size = file.LastVersion()?.FileSize ?? 0;
            fileDto.Type = !string.IsNullOrWhiteSpace(file.FileName)
                ? Path.GetExtension(file.FileName)
                : null;
            fileDto.Temporary = file.Temporary;
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
        public async Task<FileStreamResult> DownloadZipAsync([FromQuery] DownloadZipInput input)
        {
            var files = input.AllCategories
                ? await _fileService.GetAttachmentsAsync(input.OwnerId, input.OwnerType)
                : await _fileService.GetAttachmentsOfCategoryAsync(input.OwnerId, input.OwnerType, input.FilesCategory.ToCamelCase());

            // todo: move zip support to the FileService, current implementation doesn't support Azure
            var list = _fileService.MakeUniqueFileNames(files);

            var compressedStream = await CompressionService.CompressFiles(list);

            // note: compressedStream will be disposed automatically in the FileStreamResult
            return File(compressedStream, "multipart/x-zip", "files.zip");
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
                var prop = ReflectionHelper.GetProperty(owner, input.OwnerName);
                owner = prop.GetValue(owner);
                if (owner == null)
                    return new List<StoredFileDto>();
            }

            var id = owner.GetId();
            var type = owner.GetType().StripCastleProxyType().FullName;
            var files = input.AllCategories
                ? await _fileService.GetAttachmentsAsync(id, type)
                : await _fileService.GetAttachmentsOfCategoryAsync(id, type, input.FilesCategory.ToCamelCase());

            var list = files.Select(sf => GetFileDto(sf)).ToList();
            return list;
        }

        #region REST

        /*
        /// <summary>
        /// Create new file
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPost, Route("")]
        [Consumes("multipart/form-data")]
        public async Task<StoredFileDto> CreateAsync([FromForm] CreateStoredFileInput input)
        {
            if (input.File == null)
                ModelState.AddModelError(nameof(input.File), $"{nameof(input.File)} must not be null");

            if (string.IsNullOrWhiteSpace(input.OwnerId) && !string.IsNullOrWhiteSpace(input.OwnerType))
                ModelState.AddModelError(nameof(input.OwnerId), $"{nameof(input.OwnerId)} must not be null when {nameof(input.OwnerType)} is specified");

            if (string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId))
                ModelState.AddModelError(nameof(input.OwnerType), $"{nameof(input.OwnerType)} must not be null when {nameof(input.OwnerId)} is specified");

            if (input.Id.HasValue)
            {
                using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                {
                    if (await _fileRepository.GetAll().AnyAsync(f => f.Id == input.Id.Value))
                        ModelState.AddModelError(nameof(input.Id), $"File with Id='{input.Id}' already exists");
                }
            }

            if (!string.IsNullOrWhiteSpace(input.OwnerType) && !string.IsNullOrWhiteSpace(input.OwnerId))
            {
                var owner = await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId);
                if (owner == null)
                    ModelState.AddModelError(input.OwnerId, $"Owner not found (type = '{input.OwnerType}', id = '{input.OwnerId}')");
            }

            if (!ModelState.IsValid)
                throw new AbpValidationException("Failed to upload file", GetValidationResults(ModelState));

            var uploadedFile = new StoredFileDto();
            var fileName = input.File.FileName.CleanupFileName();

            // add file as an attachment (linked to an entity using OwnerType and OwnerId)
            await using (var fileStream = input.File.OpenReadStream())
            {
                var storedFile = await _fileService.SaveFile(fileStream, fileName, file =>
                {
                    if (input.Id.HasValue)
                        file.Id = input.Id.Value;
                    file.SetOwner(input.OwnerType, input.OwnerId);
                    file.Category = input.FilesCategory;
                });

                await _unitOfWorkManager.Current.SaveChangesAsync();
                MapStoredFile(storedFile, uploadedFile);
            }

            return uploadedFile;
        }
        */

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

            if (input.Id == null && string.IsNullOrWhiteSpace(input.PropertyName))
            {
                ModelState.AddModelError(nameof(input.Id), $"Id must not be null");
            }

            var owner = ownerSpecified
                ? await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId)
                : null;
            if (ownerSpecified && owner == null)
            {
                ModelState.AddModelError(input.OwnerId, $"Owner not found (type = '{input.OwnerType}', id = '{input.OwnerId}')");
            }

            var uploadAsProperty = owner != null && !string.IsNullOrWhiteSpace(input.PropertyName);
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
            // allow to use predefined Id and re-activate existing storedfile
            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
            {
                storedFile = input.Id != null
                    ? await _fileRepository.GetAll().FirstOrDefaultAsync(f => f.Id == input.Id.Value)
                    : property != null && owner != null
                        ? property.GetValue(owner) as StoredFile
                        : null;
            }

            var fileName = input.File.FileName.CleanupFileName();

            if (storedFile == null)
            {
                await using (var fileStream = input.File.OpenReadStream())
                {
                    storedFile = await _fileService.SaveFileAsync(fileStream, fileName, file =>
                    {
                        // set predefined Id
                        if (input.Id.HasValue && input.Id.Value != Guid.Empty)
                            file.Id = input.Id.Value;
                    });

                    // set property if needed
                    if (property != null && owner != null)
                    {
                        property.SetValue(owner, storedFile, null);
                        await _dynamicRepository.SaveOrUpdateAsync(owner);
                    }
                    else if (owner == null && !input.PropertyName.IsNullOrEmpty())
                    {
                        storedFile.Temporary = true;
                    }
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
            }

            var uploadedFile = new StoredFileDto();
            await _unitOfWorkManager.Current.SaveChangesAsync();
            MapStoredFile(storedFile, uploadedFile);

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
                ? GetFileDto(storedFile)
                : null;
        }

        /// <summary>
        /// Get file as property of the entity
        /// </summary>
        /// <returns></returns>
        [HttpGet, Route("EntityProperty")]
        public async Task<StoredFileDto> GetEntityPropertyAsync([FromQuery] StoredFileAsPropertyDto input)
        {
            if (string.IsNullOrWhiteSpace(input.OwnerType) ||
                string.IsNullOrWhiteSpace(input.OwnerId) ||
                string.IsNullOrWhiteSpace(input.PropertyName))
                return null;

            var entity = await _dynamicRepository.GetAsync(input.OwnerType, input.OwnerId);
            if (entity == null)
                return null;

            var property = ReflectionHelper.GetProperty(entity, input.PropertyName, out var owner);
            if (property == null)
                throw new Exception($"Property '{input.PropertyName}' not found in the class {owner.GetType().Name}");

            if (!(property.GetValue(owner) is StoredFile storedFile && !storedFile.IsDeleted))
                return null;

            return GetFileDto(storedFile);
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

            return ObjectMapper.Map<List<StoredFileVersionInfoDto>>(documentUploads);
        }

        #endregion
    }
}
