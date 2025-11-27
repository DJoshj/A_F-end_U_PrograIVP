export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/api/v1', // Base URL for the API
    loginURl: 'http://localhost:8080/api/v1/login',

    //users
    UserUrl:'http://localhost:8080/api/v1/user',
    GetUserByIdUrl:'http://localhost:8080/api/v1/user/search/id/',
    GetUserByUsernameUrl:'http://localhost:8080/api/v1/user/search/username/',
    createUserUrl: 'http://localhost:8080/api/v1/user/create',
    DeleteUserUrl: 'http://localhost:8080/api/v1/user/delete',


    //estudiantes

    //horarios
    getAllSchedulesUrl:'http://localhost:8080/api/v1/schedules/all',

    //materias
    getAllAssignedSubjetsURl:'http://localhost:8080/api/v1/subject-assignments/all',

    //teachers
    getAllTeachersUrl:'http://localhost:8080/api/v1/teacher/all'
};
