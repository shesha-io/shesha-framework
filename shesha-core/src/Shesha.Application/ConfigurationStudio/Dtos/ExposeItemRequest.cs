namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Request of the `Expose Item` operation
    /// </summary>
    public class ExposeItemRequest
    {
        public string Module { get; set; }
        public string Name { get; set; }
        public string ItemType { get; set; }
    }
}
