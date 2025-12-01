using System.Collections.Generic;
using System;

namespace Shesha.Sessions.Dto
{
    public class InitializationErrorsInfoDto
    {
        public DateTime LastInitialization { get; set; }

        public List<string> Errors { get; set; }
    }
}
