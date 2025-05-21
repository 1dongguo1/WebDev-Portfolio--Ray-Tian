#include <openssl/aes.h>
#include <openssl/rand.h>
#include <openssl/bio.h>
#include <openssl/buffer.h>
#include <openssl/evp.h>
#include <string>
#include <vector>
#include <stdexcept>
#include <cstring>

// Function to encode data to Base64
std::string base64_encode(const unsigned char* data, size_t len) {
    BIO *bio, *b64;
    BUF_MEM *bufferPtr;

    b64 = BIO_new(BIO_f_base64());
    bio = BIO_new(BIO_s_mem());
    bio = BIO_push(b64, bio);

    BIO_set_flags(bio, BIO_FLAGS_BASE64_NO_NL); // Do not add newlines
    BIO_write(bio, data, len);
    BIO_flush(bio);
    BIO_get_mem_ptr(bio, &bufferPtr);

    std::string result(bufferPtr->data, bufferPtr->length);
    BIO_free_all(bio);

    return result;
}

// Function to decode Base64 data
std::vector<unsigned char> base64_decode(const std::string& encoded) {
    BIO *bio, *b64;
    std::vector<unsigned char> decoded(encoded.size());

    bio = BIO_new_mem_buf(encoded.data(), encoded.size());
    b64 = BIO_new(BIO_f_base64());
    bio = BIO_push(b64, bio);

    BIO_set_flags(bio, BIO_FLAGS_BASE64_NO_NL); // Do not handle newlines
    int decoded_length = BIO_read(bio, decoded.data(), encoded.size());
    decoded.resize(decoded_length);

    BIO_free_all(bio);
    return decoded;
}

// AES encryption function
std::string aes_encrypt(const std::string& plaintext, const unsigned char* key, const unsigned char* iv) {
    // Initialize OpenSSL encryption context
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    if (!ctx) throw std::runtime_error("Failed to create encryption context");

    // Initialize encryption operation with AES-256-CBC mode
    if (EVP_EncryptInit_ex(ctx, EVP_aes_256_cbc(), nullptr, key, iv) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Encryption initialization failed");
    }

    std::vector<unsigned char> ciphertext(plaintext.size() + AES_BLOCK_SIZE);
    int len;
    int ciphertext_len;

    // Perform encryption
    if (EVP_EncryptUpdate(ctx, ciphertext.data(), &len, (unsigned char*)plaintext.data(), plaintext.size()) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Encryption update failed");
    }
    ciphertext_len = len;

    // Finalize encryption
    if (EVP_EncryptFinal_ex(ctx, ciphertext.data() + len, &len) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Encryption finalization failed");
    }
    ciphertext_len += len;

    EVP_CIPHER_CTX_free(ctx);

    // Resize ciphertext and encode to Base64
    ciphertext.resize(ciphertext_len);
    return base64_encode(ciphertext.data(), ciphertext_len);
}

// AES decryption function
std::string aes_decrypt(const std::string& ciphertext_b64, const unsigned char* key, const unsigned char* iv) {
    // Decode Base64 input
    std::vector<unsigned char> ciphertext = base64_decode(ciphertext_b64);

    // Initialize OpenSSL decryption context
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    if (!ctx) throw std::runtime_error("Failed to create decryption context");

    // Initialize decryption operation with AES-256-CBC mode
    if (EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), nullptr, key, iv) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Decryption initialization failed");
    }

    std::vector<unsigned char> plaintext(ciphertext.size());
    int len;
    int plaintext_len;

    // Perform decryption
    if (EVP_DecryptUpdate(ctx, plaintext.data(), &len, ciphertext.data(), ciphertext.size()) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Decryption update failed");
    }
    plaintext_len = len;

    // Finalize decryption
    if (EVP_DecryptFinal_ex(ctx, plaintext.data() + len, &len) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        throw std::runtime_error("Decryption finalization failed");
    }
    plaintext_len += len;

    EVP_CIPHER_CTX_free(ctx);

    // Return plaintext
    return std::string((char*)plaintext.data(), plaintext_len);
}

int main() {
    // Key and IV (converted from provided hexadecimal strings)
    unsigned char key[32] = {0x65, 0xbd, 0x1b, 0x23, 0x05, 0xf4, 0x6e, 0xb2,
                            0x80, 0x6b, 0x93, 0x5a, 0xab, 0x76, 0x30, 0xbb,
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
    unsigned char iv[16] = {0x1b, 0x23, 0x05, 0xf4, 0x6e, 0xb2, 0x80, 0x6b,
                           0x93, 0x5a, 0xab, 0x76, 0x00, 0x00, 0x00, 0x00};

    try {
        // Test plaintext
        std::string plaintext = "This is a test plaintext!";

        // Encrypt
        std::string ciphertext = aes_encrypt(plaintext, key, iv);
        std::cout << "Base64-encoded ciphertext: " << ciphertext << std::endl;

        // Decrypt
        std::string decrypted = aes_decrypt(ciphertext, key, iv);
        std::cout << "Decrypted plaintext: " << decrypted << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}