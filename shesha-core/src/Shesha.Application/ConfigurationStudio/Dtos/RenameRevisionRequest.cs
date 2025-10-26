using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Request of the <see cref="ConfigurationStudioAppService.RenameRevisionAsync(RenameRevisionRequest)"/> operation
    /// </summary>
    public class RenameRevisionRequest
    {
        public Guid RevisionId { get; set; }
        public string? VersionName { get; set; }
    }
}
