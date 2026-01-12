const API_URL = 'https://model-barber-backend.onrender.com/api';
let usuarioLogado = null;

function exibirNotificacao(msg) {
    let notif = document.getElementById('notificacaoSite');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'notificacaoSite';
        notif.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#222;color:#ffd700;padding:1rem 2rem;border-radius:8px;z-index:9999;`;
        document.body.appendChild(notif);
    }
    notif.textContent = msg;
    notif.style.display = 'block';
    setTimeout(() => { notif.style.display = 'none'; }, 3500);
}

function getUsuarioLogado() {
    if (window.user && window.user._id) return window.user;
    try {
        const u = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (u && u._id) { window.user = u; return u; }
    } catch { }
    return null;
}

function mostrarSection(id) {
    document.querySelectorAll('section[id]').forEach(s => s.style.display = 'none');
    const sec = document.getElementById(id);
    if (sec) sec.style.display = 'block';
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function modalConfirm(title, msg) {
    return new Promise((resolve) => {
        const modal = document.getElementById('modalCustomConfirm');
        const t = document.getElementById('modalCustomConfirmTitle');
        const m = document.getElementById('modalCustomConfirmMessage');
        const y = document.getElementById('modalCustomConfirmYes');
        const n = document.getElementById('modalCustomConfirmNo');
        t.textContent = title;
        m.textContent = msg;
        modal.style.display = 'flex';
        const cleanup = () => { modal.style.display = 'none'; y.removeEventListener('click', yes); n.removeEventListener('click', no); };
        const yes = () => { cleanup(); resolve(true); };
        const no = () => { cleanup(); resolve(false); };
        y.addEventListener('click', yes);
        n.addEventListener('click', no);
    });
}

function modalFormulario(title, campos) {
    return new Promise((resolve) => {
        const modal = document.getElementById('modalFormulario');
        const tituloEl = document.getElementById('modalFormularioTitle');
        const formEl = document.getElementById('formGenerico');
        const btnOk = document.getElementById('btnFormOk');
        const btnCancel = document.getElementById('btnFormCancel');

        // Remove listeners antigos para evitar acúmulo
        btnOk.replaceWith(btnOk.cloneNode(true));
        btnCancel.replaceWith(btnCancel.cloneNode(true));
        const newBtnOk = document.getElementById('btnFormOk');
        const newBtnCancel = document.getElementById('btnFormCancel');

        tituloEl.textContent = title;
        formEl.innerHTML = '';
        
        const inputs = {};
        campos.forEach(campo => {
            const div = document.createElement('div');
            div.style.cssText = 'display:flex;flex-direction:column;gap:0.3rem;margin-bottom:1rem;';
            
            let input;
            
            if (campo.type === 'checkbox') {
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = campo.value === true;
                
                const label = document.createElement('label');
                label.style.cssText = 'color:#fff;font-weight:500;font-size:0.9rem;display:flex;align-items:center;gap:0.5rem;cursor:pointer;';
                label.appendChild(input);
                label.appendChild(document.createTextNode(campo.label));
                
                inputs[campo.id] = input;
                div.appendChild(label);
            } else {
                const label = document.createElement('label');
                label.textContent = campo.label;
                label.style.cssText = 'color:#fff;font-weight:500;font-size:0.9rem;';
                
                if (campo.type === 'text' || campo.type === 'number' || campo.type === 'time' || campo.type === 'date') {
                    input = document.createElement('input');
                    input.type = campo.type;
                    input.placeholder = campo.placeholder || '';
                    input.value = campo.value || '';
                } else if (campo.type === 'select') {
                    input = document.createElement('select');
                    if (Array.isArray(campo.opcoes)) {
                        campo.opcoes.forEach(op => {
                            const opt = document.createElement('option');
                            opt.value = op.value;
                            opt.textContent = op.label;
                            input.appendChild(opt);
                        });
                    }
                }
                
                input.style.cssText = 'padding:0.5rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:6px;';
                inputs[campo.id] = input;
                
                div.appendChild(label);
                div.appendChild(input);
            }
            
            formEl.appendChild(div);
        });

        modal.style.display = 'flex';
        
        const cleanup = () => { modal.style.display = 'none'; };
        const ok = () => {
            const resultado = {};
            Object.keys(inputs).forEach(key => {
                const input = inputs[key];
                if (input.type === 'checkbox') {
                    resultado[key] = input.checked;
                } else {
                    resultado[key] = input.value;
                }
            });
            cleanup();
            resolve(resultado);
        };
        const cancel = () => { cleanup(); resolve(null); };
        
        newBtnOk.addEventListener('click', ok);
        newBtnCancel.addEventListener('click', cancel);
    });
}

document.addEventListener('DOMContentLoaded', async () => {

    // ===== SIDEBAR =====
    const btnMenu = document.getElementById('btnMenuMobile');
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    
    btnMenu?.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
    overlay?.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // ===== NAVIGATION =====
    document.getElementById('btnInicio')?.addEventListener('click', () => mostrarSection('inicio'));
    document.getElementById('sidebarInicio')?.addEventListener('click', () => mostrarSection('inicio'));
    
    document.getElementById('btnAgende')?.addEventListener('click', () => {
        const usuario = getUsuarioLogado();
        if (!usuario) {
            exibirNotificacao('Você precisa estar logado para agendar.');
            setTimeout(() => document.getElementById('modalAuth').style.display = 'flex', 500);
            return;
        }
        mostrarSection('agendar');
    });
    
    document.getElementById('sidebarAgende')?.addEventListener('click', () => {
        const usuario = getUsuarioLogado();
        if (!usuario) {
            exibirNotificacao('Você precisa estar logado para agendar.');
            setTimeout(() => document.getElementById('modalAuth').style.display = 'flex', 500);
            return;
        }
        mostrarSection('agendar');
    });
    
    document.getElementById('btnAgendeInicio')?.addEventListener('click', () => {
        const usuario = getUsuarioLogado();
        if (!usuario) {
            exibirNotificacao('Você precisa estar logado para agendar.');
            setTimeout(() => document.getElementById('modalAuth').style.display = 'flex', 500);
            return;
        }
        mostrarSection('agendar');
    });
    
    document.getElementById('btnFaleConosco')?.addEventListener('click', abrirWhatsapp);
    document.getElementById('sidebarContato')?.addEventListener('click', abrirWhatsapp);

    async function abrirWhatsapp() {
        try {
            const res = await fetch(`${API_URL}/whatsapp`);
            const data = await res.json();
            if (data.link) window.open(data.link, '_blank');
            else exibirNotificacao('Canal indisponível.');
        } catch {
            exibirNotificacao('Canal indisponível.');
        }
    }

    async function atualizarHorarioBar() {
        const p = document.querySelector('.horario-bar p');
        if (!p) return;

        const atualizarOffsetsLayout = () => {
            const bar = document.querySelector('.horario-bar');
            const header = document.querySelector('.header');
            const barH = bar ? Math.ceil(bar.getBoundingClientRect().height) : 0;
            const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
            const root = document.documentElement;
            root.style.setProperty('--horario-bar-h', `${barH}px`);
            root.style.setProperty('--header-h', `${headerH}px`);
            root.style.setProperty('--top-offset', `${barH + headerH}px`);
        };

        try {
            const res = await fetch(`${API_URL}/horarios`);
            const data = await res.json();

            const padrao = data?.padrao || { abre: '08:00', fecha: '19:00', almocoInicio: '12:00', almocoFim: '13:00' };
            const dias = data?.dias || {};

            // Ordem: Seg..Dom
            const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
            const nomes = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb' };

            const getCfgDia = (idx) => dias?.[idx] || dias?.[String(idx)] || {};
            const getAssinatura = (idx) => {
                const cfg = getCfgDia(idx);
                const fechado = cfg.fechado === true || cfg.aberto === false;
                if (fechado) return 'FECHADO';
                const abre = cfg.abre || padrao.abre;
                const fecha = cfg.fecha || padrao.fecha;
                const semAlmoco = cfg.semAlmoco === true;
                return `${abre}-${fecha}${semAlmoco ? ';semAlmoco' : ''}`;
            };

            const formatDias = (startIdx, endIdx) => {
                if (startIdx === endIdx) return nomes[startIdx];
                return `${nomes[startIdx]} a ${nomes[endIdx]}`;
            };

            const segmentos = [];
            let segStart = weekdayOrder[0];
            let segPrev = weekdayOrder[0];
            let segSig = getAssinatura(segStart);

            for (let i = 1; i < weekdayOrder.length; i++) {
                const idx = weekdayOrder[i];
                const sig = getAssinatura(idx);
                if (sig !== segSig) {
                    segmentos.push({ start: segStart, end: segPrev, sig: segSig });
                    segStart = idx;
                    segSig = sig;
                }
                segPrev = idx;
            }
            segmentos.push({ start: segStart, end: segPrev, sig: segSig });

            const textoSegmentos = segmentos.map(seg => {
                const diasTxt = formatDias(seg.start, seg.end);
                if (seg.sig === 'FECHADO') return `${diasTxt}: Fechado`;
                const [range, flag] = seg.sig.split(';');
                const [abre, fecha] = range.split('-');
                return `${diasTxt}: ${abre} às ${fecha}${flag === 'semAlmoco' ? ' (sem almoço)' : ''}`;
            });

            p.textContent = `Horário de funcionamento: ${textoSegmentos.join(' • ')}`;
            atualizarOffsetsLayout();
        } catch {
            // fallback: mantém o texto original
            atualizarOffsetsLayout();
        }
    }

    // ===== AUTH MODAL =====
    const modalAuth = document.getElementById('modalAuth');
    
    function abrirAuthModal(aba = 'cadastro') {
        const tabCad = document.getElementById('tabCadastro');
        const tabLog = document.getElementById('tabLogin');
        const formCad = document.getElementById('formCadastro');
        const formLog = document.getElementById('formLogin');
        const msg = document.getElementById('authMsg');
        
        if (aba === 'cadastro') {
            tabCad.classList.add('active');
            tabLog.classList.remove('active');
            formCad.style.display = 'flex';
            formLog.style.display = 'none';
        } else {
            tabCad.classList.remove('active');
            tabLog.classList.add('active');
            formCad.style.display = 'none';
            formLog.style.display = 'flex';
        }
        msg.textContent = '';
        modalAuth.style.display = 'flex';
    }

    document.getElementById('tabCadastro')?.addEventListener('click', () => abrirAuthModal('cadastro'));
    document.getElementById('tabLogin')?.addEventListener('click', () => abrirAuthModal('login'));
    document.getElementById('btnCadastro')?.addEventListener('click', () => abrirAuthModal('cadastro'));
    document.getElementById('btnLogin')?.addEventListener('click', () => abrirAuthModal('login'));
    document.getElementById('sidebarCadastro')?.addEventListener('click', () => abrirAuthModal('cadastro'));
    document.getElementById('sidebarLogin')?.addEventListener('click', () => abrirAuthModal('login'));
    
    document.getElementById('closeModalAuth')?.addEventListener('click', () => { modalAuth.style.display = 'none'; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modalAuth.style.display = 'none'; });
    modalAuth?.addEventListener('click', (e) => { if (e.target === modalAuth) modalAuth.style.display = 'none'; });

    // CADASTRO
    document.getElementById('formCadastro')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('authMsg');
        msg.textContent = 'Cadastrando...';
        try {
            const res = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: document.getElementById('cadNome').value.trim(),
                    sobrenome: document.getElementById('cadSobrenome').value.trim(),
                    email: document.getElementById('cadEmail').value.trim(),
                    telefone: document.getElementById('cadTelefone').value.trim(),
                    senha: document.getElementById('cadSenha').value,
                    barbeiro: false,
                    funcao: 'nenhum'
                })
            });
            const data = await res.json();
            if (res.ok) {
                msg.textContent = 'Cadastro realizado! Faça login.';
                document.getElementById('formCadastro').reset();
                setTimeout(() => { abrirAuthModal('login'); }, 1500);
            } else {
                msg.textContent = data.message || 'Erro ao cadastrar.';
            }
        } catch {
            msg.textContent = 'Erro de conexão.';
        }
    });

    // LOGIN
    document.getElementById('formLogin')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('authMsg');
        msg.textContent = 'Entrando...';
        try {
            const res = await fetch(`${API_URL}/clientes/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('loginEmail').value.trim(),
                    senha: document.getElementById('loginSenha').value
                })
            });
            const data = await res.json();
            if (res.ok && data?.nome && data?._id) {
                msg.textContent = 'Sucesso!';
                setTimeout(() => {
                    modalAuth.style.display = 'none';
                    salvarUsuario(data);
                    atualizarHeaderPerfil();
                    document.getElementById('formLogin').reset();
                }, 1200);
            } else {
                msg.textContent = data?.message || 'Email ou senha inválidos.';
            }
        } catch {
            msg.textContent = 'Erro de conexão.';
        }
    });

    function salvarUsuario(usuario) {
        usuarioLogado = usuario;
        window.user = usuario;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    }

    // ===== HEADER/SIDEBAR PERFIL =====
    function atualizarHeaderPerfil() {
        const usuario = getUsuarioLogado();
        const authHeader = document.getElementById('authButtonsHeader');
        const authSidebar = document.getElementById('sidebarAuth');
        const perfilHeader = document.getElementById('perfilHeader');
        const perfilSidebar = document.getElementById('perfilSidebar');

        // Atualiza visibilidade de aba exclusiva do chefe
        atualizarAbaAgendamentosGeraisVisibilidade();
        atualizarAcessoAbaAgendamentosNormal();

        if (!usuario) {
            authHeader.style.display = 'flex';
            authSidebar.style.display = 'flex';
            perfilHeader.style.display = 'none';
            perfilSidebar.style.display = 'none';
            perfilHeader.innerHTML = '';
            perfilSidebar.innerHTML = '';
            return;
        }

        authHeader.style.display = 'none';
        authSidebar.style.display = 'none';

        const nome = usuario.nome + ' ' + usuario.sobrenome.charAt(0) + '.';
        const btnPerfilStyle = 'background:none;border:1px solid #ffd700;color:#ffd700;cursor:pointer;font-weight:600;font-size:0.95rem;padding:0.5rem 1rem;border-radius:6px;';
        const btnPainelStyle = 'background:none;border:1px solid #ffd700;color:#ffd700;cursor:pointer;font-weight:600;font-size:0.95rem;padding:0.5rem 1rem;border-radius:6px;margin-left:0.5rem;';
        
        const btnPerfil = '<button id="btnAbrirPerfil" style="' + btnPerfilStyle + '">' + nome + '</button>';
        const btnPainel = (usuario.barbeiro || usuario.funcao === 'chefe') ? '<button id="btnAbrirBarbearia" style="' + btnPainelStyle + '">Painel</button>' : '';
        const html = btnPerfil + btnPainel;

        const isMobile = window.matchMedia('(max-width: 700px)').matches;
        
        if (isMobile) {
            perfilSidebar.innerHTML = html;
            perfilSidebar.style.display = 'flex';
            perfilHeader.style.display = 'none';
            // Evita IDs duplicados entre header e sidebar
            perfilHeader.innerHTML = '';
        } else {
            perfilHeader.innerHTML = html;
            perfilHeader.style.display = 'flex';
            perfilSidebar.style.display = 'none';
            // Evita IDs duplicados entre header e sidebar
            perfilSidebar.innerHTML = '';
        }

        // Conecta handlers no container correto (mobile: sidebar / desktop: header)
        [perfilHeader, perfilSidebar].forEach(container => {
            container?.querySelector('#btnAbrirPerfil')?.addEventListener('click', abrirPerfil);
            container?.querySelector('#btnAbrirBarbearia')?.addEventListener('click', abrirBarbearia);
        });
    }

    function abrirPerfil() {
        const usuario = getUsuarioLogado();
        if (!usuario) return;
        mostrarSection('perfil');
        renderizarPerfilInfo(usuario);
    }

    function abrirBarbearia() {
        const usuario = getUsuarioLogado();
        if (!usuario || (!usuario.barbeiro && usuario.funcao !== 'chefe')) {
            exibirNotificacao('Acesso negado.');
            return;
        }
        mostrarSection('barbearia');

        atualizarAbaAgendamentosGeraisVisibilidade();
        atualizarAcessoAbaAgendamentosNormal();
        if (usuarioEhChefeSemBarbeiro(usuario)) {
            document.getElementById('tabBtnAgendamentosGerais')?.click();
        }
    }

    function renderizarPerfilInfo(usuario) {
        const letra = usuario.nome.charAt(0).toUpperCase();
        const avatarLarge = document.getElementById('perfilAvatar');
        if (avatarLarge) avatarLarge.textContent = letra;
        
        const nomeEl = document.getElementById('perfilNome');
        if (nomeEl) nomeEl.textContent = usuario.nome + ' ' + usuario.sobrenome;
        
        const emailEl = document.getElementById('perfilEmail');
        if (emailEl) emailEl.textContent = usuario.email || '-';
        
        const telEl = document.getElementById('perfilTelefone');
        if (telEl) telEl.textContent = usuario.telefone || '-';
        
        let razao = 'Cliente';
        if (usuario.barbeiro) {
            razao = usuario.funcao === 'chefe' ? 'Chefe' : 'Barbeiro';
        }
        const razaoEl = document.getElementById('perfilRazao');
        if (razaoEl) razaoEl.textContent = razao;
    }

    async function carregarMeusAgendamentos() {
        const usuario = getUsuarioLogado();
        const div = document.getElementById('agendamentosConteudo');
        div.innerHTML = '<p style="color:#d0d0d0;text-align:center;">Carregando...</p>';

        try {
            const res = await fetch(`${API_URL}/agendamentos/cliente/${usuario._id}`);
            const agendamentos = await res.json();

            if (!Array.isArray(agendamentos) || agendamentos.length === 0) {
                div.innerHTML = '<p style="color:#d0d0d0;text-align:center;">Nenhum agendamento ainda.</p>';
                return;
            }

            div.innerHTML = '';
            agendamentos.forEach(ag => {
                const dataObj = new Date(ag.data);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                const horaFormatada = String(dataObj.getHours()).padStart(2, '0') + ':' + String(dataObj.getMinutes()).padStart(2, '0');
                
                let statusColor = '#ffd700';
                if (ag.status === 'agendado') statusColor = '#4caf50';
                if (ag.status === 'cancelado') statusColor = '#d32f2f';
                if (ag.status === 'finalizado') statusColor = '#2196f3';

                let servicosText = Array.isArray(ag.servicos) 
                    ? ag.servicos.map(s => s.nome).join(', ')
                    : (ag.servico?.nome || 'N/A');

                const card = document.createElement('div');
                card.style.cssText = 'background:#1a1a1a;border:1px solid #444;padding:1.5rem;border-radius:8px;margin-bottom:1rem;';
                card.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem;">
                        <div>
                            <div style="color:#ffd700;font-weight:600;margin-bottom:0.5rem;">${dataFormatada} às ${horaFormatada}</div>
                            <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Serviços:</b> ${servicosText}</div>
                            <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Barbeiro:</b> ${ag.barbeiro?.nome || ag.preferenciaBarbeiro?.nome || 'A designar'}</div>
                        </div>
                        <div style="color:${statusColor};font-weight:600;font-size:0.9rem;">${ag.status.toUpperCase()}</div>
                    </div>
                    ${ag.status === 'pendente' ? '<button class="btn-cancelar-ag" data-id="' + ag._id + '" style="background:#d32f2f;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Cancelar</button>' : ''}
                `;
                div.appendChild(card);

                // Event listener para cancelar
                card.querySelector('.btn-cancelar-ag')?.addEventListener('click', async () => {
                    const ok = await modalConfirm('Cancelar', 'Deseja cancelar este agendamento?');
                    if (!ok) return;

                    try {
                        const resCancelamento = await fetch(`${API_URL}/agendamentos/${ag._id}/cancelar`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ clienteId: usuario._id })
                        });

                        if (resCancelamento.ok) {
                            exibirNotificacao('Agendamento cancelado com sucesso!');
                            setTimeout(() => {
                                carregarMeusAgendamentos();
                            }, 1000);
                        } else {
                            const errorData = await resCancelamento.json();
                            exibirNotificacao(errorData?.message || 'Erro ao cancelar agendamento.');
                        }
                    } catch (err) {
                        console.error('Erro ao cancelar:', err);
                        exibirNotificacao('Erro de conexão ao cancelar.');
                    }
                });
            });
        } catch (e) {
            div.innerHTML = '<p style="color:#d32f2f;text-align:center;">Erro ao carregar agendamentos.</p>';
        }
    }

    // Event listeners perfil tabs
    document.getElementById('perfilAba')?.addEventListener('click', function() {
        document.querySelectorAll('.perfil-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.perfil-tab-content').forEach(c => c.style.display = 'none');
        this.classList.add('active');
        document.getElementById('perfilConteudo').style.display = 'block';
    });

    document.getElementById('agendamentosAba')?.addEventListener('click', function() {
        document.querySelectorAll('.perfil-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.perfil-tab-content').forEach(c => c.style.display = 'none');
        this.classList.add('active');
        document.getElementById('agendamentosConteudo').style.display = 'block';
        carregarMeusAgendamentos();
    });

    // Editar perfil
    document.getElementById('btnEditarPerfil')?.addEventListener('click', function() {
        const usuario = getUsuarioLogado();
        document.getElementById('editNome').value = usuario.nome;
        document.getElementById('editSobrenome').value = usuario.sobrenome;
        document.getElementById('editTelefone').value = usuario.telefone || '';
        document.getElementById('formEditarPerfil').style.display = 'block';
        this.style.display = 'none';
        document.getElementById('btnLogout').style.display = 'none';
    });

    document.getElementById('btnCancelarEd')?.addEventListener('click', function() {
        document.getElementById('formEditarPerfil').style.display = 'none';
        document.getElementById('btnEditarPerfil').style.display = 'block';
        document.getElementById('btnLogout').style.display = 'block';
    });

    document.getElementById('formEdit')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario = getUsuarioLogado();
        const msg = document.createElement('div');
        msg.style.cssText = 'color:#ffd700;margin-top:1rem;';
        msg.textContent = 'Atualizando...';
        document.getElementById('formEdit').appendChild(msg);

        try {
            const res = await fetch(`${API_URL}/clientes/${usuario._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: document.getElementById('editNome').value.trim(),
                    sobrenome: document.getElementById('editSobrenome').value.trim(),
                    telefone: document.getElementById('editTelefone').value.trim()
                })
            });
            const data = await res.json();
            if (res.ok && data._id) {
                msg.textContent = 'Perfil atualizado!';
                salvarUsuario(data);
                atualizarHeaderPerfil();
                renderizarPerfilInfo(data);
                setTimeout(() => {
                    document.getElementById('formEditarPerfil').style.display = 'none';
                    document.getElementById('btnEditarPerfil').style.display = 'block';
                    document.getElementById('btnLogout').style.display = 'block';
                    msg.remove();
                }, 1500);
            } else {
                msg.textContent = data?.message || 'Erro ao atualizar.';
            }
        } catch {
            msg.textContent = 'Erro de conexão.';
        }
    });

    // ===== SISTEMA DE AGENDAMENTO (4 ETAPAS) =====
    let agendarState = {
        servicos: [],        // Array de IDs dos serviços selecionados
        servicosData: {},    // {servicoId: {nome, duracao, valor}}
        barbeiro: '',        // ID do barbeiro ou vazio para sem preferência
        data: '',            // Data em formato YYYY-MM-DD
        hora: '',            // Hora em formato HH:mm
        barbeiroPedido: null // Barbeiro designado se sem preferência
    };

    function resetAgendamento() {
        agendarState = { servicos: [], servicosData: {}, barbeiro: '', data: '', hora: '', barbeiroPedido: null };

        const durEl = document.getElementById('agendarDuracao');
        if (durEl) durEl.textContent = '-';

        const selectBarb = document.getElementById('agendarBarbeiro');
        if (selectBarb) selectBarb.value = '';

        const dataEl = document.getElementById('agendarData');
        if (dataEl) dataEl.value = '';

        const horariosDiv = document.getElementById('agendarHorarios');
        if (horariosDiv) horariosDiv.innerHTML = '';

        const msg = document.getElementById('agendarMsg');
        if (msg) {
            msg.textContent = '';
            msg.style.color = '#d32f2f';
        }

        // volta pro step 1 e limpa cards selecionados (se já estiverem renderizados)
        document.querySelectorAll('#agendarServicosGrid .servico-card.selected').forEach(card => {
            card.classList.remove('selected');
            card.style.background = '#1a1a1a';
            card.style.color = '#f5f5f5';
        });

        irParaStep(1);
    }

    // Carregar serviços e barbeiros ao abrir agendamento
    async function carregarDadosAgendamento() {
        try {
            const [resServicos, resBarbeiros] = await Promise.all([
                fetch(`${API_URL}/servicos`),
                fetch(`${API_URL}/barbeiros`)
            ]);
            
            const servicos = await resServicos.json();
            const barbeiros = await resBarbeiros.json();

            // Configurar data mínima do input (dia seguinte)
            const hoje = new Date();
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            const minData = amanha.toISOString().split('T')[0];
            document.getElementById('agendarData').min = minData;

            // Renderizar serviços
            const gridServicos = document.getElementById('agendarServicosGrid');
            gridServicos.innerHTML = '';
            servicos.forEach(srv => {
                const card = document.createElement('div');
                card.className = 'servico-card';
                card.style.cssText = 'background:#1a1a1a;border:1px solid #444;padding:1rem;border-radius:8px;cursor:pointer;text-align:center;transition:all 0.2s;';
                card.innerHTML = `
                    <div style="font-weight:600;margin-bottom:0.5rem;">${srv.nome}</div>
                    <div style="font-size:0.85rem;color:#d0d0d0;margin-bottom:0.5rem;">${srv.duracao} min</div>
                    <div style="color:#ffd700;font-weight:600;">R$ ${(srv.valor || 0).toFixed(2)}</div>
                `;
                card.addEventListener('click', () => {
                    card.classList.toggle('selected');
                    if (card.classList.contains('selected')) {
                        card.style.background = '#ffd700';
                        card.style.color = '#000';
                        agendarState.servicos.push(srv._id);
                        agendarState.servicosData[srv._id] = srv;
                    } else {
                        card.style.background = '#1a1a1a';
                        card.style.color = '#f5f5f5';
                        agendarState.servicos = agendarState.servicos.filter(id => id !== srv._id);
                        delete agendarState.servicosData[srv._id];
                    }
                    atualizarDuracaoTotal();
                });
                gridServicos.appendChild(card);
            });

            // Preenchner select de barbeiros
            const selectBarb = document.getElementById('agendarBarbeiro');
            selectBarb.innerHTML = '<option value="">Sem preferência</option>';
            barbeiros.forEach(barb => {
                const opt = document.createElement('option');
                opt.value = barb._id;
                opt.textContent = barb.nome || 'Barbeiro';
                selectBarb.appendChild(opt);
            });
        } catch (e) {
            exibirNotificacao('Erro ao carregar dados.');
        }
    }

    function atualizarDuracaoTotal() {
        let total = 0;
        agendarState.servicos.forEach(id => {
            total += agendarState.servicosData[id]?.duracao || 0;
        });
        document.getElementById('agendarDuracao').textContent = total > 0 ? total + ' min' : '-';
    }

    function irParaStep(step) {
        document.querySelectorAll('.agendar-step-content').forEach(s => s.style.display = 'none');
        document.querySelectorAll('.agendar-step-btn').forEach(b => b.classList.remove('active'));
        
        const stepEl = document.getElementById('agendarStep' + step);
        const btnEl = document.getElementById('agendarStepBtn' + step);
        if (stepEl) stepEl.style.display = 'block';
        if (btnEl) btnEl.classList.add('active');
    }

    // STEP 1 -> STEP 2
    document.getElementById('agendarProx1')?.addEventListener('click', () => {
        if (agendarState.servicos.length === 0) {
            exibirNotificacao('Selecione pelo menos 1 serviço.');
            return;
        }
        irParaStep(2);
    });

    // STEP 2 -> STEP 3
    document.getElementById('agendarProx2')?.addEventListener('click', () => {
        agendarState.barbeiro = document.getElementById('agendarBarbeiro').value;
        irParaStep(3);
        carregarHorarios();
    });

    // STEP 3 -> STEP 4
    document.getElementById('agendarProx3')?.addEventListener('click', () => {
        const data = document.getElementById('agendarData').value;
        const hora = document.getElementById('agendarHorarios').querySelector('button.selected')?.textContent;
        
        if (!data) {
            exibirNotificacao('Selecione uma data.');
            return;
        }
        if (!hora) {
            exibirNotificacao('Selecione um horário.');
            return;
        }
        
        // Validar que a data não é hoje ou antes
        const dataAgendamento = new Date(data + 'T00:00');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (dataAgendamento <= hoje) {
            exibirNotificacao('A data deve ser no mínimo um dia após hoje.');
            return;
        }
        
        agendarState.data = data;
        agendarState.hora = hora;
        irParaStep(4);
        preencherResumo();
    });

    // VOLTAR
    document.getElementById('agendarVoltar2')?.addEventListener('click', () => irParaStep(1));
    document.getElementById('agendarVoltar3')?.addEventListener('click', () => irParaStep(2));
    document.getElementById('agendarVoltar4')?.addEventListener('click', () => irParaStep(3));

    function timeToMinutes(t) {
        if (!t || typeof t !== 'string' || !t.includes(':')) return null;
        const [hh, mm] = t.split(':').map(n => parseInt(n, 10));
        if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
        return (hh * 60) + mm;
    }

    function minutesToTimeStr(mins) {
        const hh = Math.floor(mins / 60);
        const mm = mins % 60;
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }

    function ceilToSlotMinutes(durationMinutes) {
        const dur = Number(durationMinutes) || 0;
        if (dur <= 0) return 15;
        return Math.ceil(dur / 15) * 15;
    }

    function rangesOverlap(aStart, aEnd, bStart, bEnd) {
        return aStart < bEnd && bStart < aEnd;
    }

    function getFuncionamentoParaData(horariosData, dataStr) {
        const padrao = horariosData?.padrao || { abre: '09:00', fecha: '19:00', almocoInicio: '12:00', almocoFim: '13:00' };
        const dias = horariosData?.dias || {};
        const excecoes = Array.isArray(horariosData?.excecoes) ? horariosData.excecoes : [];

        // Exceção tem prioridade
        const exc = excecoes.find(e => e?.data === dataStr);
        if (exc) {
            if (exc.fechado) {
                return { fechado: true };
            }
            const semAlmoco = exc.semAlmoco === true;
            return {
                fechado: false,
                abre: exc.abre || padrao.abre,
                fecha: exc.fecha || padrao.fecha,
                almocoInicio: semAlmoco ? null : (exc.almocoInicio || padrao.almocoInicio),
                almocoFim: semAlmoco ? null : (exc.almocoFim || padrao.almocoFim)
            };
        }

        const d = new Date(dataStr + 'T00:00');
        const weekday = d.getDay(); // 0 domingo .. 6 sábado
        const diaCfg = dias?.[weekday] || dias?.[String(weekday)];

        if (diaCfg?.fechado === true || diaCfg?.aberto === false) {
            return { fechado: true };
        }

        const semAlmoco = diaCfg?.semAlmoco === true;

        return {
            fechado: false,
            abre: diaCfg?.abre || padrao.abre,
            fecha: diaCfg?.fecha || padrao.fecha,
            almocoInicio: semAlmoco ? null : (diaCfg?.almocoInicio || padrao.almocoInicio),
            almocoFim: semAlmoco ? null : (diaCfg?.almocoFim || padrao.almocoFim)
        };
    }

    function gerarSlots15min(func, duracaoMin = 15) {
        const abreMin = timeToMinutes(func.abre);
        const fechaMin = timeToMinutes(func.fecha);
        if (abreMin == null || fechaMin == null || fechaMin <= abreMin) return [];

        const almocoIniMin = timeToMinutes(func.almocoInicio);
        const almocoFimMin = timeToMinutes(func.almocoFim);
        const durSlot = ceilToSlotMinutes(duracaoMin);

        const slots = [];
        for (let m = abreMin; m < fechaMin; m += 15) {
            const end = m + durSlot;
            if (end > fechaMin) continue;

            if (almocoIniMin != null && almocoFimMin != null && almocoFimMin > almocoIniMin) {
                if (rangesOverlap(m, end, almocoIniMin, almocoFimMin)) continue;
            }

            slots.push(minutesToTimeStr(m));
        }
        return slots;
    }

    async function carregarHorarios() {
        const data = document.getElementById('agendarData').value;
        if (!data) return;
        
        // Validar que a data não é hoje ou antes
        const dataAgendamento = new Date(data + 'T00:00');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        if (dataAgendamento <= hoje) {
            document.getElementById('agendarHorarios').innerHTML = '<p style="color:#d32f2f;">A data deve ser no mínimo um dia após hoje.</p>';
            return;
        }

        const horariosDiv = document.getElementById('agendarHorarios');
        horariosDiv.innerHTML = '<p style="color:#d0d0d0;">Carregando horários...</p>';

        try {
            // Buscar configuração de funcionamento
            let horariosCfg = null;
            try {
                const resHor = await fetch(`${API_URL}/horarios`);
                horariosCfg = await resHor.json();
            } catch { }

            const funcionamento = getFuncionamentoParaData(horariosCfg, data);
            if (funcionamento?.fechado) {
                horariosDiv.innerHTML = '<p style="color:#d32f2f;">A barbearia estará fechada nesta data.</p>';
                return;
            }

            // Duração total (para não oferecer horários que estouram o expediente/almoço)
            const duracaoTotal = agendarState.servicos.reduce((acc, id) => acc + (agendarState.servicosData[id]?.duracao || 0), 0) || 15;

            // Gerar slots de 15 em 15 dentro do funcionamento
            const horarios = gerarSlots15min(funcionamento, duracaoTotal);
            if (!horarios.length) {
                horariosDiv.innerHTML = '<p style="color:#d32f2f;">Sem horários configurados para esta data.</p>';
                return;
            }

            // Buscar disponibilidade
            let ocupados = [];
            let disponiveis = null;
            if (agendarState.barbeiro) {
                // Se tem barbeiro específico, busca ocupados daquele barbeiro
                try {
                    const res = await fetch(`${API_URL}/agendamentos/ocupados/${agendarState.barbeiro}?data=${data}`);
                    const obj = await res.json();
                    ocupados = obj.horarios || [];
                } catch { }
            } else {
                // Se não tem preferência, backend devolve slots onde existe ALGUM barbeiro livre
                try {
                    const res = await fetch(`${API_URL}/agendamentos/disponiveis?data=${data}&duracao=${duracaoTotal}`);
                    const obj = await res.json();
                    disponiveis = Array.isArray(obj.disponiveis) ? obj.disponiveis : [];
                } catch { }
            }

            horariosDiv.innerHTML = '';
            horariosDiv.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:0.5rem;margin-top:0.5rem;';
            
            horarios.forEach(hor => {
                const btn = document.createElement('button');
                btn.textContent = hor;
                btn.type = 'button';
                btn.style.cssText = 'padding:0.6rem;border:1px solid #444;background:#222;color:#f5f5f5;cursor:pointer;border-radius:6px;font-weight:500;transition:all 0.2s;';

                const estaOcupado = agendarState.barbeiro
                    ? ocupados.includes(hor)
                    : (Array.isArray(disponiveis) ? !disponiveis.includes(hor) : false);

                if (estaOcupado) {
                    btn.disabled = true;
                    btn.style.opacity = '0.4';
                    btn.style.cursor = 'not-allowed';
                } else {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Remover seleção anterior
                        horariosDiv.querySelectorAll('button:not([disabled])').forEach(b => {
                            b.classList.remove('selected');
                            b.style.background = '#222';
                            b.style.color = '#f5f5f5';
                            b.style.borderColor = '#444';
                        });
                        // Selecionar este
                        btn.classList.add('selected');
                        btn.style.background = '#ffd700';
                        btn.style.color = '#000';
                        btn.style.borderColor = '#ffd700';
                    });
                }
                horariosDiv.appendChild(btn);
            });

            // Se sem preferência e não sobrou nenhum slot, avisa
            if (!agendarState.barbeiro && Array.isArray(disponiveis) && disponiveis.length === 0) {
                horariosDiv.innerHTML = '<p style="color:#d32f2f;">Nenhum horário disponível nesta data.</p>';
            }
        } catch (e) {
            horariosDiv.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar horários.</p>';
        }
    }

    // Evento para recarregar horários quando mudar data/barbeiro
    document.getElementById('agendarData')?.addEventListener('change', carregarHorarios);
    document.getElementById('agendarBarbeiro')?.addEventListener('change', carregarHorarios);

    function preencherResumo() {
        // Serviços
        const resumoServ = document.getElementById('agendarResumoServicos');
        resumoServ.innerHTML = '';
        let totalDuracao = 0;
        let totalValor = 0;
        
        agendarState.servicos.forEach(id => {
            const srv = agendarState.servicosData[id];
            const div = document.createElement('div');
            div.textContent = `${srv.nome} (${srv.duracao}min) - R$ ${(srv.valor || 0).toFixed(2)}`;
            resumoServ.appendChild(div);
            totalDuracao += srv.duracao;
            totalValor += srv.valor || 0;
        });

        // Data/Hora
        const data = new Date(agendarState.data + 'T00:00');
        const dataFormatada = data.toLocaleDateString('pt-BR');
        document.getElementById('agendarResumoData').textContent = `${dataFormatada} às ${agendarState.hora}`;

        // Barbeiro
        const barbNome = agendarState.barbeiro 
            ? document.getElementById('agendarBarbeiro').selectedOptions[0].textContent 
            : 'Sem preferência';
        document.getElementById('agendarResumoBarbeiro').textContent = barbNome;

        // Duração e Valor
        document.getElementById('agendarResumoDuracao').textContent = totalDuracao + ' min';
        document.getElementById('agendarResumoValor').textContent = 'R$ ' + totalValor.toFixed(2);
    }

    // CONFIRMAR AGENDAMENTO
    document.getElementById('agendarConfirmar')?.addEventListener('click', async () => {
        const btn = document.getElementById('agendarConfirmar');
        
        // Prevenir múltiplos cliques
        if (btn.disabled) return;
        
        btn.disabled = true;
        btn.textContent = 'Confirmando...';

        try {
            const usuario = getUsuarioLogado();
            const res = await fetch(`${API_URL}/agendamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clienteId: usuario._id,
                    servicos: agendarState.servicos,
                    barbeiro: agendarState.barbeiro || null,
                    data: agendarState.data,
                    hora: agendarState.hora,
                    status: 'pendente'
                })
            });

            if (res.ok) {
                const msg = document.getElementById('agendarMsg');
                msg.style.color = '#4caf50';
                msg.textContent = '✓ Agendamento realizado com sucesso!';
                
                setTimeout(() => {
                    agendarState = { servicos: [], servicosData: {}, barbeiro: '', data: '', hora: '', barbeiroPedido: null };
                    document.getElementById('formCadastro')?.reset();
                    document.getElementById('agendarData').value = '';
                    irParaStep(1);
                    mostrarSection('perfil');
                    renderizarPerfilInfo(usuario);
                }, 2000);
            } else {
                const data = await res.json();
                exibirNotificacao(data?.message || 'Erro ao agendar.');
                btn.disabled = false;
                btn.textContent = 'Confirmar Agendamento';
            }
        } catch (err) {
            exibirNotificacao('Erro de conexão ao agendar.');
            btn.disabled = false;
            btn.textContent = 'Confirmar Agendamento';
        }
    });

    // Inicializar agendamento quando abrir section
    const observer = new MutationObserver(() => {
        if (document.getElementById('agendar').style.display !== 'none') {
            resetAgendamento();
            carregarDadosAgendamento();
        }
    });
    observer.observe(document.getElementById('agendar'), { attributes: true, attributeFilter: ['style'] });

    document.getElementById('btnLogout')?.addEventListener('click', async () => {
        const ok = await modalConfirm('Sair', 'Tem certeza?');
        if (!ok) return;
        localStorage.removeItem('usuarioLogado');
        window.user = null;
        usuarioLogado = null;
        exibirNotificacao('Saiu da conta!');
        // Reload sem chamar atualizarHeaderPerfil que pode ter problemas
        setTimeout(() => {
            location.reload();
        }, 1000);
   });

    // ===== PAINEL BARBEARIA =====
    // Event listeners para abas principais (Agendamentos, Serviços, Barbeiros, Geral)
    document.querySelectorAll('.barbearia-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            document.querySelectorAll('.barbearia-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.barbearia-tab-content').forEach(c => c.style.display = 'none');
            this.classList.add('active');
            const tabContent = document.getElementById('tab-' + tabName);
            if (tabContent) {
                tabContent.style.display = 'block';
                // Carregar dados quando abrir aba
                if (tabName === 'agendamentos') carregarAgendamentosAdmin();
                if (tabName === 'agendamentos-gerais') carregarAgendamentosGeraisAdmin();
                if (tabName === 'servicos') carregarServicosAdmin();
                if (tabName === 'barbeiros') carregarBarbeirosAdmin();
                if (tabName === 'geral') carregarGeralAdmin();
            }
        });
    });

    // Event listeners para sub-abas dentro de cada aba
    document.querySelectorAll('.barbearia-subtab').forEach(subtab => {
        subtab.addEventListener('click', function() {
            const subtabName = this.getAttribute('data-subtab');
            const parent = this.closest('.barbearia-subtabs');
            const container = parent.parentElement;
            
            container.querySelectorAll('.barbearia-subtab').forEach(t => t.classList.remove('active'));
            container.querySelectorAll('.barbearia-subtab-content').forEach(c => c.style.display = 'none');
            
            this.classList.add('active');
            const subtabContent = document.getElementById('subtab-' + subtabName);
            if (subtabContent) {
                subtabContent.style.display = 'block';
                // Carregar dados quando abrir sub-aba
                if (subtabName === 'pendentes') carregarAgendamentosAdminPendentes();
                if (subtabName === 'aceitos') carregarAgendamentosAdminAceitos();
                if (subtabName === 'historico') carregarAgendamentosAdminHistorico();
                if (subtabName === 'gerais-pendentes') carregarAgendamentosGeraisPendentes();
                if (subtabName === 'gerais-aceitos') carregarAgendamentosGeraisAceitos();
                if (subtabName === 'gerais-historico') carregarAgendamentosGeraisHistorico();
                if (subtabName === 'contato') carregarContatoAdmin();
                if (subtabName === 'horarios') carregarHorariosAdmin();
            }
        });
    });

    function atualizarAbaAgendamentosGeraisVisibilidade() {
        const usuario = getUsuarioLogado();
        const btn = document.getElementById('tabBtnAgendamentosGerais');
        if (!btn) return;
        btn.style.display = usuario?.funcao === 'chefe' ? '' : 'none';
    }

    function usuarioEhChefeSemBarbeiro(usuario) {
        return !!usuario && usuario.funcao === 'chefe' && !usuario.barbeiro;
    }

    function atualizarAcessoAbaAgendamentosNormal() {
        const usuario = getUsuarioLogado();
        const btnAg = document.getElementById('tabBtnAgendamentos');
        if (!btnAg) return;

        const chefAdmin = usuarioEhChefeSemBarbeiro(usuario);
        btnAg.style.display = chefAdmin ? 'none' : '';

        if (!chefAdmin) return;

        // Se estava na aba "Agendamentos" (normal), força para "Agendamentos Gerais"
        const tabAg = document.getElementById('tab-agendamentos');
        const btnGerais = document.getElementById('tabBtnAgendamentosGerais');
        const tabGerais = document.getElementById('tab-agendamentos-gerais');

        const agAtivo = btnAg.classList.contains('active') || (tabAg && tabAg.style.display !== 'none');
        if (!agAtivo) return;

        if (btnGerais && btnGerais.style.display !== 'none' && tabGerais) {
            btnGerais.click();
        } else {
            // fallback: abre Serviços
            document.querySelector('.barbearia-tab[data-tab="servicos"]')?.click();
        }
    }

    // ===== PAINEL AGENDAMENTOS =====
    async function carregarAgendamentosAdmin() {
        carregarAgendamentosAdminPendentes();
    }

    async function carregarAgendamentosAdminPendentes() {
        const usuario = getUsuarioLogado();
        const div = document.getElementById('subtab-pendentes');
        div.innerHTML = '<p style="color:#d0d0d0;">Carregando...</p>';

        try {
            const res = await fetch(`${API_URL}/agendamentos/status/pendente`);
            const agendamentos = await res.json();

            if (!Array.isArray(agendamentos) || agendamentos.length === 0) {
                div.innerHTML = '<p style="color:#d0d0d0;">Nenhum agendamento pendente.</p>';
                return;
            }

            div.innerHTML = '';
            agendamentos.forEach(ag => {
                const dataObj = new Date(ag.data);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                const horaFormatada = String(dataObj.getHours()).padStart(2, '0') + ':' + String(dataObj.getMinutes()).padStart(2, '0');
                
                let servicosText = Array.isArray(ag.servicos) 
                    ? ag.servicos.map(s => s.nome).join(', ')
                    : (ag.servico?.nome || 'N/A');

                const agora = new Date();
                const liberado = ag.liberadoAte && (new Date(ag.liberadoAte) > agora);
                const preferId = ag.preferenciaBarbeiro?._id || ag.preferenciaBarbeiro;
                const preferOk = preferId && String(preferId) === String(usuario._id);
                const semPref = !preferId;
                const podeAceitar = semPref || liberado || preferOk;
                const podeRecusar = preferOk; // regra atual: só preferencial recusa

                const card = document.createElement('div');
                card.style.cssText = 'background:#1a1a1a;border:1px solid #ffd700;padding:1.5rem;border-radius:8px;margin-bottom:1rem;';
                card.innerHTML = `
                    <div style="margin-bottom:1rem;">
                        <div style="color:#ffd700;font-weight:600;margin-bottom:0.5rem;">${ag.cliente?.nome} ${ag.cliente?.sobrenome}</div>
                        <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Serviços:</b> ${servicosText}</div>
                        <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Data/Hora:</b> ${dataFormatada} às ${horaFormatada}</div>
                        <div style="color:#d0d0d0;"><b>Preferência:</b> ${ag.preferenciaBarbeiro?.nome || 'Sem preferência'}</div>
                    </div>
                    ${podeAceitar ? '<button class="btn-aceitar-ag" data-id="' + ag._id + '" style="background:#4caf50;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;margin-right:0.5rem;">Aceitar</button>' : ''}
                    ${podeRecusar ? '<button class="btn-recusar-ag" data-id="' + ag._id + '" style="background:#d32f2f;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Recusar</button>' : ''}
                `;
                div.appendChild(card);

                // Aceitar
                card.querySelector('.btn-aceitar-ag')?.addEventListener('click', async () => {
                    try {
                        const resAceitar = await fetch(`${API_URL}/agendamentos/${ag._id}/aceitar`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ barbeiroId: usuario._id })
                        });

                        if (resAceitar.ok) {
                            exibirNotificacao('Agendamento aceito!');
                            carregarAgendamentosAdminPendentes();
                            carregarAgendamentosAdminAceitos();
                        } else {
                            exibirNotificacao('Erro ao aceitar.');
                        }
                    } catch {
                        exibirNotificacao('Erro de conexão.');
                    }
                });

                // Recusar
                card.querySelector('.btn-recusar-ag')?.addEventListener('click', async () => {
                    try {
                        const resRecusar = await fetch(`${API_URL}/agendamentos/${ag._id}/recusar`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ barbeiroId: usuario._id })
                        });

                        if (resRecusar.ok) {
                            exibirNotificacao('Agendamento recusado e cancelado.');
                            carregarAgendamentosAdminPendentes();
                            carregarAgendamentosAdminHistorico();
                        } else {
                            exibirNotificacao('Erro ao recusar.');
                        }
                    } catch {
                        exibirNotificacao('Erro de conexão.');
                    }
                });
            });
        } catch (e) {
            div.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar.</p>';
        }
    }

    // ===== AGENDAMENTOS GERAIS (CHEFE) =====
    const filtrosAgendamentosGerais = { pendentes: '', aceitos: '', historico: '' };
    const cacheAgendamentosGerais = { pendentes: [], aceitos: [], historico: [] };

    function normalizarTextoBusca(v) {
        return String(v || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    function textoBuscaAgendamento(ag) {
        const dataObj = ag?.data ? new Date(ag.data) : null;
        const dataTxt = dataObj && !isNaN(dataObj.getTime()) ? dataObj.toLocaleString('pt-BR') : '';

        const nomeCliente = `${ag?.cliente?.nome || ''} ${ag?.cliente?.sobrenome || ''}`.trim();
        const nomePreferencia = `${ag?.preferenciaBarbeiro?.nome || ''} ${ag?.preferenciaBarbeiro?.sobrenome || ''}`.trim();
        const nomeBarbeiro = `${ag?.barbeiro?.nome || ''} ${ag?.barbeiro?.sobrenome || ''}`.trim();

        const servicosText = Array.isArray(ag?.servicos)
            ? ag.servicos.map(s => s?.nome).filter(Boolean).join(' ')
            : (ag?.servico?.nome || '');

        return [
            nomeCliente,
            servicosText,
            dataTxt,
            ag?.status || '',
            nomePreferencia,
            nomeBarbeiro
        ].join(' | ');
    }

    function filtrarListaAgendamentosGerais(lista, termo) {
        const t = normalizarTextoBusca(termo).trim();
        if (!t) return lista;
        return (Array.isArray(lista) ? lista : []).filter(ag => {
            const hay = normalizarTextoBusca(textoBuscaAgendamento(ag));
            return hay.includes(t);
        });
    }

    function criarInputFiltroGerais({ placeholder, value, onInput }) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'margin:0 0 1rem 0;display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = value || '';
        input.placeholder = placeholder;
        input.style.cssText = 'flex:1;min-width:220px;padding:.6rem .8rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:8px;';
        input.addEventListener('input', () => onInput?.(input.value));

        wrap.appendChild(input);
        return wrap;
    }

    async function carregarAgendamentosGeraisAdmin() {
        const usuario = getUsuarioLogado();
        const div = document.getElementById('tab-agendamentos-gerais');
        if (!usuario || usuario.funcao !== 'chefe') {
            if (div) div.innerHTML = '<p style="color:#d32f2f;">Acesso restrito a chefes.</p>';
            return;
        }
        carregarAgendamentosGeraisPendentes();
    }

    function renderAgendamentosGeraisPendentes() {
        const usuario = getUsuarioLogado();
        const div = document.getElementById('subtab-gerais-pendentes');
        if (!div) return;

        div.innerHTML = '';
        div.appendChild(criarInputFiltroGerais({
            placeholder: 'Buscar por cliente, serviço, data/hora ou preferência...',
            value: filtrosAgendamentosGerais.pendentes,
            onInput: (v) => {
                filtrosAgendamentosGerais.pendentes = v;
                renderAgendamentosGeraisPendentes();
            }
        }));

        const listaWrap = document.createElement('div');
        div.appendChild(listaWrap);

        const lista = filtrarListaAgendamentosGerais(cacheAgendamentosGerais.pendentes, filtrosAgendamentosGerais.pendentes);
        if (!Array.isArray(lista) || lista.length === 0) {
            listaWrap.innerHTML = '<p style="color:#d0d0d0;">Nenhum resultado.</p>';
            return;
        }

        lista.forEach(ag => {
            const dataObj = new Date(ag.data);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR');
            const horaFormatada = String(dataObj.getHours()).padStart(2, '0') + ':' + String(dataObj.getMinutes()).padStart(2, '0');

            const servicosText = Array.isArray(ag.servicos)
                ? ag.servicos.map(s => s.nome).join(', ')
                : (ag.servico?.nome || 'N/A');

            const card = document.createElement('div');
            card.style.cssText = 'background:#1a1a1a;border:1px solid #ffd700;padding:1.5rem;border-radius:8px;margin-bottom:1rem;';
            card.innerHTML = `
                <div style="margin-bottom:1rem;">
                    <div style="color:#ffd700;font-weight:600;margin-bottom:0.5rem;">${ag.cliente?.nome} ${ag.cliente?.sobrenome}</div>
                    <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Serviços:</b> ${servicosText}</div>
                    <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Data/Hora:</b> ${dataFormatada} às ${horaFormatada}</div>
                    <div style="color:#d0d0d0;"><b>Preferência:</b> ${ag.preferenciaBarbeiro?.nome || 'Sem preferência'}</div>
                </div>
                <button class="btn-recusa-geral" data-id="${ag._id}" style="background:#d32f2f;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Recusar (Cancelar)</button>
            `;
            listaWrap.appendChild(card);

            card.querySelector('.btn-recusa-geral')?.addEventListener('click', async () => {
                const ok = await modalConfirm('Recusar', 'Deseja recusar/cancelar este agendamento?');
                if (!ok) return;
                try {
                    const resRecusar = await fetch(`${API_URL}/agendamentos/${ag._id}/recusar`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ barbeiroId: usuario._id })
                    });
                    if (resRecusar.ok) {
                        exibirNotificacao('Agendamento recusado/cancelado.');
                        carregarAgendamentosGeraisPendentes();
                        carregarAgendamentosGeraisHistorico();
                    } else {
                        exibirNotificacao('Erro ao recusar.');
                    }
                } catch {
                    exibirNotificacao('Erro de conexão.');
                }
            });
        });
    }

    async function carregarAgendamentosGeraisPendentes() {
        const div = document.getElementById('subtab-gerais-pendentes');
        div.innerHTML = '<p style="color:#d0d0d0;">Carregando...</p>';

        try {
            const res = await fetch(`${API_URL}/agendamentos/status/pendente`);
            const agendamentos = await res.json();

            cacheAgendamentosGerais.pendentes = Array.isArray(agendamentos) ? agendamentos : [];
            renderAgendamentosGeraisPendentes();
        } catch {
            div.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar.</p>';
        }
    }

    function renderAgendamentosGeraisAceitos() {
        const usuario = getUsuarioLogado();
        const div = document.getElementById('subtab-gerais-aceitos');
        if (!div) return;

        div.innerHTML = '';
        div.appendChild(criarInputFiltroGerais({
            placeholder: 'Buscar por cliente, serviço, data/hora ou barbeiro responsável...',
            value: filtrosAgendamentosGerais.aceitos,
            onInput: (v) => {
                filtrosAgendamentosGerais.aceitos = v;
                renderAgendamentosGeraisAceitos();
            }
        }));

        const listaWrap = document.createElement('div');
        div.appendChild(listaWrap);

        const lista = filtrarListaAgendamentosGerais(cacheAgendamentosGerais.aceitos, filtrosAgendamentosGerais.aceitos);
        if (!Array.isArray(lista) || lista.length === 0) {
            listaWrap.innerHTML = '<p style="color:#d0d0d0;">Nenhum resultado.</p>';
            return;
        }

        lista.forEach(ag => {
            const dataObj = new Date(ag.data);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR');
            const horaFormatada = String(dataObj.getHours()).padStart(2, '0') + ':' + String(dataObj.getMinutes()).padStart(2, '0');

            const servicosText = Array.isArray(ag.servicos)
                ? ag.servicos.map(s => s.nome).join(', ')
                : (ag.servico?.nome || 'N/A');

            const barbNome = ag.barbeiro ? `${ag.barbeiro.nome || ''} ${ag.barbeiro.sobrenome || ''}`.trim() : '-';

            const card = document.createElement('div');
            card.style.cssText = 'background:#1a1a1a;border:1px solid #4caf50;padding:1.5rem;border-radius:8px;margin-bottom:1rem;';
            card.innerHTML = `
                <div style="margin-bottom:1rem;">
                    <div style="color:#ffd700;font-weight:600;margin-bottom:0.5rem;">${ag.cliente?.nome} ${ag.cliente?.sobrenome}</div>
                    <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Serviços:</b> ${servicosText}</div>
                    <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Data/Hora:</b> ${dataFormatada} às ${horaFormatada}</div>
                    <div style="color:#d0d0d0;"><b>Barbeiro responsável:</b> ${barbNome}</div>
                </div>
                <button class="btn-cancelar-geral" data-id="${ag._id}" style="background:#d32f2f;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Cancelar</button>
            `;
            listaWrap.appendChild(card);

            card.querySelector('.btn-cancelar-geral')?.addEventListener('click', async () => {
                const ok = await modalConfirm('Cancelar', 'Tem certeza que deseja cancelar este agendamento?');
                if (!ok) return;
                try {
                    const resCancelar = await fetch(`${API_URL}/agendamentos/${ag._id}/cancelar`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ barbeiroId: usuario._id })
                    });
                    if (resCancelar.ok) {
                        exibirNotificacao('Agendamento cancelado.');
                        carregarAgendamentosGeraisAceitos();
                        carregarAgendamentosGeraisHistorico();
                    } else {
                        exibirNotificacao('Erro ao cancelar.');
                    }
                } catch {
                    exibirNotificacao('Erro de conexão.');
                }
            });
        });
    }

    async function carregarAgendamentosGeraisAceitos() {
        const div = document.getElementById('subtab-gerais-aceitos');
        div.innerHTML = '<p style="color:#d0d0d0;">Carregando...</p>';

        try {
            const res = await fetch(`${API_URL}/agendamentos/status/agendado`);
            const agendamentos = await res.json();

            cacheAgendamentosGerais.aceitos = Array.isArray(agendamentos) ? agendamentos : [];
            renderAgendamentosGeraisAceitos();
        } catch {
            div.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar.</p>';
        }
    }

    function renderAgendamentosGeraisHistorico() {
        const div = document.getElementById('subtab-gerais-historico');
        if (!div) return;

        div.innerHTML = '';
        div.appendChild(criarInputFiltroGerais({
            placeholder: 'Buscar por cliente, serviço, data/hora, barbeiro ou status...',
            value: filtrosAgendamentosGerais.historico,
            onInput: (v) => {
                filtrosAgendamentosGerais.historico = v;
                renderAgendamentosGeraisHistorico();
            }
        }));

        const listaWrap = document.createElement('div');
        div.appendChild(listaWrap);

        const lista = filtrarListaAgendamentosGerais(cacheAgendamentosGerais.historico, filtrosAgendamentosGerais.historico);
        if (!Array.isArray(lista) || lista.length === 0) {
            listaWrap.innerHTML = '<p style="color:#d0d0d0;">Nenhum resultado.</p>';
            return;
        }

        lista.forEach(ag => {
            const dataObj = new Date(ag.data);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR');
            const horaFormatada = String(dataObj.getHours()).padStart(2, '0') + ':' + String(dataObj.getMinutes()).padStart(2, '0');

            const servicosText = Array.isArray(ag.servicos)
                ? ag.servicos.map(s => s.nome).join(', ')
                : (ag.servico?.nome || 'N/A');

            const statusColor = ag.status === 'finalizado' ? '#2196f3' : '#d32f2f';
            const barbNome = ag.barbeiro ? `${ag.barbeiro.nome || ''} ${ag.barbeiro.sobrenome || ''}`.trim() : '-';

            const card = document.createElement('div');
            card.style.cssText = 'background:#1a1a1a;border:1px solid #444;padding:1.5rem;border-radius:8px;margin-bottom:1rem;';
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:start;gap:1rem;">
                    <div>
                        <div style="color:#ffd700;font-weight:600;margin-bottom:0.5rem;">${ag.cliente?.nome} ${ag.cliente?.sobrenome}</div>
                        <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Serviços:</b> ${servicosText}</div>
                        <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Data/Hora:</b> ${dataFormatada} às ${horaFormatada}</div>
                        <div style="color:#d0d0d0;"><b>Barbeiro:</b> ${barbNome}</div>
                    </div>
                    <div style="color:${statusColor};font-weight:600;font-size:0.9rem;">${String(ag.status || '').toUpperCase()}</div>
                </div>
            `;
            listaWrap.appendChild(card);
        });
    }

    async function carregarAgendamentosGeraisHistorico() {
        const div = document.getElementById('subtab-gerais-historico');
        div.innerHTML = '<p style="color:#d0d0d0;">Carregando...</p>';

        try {
            const [resFinalizados, resCancelados] = await Promise.all([
                fetch(`${API_URL}/agendamentos/status/finalizado`),
                fetch(`${API_URL}/agendamentos/status/cancelado`)
            ]);

            const finalizados = await resFinalizados.json();
            const cancelados = await resCancelados.json();
            const todos = [...(Array.isArray(finalizados) ? finalizados : []), ...(Array.isArray(cancelados) ? cancelados : [])];

            cacheAgendamentosGerais.historico = todos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
            renderAgendamentosGeraisHistorico();
        } catch {
            div.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar.</p>';
        }
    }

    async function carregarAgendamentosAdminAceitos() {
        const usuario = getUsuarioLogado();
        const div = document.getElementById('subtab-aceitos');
        div.innerHTML = '<p style="color:#d0d0d0;">Carregando...</p>';

        try {
            const res = await fetch(`${API_URL}/agendamentos/status/agendado`);
            const agendamentos = await res.json();
            const meus = agendamentos.filter(ag => String(ag.barbeiro?._id) === String(usuario._id));

            if (meus.length === 0) {
                div.innerHTML = '<p style="color:#d0d0d0;">Nenhum agendamento aceito.</p>';
                return;
            }

            div.innerHTML = '';
            meus.forEach(ag => {
                const dataObj = new Date(ag.data);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                const horaFormatada = String(dataObj.getHours()).padStart(2, '0') + ':' + String(dataObj.getMinutes()).padStart(2, '0');
                
                let servicosText = Array.isArray(ag.servicos) 
                    ? ag.servicos.map(s => s.nome).join(', ')
                    : (ag.servico?.nome || 'N/A');

                let duracaoTotal = 0;
                let valorTotal = 0;
                if (Array.isArray(ag.servicos)) {
                    ag.servicos.forEach(s => {
                        duracaoTotal += s.duracao || 0;
                        valorTotal += s.valor || 0;
                    });
                }

                const dataObj2 = new Date(ag.data);
                const tempoRestante = (duracaoTotal * 60 * 1000); // em ms
                const dataFinalizacao = new Date(dataObj2.getTime() + tempoRestante);
                const agora = new Date();
                const minutosRestantes = Math.floor((dataFinalizacao - agora) / (60 * 1000));
                const podeFinalizarEm = dataObj2.getTime() + (duracaoTotal - 10) * 60 * 1000;
                const podeFinalizar = agora >= new Date(podeFinalizarEm);

                const card = document.createElement('div');
                card.style.cssText = 'background:#1a1a1a;border:1px solid #4caf50;padding:1.5rem;border-radius:8px;margin-bottom:1rem;';
                card.innerHTML = `
                    <div style="margin-bottom:1rem;">
                        <div style="color:#ffd700;font-weight:600;margin-bottom:0.5rem;">${ag.cliente?.nome} ${ag.cliente?.sobrenome}</div>
                        <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Telefone:</b> ${ag.cliente?.telefone || '-'}</div>
                        <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Serviços:</b> ${servicosText}</div>
                        <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Data/Hora:</b> ${dataFormatada} às ${horaFormatada}</div>
                        <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Duração:</b> ${duracaoTotal} min</div>
                        <div style="color:#ffd700;font-weight:600;"><b>Valor:</b> R$ ${valorTotal.toFixed(2)}</div>
                    </div>
                    <button class="btn-cancelar-ace" data-id="${ag._id}" style="background:#d32f2f;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;margin-right:0.5rem;">Cancelar</button>
                    ${podeFinalizar ? '<button class="btn-finalizar-ag" data-id="' + ag._id + '" style="background:#2196f3;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Finalizar</button>' : '<span style="color:#999;font-size:0.9rem;">Disponível para finalizar em 10 min antes do horário</span>'}
                `;
                div.appendChild(card);

                // Cancelar
                card.querySelector('.btn-cancelar-ace')?.addEventListener('click', async () => {
                    const ok = await modalConfirm('Cancelar', 'Tem certeza que deseja cancelar este agendamento?');
                    if (!ok) return;

                    try {
                        const resCancelar = await fetch(`${API_URL}/agendamentos/${ag._id}/cancelar`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ barbeiroId: usuario._id })
                        });

                        if (resCancelar.ok) {
                            exibirNotificacao('Agendamento cancelado.');
                            carregarAgendamentosAdminAceitos();
                            carregarAgendamentosAdminHistorico();
                        } else {
                            exibirNotificacao('Erro ao cancelar.');
                        }
                    } catch {
                        exibirNotificacao('Erro de conexão.');
                    }
                });

                // Finalizar
                card.querySelector('.btn-finalizar-ag')?.addEventListener('click', async () => {
                    try {
                        const resFinalizar = await fetch(`${API_URL}/agendamentos/${ag._id}/finalizar`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ barbeiroId: usuario._id })
                        });

                        if (resFinalizar.ok) {
                            exibirNotificacao('Serviço finalizado!');
                            carregarAgendamentosAdminAceitos();
                            carregarAgendamentosAdminHistorico();
                        } else {
                            exibirNotificacao('Erro ao finalizar.');
                        }
                    } catch {
                        exibirNotificacao('Erro de conexão.');
                    }
                });
            });
        } catch (e) {
            div.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar.</p>';
        }
    }

    async function carregarAgendamentosAdminHistorico() {
        const usuario = getUsuarioLogado();
        const div = document.getElementById('subtab-historico');
        
        // Adicionar input de busca se não houver
        if (!div.querySelector('.historico-search')) {
            const searchDiv = document.createElement('div');
            searchDiv.className = 'historico-search';
            searchDiv.style.cssText = 'margin-bottom:1.5rem;';
            searchDiv.innerHTML = `
                <input type="text" id="historicoSearch" placeholder="Pesquisar por nome do barbeiro..." style="width:100%;padding:0.5rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:6px;">
            `;
            div.innerHTML = '';
            div.appendChild(searchDiv);
            document.getElementById('historicoSearch')?.addEventListener('input', carregarAgendamentosAdminHistorico);
        }

        const searchTerm = document.getElementById('historicoSearch')?.value || '';
        
        div.innerHTML = '<p style="color:#d0d0d0;">Carregando...</p>';

        try {
            const [resFinalizados, resCancelados] = await Promise.all([
                fetch(`${API_URL}/agendamentos/status/finalizado`),
                fetch(`${API_URL}/agendamentos/status/cancelado`)
            ]);

            const finalizados = await resFinalizados.json();
            const cancelados = await resCancelados.json();
            const todos = [...finalizados, ...cancelados];
            
            let filtrados = todos.filter(ag => String(ag.barbeiro?._id) === String(usuario._id));
            
            if (searchTerm) {
                filtrados = filtrados.filter(ag => 
                    ag.barbeiro?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            if (filtrados.length === 0) {
                div.innerHTML = '<p style="color:#d0d0d0;">Nenhum registro no histórico.</p>';
                return;
            }

            div.innerHTML = '';
            const searchDiv = document.createElement('div');
            searchDiv.className = 'historico-search';
            searchDiv.style.cssText = 'margin-bottom:1.5rem;';
            searchDiv.innerHTML = `
                <input type="text" id="historicoSearch" placeholder="Pesquisar por nome do barbeiro..." style="width:100%;padding:0.5rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:6px;" value="${searchTerm}">
            `;
            div.appendChild(searchDiv);
            document.getElementById('historicoSearch')?.addEventListener('input', carregarAgendamentosAdminHistorico);

            filtrados.forEach(ag => {
                const dataObj = new Date(ag.data);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                const horaFormatada = String(dataObj.getHours()).padStart(2, '0') + ':' + String(dataObj.getMinutes()).padStart(2, '0');
                
                let servicosText = Array.isArray(ag.servicos) 
                    ? ag.servicos.map(s => s.nome).join(', ')
                    : (ag.servico?.nome || 'N/A');

                const statusColor = ag.status === 'finalizado' ? '#2196f3' : '#d32f2f';

                const card = document.createElement('div');
                card.style.cssText = 'background:#1a1a1a;border:1px solid #444;padding:1.5rem;border-radius:8px;margin-bottom:1rem;';
                card.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:start;">
                        <div>
                            <div style="color:#ffd700;font-weight:600;margin-bottom:0.5rem;">${ag.cliente?.nome} ${ag.cliente?.sobrenome}</div>
                            <div style="color:#d0d0d0;margin-bottom:0.5rem;"><b>Serviços:</b> ${servicosText}</div>
                            <div style="color:#d0d0d0;"><b>Data/Hora:</b> ${dataFormatada} às ${horaFormatada}</div>
                        </div>
                        <div style="color:${statusColor};font-weight:600;font-size:0.9rem;">${ag.status.toUpperCase()}</div>
                    </div>
                `;
                div.appendChild(card);
            });
        } catch (e) {
            div.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar.</p>';
        }
    }

    // ===== PAINEL SERVIÇOS =====
    async function carregarServicosAdmin() {
        const usuario = getUsuarioLogado();
        if (usuario.funcao !== 'chefe') {
            document.getElementById('tab-servicos').innerHTML = '<p style="color:#d32f2f;">Acesso restrito a chefes.</p>';
            return;
        }

        const div = document.getElementById('tab-servicos');
        div.innerHTML = '<p style="color:#d0d0d0;">Carregando...</p>';

        try {
            const res = await fetch(`${API_URL}/servicos`);
            const servicos = await res.json();

            div.innerHTML = `
                <div style="margin-bottom:2rem;">
                    <button id="btnNovoServico" style="background:#ffd700;border:none;color:#000;padding:0.7rem 1.5rem;border-radius:6px;cursor:pointer;font-weight:600;">+ Novo Serviço</button>
                </div>
                <div id="listaServicos"></div>
            `;

            const listaDiv = document.getElementById('listaServicos');
            
            if (!Array.isArray(servicos) || servicos.length === 0) {
                listaDiv.innerHTML = '<p style="color:#d0d0d0;">Nenhum serviço cadastrado.</p>';
            } else {
                servicos.forEach(srv => {
                    const card = document.createElement('div');
                    card.style.cssText = 'background:#1a1a1a;border:1px solid #444;padding:1.5rem;border-radius:8px;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;';
                    card.innerHTML = `
                        <div>
                            <div style="color:#ffd700;font-weight:600;">${srv.nome}</div>
                            <div style="color:#d0d0d0;"><b>Duração:</b> ${srv.duracao} min | <b>Valor:</b> R$ ${(srv.valor || 0).toFixed(2)}</div>
                        </div>
                        <div style="display:flex;gap:0.5rem;">
                            <button class="btn-editar-srv" data-id="${srv._id}" style="background:#2196f3;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Editar</button>
                            <button class="btn-remover-srv" data-id="${srv._id}" style="background:#d32f2f;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Remover</button>
                        </div>
                    `;
                    listaDiv.appendChild(card);

                    // Editar
                    card.querySelector('.btn-editar-srv')?.addEventListener('click', async () => {
                        const resultado = await modalFormulario('Editar Serviço', [
                            { id: 'nome', label: 'Nome', type: 'text', value: srv.nome },
                            { id: 'duracao', label: 'Duração (minutos)', type: 'number', value: srv.duracao },
                            { id: 'valor', label: 'Valor (R$)', type: 'number', value: srv.valor }
                        ]);
                        if (!resultado) return;

                        fetch(`${API_URL}/servicos/${srv._id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                nome: resultado.nome,
                                duracao: parseInt(resultado.duracao),
                                valor: parseFloat(resultado.valor)
                            })
                        }).then(res => {
                            if (res.ok) {
                                exibirNotificacao('Serviço atualizado!');
                                carregarServicosAdmin();
                            } else {
                                exibirNotificacao('Erro ao atualizar.');
                            }
                        }).catch(() => exibirNotificacao('Erro de conexão.'));
                    });

                    // Remover
                    card.querySelector('.btn-remover-srv')?.addEventListener('click', async () => {
                        const ok = await modalConfirm('Remover', 'Tem certeza?');
                        if (!ok) return;

                        fetch(`${API_URL}/servicos/${srv._id}`, { method: 'DELETE' })
                            .then(res => {
                                if (res.ok) {
                                    exibirNotificacao('Serviço removido!');
                                    carregarServicosAdmin();
                                } else {
                                    exibirNotificacao('Erro ao remover.');
                                }
                            }).catch(() => exibirNotificacao('Erro de conexão.'));
                    });
                });
            }

            document.getElementById('btnNovoServico')?.addEventListener('click', async () => {
                const resultado = await modalFormulario('Novo Serviço', [
                    { id: 'nome', label: 'Nome do serviço', type: 'text', value: '', placeholder: 'Ex: Corte de cabelo' },
                    { id: 'duracao', label: 'Duração (minutos)', type: 'number', value: '30', placeholder: '30' },
                    { id: 'valor', label: 'Valor (R$)', type: 'number', value: '50', placeholder: '50.00' }
                ]);
                if (!resultado) return;

                fetch(`${API_URL}/servicos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome: resultado.nome,
                        duracao: parseInt(resultado.duracao),
                        valor: parseFloat(resultado.valor)
                    })
                }).then(res => {
                    if (res.ok) {
                        exibirNotificacao('Serviço criado!');
                        carregarServicosAdmin();
                    } else {
                        exibirNotificacao('Erro ao criar.');
                    }
                }).catch(() => exibirNotificacao('Erro de conexão.'));
            });
        } catch (e) {
            div.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar.</p>';
        }
    }

    // ===== PAINEL BARBEIROS =====
    async function carregarBarbeirosAdmin() {
        const usuario = getUsuarioLogado();
        if (usuario.funcao !== 'chefe') {
            document.getElementById('tab-barbeiros').innerHTML = '<p style="color:#d32f2f;">Acesso restrito a chefes.</p>';
            return;
        }

        const div = document.getElementById('tab-barbeiros');
        div.innerHTML = '<p style="color:#d0d0d0;">Carregando...</p>';

        try {
            const res = await fetch(`${API_URL}/clientes`);
            const clientes = await res.json();

            div.innerHTML = `
                <div style="margin-bottom:2rem;display:flex;gap:0.75rem;flex-wrap:wrap;">
                    <button id="btnDefinirCargoEmail" style="background:#ffd700;border:none;color:#000;padding:0.7rem 1.5rem;border-radius:6px;cursor:pointer;font-weight:700;">Definir cargo por e-mail</button>
                </div>
                <div style="display:grid;grid-template-columns:1fr;gap:1.5rem;">
                    <div>
                        <div style="color:#ffd700;font-weight:700;margin-bottom:.75rem;">Barbeiros</div>
                        <div id="listaBarbeiros"></div>
                    </div>
                    <div>
                        <div style="color:#ffd700;font-weight:700;margin-bottom:.75rem;">Chefes (Admin, sem barbeiro)</div>
                        <div id="listaChefesAdmin"></div>
                    </div>
                </div>
            `;

            const listaDiv = document.getElementById('listaBarbeiros');
            const listaChefesAdminDiv = document.getElementById('listaChefesAdmin');
            const barbeiros = clientes.filter(c => c.barbeiro);
            const chefesAdmin = clientes.filter(c => c.funcao === 'chefe' && !c.barbeiro);

            if (barbeiros.length === 0) {
                listaDiv.innerHTML = '<p style="color:#d0d0d0;">Nenhum barbeiro cadastrado.</p>';
            } else {
                barbeiros.forEach(barb => {
                    const card = document.createElement('div');
                    card.style.cssText = 'background:#1a1a1a;border:1px solid #444;padding:1.5rem;border-radius:8px;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;';
                    card.innerHTML = `
                        <div>
                            <div style="color:#ffd700;font-weight:600;">${barb.nome} ${barb.sobrenome}</div>
                            <div style="color:#d0d0d0;"><b>Função:</b> ${barb.funcao === 'chefe' ? 'Chefe' : 'Barbeiro'}</div>
                        </div>
                        <div style="display:flex;gap:0.5rem;">
                            ${barb.funcao === 'barbeiro' ? 
                                '<button class="btn-promover-barb" data-id="' + barb._id + '" style="background:#4caf50;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Promover a Chefe</button>' :
                                '<button class="btn-rebaixar-barb" data-id="' + barb._id + '" style="background:#ff9800;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Rebaixar para Barbeiro</button>'
                            }
                            <button class="btn-remover-barb" data-id="${barb._id}" style="background:#d32f2f;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Remover</button>
                        </div>
                    `;
                    listaDiv.appendChild(card);

                    // Promover
                    card.querySelector('.btn-promover-barb')?.addEventListener('click', async () => {
                        fetch(`${API_URL}/barbeiros/${barb._id}/funcao`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ funcao: 'chefe' })
                        }).then(res => {
                            if (res.ok) {
                                exibirNotificacao('Barbeiro promovido a chefe!');
                                carregarBarbeirosAdmin();
                            } else {
                                exibirNotificacao('Erro ao promover.');
                            }
                        }).catch(() => exibirNotificacao('Erro de conexão.'));
                    });

                    // Rebaixar
                    card.querySelector('.btn-rebaixar-barb')?.addEventListener('click', async () => {
                        fetch(`${API_URL}/barbeiros/${barb._id}/funcao`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ funcao: 'barbeiro' })
                        }).then(res => {
                            if (res.ok) {
                                exibirNotificacao('Barbeiro rebaixado!');
                                carregarBarbeirosAdmin();
                            } else {
                                exibirNotificacao('Erro ao rebaixar.');
                            }
                        }).catch(() => exibirNotificacao('Erro de conexão.'));
                    });

                    // Remover
                    card.querySelector('.btn-remover-barb')?.addEventListener('click', async () => {
                        const ok = await modalConfirm('Remover', 'Tem certeza?');
                        if (!ok) return;

                        fetch(`${API_URL}/barbeiros/${barb._id}/remove`, { method: 'PATCH' })
                            .then(res => {
                                if (res.ok) {
                                    exibirNotificacao('Barbeiro removido!');
                                    carregarBarbeirosAdmin();
                                } else {
                                    exibirNotificacao('Erro ao remover.');
                                }
                            }).catch(() => exibirNotificacao('Erro de conexão.'));
                    });
                });
            }

            if (chefesAdmin.length === 0) {
                if (listaChefesAdminDiv) {
                    listaChefesAdminDiv.innerHTML = '<p style="color:#d0d0d0;">Nenhum chefe (admin) cadastrado.</p>';
                }
            } else {
                chefesAdmin.forEach(chefe => {
                    const card = document.createElement('div');
                    card.style.cssText = 'background:#1a1a1a;border:1px solid #444;padding:1.5rem;border-radius:8px;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;gap:1rem;';
                    card.innerHTML = `
                        <div>
                            <div style="color:#ffd700;font-weight:600;">${chefe.nome} ${chefe.sobrenome}</div>
                            <div style="color:#d0d0d0;"><b>Função:</b> Chefe (Admin)</div>
                        </div>
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:flex-end;">
                            <button class="btn-remover-chefe" data-id="${chefe._id}" style="background:#ff9800;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Remover cargo</button>
                        </div>
                    `;
                    listaChefesAdminDiv?.appendChild(card);

                    card.querySelector('.btn-remover-chefe')?.addEventListener('click', async () => {
                        const ok = await modalConfirm('Remover cargo', 'Remover o cargo de chefe deste usuário?');
                        if (!ok) return;
                        fetch(`${API_URL}/barbeiros/${chefe._id}/funcao`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ funcao: '' })
                        }).then(res => {
                            if (res.ok) {
                                exibirNotificacao('Cargo removido!');
                                carregarBarbeirosAdmin();
                            } else {
                                exibirNotificacao('Erro ao remover cargo.');
                            }
                        }).catch(() => exibirNotificacao('Erro de conexão.'));
                    });
                });
            }

            // Definir cargo por e-mail (mais rápido quando tem muitos clientes)
            document.getElementById('btnDefinirCargoEmail')?.addEventListener('click', async () => {
                const resultado = await modalFormulario('Definir cargo por e-mail', [
                    { id: 'email', label: 'Email do usuário', type: 'text', value: '', placeholder: 'ex: usuario@email.com' },
                    {
                        id: 'cargo',
                        label: 'Cargo',
                        type: 'select',
                        value: 'barbeiro',
                        opcoes: [
                            { value: 'barbeiro', label: 'Barbeiro' },
                            { value: 'chefe', label: 'Chefe (Admin)' }
                        ]
                    }
                ]);
                if (!resultado) return;

                const email = (resultado.email || '').trim().toLowerCase();
                const cargo = (resultado.cargo || '').trim();
                if (!email || !cargo) return;

                const cliente = clientes.find(c => ((c.email || '').trim().toLowerCase() === email));
                if (!cliente) {
                    exibirNotificacao('Nenhum usuário encontrado com esse email.');
                    return;
                }

                if (cargo === 'barbeiro') {
                    if (cliente.barbeiro) {
                        exibirNotificacao('Este usuário já é barbeiro.');
                        return;
                    }
                    fetch(`${API_URL}/barbeiros/${cliente._id}/add`, { method: 'PATCH' })
                        .then(res => {
                            if (res.ok) {
                                exibirNotificacao('Barbeiro adicionado!');
                                carregarBarbeirosAdmin();
                            } else {
                                exibirNotificacao('Erro ao adicionar barbeiro.');
                            }
                        }).catch(() => exibirNotificacao('Erro de conexão.'));
                    return;
                }

                if (cargo === 'chefe') {
                    if (cliente.funcao === 'chefe' && !cliente.barbeiro) {
                        exibirNotificacao('Este usuário já é chefe (admin).');
                        return;
                    }
                    fetch(`${API_URL}/barbeiros/${cliente._id}/funcao`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ funcao: 'chefe' })
                    }).then(res => {
                        if (res.ok) {
                            exibirNotificacao('Cargo atualizado para chefe!');
                            carregarBarbeirosAdmin();
                        } else {
                            exibirNotificacao('Erro ao promover para chefe.');
                        }
                    }).catch(() => exibirNotificacao('Erro de conexão.'));
                    return;
                }

                exibirNotificacao('Cargo inválido.');
            });
        } catch (e) {
            div.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar.</p>';
        }
    }

    // ===== PAINEL GERAL =====
    async function carregarGeralAdmin() {
        const usuario = getUsuarioLogado();
        if (usuario.funcao !== 'chefe') {
            document.getElementById('tab-geral').innerHTML = '<p style="color:#d32f2f;">Acesso restrito a chefes.</p>';
            return;
        }
    }

    async function carregarContatoAdmin() {
        const div = document.getElementById('subtab-contato');
        div.innerHTML = '<p style="color:#d0d0d0;">Carregando...</p>';

        try {
            const res = await fetch(`${API_URL}/whatsapp`);
            const data = await res.json();

            div.innerHTML = `
                <div style="background:#1a1a1a;border:1px solid #444;padding:2rem;border-radius:8px;">
                    <div style="margin-bottom:2rem;">
                        <label style="color:#ffd700;font-weight:600;"><b>Link WhatsApp</b></label>
                        <input type="text" id="linkWpp" value="${data.link || ''}" placeholder="https://wa.me/..." style="width:100%;padding:0.7rem;margin-top:0.5rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:6px;">
                    </div>
                    <button id="btnSalvarWpp" style="background:#ffd700;border:none;color:#000;padding:0.7rem 1.5rem;border-radius:6px;cursor:pointer;font-weight:600;">Salvar</button>
                </div>
            `;

            document.getElementById('btnSalvarWpp')?.addEventListener('click', () => {
                const novoLink = document.getElementById('linkWpp').value.trim();
                if (!novoLink) {
                    exibirNotificacao('Link não pode ser vazio.');
                    return;
                }

                fetch(`${API_URL}/whatsapp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ link: novoLink })
                }).then(res => {
                    if (res.ok) {
                        exibirNotificacao('Link atualizado!');
                    } else {
                        exibirNotificacao('Erro ao atualizar.');
                    }
                }).catch(() => exibirNotificacao('Erro de conexão.'));
            });
        } catch (e) {
            div.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar.</p>';
        }
    }

    async function carregarHorariosAdmin() {
        const div = document.getElementById('subtab-horarios');
        div.innerHTML = '<p style="color:#d0d0d0;">Carregando...</p>';

        try {
            const res = await fetch(`${API_URL}/horarios`);
            const data = await res.json();

            const diasSemana = [
                { idx: 1, nome: 'Segunda' },
                { idx: 2, nome: 'Terça' },
                { idx: 3, nome: 'Quarta' },
                { idx: 4, nome: 'Quinta' },
                { idx: 5, nome: 'Sexta' },
                { idx: 6, nome: 'Sábado' },
                { idx: 0, nome: 'Domingo' }
            ];

            const diasCfg = data?.dias || {};

            const rowsDias = diasSemana.map(dia => {
                const cfg = diasCfg?.[dia.idx] || diasCfg?.[String(dia.idx)] || {};
                const aberto = !(cfg.fechado === true || cfg.aberto === false);
                const semAlmoco = cfg.semAlmoco === true;
                const abre = cfg.abre || data.padrao?.abre || '09:00';
                const fecha = cfg.fecha || data.padrao?.fecha || '19:00';
                return `
                    <div class="horarios-admin-dia-row" style="display:grid;grid-template-columns:140px 110px 140px 1fr 1fr;gap:0.75rem;align-items:center;margin-bottom:0.75rem;">
                        <div class="had-dia" style="color:#fff;font-weight:600;">${dia.nome}</div>
                        <label class="had-status" style="color:#d0d0d0;display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                            <input type="checkbox" id="diaAberto-${dia.idx}" ${aberto ? 'checked' : ''}>
                            Aberto
                        </label>
                        <label class="had-almoco" style="color:#d0d0d0;display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                            <input type="checkbox" id="diaSemAlmoco-${dia.idx}" ${semAlmoco ? 'checked' : ''}>
                            Sem almoço
                        </label>
                        <div class="had-abre" style="display:flex;flex-direction:column;gap:0.35rem;">
                            <span class="had-label">Abre</span>
                            <input type="time" id="diaAbre-${dia.idx}" value="${abre}" style="width:100%;padding:0.5rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:6px;">
                        </div>
                        <div class="had-fecha" style="display:flex;flex-direction:column;gap:0.35rem;">
                            <span class="had-label">Fecha</span>
                            <input type="time" id="diaFecha-${dia.idx}" value="${fecha}" style="width:100%;padding:0.5rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:6px;">
                        </div>
                    </div>
                `;
            }).join('');

            div.innerHTML = `
                <div style="background:#1a1a1a;border:1px solid #444;padding:2rem;border-radius:8px;">
                    <h3 style="color:#ffd700;margin-bottom:1.5rem;">Horários de Funcionamento</h3>
                    
                    <div style="margin-bottom:1.5rem;">
                        <label style="color:#fff;"><b>Abre às:</b></label>
                        <input type="time" id="abre" value="${data.padrao?.abre || '09:00'}" style="width:100%;padding:0.5rem;margin-top:0.5rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:6px;">
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="color:#fff;"><b>Fecha às:</b></label>
                        <input type="time" id="fecha" value="${data.padrao?.fecha || '19:00'}" style="width:100%;padding:0.5rem;margin-top:0.5rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:6px;">
                    </div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="color:#fff;"><b>Almoço começa às:</b></label>
                        <input type="time" id="almocoIni" value="${data.padrao?.almocoInicio || '12:00'}" style="width:100%;padding:0.5rem;margin-top:0.5rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:6px;">
                    </div>

                    <div style="margin-bottom:2rem;">
                        <label style="color:#fff;"><b>Almoço termina às:</b></label>
                        <input type="time" id="almocoFim" value="${data.padrao?.almocoFim || '13:00'}" style="width:100%;padding:0.5rem;margin-top:0.5rem;border:1px solid #444;background:#222;color:#f5f5f5;border-radius:6px;">
                    </div>

                    <hr style="border:none;border-top:1px solid #444;margin:2rem 0;">

                    <h3 style="color:#ffd700;margin-bottom:1rem;">Dias da Semana</h3>
                    <div class="horarios-admin-dias">
                        <div class="horarios-admin-dia-header" style="display:grid;grid-template-columns:140px 110px 140px 1fr 1fr;gap:0.75rem;align-items:center;margin-bottom:0.75rem;">
                            <div style="color:#d0d0d0;font-weight:600;">Dia</div>
                            <div style="color:#d0d0d0;font-weight:600;">Status</div>
                            <div style="color:#d0d0d0;font-weight:600;">Almoço</div>
                            <div style="color:#d0d0d0;font-weight:600;">Abre</div>
                            <div style="color:#d0d0d0;font-weight:600;">Fecha</div>
                        </div>
                        ${rowsDias}
                    </div>

                    <button id="btnSalvarHorarios" style="background:#ffd700;border:none;color:#000;padding:0.7rem 1.5rem;border-radius:6px;cursor:pointer;font-weight:600;margin-bottom:2rem;">Salvar Horários</button>

                    <hr style="border:none;border-top:1px solid #444;margin:2rem 0;">

                    <h3 style="color:#ffd700;margin-bottom:1.5rem;">Exceções (Datas Especiais)</h3>
                    <div id="listaExcecoes" style="margin-bottom:1.5rem;"></div>
                    <button id="btnNovaExcecao" style="background:#2196f3;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">+ Nova Exceção</button>
                </div>
            `;

            // Carregar exceções
            const listaExc = document.getElementById('listaExcecoes');
            if (Array.isArray(data.excecoes) && data.excecoes.length > 0) {
                data.excecoes.forEach((exc, idx) => {
                    const card = document.createElement('div');
                    card.style.cssText = 'background:#0f0f0f;border:1px solid #444;padding:1rem;border-radius:6px;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;';
                    card.innerHTML = `
                        <div>
                            <div style="color:#ffd700;font-weight:600;">${exc.data}</div>
                            <div style="color:#d0d0d0;font-size:0.9rem;">${exc.abre} - ${exc.fecha}${exc.fechado ? ' (FECHADO)' : ''}</div>
                        </div>
                        <button class="btn-remover-exc" data-data="${exc.data}" style="background:#d32f2f;border:none;color:#fff;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;">Remover</button>
                    `;
                    listaExc.appendChild(card);

                    card.querySelector('.btn-remover-exc')?.addEventListener('click', () => {
                        fetch(`${API_URL}/horarios/excecoes/${exc.data}`, { method: 'DELETE' })
                            .then(res => {
                                if (res.ok) {
                                    exibirNotificacao('Exceção removida!');
                                    carregarHorariosAdmin();
                                    atualizarHorarioBar();
                                } else {
                                    exibirNotificacao('Erro ao remover.');
                                }
                            }).catch(() => exibirNotificacao('Erro de conexão.'));
                    });
                });
            } else {
                listaExc.innerHTML = '<p style="color:#d0d0d0;">Nenhuma exceção cadastrada.</p>';
            }

            // Salvar horários
            document.getElementById('btnSalvarHorarios')?.addEventListener('click', () => {
                const padrao = {
                    abre: document.getElementById('abre').value,
                    fecha: document.getElementById('fecha').value,
                    almocoInicio: document.getElementById('almocoIni').value,
                    almocoFim: document.getElementById('almocoFim').value
                };

                const dias = {};
                diasSemana.forEach(dia => {
                    const aberto = document.getElementById(`diaAberto-${dia.idx}`)?.checked;
                    if (!aberto) {
                        dias[dia.idx] = { fechado: true };
                        return;
                    }
                    dias[dia.idx] = {
                        abre: document.getElementById(`diaAbre-${dia.idx}`)?.value || padrao.abre,
                        fecha: document.getElementById(`diaFecha-${dia.idx}`)?.value || padrao.fecha,
                        semAlmoco: document.getElementById(`diaSemAlmoco-${dia.idx}`)?.checked === true
                    };
                });

                fetch(`${API_URL}/horarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ padrao, dias })
                }).then(res => {
                    if (res.ok) {
                        exibirNotificacao('Horários salvos!');
                        atualizarHorarioBar();
                    } else {
                        exibirNotificacao('Erro ao salvar.');
                    }
                }).catch(() => exibirNotificacao('Erro de conexão.'));
            });

            // Nova exceção
            document.getElementById('btnNovaExcecao')?.addEventListener('click', async () => {
                const resultado = await modalFormulario('Nova Exceção de Horário', [
                    { id: 'data', label: 'Data (YYYY-MM-DD)', type: 'date', value: '' },
                    { id: 'fechado', label: 'Data fechada?', type: 'checkbox', value: false },
                    { id: 'semAlmoco', label: 'Sem almoço neste dia?', type: 'checkbox', value: false },
                    { id: 'abre', label: 'Abre às (se aberto)', type: 'time', value: '09:00' },
                    { id: 'fecha', label: 'Fecha às (se aberto)', type: 'time', value: '19:00' }
                ]);

                if (!resultado || !resultado.data) return;

                const excecao = {
                    data: resultado.data,
                    abre: resultado.fechado === true ? null : resultado.abre,
                    fecha: resultado.fechado === true ? null : resultado.fecha,
                    fechado: resultado.fechado === true,
                    semAlmoco: resultado.fechado === true ? false : (resultado.semAlmoco === true)
                };

                fetch(`${API_URL}/horarios`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ excecao })
                }).then(res => {
                    if (res.ok) {
                        exibirNotificacao('Exceção adicionada!');
                        carregarHorariosAdmin();
                        atualizarHorarioBar();
                    } else {
                        exibirNotificacao('Erro ao adicionar.');
                    }
                }).catch(() => exibirNotificacao('Erro de conexão.'));
            });
        } catch (e) {
            div.innerHTML = '<p style="color:#d32f2f;">Erro ao carregar.</p>';
        }
    }

    window.addEventListener('resize', () => {
        atualizarHeaderPerfil();
        // evita refetch em resize; só recalcula offsets
        const bar = document.querySelector('.horario-bar');
        const header = document.querySelector('.header');
        const barH = bar ? Math.ceil(bar.getBoundingClientRect().height) : 0;
        const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
        const root = document.documentElement;
        root.style.setProperty('--horario-bar-h', `${barH}px`);
        root.style.setProperty('--header-h', `${headerH}px`);
        root.style.setProperty('--top-offset', `${barH + headerH}px`);
    });

    // ===== INICIALIZAR =====
    const usuario = getUsuarioLogado();
    if (usuario) {
        salvarUsuario(usuario);
    }
    atualizarHeaderPerfil();
    atualizarHorarioBar();
    atualizarAbaAgendamentosGeraisVisibilidade();
});


