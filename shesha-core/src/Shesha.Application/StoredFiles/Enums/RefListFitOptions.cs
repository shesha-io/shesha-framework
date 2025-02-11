using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.StoredFiles.Enums
{
    public enum RefListFitOptions
    {
        [Description("FitToHeight")]
        FitToHeight = 1,

        [Description("FitToWidth")]
        FitToWidth = 2,

        [Description("AutoFit")]
        AutoFit = 3
    }
}
