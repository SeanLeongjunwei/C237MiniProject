const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '',
    database: 'c237_fitnessapp',
    host: 'freedb.tech',
    user: 'freedb_23034133',
    password: 'c3!Daj#7@Qu%8$r',
    database: 'freedb_c237_fitnessapp'
});

connection.connect((err) => {
    if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
    }
    console.log('Connected to MySQL database');
    });
    // Set up view engine
app.set('view engine', 'ejs');
    // enable static files
app.use(express.static('public'));
app.use(express.urlencoded({
    extended: false
}));

app.use(express.static('public'));

app.get('/', (req, res) => {
    const sql = 'SELECT * FROM product';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error: ', error.message);
            return res.status(500).send(`Error retrieving products ${error.message}`);

        }
      res.render('index', {products: results}); 
    });
});

app.get('/product/:id', (req,res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM product WHERE productId = ?';
    connection.query(sql, [productId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send(`Error Retrieving product by ID ${error.message}`);

        }
        if (results.length > 0) {
            res.render('product', {product: results[0]});
        
        } else {
            res.status(404).send('Product not found');
        }
    });
});

app.get('/addProduct', (req, res) => {
    res.render('addProduct');
});
app.post('/addProduct', upload.single('image'), (req, res) => {
    const {name, price, flavours, details} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    }   else {
        image = null;
    }
    const sql = 'INSERT INTO product (productName, price, flavours, details, image) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [name, price, flavours, details, image], (error, results) => {
        if (error) {
            console.error("Error adding product:", error);
            res.status(500).send(`Error adding product ${error.message}`);

        } else {
            res.redirect('/');
        }
    });
});

app.get('/editProduct/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM product WHERE productId = ?';
    connection.query(sql, [productId], (error, results) => {
        if (error) {
            console.error("Database query error", error.message);
            return res.status(500).send(`Error retrieving product by ID ${error.message}`);
        }
        if (results.length > 0) {
            res.render('editProduct', { product: results[0]});
        } else {
            res.status(404).send('product not found');
        
        }
    });
});

app.post('/editProduct/:id', upload.single('image'), (req, res) => {
    const productId = req.params.id;
    const { name, price, flavours, details} = req.body;
    let image = req.body.currentImage;
    if (req.file) {
        image = req.file.filename;
    }
    const sql = 'UPDATE product SET productName = ?, price = ?, flavours = ?, details = ?, image = ? WHERE productId = ?';
    connection.query(sql, [name, price, flavours, details, image, productId], (error, results) => {
        if (error) {
            console.error("Error updating product:", error);
            res.status(500).send(`Error updating product ${error.message}`);
        } else {
            res.redirect('/');
        }
    });
});

app.get('/deleteProduct/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM product WHERE productId = ?';
    connection.query(sql, [productId], (error, results) => {
        if (error) {
            console.error("Error deleting product:", error);
            res.status(500).send("Error deleting product");
        } else {
            res.redirect('/');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));