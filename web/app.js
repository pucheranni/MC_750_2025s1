document.addEventListener('DOMContentLoaded', () => {
    // --- Configurações (Traduzidas do Python) ---
    const BAUD_RATE = 115200;
    const TRIGGER_YEAR_SPECIAL_SEQUENCE = "1963";
    const TEXT_MESSAGE_SPECIAL = "No dia Primeiro de Abril, sem amparo da Constituição, com o presidente Goulart ainda em territorio nacional, o senador Auro de Moura Andrade, presidente do Congresso, declara vaga da Presidencia da República. É possível ouvir os protestos da oposição ao fundo";
    const VIDEO1_URL_SPECIAL = "https://www.youtube.com/watch?v=5rEb9G5w_8I";
    const VIDEO2_URL_SPECIAL = "https://www.youtube.com/watch?v=oEAARf5j_kM";
    const VIDEO1_DURATION_MS = 2 * 60 * 1000; // 2 minutos
    const CATEGORIAS = ["Política", "Cultura", "Direitos Humanos", "Economia", "Conflitos", "Resistência", "Internacional"];
    // --- Base de Dados (Extraída do Memorial da Democracia) ---
    document.addEventListener('DOMContentLoaded', () => {
    console.log('Eventos de 1964:', dadosAnos['1964']);
    document
        .getElementById('manual-year-button')
        .addEventListener('click', () => {
        mostrarEventos(
            document.getElementById('manual-year-input').value.trim()
        );
        });
    });
    function mostrarEventos(ano) {
        const eventos = dadosAnos[ano];
        if (!eventos) return alert(`Ano ${ano} não encontrado.`);
        processarAno(ano)
    }

    // --- Referências aos Elementos do HTML (DOM) ---
    const connectButton = document.getElementById('connect-button');
    const welcomeMessage = document.getElementById('welcome-message');
    const normalContent = document.getElementById('normal-content');
    const specialSequenceContent = document.getElementById('special-sequence-content');

    const displayAno = document.getElementById('display-ano');
    const eventCounter = document.getElementById('event-counter');
    const displayImagem = document.getElementById('display-imagem');
    const displayTitle = document.getElementById('display-title');
    const displayDate = document.getElementById('display-date');
    const displayVideo = document.getElementById('display-video');
    const displayGif = document.getElementById('display-gif');
    const displayDescription = document.getElementById('display-description');

    const animatedText = document.getElementById('animated-text');
    const specialStatus = document.getElementById('special-status');

    const manualYearInput = document.getElementById('manual-year-input');
    const manualYearButton = document.getElementById('manual-year-button');
    const prevEventButton = document.getElementById('prev-event');
    const nextEventButton = document.getElementById('next-event');

    // --- Variáveis de Estado ---
    let port;
    let reader;
    let ultimoAnoRecebido = null;
    let eventoAtualIndex = 0;
    let isSpecialSequenceActive = false;

    // --- Funções Principais ---

    const conectarSerial = async () => {
        if (!('serial' in navigator)) {
            alert('A Web Serial API não é suportada neste navegador. Tente usar o Chrome ou o Edge.');
            return;
        }

        if (port) {
            if (reader) {
                await reader.cancel();
                reader = null;
            }
            await port.close();
            port = null;
            connectButton.textContent = '🔌 Conectar ao Pico';
            connectButton.classList.remove('bg-red-600', 'hover:bg-red-700');
            connectButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
            console.log('Conexão serial fechada.');
            return;
        }

        try {
            port = await navigator.serial.requestPort();
            await port.open({ baudRate: BAUD_RATE });
            console.log('Conectado ao Pico com sucesso!');

            connectButton.textContent = '✅ Conectado';
            connectButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            connectButton.classList.add('bg-red-600', 'hover:bg-red-700');
            lerDadosSeriais();
            processarAno("1963");
        } catch (error) {
            console.error('Erro ao tentar conectar à porta serial:', error);
            alert('Falha ao conectar. Verifique se o dispositivo está conectado e não está sendo usado por outro programa.');
            port = null;
        }
    };

    const lerDadosSeriais = async () => {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    reader.releaseLock();
                    break;
                }

                // O valor pode conter múltiplos comandos (ex: "1980\nNEXT\nPREV\n")
                // Então, separamos por linha e processamos cada um
                const comandos = value.trim().split('\n');
                comandos.forEach(comando => {
                    const comandoLimpo = comando.trim();
                    if (!comandoLimpo) return; // Ignora linhas vazias

                    console.log(`Comando recebido do Pico: ${comandoLimpo}`);

                    // Verifica se o comando é um ano de 4 dígitos
                    if (/^\d{4}$/.test(comandoLimpo)) {
                        if (comandoLimpo !== ultimoAnoRecebido) {
                            processarAno(comandoLimpo);
                        }
                    }
                    // Verifica se é um comando de navegação
                    else if (comandoLimpo === 'NEXT') {
                        // Simula o clique no botão de próximo evento
                        nextEventButton.click();
                    } else if (comandoLimpo === 'PREV') {
                        // Simula o clique no botão de evento anterior
                        prevEventButton.click();
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao ler da porta serial:', error);
        }
    };

    const processarAno = (anoStr) => {
        if (isSpecialSequenceActive && anoStr !== TRIGGER_YEAR_SPECIAL_SEQUENCE) {
            isSpecialSequenceActive = false;
        }

        ultimoAnoRecebido = anoStr;
        eventoAtualIndex = 0; // Reseta o índice para o novo ano

        if (anoStr === TRIGGER_YEAR_SPECIAL_SEQUENCE) {
            iniciarSequenciaEspecial();
        } else {
            exibirConteudoNormal();
        }
    };

    const exibirEvento = () => {
        // Adiciona um pequeno efeito de fade para a transição
        const contentContainer = document.querySelector('.relative.bg-gray-800\\/50');
        // Hide all media elements and clear video src
        displayImagem.classList.add('hidden');
        displayImagem.src = ''; // Clear src to avoid loading old image if new event has no image
        displayVideo.classList.add('hidden');
        displayVideo.src = ''; // Important to stop previous video if any
        displayGif.classList.add('hidden');
        displayGif.src = ''; // Clear src for GIFs
        contentContainer.style.opacity = 0;

        setTimeout(() => {
            const eventosDoAno = dadosAnos[ultimoAnoRecebido];
            if (!eventosDoAno || eventosDoAno.length === 0) {
                return;
            }

            const evento = eventosDoAno[eventoAtualIndex];
            const totalEventos = eventosDoAno.length;

            displayAno.textContent = ultimoAnoRecebido;
            displayTitle.textContent = evento.title;
            displayDate.textContent = evento.date;
            displayDescription.textContent = evento.description;
            eventCounter.textContent = `Evento ${eventoAtualIndex + 1} de ${totalEventos}`;

            // NEW CODE:
            if (evento.videoUrl) {
                displayVideo.src = evento.videoUrl;
                displayVideo.classList.remove('hidden');
            } else if (evento.gifUrl) {
                displayGif.src = evento.gifUrl;
                displayGif.classList.remove('hidden');
            } else if (evento.imageUrl) {
                displayImagem.src = evento.imageUrl;
                displayImagem.classList.remove('hidden');
            }
            // No need for an else here, as all are hidden by default at the start of the function

            prevEventButton.disabled = eventoAtualIndex === 0;
            nextEventButton.disabled = eventoAtualIndex === totalEventos - 1;

            contentContainer.style.opacity = 1;
        }, 150); // Duração da transição
    };

    const exibirConteudoNormal = () => {
        const dados = dadosAnos[ultimoAnoRecebido];
        if (!dados) {
            welcomeMessage.classList.remove('hidden');
            welcomeMessage.querySelector('p').textContent = `Nenhum evento encontrado para o ano ${ultimoAnoRecebido}.`;
            normalContent.classList.add('hidden');
            specialSequenceContent.classList.add('hidden');
            return;
        }

        welcomeMessage.classList.add('hidden');
        specialSequenceContent.classList.add('hidden');
        normalContent.classList.remove('hidden');

        exibirEvento();
    };

    const typeWriter = (element, text, speed) => {
        return new Promise(resolve => {
            let i = 0;
            element.textContent = "";
            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            type();
        });
    };

    const iniciarSequenciaEspecial = async () => {
            welcomeMessage.classList.add('hidden');
            normalContent.classList.add('hidden');
            specialSequenceContent.classList.remove('hidden');
            // Reseta textos
            animatedText.textContent = '';
            specialStatus.textContent = '';
            // Dispara o efeito de digitação
            await typeWriter(animatedText, TEXT_MESSAGE_SPECIAL, 10);
            // Opcional: sinaliza fim da sequência
            eventoAtualIndex = 0;
            return;
        };

    // --- Event Listeners ---
    connectButton.addEventListener('click', conectarSerial);

    manualYearButton.addEventListener('click', () => {
        const ano = manualYearInput.value;
        if (ano && dadosAnos[ano]) {
            console.log(`Ano manual inserido: ${ano}`);
            processarAno(ano);
        } else {
            alert(`Ano inválido ou sem dados. Por favor, insira um ano entre 1964 e 1984.`);
        }
    });

    nextEventButton.addEventListener('click', () => {
        const eventosDoAno = dadosAnos[ultimoAnoRecebido];
        if (eventosDoAno && eventoAtualIndex < eventosDoAno.length - 1) {
            eventoAtualIndex++;
            exibirEvento();
        }
    });

    prevEventButton.addEventListener('click', () => {
        if (eventoAtualIndex > 0) {
            eventoAtualIndex--;
            exibirEvento();
        }
    });
});
