using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Assembly loaded during the applicaiton startup
    /// </summary>
    [SnakeCaseNaming]
    [Table("frwk_application_startup_assemblies")]
    public class ApplicationStartupAssembly : Entity<Guid>
    {
        public virtual string FileName { get; set; }
        public virtual string FilePath { get; set; }
        [StringLength(50)]
        public virtual string FileMD5 { get; set; }
        [StringLength(100)]
        public virtual string FileVersion { get; set; }
        [StringLength(100)]
        public virtual string ProductVersion { get; set; }
        public virtual ApplicationStartup ApplicationStartup { get; set; }

        /// <summary>
        /// The Shesha module that owns this assembly, if it corresponds to a known module.
        /// Used to audit which version of each module was loaded at startup.
        /// </summary>
        public virtual Module Module { get; set; }
    }
}
