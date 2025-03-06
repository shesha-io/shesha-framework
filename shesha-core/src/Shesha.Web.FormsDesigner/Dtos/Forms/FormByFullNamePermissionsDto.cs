namespace Shesha.Web.FormsDesigner.Dtos
{
    public class FormByFullNamePermissionsDto
    {
        /// <summary>
        /// Module name
        /// </summary>
        public string? Module { get; set; }

        /// <summary>
        /// Form name
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Form permissions
        /// </summary>
        public required string[] Permissions { get; set; }
    }
}