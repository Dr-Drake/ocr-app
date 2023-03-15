import express from 'express';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';
import { removeFile } from './utils/removeFile';
import { createWorker } from "tesseract.js";
import { preprocessImage } from './utils/preprocessImage';

/** PORT */
const PORT = process.env.PORT || 3000;

/** Multer */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ dest: 'uploads/', storage });

/**
 * Create http server
 */
const app = express();
const server = http.createServer(app);


/**
 * Middlewares
 */

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', __dirname +'/views');

// Serve static directory
app.use(express.static(path.join(__dirname, '../public')))


/**
 * Routes
 */
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// Handle image uploads
app.post('/ocr', upload.single('file'), async (req, res) => {

    // If no file, bad request
    if (!req.file) {
        res.status(400).json({
            message: "No file sent"
        })
    }
    else{
        try {
            
            let filePath = req.file.path;

            // Preprocess Image
            // let imageBuffer = await preprocessImage(filePath)
            
            // Initialize tesseract worker
            const worker = await createWorker({
                //logger: m => console.log(m)
            });

            // Perform the text recognition in english
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(filePath);
            await worker.terminate();

            /**
             * Once text generated, remove the file
             */
            if (text) {
                console.log(text);
                removeFile(filePath);
            }
            
            // Return the text to the client
            res.send({ text });
    
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "An unknown error occurred"
            })
        }
    }
});

/**
 * Listen on PORT
 */
server.listen(PORT, () => {
    console.log('listening on ', PORT);
});
