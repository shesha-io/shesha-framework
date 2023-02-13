using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Push.Dtos
{
    /// <summary>
    /// Input for sending a push notification to a person
    /// </summary>
    public class SendNotificationToPersonInput: SendNotificationInput
    {
        /// <summary>
        /// Id of the person (recipient)
        /// </summary>
        [Required]
        public Guid PersonId { get; set; }
    }
}
