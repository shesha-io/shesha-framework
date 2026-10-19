namespace Shesha.Domain.Interfaces
{
    /// <summary>
    /// Entity CRUD configuration with custom actions config
    /// </summary>
    public interface IEntityCrudConfigWithCustomActions : IEntityCrudConfig, IHasCustomActionConfig
    {
    }
}
