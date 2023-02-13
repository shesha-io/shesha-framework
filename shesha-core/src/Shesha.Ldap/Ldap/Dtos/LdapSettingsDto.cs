namespace Shesha.Ldap.Dtos
{
    public class LdapSettingsDto
    {
        public bool IsEnabled { get; set; }
        public string Server { get; set; }
        public int Port { get; set; }
        public bool UseSsl { get; set; }
        public string Domain { get; set; }
    }
}