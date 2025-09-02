using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Request of the <see cref="ConfigurationStudioAppService.GetItemRevisionsAsync(GetItemRevisionsRequest)"/> operation
    /// </summary>
    public class GetItemRevisionsRequest
    {
        public Guid ItemId { get; set; }
    }
}
