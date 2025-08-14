const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
  secret: 'mi-secreto-super-seguro-123',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // true en producción con HTTPS
    maxAge: 1000 * 60 * 30 // 30 minutos
  }
}));

// Credenciales de administrador
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// Datos en memoria
let productos = [
  { id: '1', nombre: 'Teclado', precio: 25 },
  { id: '2', nombre: 'Mouse', precio: 15 }
];

// Estadísticas del servidor
let stats = {
  startTime: new Date(),
  requests: 0,
  lastRequest: null,
  loginAttempts: 0,
  lastLogin: null
};

// Middleware para contar requests
app.use((req, res, next) => {
  stats.requests++;
  stats.lastRequest = new Date();
  next();
});

// Middleware de autenticación para el panel
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  } else {
    return res.redirect('/login');
  }
}

// Función para obtener el siguiente ID secuencial
function getNextId() {
  const ids = productos.map(p => parseInt(p.id)).filter(id => !isNaN(id));
  return Math.max(...ids, 0) + 1;
}

// RUTA DE LOGIN
app.get('/login', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.redirect('/');
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Panel de Administración</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .login-container {
                background: rgba(255, 255, 255, 0.95);
                padding: 3rem;
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
                backdrop-filter: blur(4px);
                border: 1px solid rgba(255, 255, 255, 0.18);
                width: 100%;
                max-width: 400px;
                text-align: center;
            }
            
            .login-header {
                margin-bottom: 2rem;
            }
            
            .login-header h1 {
                color: #2c3e50;
                font-size: 2rem;
                margin-bottom: 0.5rem;
                background: linear-gradient(45deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .login-header p {
                color: #666;
                font-size: 1rem;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
                text-align: left;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                color: #2c3e50;
                font-weight: 600;
            }
            
            .form-group input {
                width: 100%;
                padding: 1rem;
                border: 2px solid rgba(102, 126, 234, 0.2);
                border-radius: 10px;
                font-size: 1rem;
                transition: all 0.3s ease;
                background: rgba(255, 255, 255, 0.8);
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #667eea;
                background: white;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .login-btn {
                width: 100%;
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 10px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                transition: all 0.3s ease;
                margin-bottom: 1rem;
            }
            
            .login-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            }
            
            .error {
                background: rgba(231, 76, 60, 0.1);
                color: #e74c3c;
                padding: 1rem;
                border-radius: 10px;
                margin-bottom: 1rem;
                border-left: 4px solid #e74c3c;
            }
            
            .demo-credentials {
                background: rgba(102, 126, 234, 0.1);
                padding: 1rem;
                border-radius: 10px;
                border-left: 4px solid #667eea;
                margin-top: 1rem;
                font-size: 0.9rem;
            }
            
            .demo-credentials strong {
                color: #667eea;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="login-header">
                <h1>🔐 Acceso Admin</h1>
                <p>Panel de Administración del Backend</p>
            </div>
            
            ${req.query.error ? `<div class="error">❌ Credenciales incorrectas. Inténtalo de nuevo.</div>` : ''}
            
            <form method="POST" action="/login">
                <div class="form-group">
                    <label for="username">👤 Usuario</label>
                    <input type="text" id="username" name="username" required>
                </div>
                
                <div class="form-group">
                    <label for="password">🔑 Contraseña</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <button type="submit" class="login-btn">🚀 Iniciar Sesión</button>
            </form>
            
            <div class="demo-credentials">
                <strong>💡 Credenciales de demo:</strong><br>
                Usuario: <code>admin</code><br>
                Contraseña: <code>admin123</code>
            </div>
        </div>
    </body>
    </html>
  `);
});

// PROCESAR LOGIN
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  stats.loginAttempts++;
  
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    req.session.authenticated = true;
    req.session.username = username;
    stats.lastLogin = new Date();
    res.redirect('/');
  } else {
    res.redirect('/login?error=1');
  }
});

// LOGOUT
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// RUTA PRINCIPAL - Panel de administración (PROTEGIDA)
app.get('/', requireAuth, (req, res) => {
  const totalValue = productos.reduce((sum, p) => sum + p.precio, 0);
  const averagePrice = productos.length > 0 ? (totalValue / productos.length).toFixed(2) : 0;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panel de Administración - Backend</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .header {
                background: rgba(255, 255, 255, 0.95);
                padding: 2rem;
                border-radius: 20px;
                margin-bottom: 2rem;
                box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
                backdrop-filter: blur(4px);
                border: 1px solid rgba(255, 255, 255, 0.18);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .header-left h1 {
                color: #2c3e50;
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
                background: linear-gradient(45deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .status {
                color: #27ae60;
                font-size: 1.2rem;
                font-weight: 600;
            }
            
            .header-right {
                text-align: right;
            }
            
            .welcome {
                color: #2c3e50;
                margin-bottom: 1rem;
            }
            
            .logout-btn {
                background: #e74c3c;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .logout-btn:hover {
                background: #c0392b;
                transform: translateY(-2px);
            }
            
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 2rem;
            }
            
            .card {
                background: rgba(255, 255, 255, 0.95);
                padding: 2rem;
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
                backdrop-filter: blur(4px);
                border: 1px solid rgba(255, 255, 255, 0.18);
                transition: transform 0.3s ease;
            }
            
            .card:hover {
                transform: translateY(-5px);
            }
            
            .card h3 {
                color: #2c3e50;
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            
            .stat-number {
                font-size: 2rem;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 0.5rem;
            }
            
            .products-table {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
                backdrop-filter: blur(4px);
                border: 1px solid rgba(255, 255, 255, 0.18);
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 1rem;
            }
            
            th, td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid rgba(102, 126, 234, 0.1);
            }
            
            th {
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                font-weight: 600;
            }
            
            tr:hover {
                background-color: rgba(102, 126, 234, 0.05);
            }
            
            .endpoints {
                display: grid;
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .endpoint {
                display: flex;
                align-items: center;
                padding: 1rem;
                background: rgba(102, 126, 234, 0.1);
                border-radius: 10px;
                font-family: 'Courier New', monospace;
            }
            
            .method {
                padding: 0.25rem 0.75rem;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                margin-right: 1rem;
                min-width: 60px;
                text-align: center;
                font-size: 0.85rem;
            }
            
            .GET { background: #27ae60; }
            .POST { background: #3498db; }
            .PUT { background: #f39c12; }
            .DELETE { background: #e74c3c; }
            
            .refresh-btn {
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 10px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                transition: all 0.3s ease;
                margin-top: 1rem;
            }
            
            .refresh-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            
            @media (max-width: 768px) {
                .header {
                    text-align: center;
                }
                
                .header-right {
                    text-align: center;
                    width: 100%;
                    margin-top: 1rem;
                }
                
                .grid {
                    grid-template-columns: 1fr;
                }
                
                .header-left h1 {
                    font-size: 2rem;
                }
                
                table {
                    font-size: 0.9rem;
                }
                
                th, td {
                    padding: 0.75rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="header-left">
                    <h1>🚀 Panel de Administración</h1>
                    <div class="status">✅ Servidor funcionando correctamente</div>
                </div>
                <div class="header-right">
                    <div class="welcome">👋 Bienvenido, <strong>${req.session.username}</strong></div>
                    <form method="POST" action="/logout" style="display: inline;">
                        <button type="submit" class="logout-btn">🚪 Cerrar Sesión</button>
                    </form>
                </div>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>📊 Estadísticas del Servidor</h3>
                    <div class="stat-number">${stats.requests}</div>
                    <div>Requests totales</div>
                    <hr style="margin: 1rem 0; opacity: 0.2;">
                    <div><strong>Iniciado:</strong> ${stats.startTime.toLocaleString('es-ES')}</div>
                    <div><strong>Último request:</strong> ${stats.lastRequest ? stats.lastRequest.toLocaleString('es-ES') : 'Ninguno'}</div>
                    <div><strong>Intentos login:</strong> ${stats.loginAttempts}</div>
                    <div><strong>Último login:</strong> ${stats.lastLogin ? stats.lastLogin.toLocaleString('es-ES') : 'Ninguno'}</div>
                </div>
                
                <div class="card">
                    <h3>📦 Inventario</h3>
                    <div class="stat-number">${productos.length}</div>
                    <div>Productos en stock</div>
                    <hr style="margin: 1rem 0; opacity: 0.2;">
                    <div><strong>💰 Valor total:</strong> $${totalValue}</div>
                    <div><strong>📊 Precio promedio:</strong> $${averagePrice}</div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">
                        <em>El promedio se calcula: Valor total ÷ Cantidad de productos</em>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🛠️ API Endpoints</h3>
                    <div class="endpoints">
                        <div class="endpoint">
                            <span class="method POST">POST</span>
                            <span>/auth/login</span>
                        </div>
                        <div class="endpoint">
                            <span class="method GET">GET</span>
                            <span>/productos</span>
                        </div>
                        <div class="endpoint">
                            <span class="method POST">POST</span>
                            <span>/productos</span>
                        </div>
                        <div class="endpoint">
                            <span class="method GET">GET</span>
                            <span>/productos/:id</span>
                        </div>
                        <div class="endpoint">
                            <span class="method PUT">PUT</span>
                            <span>/productos/:id</span>
                        </div>
                        <div class="endpoint">
                            <span class="method DELETE">DELETE</span>
                            <span>/productos/:id</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="products-table">
                <h3>📋 Lista de Productos</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productos.map(p => `
                            <tr>
                                <td>#${p.id}</td>
                                <td>${p.nombre}</td>
                                <td>$${p.precio}</td>
                                <td><span style="color: #27ae60; font-weight: 600;">✅ En Stock</span></td>
                            </tr>
                        `).join('')}
                        ${productos.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: #666; font-style: italic;">No hay productos registrados</td></tr>' : ''}
                    </tbody>
                </table>
                
                <button class="refresh-btn" onclick="window.location.reload()">
                    🔄 Actualizar Datos
                </button>
            </div>
        </div>
    </body>
    </html>
  `);
});

// === API ENDPOINTS (SIN AUTENTICACIÓN) ===

// Login de la API (diferente del panel admin)
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }
  return res.json({ token: Buffer.from(`${email}:${password}`).toString('base64') });
});

