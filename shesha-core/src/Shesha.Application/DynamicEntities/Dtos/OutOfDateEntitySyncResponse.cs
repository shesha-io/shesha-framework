using Shesha.Metadata.Dtos;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Out of date entity sync response
    /// </summary>
    public class OutOfDateEntitySyncResponse: BaseEntitySyncResponse
    {
        public MetadataDto Metadata { get; set; }
    }
}
