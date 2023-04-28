using Abp.Domain.Entities;
using JetBrains.Annotations;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Services
{
    public interface IStoredFileServiceBase<T> /*: IService<T> */where T : StoredFile, new()
    {
        Task MarkDownloadedAsync(StoredFileVersion fileVersion);

        Task<IList<StoredFile>> GetAttachmentsOfCategoryAsync<TId>([NotNull] IEntity<TId> owner, string fileCategory);
        Task<IList<StoredFile>> GetAttachmentsOfCategoryAsync<TId>(TId id, string typeShortAlias, string fileCategory);
        Task<IList<StoredFile>> GetAttachmentsAsync<TId>(IEntity<TId> owner);
        Task<IList<StoredFile>> GetAttachmentsAsync<TId>(TId id, string typeShortAlias);
        Task<bool> HasAttachmentsOfCategoryAsync<TId>(IEntity<TId> owner, string fileCategory);
        Task<bool> HasAttachmentsOfCategoryAsync<TId>(TId id, string typeShortAlias, string fileCategory);
        Task<Stream> GetStreamAsync(StoredFileVersion fileVersion);
        Task<Stream> GetStreamAsync(StoredFile file);
        Task<Stream> GetStreamAsync(string filePath);
        Stream GetStream(StoredFile file);
        Task<StoredFile> CopyToOwnerAsync<TId>(StoredFile file, IEntity<TId> newOwner, bool throwCopyException = true);

        Task CopyAttachmentsToAsync<TSourceId, TDestinationId>(IEntity<TSourceId> source, IEntity<TDestinationId> destination);

        Task<IList<string>> GetAttachmentsCategoriesAsync<TId>(IEntity<TId> owner);
        Task<StoredFileVersion> GetNewOrDefaultVersionAsync([NotNull] StoredFile file);
        Task RenameFileAsync(StoredFile file, string fileName);
        Task<StoredFileVersion> GetLastVersionAsync(StoredFile file);
        Task<List<StoredFileVersion>> GetFileVersionsAsync(StoredFile file);

        Task UpdateVersionContentAsync(StoredFileVersion version, Stream stream);
        Task<T> SaveFileAsync(Stream stream, string fileName, Action<StoredFile> prepareFileAction = null);

        /// <summary>
        /// Update file content and name
        /// </summary>
        /// <param name="file">Stored file</param>
        /// <param name="stream">Stream with new file content</param>
        /// <param name="fileName">New file name</param>
        /// <returns></returns>
        Task<StoredFileVersion> UpdateFileAsync(T file, Stream stream, string fileName);

        /// <summary>
        /// Returns tru if file exists in the DB
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> FileExistsAsync(Guid id);

        /// <summary>
        /// Get file by id or null if missing
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        T GetOrNull(Guid id);

        /// <summary>
        /// Get file by id or null if missing
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<T> GetOrNullAsync(Guid id);

        Dictionary<string, StoredFile> MakeUniqueFileNames(IList<StoredFile> files);


        /// <summary>
        /// Delete Stored File
        /// </summary>
        Task DeleteAsync(StoredFile storedFile);

        /// <summary>
        /// Delete Stored File
        /// </summary>
        void Delete(StoredFile storedFile);
    }
}
