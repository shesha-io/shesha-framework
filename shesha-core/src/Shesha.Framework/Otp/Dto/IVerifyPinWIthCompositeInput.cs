using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Otp.Dto
{
    public interface IVerifyPinWIthCompositeInput
    {
        public string ModuleName { get; }
        public string ActionType { get; }
        public Guid SourceEntityId { get; }
        public string Pin { get; }
    }
}
