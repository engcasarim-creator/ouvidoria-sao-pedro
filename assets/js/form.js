var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        // Mapeamento seguro de elementos do DOM
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
    /**
     * Alterna a visibilidade e obrigatoriedade dos campos de e-mail e telefone
     * quando o munícipe escolhe entre Reclamação Identificada ou Anônima.
     */
    atualizarVisibilidadeIdentificacao() {
        var _a;
        var _b;
        const isAnonimo = (_b = (_a = this.radioAnonimo) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false;
        if (this.secaoIdentificacao) {
            if (isAnonimo) {
                this.secaoIdentificacao.classList.add('d-none');
                // Remove a obrigatoriedade dos campos
                if (this.inputEmail)
                    this.inputEmail.required = false;
                if (this.inputTelefone)
                    this.inputTelefone.required = false;
            }
            else {
                this.secaoIdentificacao.classList.remove('d-none');
                // Reverte a obrigatoriedade dos campos para manifestações identificadas
                if (this.inputEmail)
                    this.inputEmail.required = true;
                if (this.inputTelefone)
                    this.inputTelefone.required = true;
            }
        }
    }
    /**
     * Envio assíncrono via fetch tratando os cenários de sucesso e exceção com try/catch
     */
    enviarFormulario(e) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            var _e;
            e.preventDefault();
            if (!this.formElement)
                return;
            const formData = new FormData(this.formElement);
            const isAnonimo = (_e = (_a = this.radioAnonimo) === null || _a === void 0 ? void 0 : _a.checked) !== null && _e !== void 0 ? _e : false;
            // Validação adicional de segurança no front-end
            if (!isAnonimo) {
                const emailVal = (_b = this.inputEmail) === null || _b === void 0 ? void 0 : _b.value.trim();
                const telVal = (_c = this.inputTelefone) === null || _c === void 0 ? void 0 : _c.value.trim();
                if (!emailVal && !telVal) {
                    alert('Para reclamações identificadas, informe pelo menos o e-mail ou o telefone para receber a resposta.');
                    return;
                }
            }
            try {
                const response = yield fetch('/api/manifestacoes.php', {
                    method: 'POST',
                    body: formData
                });
                const resultado = yield response.json();
                if (!response.ok || !resultado.sucesso) {
                    throw new Error(resultado.mensagem || 'Falha ao cadastrar reclamação.');
                }
                // Exibe mensagem com o protocolo gerado
                const protocolo = ((_d = resultado.dados) === null || _d === void 0 ? void 0 : _d.protocolo) || 'N/A';
                alert(`Sua reclamação foi registrada com sucesso!\n\nNúmero do Protocolo: ${protocolo}`);
                // Reseta o formulário
                this.formElement.reset();
                this.atualizarVisibilidadeIdentificacao();
            }
            catch (error) {
                console.error('Erro no envio do formulário:', error);
                const mensagemErro = error instanceof Error ? error.message : 'Erro inesperado de conexão.';
                alert(`Não foi possível enviar a reclamação:\n${mensagemErro}`);
            }
        });
    }
}
// Inicializa o controle do formulário no carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    new FormOuvidoria();
});
export {};
