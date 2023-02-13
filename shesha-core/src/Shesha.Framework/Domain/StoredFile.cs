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
using Shesha.Extensions;
using Shesha.Services;

namespace Shesha.Domain
{
    /// <summary>
    /// Stored file
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.StoredFile", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class StoredFile : FullAuditedEntity<Guid>, IHasOwningEntityLink, IMayHaveTenant
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

        [ReferenceList("Shesha.Framework", "StoredFileCategory")]
        public virtual Int64? Category { get; set; }

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

        #region IEntityWithMultipleOwnerTypes Members

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
                OwnerId = owner.Id.ToString(CultureInfo.InvariantCulture),
                OwnerType = owner.GetTypeShortAlias()
            };
            
            return file;
        }

        /// <summary>
        /// The Id of the enity this audit entry relates to.
        /// </summary>
        [Column("Frwk_OwnerId")]
        [StringLength(40)]
        public virtual string OwnerId { get; protected set; }

        /// <summary>
        /// The Type of entity this audit entry relates to.
        /// </summary>
        [Column("Frwk_OwnerType")]
        [StringLength(100)]
        public virtual string OwnerType { get; protected set; }

        /// <summary>
        /// Set owner of the file
        /// </summary>
        /// <typeparam name="TId">Id type of the owner</typeparam>
        /// <param name="entity">Owner entity</param>
        public virtual void SetOwner<TId>(IEntity<TId> entity)
        {
            var config = (_entityConfigurationStore ?? StaticContext.IocManager.Resolve<IEntityConfigurationStore>()).Get(entity.GetType());
            if (string.IsNullOrEmpty(config.TypeShortAlias))
                throw new InvalidOperationException(
                    $"Owner cannot be set to entity '{entity.GetType().FullName}' as a TypeShortAlias has not been defined. Tip: Set the TypeShortAlias through the Entity attribute on the entity in question.");

            OwnerType = config.TypeShortAlias;
            OwnerId = entity.Id.ToString();
        }

        /// <summary>
        /// Set owner of the file
        /// </summary>
        public virtual void SetOwner(string ownerType, string ownerId)
        {
            OwnerType = ownerType;
            OwnerId = ownerId;
        }

        #endregion

        /// <summary>
        /// Tenant Id
        /// </summary>
        public virtual int? TenantId { get; set; }

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
