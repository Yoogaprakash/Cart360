using System.Reflection;
using Cart360.Application.Features.Auth;
using Cart360.Application.Features.Customers;
using Cart360.Application.Features.Invoices;
using Cart360.Application.Features.Products;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Cart360.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddAutoMapper(cfg => { }, Assembly.GetExecutingAssembly());

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IInvoiceService, InvoiceService>();

        return services;
    }
}
