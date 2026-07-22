namespace Shesha.Session
{
    /// <summary>
    /// Used to get Shesha-specific claim type names.
    /// </summary>
    public static class ShaClaimTypes
    {
        /// <summary>
        /// PersonId.
        /// </summary>
        public static string PersonId { get; set; } = "http://shesha.io/identity/claims/personId";
    }
}
