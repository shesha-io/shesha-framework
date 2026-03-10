namespace Shesha.JsonEntities.Proxy
{
    public interface IJsonReference
    {
        object? Id { get; set; }
        string? _displayName { get; set; }
        string? _className { get; set; }
    }

    public class JsonReference: IJsonReference
    {
        public virtual object? Id { get; set; }
        public virtual string? _displayName { get; set; }
        public virtual string? _className { get; set; }
    }
}
