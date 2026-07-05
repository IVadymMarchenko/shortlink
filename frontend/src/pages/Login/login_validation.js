const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateLoginForm = (email, password) => {
  const errors = { email: '', password: '' };
  let isValid = true;

  if (!email || !email.trim()) {
    errors.email = 'auth.enterEmail'; // повертаємо ключ замість тексту
    isValid = false;
  } else if (!isValidEmail(email.trim())) {
    errors.email = 'auth.invalidEmail';
    isValid = false;
  }

  if (!password) {
    errors.password = 'auth.enterPassword';
    isValid = false;
  }

  return { isValid, errors };
};

export const validateRegisterForm = (name, email, password) => {
  const errors = { name: '', email: '', password: '' };
  let isValid = true;

  if (!name || !name.trim()) {
    errors.name = 'auth.enterName';
    isValid = false;
  } else if (name.trim().length < 2) {
    errors.name = 'auth.shortName';
    isValid = false;
  }

  if (!email || !email.trim()) {
    errors.email = 'auth.enterEmail';
    isValid = false;
  } else if (!isValidEmail(email.trim())) {
    errors.email = 'auth.invalidEmail';
    isValid = false;
  }

  if (!password) {
    errors.password = 'auth.enterPassword';
    isValid = false;
  } else if (password.length < 6) {
    errors.password = 'auth.shortPassword';
    isValid = false;
  }

  return { isValid, errors };
};