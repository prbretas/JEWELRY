
/**
 * @file js/auth.js
 * @module AuthManager
 * @author Jewelry Team (prbretas)
 * @version 1.0.2
 * @date 2025-10-09
 * @description Gerenciamento de autenticação local (simulada) — login, registro, validação de formulário, toggles de senhas e integração social.
 *
 * Histórico de alterações:
 * - 1.0.2 (09/10/2025 14:00): Padronização de comentários e documentação JSDoc.
 * - 1.0.1: Atualizado com showToast e Promises.
 * - 1.0.0: Implementação inicial de login, registro e validação.
 */

/**
 * @class AuthManager
 * @description Gerencia a autenticação de usuários, incluindo login, registro,
 * validação de formulários e integrações sociais.
 *
 * (Note: Esta implementação usa Promises para simular chamadas de API)
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        // Tempo de simulação de API (para Promises)
        this.SIM_DELAY = 1000; 
    }

    /**
     * @method showError
     * @description Exibe mensagens de erro usando o sistema de notificação global.
     * @param {string} message - Mensagem de erro
     */
    showError(message) {
        // AJUSTE: Substituído alert() por showToast()
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'error');
        } else {
            console.error('Auth Error: ' + message);
        }
    }

    /**
     * @method validateCPF
     * @description Valida um número de CPF.
     * @param {string} cpf - CPF a ser validado
     * @returns {boolean} true se o CPF é válido, false caso contrário
     */
    validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) {
            sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    }

    /**
     * @method formatCPF
     * @description Formata um CPF com pontos e traço.
     * @param {string} cpf - CPF a ser formatado
     * @returns {string} CPF formatado
     */
    formatCPF(cpf) {
        return cpf
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    /**
     * @method formatPhone
     * @description Formata um número de telefone.
     * @param {string} phone - Telefone a ser formatado
     * @returns {string} Telefone formatado
     */
    formatPhone(phone) {
        return phone
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    }

    /**
     * @method validatePassword
     * @description Valida uma senha conforme critérios de segurança.
     * @param {string} password - Senha a ser validada
     * @returns {boolean} true se a senha atende aos critérios
     */
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);
        
        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers &&
            hasSpecialChar
        );
    }

    /**
     * @method validateAge
     * @description Verifica se a pessoa tem pelo menos 18 anos.
     * @param {string} birthDate - Data de nascimento
     * @returns {boolean} true se tem 18 anos ou mais
     */
    validateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const month = today.getMonth() - birth.getMonth();
        
        if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age >= 18;
    }

    /**
     * @method login
     * @description Simula o login do usuário.
     * @async
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Promessa resolvida com dados do usuário ou rejeitada com erro
     */
    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email || !password) {
                    this.showError('Preencha email e senha.');
                    return reject({ message: 'Campos obrigatórios ausentes.' });
                }

                // Simulação de autenticação
                if (email === 'ph@joalheria.com' && password === '123456') {
                    this.currentUser = { email, name: 'PH' };
                    this.isAuthenticated = true;
                    if (typeof window.showToast === 'function') {
                        window.showToast(`Bem-vindo, ${this.currentUser.name}!`, 'success');
                    }
                    return resolve(this.currentUser);
                } else {
                    this.showError('Credenciais inválidas.');
                    return reject({ message: 'Credenciais inválidas.' });
                }
            }, this.SIM_DELAY);
        });
    }

    /**
     * @method register
     * @description Simula o registro de um novo usuário.
     * @async
     * @param {string} email - Email do novo usuário
     * @param {string} password - Senha do novo usuário
     * @returns {Promise<Object>} Promessa resolvida com dados do novo usuário
     */
    async register(email, password, name) {
         return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email || !password || !name) {
                    this.showError('Preencha todos os campos para registro.');
                    return reject({ message: 'Campos obrigatórios ausentes.' });
                }
                // Simulação de sucesso no registro
                const newUser = { email, name };
                if (typeof window.showToast === 'function') {
                    window.showToast('Registro realizado com sucesso! Faça login.', 'success');
                }
                return resolve(newUser);
            }, this.SIM_DELAY);
        });
    }

    /**
     * @method updateProfile
     * @description Simula atualização do perfil do usuário.
     * @async
     * @param {Object} data - Dados do perfil (ex: { name, email })
     * @returns {Promise<Object>} Promessa resolvida com dados atualizados ou rejeitada com erro
     */
    async updateProfile(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.isAuthenticated) {
                    this.showError('Você precisa estar logado para atualizar o perfil.');
                    return reject({ message: 'Usuário não autenticado.' });
                }
                if (!data || (!data.name && !data.email)) {
                    this.showError('Informe os dados para atualizar o perfil.');
                    return reject({ message: 'Dados insuficientes.' });
                }
                // Atualiza apenas os campos fornecidos
                if (data.name) this.currentUser.name = data.name;
                if (data.email) this.currentUser.email = data.email;
                if (typeof window.showToast === 'function') {
                    window.showToast('Perfil atualizado com sucesso!', 'success');
                }
                return resolve(this.currentUser);
            }, this.SIM_DELAY);
        });
    }

    /**
     * @method changePassword
     * @description Simula alteração de senha do usuário.
     * @async
     * @param {string} oldPassword - Senha atual
     * @param {string} newPassword - Nova senha
     * @returns {Promise<string>} Promessa resolvida com mensagem de sucesso ou rejeitada com erro
     */
    async changePassword(oldPassword, newPassword) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.isAuthenticated) {
                    this.showError('Você precisa estar logado para alterar a senha.');
                    return reject({ message: 'Usuário não autenticado.' });
                }
                if (!oldPassword || !newPassword) {
                    this.showError('Preencha todos os campos de senha.');
                    return reject({ message: 'Campos obrigatórios ausentes.' });
                }
                if (oldPassword === newPassword) {
                    this.showError('A nova senha deve ser diferente da atual.');
                    return reject({ message: 'Nova senha igual à atual.' });
                }
                // Simula sucesso
                if (typeof window.showToast === 'function') {
                    window.showToast('Senha alterada com sucesso!', 'success');
                }
                return resolve('Senha alterada com sucesso!');
            }, this.SIM_DELAY);
        });
    }

    /**
     * @method resetPassword
     * @description Simula reset de senha via email.
     * @async
     * @param {string} email - Email do usuário
     * @returns {Promise<string>} Promessa resolvida com mensagem de sucesso ou rejeitada com erro
     */
    async resetPassword(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!email) {
                    this.showError('Informe o e-mail para redefinir a senha.');
                    return reject({ message: 'E-mail não informado.' });
                }
                // Simula envio de email
                if (typeof window.showToast === 'function') {
                    window.showToast('Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.', 'info');
                }
                return resolve('Instruções de redefinição enviadas.');
            }, this.SIM_DELAY);
        });
    }

}

