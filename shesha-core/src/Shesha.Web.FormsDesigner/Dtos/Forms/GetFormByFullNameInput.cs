namespace Shesha.Web.FormsDesigner.Dtos
{
    public class GetFormByFullNameInput: GetConfigurationItemInputBase
    {
        /// <summary>
        /// Module name
        /// </summary>
        public required string Module { get; set; }

        /// <summary>
        /// Form name
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Form version number. Last published form is used when missing
        /// </summary>
        public int? Version { get; set; }
    }
}