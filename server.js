const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * View Engine Setup
 */
// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));

/**
 * Routes
 */
app.get('/', (req, res) => {
    const title = 'Home';
    res.render('home', { title });
});

app.get('/organizations', (req, res) => {
    const title = 'Organisations';
    res.render('organizations', { title });
});

app.get('/projects',(req, res) => {
    const title = 'Projects';
    res.render('projects', { title });
});
app.get('/products',(req,res ) =>{
    const title = 'Products';
    res.render('products', {title});
});

app.get('/about',(req,res)=>{
    const title = 'About';
    res.render('about',{title})
});
/**
 * Start Server
 */
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});