using System;
using System.ComponentModel.DataAnnotations;
using Abp.Authorization.Users;

namespace Shesha.Models.TokenAuth
{
    public class OtpAuthenticateModel
    {
        /// <summary>
        /// Unique runtime identifier of the operation. Is used for resending
        /// </summary>
        public Guid OperationId { get; set; }

        /// <summary>
        /// One-time pin
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Mobile number
        /// </summary>
        public string MobileNo { get; set; }

        /// <summary>
        /// Optional IMEI number. Is used for mobile applications
        /// </summary>
        public string IMEI { get; set; }
    }
}
