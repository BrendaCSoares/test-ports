let ports = [80, 443, 1023, 1024, 1025, 1026, 7575, 8080, 8095, 9085];

document.getElementById("closeConfigBtn")
  .addEventListener("click", fecharConfig);

document.getElementById("addPortaBtn")
  .addEventListener("click", adicionarPorta);

document.getElementById("scanBtn")
  .addEventListener("click", consultarIP);

document.getElementById("configBtn")
  .addEventListener("click", abrirConfig);

window.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("ipInput");

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      consultarIP();
    }
  });

});

async function consultarIP(){

  const resultado = document.getElementById("resultadoScan");
  const ip = document.getElementById("ipInput").value;

  if(ip.trim() === ""){
  alert("Digite um IP!");
  return;
  }

  const regexIP =
  /^(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)$/;

  if(!regexIP.test(ip)){
  alert("IP inválido!");
  return;
  }

  resultado.innerHTML = "⏳ Escaneando portas...";
  
  document.getElementById("scanBtn").disabled = true;
  
  const resultados = await Promise.all(

    ports.map(async (porta) => {

      const resultado = await testarPorta(ip, porta);

      return {
        porta,
        aberta: resultado.aberta,
        protocolo: resultado.protocolo
      };
    })
  );

  resultado.innerHTML = "";
  resultados.forEach(({ porta, aberta, protocolo }) => {

  const div = document.createElement("div");
  div.className = "port-item";

  const span = document.createElement("span");
  span.textContent = `Porta ${porta}`;

  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.gap = "10px";
  wrapper.style.alignItems = "center";

  const status = document.createElement("div");

  status.className = aberta
    ? "status-open"
    : "status-closed";

  status.innerHTML = `
    <span class="status-dot"></span>
    ${aberta ? "ABERTA" : "FECHADA"}
  `;

  const btn = document.createElement("button");

  btn.className = aberta
    ? "open-btn"
    : "closed-btn";

  btn.textContent = "Acessar";

  btn.addEventListener("click", () => {
    abrirPorta(ip, porta, protocolo);
  });

  wrapper.appendChild(status);
  wrapper.appendChild(btn);

  div.appendChild(span);
  div.appendChild(wrapper);

  resultado.appendChild(div);
  });

  document.getElementById("scanBtn").disabled = false;
}

function abrirPorta(ip, porta, protocolo){

  const protocolo =
    porta === 443 || porta === 8443
      ? "https"
      : "http";

  const url = `${protocolo}://${ip}:${porta}`;

  chrome.runtime.sendMessage({
    type: "OPEN_TAB",
    url: url
  });
}

function testarPorta(ip, porta){

  return new Promise(async (resolve) => {

    const protocolos = ["http", "https"];

    for(const protocolo of protocolos){

      try{

        await Promise.race([

          fetch(`${protocolo}://${ip}:${porta}`, {
            mode: "no-cors"
          }),

          new Promise((_, reject) =>
            setTimeout(() => reject(), 1500)
          )

        ]);

        resolve({
          aberta: true,
          protocolo
        });

        return;

      }catch(err){}
    }

    resolve({
      aberta: false,
      protocolo: "http"
    });

  });
}

function abrirConfig(){

  document.getElementById("modalConfig")
    .style.display = "flex";

  renderizarPortas();

  const input = document.getElementById("portaInput");

  input.focus();

  input.onkeydown = (event) => {
    if(event.key === "Enter"){
      event.preventDefault();
      adicionarPorta();
    }
  };
}

function fecharConfig(){
  document.getElementById("modalConfig")
    .style.display = "none";
}

function adicionarPorta(){

  const input = document.getElementById("portaInput");
  const valor = input.value.trim();

  const porta = Number(valor);

  if(valor === "" || isNaN(porta)){
    alert("Digite uma porta válida!");
    return;
  }

  if(porta < 1 || porta > 65535){
    alert("Porta inválida! (1-65535)");
    return;
  }

  if(ports.includes(porta)){
    alert("Essa porta já existe!");
    return;
  }

  ports.push(porta);

  input.value = "";

  renderizarPortas();
}

function removerPorta(porta){
  ports = ports.filter(p => p !== porta);
  renderizarPortas();
}

function renderizarPortas(){

  const lista = document.getElementById("listaPortas");

  lista.innerHTML = "";

  ports.forEach(porta => {

    const item = document.createElement("div");
    item.className = "port-item";

    const span = document.createElement("span");
    span.textContent = `Porta ${porta}`;

    const btn = document.createElement("button");
    btn.className = "delete-btn";
    btn.textContent = "✕";

    btn.addEventListener("click", () => {
      removerPorta(porta);
    });

    item.appendChild(span);
    item.appendChild(btn);

    lista.appendChild(item);
  });
}

renderizarPortas();

window.abrirPorta = abrirPorta;
window.abrirConfig = abrirConfig;
window.fecharConfig = fecharConfig;
window.adicionarPorta = adicionarPorta;
window.removerPorta = removerPorta;
window.consultarIP = consultarIP;