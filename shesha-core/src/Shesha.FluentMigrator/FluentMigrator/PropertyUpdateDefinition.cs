namespace Shesha.FluentMigrator
{
    /// <summary>
    /// Property update definition
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class PropertyUpdateDefinition<T>
    {
        public T Value { get; set; } = default!;
        public bool IsSet { get; set; }

        public void Set(T value) 
        {
            Value = value;
            IsSet = true;
        }
    }
}
