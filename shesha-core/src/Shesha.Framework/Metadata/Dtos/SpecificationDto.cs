namespace Shesha.Metadata.Dtos
{
    /// <summary>
    /// DTO of the specification that can be applied on top of the entity query
    /// </summary>
    public class SpecificationDto
    {
        /// <summary>
        /// Name. Unique for all specifications in the application
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Friendly name
        /// </summary>
        public string FriendlyName { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }
    }
}
