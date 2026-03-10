using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Application startup session
    /// Stores information about application start including all loaded dlls
    /// </summary>
    [SnakeCaseNaming]
    [Table("application_startups", Schema = "frwk")]
    public class ApplicationStartup: Entity<Guid>
    {
        [MaxLength(100)]
        public virtual string? MachineName { get; set; }
        public virtual string? Folder { get; set; }
        [MaxLength(100)]
        public virtual string? Account { get; set; }
        public virtual DateTime StartedOn { get; set; }
        public virtual DateTime? FinishedOn { get; set; }
        public virtual ApplicationStartupStatus Status { get; set; }
        public virtual string? ErrorMessage { get; set; }

        public virtual bool BootstrappersDisabled { get; set; }
        public virtual bool MigrationsDisabled { get; set; }
    }
}
