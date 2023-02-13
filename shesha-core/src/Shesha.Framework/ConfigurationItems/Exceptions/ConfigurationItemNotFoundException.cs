using Abp;
using Abp.Domain.Entities;

namespace Shesha.ConfigurationItems.Exceptions
{
    /// <summary>
    /// Configuration Item not found exception
    /// </summary>
    public class ConfigurationItemNotFoundException : EntityNotFoundException, IHasErrorCode
    {
        /// <summary>
        /// Item Type
        /// </summary>
        public string ItemType { get; set; }


        /// <summary>
        /// Module name
        /// </summary>
        public string Module { get; set; }

        /// <summary>
        /// Form name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Front-end application
        /// </summary>
        public string FrontEndApplication { get; set; }

        /// <summary>
        /// Error code
        /// </summary>
        public int Code { get; set; }

        public ConfigurationItemNotFoundException(string itemType, string module, string name, string frontEndApplication) : base()
        {
            ItemType = itemType;
            Name = name;
            Module = module;
            FrontEndApplication = frontEndApplication;
            Code = 404;
        }

        public override string Message {
            get 
            {
                var fullName = !string.IsNullOrWhiteSpace(Module)
                    ? $"{Module}\\{Name}"
                    : Name;
                return !string.IsNullOrWhiteSpace(FrontEndApplication)
                    ? $"{ItemType} `{fullName}` not found for the `{FrontEndApplication}` application"
                    : $"{ItemType} `{fullName}` not found";
            } 
        }
    }
}
