const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

// Создание нового задания
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, price } = req.body;
        const courseId = req.params.courseId;
        
        const newAssignment = new Assignment({
            title,
            description,
            course: courseId,
            dueDate: new Date(dueDate),
            price: parseFloat(price)
        });
        
        await newAssignment.save();
        res.redirect(`/courses/${courseId}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/courses/${courseId}/assignments/new`);
    }
};

// Страница создания задания
exports.newAssignment = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).render('error', { message: 'Курс не найден' });
        }
        
        res.render('assignments/create', { 
            course,
            user: req.user 
        });
    } catch (error) {
        console.error(error);
        res.redirect('/courses');
    }
};

// Детали задания
exports.getAssignmentDetails = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('course')
            .populate('submissions.student');
        
        if (!assignment) {
            return res.status(404).render('error', { message: 'Задание не найдено' });
        }
        
        res.render('assignments/details', { 
            assignment,
            user: req.user 
        });
    } catch (error) {
        console.error(error);
        res.redirect('/courses');
    }
};

// Сдача решения
exports.submitSolution = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).render('error', { message: 'Задание не найдено' });
        }
        
        const { solution } = req.body;
        
        // Проверка, не сдавал ли уже студент это задание
        const existingSubmission = assignment.submissions.find(sub => 
            sub.student.toString() === req.user._id.toString()
        );
        
        if (existingSubmission) {
            existingSubmission.solution = solution;
            existingSubmission.submittedAt = new Date();
        } else {
            assignment.submissions.push({
                student: req.user._id,
                solution
            });
        }
        
        await assignment.save();
        res.redirect(`/assignments/${assignment._id}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/assignments/${req.params.id}`);
    }
};
exports.buyAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      req.flash('error', 'Задание не найдено');
      return res.redirect('/courses');
    }
    
    // Эмуляция платежа
    console.log(`Пользователь ${req.user.username} купил задание "${assignment.title}" за $${assignment.price}`);
    
    // Здесь должна быть реальная логика платежа
    // Например: запись в базу, интеграция с платежной системой и т.д.
    
    req.flash('success', 'Задание успешно приобретено!');
    res.redirect(`/assignments/${assignment._id}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Ошибка при покупке задания');
    res.redirect('back');
  }
};
