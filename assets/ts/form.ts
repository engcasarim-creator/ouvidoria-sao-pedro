import { ApiResponse } from './interfaces.js';

class FormOuvidoria {
    private formElement: HTMLFormElement | null = null;
    private secaoIdentificacao: HTMLElement | null = null;
    private radioIdentificado: HTMLInputElement | null = null;
    private radioAnonimo: HTMLInputElement | null = null;
    private inputEmail: HTMLInputElement | null = null;
    private inputTelefone: HTMLInputElement | null = null;

    constructor() {
        this.init();
    }

    private init(): void {
        this.formElement = document.getElementById('formOuvidoria') as HTMLFormElement | null;
        this.secaoIdentificacao = document.getElementById('secaoIdentificacao');
        this.radioIdentificado = document.getElementById('tipoIdentificado') as HTMLInputElement | null;
        this.radioAnonimo = document.getElementById('tipoAnonimo') as HTMLInputElement | null;
        this.inputEmail = document.getElementById('email') as HTMLInputElement | null;
        this.inputTelefone = document.getElementById('telefone') as HTMLInputElement | null;

        if (this.formElement) {
            this.bindEvents();
            this.atualizarVisibilidadeIdentificacao();
        }
    }

    private bindEvents(): void {
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

    private atualizarVisibilidadeIdentificacao(): void {
        const isAnonimo = this.radioAnonimo?.checked ?? false;

        if (this.secaoIdentificacao) {
            if (isAnonimo) {
                this.secaoIdentificacao.classList.add('d-none');
                
                if (this.inputEmail) this.inputEmail.required = false;
                if (this.inputTelefone) this.inputTelefone.required = false;
            } else {
                this.secaoIdentificacao.classList.remove('d-none');
                
                if (this.inputEmail) this.inputEmail.required = true;
                if (this.inputTelefone) this.inputTelefone.required = true;
            }
        }
    }

    private async enviarFormulario(e: Event): Promise<void> {
        e.preventDefault();

        if (!this.formElement) return;

        const formData = new FormData(this.formElement);
        const isAnonimo = this.radioAnonimo?.checked ?? false;

        if (!isAnonimo) {
            const emailVal = this.inputEmail?.value.trim();
            const telVal = this.inputTelefone?.value.trim();

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
            let resultado: ApiResponse<{ protocolo: string }>;

            try {
                resultado = JSON.parse(textResponse);
            } catch {
                throw new Error('O servidor respondeu com um formato inválido. Verifique se o caminho da API e o PHP estão corretos.');
            }

            if (!response.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || 'Falha ao cadastrar reclamação.');
            }

            const protocolo = resultado.dados?.protocolo || 'N/A';
            alert(`Sua reclamação foi registrada com sucesso!\n\nNúmero do Protocolo: ${protocolo}`);

            this.formElement.reset();
            this.atualizarVisibilidadeIdentificacao();

        } catch (error) {
            console.error('Erro no envio do formulário:', error);
            const mensagemErro = error instanceof Error ? error.message : 'Erro inesperado de conexão.';
            alert(`Não foi possível enviar a reclamação:\n${mensagemErro}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormOuvidoria();
});