const positions = [
  "Auxiliar de Estoque",
  "Motorista Entregador(a)",
  "Representante Comercial",
  "Assistente Financeiro",
  "Auxiliar de Logística",
  "Promotor(a) de Vendas"
];

const roleSelect = document.getElementById("role");
const form = document.getElementById("employee-form");
const notice = document.getElementById("form-notice");
const salaryInput = document.getElementById("salary");
const employeeList = document.getElementById("employee-list");
const emptyState = document.getElementById("empty-state");
const employeeCount = document.getElementById("employee-count");
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

positions.forEach((position) => {
  const option = document.createElement("option");
  option.value = position;
  option.textContent = position;
  roleSelect.append(option);
});

function parseSalary(value) {
  let normalized = value.trim().replace(/R\$\s?/gi, "").replace(/\s/g, "");
  if (!normalized) return NaN;

  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if ((normalized.match(/\./g) || []).length > 1) {
    normalized = normalized.replace(/\./g, "");
  } else if (/^-?\d{1,3}\.\d{3}$/.test(normalized)) {
    normalized = normalized.replace(".", "");
  }

  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return NaN;
  return Number(normalized);
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach((message) => {
    message.textContent = "";
  });
  form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
    field.removeAttribute("aria-invalid");
  });
}

function setError(fieldName, message) {
  const field = form.elements[fieldName];
  const error = document.getElementById(`${fieldName}-error`);
  field.setAttribute("aria-invalid", "true");
  error.textContent = message;
  return field;
}

function validateForm() {
  clearErrors();
  const errors = [];
  const name = form.elements.name.value.trim();
  const address = form.elements.address.value.trim();
  const email = form.elements.email.value.trim();
  const phoneDigits = form.elements.phone.value.replace(/\D/g, "");
  const salaryValue = parseSalary(salaryInput.value);

  if (!name) errors.push(setError("name", "O campo Nome é obrigatório."));
  if (!address) errors.push(setError("address", "O campo Endereço é obrigatório."));
  if (!email) {
    errors.push(setError("email", "O campo E-mail é obrigatório."));
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.push(setError("email", "Informe um endereço de e-mail válido."));
  }
  if (!phoneDigits) {
    errors.push(setError("phone", "O campo Telefone é obrigatório."));
  } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.push(setError("phone", "Informe um telefone válido com DDD."));
  }
  if (!form.elements.role.value) errors.push(setError("role", "Selecione um cargo."));
  if (!salaryInput.value.trim()) {
    errors.push(setError("salary", "O campo Salário é obrigatório."));
  } else if (!Number.isFinite(salaryValue)) {
    errors.push(setError("salary", "Informe um valor válido em reais."));
  } else if (salaryValue <= 0) {
    errors.push(setError("salary", "O salário deve ser maior que zero."));
  }
  if (!form.elements.shift.value) errors.push(setError("shift", "Selecione um turno."));

  if (errors.length) {
    errors[0].focus();
    return null;
  }

  return {
    name,
    role: form.elements.role.value,
    shift: form.elements.shift.value,
    salary: currencyFormatter.format(salaryValue)
  };
}

salaryInput.addEventListener("blur", () => {
  const value = parseSalary(salaryInput.value);
  if (salaryInput.value.trim() && Number.isFinite(value)) {
    salaryInput.value = currencyFormatter.format(value);
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const employee = validateForm();
  if (!employee) {
    notice.classList.remove("visible");
    return;
  }

  const item = document.createElement("li");
  const details = document.createElement("div");
  const name = document.createElement("strong");
  const summary = document.createElement("span");
  const salary = document.createElement("span");

  name.textContent = employee.name;
  summary.textContent = `${employee.role} · ${employee.shift}`;
  salary.textContent = employee.salary;
  details.append(name, summary);
  item.append(details, salary);
  employeeList.prepend(item);
  emptyState.hidden = true;

  const count = employeeList.children.length;
  employeeCount.textContent = String(count);
  employeeCount.setAttribute("aria-label", `${count} ${count === 1 ? "funcionário cadastrado" : "funcionários cadastrados"}`);
  form.reset();
  clearErrors();
  notice.textContent = "Funcionário cadastrado com sucesso.";
  notice.classList.add("visible");
});

form.addEventListener("reset", () => {
  clearErrors();
  notice.classList.remove("visible");
});
