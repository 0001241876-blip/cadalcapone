/** @jest-environment jsdom */

const fs = require("node:fs");
const path = require("node:path");

const projectFile = (name) => path.join(__dirname, name);
const indexHtml = fs.readFileSync(projectFile("index.html"), "utf8");
const appScript = fs.readFileSync(projectFile("script.js"), "utf8");

function loadApp() {
  const body = indexHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
  document.body.innerHTML = body;
  new Function(appScript)();
}

function fillValidForm(overrides = {}) {
  const values = {
    name: "Joana Silva Santos",
    address: "Rua das Flores, 123, Centro",
    email: "joana.silva@example.com",
    phone: "(11) 99999-9999",
    role: document.querySelector("#role option:nth-child(2)").value,
    salary: "3500",
    shift: "Manhã",
    ...overrides
  };

  Object.entries(values).forEach(([name, value]) => {
    document.querySelector(`[name="${name}"]`).value = value;
  });
}

function submitForm() {
  document.querySelector("#employee-form").dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true })
  );
}

beforeEach(() => {
  loadApp();
});

test("CT-01: cadastra funcionário válido, mostra sucesso e limpa o formulário", () => {
  fillValidForm();

  submitForm();

  expect(document.querySelector("#form-notice").textContent).toBe(
    "Funcionário cadastrado com sucesso."
  );
  expect(document.querySelector("#form-notice").classList.contains("visible")).toBe(true);
  expect(document.querySelector("#employee-list li strong").textContent).toBe(
    "Joana Silva Santos"
  );
  expect(document.querySelector("#employee-count").textContent).toBe("1");
  expect(document.querySelector("#empty-state").hidden).toBe(true);
  expect(document.querySelector('[name="name"]').value).toBe("");
  expect(document.querySelector('[name="role"]').value).toBe("");
  expect(document.querySelector('[name="shift"]').value).toBe("");
});

test("CT-02: impede cadastro sem nome e informa que o campo é obrigatório", () => {
  fillValidForm({ name: "" });

  submitForm();

  expect(document.querySelector("#name-error").textContent).toBe(
    "O campo Nome é obrigatório."
  );
  expect(document.querySelector('[name="name"]').getAttribute("aria-invalid")).toBe("true");
  expect(document.querySelector("#employee-list").children).toHaveLength(0);
});

test("CT-03: impede cadastro com e-mail inválido", () => {
  fillValidForm({ email: "joao.silva" });

  submitForm();

  expect(document.querySelector("#email-error").textContent).toBe(
    "Informe um endereço de e-mail válido."
  );
  expect(document.querySelector("#employee-list").children).toHaveLength(0);
});

test("CT-04: permite selecionar apenas um turno e mantém o último escolhido", () => {
  const shift = document.querySelector('[name="shift"]');
  shift.value = "Manhã";
  shift.value = "Noite";

  expect(shift.value).toBe("Noite");
  expect(shift.selectedOptions).toHaveLength(1);
});

test("CT-05: impede cadastro com salário negativo", () => {
  fillValidForm({ salary: "-1500" });

  submitForm();

  expect(document.querySelector("#salary-error").textContent).toBe(
    "O salário deve ser maior que zero."
  );
  expect(document.querySelector("#employee-list").children).toHaveLength(0);
});

test("CT-06: impede cadastro sem cargo selecionado", () => {
  fillValidForm({ role: "" });

  submitForm();

  expect(document.querySelector("#role-error").textContent).toBe("Selecione um cargo.");
  expect(document.querySelector("#employee-list").children).toHaveLength(0);
});

test("CT-07: impede cadastro sem turno selecionado", () => {
  fillValidForm({ shift: "" });

  submitForm();

  expect(document.querySelector("#shift-error").textContent).toBe("Selecione um turno.");
  expect(document.querySelector("#employee-list").children).toHaveLength(0);
});

test("CT-08: impede cadastro com telefone de menos de 10 dígitos", () => {
  fillValidForm({ phone: "123456789" });

  submitForm();

  expect(document.querySelector("#phone-error").textContent).toBe(
    "Informe um telefone válido com DDD."
  );
  expect(document.querySelector("#employee-list").children).toHaveLength(0);
});

test("CT-09: botão limpar apaga campos, erros e aviso", () => {
  fillValidForm({ email: "joao.silva" });
  submitForm();

  document.querySelector("#clear-button").click();

  expect(document.querySelector('[name="name"]').value).toBe("");
  expect(document.querySelector('[name="email"]').value).toBe("");
  expect(document.querySelector("#email-error").textContent).toBe("");
  expect(document.querySelector('[name="email"]').hasAttribute("aria-invalid")).toBe(false);
  expect(document.querySelector("#form-notice").classList.contains("visible")).toBe(false);
});

test("CT-10: CSS adapta o formulário e permite rolar a tabela em telas estreitas", () => {
  const styles = fs.readFileSync(projectFile("style.css"), "utf8");

  expect(styles).toMatch(/\.table-wrap\s*\{\s*overflow-x:\s*auto;/);
  expect(styles).toMatch(
    /@media\s*\(max-width:\s*650px\)[\s\S]*?\.form-grid\s*\{\s*grid-template-columns:\s*1fr;/
  );
  expect(styles).toMatch(
    /@media\s*\(max-width:\s*650px\)[\s\S]*?table\s*\{\s*min-width:\s*790px;/
  );
});
