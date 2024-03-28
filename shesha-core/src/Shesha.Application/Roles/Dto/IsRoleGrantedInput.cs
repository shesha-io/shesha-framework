namespace Shesha.Roles.Dto
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
    }
}
