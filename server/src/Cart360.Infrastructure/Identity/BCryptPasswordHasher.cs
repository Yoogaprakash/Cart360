using Cart360.Application.Common.Interfaces;

namespace Cart360.Infrastructure.Identity;

public class BCryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string Hash(string plainText) => BCrypt.Net.BCrypt.HashPassword(plainText, WorkFactor);

    public bool Verify(string plainText, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(plainText, hash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // Hash isn't a valid BCrypt hash at all (e.g. the inert seed marker on an
            // unbootstrapped Super Admin row) — treat as "never matches" rather than throwing.
            return false;
        }
    }
}
