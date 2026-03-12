const VerintAuthGenerator = require('./src/verint_authentication');

module.exports.requestHooks = [
  context => {
    try {
      // Get environment variables from Insomnia
      const apiKeyId = context.request.getEnvironmentVariable('api_key_id');
      const apiKey = context.request.getEnvironmentVariable('api_key');
      
      if (!apiKeyId || !apiKey) {
        // Show alert for missing credentials only for Verint URLs
        const currentUrl = context.request.getUrl().toLowerCase();
        if (currentUrl.includes('verint') && context.app && context.app.alert) {
          const missingVars = [];
          if (!apiKeyId) missingVars.push('api_key_id');
          if (!apiKey) missingVars.push('api_key');
          
          context.app.alert(
            'Verint Authentication - Missing Credentials',
            `The following environment variables are required but not found: ${missingVars.join(', ')}\n\nPlease set these variables in your environment to enable Verint authentication.`
          );
        }
        return; // Skip if no credentials
      }

      // Create auth generator instance
      const authGen = new VerintAuthGenerator(apiKeyId, apiKey);
      
      // Prepare request object for the generator
      const headers = {};
      // Convert headers to proper object format
      const headerList = context.request.getHeaders();
      
      if (Array.isArray(headerList)) {
        headerList.forEach(header => {
          if (header && typeof header === 'object' && header.name && header.value !== undefined) {
            headers[header.name] = header.value;
          }
        });
      } else if (typeof headerList === 'object' && headerList !== null) {
        Object.assign(headers, headerList);
      }
      
      const requestObj = {
        url: context.request.getUrl(),
        method: context.request.getMethod(),
        headers: headers
      };
      
      // Get all environment variables
      const environment = {};
      const allVars = context.request.getEnvironment();
      Object.keys(allVars).forEach(key => {
        environment[key] = allVars[key];
      });
      
      // Generate the authorization header
      const authHeader = authGen.generateAuthHeader(requestObj, environment, {});
      
      // Set the Authorization header
      context.request.setHeader('Authorization', authHeader);

      // Verify the header was set and try alternative method if needed
      const setHeaders = context.request.getHeaders();
      let authHeaderFound = false;
      if (Array.isArray(setHeaders)) {
        const foundHeader = setHeaders.find(h => h && h.name === 'Authorization');
        if (foundHeader) {
          authHeaderFound = true;
        }
      }
      
      if (!authHeaderFound) {
        try {
          context.request.addHeader('Authorization', authHeader);
        } catch (e) {
          context.request.removeHeader('Authorization');
          context.request.setHeader('Authorization', authHeader);
        }
      }    
    } catch (error) {
      console.error('Verint Plugin Error:', error);
      
      // Show error alert
      if (context.app && context.app.alert) {
        context.app.alert(
          'Verint Authentication - Error',
          `❌ Failed to generate authentication header!\n\nError: ${error.message}\n\nPlease check your api_key_id and api_key environment variables and try again.`
        );
      }
      
      throw error;
    }
  }
];