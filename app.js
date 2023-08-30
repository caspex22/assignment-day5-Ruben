const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const secretKey = 'Mys3c123T';

//call checkRole function from middleware.js
const { checkRole } = require('./middleware/roleMiddleware');

const app = express();
app.use(express.json());

const users = [];
const courses = [
    {
        id: 1,
        name: "Introduction to Programming",
        book: "Programming Basics",
        author: "John Smith",
        publicationDate: "2022-01-15"
    },
    {
        id: 2,
        name: "Web Development Fundamentals",
        book: "Web Design Principles",
        author: "Jane Doe",
        publicationDate: "2022-03-10"
    },
    {
        id: 3,
        name: "Data Structures and Algorithms",
        book: "Algorithms Unlocked",
        author: "Alice Johnson",
        publicationDate: "2022-02-28"
    }
];



app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log(hashedPassword);

        users.push({
            username,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            message: 'User created'
        });
    } catch (error) {
        // Handle the error
        console.error('Error during registration:', error);
        res.status(500).json({
            message: 'An error occurred during registration'
        });
    }
});


app.post('/login', async (req, res) => {
        const {username, password} = req.body;

        try {
            const user = users.find(user => user.username === username);
            if (!user) {
                return res.status(400).json({
                    message: 'Authentication Failed, user not found'
                });
            }
    
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    message: 'Authentication Failed, wrong password'
                });
            }
    
            const token = jwt.sign({ username, role: user.role }, secretKey, { expiresIn: '1h' });
            res.status(200).json({
                message: 'Authentication success',
                token
            });
        } catch (error) {
            // Handle the error
            console.error('Error during login:', error);
            res.status(500).json({
                message: 'An error occurred during login'
            });
        }
    });



app.get('/users', checkRole('Admin'), (req, res) => {

    res.status(200).json({
        message: 'List of users',
        users
    })

});

app.delete('/courses', checkRole('Admin') , async (req, res) => {
    const courseId = parseInt(req.query.courseId);
    try {
        const courseIndex = courses.findIndex(course => course.id === courseId);

        if (courseIndex !== -1) {
            const deletedCourse = courses.splice(courseIndex, 1)[0];

            res.status(200).json({
                message: 'Course deleted successfully',
                course: deletedCourse
            });
        } else {
            res.status(404).json({
                message: 'Course not found'
            });
        }
    } catch (error) {
        console.error('Error while deleting course:', error);
        res.status(500).json({
            message: 'An error occurred while deleting the course'
        });
    }
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        message: 'Internal server error'
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});