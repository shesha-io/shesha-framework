using Abp.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Shesha.Domain.Attributes;
using Shesha.Services;
using Shesha.Services.Urls;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Elmah.Domain
{
    /// <summary>
    /// Error referenced by some bu8siness object (e.g. entity)
    /// </summary>
    [ImMutable]
    [Table("vw_referenced_errors", Schema = "elmah")]
    [SnakeCaseNaming]
    public class ReferencedError: Entity<Guid>
    {
        public virtual string RefId { get; set; }
        public virtual string RefType { get; set; }
        public virtual Guid ErrorId { get; set; }
        public virtual string Application { get; set; }
        public virtual string Host { get; set; }
        public virtual string Source { get; set; }
        public virtual string StatusCode { get; set; }
        public virtual string TimeUtc { get; set; }
        public virtual string Type { get; set; }
        public virtual string User { get; set; }

        [NotMapped]
        public virtual string DetailsUrl { 
            get {
                var linkGeneratorContext = StaticContext.IocManager.Resolve<ILinkGeneratorContext>();
                if (linkGeneratorContext?.State == null)
                    return null;

                var hostString = linkGeneratorContext.State.Port > 0
                    ? new HostString(linkGeneratorContext.State.Host, linkGeneratorContext.State.Port)
                    : new HostString(linkGeneratorContext.State.Host);

                return $"{linkGeneratorContext.State.Scheme}://{hostString}{linkGeneratorContext.State.PathBase}/elmah/detail/{ErrorId}";
            } 
        }
    }
}