// Initialize authentication
const auth = new AuthManager();

// Expose to global for pages that include this file as a plain <script>
if (typeof window !== 'undefined') {
    window.auth = auth;
}

// Event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Elementos de login
    const loginForm = document.getElementById('loginForm');
    const loginPasswordInput = loginForm?.querySelector('input[type="password"]');
    const loginTogglePasswordBtn = loginForm?.querySelector('.toggle-password');

    // Elementos de registro
    const registerForm = document.getElementById('registerForm');
    const cpfInput = document.getElementById('cpf');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // Formatação de inputs
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            e.target.value = auth.formatCPF(e.target.value);
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = auth.formatPhone(e.target.value);
        });
    }

    // Toggle de senha
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            btn.innerHTML = `<i class="fas fa-${type === 'password' ? 'eye' : 'eye-slash'}"></i>`;
        });
    });

    // Validação do formulário de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let isValid = true;

            // Reset previous validations
            registerForm.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error', 'success');
                group.querySelector('.validation-message')?.remove();
            });

            const formData = new FormData(registerForm);
            const submitButton = registerForm.querySelector('button[type="submit"]');
            
            try {
                // Validação de idade
                const birthDate = formData.get('birthDate');
                if (!auth.validateAge(birthDate)) {
                    throw new Error('Você precisa ter pelo menos 18 anos para se cadastrar.');
                }

                // Validação de CPF
                const cpf = formData.get('cpf');
                if (!auth.validateCPF(cpf)) {
                    throw new Error('CPF inválido.');
                }

                // Validação de senha
                const password = formData.get('password');
                if (!auth.validatePassword(password)) {
                    throw new Error('A senha deve conter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.');
                }

                // Validação de confirmação de senha
                if (password !== formData.get('confirmPassword')) {
                    throw new Error('As senhas não coincidem.');
                }

                // Desabilita o botão e mostra loading
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

                // Registra o usuário
                const name = formData.get('fullName');
                const email = formData.get('email');
                await auth.register(email, password, name);

                // Redireciona para a página de login
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);

            } catch (error) {
                auth.showError(error.message || 'Erro ao realizar cadastro.');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Criar Conta';
            }
        });
    }

    // Manipulador do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            try {
                // Desabilita o botão e mostra loading
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

                const formData = new FormData(loginForm);
                const email = formData.get('email');
                const password = formData.get('password');

                await auth.login(email, password);

                // Redireciona para a página inicial
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);

            } catch (error) {
                auth.showError('Erro ao realizar login. Verifique suas credenciais.');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }
});