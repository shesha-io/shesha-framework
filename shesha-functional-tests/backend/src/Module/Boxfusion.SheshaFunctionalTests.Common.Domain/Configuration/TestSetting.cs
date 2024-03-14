using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Configuration
{
    [Category("Tests")]
    public interface ITestSetting: ISettingAccessors
    {
        [Display(Name = "UserLockout")]
        [Setting(TestSettingNames.UserLockOut)]
        ISettingAccessor<int> UserLockoutItem { get; }

        [Display(Name = "Test Complex", Description = "Testing the complex setting item")]
        [Setting(TestSettingNames.TestComplex, EditorFormName = "complex-setting-test")]
        ISettingAccessor<TestComplexSetting> TestComplexSetting { get; }

        [Display(Name = "Stars Count")]
        [Setting(TestSettingNames.StarsCount)]
        ISettingAccessor<int> StarsCount { get; }
    }
}
