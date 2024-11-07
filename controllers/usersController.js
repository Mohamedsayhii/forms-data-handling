const usersStorage = require('../databases/userDatabase');
const { body, validationResult } = require('express-validator');

const alphaErr = 'must only contain letters.';
const lengthErr = 'must be between 1 and 10 characters.';
const emailErr = 'must be correct email format.';
const numErr = 'must only contain numbers.';
const ageErr = 'must be between 18 and 120.';

const validateUser = [
	body('firstName')
		.trim()
		.isAlpha()
		.withMessage(`First name ${alphaErr}`)
		.isLength({ min: 1, max: 10 })
		.withMessage(`First name ${lengthErr}`),
	body('lastName')
		.trim()
		.isAlpha()
		.withMessage(`Last name ${alphaErr}`)
		.isLength({ min: 1, max: 10 })
		.withMessage(`Last name ${lengthErr}`),
	body('email').trim().isEmail().withMessage(`Email ${emailErr}`),
	body('age')
		.optional({ values: 'falsy' })
		.trim()
		.isNumeric()
		.withMessage(`Age ${numErr}`)
		.isInt({ min: 18, max: 120 })
		.withMessage(`Age ${ageErr}`),
	body('bio')
		.optional({ values: 'falsy' })
		.trim()
		.isLength({ max: 200 })
		.withMessage('Bio must be less tham 200 characters'),
];

exports.usersListGet = (req, res) => {
	res.render('index', {
		title: 'User List',
		users: usersStorage.getUsers(),
	});
};

exports.usersCreateGet = (req, res) => {
	res.render('createUser', {
		title: 'Create User',
	});
};

exports.usersSearchGet = (req, res) => {
	const { name } = req.query;

	if (!name) {
		return res.render('searchUser', {
			title: 'Search User',
			users: undefined,
		});
	}

	const users = usersStorage.getUsers();
	const filteredUsers = users.filter((user) =>
		`${user.firstName} ${user.lastName}`
			.toLowerCase()
			.includes(name.toLowerCase())
	);

	res.render('searchUser', {
		title: 'Search User',
		users: filteredUsers,
	});
};

exports.usersCreatePost = [
	validateUser,
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render('createUser', {
				title: 'Create User',
				errors: errors.array(),
			});
		}

		const { firstName, lastName, email, age, bio } = req.body;
		usersStorage.addUser({ firstName, lastName, email, age, bio });
		res.redirect('/');
	},
];

exports.usersUpdateGet = (req, res) => {
	const user = usersStorage.getUser(req.params.id);
	res.render('updateUser', {
		title: 'Update User',
		user: user,
	});
};

exports.usersUpdatePost = [
	validateUser,
	(req, res) => {
		const user = usersStorage.getUser(req.params.id);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render('updateUser', {
				title: 'Update User',
				user: user,
				errors: errors.array(),
			});
		}

		const { firstName, lastName, email, age, bio } = req.body;
		usersStorage.updateUser(req.params.id, {
			firstName,
			lastName,
			email,
			age,
			bio,
		});
		res.redirect('/');
	},
];

exports.usersDeletePost = (req, res) => {
	usersStorage.deleteUser(req.params.id);
	res.redirect('/');
};
