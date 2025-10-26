using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using JetBrains.Annotations;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Shesha.Services.StoredFiles
{
    public abstract class StoredFileServiceBase
    {
        /// <summary>
        /// File repository
        /// </summary>
        protected readonly IRepository<StoredFile, Guid> FileRepository;

        /// <summary>
        /// Version repository
        /// </summary>
        protected readonly IRepository<StoredFileVersion, Guid> VersionRepository;

        /// <summary>
        /// Entity configuration store
        /// </summary>
        public IEntityConfigurationStore EntityConfigurationStore { get; set; }

        protected StoredFileServiceBase(IRepository<StoredFile, Guid> fileService, IRepository<StoredFileVersion, Guid> versionService)
        {
            FileRepository = fileService;
            VersionRepository = versionService;
        }

        #region  GetAttachmentsAsync

        /// <summary>
        /// Returns list of files attached to the specified entity with the specified <paramref name="fileCategory"/>
        /// </summary>
        public async Task<IList<StoredFile>> GetAttachmentsOfCategoryAsync<TId>([NotNull] IEntity<TId> owner, string? fileCategory)
        {
            return await GetAttachmentsInternalAsync(owner.Id, owner.GetTypeShortAlias(), f => f.Category == fileCategory);
        }

        /// <summary>
        /// Returns list of files attached to the entity with the specified <paramref name="id"/>, <paramref name="typeShortAlias"/> and <paramref name="fileCategory"/>
        /// </summary>
        public async Task<IList<StoredFile>> GetAttachmentsOfCategoryAsync<TId>(TId id, string typeShortAlias, string? fileCategory)
        {
            return await GetAttachmentsInternalAsync(id, typeShortAlias, f => f.Category == fileCategory);
        }

        /// <summary>
        /// Returns list of files attached to the specified entity irrespectively of file category
        /// </summary>
        public async Task<IList<StoredFile>> GetAttachmentsAsync<TId>(IEntity<TId> owner)
        {
            return await GetAttachmentsInternalAsync(owner.Id, owner.GetTypeShortAlias());
        }

        /// <summary>
        /// Returns list of files attached to the entity with the specified <paramref name="id"/>, <paramref name="typeShortAlias"/>
        /// </summary>
        public async Task<IList<StoredFile>> GetAttachmentsAsync<TId>(TId id, string typeShortAlias)
        {
            return await GetAttachmentsInternalAsync(id, typeShortAlias);
        }

        private async Task<IList<StoredFile>> GetAttachmentsInternalAsync<TId>(TId id, string typeShortAlias, Expression<Func<StoredFile, bool>>? filterPredicate = null)
        {
            return await GetAttachmentsQuery(id, typeShortAlias, filterPredicate).OrderBy(e => e.SortOrder).ToListAsync();
        }

        private async Task<IList<StoredFileVersion>> GetLastVersionsOfAttachmentsInternalAsync<TId>(TId id, string typeShortAlias, Expression<Func<StoredFileVersion, bool>>? filterPredicate = null)
        {
            return await GetAttachmentsLastVersionsQuery(id, typeShortAlias, filterPredicate).OrderBy(e => e.File.SortOrder).ToListAsync();
        }

        public async Task<IList<StoredFileVersion>> GetLastVersionsOfAttachmentsAsync<TId>(TId id, string typeShortAlias, string? fileCategory)
        {
            return await GetLastVersionsOfAttachmentsInternalAsync(id, typeShortAlias, f => f.File.Category == fileCategory);
        }
        public async Task<IList<StoredFileVersion>> GetLastVersionsOfAttachmentsAsync<TId>(TId id, string typeShortAlias)
        {
            return await GetLastVersionsOfAttachmentsInternalAsync(id, typeShortAlias);
        }

        #endregion

        #region HasAttachments

        public async Task<bool> HasAttachmentsOfCategoryAsync<TId>(IEntity<TId> owner, string? fileCategory)
        {
            return await HasAttachmentsOfCategoryAsync(owner.Id, owner.GetTypeShortAlias(), fileCategory);
        }

        public async Task<bool> HasAttachmentsOfCategoryAsync<TId>(TId id, string typeShortAlias, string? fileCategory)
        {
            return await GetAttachmentsQuery(id, typeShortAlias, f => f.Category == fileCategory).AnyAsync();
        }

        #endregion

        #region GetStreamAsync (file download)

        public abstract Task<Stream> GetStreamAsync(StoredFileVersion fileVersion);
        public abstract Stream GetStream(StoredFileVersion fileVersion);

        /// <summary>
        /// Returns content of last version for specified file
        /// </summary>
        /// <param name="file">StoredFile object</param>
        /// <returns>file content</returns>
        public async Task<Stream> GetStreamAsync(StoredFile file)
        {
            var lastVersion = await GetLastVersionAsync(file);
            return await GetStreamAsync(lastVersion);
        }

        public Stream GetStream(StoredFile file)
        {
            var lastVersion = GetLastVersion(file) ?? throw new EntityNotFoundException($"Failed to find last version of stored file '{file.Id}'");
            return GetStream(lastVersion);
        }

        #endregion

        #region Copy between owners

        /// <summary>
        /// Copy file to a new owner
        /// </summary>
        public virtual async Task<StoredFile> CopyToOwnerAsync<TId>(StoredFile file, IEntity<TId> newOwner, bool throwCopyException = true)
        {
            // todo: move to the base class and reuse in the AzureFileService

            var newFile = new StoredFile
            {
                Description = file.Description,
                FileName = file.FileName,
                FileType = file.FileType,
                Folder = file.Folder,
                IsVersionControlled = file.IsVersionControlled,
                Category = file.Category,
                Owner = new GenericEntityReference(newOwner)
            };
            await FileRepository.InsertAsync(newFile);

            // copy versions
            var versions = await GetFileVersionsAsync(file);
            foreach (var version in versions)
            {
                var newVersion = new StoredFileVersion
                {
                    File = newFile,
                    VersionNo = version.VersionNo,
                    FileName = version.FileName,
                    FileType = version.FileType,
                    FileSize = version.FileSize,
                    IsLast = version.IsLast,
                };

                await VersionRepository.InsertAsync(newVersion);

                // copy file on the disk
                try
                {
                    try
                    {
                        CopyFile(version, newVersion);
                    }
                    catch (FileNotFoundException)
                    {
                        // If we copy missing file, don't fail.
                    }
                }
                catch (Exception)
                {
                    if (throwCopyException)
                        throw;
                }
            }

            return newFile;
        }

        /// <summary>
        /// Copy files to new owner
        /// </summary>
        public async Task CopyAttachmentsToAsync<TSourceId, TDestinationId>(IEntity<TSourceId> source, IEntity<TDestinationId> destination)
        {
            var files = await GetAttachmentsAsync(source);

            foreach (var file in files)
            {
                await CopyToOwnerAsync(file, destination);
            }
        }

        #endregion

        private IQueryable<StoredFile> GetAttachmentsQuery<TId>(TId id, string typeShortAlias, Expression<Func<StoredFile, bool>>? filterPredicate = null)
        {
            IQueryable<StoredFile>? query = null;
            var ecs = StaticContext.IocManager.Resolve<IEntityConfigurationStore>();
            var config = ecs.Get(typeShortAlias);
            var stringId = id?.ToString().NotNullOrWhiteSpace();
            if (config != null)
            {
                var className = config.EntityType.FullName;

                query = FileRepository.GetAll().Where(e => e.Owner != null && e.Owner.Id == stringId);
                query = config.HasTypeShortAlias
                    ? query.Where(e => e.Owner != null && (e.Owner._className == className || e.Owner._className == config.TypeShortAlias))
                    : query.Where(e => e.Owner != null && e.Owner._className == className);

                if (filterPredicate != null)
                    query = query.Where(filterPredicate);
            }
            else
            {
                query = FileRepository.GetAll().Where(e => e.Owner != null && e.Owner.Id == stringId && e.Owner._className == typeShortAlias);
                if (filterPredicate != null)
                    query = query.Where(filterPredicate);
            }

            return query;
        }

        private IQueryable<StoredFileVersion> GetAttachmentsLastVersionsQuery<TId>(TId id, string typeShortAlias, Expression<Func<StoredFileVersion, bool>>? filterPredicate = null)
        {
            IQueryable<StoredFileVersion> query = VersionRepository.GetAll().Where(e => e.IsLast);

            var ecs = StaticContext.IocManager.Resolve<IEntityConfigurationStore>();
            var config = ecs.Get(typeShortAlias);
            var stringId = id?.ToString().NotNullOrWhiteSpace();

            if (config != null)
            {
                var className = config.EntityType.FullName;

                query = VersionRepository.GetAll().Where(e => e.File.Owner != null && e.File.Owner.Id == stringId);
                query = config.HasTypeShortAlias
                    ? query.Where(e => e.File.Owner != null && (e.File.Owner._className == className || e.File.Owner._className == config.TypeShortAlias))
                    : query.Where(e => e.File.Owner != null && e.File.Owner._className == className);

                if (filterPredicate != null)
                    query = query.Where(filterPredicate);
            }
            else
            {
                query = VersionRepository.GetAll().Where(e => e.File.Owner != null && e.File.Owner.Id == stringId && e.File.Owner._className == typeShortAlias);
                if (filterPredicate != null)
                    query = query.Where(filterPredicate);
            }

            return query;
        }

        public Task MarkDownloadedAsync(StoredFileVersion fileVersion)
        {
            // todo: implement

            return Task.CompletedTask;            
        }

        /// <summary>
        /// Returns list of file categories of the files attached  to the specified owner
        /// </summary>
        /// <typeparam name="TId"></typeparam>
        /// <param name="owner"></param>
        /// <returns></returns>
        public async Task<IList<string>> GetAttachmentsCategoriesAsync<TId>(IEntity<TId> owner)
        {
            var categories = await GetAttachmentsQuery(owner.Id, owner.GetTypeShortAlias()).Select(f => f.Category).Distinct().ToListAsync();
            return categories.WhereNotNullOrWhiteSpace().ToList();
        }

        /// <summary>
        /// Create new version for the specified file and return StoredFileVersion object.
        /// If file isn't version controlled - default version will be returned
        /// </summary>
        /// <param name="file">file object</param>
        /// <returns>StoredFileVersion object (not saved to DB if file is version controlled)</returns>
        public async Task<StoredFileVersion> GetNewOrDefaultVersionAsync([NotNull]StoredFile file)
        {
            if (file == null)
                throw new Exception("file should not be null");

            var lastVersion = await GetLastVersionAsync(file);

            if (file.IsVersionControlled || lastVersion == null)
            {
                var newVersion = new StoredFileVersion
                {
                    File = file,
                    VersionNo = (lastVersion?.VersionNo ?? 0) + 1,
                    FileName = file.FileName,
                    FileType = file.FileType,
                    IsLast = true,
                };

                await VersionRepository.InsertAsync(newVersion);

                return newVersion;
            } else
                return lastVersion;
        }

        /// <summary>
        /// Renames specified <paramref name="file"/>
        /// </summary>
        /// <param name="file"></param>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public async Task RenameFileAsync(StoredFile file, string fileName)
        {
            file.FileName = fileName;
            file.FileType = Path.GetExtension(fileName);
            await FileRepository.UpdateAsync(file);

            var lastVersion = await GetLastVersionAsync(file);
            if (lastVersion != null)
            {
                lastVersion.FileName = file.FileName;
                lastVersion.FileType = file.FileType;

                await VersionRepository.UpdateAsync(lastVersion);
            }
        }

        private IQueryable<StoredFileVersion> QueryLastVersion(Guid fileId)
        {
            return VersionRepository.GetAll().Where(v => v.File.Id == fileId && v.IsLast);
        }

        /// <summary>
        /// Get last version of file with the specified Id (<paramref name="fileId"/>)
        /// </summary>
        /// <param name="fileId">File Id</param>
        /// <returns></returns>
        protected async Task<StoredFileVersion> GetLastVersionAsync(Guid fileId) 
        {
            return await QueryLastVersion(fileId).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Get last version of file with the specified Id (<paramref name="fileId"/>)
        /// </summary>
        /// <param name="fileId">File Id</param>
        /// <returns></returns>
        protected StoredFileVersion? GetLastVersion(Guid fileId)
        {
            return QueryLastVersion(fileId).FirstOrDefault();
        }

        /// <summary>
        /// Get last version of the <paramref name="file"/>
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        public async Task<StoredFileVersion> GetLastVersionAsync(StoredFile file)
        {
            return await GetLastVersionAsync(file.Id);
        }

        /// <summary>
        /// Get last version of the <paramref name="file"/>
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        public StoredFileVersion? GetLastVersion(StoredFile file)
        {
            return GetLastVersion(file.Id);
        }

        /// <summary>
        /// Returns all versions of the specified <paramref name="file"/>
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        public async Task<List<StoredFileVersion>> GetFileVersionsAsync(StoredFile file)
        {
            return await VersionRepository.GetAll()
                .Where(v => v.File == file)
                .OrderByDescending(v => v.VersionNo)
                .ToListAsync();
        }

        /// <summary>
        /// returns next SortOrder for the new file
        /// </summary>
        protected async Task<int> GetNextSortOrderAsync<TId>(TId ownerId, string ownerType, Int64? category = null)
        {
            return string.IsNullOrWhiteSpace(ownerType) || ownerId == null
                ? 0
                : await GetAttachmentsQuery(ownerId, ownerType).MaxOrDefaultAsync(f => f.SortOrder, -1 /*count from 0*/) + 1;
        }

        /// <summary>
        /// Prepares a dictionary of files with unique file names as a key. Renames duplicated files like this `[fileName] ([num]).[extension]`
        /// </summary>
        public Dictionary<string, StoredFile> MakeUniqueFileNames(IList<StoredFile> files)
        {
            var uniqueList = new Dictionary<string, StoredFile>();

            // make file names unique
            var groups = files.GroupBy(f => f.FileName.ToLower(), f => f, (fileName, groupFiles) => new {
                FileName = files.FirstOrDefault()?.FileName,
                Files = groupFiles.ToList()
            }).ToList();

            foreach (var group in groups)
            {
                for (var i = 0; i < group.Files.Count(); i++)
                {
                    var fileName = group.Files[i].FileName;
                    if (i > 0)
                        fileName = $"{Path.GetFileNameWithoutExtension(fileName)} ({i + 1}){Path.GetExtension(fileName)}";

                    uniqueList.Add(fileName, group.Files[i]);
                }
            }

            return uniqueList;
        }

        /// <summary>
        /// Returns true if file exists in the DB and on storage
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public abstract Task<bool> FileExistsAsync(Guid id);

        /// <summary>
        /// Get file by id or null if missing
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public StoredFile GetOrNull(Guid id)
        {
            return FileRepository.FirstOrDefault(f => f.Id == id);
        }

        /// <summary>
        /// Get file by id or null if missing
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<StoredFile> GetOrNullAsync(Guid id)
        {
            return await FileRepository.FirstOrDefaultAsync(f => f.Id == id);
        }

        /// <summary>
        /// Update content of the specified file version
        /// </summary>
        /// <param name="version">File version</param>
        /// <param name="stream">Stream with file data</param>
        public abstract Task UpdateVersionContentAsync(StoredFileVersion version, Stream stream);

        /// inheritedDoc
        public async Task<StoredFileVersion> CreateFileAsync(Stream stream, string fileName, Action<StoredFile>? prepareFileAction = null) 
        {
            if (stream == null)
                throw new Exception($"{nameof(stream)} must not be null");
            if (string.IsNullOrWhiteSpace(fileName))
                throw new Exception($"{nameof(fileName)} must not be null or empty");

            // create new file
            var storedFile = new StoredFile
            {
                FileName = Path.GetFileName(fileName),
                FileType = Path.GetExtension(fileName),
                IsVersionControlled = false
            };
            prepareFileAction?.Invoke(storedFile);
            await FileRepository.InsertAsync(storedFile);

            // create new file version
            var version = await GetNewOrDefaultVersionAsync(storedFile);

            // update content (it will also update file size)
            stream.Seek(0, SeekOrigin.Begin);
            await UpdateVersionContentAsync(version, stream);
            stream.Seek(0, SeekOrigin.Begin);

            // ensure that version is saved
            await VersionRepository.InsertOrUpdateAsync(version);

            return version;
        }

        /// inheritedDoc
        public async Task<StoredFile> SaveFileAsync(Stream stream, string fileName, Action<StoredFile>? prepareFileAction = null)
        {
            var fileVersion = await CreateFileAsync(stream, fileName, prepareFileAction);

            return fileVersion.File;
        }

        /// inheritedDoc
        public async Task<StoredFileVersion> UpdateFileAsync(StoredFile file, Stream stream, string fileName)
        {
            var version = await GetNewOrDefaultVersionAsync(file);

            await UpdateVersionContentAsync(version, stream);

            version.FileName = fileName;
            version.FileType = Path.GetExtension(fileName);
            await VersionRepository.InsertOrUpdateAsync(version);

            return version;
        }

        protected abstract void CopyFile(StoredFileVersion source, StoredFileVersion  destination);

        /// Delete physical file from the storage (disk/blob storage etc.)
        protected abstract Task DeleteFromStorageAsync(StoredFileVersion version);

        /// Delete physical file from the storage (disk/blob storage etc.)
        protected abstract void DeleteFromStorage(StoredFileVersion version);

        /// <summary>
        /// Delete file version from DB and storage
        /// </summary>
        public async Task DeleteAsync(StoredFileVersion version)
        {
            await VersionRepository.DeleteAsync(version);
            await DeleteFromStorageAsync(version);
        }

        /// <summary>
        /// Delete file version from DB and storage
        /// </summary>
        public void Delete(StoredFileVersion version)
        {
            VersionRepository.Delete(version);
            DeleteFromStorage(version);
        }

        /// inheritedDoc
        public async Task DeleteAsync(StoredFile storedFile)
        {
            var versions = await VersionRepository.GetAll()
                .Where(v => v.File == storedFile)
                .ToListAsync();

            foreach (var version in versions)
            {
                await DeleteAsync(version);
            }

            await FileRepository.DeleteAsync(storedFile);
        }

        /// inheritedDoc
        public void Delete(StoredFile storedFile)
        {
            var versions = VersionRepository.GetAll()
                .Where(v => v.File == storedFile)
                .ToList();

            foreach (var version in versions)
            {
                Delete(version);
            }

            FileRepository.Delete(storedFile);
        }
    }
}
