using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
