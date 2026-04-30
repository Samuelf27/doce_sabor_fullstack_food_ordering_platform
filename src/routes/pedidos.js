const router = require('express').Router();
const { criarPedido, meusPedidos, detalhesPedido } = require('../controllers/pedidosController');
const { verificarToken } = require('../middleware/authMiddleware');

router.post('/',        verificarToken, criarPedido);
router.get('/meus',     verificarToken, meusPedidos);
router.get('/:id',      verificarToken, detalhesPedido);

module.exports = router;
