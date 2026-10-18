namespace Shesha.Otp.Dto
{
    /// <summary>
    /// Identifies an OTP configuration (<c>OtpConfig</c>) by module and name. Ids are environment specific, so OTP configurations are referenced by name
    /// </summary>
    public class OtpConfigIdentifierDto
    {
        /// <summary>
        /// Module of the OTP configuration
        /// </summary>
        public string? Module { get; set; }

        /// <summary>
        /// Name of the OTP configuration
        /// </summary>
        public string Name { get; set; } = string.Empty;

        public OtpConfigIdentifierDto()
        {
        }

        public OtpConfigIdentifierDto(string? module, string name)
        {
            Module = module;
            Name = name;
        }

        public override string ToString() => $"{Module}/{Name}";
    }
}
