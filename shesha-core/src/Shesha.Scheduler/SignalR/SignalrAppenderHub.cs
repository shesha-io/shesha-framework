using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Shesha.Scheduler.SignalR
{
    /// <summary>
    /// SignalR appender hub, is used for real-time job log
    /// </summary>
    public class SignalrAppenderHub : Hub
    {
        public SignalrAppenderHub()
        {
            
        }
        /// <summary>
        /// Join group
        /// </summary>
        /// <param name="groupName">Name of the group</param>
        /// <returns></returns>
        [HubMethodName("JoinGroup")]
        public async Task JoinGroupAsync(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        [HubMethodName("JoinGroupAsync")]
        public Task JoinGroupObsoleteAsync(string groupName)
        {
            return JoinGroupAsync(groupName);
        }

        /// <summary>
        /// Leave group
        /// </summary>
        /// <param name="groupName">Name of the group</param>
        /// <returns></returns>
        [HubMethodName("LeaveGroup")]
        public async Task LeaveGroupAsync(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        [HubMethodName("LeaveGroupAsync")]
        public Task LeaveGroupObsoleteAsync(string groupName)
        {
            return LeaveGroupAsync(groupName);
        }
    }
}
