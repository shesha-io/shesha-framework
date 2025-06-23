namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Request of the `Get Item` operation
    /// </summary>
    public class GetItemRequest
    {
        public string Module { get; set; }
        public string Name { get; set; }
        public string ItemType { get; set; }
    }
}
