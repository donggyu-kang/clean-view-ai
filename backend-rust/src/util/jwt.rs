use chrono::Utc;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub iat: usize,
}

pub struct JwtUtil;

impl JwtUtil {
    pub fn generate_token(email: &str, secret: &str, expiration: i64) -> Result<String, jsonwebtoken::errors::Error> {
        let now = Utc::now().timestamp() as usize;
        let claims = Claims {
            sub: email.to_string(),
            exp: now + expiration as usize,
            iat: now,
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_ref()),
        )
    }

    pub fn validate_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret.as_ref()),
            &Validation::default(),
        )?;

        Ok(token_data.claims)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_and_validate_token() {
        let secret = "test-secret-key-that-is-long-enough-for-hs256";
        let email = "test@example.com";
        let expiration = 3600;

        let token = JwtUtil::generate_token(email, secret, expiration).unwrap();
        assert!(!token.is_empty());

        let claims = JwtUtil::validate_token(&token, secret).unwrap();
        assert_eq!(claims.sub, email);
    }

    #[test]
    fn test_invalid_token() {
        let secret = "test-secret-key-that-is-long-enough-for-hs256";
        let result = JwtUtil::validate_token("invalid.token.here", secret);
        assert!(result.is_err());
    }

    #[test]
    fn test_wrong_secret() {
        let secret1 = "test-secret-key-that-is-long-enough-for-hs256";
        let secret2 = "different-secret-key-that-is-also-long-enough";
        let email = "test@example.com";

        let token = JwtUtil::generate_token(email, secret1, 3600).unwrap();
        let result = JwtUtil::validate_token(&token, secret2);
        assert!(result.is_err());
    }
}
