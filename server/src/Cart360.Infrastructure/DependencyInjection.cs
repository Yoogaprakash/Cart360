using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Infrastructure.Identity;
using Cart360.Infrastructure.Persistence;
using Cart360.Infrastructure.Persistence.Interceptors;
using Cart360.Infrastructure.Persistence.Repositories;
using Cart360.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Cart360.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // NOTE: IHttpContextAccessor's implementation is registered by the API composition
        // root (Program.cs -> builder.Services.AddHttpContextAccessor()), which is a Web SDK
        // project and has that package available; this class library only depends on the
        // IHttpContextAccessor abstraction, consumed by HttpContextTenantContext below.

        // Registered once, resolved through both interfaces so a single request shares
        // one tenant/user snapshot between the DbContext's query filters and audit stamping.
        services.AddScoped<HttpContextTenantContext>();
        services.AddScoped<ITenantContext>(sp => sp.GetRequiredService<HttpContextTenantContext>());
        services.AddScoped<ICurrentUserService>(sp => sp.GetRequiredService<HttpContextTenantContext>());

        services.AddScoped<AuditableEntitySaveChangesInterceptor>();

        services.AddDbContext<Cart360DbContext>((sp, options) =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

            options
                .UseNpgsql(connectionString, npgsql =>
                    npgsql.MigrationsAssembly(typeof(Cart360DbContext).Assembly.FullName))
                .UseSnakeCaseNamingConvention()
                .AddInterceptors(sp.GetRequiredService<AuditableEntitySaveChangesInterceptor>());
        });

        // Configuration-bound option POCOs. JwtSettings.SigningKey and EmailOptions.Password
        // are read from "Jwt:Key" / "Smtp:Password" — in every real environment these must be
        // supplied via environment variables (Jwt__Key / Smtp__Password), never committed.
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
        jwtSettings.SigningKey = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Configuration 'Jwt:Key' (JWT signing key) is not set.");
        services.AddSingleton(jwtSettings);

        var emailOptions = configuration.GetSection("Smtp").Get<EmailOptions>()
            ?? throw new InvalidOperationException("Configuration section 'Smtp' is not set.");
        services.AddSingleton(emailOptions);

        var authOptions = configuration.GetSection("Jwt").Get<AuthOptions>() ?? new AuthOptions();
        services.AddSingleton(authOptions);

        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IEmailService, SmtpEmailService>();

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<Cart360DbContext>());
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<ISubscriptionPlanRepository, SubscriptionPlanRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IOtpCodeRepository, OtpCodeRepository>();
        services.AddScoped<ISubscriptionLimitService, SubscriptionLimitService>();
        services.AddScoped<Application.Features.Tenants.ICompanyService, CompanyService>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IStockLedgerRepository, StockLedgerRepository>();
        services.AddScoped<Application.Features.Units.IUnitService, UnitService>();
        services.AddScoped<Application.Features.Dashboard.IDashboardService, DashboardService>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<Application.Features.Categories.ICategoryService, CategoryService>();
        services.AddScoped<Application.Features.Brands.IBrandService, BrandService>();
        services.AddScoped<Application.Features.Warehouses.IWarehouseService, WarehouseService>();
        services.AddScoped<ISupplierRepository, SupplierRepository>();
        services.AddScoped<Application.Features.Suppliers.ISupplierService, Application.Features.Suppliers.SupplierService>();
        services.AddScoped<IPurchaseRepository, PurchaseRepository>();
        services.AddScoped<Application.Features.Purchases.IPurchaseService, Application.Features.Purchases.PurchaseService>();
        services.AddScoped<IQuotationRepository, QuotationRepository>();
        services.AddScoped<Application.Features.Quotations.IQuotationService, Application.Features.Quotations.QuotationService>();
        services.AddScoped<Application.Features.Returns.ISalesReturnService, SalesReturnService>();
        services.AddScoped<Application.Features.Returns.IPurchaseReturnService, PurchaseReturnService>();
        services.AddScoped<Application.Features.Expenses.IExpenseService, ExpenseService>();
        services.AddScoped<Application.Features.Incomes.IIncomeService, IncomeService>();
        services.AddScoped<Application.Features.StockAdjustments.IStockAdjustmentService, StockAdjustmentService>();
        services.AddScoped<Application.Features.Reports.IReportsService, ReportsService>();
        services.AddScoped<Application.Features.SuperAdmin.ISuperAdminService, SuperAdminService>();
        services.AddScoped<Application.Features.SuperAdmin.ISubscriptionPlanAdminService, SubscriptionPlanAdminService>();
        services.AddScoped<Application.Features.Users.IUserManagementService, UserManagementService>();

        return services;
    }
}
