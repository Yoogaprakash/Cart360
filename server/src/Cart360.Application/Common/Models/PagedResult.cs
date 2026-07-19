namespace Cart360.Application.Common.Models;

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    public static PagedResult<T> Create(IReadOnlyList<T> items, int page, int pageSize, int totalCount) => new()
    {
        Items = items,
        Page = page,
        PageSize = pageSize,
        TotalCount = totalCount
    };
}

public class PagedRequest
{
    private int _page = 1;
    private int _pageSize = 20;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch { < 1 => 20, > 200 => 200, _ => value };
    }

    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}
