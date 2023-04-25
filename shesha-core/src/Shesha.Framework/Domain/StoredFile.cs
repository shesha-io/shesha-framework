using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using JetBrains.Annotations;
using Shesha.Configuration.Runtime;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;

namespace Shesha.Domain
{
    /// <summary>
    /// Stored file
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.StoredFile", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class StoredFile : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        /// <summary>
        /// Default constructor
        /// </summary>
        public StoredFile()
        {
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public StoredFile(IEntityConfigurationStore entityConfigurationStore)
        {
            _entityConfigurationStore = entityConfigurationStore;
        }

        private IEntityConfigurationStore _entityConfigurationStore;


        [EntityDisplayName]
        public virtual string FileName { get; set; }

        public virtual string FileType { get; set; }

        public virtual string Category { get; set; }

        [DataType(DataType.MultilineText)]
        public virtual string Description { get; set; }

        public virtual int SortOrder { get; set; }

        /// <summary>
        /// Parent file. It can be set for generated files (points to template) or otherwise connected files.
        /// </summary>
        public virtual StoredFile ParentFile { get; set; }

        /// <summary>
        /// The setter is private as it should be set once on creation and not changed.
        /// </summary>
        //[LogChanges]
        public virtual string Folder { get; set; }

        /// <summary>
        /// If true, the file is version controlled and the full version
        /// history will be maintained. If false only the current version of the
        /// file will be kept, any updates will overwrite the previous version.
        /// </summary>
        public virtual bool IsVersionControlled { get; set; }

        /// <summary>
        /// Owner of file
        /// </summary>
        public GenericEntityReference Owner { get; set; }

        /// <summary>
        /// Creates new file for the specified owner
        /// </summary>
        /// <typeparam name="TId"></typeparam>
        /// <param name="owner"></param>
        /// <param name="entityConfigurationStore">Entity configuration store</param>
        /// <returns></returns>
        public static StoredFile NewFor<TId>([NotNull]IEntity<TId> owner, IEntityConfigurationStore entityConfigurationStore) where TId: IConvertible
        {
            if (owner.IsTransient())
                throw new Exception("Owner is not persisted to the DB");

            var file = new StoredFile(entityConfigurationStore)
            {
                Owner = new GenericEntityReference(owner)
            };
            
            return file;
        }

        /// <summary>
        /// Set owner of the file
        /// </summary>
        /// <typeparam name="TId">Id type of the owner</typeparam>
        /// <param name="entity">Owner entity</param>
        public virtual void SetOwner<TId>(IEntity<TId> entity)
        {
            Owner = new GenericEntityReference(entity.Id.ToString(), entity.GetType().StripCastleProxyType().FullName);
        }

        /// <summary>
        /// Set owner of the file
        /// </summary>
        public virtual void SetOwner(string ownerType, string ownerId)
        {
            Owner = new GenericEntityReference(ownerId, ownerType);
        }

        /// <summary>
        /// Tenant Id
        /// </summary>
        public virtual int? TenantId { get; set; }

        #region Delayed Binding Feature

        /// <summary>
        ///  True - This file is temporary and required delayed binding to Owner
        /// </summary>
        public virtual bool Temporary { get; set; }

        #endregion

        /*
         potentially unneeded properties/methods

        /// <summary>
        /// Returns the metadata on the last version available.
        /// </summary>
        public virtual StoredFileVersion LastVersion
        {
            get { return Versions.OrderByDescending(o => o.VersionNo).FirstOrDefault(); }
        }

        /// <summary>
        /// Returns file version by version number. A latest version will be returner if versionNo = null
        /// </summary>
        /// <param name="versionNo">Number of the version to search</param>
        /// <returns></returns>
        public virtual StoredFileVersion GetVersion(int? versionNo)
        {
            return versionNo.HasValue
                ? Versions.FirstOrDefault(v => v.VersionNo == versionNo.Value)
                : LastVersion;
        }

        /// <summary>
        /// The setters are private as they should be set through the methods on the service.
        /// </summary>
        public virtual bool Locked { get; protected set; }

        public virtual string LockedBy { get; protected set; }
        public virtual string LockedDate { get; protected set; }
         
         */
    }
}
