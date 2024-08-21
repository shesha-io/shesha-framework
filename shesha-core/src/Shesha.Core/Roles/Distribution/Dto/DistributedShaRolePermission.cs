namespace Shesha.Roles.Distribution.Dto
{
    public class DistributedShaRolePermission
    {
        public virtual string Permission { get; set; }
        public virtual bool IsGranted { get; set; }
    }
}
