// ============================================================
        // SIGEM v5.0 - COMPATÍVEL COM EDUCACENSO 2026
        // ============================================================

        // ===== DADOS GLOBAIS =====
        let escolas = [];
        let disciplinas = [];
        let professores = [];
        let turmas = [];
        let alunos = [];
        let frequencias = [];
        let notas = [];
        let conteudos = [];
        let gestores = [];
        let infraestrutura = [];
        let funcionarios = [];
        let frequenciasPlanilha = {};

        let chartAlunosPorTurma = null;
        let chartFrequencia = null;
        let chartAlunosTurma = null;
        let chartFrequenciaMensal = null;
        let chartTurnos = null;
        let chartPCD = null;
        let chartMedias = null;
        let chartTopAlunos = null;

        // ============================================================
        // FUNÇÕES AUXILIARES
        // ============================================================
        function showToast(message, type) {
            type = type || 'info';
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = 'toast toast-' + type;
            toast.textContent = message;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(40px)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        function openModal(title, html) {
            document.getElementById('modalTitle').innerHTML = title;
            document.getElementById('modalBody').innerHTML = html;
            document.getElementById('modalOverlay').classList.add('active');
        }

        function closeModal() {
            document.getElementById('modalOverlay').classList.remove('active');
        }

        function navegarPara(panelId) {
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
            document.getElementById(panelId).classList.add('active');
            document.querySelector(`.nav button[data-panel="${panelId}"]`).classList.add('active');
        }

        document.querySelectorAll('.nav button').forEach(btn => {
            btn.addEventListener('click', function() {
                navegarPara(this.dataset.panel);
            });
        });

        // ============================================================
        // FUNÇÕES DE COMUNICAÇÃO COM A API
        // ============================================================
        async function carregarDados(endpoint) {
            try {
                const resp = await fetch('api/' + endpoint + '.php');
                if (!resp.ok) {
                    showToast('Erro HTTP ' + resp.status + ' ao carregar ' + endpoint, 'error');
                    return [];
                }
                const json = await resp.json();
                if (json.success !== undefined && !json.success) {
                    showToast('Erro ao carregar ' + endpoint + ': ' + json.message, 'error');
                    return [];
                }
                return json.data || [];
            } catch (e) {
                showToast('Erro de rede ao carregar ' + endpoint + ': ' + e.message, 'error');
                return [];
            }
        }

        async function salvarDados(endpoint, method, data, id = null) {
            let url = 'api/' + endpoint + '.php';
            if (id) url += '?id=' + id;
            try {
                const resp = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!resp.ok) {
                    showToast('Erro HTTP ' + resp.status + ' ao salvar', 'error');
                    return null;
                }
                const json = await resp.json();
                if (json.success === false) {
                    showToast('Erro: ' + json.message, 'error');
                    return null;
                }
                return json.data;
            } catch (e) {
                showToast('Erro de rede: ' + e.message, 'error');
                return null;
            }
        }

        async function excluirDados(endpoint, id) {
            if (!confirm('Deseja realmente excluir este registro?')) return false;
            try {
                const resp = await fetch('api/' + endpoint + '.php?id=' + id, { method: 'DELETE' });
                const json = await resp.json();
                if (json.success === false) {
                    showToast('Erro: ' + json.message, 'error');
                    return false;
                }
                showToast('Excluído com sucesso!', 'success');
                return true;
            } catch (e) {
                showToast('Erro de rede: ' + e.message, 'error');
                return false;
            }
        }

        async function recarregarEEspecifico(tabela) {
            const data = await carregarDados(tabela);
            switch (tabela) {
                case 'escolas':
                    escolas = data;
                    break;
                case 'disciplinas':
                    disciplinas = data;
                    break;
                case 'professores':
                    professores = data;
                    break;
                case 'turmas':
                    turmas = data;
                    break;
                case 'alunos':
                    alunos = data;
                    break;
                case 'frequencias':
                    frequencias = data;
                    break;
                case 'notas':
                    notas = data;
                    break;
                case 'conteudos':
                    conteudos = data;
                    break;
                case 'gestores':
                    gestores = data;
                    break;
                case 'infraestrutura':
                    infraestrutura = data;
                    break;
                case 'funcionarios':
                    funcionarios = data;
                    break;
                default:
                    break;
            }
            return data;
        }

        async function carregarTodosDados() {
            const [
                escolasData,
                disciplinasData,
                professoresData,
                turmasData,
                alunosData,
                frequenciasData,
                notasData,
                conteudosData,
                gestoresData,
                infraestruturaData,
                funcionariosData
            ] = await Promise.all([
                carregarDados('escolas'),
                carregarDados('disciplinas'),
                carregarDados('professores'),
                carregarDados('turmas'),
                carregarDados('alunos'),
                carregarDados('frequencias'),
                carregarDados('notas'),
                carregarDados('conteudos'),
                carregarDados('gestores'),
                carregarDados('infraestrutura'),
                carregarDados('funcionarios')
            ]);
            escolas = escolasData;
            disciplinas = disciplinasData;
            professores = professoresData;
            turmas = turmasData;
            alunos = alunosData;
            frequencias = frequenciasData;
            notas = notasData;
            conteudos = conteudosData;
            gestores = gestoresData;
            infraestrutura = infraestruturaData;
            funcionarios = funcionariosData;
        }

        // ============================================================
        // DASHBOARD
        // ============================================================
        async function atualizarDashboard() {
            try {
                const resp = await fetch('api/dashboard.php');
                if (!resp.ok) {
                    showToast('Erro ao carregar dashboard: HTTP ' + resp.status, 'error');
                    return;
                }
                const json = await resp.json();
                if (json.success === false) {
                    showToast('Erro ao carregar dashboard: ' + json.message, 'error');
                    return;
                }
                const d = json.data;
                document.getElementById('totalEscolas').textContent = d.totalEscolas || 0;
                document.getElementById('totalDisciplinas').textContent = d.totalDisciplinas || 0;
                document.getElementById('totalAlunos').textContent = d.totalAlunos || 0;
                document.getElementById('totalProfessores').textContent = d.totalProfessores || 0;
                document.getElementById('totalFuncionarios').textContent = funcionarios.length || 0;
                document.getElementById('totalTurmas').textContent = d.totalTurmas || 0;
                document.getElementById('frequenciasHoje').textContent = d.frequenciasHoje || 0;

                const canvas1 = document.getElementById('chartAlunosPorTurma');
                if (canvas1 && d.alunosPorTurma && d.alunosPorTurma.length > 0) {
                    if (chartAlunosPorTurma) chartAlunosPorTurma.destroy();
                    chartAlunosPorTurma = new Chart(canvas1, {
                        type: 'bar',
                        data: {
                            labels: d.alunosPorTurma.map(item => item.nome),
                            datasets: [{
                                label: 'Alunos',
                                data: d.alunosPorTurma.map(item => parseInt(item.total)),
                                backgroundColor: ['#3b8fc2', '#5aa3d4', '#7bc9ff', '#a3d4f0', '#c3e4ff'],
                                borderColor: '#0b2b4a',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, stepSize: 1 } }
                        }
                    });
                }

                const canvas2 = document.getElementById('chartFrequencia');
                if (canvas2 && d.frequenciaSemanal && d.frequenciaSemanal.length > 0) {
                    if (chartFrequencia) chartFrequencia.destroy();
                    chartFrequencia = new Chart(canvas2, {
                        type: 'line',
                        data: {
                            labels: d.frequenciaSemanal.map(item => item.data),
                            datasets: [
                                { label: 'Presente', data: d.frequenciaSemanal.map(item => parseInt(item.presentes)), borderColor: '#1e7b4a', backgroundColor: 'rgba(30,123,74,0.1)', fill: true, tension: 0.3 },
                                { label: 'Falta', data: d.frequenciaSemanal.map(item => parseInt(item.faltas)), borderColor: '#b13e3e', backgroundColor: 'rgba(177,62,62,0.1)', fill: true, tension: 0.3 }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: { legend: { position: 'top' } },
                            scales: { y: { beginAtZero: true, stepSize: 1 } }
                        }
                    });
                }

                await atualizarDashboardInterativo();
            } catch (e) {
                showToast('Erro ao carregar dashboard: ' + e.message, 'error');
            }
        }

        async function atualizarDashboardInterativo() {
            try {
                const resp = await fetch('api/dashboard.php');
                if (!resp.ok) return;
                const json = await resp.json();
                if (json.success === false) return;
                const d = json.data;

                const totalAlunos = alunos.length;
                const pcdCount = alunos.filter(a => a.pcd === 'SIM').length;
                const naoPcdCount = alunos.filter(a => a.pcd === 'NÃO' || !a.pcd).length;
                const percPcd = totalAlunos > 0 ? Math.round((pcdCount / totalAlunos) * 100) : 0;
                const percNaoPcd = totalAlunos > 0 ? Math.round((naoPcdCount / totalAlunos) * 100) : 0;

                const cards = document.querySelectorAll('.dash-card');
                let cardPCD = null;
                for (const card of cards) {
                    const h4 = card.querySelector('h4');
                    if (h4 && h4.textContent.includes('PCD')) {
                        cardPCD = card;
                        break;
                    }
                }
                if (cardPCD) {
                    const summary = cardPCD.querySelector('.pcd-summary');
                    if (summary) {
                        summary.innerHTML = `
                            <div class="pcd-item total-alunos">
                                <span>👥 Total:</span>
                                <span class="numero" style="font-size:22px;font-weight:700;color:#0b2b4a;">${totalAlunos}</span>
                            </div>
                            <div class="pcd-item">
                                <span class="dot pcd"></span>
                                <span style="font-weight:600;">PCD:</span>
                                <span class="numero pcd-num">${pcdCount}</span>
                                <span class="percent">(${percPcd}%)</span>
                            </div>
                            <div class="pcd-item">
                                <span class="dot nao-pcd"></span>
                                <span style="font-weight:600;">Não PCD:</span>
                                <span class="numero nao-pcd-num">${naoPcdCount}</span>
                                <span class="percent">(${percNaoPcd}%)</span>
                            </div>
                        `;
                    }
                }

                const ctxAlunosTurma = document.getElementById('chartAlunosTurma');
                if (ctxAlunosTurma && d.alunosPorTurma && d.alunosPorTurma.length > 0) {
                    if (chartAlunosTurma) chartAlunosTurma.destroy();
                    chartAlunosTurma = new Chart(ctxAlunosTurma, {
                        type: 'bar',
                        data: {
                            labels: d.alunosPorTurma.map(item => item.nome),
                            datasets: [{
                                label: 'Alunos',
                                data: d.alunosPorTurma.map(item => parseInt(item.total)),
                                backgroundColor: 'rgba(26, 82, 118, 0.7)',
                                borderColor: '#1a5276',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, stepSize: 1 } }
                        }
                    });
                }

                const ctxFreqMensal = document.getElementById('chartFrequenciaMensal');
                if (ctxFreqMensal && d.frequenciaSemanal && d.frequenciaSemanal.length > 0) {
                    if (chartFrequenciaMensal) chartFrequenciaMensal.destroy();
                    chartFrequenciaMensal = new Chart(ctxFreqMensal, {
                        type: 'line',
                        data: {
                            labels: d.frequenciaSemanal.map(item => item.data),
                            datasets: [
                                { label: 'Presentes', data: d.frequenciaSemanal.map(item => parseInt(item.presentes)), borderColor: '#27ae60', backgroundColor: 'rgba(39,174,96,0.1)', fill: true, tension: 0.3 },
                                { label: 'Faltas', data: d.frequenciaSemanal.map(item => parseInt(item.faltas)), borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)', fill: true, tension: 0.3 }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: { legend: { position: 'top' } },
                            scales: { y: { beginAtZero: true, stepSize: 1 } }
                        }
                    });
                }

                const ctxTurnos = document.getElementById('chartTurnos');
                if (ctxTurnos) {
                    if (chartTurnos) chartTurnos.destroy();
                    const turnos = ['MANHÃ', 'TARDE', 'NOITE', 'INTERMEDIÁRIO'];
                    const counts = turnos.map(t => turmas.filter(tur => tur.turno === t).length);
                    chartTurnos = new Chart(ctxTurnos, {
                        type: 'doughnut',
                        data: {
                            labels: turnos,
                            datasets: [{ data: counts, backgroundColor: ['#27ae60', '#f1c40f', '#e74c3c', '#8e44ad'] }]
                        },
                        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
                    });
                }

                const ctxPCD = document.getElementById('chartPCD');
                if (ctxPCD && d.pcd && d.pcd.length > 0) {
                    if (chartPCD) chartPCD.destroy();
                    chartPCD = new Chart(ctxPCD, {
                        type: 'pie',
                        data: {
                            labels: d.pcd.map(item => item.pcd || 'NÃO'),
                            datasets: [{ data: d.pcd.map(item => parseInt(item.total)), backgroundColor: ['#27ae60', '#e74c3c'] }]
                        },
                        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
                    });
                }

                const ctxMedias = document.getElementById('chartMedias');
                if (ctxMedias && d.mediasDisciplinas && d.mediasDisciplinas.length > 0) {
                    if (chartMedias) chartMedias.destroy();
                    chartMedias = new Chart(ctxMedias, {
                        type: 'bar',
                        data: {
                            labels: d.mediasDisciplinas.map(item => item.disciplina),
                            datasets: [{
                                label: 'Média',
                                data: d.mediasDisciplinas.map(item => parseFloat(item.media) || 0),
                                backgroundColor: d.mediasDisciplinas.map(item => parseFloat(item.media) >= 7 ? '#27ae60' : (parseFloat(item.media) >= 5 ? '#f1c40f' : '#e74c3c'))
                            }]
                        },
                        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 10, stepSize: 1 } } }
                    });
                }

                const ctxTop = document.getElementById('chartTopAlunos');
                if (ctxTop && d.topAlunos && d.topAlunos.length > 0) {
                    if (chartTopAlunos) chartTopAlunos.destroy();
                    chartTopAlunos = new Chart(ctxTop, {
                        type: 'bar',
                        data: {
                            labels: d.topAlunos.map(item => item.nome),
                            datasets: [{
                                label: 'Média',
                                data: d.topAlunos.map(item => parseFloat(item.media) || 0),
                                backgroundColor: 'rgba(26, 82, 118, 0.7)',
                                borderColor: '#1a5276',
                                borderWidth: 1
                            }]
                        },
                        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { x: { min: 0, max: 10, stepSize: 1 } }, indexAxis: 'y' }
                    });
                }
            } catch (e) {
                console.error('Erro nos gráficos interativos:', e);
            }
        }

        // ============================================================
        // ESCOLA - COMPLETO INEP (COM TODOS OS CAMPOS)
        // ============================================================
        function abrirModalEscola(data = null) {
            const isEdit = !!data;
            const title = isEdit ? 'Editar Escola' : 'Nova Escola';
            const gestorOptions = gestores.map(g =>
                `<option value="${g.id}" ${data && data.diretor_id == g.id ? 'selected' : ''}>${g.nome}</option>`
            ).join('');

            const dependencias = ['FEDERAL', 'ESTADUAL', 'MUNICIPAL', 'PRIVADA'];
            const depOptions = dependencias.map(d =>
                `<option value="${d}" ${data && data.dependencia_administrativa === d ? 'selected' : ''}>${d}</option>`
            ).join('');

            const categorias = ['PUBLICA', 'PRIVADA'];
            const catOptions = categorias.map(c =>
                `<option value="${c}" ${data && data.categoria === c ? 'selected' : ''}>${c}</option>`
            ).join('');

            const zonaOptions = ['URBANA', 'RURAL'];
            const zonaHtml = zonaOptions.map(z =>
                `<option value="${z}" ${data && data.zona_localizacao === z ? 'selected' : ''}>${z}</option>`
            ).join('');

            const localizacaoOptions = ['', 'AREA_INDIGENA', 'QUILOMBOLA', 'ASSENTAMENTO'];
            const localizacaoHtml = localizacaoOptions.map(l =>
                `<option value="${l}" ${data && data.localizacao_diferenciada === l ? 'selected' : ''}>${l || 'Nenhuma'}</option>`
            ).join('');

            const regulamentacaoOptions = ['', 'CONVENIO', 'CONTRATO', 'TERMO_PARCEIRA'];
            const regulamentacaoHtml = regulamentacaoOptions.map(r =>
                `<option value="${r}" ${data && data.regulamentacao === r ? 'selected' : ''}>${r || 'Nenhuma'}</option>`
            ).join('');

            const html = `
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label><i class="fas fa-school"></i> Nome da Escola <span class="required">*</span></label>
                        <input id="modalEscolaNome" value="${data ? data.nome || '' : ''}" placeholder="Ex: Escola Municipal São José">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-hashtag"></i> Código INEP <span class="required">*</span></label>
                        <input id="modalEscolaInep" value="${data ? data.inep || '' : ''}" placeholder="Código INEP (8 dígitos)" maxlength="8">
                        <div class="field-hint"><i class="fas fa-info-circle"></i> Código único do MEC/INEP</div>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-building"></i> Dependência Administrativa</label>
                        <select id="modalEscolaDependencia">
                            <option value="">Selecione</option>
                            ${depOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> Categoria</label>
                        <select id="modalEscolaCategoria">
                            <option value="">Selecione</option>
                            ${catOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-pin"></i> Zona de Localização <span class="required">*</span></label>
                        <select id="modalEscolaZona">
                            <option value="">Selecione</option>
                            ${zonaHtml}
                        </select>
                        <div class="field-hint"><i class="fas fa-info-circle"></i> Urbana ou Rural</div>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-flag"></i> Localização Diferenciada</label>
                        <select id="modalEscolaLocalizacao">
                            ${localizacaoHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-handshake"></i> Regulamentação</label>
                        <select id="modalEscolaRegulamentacao">
                            ${regulamentacaoHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-building"></i> Órgão Responsável</label>
                        <input id="modalEscolaOrgao" value="${data ? data.orgao_responsavel || '' : ''}" placeholder="Ex: Secretaria Municipal de Educação">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-link"></i> Unidade Vinculada</label>
                        <select id="modalEscolaVinculada">
                            <option value="">Nenhuma</option>
                            ${escolas.filter(e => e.id != (data ? data.id : null)).map(e => 
                                `<option value="${e.id}" ${data && data.unidade_vinculada == e.id ? 'selected' : ''}>${e.nome}</option>`
                            ).join('')}
                        </select>
                        <div class="field-hint"><i class="fas fa-info-circle"></i> Se esta escola é vinculada a outra</div>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-globe"></i> Latitude</label>
                        <input id="modalEscolaLatitude" type="number" step="0.00000001" value="${data ? data.latitude || '' : ''}" placeholder="-23.550520">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-globe"></i> Longitude</label>
                        <input id="modalEscolaLongitude" type="number" step="0.00000001" value="${data ? data.longitude || '' : ''}" placeholder="-46.633308">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-city"></i> Região Metropolitana</label>
                        <input id="modalEscolaRegiaoMetro" value="${data ? data.regiao_metropolitana || '' : ''}" placeholder="Ex: São Paulo">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-alt"></i> Data Início Atividades</label>
                        <input id="modalEscolaDataInicio" type="date" value="${data ? data.data_inicio_atividades || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-check"></i> Data Autorização</label>
                        <input id="modalEscolaDataAutorizacao" type="date" value="${data ? data.data_autorizacao || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-file-alt"></i> Documento Autorização</label>
                        <input id="modalEscolaDocAutorizacao" value="${data ? data.documento_autorizacao || '' : ''}" placeholder="Número do documento">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-road"></i> Logradouro</label>
                        <input id="modalEscolaLogradouro" value="${data ? data.logradouro || '' : ''}" placeholder="Rua, Av, etc">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-hashtag"></i> Número</label>
                        <input id="modalEscolaNumero" value="${data ? data.numero || '' : ''}" placeholder="Número">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-pin"></i> Bairro</label>
                        <input id="modalEscolaBairro" value="${data ? data.bairro || '' : ''}" placeholder="Bairro">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-marker-alt"></i> Cidade</label>
                        <input id="modalEscolaCidade" value="${data ? data.cidade || '' : ''}" placeholder="Cidade">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-pin"></i> Estado (UF)</label>
                        <input id="modalEscolaEstado" value="${data ? data.estado || '' : ''}" placeholder="UF" maxlength="2">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-mail-bulk"></i> CEP</label>
                        <input id="modalEscolaCep" value="${data ? data.cep || '' : ''}" placeholder="00000-000" maxlength="9">
                    </div>
                    <div class="form-group full-width">
                        <label><i class="fas fa-home"></i> Complemento/Referência</label>
                        <input id="modalEscolaEndereco" value="${data ? data.endereco || '' : ''}" placeholder="Complemento, referência">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-phone"></i> Telefone</label>
                        <input id="modalEscolaTelefone" value="${data ? data.telefone || '' : ''}" placeholder="(00) 0000-0000">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <input id="modalEscolaEmail" value="${data ? data.email || '' : ''}" placeholder="escola@email.com">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-globe"></i> Site</label>
                        <input id="modalEscolaSite" value="${data ? data.site || '' : ''}" placeholder="www.escola.com.br">
                    </div>
                    <div class="form-group full-width">
                        <label><i class="fas fa-user-tie"></i> DIRETOR</label>
                        <select id="modalEscolaDiretor">
                            <option value="">Selecione um diretor</option>
                            ${gestorOptions}
                        </select>
                        <div class="field-hint"><i class="fas fa-info-circle"></i> Selecione o diretor já cadastrado ou cadastre um novo na aba Gestor</div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarEscola(${data ? data.id : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            `;
            openModal('<i class="fas fa-school"></i> ' + title, html);
        }

        async function salvarEscola(id = null) {
            const nome = document.getElementById('modalEscolaNome').value.trim();
            if (!nome) { showToast('Nome da escola é obrigatório!', 'error'); return; }
            const data = {
                nome: nome,
                inep: document.getElementById('modalEscolaInep').value.trim(),
                dependencia_administrativa: document.getElementById('modalEscolaDependencia').value,
                categoria: document.getElementById('modalEscolaCategoria').value,
                zona_localizacao: document.getElementById('modalEscolaZona').value,
                localizacao_diferenciada: document.getElementById('modalEscolaLocalizacao').value,
                regulamentacao: document.getElementById('modalEscolaRegulamentacao').value,
                orgao_responsavel: document.getElementById('modalEscolaOrgao').value.trim(),
                unidade_vinculada: document.getElementById('modalEscolaVinculada').value || null,
                latitude: document.getElementById('modalEscolaLatitude').value || null,
                longitude: document.getElementById('modalEscolaLongitude').value || null,
                regiao_metropolitana: document.getElementById('modalEscolaRegiaoMetro').value.trim(),
                data_inicio_atividades: document.getElementById('modalEscolaDataInicio').value || null,
                data_autorizacao: document.getElementById('modalEscolaDataAutorizacao').value || null,
                documento_autorizacao: document.getElementById('modalEscolaDocAutorizacao').value.trim(),
                logradouro: document.getElementById('modalEscolaLogradouro').value.trim(),
                numero: document.getElementById('modalEscolaNumero').value.trim(),
                bairro: document.getElementById('modalEscolaBairro').value.trim(),
                cidade: document.getElementById('modalEscolaCidade').value.trim(),
                estado: document.getElementById('modalEscolaEstado').value.trim().toUpperCase(),
                cep: document.getElementById('modalEscolaCep').value.trim(),
                endereco: document.getElementById('modalEscolaEndereco').value.trim(),
                telefone: document.getElementById('modalEscolaTelefone').value.trim(),
                email: document.getElementById('modalEscolaEmail').value.trim(),
                site: document.getElementById('modalEscolaSite').value.trim(),
                diretor_id: document.getElementById('modalEscolaDiretor').value || null
            };
            const method = id ? 'PUT' : 'POST';
            showToast('Salvando escola...', 'info');
            const result = await salvarDados('escolas', method, data, id);
            if (result) {
                closeModal();
                await recarregarEEspecifico('escolas');
                renderizarEscolas();
                atualizarDashboard();
                showToast('Escola salva com sucesso!', 'success');
            }
        }

        async function renderizarEscolas() {
            const filtro = document.getElementById('filtroEscola').value.toLowerCase();
            let list = escolas;
            if (filtro) {
                list = list.filter(e => e.nome.toLowerCase().includes(filtro) || (e.cidade || '').toLowerCase().includes(
                filtro));
            }
            const container = document.getElementById('escolaCards');
            if (!list || list.length === 0) {
                container.innerHTML = '<p style="color:#4a6a85;padding:20px;">Nenhuma escola cadastrada.</p>';
                return;
            }
            let html = '';
            list.forEach(e => {
                const diretor = gestores.find(g => g.id == e.diretor_id);
                const dep = e.dependencia_administrativa || 'N/I';
                const cat = e.categoria || 'N/I';
                const zona = e.zona_localizacao || 'N/I';
                html += `
                    <div class="escola-card">
                        <div class="card-header">
                            <h3><i class="fas fa-school" style="color:#1a5276;"></i> ${e.nome}</h3>
                            <span class="inep-code"><i class="fas fa-hashtag"></i> ${e.inep || 'N/I'}</span>
                        </div>
                        <div class="card-info">
                            <div><i class="fas fa-building"></i> ${dep} | ${cat}</div>
                            <div><i class="fas fa-map-pin"></i> Zona: ${zona}</div>
                            <div><i class="fas fa-home"></i> ${e.logradouro || ''} ${e.numero || ''}, ${e.bairro || ''}</div>
                            <div><i class="fas fa-map-marker-alt"></i> ${e.cidade || 'N/I'} - ${e.estado || 'N/I'} ${e.cep || ''}</div>
                            <div><i class="fas fa-phone"></i> ${e.telefone || 'N/I'}</div>
                            <div><i class="fas fa-envelope"></i> ${e.email || 'N/I'}</div>
                            <div><i class="fas fa-globe"></i> ${e.site || 'N/I'}</div>
                            <div><i class="fas fa-calendar-alt"></i> Início: ${e.data_inicio_atividades || 'N/I'}</div>
                            <div class="diretor"><i class="fas fa-user-tie"></i> Diretor: ${diretor ? diretor.nome : 'Não definido'}</div>
                        </div>
                        <div style="margin-top:10px;display:flex;gap:6px;">
                            <button class="btn btn-secondary btn-sm" onclick="abrirModalEscola(escolas.find(x => x.id == ${e.id}))">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="excluirEscola(${e.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        async function excluirEscola(id) {
            const ok = await excluirDados('escolas', id);
            if (ok) {
                await recarregarEEspecifico('escolas');
                renderizarEscolas();
                atualizarDashboard();
            }
        }

        async function carregarEscolasForcado() {
            showToast('Recarregando escolas...', 'info');
            await recarregarEEspecifico('escolas');
            renderizarEscolas();
            atualizarDashboard();
            showToast('Escolas recarregadas!', 'success');
        }

        // ============================================================
        // DISCIPLINA - MANTIDO
        // ============================================================
        function abrirModalDisciplina(data = null) {
            const isEdit = !!data;
            const title = isEdit ? 'Editar Disciplina' : 'Nova Disciplina';
            const escolaOptions = escolas.map(e =>
                `<option value="${e.id}" ${data && data.escola_id == e.id ? 'selected' : ''}>${e.nome}</option>`
            ).join('');
            const html = `
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label><i class="fas fa-school"></i> Escola <span class="required">*</span></label>
                        <select id="modalDiscEscola">
                            <option value="">Selecione uma escola</option>
                            ${escolaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-book"></i> Nome da Disciplina <span class="required">*</span></label>
                        <input id="modalDiscNome" value="${data ? data.nome || '' : ''}" placeholder="Ex: Matemática">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-code"></i> Código</label>
                        <input id="modalDiscCodigo" value="${data ? data.codigo || '' : ''}" placeholder="Ex: MAT-101">
                    </div>
                    <div class="form-group full-width">
                        <label><i class="fas fa-clock"></i> Carga Horária (horas)</label>
                        <input id="modalDiscCarga" type="number" step="1" min="0" value="${data ? data.carga_horaria || '' : ''}" placeholder="Ex: 80">
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarDisciplina(${data ? data.id : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            `;
            openModal('<i class="fas fa-book"></i> ' + title, html);
        }

        async function salvarDisciplina(id = null) {
            const escola_id = document.getElementById('modalDiscEscola').value;
            const nome = document.getElementById('modalDiscNome').value.trim();
            if (!escola_id) { showToast('Selecione uma escola!', 'error'); return; }
            if (!nome) { showToast('Nome da disciplina é obrigatório!', 'error'); return; }
            const data = {
                escola_id: escola_id,
                nome: nome,
                codigo: document.getElementById('modalDiscCodigo').value.trim(),
                carga_horaria: parseInt(document.getElementById('modalDiscCarga').value) || 0
            };
            const method = id ? 'PUT' : 'POST';
            const result = await salvarDados('disciplinas', method, data, id);
            if (result) {
                closeModal();
                await recarregarEEspecifico('disciplinas');
                renderizarDisciplinas();
                atualizarDashboard();
                showToast('Disciplina salva!', 'success');
            }
        }

        async function renderizarDisciplinas() {
            const filtro = document.getElementById('filtroDisciplina').value.toLowerCase();
            const escolaFiltro = document.getElementById('filtroDiscEscola').value;
            let list = disciplinas;
            if (filtro) {
                list = list.filter(d => d.nome.toLowerCase().includes(filtro) || (d.codigo || '').toLowerCase().includes(
                filtro));
            }
            if (escolaFiltro !== 'todas') {
                list = list.filter(d => d.escola_id == escolaFiltro);
            }
            const tbody = document.getElementById('tabelaDisciplinas');
            if (!list || list.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="5" style="text-align:center;color:#4a6a85;">Nenhuma disciplina cadastrada.</td></tr>';
                return;
            }
            let html = '';
            list.forEach(d => {
                const escola = escolas.find(e => e.id == d.escola_id);
                html += `
                    <tr>
                        <td><strong>${d.nome}</strong></td>
                        <td>${d.codigo || '-'}</td>
                        <td>${d.carga_horaria || 0}h</td>
                        <td>${escola ? escola.nome : 'N/I'}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="abrirModalDisciplina(disciplinas.find(x => x.id == ${d.id}))"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="excluirDisciplina(${d.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        async function excluirDisciplina(id) {
            const ok = await excluirDados('disciplinas', id);
            if (ok) {
                await recarregarEEspecifico('disciplinas');
                renderizarDisciplinas();
                atualizarDashboard();
            }
        }

        // ============================================================
        // PROFESSOR - COMPLETO INEP (COM TODOS OS CAMPOS)
        // ============================================================
        function abrirModalProfessor(data = null) {
            const isEdit = !!data;
            const title = isEdit ? 'Editar Professor' : 'Novo Professor';
            const escolaOptions = escolas.map(e =>
                `<option value="${e.id}" ${data && data.escola_id == e.id ? 'selected' : ''}>${e.nome}</option>`
            ).join('');

            const sexos = ['MASCULINO', 'FEMININO'];
            const sexoOptions = sexos.map(s =>
                `<option value="${s}" ${data && data.sexo === s ? 'selected' : ''}>${s}</option>`
            ).join('');

            const racas = ['BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDIGENA'];
            const racaOptions = racas.map(r =>
                `<option value="${r}" ${data && data.raca === r ? 'selected' : ''}>${r}</option>`
            ).join('');

            const escolaridadeOptions = ['SUPERIOR_COMPLETO', 'SUPERIOR_INCOMPLETO', 'MEDIO'];
            const escolaridadeHtml = escolaridadeOptions.map(e =>
                `<option value="${e}" ${data && data.escolaridade === e ? 'selected' : ''}>${e.replace(/_/g, ' ')}</option>`
            ).join('');

            const posGradOptions = ['', 'ESPECIALIZACAO', 'MESTRADO', 'DOUTORADO'];
            const posGradHtml = posGradOptions.map(p =>
                `<option value="${p}" ${data && data.pos_graduacao === p ? 'selected' : ''}>${p || 'Nenhuma'}</option>`
            ).join('');

            const html = `
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label><i class="fas fa-user"></i> Nome Completo <span class="required">*</span></label>
                        <input id="modalProfNome" value="${data ? data.nome || '' : ''}" placeholder="Nome do professor">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> CPF <span class="required">*</span></label>
                        <input id="modalProfCpf" value="${data ? data.cpf || '' : ''}" placeholder="000.000.000-00" maxlength="14">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> Identidade (RG)</label>
                        <input id="modalProfIdentidade" value="${data ? data.identidade || '' : ''}" placeholder="Número do RG">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-alt"></i> Data de Nascimento</label>
                        <input id="modalProfDataNasc" type="date" value="${data ? data.data_nascimento || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-venus-mars"></i> Sexo</label>
                        <select id="modalProfSexo">
                            <option value="">Selecione</option>
                            ${sexoOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-user-tag"></i> Raça/Cor</label>
                        <select id="modalProfRaca">
                            <option value="">Selecione</option>
                            ${racaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-flag"></i> País de Nascimento</label>
                        <input id="modalProfPais" value="${data ? data.pais_nascimento || 'BRASIL' : 'BRASIL'}" placeholder="País">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-pin"></i> UF de Nascimento <span class="required">*</span></label>
                        <input id="modalProfUfNasc" value="${data ? data.uf_nascimento || '' : ''}" placeholder="UF" maxlength="2">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-city"></i> Município de Nascimento <span class="required">*</span></label>
                        <input id="modalProfMunicipioNasc" value="${data ? data.municipio_nascimento || '' : ''}" placeholder="Cidade de nascimento">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-graduation-cap"></i> Escolaridade</label>
                        <select id="modalProfEscolaridade">
                            <option value="">Selecione</option>
                            ${escolaridadeHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-university"></i> Curso de Licenciatura</label>
                        <input id="modalProfCurso" value="${data ? data.curso_licenciatura || '' : ''}" placeholder="Ex: Matemática">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Ano de Conclusão</label>
                        <input id="modalProfAnoConclusao" type="number" value="${data ? data.ano_conclusao || '' : ''}" placeholder="YYYY">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-university"></i> Instituição de Formação</label>
                        <input id="modalProfInstituicao" value="${data ? data.instituicao_formacao || '' : ''}" placeholder="IES de formação">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-graduation-cap"></i> Pós-Graduação</label>
                        <select id="modalProfPosGrad">
                            ${posGradHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-wheelchair"></i> Professor Educação Especial</label>
                        <select id="modalProfEsp">
                            <option value="0" ${data && data.professor_educacao_especial == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.professor_educacao_especial == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <input id="modalProfEmail" value="${data ? data.email || '' : ''}" placeholder="email@professor.com">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-home"></i> Endereço</label>
                        <input id="modalProfEndereco" value="${data ? data.endereco || '' : ''}" placeholder="Rua, número, bairro">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-city"></i> Cidade de Nascimento</label>
                        <input id="modalProfCidadeNasc" value="${data ? data.cidade_nascimento || '' : ''}" placeholder="Cidade onde nasceu">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-pin"></i> Estado de Nascimento</label>
                        <input id="modalProfEstado" value="${data ? data.estado || '' : ''}" placeholder="UF" maxlength="2">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-graduation-cap"></i> Formação</label>
                        <input id="modalProfFormacao" value="${data ? data.formacao || '' : ''}" placeholder="Ex: Licenciatura em Matemática">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-clock"></i> Carga Horária</label>
                        <input id="modalProfCarga" type="number" value="${data ? data.carga_horaria || '' : ''}" placeholder="Ex: 40">
                    </div>
                    <div class="form-group full-width">
                        <label><i class="fas fa-school"></i> Escola <span class="required">*</span></label>
                        <select id="modalProfEscola">
                            <option value="">Selecione uma escola</option>
                            ${escolaOptions}
                        </select>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarProfessor(${data ? data.id : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            `;
            openModal('<i class="fas fa-chalkboard-teacher"></i> ' + title, html);
        }

        async function salvarProfessor(id = null) {
            const nome = document.getElementById('modalProfNome').value.trim();
            const escola_id = document.getElementById('modalProfEscola').value;
            const cpf = document.getElementById('modalProfCpf').value.trim();
            if (!nome) { showToast('Nome do professor é obrigatório!', 'error'); return; }
            if (!escola_id) { showToast('Selecione uma escola!', 'error'); return; }
            if (!cpf) { showToast('CPF do professor é obrigatório!', 'error'); return; }
            const data = {
                nome,
                cpf,
                identidade: document.getElementById('modalProfIdentidade').value.trim(),
                data_nascimento: document.getElementById('modalProfDataNasc').value || null,
                sexo: document.getElementById('modalProfSexo').value,
                raca: document.getElementById('modalProfRaca').value,
                pais_nascimento: document.getElementById('modalProfPais').value.trim() || 'BRASIL',
                uf_nascimento: document.getElementById('modalProfUfNasc').value.trim().toUpperCase(),
                municipio_nascimento: document.getElementById('modalProfMunicipioNasc').value.trim(),
                escolaridade: document.getElementById('modalProfEscolaridade').value,
                curso_licenciatura: document.getElementById('modalProfCurso').value.trim(),
                ano_conclusao: document.getElementById('modalProfAnoConclusao').value || null,
                instituicao_formacao: document.getElementById('modalProfInstituicao').value.trim(),
                pos_graduacao: document.getElementById('modalProfPosGrad').value,
                professor_educacao_especial: parseInt(document.getElementById('modalProfEsp').value) || 0,
                email: document.getElementById('modalProfEmail').value.trim(),
                endereco: document.getElementById('modalProfEndereco').value.trim(),
                cidade_nascimento: document.getElementById('modalProfCidadeNasc').value.trim(),
                estado: document.getElementById('modalProfEstado').value.trim().toUpperCase(),
                formacao: document.getElementById('modalProfFormacao').value.trim(),
                carga_horaria: parseInt(document.getElementById('modalProfCarga').value) || 0,
                escola_id
            };
            const method = id ? 'PUT' : 'POST';
            const result = await salvarDados('professores', method, data, id);
            if (result) {
                closeModal();
                await recarregarEEspecifico('professores');
                renderizarProfessores();
                atualizarDashboard();
                showToast('Professor salvo!', 'success');
            }
        }

        async function renderizarProfessores() {
            const filtro = document.getElementById('filtroProfessor').value.toLowerCase();
            const escolaFiltro = document.getElementById('filtroProfEscola').value;
            let list = professores;
            if (filtro) {
                list = list.filter(p => p.nome.toLowerCase().includes(filtro) || (p.email || '').toLowerCase().includes(
                    filtro) || (p.cpf || '').includes(filtro));
            }
            if (escolaFiltro !== 'todas') {
                list = list.filter(p => p.escola_id == escolaFiltro);
            }
            const tbody = document.getElementById('tabelaProfessores');
            if (!list || list.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="8" style="text-align:center;color:#4a6a85;">Nenhum professor cadastrado.</td></tr>';
                return;
            }
            let html = '';
            list.forEach(p => {
                const escola = escolas.find(e => e.id == p.escola_id);
                const dataNasc = p.data_nascimento ? new Date(p.data_nascimento).toLocaleDateString('pt-BR') : '-';
                html += `
                    <tr>
                        <td><strong>${p.nome}</strong></td>
                        <td>${p.cpf || '-'}</td>
                        <td>${dataNasc}</td>
                        <td>${p.sexo || '-'}</td>
                        <td>${p.raca || '-'}</td>
                        <td>${p.email || '-'}</td>
                        <td>${escola ? escola.nome : 'N/I'}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="abrirModalProfessor(professores.find(x => x.id == ${p.id}))"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="excluirProfessor(${p.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        async function excluirProfessor(id) {
            const ok = await excluirDados('professores', id);
            if (ok) {
                await recarregarEEspecifico('professores');
                renderizarProfessores();
                atualizarDashboard();
            }
        }

        // ============================================================
        // 🆕 FUNCIONÁRIO - COMPLETO INEP (COM TODOS OS CAMPOS)
        // ============================================================
        function abrirModalFuncionario(data = null) {
            const isEdit = !!data;
            const title = isEdit ? 'Editar Funcionário' : 'Novo Funcionário';
            const escolaOptions = escolas.map(e =>
                `<option value="${e.id}" ${data && data.escola_id == e.id ? 'selected' : ''}>${e.nome}</option>`
            ).join('');

            const sexos = ['MASCULINO', 'FEMININO'];
            const sexoOptions = sexos.map(s =>
                `<option value="${s}" ${data && data.sexo === s ? 'selected' : ''}>${s}</option>`
            ).join('');

            const racas = ['BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDIGENA'];
            const racaOptions = racas.map(r =>
                `<option value="${r}" ${data && data.raca === r ? 'selected' : ''}>${r}</option>`
            ).join('');

            const cargos = ['ADMINISTRATIVO', 'COORDENADOR', 'SECRETARIO', 'BIBLIOTECARIO', 'INSPETOR', 'PORTEIRO', 'SERVIÇOS GERAIS', 'MOTORISTA', 'MERENDEIRA', 'AUXILIAR', 'OUTRO'];
            const cargoOptions = cargos.map(c =>
                `<option value="${c}" ${data && data.cargo === c ? 'selected' : ''}>${c}</option>`
            ).join('');

            const escolaridadeOptions = ['FUNDAMENTAL_INCOMPLETO', 'FUNDAMENTAL_COMPLETO', 'MEDIO_INCOMPLETO', 'MEDIO_COMPLETO', 'SUPERIOR_INCOMPLETO', 'SUPERIOR_COMPLETO', 'POS_GRADUACAO'];
            const escolaridadeHtml = escolaridadeOptions.map(e =>
                `<option value="${e}" ${data && data.escolaridade === e ? 'selected' : ''}>${e.replace(/_/g, ' ')}</option>`
            ).join('');

            const tipoDeficienciaOptions = ['', 'VISUAL', 'AUDITIVA', 'FISICA', 'MENTAL', 'MULTIPLA'];
            const tipoDefHtml = tipoDeficienciaOptions.map(t =>
                `<option value="${t}" ${data && data.tipo_deficiencia === t ? 'selected' : ''}>${t || 'Nenhuma'}</option>`
            ).join('');

            const necessidadeOptions = ['', 'AUTISMO', 'SUPERDOTACAO', 'TDAH', 'DISLEXIA'];
            const necessidadeHtml = necessidadeOptions.map(n =>
                `<option value="${n}" ${data && data.necessidade_especial === n ? 'selected' : ''}>${n || 'Nenhuma'}</option>`
            ).join('');

            const estadoCivilOptions = ['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'UNIAO_ESTAVEL'];
            const estadoCivilHtml = estadoCivilOptions.map(e =>
                `<option value="${e}" ${data && data.estado_civil === e ? 'selected' : ''}>${e.replace(/_/g, ' ')}</option>`
            ).join('');

            const html = `
                <div class="form-grid">
                    <!-- DADOS PESSOAIS -->
                    <div class="form-group full-width" style="background:#e8f0fe;padding:8px 12px;border-radius:8px;margin-bottom:4px;">
                        <label style="font-weight:700;color:#0b2b4a;"><i class="fas fa-user"></i> DADOS PESSOAIS</label>
                    </div>
                    <div class="form-group full-width">
                        <label><i class="fas fa-user"></i> Nome Completo <span class="required">*</span></label>
                        <input id="modalFuncNome" value="${data ? data.nome || '' : ''}" placeholder="Nome completo do funcionário">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-hashtag"></i> Código INEP <span class="required">*</span></label>
                        <input id="modalFuncInep" value="${data ? data.inep || '' : ''}" placeholder="Código INEP (8 dígitos)" maxlength="8">
                        <div class="field-hint"><i class="fas fa-info-circle"></i> Código único do MEC/INEP</div>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> CPF <span class="required">*</span></label>
                        <input id="modalFuncCpf" value="${data ? data.cpf || '' : ''}" placeholder="000.000.000-00" maxlength="14">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> Identidade (RG)</label>
                        <input id="modalFuncIdentidade" value="${data ? data.identidade || '' : ''}" placeholder="Número do RG">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-alt"></i> Data de Nascimento <span class="required">*</span></label>
                        <input id="modalFuncDataNasc" type="date" value="${data ? data.data_nascimento || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-venus-mars"></i> Sexo <span class="required">*</span></label>
                        <select id="modalFuncSexo">
                            <option value="">Selecione</option>
                            ${sexoOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-user-tag"></i> Raça/Cor <span class="required">*</span></label>
                        <select id="modalFuncRaca">
                            <option value="">Selecione</option>
                            ${racaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-flag"></i> País de Nascimento</label>
                        <input id="modalFuncPais" value="${data ? data.pais_nascimento || 'BRASIL' : 'BRASIL'}" placeholder="País">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-pin"></i> UF de Nascimento <span class="required">*</span></label>
                        <input id="modalFuncUfNasc" value="${data ? data.uf_nascimento || '' : ''}" placeholder="UF" maxlength="2">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-city"></i> Município de Nascimento <span class="required">*</span></label>
                        <input id="modalFuncMunicipioNasc" value="${data ? data.municipio_nascimento || '' : ''}" placeholder="Cidade de nascimento">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-ring"></i> Estado Civil</label>
                        <select id="modalFuncEstadoCivil">
                            <option value="">Selecione</option>
                            ${estadoCivilHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-flag"></i> Nacionalidade</label>
                        <input id="modalFuncNacionalidade" value="${data ? data.nacionalidade || 'BRASILEIRA' : 'BRASILEIRA'}" placeholder="Ex: BRASILEIRA">
                    </div>

                    <!-- CONTATO E ENDEREÇO -->
                    <div class="form-group full-width" style="background:#e8f0fe;padding:8px 12px;border-radius:8px;margin-top:8px;margin-bottom:4px;">
                        <label style="font-weight:700;color:#0b2b4a;"><i class="fas fa-address-card"></i> CONTATO E ENDEREÇO</label>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <input id="modalFuncEmail" value="${data ? data.email || '' : ''}" placeholder="email@funcionario.com">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-phone"></i> Telefone</label>
                        <input id="modalFuncTelefone" value="${data ? data.telefone || '' : ''}" placeholder="(00) 00000-0000">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-phone"></i> Telefone Secundário</label>
                        <input id="modalFuncTelefone2" value="${data ? data.telefone2 || '' : ''}" placeholder="(00) 0000-0000">
                    </div>
                    <div class="form-group full-width">
                        <label><i class="fas fa-home"></i> Endereço</label>
                        <input id="modalFuncEndereco" value="${data ? data.endereco || '' : ''}" placeholder="Rua, número, bairro">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-city"></i> Cidade</label>
                        <input id="modalFuncCidade" value="${data ? data.cidade || '' : ''}" placeholder="Cidade">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-pin"></i> Estado (UF)</label>
                        <input id="modalFuncEstado" value="${data ? data.estado || '' : ''}" placeholder="UF" maxlength="2">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-mail-bulk"></i> CEP</label>
                        <input id="modalFuncCep" value="${data ? data.cep || '' : ''}" placeholder="00000-000" maxlength="9">
                    </div>

                    <!-- DOCUMENTOS -->
                    <div class="form-group full-width" style="background:#e8f0fe;padding:8px 12px;border-radius:8px;margin-top:8px;margin-bottom:4px;">
                        <label style="font-weight:700;color:#0b2b4a;"><i class="fas fa-file-alt"></i> DOCUMENTOS</label>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> CNH (Carteira Nacional de Habilitação)</label>
                        <input id="modalFuncCnh" value="${data ? data.cnh || '' : ''}" placeholder="Número da CNH">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> Categoria da CNH</label>
                        <select id="modalFuncCnhCategoria">
                            <option value="">Selecione</option>
                            <option value="A" ${data && data.cnh_categoria === 'A' ? 'selected' : ''}>A</option>
                            <option value="B" ${data && data.cnh_categoria === 'B' ? 'selected' : ''}>B</option>
                            <option value="C" ${data && data.cnh_categoria === 'C' ? 'selected' : ''}>C</option>
                            <option value="D" ${data && data.cnh_categoria === 'D' ? 'selected' : ''}>D</option>
                            <option value="E" ${data && data.cnh_categoria === 'E' ? 'selected' : ''}>E</option>
                            <option value="AB" ${data && data.cnh_categoria === 'AB' ? 'selected' : ''}>AB</option>
                            <option value="AC" ${data && data.cnh_categoria === 'AC' ? 'selected' : ''}>AC</option>
                            <option value="AD" ${data && data.cnh_categoria === 'AD' ? 'selected' : ''}>AD</option>
                            <option value="AE" ${data && data.cnh_categoria === 'AE' ? 'selected' : ''}>AE</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> Validade da CNH</label>
                        <input id="modalFuncCnhValidade" type="date" value="${data ? data.cnh_validade || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> Título de Eleitor</label>
                        <input id="modalFuncTitulo" value="${data ? data.titulo_eleitor || '' : ''}" placeholder="Número do Título de Eleitor">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> Zona Eleitoral</label>
                        <input id="modalFuncZonaEleitoral" value="${data ? data.zona_eleitoral || '' : ''}" placeholder="Zona">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> Seção Eleitoral</label>
                        <input id="modalFuncSecaoEleitoral" value="${data ? data.secao_eleitoral || '' : ''}" placeholder="Seção">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> CTPS (Carteira de Trabalho)</label>
                        <input id="modalFuncCtps" value="${data ? data.ctps || '' : ''}" placeholder="Número da CTPS">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> PIS/PASEP</label>
                        <input id="modalFuncPis" value="${data ? data.pis || '' : ''}" placeholder="Número do PIS/PASEP">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> Reservista (Certificado Militar)</label>
                        <input id="modalFuncReservista" value="${data ? data.reservista || '' : ''}" placeholder="Número do Certificado Militar">
                    </div>

                    <!-- DADOS FUNCIONAIS -->
                    <div class="form-group full-width" style="background:#e8f0fe;padding:8px 12px;border-radius:8px;margin-top:8px;margin-bottom:4px;">
                        <label style="font-weight:700;color:#0b2b4a;"><i class="fas fa-briefcase"></i> DADOS FUNCIONAIS</label>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-briefcase"></i> Cargo <span class="required">*</span></label>
                        <select id="modalFuncCargo">
                            <option value="">Selecione o cargo</option>
                            ${cargoOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-alt"></i> Data de Admissão</label>
                        <input id="modalFuncDataAdmissao" type="date" value="${data ? data.data_admissao || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-alt"></i> Data de Demissão</label>
                        <input id="modalFuncDataDemissao" type="date" value="${data ? data.data_demissao || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-clock"></i> Carga Horária Semanal</label>
                        <input id="modalFuncCargaHoraria" type="number" value="${data ? data.carga_horaria || '' : ''}" placeholder="Ex: 40">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-money-bill-wave"></i> Salário (R$)</label>
                        <input id="modalFuncSalario" type="number" step="0.01" value="${data ? data.salario || '' : ''}" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-clock"></i> Turno de Trabalho</label>
                        <select id="modalFuncTurno">
                            <option value="">Selecione</option>
                            <option value="MANHÃ" ${data && data.turno === 'MANHÃ' ? 'selected' : ''}>MANHÃ</option>
                            <option value="TARDE" ${data && data.turno === 'TARDE' ? 'selected' : ''}>TARDE</option>
                            <option value="NOITE" ${data && data.turno === 'NOITE' ? 'selected' : ''}>NOITE</option>
                            <option value="INTEGRAL" ${data && data.turno === 'INTEGRAL' ? 'selected' : ''}>INTEGRAL</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-user-tag"></i> Situação Funcional</label>
                        <select id="modalFuncSituacao">
                            <option value="ATIVO" ${data && data.situacao === 'ATIVO' ? 'selected' : ''}>ATIVO</option>
                            <option value="AFASTADO" ${data && data.situacao === 'AFASTADO' ? 'selected' : ''}>AFASTADO</option>
                            <option value="FERIAS" ${data && data.situacao === 'FERIAS' ? 'selected' : ''}>FÉRIAS</option>
                            <option value="LICENCA" ${data && data.situacao === 'LICENCA' ? 'selected' : ''}>LICENÇA</option>
                            <option value="DESLIGADO" ${data && data.situacao === 'DESLIGADO' ? 'selected' : ''}>DESLIGADO</option>
                        </select>
                    </div>

                    <!-- ESCOLARIDADE E FORMAÇÃO -->
                    <div class="form-group full-width" style="background:#e8f0fe;padding:8px 12px;border-radius:8px;margin-top:8px;margin-bottom:4px;">
                        <label style="font-weight:700;color:#0b2b4a;"><i class="fas fa-graduation-cap"></i> ESCOLARIDADE E FORMAÇÃO</label>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-graduation-cap"></i> Escolaridade</label>
                        <select id="modalFuncEscolaridade">
                            <option value="">Selecione</option>
                            ${escolaridadeHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-university"></i> Curso/Formação</label>
                        <input id="modalFuncFormacao" value="${data ? data.formacao || '' : ''}" placeholder="Ex: Administração, Pedagogia">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-alt"></i> Ano de Conclusão</label>
                        <input id="modalFuncAnoConclusao" type="number" value="${data ? data.ano_conclusao || '' : ''}" placeholder="YYYY">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-university"></i> Instituição de Ensino</label>
                        <input id="modalFuncInstituicao" value="${data ? data.instituicao || '' : ''}" placeholder="Nome da instituição">
                    </div>

                    <!-- SAÚDE E NECESSIDADES ESPECIAIS -->
                    <div class="form-group full-width" style="background:#e8f0fe;padding:8px 12px;border-radius:8px;margin-top:8px;margin-bottom:4px;">
                        <label style="font-weight:700;color:#0b2b4a;"><i class="fas fa-heartbeat"></i> SAÚDE E NECESSIDADES ESPECIAIS</label>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-wheelchair"></i> PCD (Pessoa com Deficiência)</label>
                        <select id="modalFuncPcd">
                            <option value="NÃO" ${data && data.pcd === 'NÃO' ? 'selected' : ''}>NÃO</option>
                            <option value="SIM" ${data && data.pcd === 'SIM' ? 'selected' : ''}>SIM</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-wheelchair"></i> Tipo de Deficiência</label>
                        <select id="modalFuncTipoDef">
                            ${tipoDefHtml}
                        </select>
                        <div class="field-hint"><i class="fas fa-info-circle"></i> Se PCD for SIM, selecione o tipo</div>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> CID</label>
                        <input id="modalFuncCid" value="${data ? data.cid || '' : ''}" placeholder="Código CID">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-brain"></i> Necessidade Especial</label>
                        <select id="modalFuncNecessidade">
                            ${necessidadeHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-notes-medical"></i> Condição de Saúde</label>
                        <input id="modalFuncCondicaoSaude" value="${data ? data.condicao_saude || '' : ''}" placeholder="Ex: Hipertensão, Diabetes">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-prescription"></i> Medicamentos de Uso Contínuo</label>
                        <input id="modalFuncMedicamentos" value="${data ? data.medicamentos || '' : ''}" placeholder="Lista de medicamentos">
                    </div>

                    <!-- ESCOLA -->
                    <div class="form-group full-width" style="background:#e8f0fe;padding:8px 12px;border-radius:8px;margin-top:8px;margin-bottom:4px;">
                        <label style="font-weight:700;color:#0b2b4a;"><i class="fas fa-school"></i> VÍNCULO COM A ESCOLA</label>
                    </div>
                    <div class="form-group full-width">
                        <label><i class="fas fa-school"></i> Escola <span class="required">*</span></label>
                        <select id="modalFuncEscola">
                            <option value="">Selecione uma escola</option>
                            ${escolaOptions}
                        </select>
                    </div>

                    <!-- OBSERVAÇÃO -->
                    <div class="form-group full-width">
                        <label><i class="fas fa-comment"></i> Observação</label>
                        <textarea id="modalFuncObservacao" placeholder="Observações sobre o funcionário">${data ? data.observacao || '' : ''}</textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarFuncionario(${data ? data.id : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            `;
            openModal('<i class="fas fa-user-cog"></i> ' + title, html);
        }

        async function salvarFuncionario(id = null) {
            const nome = document.getElementById('modalFuncNome').value.trim();
            const inep = document.getElementById('modalFuncInep').value.trim();
            const cpf = document.getElementById('modalFuncCpf').value.trim();
            const escola_id = document.getElementById('modalFuncEscola').value;
            const cargo = document.getElementById('modalFuncCargo').value;
            const data_nascimento = document.getElementById('modalFuncDataNasc').value;

            if (!nome) { showToast('Nome do funcionário é obrigatório!', 'error'); return; }
            if (!inep) { showToast('Código INEP é obrigatório!', 'error'); return; }
            if (!cpf) { showToast('CPF é obrigatório!', 'error'); return; }
            if (!escola_id) { showToast('Selecione uma escola!', 'error'); return; }
            if (!cargo) { showToast('Selecione o cargo!', 'error'); return; }
            if (!data_nascimento) { showToast('Data de nascimento é obrigatória!', 'error'); return; }

            const data = {
                nome,
                inep,
                cpf,
                identidade: document.getElementById('modalFuncIdentidade').value.trim(),
                data_nascimento,
                sexo: document.getElementById('modalFuncSexo').value,
                raca: document.getElementById('modalFuncRaca').value,
                pais_nascimento: document.getElementById('modalFuncPais').value.trim() || 'BRASIL',
                uf_nascimento: document.getElementById('modalFuncUfNasc').value.trim().toUpperCase(),
                municipio_nascimento: document.getElementById('modalFuncMunicipioNasc').value.trim(),
                estado_civil: document.getElementById('modalFuncEstadoCivil').value,
                nacionalidade: document.getElementById('modalFuncNacionalidade').value.trim() || 'BRASILEIRA',
                email: document.getElementById('modalFuncEmail').value.trim(),
                telefone: document.getElementById('modalFuncTelefone').value.trim(),
                telefone2: document.getElementById('modalFuncTelefone2').value.trim(),
                endereco: document.getElementById('modalFuncEndereco').value.trim(),
                cidade: document.getElementById('modalFuncCidade').value.trim(),
                estado: document.getElementById('modalFuncEstado').value.trim().toUpperCase(),
                cep: document.getElementById('modalFuncCep').value.trim(),
                cnh: document.getElementById('modalFuncCnh').value.trim(),
                cnh_categoria: document.getElementById('modalFuncCnhCategoria').value,
                cnh_validade: document.getElementById('modalFuncCnhValidade').value || null,
                titulo_eleitor: document.getElementById('modalFuncTitulo').value.trim(),
                zona_eleitoral: document.getElementById('modalFuncZonaEleitoral').value.trim(),
                secao_eleitoral: document.getElementById('modalFuncSecaoEleitoral').value.trim(),
                ctps: document.getElementById('modalFuncCtps').value.trim(),
                pis: document.getElementById('modalFuncPis').value.trim(),
                reservista: document.getElementById('modalFuncReservista').value.trim(),
                cargo,
                data_admissao: document.getElementById('modalFuncDataAdmissao').value || null,
                data_demissao: document.getElementById('modalFuncDataDemissao').value || null,
                carga_horaria: parseInt(document.getElementById('modalFuncCargaHoraria').value) || 0,
                salario: parseFloat(document.getElementById('modalFuncSalario').value) || 0,
                turno: document.getElementById('modalFuncTurno').value,
                situacao: document.getElementById('modalFuncSituacao').value || 'ATIVO',
                escolaridade: document.getElementById('modalFuncEscolaridade').value,
                formacao: document.getElementById('modalFuncFormacao').value.trim(),
                ano_conclusao: document.getElementById('modalFuncAnoConclusao').value || null,
                instituicao: document.getElementById('modalFuncInstituicao').value.trim(),
                pcd: document.getElementById('modalFuncPcd').value,
                tipo_deficiencia: document.getElementById('modalFuncTipoDef').value,
                cid: document.getElementById('modalFuncCid').value.trim(),
                necessidade_especial: document.getElementById('modalFuncNecessidade').value,
                condicao_saude: document.getElementById('modalFuncCondicaoSaude').value.trim(),
                medicamentos: document.getElementById('modalFuncMedicamentos').value.trim(),
                escola_id,
                observacao: document.getElementById('modalFuncObservacao').value.trim()
            };

            const method = id ? 'PUT' : 'POST';
            const result = await salvarDados('funcionarios', method, data, id);
            if (result) {
                closeModal();
                await recarregarEEspecifico('funcionarios');
                renderizarFuncionarios();
                atualizarDashboard();
                showToast('Funcionário salvo com sucesso!', 'success');
            }
        }

        async function renderizarFuncionarios() {
            const filtro = document.getElementById('filtroFuncionario').value.toLowerCase();
            const escolaFiltro = document.getElementById('filtroFuncEscola').value;
            const cargoFiltro = document.getElementById('filtroFuncCargo').value;

            let list = funcionarios;
            if (filtro) {
                list = list.filter(f => 
                    f.nome.toLowerCase().includes(filtro) || 
                    (f.cpf || '').includes(filtro) ||
                    (f.cargo || '').toLowerCase().includes(filtro)
                );
            }
            if (escolaFiltro !== 'todas') {
                list = list.filter(f => f.escola_id == escolaFiltro);
            }
            if (cargoFiltro !== 'todos') {
                list = list.filter(f => f.cargo === cargoFiltro);
            }

            const tbody = document.getElementById('tabelaFuncionarios');
            if (!list || list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;color:#4a6a85;">Nenhum funcionário cadastrado.</td></tr>';
                return;
            }

            let html = '';
            list.forEach(f => {
                const escola = escolas.find(e => e.id == f.escola_id);
                const dataNasc = f.data_nascimento ? new Date(f.data_nascimento).toLocaleDateString('pt-BR') : '-';
                const pcdClass = f.pcd === 'SIM' ? 'sim' : 'nao';
                const temCnh = f.cnh ? '✅' : '❌';
                const temTitulo = f.titulo_eleitor ? '✅' : '❌';
                const def = f.tipo_deficiencia || '-';

                html += `
                    <tr>
                        <td><strong>${f.nome}</strong></td>
                        <td>${f.inep || '-'}</td>
                        <td>${f.cpf || '-'}</td>
                        <td>${dataNasc}</td>
                        <td>${f.sexo || '-'}</td>
                        <td>${f.raca || '-'}</td>
                        <td><span class="badge-turno" style="background:#e2eefa;color:#1a4a6e;">${f.cargo || '-'}</span></td>
                        <td>${escola ? escola.nome : 'N/I'}</td>
                        <td><span class="badge-pcd ${pcdClass}">${f.pcd || 'NÃO'}</span></td>
                        <td>${temCnh}</td>
                        <td>${temTitulo}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="abrirModalFuncionario(funcionarios.find(x => x.id == ${f.id}))"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="excluirFuncionario(${f.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        async function excluirFuncionario(id) {
            const ok = await excluirDados('funcionarios', id);
            if (ok) {
                await recarregarEEspecifico('funcionarios');
                renderizarFuncionarios();
                atualizarDashboard();
            }
        }

        async function recarregarFuncionarios() {
            showToast('Recarregando funcionários...', 'info');
            await recarregarEEspecifico('funcionarios');
            renderizarFuncionarios();
            showToast('Funcionários recarregados!', 'success');
        }

        // ============================================================
        // TURMA - COMPLETO INEP (COM TODOS OS CAMPOS)
        // ============================================================
        function abrirModalTurma(data = null) {
            const isEdit = !!data;
            const title = isEdit ? 'Editar Turma' : 'Nova Turma';
            const escolaOptions = escolas.map(e =>
                `<option value="${e.id}" ${data && data.escola_id == e.id ? 'selected' : ''}>${e.nome}</option>`
            ).join('');
            const professorOptions = professores.map(p =>
                `<option value="${p.id}" ${data && data.professor_id == p.id ? 'selected' : ''}>${p.nome}</option>`
            ).join('');
            const anos = ['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º'];
            const anoOptions = anos.map(a =>
                `<option value="${a}" ${data && data.ano === a ? 'selected' : ''}>${a} Ano</option>`
            ).join('');
            const turnos = ['MANHÃ', 'TARDE', 'NOITE', 'INTERMEDIÁRIO'];
            const turnoOptions = turnos.map(t =>
                `<option value="${t}" ${data && data.turno === t ? 'selected' : ''}>${t}</option>`
            ).join('');
            const modalidades = ['EDUCACAO_INFANTIL', 'ENSINO_FUNDAMENTAL', 'ENSINO_MEDIO', 'EJA', 'EDUCACAO_ESPECIAL'];
            const modalidadeOptions = modalidades.map(m =>
                `<option value="${m}" ${data && data.modalidade === m ? 'selected' : ''}>${m.replace(/_/g, ' ')}</option>`
            ).join('');
            const tipoTurmaOptions = ['REGULAR', 'EJA', 'ESPECIAL', 'PROFISSIONALIZANTE'];
            const tipoTurmaHtml = tipoTurmaOptions.map(t =>
                `<option value="${t}" ${data && data.tipo_turma === t ? 'selected' : ''}>${t}</option>`
            ).join('');

            const html = `
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label><i class="fas fa-school"></i> Escola <span class="required">*</span></label>
                        <select id="modalTurmaEscola">
                            <option value="">Selecione uma escola</option>
                            ${escolaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-hashtag"></i> Código INEP da Turma</label>
                        <input id="modalTurmaInep" value="${data ? data.inep_turma || '' : ''}" placeholder="Código INEP da turma">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> Nome da Turma <span class="required">*</span></label>
                        <input id="modalTurmaNome" value="${data ? data.nome || '' : ''}" placeholder="Ex: 6º A">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-layer-group"></i> Modalidade</label>
                        <select id="modalTurmaModalidade">
                            <option value="">Selecione</option>
                            ${modalidadeOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> Tipo de Turma</label>
                        <select id="modalTurmaTipo">
                            <option value="">Selecione</option>
                            ${tipoTurmaHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-sort-numeric-up"></i> Ano/Série <span class="required">*</span></label>
                        <select id="modalTurmaAno">
                            <option value="">Selecione o ano</option>
                            ${anoOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-chalkboard-teacher"></i> Professor</label>
                        <select id="modalTurmaProfessor">
                            <option value="">Selecione um professor</option>
                            ${professorOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-clock"></i> Turno <span class="required">*</span></label>
                        <select id="modalTurmaTurno">
                            <option value="">Selecione o turno</option>
                            ${turnoOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-code"></i> Código da Turma</label>
                        <input id="modalTurmaCodigo" value="${data ? data.codigo_turma || '' : ''}" placeholder="Código interno da turma">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-book"></i> Disciplina Principal</label>
                        <select id="modalTurmaDisciplina">
                            <option value="">Selecione</option>
                            ${disciplinas.map(d => 
                                `<option value="${d.id}" ${data && data.disciplina_id == d.id ? 'selected' : ''}>${d.nome}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarTurma(${data ? data.id : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            `;
            openModal('<i class="fas fa-users"></i> ' + title, html);
        }

        async function salvarTurma(id = null) {
            const nome = document.getElementById('modalTurmaNome').value.trim();
            const ano = document.getElementById('modalTurmaAno').value;
            const escola_id = document.getElementById('modalTurmaEscola').value;
            const turno = document.getElementById('modalTurmaTurno').value;
            if (!nome) { showToast('Nome da turma é obrigatório!', 'error'); return; }
            if (!ano) { showToast('Selecione o ano!', 'error'); return; }
            if (!escola_id) { showToast('Selecione uma escola!', 'error'); return; }
            if (!turno) { showToast('Selecione o turno!', 'error'); return; }
            const data = {
                nome,
                ano,
                turno,
                inep_turma: document.getElementById('modalTurmaInep').value.trim(),
                modalidade: document.getElementById('modalTurmaModalidade').value,
                tipo_turma: document.getElementById('modalTurmaTipo').value,
                professor_id: document.getElementById('modalTurmaProfessor').value || null,
                escola_id,
                codigo_turma: document.getElementById('modalTurmaCodigo').value.trim(),
                disciplina_id: document.getElementById('modalTurmaDisciplina').value || null
            };
            const method = id ? 'PUT' : 'POST';
            const result = await salvarDados('turmas', method, data, id);
            if (result) {
                closeModal();
                await recarregarEEspecifico('turmas');
                renderizarTurmas();
                atualizarDashboard();
                showToast('Turma salva!', 'success');
            }
        }

        async function renderizarTurmas() {
            const filtro = document.getElementById('filtroTurma').value.toLowerCase();
            const escolaFiltro = document.getElementById('filtroTurmaEscola').value;
            let list = turmas;
            if (filtro) {
                list = list.filter(t => t.nome.toLowerCase().includes(filtro));
            }
            if (escolaFiltro !== 'todas') {
                list = list.filter(t => t.escola_id == escolaFiltro);
            }
            const tbody = document.getElementById('tabelaTurmas');
            if (!list || list.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="10" style="text-align:center;color:#4a6a85;">Nenhuma turma cadastrada.</td></tr>';
                return;
            }
            let html = '';
            list.forEach(t => {
                const escola = escolas.find(e => e.id == t.escola_id);
                const professor = professores.find(p => p.id == t.professor_id);
                const alunosCount = alunos.filter(a => a.turma_id == t.id).length;
                let turnoClass = '';
                if (t.turno) {
                    const turnoLower = t.turno.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    if (turnoLower.includes('manha')) turnoClass = 'manha';
                    else if (turnoLower.includes('tarde')) turnoClass = 'tarde';
                    else if (turnoLower.includes('noite')) turnoClass = 'noite';
                    else if (turnoLower.includes('intermediario')) turnoClass = 'intermediario';
                }
                const modalidade = t.modalidade ? t.modalidade.replace(/_/g, ' ') : '-';
                const tipo = t.tipo_turma || '-';
                html += `
                    <tr>
                        <td><strong>${t.nome}</strong></td>
                        <td>${t.inep_turma || '-'}</td>
                        <td>${modalidade}</td>
                        <td><span class="badge-ano">${t.ano || '-'}</span></td>
                        <td>${tipo}</td>
                        <td>${professor ? professor.nome : 'N/I'}</td>
                        <td><span class="badge-turno ${turnoClass}">${t.turno || '-'}</span></td>
                        <td>${escola ? escola.nome : 'N/I'}</td>
                        <td>${alunosCount}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="abrirModalTurma(turmas.find(x => x.id == ${t.id}))"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="excluirTurma(${t.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        async function excluirTurma(id) {
            const ok = await excluirDados('turmas', id);
            if (ok) {
                await recarregarEEspecifico('turmas');
                renderizarTurmas();
                atualizarDashboard();
            }
        }

        // ============================================================
        // ALUNO - COMPLETO INEP (COM TODOS OS CAMPOS)
        // ============================================================
        function abrirModalAluno(data = null) {
            const isEdit = !!data;
            const title = isEdit ? 'Editar Aluno' : 'Novo Aluno';
            const escolaOptions = escolas.map(e =>
                `<option value="${e.id}" ${data && data.escola_id == e.id ? 'selected' : ''}>${e.nome}</option>`
            ).join('');
            const turmaOptions = turmas.filter(t => !data || t.escola_id == data.escola_id).map(t =>
                `<option value="${t.id}" ${data && data.turma_id == t.id ? 'selected' : ''}>${t.nome}</option>`
            ).join('');

            const sexos = ['MASCULINO', 'FEMININO'];
            const sexoOptions = sexos.map(s =>
                `<option value="${s}" ${data && data.sexo === s ? 'selected' : ''}>${s}</option>`
            ).join('');

            const racas = ['BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDIGENA'];
            const racaOptions = racas.map(r =>
                `<option value="${r}" ${data && data.raca === r ? 'selected' : ''}>${r}</option>`
            ).join('');

            const situacoes = ['CURSANDO', 'APROVADO', 'REPROVADO', 'TRANSFERIDO', 'DESISTENTE', 'FALECIDO'];
            const situacaoOptions = situacoes.map(s =>
                `<option value="${s}" ${data && data.situacao === s ? 'selected' : ''}>${s}</option>`
            ).join('');

            const tipoDeficienciaOptions = ['', 'VISUAL', 'AUDITIVA', 'FISICA', 'MENTAL', 'MULTIPLA'];
            const tipoDefHtml = tipoDeficienciaOptions.map(t =>
                `<option value="${t}" ${data && data.tipo_deficiencia === t ? 'selected' : ''}>${t || 'Nenhuma'}</option>`
            ).join('');

            const necessidadeOptions = ['', 'AUTISMO', 'SUPERDOTACAO', 'TDAH', 'DISLEXIA'];
            const necessidadeHtml = necessidadeOptions.map(n =>
                `<option value="${n}" ${data && data.necessidade_especial === n ? 'selected' : ''}>${n || 'Nenhuma'}</option>`
            ).join('');

            const ocupacaoOptions = ['', 'EMPREGADO', 'DESEMPREGADO', 'ESTUDANTE', 'OUTRO'];
            const ocupacaoHtml = ocupacaoOptions.map(o =>
                `<option value="${o}" ${data && data.situacao_ocupacao === o ? 'selected' : ''}>${o || 'N/A'}</option>`
            ).join('');

            const zonaResidencialOptions = ['URBANA', 'RURAL'];
            const zonaResHtml = zonaResidencialOptions.map(z =>
                `<option value="${z}" ${data && data.zona_residencial === z ? 'selected' : ''}>${z}</option>`
            ).join('');

            const html = `
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label><i class="fas fa-user-graduate"></i> Nome do Aluno <span class="required">*</span></label>
                        <input id="modalAlunoNome" value="${data ? data.nome || '' : ''}" placeholder="Nome completo">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-hashtag"></i> Código INEP do Aluno</label>
                        <input id="modalAlunoInep" value="${data ? data.inep_aluno || '' : ''}" placeholder="Código INEP do aluno">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> CPF</label>
                        <input id="modalAlunoCpf" value="${data ? data.cpf || '' : ''}" placeholder="000.000.000-00" maxlength="14">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-alt"></i> Data de Nascimento</label>
                        <input id="modalAlunoDataNasc" type="date" value="${data ? data.data_nascimento || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-venus-mars"></i> Sexo</label>
                        <select id="modalAlunoSexo">
                            <option value="">Selecione</option>
                            ${sexoOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-user-tag"></i> Raça/Cor</label>
                        <select id="modalAlunoRaca">
                            <option value="">Selecione</option>
                            ${racaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-flag"></i> País de Nascimento</label>
                        <input id="modalAlunoPaisNasc" value="${data ? data.pais_nascimento || 'BRASIL' : 'BRASIL'}" placeholder="País">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-pin"></i> UF de Nascimento <span class="required">*</span></label>
                        <input id="modalAlunoUfNasc" value="${data ? data.uf_nascimento || '' : ''}" placeholder="UF" maxlength="2">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-city"></i> Município de Nascimento <span class="required">*</span></label>
                        <input id="modalAlunoMunicipioNasc" value="${data ? data.municipio_nascimento || '' : ''}" placeholder="Cidade de nascimento">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-pin"></i> Zona Residencial</label>
                        <select id="modalAlunoZonaRes">
                            <option value="">Selecione</option>
                            ${zonaResHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-wheelchair"></i> PCD</label>
                        <select id="modalAlunoPcd">
                            <option value="NÃO" ${data && data.pcd === 'NÃO' ? 'selected' : ''}>NÃO</option>
                            <option value="SIM" ${data && data.pcd === 'SIM' ? 'selected' : ''}>SIM</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-wheelchair"></i> Tipo de Deficiência</label>
                        <select id="modalAlunoTipoDef">
                            ${tipoDefHtml}
                        </select>
                        <div class="field-hint"><i class="fas fa-info-circle"></i> Se PCD for SIM, selecione o tipo</div>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> CID</label>
                        <input id="modalAlunoCid" value="${data ? data.cid || '' : ''}" placeholder="Código CID">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-brain"></i> Necessidade Especial</label>
                        <select id="modalAlunoNecessidade">
                            ${necessidadeHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-bus"></i> Transporte Escolar</label>
                        <select id="modalAlunoTransporte">
                            <option value="0" ${data && data.transporte_escolar == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.transporte_escolar == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-book"></i> Material Escolar</label>
                        <select id="modalAlunoMaterial">
                            <option value="0" ${data && data.material_escolar == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.material_escolar == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-tshirt"></i> Uniforme</label>
                        <select id="modalAlunoUniforme">
                            <option value="0" ${data && data.uniforme == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.uniforme == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-money-bill-wave"></i> Bolsa Família</label>
                        <select id="modalAlunoBolsa">
                            <option value="0" ${data && data.bolsa_familia == 0 ? 'selected' : ''}>NÃO</option>
                            <option value="1" ${data && data.bolsa_familia == 1 ? 'selected' : ''}>SIM</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> Tipo de Bolsa</label>
                        <select id="modalAlunoTipoBolsa">
                            <option value="">Nenhuma</option>
                            <option value="BOLSA_FAMILIA" ${data && data.tipo_bolsa === 'BOLSA_FAMILIA' ? 'selected' : ''}>Bolsa Família</option>
                            <option value="BPC" ${data && data.tipo_bolsa === 'BPC' ? 'selected' : ''}>BPC</option>
                            <option value="OUTRO" ${data && data.tipo_bolsa === 'OUTRO' ? 'selected' : ''}>Outro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-briefcase"></i> Situação de Ocupação</label>
                        <select id="modalAlunoOcupacao">
                            ${ocupacaoHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-flag"></i> Nacionalidade</label>
                        <input id="modalAlunoNacionalidade" value="${data ? data.nacionalidade || 'BRASILEIRA' : 'BRASILEIRA'}" placeholder="Ex: BRASILEIRA">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Nome da Mãe</label>
                        <input id="modalAlunoMae" value="${data ? data.nome_mae || '' : ''}" placeholder="Nome completo da mãe">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Nome do Pai</label>
                        <input id="modalAlunoPai" value="${data ? data.nome_pai || '' : ''}" placeholder="Nome completo do pai">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Responsável</label>
                        <input id="modalAlunoResponsavel" value="${data ? data.responsavel || '' : ''}" placeholder="Nome do responsável">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-school"></i> Escola <span class="required">*</span></label>
                        <select id="modalAlunoEscola" onchange="carregarTurmasAluno()">
                            <option value="">Selecione uma escola</option>
                            ${escolaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-users"></i> Turma <span class="required">*</span></label>
                        <select id="modalAlunoTurma">
                            <option value="">Selecione a turma</option>
                            ${turmaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-map-marker-alt"></i> Endereço</label>
                        <input id="modalAlunoEndereco" value="${data ? data.endereco || '' : ''}" placeholder="Endereço completo">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-phone"></i> Telefone</label>
                        <input id="modalAlunoTelefone" value="${data ? data.telefone || '' : ''}" placeholder="(00) 00000-0000">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-info-circle"></i> Situação</label>
                        <select id="modalAlunoSituacao">
                            ${situacaoOptions}
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label><i class="fas fa-comment"></i> Observação</label>
                        <textarea id="modalAlunoObservacao" placeholder="Observações sobre o aluno">${data ? data.observacao || '' : ''}</textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarAluno(${data ? data.id : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            `;
            openModal('<i class="fas fa-user-graduate"></i> ' + title, html);
        }

        function carregarTurmasAluno() {
            const escolaId = document.getElementById('modalAlunoEscola').value;
            const select = document.getElementById('modalAlunoTurma');
            const turmasFiltradas = turmas.filter(t => t.escola_id == escolaId);
            select.innerHTML = '<option value="">Selecione a turma</option>' +
                turmasFiltradas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('');
        }

        async function salvarAluno(id = null) {
            const nome = document.getElementById('modalAlunoNome').value.trim();
            const escola_id = document.getElementById('modalAlunoEscola').value;
            const turma_id = document.getElementById('modalAlunoTurma').value;
            if (!nome) { showToast('Nome do aluno é obrigatório!', 'error'); return; }
            if (!escola_id) { showToast('Selecione uma escola!', 'error'); return; }
            if (!turma_id) { showToast('Selecione uma turma!', 'error'); return; }
            const data = {
                nome,
                inep_aluno: document.getElementById('modalAlunoInep').value.trim(),
                cpf: document.getElementById('modalAlunoCpf').value.trim(),
                data_nascimento: document.getElementById('modalAlunoDataNasc').value || null,
                sexo: document.getElementById('modalAlunoSexo').value,
                raca: document.getElementById('modalAlunoRaca').value,
                pais_nascimento: document.getElementById('modalAlunoPaisNasc').value.trim() || 'BRASIL',
                uf_nascimento: document.getElementById('modalAlunoUfNasc').value.trim().toUpperCase(),
                municipio_nascimento: document.getElementById('modalAlunoMunicipioNasc').value.trim(),
                zona_residencial: document.getElementById('modalAlunoZonaRes').value,
                pcd: document.getElementById('modalAlunoPcd').value,
                tipo_deficiencia: document.getElementById('modalAlunoTipoDef').value,
                cid: document.getElementById('modalAlunoCid').value.trim(),
                necessidade_especial: document.getElementById('modalAlunoNecessidade').value,
                transporte_escolar: parseInt(document.getElementById('modalAlunoTransporte').value) || 0,
                material_escolar: parseInt(document.getElementById('modalAlunoMaterial').value) || 0,
                uniforme: parseInt(document.getElementById('modalAlunoUniforme').value) || 0,
                bolsa_familia: parseInt(document.getElementById('modalAlunoBolsa').value) || 0,
                tipo_bolsa: document.getElementById('modalAlunoTipoBolsa').value,
                situacao_ocupacao: document.getElementById('modalAlunoOcupacao').value,
                nacionalidade: document.getElementById('modalAlunoNacionalidade').value.trim() || 'BRASILEIRA',
                nome_mae: document.getElementById('modalAlunoMae').value.trim(),
                nome_pai: document.getElementById('modalAlunoPai').value.trim(),
                responsavel: document.getElementById('modalAlunoResponsavel').value.trim(),
                escola_id,
                turma_id,
                endereco: document.getElementById('modalAlunoEndereco').value.trim(),
                telefone: document.getElementById('modalAlunoTelefone').value.trim(),
                situacao: document.getElementById('modalAlunoSituacao').value || 'CURSANDO',
                observacao: document.getElementById('modalAlunoObservacao').value.trim()
            };
            const method = id ? 'PUT' : 'POST';
            const result = await salvarDados('alunos', method, data, id);
            if (result) {
                closeModal();
                await recarregarEEspecifico('alunos');
                renderizarAlunos();
                atualizarDashboard();
                showToast('Aluno salvo!', 'success');
            }
        }

        async function renderizarAlunos() {
            const filtro = document.getElementById('filtroAluno').value.toLowerCase();
            const escolaFiltro = document.getElementById('filtroAlunoEscola').value;
            const turmaFiltro = document.getElementById('filtroAlunoTurma').value;
            let list = alunos;
            if (filtro) {
                list = list.filter(a => a.nome.toLowerCase().includes(filtro) || a.id.toString().includes(filtro));
            }
            if (escolaFiltro !== 'todas') {
                list = list.filter(a => a.escola_id == escolaFiltro);
            }
            if (turmaFiltro !== 'todas') {
                list = list.filter(a => a.turma_id == turmaFiltro);
            }
            const tbody = document.getElementById('tabelaAlunos');
            if (!list || list.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="13" style="text-align:center;color:#4a6a85;">Nenhum aluno cadastrado.</td></tr>';
                return;
            }
            let html = '';
            list.forEach(a => {
                const turma = turmas.find(t => t.id == a.turma_id);
                const pcdClass = a.pcd === 'SIM' ? 'sim' : 'nao';
                const dataNasc = a.data_nascimento ? new Date(a.data_nascimento).toLocaleDateString('pt-BR') : '-';
                const def = a.tipo_deficiencia || '-';
                html += `
                    <tr>
                        <td>${a.id}</td>
                        <td>${a.inep_aluno || '-'}</td>
                        <td><strong>${a.nome}</strong></td>
                        <td>${a.cpf || '-'}</td>
                        <td>${dataNasc}</td>
                        <td>${a.sexo || '-'}</td>
                        <td>${a.raca || '-'}</td>
                        <td>${turma ? turma.nome : 'N/I'}</td>
                        <td><span class="badge-pcd ${pcdClass}">${a.pcd || 'NÃO'}</span></td>
                        <td>${def}</td>
                        <td>${a.bolsa_familia == 1 ? '✅ SIM' : '❌ NÃO'}</td>
                        <td>${a.situacao || 'CURSANDO'}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="abrirModalAluno(alunos.find(x => x.id == ${a.id}))"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="excluirAluno(${a.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        async function excluirAluno(id) {
            const ok = await excluirDados('alunos', id);
            if (ok) {
                await recarregarEEspecifico('alunos');
                renderizarAlunos();
                atualizarDashboard();
            }
        }

        // ============================================================
        // GESTOR - COMPLETO INEP
        // ============================================================
        function abrirModalGestor(data = null) {
            const isEdit = !!data;
            const title = isEdit ? 'Editar Gestor' : 'Novo Gestor';
            const escolaOptions = escolas.map(e =>
                `<option value="${e.id}" ${data && data.escola_id == e.id ? 'selected' : ''}>${e.nome}</option>`
            ).join('');
            const html = `
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label><i class="fas fa-user-tie"></i> Nome <span class="required">*</span></label>
                        <input id="modalGestorNome" value="${data ? data.nome || '' : ''}" placeholder="Nome do gestor">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-id-card"></i> CPF</label>
                        <input id="modalGestorCpf" value="${data ? data.cpf || '' : ''}" placeholder="000.000.000-00" maxlength="14">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-alt"></i> Data de Nascimento</label>
                        <input id="modalGestorDataNasc" type="date" value="${data ? data.data_nascimento || '' : ''}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <input id="modalGestorEmail" value="${data ? data.email || '' : ''}" placeholder="gestor@email.com">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-briefcase"></i> Cargo</label>
                        <input id="modalGestorCargo" value="${data ? data.cargo || '' : ''}" placeholder="Ex: Diretor, Coordenador">
                    </div>
                    <div class="form-group full-width">
                        <label><i class="fas fa-school"></i> Escola <span class="required">*</span></label>
                        <select id="modalGestorEscola">
                            <option value="">Selecione uma escola</option>
                            ${escolaOptions}
                        </select>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarGestor(${data ? data.id : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            `;
            openModal('<i class="fas fa-user-tie"></i> ' + title, html);
        }

        async function salvarGestor(id = null) {
            const nome = document.getElementById('modalGestorNome').value.trim();
            if (!nome) { showToast('Nome do gestor é obrigatório!', 'error'); return; }
            const data = {
                nome,
                cpf: document.getElementById('modalGestorCpf').value.trim(),
                data_nascimento: document.getElementById('modalGestorDataNasc').value || null,
                email: document.getElementById('modalGestorEmail').value.trim(),
                cargo: document.getElementById('modalGestorCargo').value.trim(),
                escola_id: document.getElementById('modalGestorEscola').value || null
            };
            const method = id ? 'PUT' : 'POST';
            const result = await salvarDados('gestores', method, data, id);
            if (result) {
                closeModal();
                await recarregarEEspecifico('gestores');
                renderizarGestores();
                atualizarDashboard();
                showToast('Gestor salvo!', 'success');
            }
        }

        async function renderizarGestores() {
            const filtro = document.getElementById('filtroGestor').value.toLowerCase();
            const escolaFiltro = document.getElementById('filtroGestorEscola').value;
            let list = gestores;
            if (filtro) {
                list = list.filter(g => g.nome.toLowerCase().includes(filtro) || (g.cargo || '').toLowerCase().includes(
                filtro));
            }
            if (escolaFiltro !== 'todas') {
                list = list.filter(g => g.escola_id == escolaFiltro);
            }
            const tbody = document.getElementById('tabelaGestores');
            if (!list || list.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="7" style="text-align:center;color:#4a6a85;">Nenhum gestor cadastrado.</td></tr>';
                return;
            }
            let html = '';
            list.forEach(g => {
                const escola = escolas.find(e => e.id == g.escola_id);
                const dataNasc = g.data_nascimento ? new Date(g.data_nascimento).toLocaleDateString('pt-BR') : '-';
                html += `
                    <tr>
                        <td><strong>${g.nome}</strong></td>
                        <td>${g.cpf || '-'}</td>
                        <td>${dataNasc}</td>
                        <td>${g.email || '-'}</td>
                        <td>${g.cargo || '-'}</td>
                        <td>${escola ? escola.nome : 'N/I'}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="abrirModalGestor(gestores.find(x => x.id == ${g.id}))"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="excluirGestor(${g.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        async function excluirGestor(id) {
            const ok = await excluirDados('gestores', id);
            if (ok) {
                await recarregarEEspecifico('gestores');
                renderizarGestores();
                atualizarDashboard();
            }
        }

        // ============================================================
        // INFRAESTRUTURA - MANTIDO
        // ============================================================
        function abrirModalInfraestrutura(data = null) {
            const isEdit = !!data;
            const title = isEdit ? 'Editar Infraestrutura' : 'Nova Infraestrutura';
            const escolaOptions = escolas.map(e =>
                `<option value="${e.id}" ${data && data.escola_id == e.id ? 'selected' : ''}>${e.nome}</option>`
            ).join('');
            const html = `
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label><i class="fas fa-school"></i> Escola <span class="required">*</span></label>
                        <select id="modalInfraEscola">
                            <option value="">Selecione uma escola</option>
                            ${escolaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-alt"></i> Ano Referência <span class="required">*</span></label>
                        <input id="modalInfraAno" type="number" value="${data ? data.ano_referencia || '2026' : '2026'}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-door-open"></i> Salas de Aula</label>
                        <input id="modalInfraSalas" type="number" value="${data ? data.salas_aula || 0 : 0}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-laptop"></i> Laboratório Informática</label>
                        <select id="modalInfraLabInfo">
                            <option value="0" ${data && data.laboratorio_informatica == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.laboratorio_informatica == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-flask"></i> Laboratório Ciências</label>
                        <select id="modalInfraLabCien">
                            <option value="0" ${data && data.laboratorio_ciencias == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.laboratorio_ciencias == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-robot"></i> Laboratório Robótica</label>
                        <select id="modalInfraLabRobo">
                            <option value="0" ${data && data.laboratorio_robotica == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.laboratorio_robotica == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-book"></i> Biblioteca</label>
                        <select id="modalInfraBiblioteca">
                            <option value="0" ${data && data.biblioteca == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.biblioteca == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-futbol"></i> Quadra Esportes</label>
                        <select id="modalInfraQuadra">
                            <option value="0" ${data && data.quadra_esportes == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.quadra_esportes == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-utensils"></i> Cantina</label>
                        <select id="modalInfraCantina">
                            <option value="0" ${data && data.cantina == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.cantina == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-wifi"></i> Internet</label>
                        <select id="modalInfraInternet">
                            <option value="0" ${data && data.internet == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.internet == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-wheelchair"></i> Acessibilidade</label>
                        <select id="modalInfraAcessibilidade">
                            <option value="0" ${data && data.acessibilidade == 0 ? 'selected' : ''}>Não</option>
                            <option value="1" ${data && data.acessibilidade == 1 ? 'selected' : ''}>Sim</option>
                        </select>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarInfraestrutura(${data ? data.id : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            `;
            openModal('<i class="fas fa-tools"></i> ' + title, html);
        }

        async function salvarInfraestrutura(id = null) {
            const escola_id = document.getElementById('modalInfraEscola').value;
            const ano_referencia = document.getElementById('modalInfraAno').value;
            if (!escola_id) { showToast('Selecione uma escola!', 'error'); return; }
            if (!ano_referencia) { showToast('Informe o ano de referência!', 'error'); return; }
            const data = {
                escola_id: escola_id,
                ano_referencia: parseInt(ano_referencia),
                salas_aula: parseInt(document.getElementById('modalInfraSalas').value) || 0,
                laboratorio_informatica: parseInt(document.getElementById('modalInfraLabInfo').value),
                laboratorio_ciencias: parseInt(document.getElementById('modalInfraLabCien').value),
                laboratorio_robotica: parseInt(document.getElementById('modalInfraLabRobo').value),
                biblioteca: parseInt(document.getElementById('modalInfraBiblioteca').value),
                quadra_esportes: parseInt(document.getElementById('modalInfraQuadra').value),
                cantina: parseInt(document.getElementById('modalInfraCantina').value),
                internet: parseInt(document.getElementById('modalInfraInternet').value),
                acessibilidade: parseInt(document.getElementById('modalInfraAcessibilidade').value)
            };
            const method = id ? 'PUT' : 'POST';
            const result = await salvarDados('infraestrutura', method, data, id);
            if (result) {
                closeModal();
                await recarregarEEspecifico('infraestrutura');
                renderizarInfraestrutura();
                showToast('Infraestrutura salva com sucesso!', 'success');
            }
        }

        async function renderizarInfraestrutura() {
            const escolaFiltro = document.getElementById('filtroInfraEscola').value;
            const anoFiltro = document.getElementById('filtroInfraAno').value;
            let list = infraestrutura;
            if (escolaFiltro !== 'todas') {
                list = list.filter(i => i.escola_id == escolaFiltro);
            }
            if (anoFiltro) {
                list = list.filter(i => i.ano_referencia == anoFiltro);
            }
            const tbody = document.getElementById('tabelaInfraestrutura');
            if (!list || list.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="11" style="text-align:center;color:#4a6a85;">Nenhum registro de infraestrutura cadastrado.</td></tr>';
                return;
            }
            let html = '';
            list.forEach(i => {
                const escola = escolas.find(e => e.id == i.escola_id);
                html += `
                    <tr>
                        <td>${escola ? escola.nome : 'N/I'}</td>
                        <td>${i.ano_referencia}</td>
                        <td>${i.salas_aula}</td>
                        <td>${i.laboratorio_informatica ? '✅' : '❌'}</td>
                        <td>${i.laboratorio_ciencias ? '✅' : '❌'}</td>
                        <td>${i.laboratorio_robotica ? '✅' : '❌'}</td>
                        <td>${i.biblioteca ? '✅' : '❌'}</td>
                        <td>${i.quadra_esportes ? '✅' : '❌'}</td>
                        <td>${i.internet ? '✅' : '❌'}</td>
                        <td>${i.acessibilidade ? '✅' : '❌'}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="abrirModalInfraestrutura(infraestrutura.find(x => x.id == ${i.id}))"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="excluirInfraestrutura(${i.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        async function excluirInfraestrutura(id) {
            const ok = await excluirDados('infraestrutura', id);
            if (ok) {
                await recarregarEEspecifico('infraestrutura');
                renderizarInfraestrutura();
            }
        }

        // ============================================================
        // FREQUÊNCIA - MANTIDO
        // ============================================================
        function carregarDependenciasFrequencia() {
            const selectEscola = document.getElementById('freqFiltroEscola');
            if (selectEscola) {
                const current = selectEscola.value;
                selectEscola.innerHTML = '<option value="todas">Todas as Escolas</option>';
                escolas.forEach(e => {
                    selectEscola.innerHTML += `<option value="${e.id}">${e.nome}</option>`;
                });
                selectEscola.value = current;
            }
            carregarTurmasFrequencia();
            const selectProfessor = document.getElementById('freqFiltroProfessor');
            if (selectProfessor) {
                const current = selectProfessor.value;
                selectProfessor.innerHTML = '<option value="todos">Todos os Professores</option>';
                professores.forEach(p => {
                    selectProfessor.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
                });
                selectProfessor.value = current;
            }
            const selectDisciplina = document.getElementById('freqFiltroDisciplina');
            if (selectDisciplina) {
                const current = selectDisciplina.value;
                selectDisciplina.innerHTML = '<option value="todas">Todas as Disciplinas</option>';
                disciplinas.forEach(d => {
                    selectDisciplina.innerHTML += `<option value="${d.id}">${d.nome}</option>`;
                });
                selectDisciplina.value = current;
            }
        }

        function carregarTurmasFrequencia() {
            const escolaId = document.getElementById('freqFiltroEscola').value;
            const select = document.getElementById('freqFiltroTurma');
            if (!select) return;
            const current = select.value;
            const turmasFiltradas = escolaId !== 'todas' ? turmas.filter(t => t.escola_id == escolaId) : turmas;
            select.innerHTML = '<option value="todas">Todas as Turmas</option>';
            turmasFiltradas.forEach(t => {
                select.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
            });
            select.value = current;
        }

        async function renderizarPlanilha() {
            const escolaId = document.getElementById('freqFiltroEscola').value;
            const turmaId = document.getElementById('freqFiltroTurma').value;
            const professorId = document.getElementById('freqFiltroProfessor').value;
            const disciplinaId = document.getElementById('freqFiltroDisciplina').value;
            const turno = document.getElementById('freqFiltroTurno').value;
            const serie = document.getElementById('freqFiltroSerie').value;
            const mes = document.getElementById('freqFiltroMes').value;

            let alunosFiltrados = alunos.slice();

            if (escolaId !== 'todas') alunosFiltrados = alunosFiltrados.filter(a => a.escola_id == escolaId);
            if (turmaId !== 'todas') alunosFiltrados = alunosFiltrados.filter(a => a.turma_id == turmaId);
            if (turno !== 'todos') {
                const turmasFiltradas = turmas.filter(t => t.turno === turno);
                const turmasIds = turmasFiltradas.map(t => t.id);
                alunosFiltrados = alunosFiltrados.filter(a => turmasIds.includes(a.turma_id));
            }
            if (serie !== 'todas') {
                const turmasFiltradas = turmas.filter(t => t.ano === serie);
                const turmasIds = turmasFiltradas.map(t => t.id);
                alunosFiltrados = alunosFiltrados.filter(a => turmasIds.includes(a.turma_id));
            }
            if (professorId !== 'todos') {
                const turmasFiltradas = turmas.filter(t => t.professor_id == professorId);
                const turmasIds = turmasFiltradas.map(t => t.id);
                alunosFiltrados = alunosFiltrados.filter(a => turmasIds.includes(a.turma_id));
            }
            if (disciplinaId !== 'todas') {
                const disciplina = disciplinas.find(d => d.id == disciplinaId);
                if (disciplina) {
                    alunosFiltrados = alunosFiltrados.filter(a => a.escola_id == disciplina.escola_id);
                }
            }

            const tbody = document.getElementById('planilhaBody');
            const thead = document.getElementById('planilhaHead');

            if (!alunosFiltrados.length) {
                thead.innerHTML = '';
                tbody.innerHTML =
                    '<tr><td colspan="1" style="text-align:center;color:#4a6a85;">Nenhum aluno encontrado com os filtros selecionados.</td></tr>';
                document.getElementById('resumoAlunos').textContent = 0;
                document.getElementById('resumoPresentes').textContent = 0;
                document.getElementById('resumoFaltas').textContent = 0;
                return;
            }

            const hoje = new Date();
            const ano = mes ? mes.split('-')[0] : hoje.getFullYear().toString();
            const mesNum = mes ? mes.split('-')[1] : String(hoje.getMonth() + 1).padStart(2, '0');
            const diasNoMes = new Date(parseInt(ano), parseInt(mesNum), 0).getDate();
            const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

            let headerHtml = '<tr><th class="aluno-header">Aluno</th>';
            for (let d = 1; d <= diasNoMes; d++) {
                const dataStr = ano + '-' + mesNum + '-' + String(d).padStart(2, '0');
                const diaSemana = new Date(parseInt(ano), parseInt(mesNum) - 1, d).getDay();
                const isWeekend = diaSemana === 0 || diaSemana === 6;
                headerHtml +=
                    `<th class="dia-header" style="${isWeekend ? 'background:#f0e6d3;' : ''}">${String(d).padStart(2, '0')}<br><small>${diasSemana[diaSemana]}</small></th>`;
            }
            headerHtml += '<th>% Pres.</th></tr>';
            thead.innerHTML = headerHtml;

            let bodyHtml = '';
            let totalPresentes = 0;
            let totalFaltas = 0;

            for (const aluno of alunosFiltrados) {
                bodyHtml += `<tr><td class="aluno-nome">${aluno.nome} <span class="aluno-id">#${aluno.id}</span></td>`;
                let presentes = 0;
                let diasLetivos = 0;

                for (let d = 1; d <= diasNoMes; d++) {
                    const dataStr = ano + '-' + mesNum + '-' + String(d).padStart(2, '0');
                    const diaSemana = new Date(parseInt(ano), parseInt(mesNum) - 1, d).getDay();
                    const isWeekend = diaSemana === 0 || diaSemana === 6;

                    if (isWeekend) {
                        bodyHtml += '<td style="background:#fafafa;color:#ccc;">-</td>';
                        continue;
                    }

                    diasLetivos++;
                    const key = aluno.id + '_' + dataStr;
                    let freq = frequenciasPlanilha[key] || null;

                    if (!freq) {
                        const freqBanco = frequencias.find(f => f.aluno_id == aluno.id && f.data === dataStr);
                        if (freqBanco) {
                            freq = freqBanco;
                            frequenciasPlanilha[key] = freq;
                        }
                    }

                    let cellClass = 'celula-freq vazio';
                    let cellContent = '-';

                    if (freq && (freq === 'P' || freq.status === 'P')) {
                        presentes++;
                        cellClass = 'celula-freq presente';
                        cellContent = 'P';
                    } else if (freq && (freq === 'F' || freq.status === 'F')) {
                        cellClass = 'celula-freq falta';
                        cellContent = 'F';
                        if (freq.justificativa) {
                            cellClass += ' has-justificativa';
                        }
                    }

                    if (freq && freq.justificativa) {
                        bodyHtml +=
                            `<td><div class="${cellClass}" title="${freq.justificativa}" onclick="toggleFrequencia('${aluno.id}','${dataStr}')">${cellContent}<span class="just-icon">📝</span></div></td>`;
                    } else {
                        bodyHtml +=
                            `<td><div class="${cellClass}" onclick="toggleFrequencia('${aluno.id}','${dataStr}')">${cellContent}</div></td>`;
                    }
                }

                const perc = diasLetivos > 0 ? Math.round((presentes / diasLetivos) * 100) : 0;
                bodyHtml += `<td><strong>${perc}%</strong></td></tr>`;
                totalPresentes += presentes;
                totalFaltas += diasLetivos - presentes;
            }

            tbody.innerHTML = bodyHtml;

            document.getElementById('resumoAlunos').textContent = alunosFiltrados.length;
            document.getElementById('resumoPresentes').textContent = totalPresentes;
            document.getElementById('resumoFaltas').textContent = totalFaltas;
        }

        function toggleFrequencia(alunoId, data) {
            const key = alunoId + '_' + data;
            const current = frequenciasPlanilha[key];

            if (!current || current === '-' || (current.status === undefined && current === '-')) {
                frequenciasPlanilha[key] = 'P';
            } else if (current === 'P' || current.status === 'P') {
                const justificativa = prompt('Adicione uma justificativa para a falta:');
                if (justificativa !== null && justificativa.trim() !== '') {
                    frequenciasPlanilha[key] = { status: 'F', justificativa: justificativa.trim() };
                } else {
                    frequenciasPlanilha[key] = 'F';
                }
            } else {
                frequenciasPlanilha[key] = '-';
            }
            renderizarPlanilha();
        }

        async function salvarFrequenciasPlanilha() {
            const dados = Object.keys(frequenciasPlanilha).map(key => {
                const parts = key.split('_');
                const aluno_id = parts[0];
                const data = parts[1];
                const value = frequenciasPlanilha[key];
                const status = typeof value === 'object' ? value.status : value;
                const justificativa = typeof value === 'object' ? value.justificativa : null;
                return { aluno_id, data, status, justificativa };
            }).filter(f => f.status !== '-');

            if (dados.length === 0) {
                showToast('Nenhuma frequência para salvar', 'info');
                return;
            }

            const result = await salvarDados('frequencias', 'POST', { frequencias: dados });
            if (result) {
                showToast('Frequências salvas!', 'success');
                await recarregarEEspecifico('frequencias');
                renderizarPlanilha();
            }
        }

        async function limparFrequenciasPlanilha() {
            if (!confirm('Deseja limpar todas as frequências da planilha atual?')) return;
            const escolaId = document.getElementById('freqFiltroEscola').value;
            const turmaId = document.getElementById('freqFiltroTurma').value;
            const mes = document.getElementById('freqFiltroMes').value;

            let alunosFiltrados = alunos.slice();
            if (escolaId !== 'todas') alunosFiltrados = alunosFiltrados.filter(a => a.escola_id == escolaId);
            if (turmaId !== 'todas') alunosFiltrados = alunosFiltrados.filter(a => a.turma_id == turmaId);

            const hoje = new Date();
            const ano = mes ? mes.split('-')[0] : hoje.getFullYear().toString();
            const mesNum = mes ? mes.split('-')[1] : String(hoje.getMonth() + 1).padStart(2, '0');
            const diasNoMes = new Date(parseInt(ano), parseInt(mesNum), 0).getDate();

            for (const aluno of alunosFiltrados) {
                for (let d = 1; d <= diasNoMes; d++) {
                    const dataStr = ano + '-' + mesNum + '-' + String(d).padStart(2, '0');
                    const key = aluno.id + '_' + dataStr;
                    delete frequenciasPlanilha[key];
                }
            }
            renderizarPlanilha();
            showToast('Frequências limpas!', 'info');
        }

        // ============================================================
        // NOTA - MANTIDO
        // ============================================================
        function abrirModalNota(data = null) {
            const isEdit = !!data;
            const title = isEdit ? 'Editar Nota' : 'Lançar Nota';
            const alunoOptions = alunos.map(a =>
                `<option value="${a.id}" ${data && data.aluno_id == a.id ? 'selected' : ''}>${a.nome}</option>`
            ).join('');
            const disciplinaOptions = disciplinas.map(d =>
                `<option value="${d.id}" ${data && data.disciplina_id == d.id ? 'selected' : ''}>${d.nome}</option>`
            ).join('');
            const html = `
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label><i class="fas fa-user-graduate"></i> Aluno <span class="required">*</span></label>
                        <select id="modalNotaAluno">
                            <option value="">Selecione um aluno</option>
                            ${alunoOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-book"></i> Disciplina <span class="required">*</span></label>
                        <select id="modalNotaDisciplina">
                            <option value="">Selecione uma disciplina</option>
                            ${disciplinaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-star"></i> Nota <span class="required">*</span></label>
                        <input id="modalNotaValor" type="number" step="0.5" min="0" max="10" value="${data ? data.valor || '' : ''}" placeholder="0 a 10">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-layer-group"></i> Bimestre <span class="required">*</span></label>
                        <select id="modalNotaBimestre">
                            <option value="1" ${data && data.bimestre === 1 ? 'selected' : ''}>1° Bimestre</option>
                            <option value="2" ${data && data.bimestre === 2 ? 'selected' : ''}>2° Bimestre</option>
                            <option value="3" ${data && data.bimestre === 3 ? 'selected' : ''}>3° Bimestre</option>
                            <option value="4" ${data && data.bimestre === 4 ? 'selected' : ''}>4° Bimestre</option>
                        </select>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarNota(${data ? data.id : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            `;
            openModal('<i class="fas fa-star"></i> ' + title, html);
        }

        async function salvarNota(id = null) {
            const aluno_id = document.getElementById('modalNotaAluno').value;
            const disciplina_id = document.getElementById('modalNotaDisciplina').value;
            const valor = parseFloat(document.getElementById('modalNotaValor').value);
            const bimestre = parseInt(document.getElementById('modalNotaBimestre').value);

            if (!aluno_id) { showToast('Selecione um aluno!', 'error'); return; }
            if (!disciplina_id) { showToast('Selecione uma disciplina!', 'error'); return; }
            if (isNaN(valor) || valor < 0 || valor > 10) { showToast('Nota deve ser entre 0 e 10!', 'error'); return; }

            const data = { aluno_id, disciplina_id, valor, bimestre };
            const method = id ? 'PUT' : 'POST';
            const result = await salvarDados('notas', method, data, id);
            if (result) {
                closeModal();
                await recarregarEEspecifico('notas');
                renderizarNotas();
                showToast('Nota salva!', 'success');
            }
        }

        async function renderizarNotas() {
            const filtro = document.getElementById('filtroNota').value.toLowerCase();
            const bimestreFiltro = document.getElementById('filtroNotaBimestre').value;
            let list = notas;
            if (bimestreFiltro) {
                list = list.filter(n => n.bimestre === parseInt(bimestreFiltro));
            }
            if (filtro) {
                list = list.filter(n => {
                    const aluno = alunos.find(a => a.id == n.aluno_id);
                    const disciplina = disciplinas.find(d => d.id == n.disciplina_id);
                    return (aluno ? aluno.nome : '').toLowerCase().includes(filtro) ||
                        (disciplina ? disciplina.nome : '').toLowerCase().includes(filtro);
                });
            }
            const tbody = document.getElementById('tabelaNotas');
            if (!list || list.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="6" style="text-align:center;color:#4a6a85;">Nenhuma nota lançada.</td></tr>';
                return;
            }
            let html = '';
            list.forEach(n => {
                const aluno = alunos.find(a => a.id == n.aluno_id);
                const disciplina = disciplinas.find(d => d.id == n.disciplina_id);
                const escola = escolas.find(e => e.id == (aluno ? aluno.escola_id : null));
                html += `
                    <tr>
                        <td>${aluno ? aluno.nome : 'N/I'}</td>
                        <td>${escola ? escola.nome : 'N/I'}</td>
                        <td>${disciplina ? disciplina.nome : 'N/I'}</td>
                        <td><strong>${n.valor.toFixed(1)}</strong></td>
                        <td>${n.bimestre}° Bimestre</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="abrirModalNota(notas.find(x => x.id == ${n.id}))"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="excluirNota(${n.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        async function excluirNota(id) {
            const ok = await excluirDados('notas', id);
            if (ok) {
                await recarregarEEspecifico('notas');
                renderizarNotas();
            }
        }

        // ============================================================
        // CONTEÚDO - MANTIDO
        // ============================================================
        function abrirModalConteudo(data = null) {
            const isEdit = !!data;
            const title = isEdit ? 'Editar Conteúdo' : 'Novo Conteúdo';
            const disciplinaOptions = disciplinas.map(d =>
                `<option value="${d.id}" ${data && data.disciplina_id == d.id ? 'selected' : ''}>${d.nome}</option>`
            ).join('');
            const escolaOptions = escolas.map(e =>
                `<option value="${e.id}" ${data && data.escola_id == e.id ? 'selected' : ''}>${e.nome}</option>`
            ).join('');
            const html = `
                <div class="form-grid">
                    <div class="form-group">
                        <label><i class="fas fa-book"></i> Disciplina <span class="required">*</span></label>
                        <select id="modalConteudoDisciplina">
                            <option value="">Selecione uma disciplina</option>
                            ${disciplinaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-school"></i> Escola <span class="required">*</span></label>
                        <select id="modalConteudoEscola">
                            <option value="">Selecione uma escola</option>
                            ${escolaOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar-alt"></i> Data</label>
                        <input id="modalConteudoData" type="date" value="${data ? data.data || '' : ''}">
                    </div>
                    <div class="form-group full-width">
                        <label><i class="fas fa-file-alt"></i> Conteúdo <span class="required">*</span></label>
                        <textarea id="modalConteudoDescricao" placeholder="Descrição do conteúdo">${data ? data.descricao || '' : ''}</textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="salvarConteudo(${data ? data.id : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            `;
            openModal('<i class="fas fa-book-open"></i> ' + title, html);
        }

        async function salvarConteudo(id = null) {
            const disciplina_id = document.getElementById('modalConteudoDisciplina').value;
            const escola_id = document.getElementById('modalConteudoEscola').value;
            const descricao = document.getElementById('modalConteudoDescricao').value.trim();
            if (!disciplina_id) { showToast('Selecione uma disciplina!', 'error'); return; }
            if (!escola_id) { showToast('Selecione uma escola!', 'error'); return; }
            if (!descricao) { showToast('Descreva o conteúdo!', 'error'); return; }
            const data = {
                disciplina_id,
                escola_id,
                data: document.getElementById('modalConteudoData').value || null,
                descricao
            };
            const method = id ? 'PUT' : 'POST';
            const result = await salvarDados('conteudos', method, data, id);
            if (result) {
                closeModal();
                await recarregarEEspecifico('conteudos');
                renderizarConteudos();
                showToast('Conteúdo salvo!', 'success');
            }
        }

        async function renderizarConteudos() {
            const filtro = document.getElementById('filtroConteudo').value.toLowerCase();
            const dataFiltro = document.getElementById('filtroConteudoData').value;
            let list = conteudos;
            if (dataFiltro) {
                list = list.filter(c => c.data === dataFiltro);
            }
            if (filtro) {
                list = list.filter(c => {
                    const disciplina = disciplinas.find(d => d.id == c.disciplina_id);
                    return (disciplina ? disciplina.nome : '').toLowerCase().includes(filtro);
                });
            }
            const tbody = document.getElementById('tabelaConteudo');
            if (!list || list.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="5" style="text-align:center;color:#4a6a85;">Nenhum conteúdo cadastrado.</td></tr>';
                return;
            }
            let html = '';
            list.forEach(c => {
                const disciplina = disciplinas.find(d => d.id == c.disciplina_id);
                const escola = escolas.find(e => e.id == c.escola_id);
                html += `
                    <tr>
                        <td>${disciplina ? disciplina.nome : 'N/I'}</td>
                        <td>${escola ? escola.nome : 'N/I'}</td>
                        <td>${c.data || '-'}</td>
                        <td>${c.descricao || '-'}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="abrirModalConteudo(conteudos.find(x => x.id == ${c.id}))"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="excluirConteudo(${c.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        async function excluirConteudo(id) {
            const ok = await excluirDados('conteudos', id);
            if (ok) {
                await recarregarEEspecifico('conteudos');
                renderizarConteudos();
            }
        }

        // ============================================================
        // RELATÓRIOS - MANTIDO
        // ============================================================
        function gerarRelatorio(tipo) {
            const output = document.getElementById('relatorioOutput');
            const escolaId = document.getElementById('filtroRelEscola').value;
            const turmaId = document.getElementById('filtroRelTurma').value;
            const professorId = document.getElementById('filtroRelProfessor').value;
            const alunoId = document.getElementById('filtroRelAluno').value;
            const bimestre = document.getElementById('filtroRelBimestre').value;
            const status = document.getElementById('filtroRelStatus').value;
            const dataInicio = document.getElementById('filtroRelDataInicio').value;
            const dataFim = document.getElementById('filtroRelDataFim').value;

            let html = '<h4 style="color:#0a2a44;margin-bottom:12px;"><i class="fas fa-file-alt"></i> Relatório Gerado</h4>';

            if (tipo === 'turmas' || !tipo) {
                let list = turmas.slice();
                if (escolaId !== 'todas') list = list.filter(t => t.escola_id == escolaId);
                if (professorId !== 'todos') list = list.filter(t => t.professor_id == professorId);
                html +=
                    '<table><thead><tr><th>Turma</th><th>INEP</th><th>Modalidade</th><th>Ano</th><th>Turno</th><th>Professor</th><th>Alunos</th><th>Escola</th></tr></thead><tbody>';
                list.forEach(t => {
                    const prof = professores.find(p => p.id == t.professor_id);
                    const escola = escolas.find(e => e.id == t.escola_id);
                    const count = alunos.filter(a => a.turma_id == t.id).length;
                    const modalidade = t.modalidade ? t.modalidade.replace(/_/g, ' ') : '-';
                    html +=
                        `<tr><td>${t.nome}</td><td>${t.inep_turma || '-'}</td><td>${modalidade}</td><td>${t.ano || '-'}</td><td>${t.turno || '-'}</td><td>${prof ? prof.nome : 'N/I'}</td><td>${count}</td><td>${escola ? escola.nome : 'N/I'}</td></tr>`;
                });
                html += '</tbody></table>';
                html += `<p style="margin-top:10px;color:#4a6a85;">Total: ${list.length} turmas</p>`;
            }

            if (tipo === 'frequencia') {
                let list = frequencias.slice();
                if (dataInicio) list = list.filter(f => f.data >= dataInicio);
                if (dataFim) list = list.filter(f => f.data <= dataFim);
                if (status !== 'todos') list = list.filter(f => f.status === status);
                if (alunoId !== 'todos') list = list.filter(f => f.aluno_id == alunoId);
                html +=
                    '<table><thead><tr><th>Aluno</th><th>Data</th><th>Status</th><th>Justificativa</th></tr></thead><tbody>';
                list.forEach(f => {
                    const aluno = alunos.find(a => a.id == f.aluno_id);
                    html +=
                        `<tr><td>${aluno ? aluno.nome : 'N/I'}</td><td>${f.data}</td><td>${f.status === 'P' ? '✅ Presente' : '❌ Falta'}</td><td>${f.justificativa || '-'}</td></tr>`;
                });
                html += '</tbody></table>';
                html += `<p style="margin-top:10px;color:#4a6a85;">Total: ${list.length} registros</p>`;
            }

            if (tipo === 'notas') {
                let list = notas.slice();
                if (bimestre !== 'todos') list = list.filter(n => n.bimestre === parseInt(bimestre));
                if (alunoId !== 'todos') list = list.filter(n => n.aluno_id == alunoId);
                html +=
                    '<table><thead><tr><th>Aluno</th><th>Disciplina</th><th>Nota</th><th>Bimestre</th></tr></thead><tbody>';
                list.forEach(n => {
                    const aluno = alunos.find(a => a.id == n.aluno_id);
                    const disc = disciplinas.find(d => d.id == n.disciplina_id);
                    html +=
                        `<tr><td>${aluno ? aluno.nome : 'N/I'}</td><td>${disc ? disc.nome : 'N/I'}</td><td><strong>${n.valor.toFixed(1)}</strong></td><td>${n.bimestre}°</td></tr>`;
                });
                html += '</tbody></table>';
                html += `<p style="margin-top:10px;color:#4a6a85;">Total: ${list.length} notas</p>`;
            }

            if (tipo === 'professores') {
                let list = professores.slice();
                if (escolaId !== 'todas') list = list.filter(p => p.escola_id == escolaId);
                html +=
                    '<table><thead><tr><th>Nome</th><th>CPF</th><th>Data Nasc.</th><th>Sexo</th><th>Raça</th><th>Email</th><th>Escola</th></tr></thead><tbody>';
                list.forEach(p => {
                    const escola = escolas.find(e => e.id == p.escola_id);
                    const dataNasc = p.data_nascimento ? new Date(p.data_nascimento).toLocaleDateString('pt-BR') :
                    '-';
                    html +=
                        `<tr><td>${p.nome}</td><td>${p.cpf || '-'}</td><td>${dataNasc}</td><td>${p.sexo || '-'}</td><td>${p.raca || '-'}</td><td>${p.email || '-'}</td><td>${escola ? escola.nome : 'N/I'}</td></tr>`;
                });
                html += '</tbody></table>';
                html += `<p style="margin-top:10px;color:#4a6a85;">Total: ${list.length} professores</p>`;
            }

            if (tipo === 'funcionarios') {
                let list = funcionarios.slice();
                if (escolaId !== 'todas') list = list.filter(f => f.escola_id == escolaId);
                html += `
                    <table><thead>
                        <tr><th>Nome</th><th>INEP</th><th>CPF</th><th>Data Nasc.</th><th>Cargo</th><th>Escola</th><th>PCD</th><th>CNH</th><th>Título</th></tr>
                    </thead><tbody>`;
                list.forEach(f => {
                    const escola = escolas.find(e => e.id == f.escola_id);
                    const dataNasc = f.data_nascimento ? new Date(f.data_nascimento).toLocaleDateString('pt-BR') : '-';
                    html += `
                        <tr>
                            <td>${f.nome}</td>
                            <td>${f.inep || '-'}</td>
                            <td>${f.cpf || '-'}</td>
                            <td>${dataNasc}</td>
                            <td>${f.cargo || '-'}</td>
                            <td>${escola ? escola.nome : 'N/I'}</td>
                            <td>${f.pcd || 'NÃO'}</td>
                            <td>${f.cnh ? '✅' : '❌'}</td>
                            <td>${f.titulo_eleitor ? '✅' : '❌'}</td>
                        </tr>
                    `;
                });
                html += '</tbody></table>';
                html += `<p style="margin-top:10px;color:#4a6a85;">Total: ${list.length} funcionários</p>`;
            }

            if (tipo === 'alunos') {
                let list = alunos.slice();
                if (escolaId !== 'todas') list = list.filter(a => a.escola_id == escolaId);
                if (turmaId !== 'todas') list = list.filter(a => a.turma_id == turmaId);
                html +=
                    '<table><thead><tr><th>ID</th><th>INEP</th><th>Nome</th><th>CPF</th><th>Data Nasc.</th><th>Sexo</th><th>Raça</th><th>Turma</th><th>PCD</th><th>Bolsa Fam.</th><th>Situação</th></tr></thead><tbody>';
                list.forEach(a => {
                    const turma = turmas.find(t => t.id == a.turma_id);
                    const dataNasc = a.data_nascimento ? new Date(a.data_nascimento).toLocaleDateString('pt-BR') :
                        '-';
                    html +=
                        `<tr><td>${a.id}</td><td>${a.inep_aluno || '-'}</td><td>${a.nome}</td><td>${a.cpf || '-'}</td><td>${dataNasc}</td><td>${a.sexo || '-'}</td><td>${a.raca || '-'}</td><td>${turma ? turma.nome : 'N/I'}</td><td>${a.pcd || 'NÃO'}</td><td>${a.bolsa_familia == 1 ? '✅ SIM' : '❌ NÃO'}</td><td>${a.situacao || 'CURSANDO'}</td></tr>`;
                });
                html += '</tbody></table>';
                html += `<p style="margin-top:10px;color:#4a6a85;">Total: ${list.length} alunos</p>`;
            }

            if (tipo === 'gestores') {
                let list = gestores.slice();
                if (escolaId !== 'todas') list = list.filter(g => g.escola_id == escolaId);
                html +=
                    '<table><thead><tr><th>Nome</th><th>CPF</th><th>Data Nasc.</th><th>Email</th><th>Cargo</th><th>Escola</th></tr></thead><tbody>';
                list.forEach(g => {
                    const escola = escolas.find(e => e.id == g.escola_id);
                    const dataNasc = g.data_nascimento ? new Date(g.data_nascimento).toLocaleDateString('pt-BR') :
                        '-';
                    html +=
                        `<tr><td>${g.nome}</td><td>${g.cpf || '-'}</td><td>${dataNasc}</td><td>${g.email || '-'}</td><td>${g.cargo || '-'}</td><td>${escola ? escola.nome : 'N/I'}</td></tr>`;
                });
                html += '</tbody></table>';
                html += `<p style="margin-top:10px;color:#4a6a85;">Total: ${list.length} gestores</p>`;
            }

            if (tipo === 'infraestrutura') {
                let list = infraestrutura.slice();
                if (escolaId !== 'todas') list = list.filter(i => i.escola_id == escolaId);
                html +=
                    '<table><thead><tr><th>Escola</th><th>Ano</th><th>Salas</th><th>Lab. Info</th><th>Lab. Ciências</th><th>Lab. Robótica</th><th>Biblioteca</th><th>Quadra</th><th>Internet</th><th>Acessibilidade</th></tr></thead><tbody>';
                list.forEach(i => {
                    const escola = escolas.find(e => e.id == i.escola_id);
                    html +=
                        `<tr><td>${escola ? escola.nome : 'N/I'}</td><td>${i.ano_referencia}</td><td>${i.salas_aula}</td><td>${i.laboratorio_informatica ? '✅' : '❌'}</td><td>${i.laboratorio_ciencias ? '✅' : '❌'}</td><td>${i.laboratorio_robotica ? '✅' : '❌'}</td><td>${i.biblioteca ? '✅' : '❌'}</td><td>${i.quadra_esportes ? '✅' : '❌'}</td><td>${i.internet ? '✅' : '❌'}</td><td>${i.acessibilidade ? '✅' : '❌'}</td></tr>`;
                });
                html += '</tbody></table>';
                html += `<p style="margin-top:10px;color:#4a6a85;">Total: ${list.length} registros</p>`;
            }

            output.innerHTML = html;
            showToast('Relatório gerado!', 'success');
        }

        function limparFiltrosRelatorio() {
            document.getElementById('filtroRelEscola').value = 'todas';
            document.getElementById('filtroRelTurma').value = 'todas';
            document.getElementById('filtroRelProfessor').value = 'todos';
            document.getElementById('filtroRelAluno').value = 'todos';
            document.getElementById('filtroRelBimestre').value = 'todos';
            document.getElementById('filtroRelStatus').value = 'todos';
            document.getElementById('filtroRelDataInicio').value = '';
            document.getElementById('filtroRelDataFim').value = '';
            document.getElementById('relatorioOutput').innerHTML =
                '<p style="color:#3b5f7a;"><i class="fas fa-info-circle"></i> Filtros limpos. Clique em "Gerar Relatório".</p>';
            showToast('Filtros limpos!', 'info');
        }

        function exportarHTML() {
            const content = document.getElementById('relatorioOutput').innerHTML;
            if (!content || content.includes('Selecione os filtros')) {
                showToast('Gere um relatório primeiro!', 'error');
                return;
            }
            const blob = new Blob(
                [
                    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório</title><style>body{font-family:sans-serif;padding:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:8px;text-align:left;}th{background:#f0f0f0;}</style></head><body>' +
                    content + '</body></html>'
                ], { type: 'text/html' });
            const link = document.createElement('a');
            link.download = 'relatorio.html';
            link.href = URL.createObjectURL(blob);
            link.click();
            showToast('HTML exportado!', 'success');
        }

        function exportarCSV() {
            const content = document.getElementById('relatorioOutput').innerHTML;
            if (!content || content.includes('Selecione os filtros')) {
                showToast('Gere um relatório primeiro!', 'error');
                return;
            }
            const temp = document.createElement('div');
            temp.innerHTML = content;
            const table = temp.querySelector('table');
            if (!table) { showToast('Nenhuma tabela para exportar!', 'error'); return; }
            let csv = '';
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const cols = row.querySelectorAll('th, td');
                const values = [];
                cols.forEach(c => values.push('"' + c.textContent.trim().replace(/"/g, '""') + '"'));
                csv += values.join(',') + '\n';
            });
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.download = 'relatorio.csv';
            link.href = URL.createObjectURL(blob);
            link.click();
            showToast('CSV exportado!', 'success');
        }

        function exportarPDF() {
            showToast('Função PDF: Use Ctrl+P e selecione "Salvar como PDF"', 'info');
        }

        function imprimirRelatorio() {
            const content = document.getElementById('relatorioOutput').innerHTML;
            if (!content || content.includes('Selecione os filtros')) {
                showToast('Gere um relatório primeiro!', 'error');
                return;
            }
            const win = window.open('', '_blank');
            win.document.write(
                '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório</title><style>body{font-family:sans-serif;padding:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:8px;text-align:left;}th{background:#f0f0f0;}</style></head><body>' +
                content + '<script>window.print();<\/script></body></html>');
            win.document.close();
        }

        // ============================================================
        // EXPORTAR INEP - ATUALIZADO
        // ============================================================
        async function exportarINEP() {
            const ano = document.getElementById('inepAno').value;
            const escolaId = document.getElementById('inepEscola').value;
            const tipo = document.getElementById('inepTipo').value;

            showToast('Gerando arquivo INEP...', 'info');

            const output = document.getElementById('inepOutput');

            let escolasFiltradas = escolas;
            if (escolaId !== 'todas') {
                escolasFiltradas = escolas.filter(e => e.id == escolaId);
            }

            if (escolasFiltradas.length === 0) {
                output.innerHTML =
                    '<p style="color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> Nenhuma escola encontrada para exportar.</p>';
                showToast('Nenhuma escola encontrada!', 'error');
                return;
            }

            let html = `<h4><i class="fas fa-file-export"></i> Exportação INEP - ${ano}</h4>`;
            html += `<p><strong>Total de escolas:</strong> ${escolasFiltradas.length}</p>`;
            html += `<p><strong>Tipo:</strong> ${tipo}</p>`;
            html +=
                `<div style="background:#fff;padding:15px;border:1px solid #ddd;border-radius:8px;margin-top:15px;max-height:400px;overflow:auto;font-family:monospace;font-size:12px;">`;

            for (const escola of escolasFiltradas) {
                html += `<h5>🔹 Escola: ${escola.nome} (INEP: ${escola.inep || 'N/A'})</h5>`;
                html += `<ul>`;

                html += `<li><strong>Registro 00 - Escola:</strong></li>`;
                html += `<ul>`;
                html += `<li>INEP: ${escola.inep || 'N/A'}</li>`;
                html += `<li>Nome: ${escola.nome}</li>`;
                html += `<li>Dependência: ${escola.dependencia_administrativa || 'N/A'}</li>`;
                html += `<li>Categoria: ${escola.categoria || 'N/A'}</li>`;
                html += `<li>Zona: ${escola.zona_localizacao || 'N/A'}</li>`;
                html += `<li>Endereço: ${escola.logradouro || ''} ${escola.numero || ''}, ${escola.bairro || ''}</li>`;
                html += `<li>Cidade: ${escola.cidade || 'N/A'} - ${escola.estado || 'N/A'}</li>`;
                html += `<li>CEP: ${escola.cep || 'N/A'}</li>`;
                html += `<li>Telefone: ${escola.telefone || 'N/A'}</li>`;
                html += `<li>Email: ${escola.email || 'N/A'}</li>`;
                html += `<li>Site: ${escola.site || 'N/A'}</li>`;
                html += `<li>Data Início: ${escola.data_inicio_atividades || 'N/A'}</li>`;
                html += `</ul>`;

                if (tipo === 'completo' || tipo === 'alunos') {
                    const alunosEscola = alunos.filter(a => a.escola_id == escola.id);
                    html += `<li><strong>Registro 30/60 - Alunos:</strong> ${alunosEscola.length}</li>`;
                    if (alunosEscola.length > 0) {
                        html += `<ul>`;
                        alunosEscola.forEach(a => {
                            const turma = turmas.find(t => t.id == a.turma_id);
                            const def = a.tipo_deficiencia || 'Nenhuma';
                            html +=
                                `<li>${a.nome} | INEP: ${a.inep_aluno || 'N/A'} | CPF: ${a.cpf || 'N/A'} | Nasc: ${a.data_nascimento || 'N/A'} | UF Nasc: ${a.uf_nascimento || 'N/A'} | ${a.sexo || 'N/A'} | ${a.raca || 'N/A'} | Turma: ${turma ? turma.nome : 'N/I'} | PCD: ${a.pcd || 'NÃO'} | Def: ${def} | Bolsa Família: ${a.bolsa_familia == 1 ? 'SIM' : 'NÃO'} | Situação: ${a.situacao || 'CURSANDO'}</li>`;
                        });
                        html += `</ul>`;
                    }
                }

                if (tipo === 'completo' || tipo === 'professores') {
                    const profs = professores.filter(p => p.escola_id == escola.id);
                    html += `<li><strong>Registro 40 - Professores:</strong> ${profs.length}</li>`;
                    if (profs.length > 0) {
                        html += `<ul>`;
                        profs.forEach(p => {
                            html +=
                                `<li>${p.nome} | CPF: ${p.cpf || 'N/A'} | Nasc: ${p.data_nascimento || 'N/A'} | UF Nasc: ${p.uf_nascimento || 'N/A'} | ${p.sexo || 'N/A'} | ${p.raca || 'N/A'} | ${p.email || 'N/A'} | ${p.formacao || 'N/A'} | Educ. Especial: ${p.professor_educacao_especial ? 'SIM' : 'NÃO'}</li>`;
                        });
                        html += `</ul>`;
                    }
                }

                if (tipo === 'completo' || tipo === 'funcionarios') {
                    const funcs = funcionarios.filter(f => f.escola_id == escola.id);
                    html += `<li><strong>Registro 50 - Funcionários:</strong> ${funcs.length}</li>`;
                    if (funcs.length > 0) {
                        html += `<ul>`;
                        funcs.forEach(f => {
                            html +=
                                `<li>${f.nome} | INEP: ${f.inep || 'N/A'} | CPF: ${f.cpf || 'N/A'} | Nasc: ${f.data_nascimento || 'N/A'} | UF Nasc: ${f.uf_nascimento || 'N/A'} | ${f.sexo || 'N/A'} | ${f.raca || 'N/A'} | Cargo: ${f.cargo || 'N/A'} | PCD: ${f.pcd || 'NÃO'} | CNH: ${f.cnh || 'N/A'}</li>`;
                        });
                        html += `</ul>`;
                    }
                }

                if (tipo === 'completo' || tipo === 'turmas') {
                    const turmasEscola = turmas.filter(t => t.escola_id == escola.id);
                    html += `<li><strong>Registro 20 - Turmas:</strong> ${turmasEscola.length}</li>`;
                    if (turmasEscola.length > 0) {
                        html += `<ul>`;
                        turmasEscola.forEach(t => {
                            const count = alunos.filter(a => a.turma_id == t.id).length;
                            html +=
                                `<li>${t.nome} | INEP: ${t.inep_turma || 'N/A'} | ${t.modalidade?.replace(/_/g, ' ') || 'N/A'} | Tipo: ${t.tipo_turma || 'N/A'} | ${t.ano || 'N/A'} | ${t.turno || 'N/A'} | ${count} alunos</li>`;
                        });
                        html += `</ul>`;
                    }
                }

                if (tipo === 'completo' || tipo === 'infraestrutura') {
                    const infra = infraestrutura.filter(i => i.escola_id == escola.id && i.ano_referencia == ano);
                    html += `<li><strong>Registro 10 - Infraestrutura:</strong> ${infra.length}</li>`;
                    if (infra.length > 0) {
                        html += `<ul>`;
                        infra.forEach(i => {
                            html +=
                                `<li>Ano: ${i.ano_referencia} | Salas: ${i.salas_aula} | Lab. Informática: ${i.laboratorio_informatica ? 'SIM' : 'NÃO'} | Lab. Ciências: ${i.laboratorio_ciencias ? 'SIM' : 'NÃO'} | Lab. Robótica: ${i.laboratorio_robotica ? 'SIM' : 'NÃO'} | Biblioteca: ${i.biblioteca ? 'SIM' : 'NÃO'} | Internet: ${i.internet ? 'SIM' : 'NÃO'}</li>`;
                        });
                        html += `</ul>`;
                    }
                }

                html += `</ul><hr>`;
            }

            html += `</div>`;
            html += `
                <div style="margin-top:20px;">
                    <button class="btn btn-success" onclick="baixarArquivoINEP()">
                        <i class="fas fa-download"></i> Baixar Arquivo .txt
                    </button>
                    <button class="btn btn-primary" onclick="baixarArquivoINEPCSV()">
                        <i class="fas fa-file-excel"></i> Baixar CSV
                    </button>
                </div>
            `;

            output.innerHTML = html;
            showToast('Arquivo INEP gerado com sucesso!', 'success');
        }

        function baixarArquivoINEP() {
            const output = document.getElementById('inepOutput');
            const content = output.textContent || output.innerText;

            if (!content || content.includes('Nenhuma escola')) {
                showToast('Gere o arquivo primeiro!', 'error');
                return;
            }

            let txt = '=== DADOS INEP - CENSO ESCOLAR ===\n';
            txt += `GERADO EM: ${new Date().toLocaleString()}\n\n`;

            for (const escola of escolas) {
                txt += `[REGISTRO 00 - ESCOLA]\n`;
                txt += `INEP: ${escola.inep || 'N/A'}\n`;
                txt += `NOME: ${escola.nome}\n`;
                txt += `DEPENDÊNCIA: ${escola.dependencia_administrativa || 'N/A'}\n`;
                txt += `CATEGORIA: ${escola.categoria || 'N/A'}\n`;
                txt += `ZONA: ${escola.zona_localizacao || 'N/A'}\n`;
                txt += `ENDEREÇO: ${escola.logradouro || ''} ${escola.numero || ''}, ${escola.bairro || ''}\n`;
                txt += `CIDADE: ${escola.cidade || 'N/A'} - ${escola.estado || 'N/A'}\n`;
                txt += `CEP: ${escola.cep || 'N/A'}\n`;
                txt += `TELEFONE: ${escola.telefone || 'N/A'}\n`;
                txt += `EMAIL: ${escola.email || 'N/A'}\n`;
                txt += `SITE: ${escola.site || 'N/A'}\n`;
                txt += `DATA INÍCIO: ${escola.data_inicio_atividades || 'N/A'}\n`;
                txt += `DIRETOR: ${gestores.find(g => g.id == escola.diretor_id)?.nome || 'N/A'}\n`;
                txt += `\n`;

                const alunosEscola = alunos.filter(a => a.escola_id == escola.id);
                txt += `[REGISTRO 30/60 - ALUNOS]\n`;
                alunosEscola.forEach((a, i) => {
                    const turma = turmas.find(t => t.id == a.turma_id);
                    const def = a.tipo_deficiencia || 'Nenhuma';
                    txt +=
                        `${i+1}. ${a.nome} | INEP: ${a.inep_aluno || 'N/A'} | CPF: ${a.cpf || 'N/A'} | NASC: ${a.data_nascimento || 'N/A'} | UF NASC: ${a.uf_nascimento || 'N/A'} | SEXO: ${a.sexo || 'N/A'} | RAÇA: ${a.raca || 'N/A'} | TURMA: ${turma?.nome || 'N/A'} | PCD: ${a.pcd || 'NÃO'} | DEF: ${def} | BOLSA FAMÍLIA: ${a.bolsa_familia == 1 ? 'SIM' : 'NÃO'} | SITUAÇÃO: ${a.situacao || 'CURSANDO'}\n`;
                });
                txt += `\n`;

                const profs = professores.filter(p => p.escola_id == escola.id);
                txt += `[REGISTRO 40 - PROFESSORES]\n`;
                profs.forEach((p, i) => {
                    txt +=
                        `${i+1}. ${p.nome} | CPF: ${p.cpf || 'N/A'} | NASC: ${p.data_nascimento || 'N/A'} | UF NASC: ${p.uf_nascimento || 'N/A'} | SEXO: ${p.sexo || 'N/A'} | RAÇA: ${p.raca || 'N/A'} | ${p.email || 'N/A'} | ${p.formacao || 'N/A'} | ED. ESPECIAL: ${p.professor_educacao_especial ? 'SIM' : 'NÃO'}\n`;
                });
                txt += `\n`;

                const funcs = funcionarios.filter(f => f.escola_id == escola.id);
                txt += `[REGISTRO 50 - FUNCIONÁRIOS]\n`;
                funcs.forEach((f, i) => {
                    txt +=
                        `${i+1}. ${f.nome} | INEP: ${f.inep || 'N/A'} | CPF: ${f.cpf || 'N/A'} | NASC: ${f.data_nascimento || 'N/A'} | UF NASC: ${f.uf_nascimento || 'N/A'} | SEXO: ${f.sexo || 'N/A'} | RAÇA: ${f.raca || 'N/A'} | CARGO: ${f.cargo || 'N/A'} | PCD: ${f.pcd || 'NÃO'} | CNH: ${f.cnh || 'N/A'}\n`;
                });
                txt += `\n`;

                const turmasEscola = turmas.filter(t => t.escola_id == escola.id);
                txt += `[REGISTRO 20 - TURMAS]\n`;
                turmasEscola.forEach((t, i) => {
                    const count = alunos.filter(a => a.turma_id == t.id).length;
                    txt +=
                        `${i+1}. ${t.nome} | INEP: ${t.inep_turma || 'N/A'} | ${t.modalidade?.replace(/_/g, ' ') || 'N/A'} | TIPO: ${t.tipo_turma || 'N/A'} | ${t.ano || 'N/A'} | ${t.turno || 'N/A'} | ${count} alunos\n`;
                });
                txt += `\n`;

                const infra = infraestrutura.filter(i => i.escola_id == escola.id);
                txt += `[REGISTRO 10 - INFRAESTRUTURA]\n`;
                infra.forEach((i) => {
                    txt +=
                        `ANO: ${i.ano_referencia} | SALAS: ${i.salas_aula} | LAB INFO: ${i.laboratorio_informatica ? 'SIM' : 'NÃO'} | LAB CIÊNCIAS: ${i.laboratorio_ciencias ? 'SIM' : 'NÃO'} | LAB ROBÓTICA: ${i.laboratorio_robotica ? 'SIM' : 'NÃO'} | BIBLIOTECA: ${i.biblioteca ? 'SIM' : 'NÃO'} | INTERNET: ${i.internet ? 'SIM' : 'NÃO'}\n`;
                });
                txt += `\n${'='.repeat(60)}\n\n`;
            }

            const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            const dataAtual = new Date().toISOString().split('T')[0];
            link.download = `inep_export_${dataAtual}.txt`;
            link.href = URL.createObjectURL(blob);
            link.click();
            showToast('Arquivo baixado com sucesso!', 'success');
        }

        function baixarArquivoINEPCSV() {
            let csv = 'ID;Nome;INEP;CPF;Data Nasc.;UF Nasc.;Sexo;Raça;Turma;Escola;PCD;Deficiência;Bolsa Família;Situação\n';

            for (const a of alunos) {
                const turma = turmas.find(t => t.id == a.turma_id);
                const escola = escolas.find(e => e.id == a.escola_id);
                const def = a.tipo_deficiencia || 'Nenhuma';
                csv +=
                    `${a.id};${a.nome};${a.inep_aluno || ''};${a.cpf || ''};${a.data_nascimento || ''};${a.uf_nascimento || ''};${a.sexo || ''};${a.raca || ''};${turma?.nome || ''};${escola?.nome || ''};${a.pcd || 'NÃO'};${def};${a.bolsa_familia == 1 ? 'SIM' : 'NÃO'};${a.situacao || 'CURSANDO'}\n`;
            }

            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const dataAtual = new Date().toISOString().split('T')[0];
            link.download = `alunos_${dataAtual}.csv`;
            link.href = URL.createObjectURL(blob);
            link.click();
            showToast('CSV baixado com sucesso!', 'success');
        }

        // ============================================================
        // ATUALIZAR FILTROS DE RELATÓRIOS E INEP
        // ============================================================
        function atualizarFiltrosRelatorios() {
            const selectEscola = document.getElementById('filtroRelEscola');
            if (selectEscola) {
                selectEscola.innerHTML = '<option value="todas">Todas as Escolas</option>' +
                    escolas.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
            }
            const selectTurma = document.getElementById('filtroRelTurma');
            if (selectTurma) {
                selectTurma.innerHTML = '<option value="todas">Todas as Turmas</option>' +
                    turmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('');
            }
            const selectProfessor = document.getElementById('filtroRelProfessor');
            if (selectProfessor) {
                selectProfessor.innerHTML = '<option value="todos">Todos os Professores</option>' +
                    professores.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
            }
            const selectAluno = document.getElementById('filtroRelAluno');
            if (selectAluno) {
                selectAluno.innerHTML = '<option value="todos">Todos os Alunos</option>' +
                    alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');
            }

            const selectInepEscola = document.getElementById('inepEscola');
            if (selectInepEscola) {
                selectInepEscola.innerHTML = '<option value="todas">Todas as Escolas</option>' +
                    escolas.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
            }

            const selectInfraEscola = document.getElementById('filtroInfraEscola');
            if (selectInfraEscola) {
                selectInfraEscola.innerHTML = '<option value="todas">Todas as Escolas</option>' +
                    escolas.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
            }

            // Atualizar filtro de funcionários
            const selectFuncEscola = document.getElementById('filtroFuncEscola');
            if (selectFuncEscola) {
                selectFuncEscola.innerHTML = '<option value="todas">Todas as Escolas</option>' +
                    escolas.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
            }
        }

        // ============================================================
        // INICIALIZAÇÃO
        // ============================================================
        async function init() {
            showToast('Carregando dados do banco...', 'info');

            await carregarTodosDados();

            console.log('📊 Dados carregados:', {
                escolas: escolas.length,
                disciplinas: disciplinas.length,
                professores: professores.length,
                funcionarios: funcionarios.length,
                turmas: turmas.length,
                alunos: alunos.length,
                notas: notas.length,
                gestores: gestores.length,
                infraestrutura: infraestrutura.length
            });

            renderizarEscolas();
            renderizarDisciplinas();
            renderizarProfessores();
            renderizarFuncionarios();
            renderizarTurmas();
            renderizarAlunos();
            renderizarNotas();
            renderizarConteudos();
            renderizarGestores();
            renderizarInfraestrutura();
            atualizarFiltrosRelatorios();

            const mesAtual = new Date().toISOString().substring(0, 7);
            document.getElementById('freqFiltroMes').value = mesAtual;

            carregarDependenciasFrequencia();
            renderizarPlanilha();

            await atualizarDashboard();

            showToast('✅ Sistema carregado com sucesso - Compatível com Educacenso 2026!', 'success');
        }

        document.addEventListener('DOMContentLoaded', init);