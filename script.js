// ================== CONFIG ==================
const SHEETDB_BASE = "https://sheetdb.io/api/v1/8pmdh33s9fvy8";
const SHEETS = {
  PATIENTS : "Patients",
  TOKENS   : "LinkTokens",
  SCORES   : "Scores_ETDAH_II"
};
const CODE = "ETDAH_II";
const PORTAL_URL = "https://integradaneuropsicologia.github.io/formularios/";

// ================== HELPERS ==================
const $ = s => document.querySelector(s);
const onlyDigits = s => (s || "").replace(/\D+/g, "");
const qs = k => new URLSearchParams(location.search).get(k) || "";
const AUTOSAVE_KEY = `${CODE}_${qs("token") || "no_token"}`;

function setBox(id, text, kind = "ok") {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + (kind === "ok" ? "okbox" : kind === "warn" ? "warnbox" : "errbox");
  el.style.display = "block";
}

function hideBox(id) {
  const el = $(id);
  if (el) {
    el.style.display = "none";
    el.textContent = "";
  }
}

function fmtDateISO(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return (y && m && d) ? `${d}/${m}/${y}` : iso;
}

// --- fetch helpers ---
async function GET(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

async function POST(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function PATCH(url, body) {
  const r = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function sheetSearch(sheet, params) {
  const usp = new URLSearchParams(params);
  return GET(`${SHEETDB_BASE}/search?sheet=${encodeURIComponent(sheet)}&${usp.toString()}`);
}

async function sheetCreate(sheet, row) {
  return POST(`${SHEETDB_BASE}?sheet=${encodeURIComponent(sheet)}`, { data: [row] });
}

async function sheetPatchBy(sheet, column, value, data) {
  return PATCH(
    `${SHEETDB_BASE}/${encodeURIComponent(column)}/${encodeURIComponent(value)}?sheet=${encodeURIComponent(sheet)}`,
    { data }
  );
}

function goPortalWithToken() {
  const TOKEN = qs("token");
  try {
    const u = new URL(PORTAL_URL, location.href);
    u.searchParams.set("token", TOKEN);
    location.href = u.toString();
  } catch (_) {
    const sep = PORTAL_URL.includes("?") ? "&" : "?";
    location.href = PORTAL_URL + sep + "token=" + encodeURIComponent(TOKEN);
  }
}

// ================== ESCALA ==================

// Pergunta inicial
const OBS_QUESTION = "Assinale a observação que mais se adeque a esta criança:";
const OBS_CHOICES = [ 
"É agitada.",
"Apresenta dificuldades de atenção/concentração.",
"Apresenta dificuldades para aprender.",
"Apresenta todas as queixas anteriores.",
"Não apresenta nenhuma das anteriores."
];


// Itens 1–46
const QUESTIONS = [
  { id: 1,  text:"É organizado(a) em suas lições de classe." },
  { id: 2,  text:"Dá respostas claras e coerentes ao professor." },
  { id: 3,  text:"Segue o ritmo da classe." },
  { id: 4,  text:"É atento(a) nas lições do caderno." },
  { id: 5,  text:"É responsável com o seu material escolar." },
  { id: 6,  text:"Sabe trabalhar independentemente." },
  { id: 7,  text:"É meticuloso(a) nas atividades (é detalhista, faz o seu trabalho meticulosamente)." },
  { id: 8,  text:"Fica atento(a) durante as explicações do professor." },
  { id: 9,  text:"Consegue prestar atenção à uma mesma coisa durante muito tempo." },
  { id:10,  text:"Perde e esquece objetos (livros, cadernos, lápis, borracha, etc.)." },
  { id:11,  text:"Distraí-se facilmente por barulhos em sala de aula." },
  { id:12,  text:"Nunca termina o que começa." },
  { id:13,  text:"Passa de uma atividade incompleta para outra." },
  { id:14,  text:"Tem dificuldade para concentrar-se." },
  { id:15,  text:"Esquece muito rápido o que acabou de ser dito." },

  { id:16,  text:"Mexe-se e contorce-se na cadeira." },
  { id:17,  text:"Age sem pensar (é impulsivo)." },
  { id:18,  text:"Parece estar sempre “a todo vapor” ou “ligado como um motor”." },
  { id:19,  text:"Mexe mãos e pés constantemente (é inquieto)." },
  { id:20,  text:"Levanta-se frequentemente da cadeira." },
  { id:21,  text:"Atrapalha o professor com barulhos diferentes." },
  { id:22,  text:"Age imprudentemente." },
  { id:23,  text:"Tem sempre muita pressa." },
  { id:24,  text:"Muda muito de lugar e de postura." },
  { id:25,  text:"Fala pouco." },
  { id:26,  text:"É paciente (sabe aguardar sua vez)." },
  { id:27,  text:"Parece ser um(a) estudante tranquilo(a) e sossegado(a)." },

  { id:28,  text:"Não rende de acordo com o esperado em Português." },
  { id:29,  text:"Tem dificuldades para aprender problemas de matemática." },
  { id:30,  text:"Tem dificuldade para expressar verbalmente seus pensamentos." },
  { id:31,  text:"Seu raciocínio lógico é lento." },
  { id:32,  text:"Troca letras ao escrever." },
  { id:33,  text:"Sua caligrafia é desleixada." },
  { id:34,  text:"Gosta de fazer exercícios de matemática." },
  { id:35,  text:"Escreve sem erros." },
  { id:36,  text:"Lê perfeitamente." },
  { id:37,  text:"É rápido para fazer cálculos." },
  { id:38,  text:"Compreende textos corretamente." },
  { id:39,  text:"Domina soma, subtração, multiplicação e divisão." },
  { id:40,  text:"Fala com perfeição." },

  { id:41,  text:"Os colegas de classe o(a) evitam." },
  { id:42,  text:"Irrita outros alunos com suas palhaçadas." },
  { id:43,  text:"É briguento(a)." },
  { id:44,  text:"Causa confusão em sala de aula." },
  { id:45,  text:"É bem aceito(a) pelos colegas de classe." },
  { id:46,  text:"Sabe respeitar os professores." }
];

// Opções da escala Likert
const CHOICES_SCALE = [
  { code:"DT", text:"Discordo Totalmente" },
  { code:"D",  text:"Discordo" },
  { code:"DP", text:"Discordo Parcialmente" },
  { code:"CP", text:"Concordo Parcialmente" },
  { code:"C",  text:"Concordo" },
  { code:"CT", text:"Concordo Totalmente" }
];

// Mapeamento de código → pontos
const SCALE_POINTS = {
  DT: 1,
  D:  2,
  DP: 3,
  CP: 4,
  C:  5,
  CT: 6
};

// Itens com pontuação invertida
const INVERTED_ITEMS = new Set([
  1,2,3,4,5,6,7,8,9,
  25,26,27,
  34,35,36,37,38,39,40,
  45,46
]);

// Para barra de progresso: 46 itens + 1 observação inicial
const TOTAL_ITEMS = QUESTIONS.length + 1;

// ================== RENDER FORM ==================
function renderQuestions() {
  const host = $("#qs");
  host.innerHTML = "";

  // Observação inicial
  const obsWrap = document.createElement("div");
  obsWrap.className = "q";
  obsWrap.setAttribute("role", "group");
  obsWrap.setAttribute("aria-labelledby", "lblOBS");

  obsWrap.innerHTML = `
    <div class="sectionTitle">Observação inicial</div>
    <h3 id="lblOBS">${OBS_QUESTION}</h3>
  `;

  const obsOpts = document.createElement("div");
  obsOpts.className = "opts";

  OBS_CHOICES.forEach((txt, idx) => {
  const id = `obs_${idx}`;
  const lab = document.createElement("label");
  lab.className = "opt";
  lab.innerHTML = `
    <input type="checkbox" name="obs_inicial" id="${id}" value="${txt}">
    <span>${txt}</span>
  `;
  obsOpts.appendChild(lab);
});


  obsWrap.appendChild(obsOpts);
  host.appendChild(obsWrap);

  // helper pra desenhar seções
  function renderSection(title, list) {
    const secTitle = document.createElement("div");
    secTitle.className = "sectionTitle";
    secTitle.textContent = title;
    host.appendChild(secTitle);

    list.forEach(q => {
      const qn = String(q.id).padStart(2, "0");
      const wrap = document.createElement("div");
      wrap.className = "q";
      wrap.setAttribute("role", "group");
      wrap.setAttribute("aria-labelledby", `lbl${qn}`);

      wrap.innerHTML = `<h3 id="lbl${qn}">${q.id}. ${q.text}</h3>`;

      const opts = document.createElement("div");
      opts.className = "opts";

      CHOICES_SCALE.forEach((ch, idx) => {
        const rid = `q${qn}_${idx}`;
        const lab = document.createElement("label");
        lab.className = "opt";
        lab.innerHTML = `
          <input type="radio" name="q${qn}" id="${rid}"
                 value="${ch.code} - ${ch.text}" required>
          <small>${ch.code}</small>
          <span>${ch.text}</span>
        `;
        opts.appendChild(lab);
      });

      wrap.appendChild(opts);
      host.appendChild(wrap);
    });
  }

  // Atenção (1–15)
  renderSection("ATENÇÃO (A)", QUESTIONS.slice(0, 15));
  // Hiperatividade / Impulsividade (16–27)
  renderSection("HIPERATIVIDADE / IMPULSIVIDADE (H/I)", QUESTIONS.slice(15, 27));
  // Aprendizagem (28–40)
  renderSection("APRENDIZAGEM (A)", QUESTIONS.slice(27, 40));
  // Comportamento Social (41–46)
  renderSection("COMPORTAMENTO SOCIAL (C.S)", QUESTIONS.slice(40));

  // progresso
  const updateProg = () => {
    let answered = 0;
    if (document.querySelector('input[name="obs_inicial"]:checked')) answered++;
    QUESTIONS.forEach(q => {
      const qn = String(q.id).padStart(2, "0");
      if (document.querySelector(`input[name="q${qn}"]:checked`)) answered++;
    });
    $("#progress").textContent = `${answered}/${TOTAL_ITEMS} respondidas`;
  };

  host.addEventListener("change", () => {
    updateProg();
    autosaveAnswers();
  });

  updateProg();
}

// ================== AUTOSAVE ==================
function autosaveAnswers() {
  const payload = { obs: [], answers: {} };

  const obsChecked = Array.from(
    document.querySelectorAll('input[name="obs_inicial"]:checked')
  ).map(el => el.value);

  payload.obs = obsChecked;

  QUESTIONS.forEach(q => {
    const qn = String(q.id).padStart(2, "0");
    const sel = document.querySelector(`input[name="q${qn}"]:checked`);
    if (sel) payload.answers[q.id] = sel.value;
  });

  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
}


function restoreAutosave() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) || {};
   if (Array.isArray(data.obs)) {
  data.obs.forEach(v => {
    const el = document.querySelector(`input[name="obs_inicial"][value="${v}"]`);
    if (el) el.checked = true;
  });
}

    if (data.answers) {
      Object.entries(data.answers).forEach(([id, val]) => {
        const qn = String(id).padStart(2, "0");
        const el = document.querySelector(`input[name="q${qn}"][value="${val}"]`);
        if (el) el.checked = true;
      });
    }

    let answered = 0;
    if (document.querySelector('input[name="obs_inicial"]:checked')) answered++;
    QUESTIONS.forEach(q => {
      const qn = String(q.id).padStart(2, "0");
      if (document.querySelector(`input[name="q${qn}"]:checked`)) answered++;
    });
    $("#progress").textContent = `${answered}/${TOTAL_ITEMS} respondidas`;

  } catch (_) {}
}

