using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.MessageParticipants
{
    public class RawAddressMessageParticipant : IMessageSender, IMessageReciever
    {
        private readonly string _address;
        public RawAddressMessageParticipant(string address)
        {
            _address = address;
        }
        public string GetAddress()
        {
            return _address;
        }
    }
}