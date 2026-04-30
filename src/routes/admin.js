const router = require('express').Router();
const { dashboard, listarPedidosAdmin, atualizarStatusPedido, listarUsuarios } = require('../controllers/adminController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

router.use(verificarToken, verificarAdmin);

router.get('/dashboard',              dashboard);
router.get('/pedidos',                listarPedidosAdmin);
router.put('/pedidos/:id/status',     atualizarStatusPedido);
router.get('/usuarios',               listarUsuarios);

module.exports = router;
