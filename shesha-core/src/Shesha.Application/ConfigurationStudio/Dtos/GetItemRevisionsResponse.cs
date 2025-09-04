using System.Collections.Generic;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Response of the <see cref="ConfigurationStudioAppService.GetItemRevisionsAsync(GetItemRevisionsRequest)"/> operation
    /// </summary>
    public class GetItemRevisionsResponse
    {
        public List<ConfigurationItemRevisionDto> Revisions { get; set; } = new();
    }
}
