const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth',    require('./src/routes/auth'));
app.use('/api/produtos', require('./src/routes/produtos'));
app.use('/api/pedidos', require('./src/routes/pedidos'));
app.use('/api/admin',   require('./src/routes/admin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🍦  Doce Sabor rodando em http://localhost:${PORT}`);
  console.log(`🔑  Admin: admin@docesabor.com / admin123\n`);
});
