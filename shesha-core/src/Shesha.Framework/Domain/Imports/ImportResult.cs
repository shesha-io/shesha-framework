using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Import session
    /// </summary>
    [Discriminator]
    [Table("import_results", Schema = "frwk")]
    [SnakeCaseNaming]
    public class ImportResult : FullPowerEntity
    {
        /// <summary>
        /// Import start date time
        /// </summary>
        public virtual DateTime? StartedOn { get; set; }
        
        /// <summary>
        /// Import finish date time
        /// </summary>
        public virtual DateTime? FinishedOn { get; set; }

        /// <summary>
        /// If true, indicates that the import successfully completed
        /// </summary>
        public virtual bool IsSuccess { get; set; }

        /// <summary>
        /// Error message
        /// </summary>
        public virtual string ErrorMessage { get; set; } = string.Empty;

        /// <summary>
        /// Number of affected rows
        /// </summary>
        public virtual int RowsAffected { get; set; }

        /// <summary>
        /// Number of skipped rows
        /// </summary>
        public virtual int RowsSkipped { get; set; }

        /// <summary>
        /// Number of interted rows 
        /// </summary>
        public virtual int RowsInserted { get; set; }

        /// <summary>
        /// Number of updated rows 
        /// </summary>
        public virtual int RowsUpdated { get; set; }

        /// <summary>
        /// Number of deleted/inactivated rows 
        /// </summary>
        public virtual int RowsInactivated { get; set; }

        /// <summary>
        /// Number of rows skipped because they are up to date
        /// </summary>
        [Display(Name = "Rows Skipped (not changed)")]
        public virtual int RowsSkippedNotChanged { get; set; }

        /// <summary>
        /// Average speed (rows per second)
        /// </summary>
        [Display(Name = "Avg speed (rps)")]
        public virtual decimal AvgSpeed { get; set; }

        /// <summary>
        /// Comment
        /// </summary>
        [MaxLength(300)]
        public virtual string Comment { get; set; } = string.Empty;

        /// <summary>
        /// Log file of the import
        /// </summary>
        public virtual StoredFile LogFile { get; set; }

        /// <summary>
        /// Imported file
        /// </summary>
        public virtual StoredFile ImportedFile { get; set; }

        /// <summary>
        /// MD5 hash of the imported file
        /// </summary>
        [MaxLength(50)]
        public virtual string ImportedFileMD5 { get; set; }

        /// <summary>
        /// Type of the data source
        /// </summary>
        public virtual RefListImportSourceType? SourceType { get; set; }

        [MaxLength(300)]
        public virtual string LogFilePath { get; set; } = string.Empty;
    }
}
