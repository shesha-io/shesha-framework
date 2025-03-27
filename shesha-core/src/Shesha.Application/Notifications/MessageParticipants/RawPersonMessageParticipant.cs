using Shesha.Domain;
using System;
using System.Threading.Tasks;

namespace Shesha.Notifications.MessageParticipants
{
    public class RawAddressMessageParticipant : IMessageSender, IMessageReceiver, IEquatable<IMessageReceiver>
    {
        private readonly string _address;
        public RawAddressMessageParticipant(string address)
        {
            _address = address;
        }
        public string? GetAddress(INotificationChannelSender notificationChannelSender)
        {
            return _address;
        }

        public Person? GetPerson()
        {
            return null;
        }

        public Task<bool> IsNotificationOptedOutAsync(NotificationTypeConfig type)
        {
            return Task.FromResult(false);
        }

        public override int GetHashCode()
        {
            return _address != null
                ? _address.GetHashCode()
                : base.GetHashCode();
        }

        public bool Equals(IMessageReceiver? other)
        {
            return other is RawAddressMessageParticipant participant && participant._address == this._address;
        }

        public override bool Equals(object? obj) => this.Equals(obj as RawAddressMessageParticipant);

        public static bool operator ==(RawAddressMessageParticipant? l, RawAddressMessageParticipant? r)
        {
            if (l is null)
            {
                if (r is null)
                    return true;
                // Only the left side is null.
                return false;
            }
            // Equals handles case of null on right side.
            return l.Equals(r);
        }
        public static bool operator !=(RawAddressMessageParticipant? l, RawAddressMessageParticipant? r) => !(l == r);
    }
}