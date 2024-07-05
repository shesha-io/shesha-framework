namespace Shesha.Web.FormsDesigner.Dtos
{
    public class FormByFullNamePermissionsDto
    {
        /// <summary>
        /// Module name
        /// </summary>
        public string Module { get; set; }

        /// <summary>
        /// Form name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Form permissions
        /// </summary>
        public string[] Permissions { get; set; }
    }
}