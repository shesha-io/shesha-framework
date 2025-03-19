namespace Shesha.Authentication.External
{
    public class ExternalAuthUserInfo
    {
        public required string ProviderKey { get; set; }

        public required string Name { get; set; }

        public required string EmailAddress { get; set; }

        public string? Surname { get; set; }

        public required string Provider { get; set; }
    }
}
