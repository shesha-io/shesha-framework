namespace Shesha.Web.FormsDesigner.Dtos
{
    public class GetConfigurableComponentByNameInput : GetConfigurationItemInputBase
    {
        /// <summary>
        /// Module name
        /// </summary>
        public string Module { get; set; }

        /// <summary>
        /// Component name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// If true, indicates that component is application specific
        /// </summary>
        public bool IsApplicationSpecific { get; set; }
    }
}