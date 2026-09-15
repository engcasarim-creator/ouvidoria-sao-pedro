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
        // Mapeamento seguro de elementos do DOM
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

    /**
     * Alterna a visibilidade e obrigatoriedade dos campos de e-mail e telefone
     * quando o munícipe escolhe entre Reclamação Identificada ou Anônima.
     */
    private atualizarVisibilidadeIdentificacao(): void {
        const isAnonimo = this.radioAnonimo?.checked ?? false;

        if (this.secaoIdentificacao) {
            if (isAnonimo) {
                this.secaoIdentificacao.classList.add('d-none');
                
                // Remove a obrigatoriedade dos campos
                if (this.inputEmail) this.inputEmail.required = false;
                if (this.inputTelefone) this.inputTelefone.required = false;
            } else {
                this.secaoIdentificacao.classList.remove('d-none');
                
                // Reverte a obrigatoriedade dos campos para manifestações identificadas
                if (this.inputEmail) this.inputEmail.required = true;
                if (this.inputTelefone) this.inputTelefone.required = true;
            }
        }
    }

    /**
     * Envio assíncrono via fetch tratando os cenários de sucesso e exceção com try/catch
     */
    private async enviarFormulario(e: Event): Promise<void> {
        e.preventDefault();

        if (!this.formElement) return;

        const formData = new FormData(this.formElement);
        const isAnonimo = this.radioAnonimo?.checked ?? false;

        // Validação adicional de segurança no front-end
        if (!isAnonimo) {
            const emailVal = this.inputEmail?.value.trim();
            const telVal = this.inputTelefone?.value.trim();

            if (!emailVal && !telVal) {
                alert('Para reclamações identificadas, informe pelo menos o e-mail ou o telefone para receber a resposta.');
                return;
            }
        }

        try {
            const response = await fetch('/api/manifestacoes.php', {
                method: 'POST',
                body: formData
            });

            const resultado: ApiResponse<{ protocolo: string }> = await response.json();

            if (!response.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || 'Falha ao cadastrar reclamação.');
            }

            // Exibe mensagem com o protocolo gerado
            const protocolo = resultado.dados?.protocolo || 'N/A';
            alert(`Sua reclamação foi registrada com sucesso!\n\nNúmero do Protocolo: ${protocolo}`);

            // Reseta o formulário
            this.formElement.reset();
            this.atualizarVisibilidadeIdentificacao();

        } catch (error) {
            console.error('Erro no envio do formulário:', error);
            const mensagemErro = error instanceof Error ? error.message : 'Erro inesperado de conexão.';
            alert(`Não foi possível enviar a reclamação:\n${mensagemErro}`);
        }
    }
}

// Inicializa o controle do formulário no carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    new FormOuvidoria();
});