// Listar productos
app.get('/productos', (req, res) => {
  res.json(productos);
});

// Crear producto
app.post('/productos', (req, res) => {
  const { nombre, precio } = req.body;
  
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  
  if (precio === undefined || precio === null || isNaN(precio) || precio < 0) {
    return res.status(400).json({ error: 'El precio debe ser un número válido mayor o igual a 0' });
  }
  
  const nuevo = { 
    id: getNextId().toString(), 
    nombre: nombre.trim(), 
    precio: parseFloat(precio) 
  };
  
  productos.push(nuevo);
  res.status(201).json(nuevo);
});

// Obtener un producto
app.get('/productos/:id', (req, res) => {
  const prod = productos.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: 'No encontrado' });
  res.json(prod);
});

// Editar producto
app.put('/productos/:id', (req, res) => {
  const idx = productos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  
  const { nombre, precio } = req.body;
  
  if (nombre !== undefined && nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre no puede estar vacío' });
  }
  
  if (precio !== undefined && (isNaN(precio) || precio < 0)) {
    return res.status(400).json({ error: 'El precio debe ser un número válido mayor or igual a 0' });
  }
  
  if (nombre !== undefined) {
    productos[idx].nombre = nombre.trim();
  }
  if (precio !== undefined) {
    productos[idx].precio = parseFloat(precio);
  }
  
  res.json(productos[idx]);
});

// Eliminar producto
app.delete('/productos/:id', (req, res) => {
  const initialLength = productos.length;
  productos = productos.filter(p => p.id !== req.params.id);
  
  if (productos.length === initialLength) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`
  🚀 ¡Servidor iniciado correctamente!
  
  🔐 Panel de administración: http://localhost:${PORT}
     Usuario: admin
     Contraseña: admin123
  
  📊 API Endpoints disponibles en: http://localhost:${PORT}
  
  ✨ Funcionalidades:
     • Panel visual protegido con login
     • Estadísticas en tiempo real  
     • Lista de productos actualizable
     • API endpoints sin autenticación
     • Sesiones con timeout automático
  
  🛠️ Listo para recibir requests...
  `);
});