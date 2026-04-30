const router = require('express').Router();
const { registrar, login, perfil, atualizarPerfil } = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

router.post('/registrar',  registrar);
router.post('/login',      login);
router.get('/perfil',      verificarToken, perfil);
router.put('/perfil',      verificarToken, atualizarPerfil);

module.exports = router;
