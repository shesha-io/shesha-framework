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
    [Table("frwk_application_startups")]
    public class ApplicationStartup: Entity<Guid>
    {
        [StringLength(100)]
        public virtual string MachineName { get; set; }
        public virtual string Folder { get; set; }
        [StringLength(100)]
        public virtual string Account { get; set; }
        public virtual DateTime StartedOn { get; set; }
        public virtual DateTime? FinishedOn { get; set; }
        public virtual ApplicationStartupStatus Status { get; set; }
        public virtual string ErrorMessage { get; set; }

        public virtual bool BootstrappersDisabled { get; set; }
        public virtual bool MigrationsDisabled { get; set; }

        /// <summary>
        /// True when at least one module assembly changed version/md5 compared to the previous successful startup.
        /// Used to filter the startup list to show only deployments that included module changes.
        /// </summary>
        public virtual bool HasModulesChanged { get; set; }

        /// <summary>
        /// Version of the root (startup) module assembly at the time of this startup.
        /// Represents the application release version.
        /// </summary>
        [StringLength(100)]
        public virtual string MainModuleVersion { get; set; }
    }
}
