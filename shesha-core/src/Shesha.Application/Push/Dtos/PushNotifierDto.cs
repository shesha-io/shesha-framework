namespace Shesha.Push.Dtos
{
    /// <summary>
    /// Push notifier DTO
    /// </summary>
    public class PushNotifierDto
    {
        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Unique identifier of the notifier
        /// </summary>
        public string Uid { get; set; }
    }
}