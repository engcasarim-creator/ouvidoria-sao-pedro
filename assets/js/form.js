class FormOuvidoria {
    constructor() {
        this.formElement = null;
        this.secaoIdentificacao = null;
        this.radioIdentificado = null;
        this.radioAnonimo = null;
        this.inputEmail = null;
        this.inputTelefone = null;
        this.init();
    }
    init() {
        this.formElement = document.getElementById('formOuvidoria');
        this.secaoIdentificacao = document.getElementById('secaoIdentificacao');
        this.radioIdentificado = document.getElementById('tipoIdentificado');
        this.radioAnonimo = document.getElementById('tipoAnonimo');
        this.inputEmail = document.getElementById('email');
        this.inputTelefone = document.getElementById('telefone');
        if (this.formElement) {
            this.bindEvents();
            this.atualizarVisibilidadeIdentificacao();
        }
    }
    bindEvents() {
        if (this.radioIdentificado) {
            this.radioIdentificado.addEventListener('change', () => this.atualizarVisibilidadeIdentificacao());
        }
        if (this.radioAnonimo) {
            this.radioAnonimo.addEventListener('change', () => this.atualizarVisibilidadeIdentificacao());
        }
        if (this.formElement) {
            this.formElement.addEventListener('submit', (e) => this.enviarFormulario(e));
        }
    }
    atualizarVisibilidadeIdentificacao() {
        var _a;
        var _b;
        const isAnonimo = (_b = (_a = this.radioAnonimo) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false;
        if (this.secaoIdentificacao) {
            if (isAnonimo) {
                this.secaoIdentificacao.classList.add('d-none');
                if (this.inputEmail)
                    this.inputEmail.required = false;
                if (this.inputTelefone)
                    this.inputTelefone.required = false;
            }
            else {
                this.secaoIdentificacao.classList.remove('d-none');
                if (this.inputEmail)
                    this.inputEmail.required = true;
                if (this.inputTelefone)
                    this.inputTelefone.required = true;
            }
        }
    }
    async enviarFormulario(e) {
        var _a, _b, _c, _d;
        var _e;
        e.preventDefault();
        if (!this.formElement)
            return;
        const formData = new FormData(this.formElement);
        const isAnonimo = (_e = (_a = this.radioAnonimo) === null || _a === void 0 ? void 0 : _a.checked) !== null && _e !== void 0 ? _e : false;
        if (!isAnonimo) {
            const emailVal = (_b = this.inputEmail) === null || _b === void 0 ? void 0 : _b.value.trim();
            const telVal = (_c = this.inputTelefone) === null || _c === void 0 ? void 0 : _c.value.trim();
            if (!emailVal && !telVal) {
                alert('Para reclamações identificadas, informe pelo menos o e-mail ou o telefone para receber a resposta.');
                return;
            }
        }
        try {
            // Garante o caminho relativo correto independentemente da rota atual
            const apiUrl = window.location.pathname.replace(/\/[^\/]*$/, '/api/manifestacoes.php');
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });
            // Converte a resposta em texto primeiro para evitar exceção de parse de JSON caso o servidor devolva erro HTML
            const textResponse = await response.text();
            let resultado;
            try {
                resultado = JSON.parse(textResponse);
            }
            catch (_f) {
                throw new Error('O servidor respondeu com um formato inválido. Verifique se o caminho da API e o PHP estão corretos.');
            }
            if (!response.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || 'Falha ao cadastrar reclamação.');
            }
            const protocolo = ((_d = resultado.dados) === null || _d === void 0 ? void 0 : _d.protocolo) || 'N/A';
            alert(`Sua reclamação foi registrada com sucesso!\n\nNúmero do Protocolo: ${protocolo}`);
            this.formElement.reset();
            this.atualizarVisibilidadeIdentificacao();
        }
        catch (error) {
            console.error('Erro no envio do formulário:', error);
            const mensagemErro = error instanceof Error ? error.message : 'Erro inesperado de conexão.';
            alert(`Não foi possível enviar a reclamação:\n${mensagemErro}`);
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new FormOuvidoria();
});
export {};
