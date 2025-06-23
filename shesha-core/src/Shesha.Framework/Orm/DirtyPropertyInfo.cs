namespace Shesha.Orm
{
    /// <summary>
    /// Entity dirty property info
    /// </summary>
    public class DirtyPropertyInfo
    {
        /// <summary>
        /// Property name
        /// </summary>
        public required string Name { get; init; }
        
        /// <summary>
        /// Old value
        /// </summary>
        public object? OldValue { get; init; }

        /// <summary>
        /// New value
        /// </summary>
        public object? NewValue { get; init; }
    }

}
