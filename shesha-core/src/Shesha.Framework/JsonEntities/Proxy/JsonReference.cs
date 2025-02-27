namespace Shesha.JsonEntities.Proxy
{
    public interface IJsonReference
    {
        object Id { get; set; }
        string _displayName { get; set; }
    }

    public class JsonReference
    {
        public virtual object? Id { get; set; }
        public virtual string? _displayName { get; set; }
    }
}
