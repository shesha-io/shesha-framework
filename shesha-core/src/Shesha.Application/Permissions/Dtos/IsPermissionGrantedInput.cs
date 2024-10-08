using Shesha.AutoMapper.Dto;

namespace Shesha.Permissions.Dtos
{
    /// <summary>
    /// Input that is used to check is specified permission (<see cref="PermissionName"/>) granted to the current user
    /// </summary>
    public class IsPermissionGrantedInput
    {
        /// <summary>
        /// Name of the permission to check
        /// </summary>
        public string PermissionName { get; set; }

        /// <summary>
        /// Reference to the permisseonedEntity
        /// </summary>
        public string PermissionedEntityId { get; set; }
        public string PermissionedEntityClass { get; set; }
    }
}