function clearAutosave() {
  localStorage.removeItem(AUTOSAVE_KEY);
}

// ================== ESTADO ==================
let patient = null, tokenRow = null, CPF = "";
let startAt = Date.now();

// ================== BOOT POR TOKEN ==================
(async function boot() {
  try {
    const TOKEN = qs("token");
    if (!TOKEN) {
      setBox("#alert", "Link inválido (sem token). Solicite um novo link.", "err");
      return;
    }

    const trows = await sheetSearch(SHEETS.TOKENS, { token: TOKEN });
    if (!trows?.length) throw new Error("Token inválido ou expirado.");
    tokenRow = trows[0];

    const disabled = String(tokenRow.disabled || "não").toLowerCase() === "sim";
    const expired  = tokenRow.expires_at && (Date.parse(tokenRow.expires_at) < Date.now());
    if (disabled || expired) throw new Error("Token desativado/expirado. Peça um novo link.");

    CPF = onlyDigits(tokenRow.cpf || "");
    if (!CPF) throw new Error("Token sem CPF vinculado.");

    const prows = await sheetSearch(SHEETS.PATIENTS, { cpf: CPF });
    if (!prows?.length) throw new Error("Paciente não encontrado.");
    patient = prows[0];

    const allowed = String(patient[CODE] || "").toLowerCase() === "sim";
    if (!allowed) {
      setBox("#alert", "Este formulário não está liberado para você. Entre em contato com o consultório.", "err");
      return;
    }

    const flagDone = String(patient[`${CODE}_FEITO`] || "").toLowerCase() === "sim";
    const already  = await sheetSearch(SHEETS.SCORES, { cpf: CPF, code: CODE });
    if (flagDone || (already && already.length)) {
      setBox("#alert", "Você já respondeu este formulário. Voltando ao portal…", "ok");
      setTimeout(goPortalWithToken, 1200);
      return;
    }

    renderPatientInfo();
    renderQuestions();
    $("#pacInfo").style.display = "grid";
    $("#form").style.display = "block";
    hideBox("#alert");
    startAt = Date.now();
    restoreAutosave();

  } catch (err) {
    console.error(err);
    setBox("#alert", err.message || "Falha ao abrir o formulário. Tente novamente mais tarde.", "err");
  }
})();

