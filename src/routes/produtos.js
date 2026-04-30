const router = require('express').Router();
const ctrl = require('../controllers/produtosController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

router.get('/',            ctrl.listarProdutos);
router.get('/todos',       verificarToken, verificarAdmin, ctrl.listarTodos);
router.get('/categorias',  ctrl.listarCategorias);
router.get('/:id',         ctrl.buscarProduto);
router.post('/',           verificarToken, verificarAdmin, ctrl.criarProduto);
router.put('/:id',         verificarToken, verificarAdmin, ctrl.atualizarProduto);
router.delete('/:id',      verificarToken, verificarAdmin, ctrl.deletarProduto);

module.exports = router;
