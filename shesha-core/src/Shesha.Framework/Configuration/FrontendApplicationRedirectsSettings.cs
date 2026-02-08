using System.ComponentModel.DataAnnotations;

namespace Shesha.Configuration
{
    public class FrontendApplicationRedirectsSettings
    {

        /// <summary>
        /// Default Path 
        /// </summary>
        [Display(Name = "Default Path", Description = "This is the url the user should be redirected to if the user is not authenticated and does not specify a specific page")]
        public string DefaultPath { get; set; }

        /// <summary>
        /// Base URL
        /// </summary>
        [Display(Name = "Base URL", Description = "Is used in the notifications (especially emails) to open site links")]
        public string BaseUrl { get; set; }

        /// <summary>
        /// Redirect path after successful login
        /// </summary>
        [Display(Name = "Success Login Redirect Path", Description = "The page the user should be redirected to after successfully logging in")]
        //[Setting(SheshaSettingNames.SuccessLoginRedirectPath, isClientSpecific: true)]
        public string SuccessLoginRedirectPath { get; set; }

        /// <summary>
        /// Redirect path after not being authenticated
        /// </summary>
        [Display(Name = "Not authenticated redirect path", Description = "The page the user will be redirected to if not authenticated but attempts to access a page that requires authentications")]
        public string NotAuthenticatedRedirectPath { get; set; }
    }
}