function renderPatientInfo() {
  const g = $("#pacInfo");
  g.innerHTML = "";
  const info = [
    ["Nome", patient.nome || "-"],
    ["Nascimento", fmtDateISO(patient.data_nascimento)]
  ];
  for (const [k, v] of info) {
    const d = document.createElement("div");
    d.className = "info";
    d.innerHTML = `<b>${k}</b><div>${v || "-"}</div>`;
    g.appendChild(d);
  }
}

// ================== BUILD QUESTIONS STRING ==================
function buildQuestionsString(obsAnswer, answers) {
  const lines = [];

  if (Array.isArray(obsAnswer) && obsAnswer.length) {
    lines.push(`Observação inicial: ${obsAnswer.join(", ")}`);
  } else if (obsAnswer) {
    lines.push(`Observação inicial: ${obsAnswer}`);
  }

  QUESTIONS.forEach(q => {
    const ans = answers[q.id] || "";
    lines.push(`${q.id}. ${q.text} => ${ans}`);
  });

  return lines.join(" | ");
}


// ================== SCORING ==================

// converte resposta "DT - Discordo Totalmente" em pontos (1–6), com inversão se necessário
function scoreItem(itemId, answerStr) {
  if (!answerStr) return 0;
  const code = (answerStr.split(" - ")[0] || "").trim();
  const base = SCALE_POINTS[code] || 0;
  const inverted = INVERTED_ITEMS.has(itemId);
  if (!base) return 0;
  return inverted ? (7 - base) : base; // escala 1–6 → inversão: 7 - v
}

