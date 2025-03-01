namespace Shesha.Notifications.Dto
{
    public class SendStatus
    {
        public bool IsSuccess { get; set; }
        public string? Message { get; set; }

        public static SendStatus Failed(string message) 
        { 
            return new SendStatus { 
                IsSuccess = false,
                Message = message 
            };
        }

        public static SendStatus Success(string? message = null)
        {
            return new SendStatus
            {
                IsSuccess = true,
                Message = message
            };
        }
    }
}
