using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Read-only view of module release history derived from application startup logs.
    /// Each row represents a module assembly that was loaded during a specific startup.
    /// Maps to <c>vw_Frwk_ModuleReleaseHistory</c>.
    /// </summary>
    [ImMutable]
    [SnakeCaseNaming]
    [Entity(TypeShortAlias = "Shesha.Framework.ModuleReleaseHistory",
            GenerateApplicationService = GenerateApplicationServiceState.AlwaysGenerateApplicationService)]
    [Table("vw_Frwk_ModuleReleaseHistory")]
    public class ModuleReleaseHistory : Entity<Guid>
    {
        /// <summary>
        /// The module this assembly belongs to
        /// </summary>
        public virtual Module Module { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public virtual string ModuleName { get; set; }

        /// <summary>
        /// Module friendly name
        /// </summary>
        public virtual string ModuleFriendlyName { get; set; }

        /// <summary>
        /// Assembly file version (e.g. 0.43.6)
        /// </summary>
        public virtual string FileVersion { get; set; }

        /// <summary>
        /// Assembly product version
        /// </summary>
        public virtual string ProductVersion { get; set; }

        /// <summary>
        /// Assembly file name (e.g. Shesha.Framework.dll)
        /// </summary>
        public virtual string FileName { get; set; }

        /// <summary>
        /// The startup session this assembly was recorded in
        /// </summary>
        [Column("startup_id")]
        public virtual ApplicationStartup Startup { get; set; }

        /// <summary>
        /// When this startup occurred — effectively the deployment date for this version
        /// </summary>
        public virtual DateTime StartedOn { get; set; }

        /// <summary>
        /// Machine name the application started on
        /// </summary>
        public virtual string MachineName { get; set; }

        /// <summary>
        /// OS account that ran the application
        /// </summary>
        public virtual string Account { get; set; }

        /// <summary>
        /// Working directory of the application
        /// </summary>
        public virtual string Folder { get; set; }

        /// <summary>
        /// Startup status (InProgress = 1, Failed = 2, Success = 3)
        /// </summary>
        public virtual int Status { get; set; }
    }
}