// descrição por classificação
const CLASS_DESCRIPTIONS = {
  "INFERIOR": "Resultado muito abaixo do esperado para ser considerado um problema ou uma dificuldade.",
  "MÉDIA INFERIOR": "Resultado abaixo do esperado para ser considerado um problema ou uma dificuldade.",
  "MÉDIA": "Resultado compatível com a maior parte da população e não pode ser considerado um problema ou uma dificuldade.",
  "MÉDIA SUPERIOR": "Resultado compatível com prejuízos e dificuldades de nível moderado.",
  "SUPERIOR": "Resultado compatível com prejuízos importantes e sérias dificuldades, sendo considerado de nível grave."
};

// classificações por área
function classifyAtencao(score) {
  if (score <= 24) return "INFERIOR";
  if (score <= 30) return "MÉDIA INFERIOR";
  if (score <= 41) return "MÉDIA";
  if (score <= 58) return "MÉDIA SUPERIOR";
  return "SUPERIOR"; // até 90
}

function classifyHiper(score) {
  if (score <= 18) return "INFERIOR";
  if (score <= 24) return "MÉDIA INFERIOR";
  if (score <= 29) return "MÉDIA";
  if (score <= 45) return "MÉDIA SUPERIOR";
  return "SUPERIOR"; // até 72
}

function classifyAprendizagem(score) {
  if (score <= 23) return "INFERIOR";
  if (score <= 29) return "MÉDIA INFERIOR";
  if (score <= 39) return "MÉDIA";
  if (score <= 50) return "MÉDIA SUPERIOR";
  return "SUPERIOR"; // até 78
}

function classifyCompSocial(score) {
  if (score <= 6) return "INFERIOR";
  if (score <= 11) return "MÉDIA INFERIOR";
  if (score <= 12) return "MÉDIA";
  if (score <= 16) return "MÉDIA SUPERIOR";
  return "SUPERIOR"; // até 33
}

