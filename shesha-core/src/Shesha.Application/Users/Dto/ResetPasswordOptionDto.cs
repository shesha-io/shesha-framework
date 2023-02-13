using Shesha.Domain.Enums;
using Shesha.Services.ReferenceLists.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Users.Dto
{
    public class ResetPasswordOptionDto
    {
        public RefListPasswordResetMethods? Method { get; set; }

        public string Prompt { get; set; }

        public string MaskedIdentifier { get; set; }
    }
}
