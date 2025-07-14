const mongoose = require('mongoose');

module.exports = function() {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Успешное подключение к MongoDB'))
    .catch(err => {
        console.error('Ошибка подключения к MongoDB:', err);
        process.exit(1); // Завершить процесс при ошибке
    });
    
    // Дополнительные обработчики событий
    mongoose.connection.on('connected', () => {
        console.log('Mongoose подключен к базе данных');
    });
    
    mongoose.connection.on('error', (err) => {
        console.error(`Ошибка подключения Mongoose: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose отключен от базы данных');
    });
};