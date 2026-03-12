# Verint Authentication Plugin for Insomnia

An Insomnia plugin that automatically generates Verint API authentication headers using HMAC-SHA256 signing algorithm. This plugin eliminates the need to manually generate authentication tokens for Verint API requests.

## Features

- 🔐 **Automatic Authentication**: Automatically generates and adds Authorization headers for Verint API requests
- 🔑 **HMAC-SHA256 Signing**: Uses industry-standard HMAC-SHA256 algorithm for secure authentication
- 🌍 **Environment Variable Support**: Reads credentials from Insomnia environment variables
- ✅ **Smart Detection**: Only processes requests to Verint URLs
- 📱 **User Notifications**: Provides success/error alerts for authentication status
- 🔄 **Variable Replacement**: Supports Insomnia template variables in URLs and headers

## Installation

### Method 1: Manual Installation
1. Clone or download this repository
2. Copy the plugin folder to your Insomnia plugins directory:
   - **macOS**: `~/Library/Application Support/Insomnia/plugins/`
   - **Windows**: `%APPDATA%/Insomnia/plugins/`
   - **Linux**: `~/.config/Insomnia/plugins/`
3. Restart Insomnia

### Method 2: Development Installation
1. Navigate to your Insomnia plugins directory
2. Clone this repository:
   ```bash
   git clone https://github.com/samer-koda/insomnia-plugin-verint-authentication.git
   ```
3. Install dependencies:
   ```bash
   cd insomnia-plugin-verint-authentication
   npm install
   ```
4. Restart Insomnia

## Configuration

### Required Environment Variables

You need to set the following environment variables in your Insomnia environment:

- `api_key_id`: Your Verint API Key ID
- `api_key`: Your Verint API Key (base64url encoded)

### Setting Environment Variables

1. In Insomnia, go to **Manage Environments** (gear icon in the top left)
2. Select your environment or create a new one
3. Add the required variables:
   ```json
   {
     "api_key_id": "your-api-key-id",
     "api_key": "your-base64url-encoded-api-key"
   }
   ```

## Usage

Once installed and configured, the plugin works automatically:

1. **Make a Request**: Create any HTTP request to a Verint API endpoint
2. **Automatic Detection**: The plugin detects Verint URLs and automatically processes them
3. **Header Generation**: The Authorization header is automatically generated and added
4. **Notifications**: Success or error notifications will appear

### Example Request

```http
GET https://api.verint.com/your-endpoint
Content-Type: application/json
```

The plugin will automatically add:
```http
Authorization: Vrnt-1-HMAC-SHA256 salt=abc123...,iat=2025-09-15T10:30:00Z,kid=your-api-key-id,sig=signature...
```

## How It Works

The plugin implements the Verint authentication specification:

1. **Request Hook**: Intercepts all outgoing requests
2. **URL Detection**: Checks if the request URL contains "verint"
3. **Credential Validation**: Ensures `api_key_id` and `api_key` are available
4. **Signature Generation**:
   - Generates a random salt (16 bytes)
   - Creates a canonical string to sign with method, path, timestamp, and headers
   - Signs using HMAC-SHA256 with the provided API key
   - Formats the authorization header according to Verint specifications
5. **Header Injection**: Adds the Authorization header to the request

## Supported Headers

The plugin supports canonicalization of custom headers with the `verint-` prefix. These headers will be included in the signature calculation.

Example:
```http
verint-custom-header: custom-value
verint-request-id: 12345
```

## Error Handling

The plugin provides comprehensive error handling:

- **Missing Credentials**: Alerts when `api_key_id` or `api_key` are not set
- **Generation Errors**: Displays specific error messages for authentication failures
- **Graceful Fallback**: Non-Verint requests are not affected by the plugin

## Development

### Project Structure

```
insomnia-plugin-verint-authentication/
├── main.js                    # Plugin entry point and request hook
├── package.json              # Plugin metadata and dependencies
├── src/
│   └── verint_authentication.js  # Core authentication logic
└── README.md                 # This file
```

### Dependencies

- **crypto-js**: For HMAC-SHA256 signing and base64 operations

### Testing

To test the plugin locally:

1. Install the plugin in your Insomnia plugins directory
2. Set up the required environment variables
3. Make a request to any Verint API endpoint
4. Check that the Authorization header is automatically added

## Troubleshooting

### Common Issues

1. **"Missing Credentials" Alert**
   - Ensure `api_key_id` and `api_key` are set in your environment
   - Check that the variable names are spelled correctly

2. **Authentication Failures**
   - Verify your API key is properly base64url encoded
   - Ensure your API key ID is correct
   - Check that your Verint API credentials are valid

3. **Plugin Not Working**
   - Restart Insomnia after installation
   - Check the plugins directory path is correct
   - Verify `npm install` completed successfully

### Debug Mode

For debugging, check the Insomnia console for error messages:
- **macOS/Linux**: `Cmd/Ctrl + Option + I`
- **Windows**: `Ctrl + Shift + I`

## License

ISC License

## Author

Samer Koda

## Keywords

- insomnia
- plugin
- verint
- authentication
- hmac
- api
- auth

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Insomnia plugin documentation
3. Open an issue in the project repository

---

**Note**: This plugin is designed specifically for Verint API authentication. Ensure you have valid Verint API credentials before using this plugin.
