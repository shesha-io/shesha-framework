using System;
using System.Collections.Generic;

namespace Shesha.Sessions.Dto
{
    public class InitializationErrorsInfoDto
    {
        public DateTime LastInitialization { get; set; }

        public List<string> Errors { get; set; } = new List<string>();
    }
}
