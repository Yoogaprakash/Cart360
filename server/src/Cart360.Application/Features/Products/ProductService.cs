using Cart360.Application.Common.Exceptions;
using Cart360.Application.Common.Interfaces;
using Cart360.Application.Common.Models;
using Cart360.Domain.Entities.Catalog;
using Cart360.Domain.Entities.Inventory;
using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Products;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IStockLedgerRepository _stockLedgerRepository;
    private readonly ISubscriptionLimitService _limitService;
    private readonly ITenantContext _tenantContext;
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(
        IProductRepository productRepository,
        IStockLedgerRepository stockLedgerRepository,
        ISubscriptionLimitService limitService,
        ITenantContext tenantContext,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _stockLedgerRepository = stockLedgerRepository;
        _limitService = limitService;
        _tenantContext = tenantContext;
        _unitOfWork = unitOfWork;
    }

    public Task<PagedResult<ProductDto>> GetPagedAsync(PagedRequest request, CancellationToken cancellationToken = default) =>
        _productRepository.GetPagedAsync(request, cancellationToken);

    public async Task<ProductDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await _productRepository.GetDtoByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Product", id);

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        var tenantId = RequireTenantId();

        await ValidateReferencesAsync(request.UnitId, request.CategoryId, request.BrandId, request.WarehouseId, cancellationToken);

        if (await _productRepository.SkuExistsAsync(request.Sku, null, cancellationToken))
            throw new ConflictException($"A product with SKU '{request.Sku}' already exists.");

        await _limitService.EnsureCanAddAsync(tenantId, SubscriptionLimitType.Products, 1, cancellationToken);

        var product = new Product
        {
            TenantId = tenantId,
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            UnitId = request.UnitId,
            WarehouseId = request.WarehouseId,
            Name = request.Name,
            Sku = request.Sku,
            Barcode = request.Barcode,
            HsnCode = request.HsnCode,
            GstPercent = request.GstPercent,
            CgstPercent = request.GstPercent / 2,
            SgstPercent = request.GstPercent / 2,
            IgstPercent = request.GstPercent,
            PurchasePrice = request.PurchasePrice,
            SellingPrice = request.SellingPrice,
            Mrp = request.Mrp,
            OpeningStock = request.OpeningStock,
            CurrentStock = request.OpeningStock,
            MinStockLevel = request.MinStockLevel,
            MaxStockLevel = request.MaxStockLevel,
            TrackInventory = request.TrackInventory,
            TrackBatches = request.TrackBatches,
            ImageUrl = request.ImageUrl,
            IsActive = true
        };

        await _productRepository.AddAsync(product, cancellationToken);

        if (request.TrackInventory && request.OpeningStock != 0)
        {
            await _stockLedgerRepository.AddEntryAsync(new StockLedgerEntry
            {
                TenantId = tenantId,
                ProductId = product.Id,
                WarehouseId = request.WarehouseId,
                TransactionType = StockTransactionType.OpeningStock,
                ReferenceType = "Product",
                ReferenceId = product.Id,
                QuantityIn = request.OpeningStock,
                QuantityOut = 0,
                BalanceAfter = request.OpeningStock,
                UnitCost = request.PurchasePrice
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return (await _productRepository.GetDtoByIdAsync(product.Id, cancellationToken))!;
    }

    public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetEntityByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Product", id);

        await ValidateReferencesAsync(request.UnitId, request.CategoryId, request.BrandId, request.WarehouseId, cancellationToken);

        if (await _productRepository.SkuExistsAsync(request.Sku, id, cancellationToken))
            throw new ConflictException($"A product with SKU '{request.Sku}' already exists.");

        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.UnitId = request.UnitId;
        product.WarehouseId = request.WarehouseId;
        product.Name = request.Name;
        product.Sku = request.Sku;
        product.Barcode = request.Barcode;
        product.HsnCode = request.HsnCode;
        product.GstPercent = request.GstPercent;
        product.CgstPercent = request.GstPercent / 2;
        product.SgstPercent = request.GstPercent / 2;
        product.IgstPercent = request.GstPercent;
        product.PurchasePrice = request.PurchasePrice;
        product.SellingPrice = request.SellingPrice;
        product.Mrp = request.Mrp;
        product.MinStockLevel = request.MinStockLevel;
        product.MaxStockLevel = request.MaxStockLevel;
        product.TrackInventory = request.TrackInventory;
        product.TrackBatches = request.TrackBatches;
        product.ImageUrl = request.ImageUrl;
        product.IsActive = request.IsActive;
        // CurrentStock is deliberately not editable here — it only ever changes through
        // Purchase / Invoice / Return / Stock Adjustment flows, each of which appends
        // to the stock ledger so the balance always has a matching audit trail.

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return (await _productRepository.GetDtoByIdAsync(id, cancellationToken))!;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetEntityByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Product", id);

        _productRepository.Remove(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private Guid RequireTenantId() =>
        _tenantContext.TenantId ?? throw new ForbiddenAccessException("No tenant context for this request.");

    private async Task ValidateReferencesAsync(Guid unitId, Guid? categoryId, Guid? brandId, Guid? warehouseId, CancellationToken cancellationToken)
    {
        if (!await _productRepository.UnitExistsAsync(unitId, cancellationToken))
            throw new NotFoundException("Unit", unitId);

        if (categoryId.HasValue && !await _productRepository.CategoryExistsAsync(categoryId.Value, cancellationToken))
            throw new NotFoundException("Category", categoryId.Value);

        if (brandId.HasValue && !await _productRepository.BrandExistsAsync(brandId.Value, cancellationToken))
            throw new NotFoundException("Brand", brandId.Value);

        if (warehouseId.HasValue && !await _productRepository.WarehouseExistsAsync(warehouseId.Value, cancellationToken))
            throw new NotFoundException("Warehouse", warehouseId.Value);
    }
}
