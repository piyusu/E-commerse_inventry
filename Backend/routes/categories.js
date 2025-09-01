const express = require('express');
const { body } = require('express-validator');
const Category = require('../models/Category');
const router = express.Router();

router.get('/', async (req, res) => {
  const cats = await Category.find();
  res.json({ data: cats });
});

router.post('/', [body('name').isString()], async (req, res) => {
  const cat = new Category(req.body);
  await cat.save();
  res.status(201).json({ data: cat });
});

module.exports = router;