// calcula tudo de uma vez
function computeScores(answers) {
  const numericAnswers = {};
  QUESTIONS.forEach(q => {
    numericAnswers[q.id] = scoreItem(q.id, answers[q.id]);
  });

  const sumRange = (from, to) => {
    let s = 0;
    for (let i = from; i <= to; i++) {
      s += numericAnswers[i] || 0;
    }
    return s;
  };

  const atencaoScore = sumRange(1, 15);
  const hiperScore   = sumRange(16, 27);
  const aprScore     = sumRange(28, 40);
  const compSocScore = sumRange(41, 46);

  const totalScore = atencaoScore + hiperScore + aprScore + compSocScore;

  const atClass   = classifyAtencao(atencaoScore);
  const hiClass   = classifyHiper(hiperScore);
  const aprClass  = classifyAprendizagem(aprScore);
  const csClass   = classifyCompSocial(compSocScore);

  const atResult  = CLASS_DESCRIPTIONS[atClass] || "";
  const hiResult  = CLASS_DESCRIPTIONS[hiClass] || "";
  const aprResult = CLASS_DESCRIPTIONS[aprClass] || "";
  const csResult  = CLASS_DESCRIPTIONS[csClass] || "";

  const domains = {
    atencao: {
    
      score: atencaoScore,
      classificacao: atClass,
      resultado: atResult
    },
    hiperatividade_impulsividade: {
      
      score: hiperScore,
      classificacao: hiClass,
      resultado: hiResult
    },
    aprendizagem: {
      
      score: aprScore,
      classificacao: aprClass,
      resultado: aprResult
    },
    comportamento_social: {
     
      score: compSocScore,
      classificacao: csClass,
      resultado: csResult
    },
    total_geral: {
     
      score: totalScore
    }
  };

  const domain_scores = {
    atencao: atencaoScore,
    hiperatividade_impulsividade: hiperScore,
    aprendizagem: aprScore,
    comportamento_social: compSocScore
  };

  const domain_classes = {
    atencao: atClass,
    hiperatividade_impulsividade: hiClass,
    aprendizagem: aprClass,
    comportamento_social: csClass
  };

  const domain_results = {
    atencao: atResult,
    hiperatividade_impulsividade: hiResult,
    aprendizagem: aprResult,
    comportamento_social: csResult
  };

  return {
    numericAnswers,
    domains,
    domain_scores,
    domain_classes,
    domain_results,
    totalScore
  };
}

// ================== SUBMIT ==================
let sending = false;

$("#form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (sending) return;
  sending = true;
  hideBox("#msg");

  const btn = $("#btnSubmit");
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Enviando…";

  try {
    if (!patient) throw new Error("Sessão inválida. Recarregue o link.");

    let firstMissing = null;

    const obsNodes = document.querySelectorAll('input[name="obs_inicial"]:checked');
if (!obsNodes.length) firstMissing = "observação inicial";

const obsAnswer = Array.from(obsNodes).map(el => el.value); // array de textos


    const answers = {};
    for (const q of QUESTIONS) {
      const qn = String(q.id).padStart(2, "0");
      const sel = document.querySelector(`input[name="q${qn}"]:checked`);
      if (!sel && !firstMissing) {
        firstMissing = q.id;
      }
      if (sel) {
        answers[q.id] = sel.value; // ex: "DT - Discordo Totalmente"
      }
    }

    if (firstMissing) {
      setBox("#msg", `Responda o item ${firstMissing}.`, "warn");
      const elId = firstMissing === "observação inicial" ? "lblOBS" : `lbl${String(firstMissing).padStart(2, "0")}`;
      document.getElementById(elId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      sending = false;
      btn.disabled = false;
      btn.textContent = originalText;
      return;
    }

    const again = await sheetSearch(SHEETS.SCORES, { cpf: onlyDigits(patient.cpf), code: CODE });
    if (again && again.length) {
      setBox("#msg", "Este formulário já foi enviado anteriormente. Voltando ao portal…", "ok");
      setTimeout(goPortalWithToken, 1000);
      return;
    }

    const durationSec = Math.round((Date.now() - startAt) / 1000);

    // cálculo das pontuações por área
    const scoring = computeScores(answers);

    // string perguntas+respostas
    const questionsPayload = buildQuestionsString(obsAnswer, answers);

    const row = {
      result_id    : `${patient.cpf}_${CODE}_${Date.now()}`,
      token        : qs("token"),
      cpf          : patient.cpf,
      code         : CODE,
      source       : "professor",
      submitted_at : new Date().toISOString(),
      questions    : "",
      categoria    : JSON.stringify(scoring.domains), // áreas, pontuações, classificações, resultados
      metrics      : ""
    };

    await sheetCreate(SHEETS.SCORES, row);

    await sheetPatchBy(
      SHEETS.PATIENTS,
      "cpf",
      patient.cpf,
      {
        [`${CODE}_FEITO`]    : "sim",
        [`${CODE}_FEITO_AT`] : new Date().toISOString()
      }
    );

    clearAutosave();
    setBox("#msg", "Formulário enviado. Retornando ao portal…", "ok");
    setTimeout(goPortalWithToken, 1200);

  } catch (err) {
    console.error(err);
    setBox("#msg", err.message || "Falha ao enviar. Tente novamente.", "err");
    sending = false;
    btn.disabled = false;
    btn.textContent = originalText;
  }
});
