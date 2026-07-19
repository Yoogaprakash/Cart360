using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Domain.Entities.Sales;
using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Customers;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly ISubscriptionLimitService _limitService;
    private readonly ITenantContext _tenantContext;
    private readonly IUnitOfWork _unitOfWork;

    public CustomerService(
        ICustomerRepository customerRepository,
        ISubscriptionLimitService limitService,
        ITenantContext tenantContext,
        IUnitOfWork unitOfWork)
    {
        _customerRepository = customerRepository;
        _limitService = limitService;
        _tenantContext = tenantContext;
        _unitOfWork = unitOfWork;
    }

    public Task<PagedResult<CustomerDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default) =>
        _customerRepository.GetPagedAsync(request, cancellationToken);

    public async Task<CustomerDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _customerRepository.GetDtoByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Customer", id);

    public async Task<CustomerDto> CreateAsync(CreateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId ?? throw new ForbiddenAccessException();
        await _limitService.EnsureCanAddAsync(tenantId, SubscriptionLimitType.Customers, 1, cancellationToken);

        var customer = new Customer
        {
            TenantId = tenantId,
            CustomerCode = await _customerRepository.GenerateNextCustomerCodeAsync(cancellationToken),
            Name = request.Name,
            GstNumber = request.GstNumber,
            Phone = request.Phone,
            Email = request.Email,
            AddressLine1 = request.AddressLine1,
            AddressLine2 = request.AddressLine2,
            City = request.City,
            State = request.State,
            PostalCode = request.PostalCode,
            CreditLimit = request.CreditLimit,
            Notes = request.Notes,
            IsActive = true
        };

        await _customerRepository.AddAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return (await _customerRepository.GetDtoByIdAsync(customer.Id, cancellationToken))!;
    }

    public async Task<CustomerDto> UpdateAsync(Guid id, UpdateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var customer = await _customerRepository.GetEntityByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Customer", id);

        customer.Name = request.Name;
        customer.GstNumber = request.GstNumber;
        customer.Phone = request.Phone;
        customer.Email = request.Email;
        customer.AddressLine1 = request.AddressLine1;
        customer.AddressLine2 = request.AddressLine2;
        customer.City = request.City;
        customer.State = request.State;
        customer.PostalCode = request.PostalCode;
        customer.CreditLimit = request.CreditLimit;
        customer.Notes = request.Notes;
        customer.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return (await _customerRepository.GetDtoByIdAsync(id, cancellationToken))!;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var customer = await _customerRepository.GetEntityByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Customer", id);

        _customerRepository.Remove(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
