<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matrícula Escolar · CAD ESCOLAR</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Roboto, system-ui, sans-serif; }
        body { background: #e6edf6; min-height: 100vh; padding: 20px; display: flex; justify-content: center; align-items: flex-start; }
        .app { max-width: 1200px; width: 100%; background: #ffffff; border-radius: 36px; box-shadow: 0 20px 40px -10px rgba(0,20,40,0.3); padding: 32px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #0b2b4a; flex-wrap: wrap; gap: 15px; }
        .header h1 { color: #0b2b4a; font-size: 1.8rem; }
        .header h1 i { color: #3b8fc2; }
        .header .subtitle { color: #4f6f8f; font-size: 0.9rem; }
        .btn-voltar { background: #eef4fc; color: #1a3a57; border: none; padding: 10px 20px; border-radius: 60px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s; text-decoration: none; }
        .btn-voltar:hover { background: #d0ddee; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px 20px; }
        .form-grid .full-width { grid-column: 1 / -1; }
        .form-grid .half-width { grid-column: span 1; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label { font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.4px; color: #1a4a6e; display: flex; align-items: center; gap: 6px; }
        .form-group label i { color: #3b7da5; width: 1.2rem; }
        .form-group label .required { color: #b13e3e; }
        .form-group input, .form-group select, .form-group textarea { padding: 10px 14px; border: 1px solid #c9d9ea; border-radius: 12px; font-size: 0.95rem; background: white; transition: 0.15s; width: 100%; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #0b2b4a; outline: none; box-shadow: 0 0 0 3px rgba(11,43,74,0.1); }
        .form-group .field-hint { font-size: 0.65rem; color: #6f8fa5; margin-top: 2px; font-style: italic; }
        .btn-group { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
        .btn { border: none; padding: 12px 28px; border-radius: 60px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-primary { background: #0b2b4a; color: white; }
        .btn-primary:hover { background: #1a3f62; }
        .btn-success { background: #1e7b4a; color: white; }
        .btn-success:hover { background: #2a8f5a; }
        .btn-secondary { background: #d9e3f0; color: #1f3a57; }
        .btn-secondary:hover { background: #c0d0e6; }
        .btn-danger { background: #b13e3e; color: white; }
        .btn-danger:hover { background: #c94a4a; }
        .btn-warning { background: #b8862b; color: white; }
        .btn-warning:hover { background: #d49c34; }
        .btn-sm { padding: 6px 14px; font-size: 0.8rem; }
        .btn-info { background: #2196F3; color: white; }
        .btn-info:hover { background: #1976D2; }
        .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
        .toast { padding: 14px 24px; border-radius: 12px; color: white; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.2); animation: slideIn 0.3s ease; min-width: 280px; max-width: 450px; display: flex; align-items: center; gap: 12px; }
        .toast-success { background: #1e7b4a; }
        .toast-error { background: #b13e3e; }
        .toast-warning { background: #b8862b; }
        .toast-info { background: #1f6b9c; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .lista-matriculas { margin-top: 30px; padding-top: 20px; border-top: 2px solid #eef4fc; }
        .lista-matriculas h3 { color: #0b2b4a; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .lista-matriculas table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .lista-matriculas th { background: #e2eefa; color: #113753; font-weight: 600; padding: 10px 12px; text-align: left; }
        .lista-matriculas td { padding: 10px 12px; border-bottom: 1px solid #e3ebf5; }
        .badge-pcd { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 700; }
        .badge-pcd.sim { background: #fce1e1; color: #a13232; }
        .badge-pcd.nao { background: #d4f0e0; color: #0f6b3a; }
        .badge-status { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 700; }
        .badge-status.ativa { background: #d4f0e0; color: #0f6b3a; }
        .badge-status.inativa { background: #fce1e1; color: #a13232; }
        .badge-status.transferido { background: #fff3e0; color: #b8862b; }
        .badge-status.concluido { background: #e2eefa; color: #1a4a6e; }
        .empty-state { text-align: center; padding: 40px 20px; color: #4a6a85; }
        .empty-state i { font-size: 3rem; color: #c9d9ea; margin-bottom: 15px; }
        .resumo-matriculas { background: #f6faff; padding: 15px 20px; border-radius: 16px; border: 1px solid #dde8f5; margin-top: 15px; display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between; }
        .resumo-matriculas .item { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #4f6f8f; }
        .resumo-matriculas .item .num { font-weight: 700; font-size: 1.2rem; color: #0b2b4a; }
        .secao-titulo { background: #eef4fc; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; color: #1a4a6e; margin-top: 8px; grid-column: 1 / -1; }
        @media (max-width: 900px) { .form-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 700px) { .app { padding: 16px; } .form-grid { grid-template-columns: 1fr; } .btn-group { flex-direction: column; } .btn-group .btn { width: 100%; justify-content: center; } .header { flex-direction: column; align-items: flex-start; } }
    </style>
</head>
<body>
    <div class="app">

        <!-- ============ TOAST ============ -->
        <div class="toast-container" id="toastContainer"></div>

        <!-- ============ HEADER ============ -->
        <div class="header">
            <div>
                <h1><i class="fas fa-user-plus"></i> Matrícula Escolar</h1>
                <div class="subtitle">Sistema de matrícula - Todos os campos INEP/Educacenso</div>
            </div>
            <a href="index.html" class="btn-voltar">
                <i class="fas fa-arrow-left"></i> Voltar ao Sistema
            </a>
        </div>

        <!-- ============ FORMULÁRIO ============ -->
        <form id="formMatricula" onsubmit="return false;">
            <div class="form-grid">

                <!-- ============ DADOS PESSOAIS ============ -->
                <div class="secao-titulo"><i class="fas fa-user"></i> Dados Pessoais</div>

                <div class="form-group full-width">
                    <label><i class="fas fa-user-graduate"></i> Nome do Aluno <span class="required">*</span></label>
                    <input id="alunoNome" placeholder="Nome completo do aluno" required>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-id-card"></i> CPF <span class="required">*</span></label>
                    <input id="alunoCpf" placeholder="000.000.000-00" maxlength="14" required>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-id-card"></i> Identidade (RG)</label>
                    <input id="alunoIdentidade" placeholder="Número do RG">
                </div>

                <div class="form-group">
                    <label><i class="fas fa-calendar-alt"></i> Data Nascimento <span class="required">*</span></label>
                    <input id="alunoDataNasc" type="date" required>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-venus-mars"></i> Sexo</label>
                    <select id="alunoSexo">
                        <option value="">Selecione</option>
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMININO">Feminino</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-user-tag"></i> Raça/Cor</label>
                    <select id="alunoRaca">
                        <option value="">Selecione</option>
                        <option value="BRANCA">Branca</option>
                        <option value="PRETA">Preta</option>
                        <option value="PARDA">Parda</option>
                        <option value="AMARELA">Amarela</option>
                        <option value="INDIGENA">Indígena</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-flag"></i> País de Nascimento</label>
                    <input id="alunoPaisNasc" value="BRASIL" placeholder="País">
                </div>

                <div class="form-group">
                    <label><i class="fas fa-map-pin"></i> UF de Nascimento <span class="required">*</span></label>
                    <input id="alunoUfNasc" placeholder="UF" maxlength="2" required>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-city"></i> Município de Nascimento <span class="required">*</span></label>
                    <input id="alunoMunicipioNasc" placeholder="Cidade de nascimento" required>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-flag"></i> Nacionalidade</label>
                    <input id="alunoNacionalidade" value="BRASILEIRA">
                </div>

                <!-- ============ FAMÍLIA ============ -->
                <div class="secao-titulo"><i class="fas fa-users"></i> Dados da Família</div>

                <div class="form-group">
                    <label><i class="fas fa-user"></i> Nome da Mãe</label>
                    <input id="alunoMae" placeholder="Nome completo da mãe">
                </div>

                <div class="form-group">
                    <label><i class="fas fa-user"></i> Nome do Pai</label>
                    <input id="alunoPai" placeholder="Nome completo do pai">
                </div>

                <div class="form-group">
                    <label><i class="fas fa-user"></i> Responsável <span class="required">*</span></label>
                    <input id="alunoResponsavel" placeholder="Nome do responsável" required>
                </div>

                <!-- ============ ENDEREÇO E CONTATO ============ -->
                <div class="secao-titulo"><i class="fas fa-home"></i> Endereço e Contato</div>

                <div class="form-group">
                    <label><i class="fas fa-map-pin"></i> Zona Residencial</label>
                    <select id="alunoZonaRes">
                        <option value="">Selecione</option>
                        <option value="URBANA">Urbana</option>
                        <option value="RURAL">Rural</option>
                    </select>
                </div>

                <div class="form-group full-width">
                    <label><i class="fas fa-map-marker-alt"></i> Endereço</label>
                    <input id="alunoEndereco" placeholder="Rua, número, bairro, cidade">
                </div>

                <div class="form-group">
                    <label><i class="fas fa-phone"></i> Telefone</label>
                    <input id="alunoTelefone" placeholder="(00) 00000-0000">
                </div>

                <!-- ============ PCD E NECESSIDADES ============ -->
                <div class="secao-titulo"><i class="fas fa-wheelchair"></i> PCD e Necessidades Especiais</div>

                <div class="form-group">
                    <label><i class="fas fa-wheelchair"></i> PCD</label>
                    <select id="alunoPcd">
                        <option value="NÃO">NÃO</option>
                        <option value="SIM">SIM</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-wheelchair"></i> Tipo de Deficiência</label>
                    <select id="alunoTipoDef">
                        <option value="">Nenhuma</option>
                        <option value="VISUAL">Visual</option>
                        <option value="AUDITIVA">Auditiva</option>
                        <option value="FISICA">Física</option>
                        <option value="MENTAL">Mental</option>
                        <option value="MULTIPLA">Múltipla</option>
                    </select>
                    <div class="field-hint"><i class="fas fa-info-circle"></i> Se PCD for SIM, selecione o tipo</div>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-id-card"></i> CID</label>
                    <input id="alunoCid" placeholder="Código CID">
                </div>

                <div class="form-group">
                    <label><i class="fas fa-brain"></i> Necessidade Especial</label>
                    <select id="alunoNecessidade">
                        <option value="">Nenhuma</option>
                        <option value="AUTISMO">Autismo</option>
                        <option value="SUPERDOTACAO">Superdotação</option>
                        <option value="TDAH">TDAH</option>
                        <option value="DISLEXIA">Dislexia</option>
                    </select>
                </div>

                <!-- ============ BENEFÍCIOS ============ -->
                <div class="secao-titulo"><i class="fas fa-hand-holding-heart"></i> Benefícios e Auxílios</div>

                <div class="form-group">
                    <label><i class="fas fa-bus"></i> Transporte Escolar</label>
                    <select id="alunoTransporte">
                        <option value="0">Não</option>
                        <option value="1">Sim</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-book"></i> Material Escolar</label>
                    <select id="alunoMaterial">
                        <option value="0">Não</option>
                        <option value="1">Sim</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-tshirt"></i> Uniforme</label>
                    <select id="alunoUniforme">
                        <option value="0">Não</option>
                        <option value="1">Sim</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-money-bill-wave"></i> Bolsa Família</label>
                    <select id="alunoBolsa">
                        <option value="0">Não</option>
                        <option value="1">Sim</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-tag"></i> Tipo de Bolsa</label>
                    <select id="alunoTipoBolsa">
                        <option value="">Nenhuma</option>
                        <option value="BOLSA_FAMILIA">Bolsa Família</option>
                        <option value="BPC">BPC</option>
                        <option value="OUTRO">Outro</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-briefcase"></i> Situação de Ocupação</label>
                    <select id="alunoOcupacao">
                        <option value="">N/A</option>
                        <option value="EMPREGADO">Empregado</option>
                        <option value="DESEMPREGADO">Desempregado</option>
                        <option value="ESTUDANTE">Estudante</option>
                        <option value="OUTRO">Outro</option>
                    </select>
                </div>

                <!-- ============ MATRÍCULA ============ -->
                <div class="secao-titulo"><i class="fas fa-school"></i> Dados da Matrícula</div>

                <div class="form-group">
                    <label><i class="fas fa-school"></i> Escola <span class="required">*</span></label>
                    <select id="alunoEscola" required>
                        <option value="">Selecione uma escola</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-users"></i> Turma <span class="required">*</span></label>
                    <select id="alunoTurma" required>
                        <option value="">Selecione uma turma</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-calendar-alt"></i> Ano Letivo <span class="required">*</span></label>
                    <input id="anoLetivo" type="number" value="2026" min="2020" max="2030" required>
                </div>

                <div class="form-group">
                    <label><i class="fas fa-info-circle"></i> Situação</label>
                    <select id="alunoSituacao">
                        <option value="CURSANDO">Cursando</option>
                        <option value="APROVADO">Aprovado</option>
                        <option value="REPROVADO">Reprovado</option>
                        <option value="TRANSFERIDO">Transferido</option>
                        <option value="DESISTENTE">Desistente</option>
                    </select>
                </div>

                <div class="form-group full-width">
                    <label><i class="fas fa-comment"></i> Observação</label>
                    <textarea id="alunoObservacao" rows="2" placeholder="Observações sobre a matrícula"></textarea>
                </div>

            </div>

            <!-- ============ BOTÕES ============ -->
            <div class="btn-group">
                <button type="button" class="btn btn-secondary" onclick="limparFormulario()">
                    <i class="fas fa-undo"></i> Limpar
                </button>
                <button type="button" class="btn btn-success" onclick="salvarMatriculaDireto()">
                    <i class="fas fa-save"></i> Matricular no Banco
                </button>
            </div>
        </form>

        <!-- ============ LISTA DE MATRÍCULAS ============ -->
        <div class="lista-matriculas">
            <h3>
                <span><i class="fas fa-list"></i> Últimas Matrículas</span>
                <span id="contadorMatriculas" style="font-size:0.9rem;color:#4f6f8f;">(0)</span>
            </h3>
            <div id="listaMatriculasContainer">
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <p>Nenhuma matrícula salva no banco ainda.</p>
                    <p style="font-size:0.85rem;color:#6f8fa5;">Preencha o formulário e clique em "Matricular no Banco"</p>
                </div>
            </div>
        </div>

    </div>

    <script>
        // ============================================================
        // SISTEMA DE MATRÍCULA - SALVA DIRETO NO BANCO
        // ============================================================

        let matriculas = [];
        let escolas = [];
        let turmas = [];

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

        function getValor(id) { return document.getElementById(id).value.trim(); }
        function getValorSelect(id) { return document.getElementById(id).value; }
        function getValorText(id) { return document.getElementById(id).value.trim(); }

        // ============================================================
        // CARREGAR DADOS
        // ============================================================
        async function carregarDados() {
            try {
                const respEscolas = await fetch('api/escolas.php');
                const jsonEscolas = await respEscolas.json();
                if (jsonEscolas.success !== false) { escolas = jsonEscolas.data || []; }

                const respTurmas = await fetch('api/turmas.php');
                const jsonTurmas = await respTurmas.json();
                if (jsonTurmas.success !== false) { turmas = jsonTurmas.data || []; }

                preencherEscolas();
                preencherTurmas();
                carregarMatriculas();

                console.log('📊 Dados carregados:', {
                    escolas: escolas.length,
                    turmas: turmas.length,
                    matriculas: matriculas.length
                });
            } catch (e) {
                console.error('Erro ao carregar dados:', e);
                showToast('Erro ao carregar dados do sistema', 'error');
            }
        }

        function preencherEscolas() {
            const select = document.getElementById('alunoEscola');
            select.innerHTML = '<option value="">Selecione uma escola</option>';
            escolas.forEach(e => {
                select.innerHTML += `<option value="${e.id}">${e.nome}</option>`;
            });
        }

        function preencherTurmas() {
            const select = document.getElementById('alunoTurma');
            const escolaId = document.getElementById('alunoEscola').value;
            const turmasFiltradas = escolaId ? turmas.filter(t => t.escola_id == escolaId) : turmas;
            select.innerHTML = '<option value="">Selecione uma turma</option>';
            turmasFiltradas.forEach(t => {
                select.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
            });
        }

        // ============================================================
        // CARREGAR MATRÍCULAS DO BANCO
        // ============================================================
        async function carregarMatriculas() {
            try {
                const resp = await fetch('api/matricula.php');
                const json = await resp.json();
                if (json.success !== false) {
                    matriculas = json.data || [];
                }
                renderizarLista();
            } catch (e) {
                console.error('Erro ao carregar matrículas:', e);
            }
        }

        // ============================================================
        // EVENTOS
        // ============================================================
        document.getElementById('alunoEscola').addEventListener('change', preencherTurmas);

        // ============================================================
        // LIMPAR FORMULÁRIO
        // ============================================================
        function limparFormulario() {
            document.getElementById('alunoNome').value = '';
            document.getElementById('alunoCpf').value = '';
            document.getElementById('alunoIdentidade').value = '';
            document.getElementById('alunoDataNasc').value = '';
            document.getElementById('alunoSexo').value = '';
            document.getElementById('alunoRaca').value = '';
            document.getElementById('alunoPaisNasc').value = 'BRASIL';
            document.getElementById('alunoUfNasc').value = '';
            document.getElementById('alunoMunicipioNasc').value = '';
            document.getElementById('alunoNacionalidade').value = 'BRASILEIRA';
            document.getElementById('alunoMae').value = '';
            document.getElementById('alunoPai').value = '';
            document.getElementById('alunoResponsavel').value = '';
            document.getElementById('alunoZonaRes').value = '';
            document.getElementById('alunoEndereco').value = '';
            document.getElementById('alunoTelefone').value = '';
            document.getElementById('alunoPcd').value = 'NÃO';
            document.getElementById('alunoTipoDef').value = '';
            document.getElementById('alunoCid').value = '';
            document.getElementById('alunoNecessidade').value = '';
            document.getElementById('alunoTransporte').value = '0';
            document.getElementById('alunoMaterial').value = '0';
            document.getElementById('alunoUniforme').value = '0';
            document.getElementById('alunoBolsa').value = '0';
            document.getElementById('alunoTipoBolsa').value = '';
            document.getElementById('alunoOcupacao').value = '';
            document.getElementById('alunoEscola').value = '';
            document.getElementById('alunoTurma').value = '';
            document.getElementById('anoLetivo').value = '2026';
            document.getElementById('alunoSituacao').value = 'CURSANDO';
            document.getElementById('alunoObservacao').value = '';
            preencherTurmas();
            showToast('Formulário limpo!', 'info');
        }

        // ============================================================
        // SALVAR MATRÍCULA DIRETO NO BANCO
        // ============================================================
        async function salvarMatriculaDireto() {
            const nome = getValor('alunoNome');
            const cpf = getValor('alunoCpf');
            const dataNasc = getValor('alunoDataNasc');
            const responsavel = getValor('alunoResponsavel');
            const escola_id = getValorSelect('alunoEscola');
            const turma_id = getValorSelect('alunoTurma');
            const ano_letivo = getValor('anoLetivo');
            const ufNasc = getValor('alunoUfNasc');
            const municipioNasc = getValor('alunoMunicipioNasc');

            // Validações obrigatórias
            if (!nome) { showToast('Nome do aluno é obrigatório!', 'error'); return; }
            if (!cpf) { showToast('CPF é obrigatório!', 'error'); return; }
            if (!dataNasc) { showToast('Data de nascimento é obrigatória!', 'error'); return; }
            if (!responsavel) { showToast('Responsável é obrigatório!', 'error'); return; }
            if (!escola_id) { showToast('Selecione uma escola!', 'error'); return; }
            if (!turma_id) { showToast('Selecione uma turma!', 'error'); return; }
            if (!ano_letivo) { showToast('Informe o ano letivo!', 'error'); return; }
            if (!ufNasc) { showToast('UF de nascimento é obrigatória!', 'error'); return; }
            if (!municipioNasc) { showToast('Município de nascimento é obrigatório!', 'error'); return; }

            // Montar dados para envio com todos os campos
            const data = {
                // Dados pessoais
                nome: nome,
                cpf: cpf,
                identidade: getValor('alunoIdentidade'),
                data_nascimento: dataNasc,
                sexo: getValorSelect('alunoSexo'),
                raca: getValorSelect('alunoRaca'),
                pais_nascimento: getValor('alunoPaisNasc') || 'BRASIL',
                uf_nascimento: ufNasc,
                municipio_nascimento: municipioNasc,
                nacionalidade: getValor('alunoNacionalidade') || 'BRASILEIRA',

                // Família
                nome_mae: getValor('alunoMae'),
                nome_pai: getValor('alunoPai'),
                responsavel: responsavel,

                // Endereço
                zona_residencial: getValorSelect('alunoZonaRes'),
                endereco: getValor('alunoEndereco'),
                telefone: getValor('alunoTelefone'),

                // PCD
                pcd: getValorSelect('alunoPcd'),
                tipo_deficiencia: getValorSelect('alunoTipoDef'),
                cid: getValor('alunoCid'),
                necessidade_especial: getValorSelect('alunoNecessidade'),

                // Benefícios
                transporte_escolar: parseInt(getValorSelect('alunoTransporte')) || 0,
                material_escolar: parseInt(getValorSelect('alunoMaterial')) || 0,
                uniforme: parseInt(getValorSelect('alunoUniforme')) || 0,
                bolsa_familia: parseInt(getValorSelect('alunoBolsa')) || 0,
                tipo_bolsa: getValorSelect('alunoTipoBolsa'),
                situacao_ocupacao: getValorSelect('alunoOcupacao'),

                // Matrícula
                escola_id: escola_id,
                turma_id: turma_id,
                ano_letivo: parseInt(ano_letivo),
                data_matricula: new Date().toISOString().split('T')[0],
                situacao: getValorSelect('alunoSituacao') || 'CURSANDO',
                observacao: getValorText('alunoObservacao')
            };

            showToast('Salvando matrícula...', 'info');

            try {
                const resp = await fetch('api/matricula.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const json = await resp.json();

                if (json.success) {
                    showToast(`Matrícula realizada com sucesso! Nº: ${json.data.numero_matricula || 'N/A'}`, 'success');
                    limparFormulario();
                    await carregarMatriculas();
                } else {
                    showToast('Erro: ' + json.message, 'error');
                }
            } catch (e) {
                showToast('Erro de rede: ' + e.message, 'error');
            }
        }

        // ============================================================
        // RENDERIZAR LISTA DE MATRÍCULAS
        // ============================================================
        function renderizarLista() {
            const container = document.getElementById('listaMatriculasContainer');
            const contador = document.getElementById('contadorMatriculas');

            contador.textContent = `(${matriculas.length})`;

            if (matriculas.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user-plus"></i>
                        <p>Nenhuma matrícula salva no banco ainda.</p>
                        <p style="font-size:0.85rem;color:#6f8fa5;">Preencha o formulário e clique em "Matricular no Banco"</p>
                    </div>
                `;
                return;
            }

            let html = `
                <div style="overflow-x:auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Nº Matrícula</th>
                                <th>Aluno</th>
                                <th>CPF</th>
                                <th>Escola</th>
                                <th>Turma</th>
                                <th>Ano</th>
                                <th>PCD</th>
                                <th>Situação</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            // Mostrar apenas as 15 últimas matrículas
            const ultimas = matriculas.slice(0, 15);
            ultimas.forEach(m => {
                const escola = escolas.find(e => e.id == m.escola_id);
                const turma = turmas.find(t => t.id == m.turma_id);
                const pcdClass = m.pcd === 'SIM' ? 'sim' : 'nao';
                const statusClass = m.situacao ? m.situacao.toLowerCase() : 'ativa';
                html += `
                    <tr>
                        <td><strong>${m.numero_matricula || '-'}</strong></td>
                        <td>${m.aluno_nome || 'N/I'}</td>
                        <td>${m.aluno_cpf || '-'}</td>
                        <td>${escola ? escola.nome : 'N/I'}</td>
                        <td>${turma ? turma.nome : 'N/I'}</td>
                        <td>${m.ano_letivo}</td>
                        <td><span class="badge-pcd ${pcdClass}">${m.pcd || 'NÃO'}</span></td>
                        <td><span class="badge-status ${statusClass}">${m.situacao || 'ATIVA'}</span></td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
                <div style="margin-top:10px;font-size:0.85rem;color:#4a6a85;">
                    Mostrando ${Math.min(ultimas.length, 15)} de ${matriculas.length} matrículas
                </div>
            `;

            container.innerHTML = html;
        }

        // ============================================================
        // INICIALIZAÇÃO
        // ============================================================
        document.addEventListener('DOMContentLoaded', function() {
            carregarDados();
        });
    </script>
</body>
</html>