namespace Shesha.AutoMapper.Dto
{
    /// <summary>
    /// Generic DTO of the simple autocomplete item
    /// </summary>
    public class AutocompleteItemDto
    {
        public required string Value { get; set; }
        public required string DisplayText { get; set; }
    }
}
