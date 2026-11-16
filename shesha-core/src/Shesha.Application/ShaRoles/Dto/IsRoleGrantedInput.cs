namespace Shesha.ShaRoles.Dto
{
    /// <summary>
    /// Input that is used to check is specified role (<see cref="RoleName"/>) granted to the current user
    /// </summary>
    public class IsRoleGrantedInput
    {
        /// <summary>
        /// Name of the role to check
        /// </summary>
        public string RoleName { get; set; }

        /// <summary>
        /// Name of the module that declares the role. Used to resolve the role respecting module hierarchy
        /// (the top-most module in the current app's dependency chain wins). When omitted, falls back to a plain name match.
        /// </summary>
        public string? Module { get; set; }
    }
}
