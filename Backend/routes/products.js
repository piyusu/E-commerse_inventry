const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/productController');
const validateRequest = require('../middleware/validateRequest');

router.get('/', productController.listProducts);
router.post('/',
  [
    body('name').isString(),
    body('sku').isString(),
    body('price_paise').isInt({ min: 0 }),
    body('stock_quantity').optional().isInt({ min: 0 })
  ],
  validateRequest,
  productController.createProduct
);

router.put('/:id',
  [
    body('price_paise').optional().isInt({ min: 0 }),
    body('stock_quantity').optional().isInt({ min: 0 })
  ],
  validateRequest,
  productController.updateProduct
);

router.get('/low-stock', productController.lowStock);
router.put('/:id/stock', productController.updateStock);

module.exports = router;
