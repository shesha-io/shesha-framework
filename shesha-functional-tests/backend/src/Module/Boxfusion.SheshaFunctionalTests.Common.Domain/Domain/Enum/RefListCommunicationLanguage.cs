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

        Xhosa = 3,

        Zulu = 4,

        Tswana = 5,

        [Display(Name = "Southern Sotho")]
        SouthernSotho = 6,

        [Display(Name = "Northern Sotho")]
        NorthernSotho = 7,

        Venda = 8,

        Tsonga = 9,
        
        Swati = 10,
        
        Ndebele = 11
    }
}
