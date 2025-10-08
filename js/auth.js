// User authentication and management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Check for stored authentication
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.isAuthenticated = true;
        }

        // Initialize form handlers
        this.initializeLoginForm();
        this.initializeRegisterForm();
        this.initializePasswordToggles();
        this.initializePasswordStrength();
        this.initializeSocialLogin();
    }

    initializeLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const remember = loginForm.remember.checked;

            try {
                await this.login(email, password, remember);
                window.location.href = '../index.html';
            } catch (error) {
                this.showError(error.message);
            }
        });
    }

    initializeRegisterForm() {
        const registerForm = document.getElementById('register-form');
        if (!registerForm) return;

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = registerForm.name.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm['confirm-password'].value;
            const terms = registerForm.terms.checked;

            if (!terms) {
                this.showError('Você precisa aceitar os termos de uso.');
                return;
            }

            if (password !== confirmPassword) {
                this.showError('As senhas não coincidem.');
                return;
            }

            try {
                await this.register(name, email, password);
                window.location.href = 'login.html';
            } catch (error) {
                this.showError(error.message);
            }
        });
    }

    initializePasswordToggles() {
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const icon = button.querySelector('i');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    initializePasswordStrength() {
        const passwordInput = document.querySelector('input[type="password"]');
        const strengthMeter = document.querySelector('.strength-meter');
        const strengthText = document.querySelector('.strength-text');

        if (!passwordInput || !strengthMeter || !strengthText) return;

        passwordInput.addEventListener('input', () => {
            const strength = this.checkPasswordStrength(passwordInput.value);
            strengthMeter.setAttribute('data-strength', strength.level);
            strengthText.textContent = strength.message;
        });
    }

    initializeSocialLogin() {
        const googleButton = document.querySelector('.social-button.google');
        const facebookButton = document.querySelector('.social-button.facebook');

        if (googleButton) {
            googleButton.addEventListener('click', () => this.socialLogin('google'));
        }

        if (facebookButton) {
            facebookButton.addEventListener('click', () => this.socialLogin('facebook'));
        }
    }

    async login(email, password, remember = false) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // In a real application, validate credentials against a backend
                const user = {
                    id: 1,
                    name: 'Usuário Teste',
                    email: email,
                    // Add other user data
                };

                this.currentUser = user;
                this.isAuthenticated = true;

                if (remember) {
                    localStorage.setItem('user', JSON.stringify(user));
                } else {
                    sessionStorage.setItem('user', JSON.stringify(user));
                }

                resolve(user);
            }, 1000);
        });
    }

    async register(name, email, password) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // In a real application, send registration data to backend
                resolve({
                    success: true,
                    message: 'Registro realizado com sucesso!'
                });
            }, 1000);
        });
    }

    async socialLogin(provider) {
        // Implement social login logic
        console.log(`Social login with ${provider}`);
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    checkPasswordStrength(password) {
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const length = password.length;

        if (length < 8) {
            return { level: 'weak', message: 'Senha muito fraca' };
        }

        const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

        if (strength === 4 && length >= 12) {
            return { level: 'strong', message: 'Senha forte' };
        } else if (strength >= 3) {
            return { level: 'medium', message: 'Senha média' };
        } else {
            return { level: 'weak', message: 'Senha fraca' };
        }
    }

    showError(message) {
        // Implement error display logic
        alert(message);
    }

    // User profile management
    async updateProfile(data) {
        // Implement profile update logic
    }

    async changePassword(oldPassword, newPassword) {
        // Implement password change logic
    }

    async resetPassword(email) {
        // Implement password reset logic
    }
}

// Initialize authentication
const auth = new AuthManager();

// Export for use in other files
export default auth;