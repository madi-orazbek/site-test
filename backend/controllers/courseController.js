const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

// Создание нового курса
exports.createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        const course = await Course.create({
            title,
            description,
            instructor: req.user._id
        });
        res.redirect(`/courses/${course._id}`);
    } catch (error) {
        console.error(error);
        res.redirect('/courses/new');
    }
};

// Страница создания курса
exports.newCourse = (req, res) => {
    res.render('courses/create');
};

// Детали курса
exports.getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor')
            .populate('students');
        
        if (!course) {
            return res.status(404).render('error', { message: 'Курс не найден' });
        }
        
        const assignments = await Assignment.find({ course: req.params.id });
        
        // Проверка записи пользователя на курс
        let isEnrolled = false;
        if (req.user) {
            isEnrolled = course.students.some(student => 
                student._id.toString() === req.user._id.toString()
            );
        }
        
        res.render('courses/details', { 
            course, 
            assignments,
            isEnrolled,
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.redirect('/courses');
    }
};

// Запись на курс
exports.enrollInCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).render('error', { message: 'Курс не найден' });
        }
        
        // Проверка уже записан ли пользователь
        const isEnrolled = course.students.some(student => 
            student.toString() === req.user._id.toString()
        );
        
        if (!isEnrolled) {
            course.students.push(req.user._id);
            await course.save();
        }
        
        res.redirect(`/courses/${course._id}`);
    } catch (error) {
        console.error(error);
        res.redirect('/courses');
    }
};

// Список всех курсов
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('instructor')
            .sort({ createdAt: -1 });
        
        res.render('courses/index', { 
            courses,
            user: req.user 
        });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Ошибка загрузки курсов' });
    }
};