namespace Shesha.Web.FormsDesigner.Dtos
{
    public class GetFormByFullNameInput: GetConfigurationItemInputBase
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
        /// Form version number. Last published form is used when missing
        /// </summary>
        public int? Version { get; set; }
    }
}