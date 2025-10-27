using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using JetBrains.Annotations;
using Shesha.Configuration.Runtime;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Reflection;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Stored file
    /// </summary>
    [SnakeCaseNaming]
    [Table("stored_files", Schema = "frwk")]
    [Entity(TypeShortAlias = "Shesha.Framework.StoredFile", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class StoredFile : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        /// <summary>
        /// Default constructor
        /// </summary>
        public StoredFile()
        {
        }


        [EntityDisplayName]
        public virtual string FileName { get; set; }

        [MaxLength(50)]
        public virtual string FileType { get; set; }

        [MaxLength(1000)]
        public virtual string? Category { get; set; }

        [DataType(DataType.MultilineText)]
        public virtual string? Description { get; set; }

        public virtual int SortOrder { get; set; }

        /// <summary>
        /// Parent file. It can be set for generated files (points to template) or otherwise connected files.
        /// </summary>
        public virtual StoredFile? ParentFile { get; set; }

        /// <summary>
        /// The setter is private as it should be set once on creation and not changed.
        /// </summary>
        //[LogChanges]
        public virtual string? Folder { get; set; }

        /// <summary>
        /// If true, the file is version controlled and the full version
        /// history will be maintained. If false only the current version of the
        /// file will be kept, any updates will overwrite the previous version.
        /// </summary>
        public virtual bool IsVersionControlled { get; set; }

        /// <summary>
        /// Owner of file
        /// </summary>
        public virtual GenericEntityReference? Owner { get; set; }

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

            var file = new StoredFile
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
        public virtual void SetOwner<TId>(IEntity<TId> entity) where TId: notnull
        {
            Owner = new GenericEntityReference(entity.Id.ToString().NotNull(), entity.GetType().StripCastleProxyType().GetRequiredFullName());
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
    }
}
