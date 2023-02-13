using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Users.Dto
{
    public class SecurityQuestionPair
    {
        /// <summary>
        /// 
        /// </summary>
        public Guid QuestionId { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public string SubmittedAnswer { get; set; }
    }
}
