using System.Collections.Generic;

namespace Shesha.Users.Dto
{
    public class SecurityQuestionVerificationDto
    {
        /// <summary>
        /// 
        /// </summary>
        public string Username { get; set; }

        public List<SecurityQuestionPair> SubmittedQuestions { get; set; }
    }
}
