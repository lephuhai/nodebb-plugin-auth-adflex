const passport = module.parent.require('passport'),
    passportLocal = module.parent.require('passport-local').Strategy,
    winston = module.parent.require('winston'),
    request = module.parent.require('request'),
    nconf = module.parent.require('nconf'),
    user = require.main.require('./src/user'),
    plugin = {};

plugin.load = function (params, callback) {

    var router = params.router;
    var middleware = params.middleware;

    function render(req, res, next) {

        res.render('UserProfileDefine');
    }

    router.get('/verify', middleware.buildHeader, render);
    router.get('/api/verify', render);

    callback();
};

plugin.redirectToConfirm = function (params, callback) {
    params.referrer = nconf.get('relative_path') + '/verify';
    callback(null, params);
};

plugin.login = () => {
    winston.info('[login] Registering new local login strategy');
    passport.use(new passportLocal({passReqToCallback: true}, plugin.localLogin));
};

plugin.localLogin = function(req, username, password, next) {
    if (!username) {
        return next(new Error('[[error:invalid-username]]'))
    }

    if (!password) {
        return next(new Error('[[error:invalid-password]]'))
    }

    if (password.length > 4096) {
        return next(new Error('[[error:password-too-long]]'));
    }

    var userData = {
        "passwordExpiry": 0,
        "uid": 1,
        "isAdminOrGlobalMod": true
    };

    next(null, userData, '[[success:authentication-successful]]');

    // Do your stuff here (query API or SQL db, etc...)
    // If the login was successful:

    // TODO:

    // next(null, {
    //     uid: "machine"
    // }, '[[success:authentication-successful]]');

    // But if the login was unsuccessful, pass an error back, like so:
    // next(new Error('[[error:invalid-username-or-password]]'));

    /*
        You'll probably want to add login in this method to determine whether a login
        refers to an existing user (in which case log in as above), or a new user, in
        which case you'd want to create the user by calling User.create. For your
        convenience, this is how you'd create a user:

        var user = module.parent.require('./user');

        user.create({
            username: 'someuser',
            email: 'someuser@example.com'
        });

        Acceptable values are: username, email, password
    */
};

module.exports = plugin;
