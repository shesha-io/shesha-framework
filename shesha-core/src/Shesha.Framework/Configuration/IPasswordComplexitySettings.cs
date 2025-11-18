//using Abp.Zero.Configuration;
//using Shesha.Settings;
//using System.ComponentModel;
//using System.ComponentModel.DataAnnotations;

//namespace Shesha.Configuration
//{
//    /// <summary>
//    /// Password complexity settings
//    /// </summary>
//    [Category("Password complexity")]
//    public interface IPasswordComplexitySettings: ISettingAccessors
//    {
//        /// <summary>
//        /// Require digit
//        /// </summary>
//        [Display(Name = "Require digit")]
//        [Setting(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireDigit, IsClientSpecific = true)]
//        ISettingAccessor<bool> RequireDigit { get; }

//        /// <summary>
//        /// Require lowercase
//        /// </summary>
//        [Display(Name = "Require lowercase")]
//        [Setting(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireLowercase, IsClientSpecific = true)]
//        ISettingAccessor<bool> RequireLowercase { get; }

//        /// <summary>
//        /// Require non alphanumeric
//        /// </summary>
//        [Display(Name = "Require non alphanumeric")]
//        [Setting(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireNonAlphanumeric, IsClientSpecific = true)]
//        ISettingAccessor<bool> RequireNonAlphanumeric { get; }

//        /// <summary>
//        /// Require upper case
//        /// </summary>
//        [Display(Name = "Require upper case")]
//        [Setting(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireUppercase, IsClientSpecific = true)]
//        ISettingAccessor<bool> RequireUppercase { get; }

//        /// <summary>
//        /// Require length
//        /// </summary>
//        [Display(Name = "Require length")]
//        [Setting(AbpZeroSettingNames.UserManagement.PasswordComplexity.RequiredLength, IsClientSpecific = true)]
//        ISettingAccessor<int> RequiredLength { get; }
//    }
//}
