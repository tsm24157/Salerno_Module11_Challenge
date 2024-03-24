const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

app.get('/api/notes', (req, res) => {
    fs.readFile(path.join('./db/db.json'), 'utf8', (err, data) => {
        return err
            ? (console.error('Error reading db.json:', err), res.status(500).send('Internal Server Error'))
            : res.json(JSON.parse(data));
    });
});

app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    if (title && text) {
        fs.readFile('./db/db.json', 'utf8', (readErr, data) => {
            if (readErr) {
                console.error('Error reading db.json:', readErr);
                return res.status(500).json('Internal Server Error');
            }

            const notes = JSON.parse(data);

            const newNote = {
                title,
                text,
                id: uuidv4(),
            };

            notes.push(newNote);

            fs.writeFile('./db/db.json', JSON.stringify(notes), (err) =>
                err
                    ? console.error(err)
                    : console.log('New Note added')
            );

            const response = {
                status: 'note created',
                body: newNote,
            };

            console.log(response);
            res.status(201).json(response);
        });
    } else {
        res.status(400).json('Error: Title and Text required');
    }
});


app.put('/api/notes/:id', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            res.status(500).send('Internal Server Error');
        }
        const { title, text } = req.body;

        const notes = JSON.parse(data);

        const updateNote = notes.map(note => {
            if (note.id === req.params.id) {
                return {
                    title,
                    text,
                    id: req.params.id,
                }
            } else {
                return note;
            }
        }
        );

        fs.writeFile('./db/db.json', JSON.stringify(updateNote), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to db.json:', writeErr);
                res.status(500).send('Internal Server Error');
            }

            const response = {
                status: 'note updated',
            };

            console.log(response);
            res.status(200).json(response);
        });
    })
});


app.delete('/api/notes/:id', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            res.status(500).send('Internal Server Error');
        }

        const notes = JSON.parse(data);

        const updateNote = notes.filter(note => note && note.id !== req.params.id);

        if (updateNote.length < notes.length) {
            fs.writeFile('./db/db.json', JSON.stringify(updateNote), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to db.json:', writeErr);
                    res.status(500).send('Internal Server Error');
                }

                const response = {
                    status: 'note deleted',
                };

                console.log(response);
                res.status(200).json(response);
            });
        } else {
            res.status(404).json({ status: 'note not found' });
        }
    });
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
});

app.listen(PORT, () =>
    console.log(`Express server listening on port ${PORT}!`)
);