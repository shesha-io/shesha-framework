using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum
{
    [ReferenceList("SheshaFunctionalTests", "CommunicationLanguage")]
    public enum RefListCommunicationLanguage: long
    {
        English = 1,

        Afrikaans = 2,

        Xhosa = 4,

        Zulu = 8,

        Tswana = 16,

        [Display(Name = "Southern Sotho")]
        SouthernSotho = 32,

        [Display(Name = "Northern Sotho")]
        NorthernSotho = 64,

        Venda = 128,

        Tsonga = 256,
        
        Swati = 512,
        
        Ndebele = 1024
    }
}
