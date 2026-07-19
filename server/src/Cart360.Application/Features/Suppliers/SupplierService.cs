using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Domain.Entities.Purchasing;

namespace Cart360.Application.Features.Suppliers;

public class SupplierService : ISupplierService
{
    private readonly ISupplierRepository _supplierRepository;
    private readonly ITenantContext _tenantContext;
    private readonly IUnitOfWork _unitOfWork;

    public SupplierService(ISupplierRepository supplierRepository, ITenantContext tenantContext, IUnitOfWork unitOfWork)
    {
        _supplierRepository = supplierRepository;
        _tenantContext = tenantContext;
        _unitOfWork = unitOfWork;
    }

    public Task<PagedResult<SupplierDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default) =>
        _supplierRepository.GetPagedAsync(request, cancellationToken);

    public async Task<SupplierDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _supplierRepository.GetDtoByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Supplier", id);

    public async Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();

        var supplier = new Supplier
        {
            TenantId = tenantId,
            SupplierCode = await _supplierRepository.GenerateNextSupplierCodeAsync(cancellationToken),
            Name = request.Name,
            GstNumber = request.GstNumber,
            Phone = request.Phone,
            Email = request.Email,
            AddressLine1 = request.AddressLine1,
            AddressLine2 = request.AddressLine2,
            City = request.City,
            State = request.State,
            PostalCode = request.PostalCode,
            Notes = request.Notes,
            IsActive = true
        };

        await _supplierRepository.AddAsync(supplier, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return (await _supplierRepository.GetDtoByIdAsync(supplier.Id, cancellationToken))!;
    }

    public async Task<SupplierDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken cancellationToken = default)
    {
        var supplier = await _supplierRepository.GetEntityByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Supplier", id);

        supplier.Name = request.Name;
        supplier.GstNumber = request.GstNumber;
        supplier.Phone = request.Phone;
        supplier.Email = request.Email;
        supplier.AddressLine1 = request.AddressLine1;
        supplier.AddressLine2 = request.AddressLine2;
        supplier.City = request.City;
        supplier.State = request.State;
        supplier.PostalCode = request.PostalCode;
        supplier.Notes = request.Notes;
        supplier.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return (await _supplierRepository.GetDtoByIdAsync(id, cancellationToken))!;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var supplier = await _supplierRepository.GetEntityByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Supplier", id);

        _supplierRepository.Remove(supplier);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
