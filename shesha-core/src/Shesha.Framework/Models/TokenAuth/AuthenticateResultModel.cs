using System;

namespace Shesha.Models.TokenAuth
{
    public class AuthenticateResultModel
    {
        public string AccessToken { get; set; }

        public string EncryptedAccessToken { get; set; }

        public int ExpireInSeconds { get; set; }
        
        public DateTime ExpireOn { get; set; }

        public long UserId { get; set; }
        public Guid? PersonId { get; set; }
        public string DeviceName { get; set; }

        public AuthenticateResultType ResultType { get; set; }
        
        public string RedirectUrl { get; set; }
        public string RedirectModule { get; set; }
        public string RedirectForm { get; set; }
    }
}
