const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const orderController = require('../controllers/orderController');
const validateRequest = require('../middleware/validateRequest');

router.post('/',
  [
    body('username').isString().notEmpty(),
    body('items').isArray({ min: 1 }),
    body('items.*.product_id').isString(),
    body('items.*.quantity').isInt({ min: 1 })
  ],
  validateRequest,
  orderController.createOrder
);

router.get('/user/:username', orderController.getUserOrders);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.post('/:id/fulfill', orderController.fulfillOrder);


module.exports = router;
