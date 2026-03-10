using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Request of the <see cref="ConfigurationStudioAppService.RestoreItemRevisionAsync(RestoreItemRevisionRequest)"/> operation
    /// </summary>
    public class RestoreItemRevisionRequest
    {
        public Guid ItemId { get; set; }
        public Guid RevisionId { get; set; }
    }
}
