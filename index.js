require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const app = express();
const port = process.env.PORT;
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(helmet());
app.use(express.json());

app.listen(port, () => {
    console.log('Listening on port ' + port)
});

// Routes
app.get('/', (req, res) => {
    res.json({
        'message': 'Welcome to Flexonze.link - A url shortener that doesn\'t really shorten urls',
    });
});

app.get('/:slug', async (req, res) => {
    try {
        let slug = req.params.slug
        console.log('slug is ' + slug)

        const client = await pool.connect();
        let result = await client.query(`SELECT (slug, url, counter) from links WHERE slug='${slug}';`)

        // TODO: find a better way to do this
        if (result.rows.length === 0) {
            res.json({
                'error': 'invalid slug',
            });
            // TODO: Redirect to somewhere safe
            return;
        }

        let url = result.rows[0].row.split(',')[1];
        console.log('You are getting redirected to ' + url);
        res.status(301).redirect(url);
        // TODO: increment counter
        
        client.release();
      } catch (error) {
        res.json({
            'error': error.message,
        });
      }
});

app.get('/create/:password/:slug/:url', async (req, res) => {
    try {
        let password = req.params.password
        let slug = req.params.slug
        let url = req.params.url

        if (password !== process.env.PASSWORD) {
            res.json({
                'error': 'INVALID_PASSWORD',
            });
            return;
        }

        const client = await pool.connect();
        let result = await client.query(`SELECT (slug, url, counter) from links WHERE slug='${slug}';`)
        if (result !== []) {
            res.json({
                'error': 'This slug is not available.',
            });
            client.release();
            return;
        }

        result = await client.query(`INSERT INTO links (slug, url, counter) VALUES ('${slug}', '${url}', 0) RETURNING *;`)

        res.json({
            'message': result,
        });
        client.release();
      } catch (error) {
        res.json({
            'error': error.message,
        });
      }
});


// TODO: Add a delete route