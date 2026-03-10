using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Assembly loaded during the applicaiton startup
    /// </summary>
    [SnakeCaseNaming]
    [Table("application_startup_assemblies", Schema = "frwk")]
    public class ApplicationStartupAssembly : Entity<Guid>
    {
        public required virtual string FileName { get; set; }
        public virtual string? FilePath { get; set; }
        [MaxLength(50)]
        public required virtual string FileMD5 { get; set; }
        [MaxLength(100)]
        public virtual string? FileVersion { get; set; }
        [MaxLength(100)]
        public virtual string? ProductVersion { get; set; }
        public required virtual ApplicationStartup ApplicationStartup { get; set; }
    }
}
