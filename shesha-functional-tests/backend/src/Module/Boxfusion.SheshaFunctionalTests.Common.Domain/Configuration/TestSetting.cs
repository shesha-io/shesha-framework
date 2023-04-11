using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
    }
}
