const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create express app
const app = express();

// Use CORS and set up the proxy middleware
app.use(cors());
app.use('/api', createProxyMiddleware({
  target: 'https://test-defog-ikcpfh5tva-uc.a.run.app/',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
