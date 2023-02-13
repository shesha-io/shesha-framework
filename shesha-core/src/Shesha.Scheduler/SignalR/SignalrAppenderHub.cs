using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Shesha.Scheduler.SignalR
{
    /// <summary>
    /// SignalR appender hub, is used for real-time job log
    /// </summary>
    public class SignalrAppenderHub : Hub
    {
        /// <summary>
        /// Join group
        /// </summary>
        /// <param name="groupName">Name of the group</param>
        /// <returns></returns>
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        /// <summary>
        /// Leave group
        /// </summary>
        /// <param name="groupName">Name of the group</param>
        /// <returns></returns>
        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}
