namespace Shesha.Elmah
{
    public class ErrorReference
    {
        public string Type { get; set; }
        public string Id { get; set; }

        public ErrorReference(string type, string id)
        {
            Type = type;
            Id = id;
        }
    }
}
