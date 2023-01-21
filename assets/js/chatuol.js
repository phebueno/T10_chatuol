//Função que pega o nome do usuário
function entrarNaSala(){
    const nome = prompt("Insira seu nome para o login:");
    return nome;
    }
//Funções que retornam status do login, periodicamente
function loginSuccess(requisicao){
    console.log('Logado!');
    console.log(requisicao);
}

function loginFail(requisicao){
    console.log('ixi, deu ruim');
    console.log(requisicao.response);
}

//Retornam as mensagens, periodicamente

function msgSucesso(msgs){
    console.log('Achamos suas mensagens!');
    atualizarChat(msgs.data);
}

function msgFail(msgs){
    console.log('Não achamos nada :(');
    console.log(msgs.response);
}

//Objeto que deve ser enviado ao servidor
let login={
    name:entrarNaSala()
};
//Envia ao server
const requisicao = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants',login);
requisicao.then(loginSuccess);
requisicao.catch(loginFail);

//Checa usuário a cada 5 segundos
setInterval(function () {
    let verificacao = axios.post('https://mock-api.driven.com.br/api/v6/uol/status',login);
    verificacao.then(loginSuccess);
    verificacao.catch(loginFail);}
    , 5000);

//Solicita ao servidor msgs a cada 3 segundos
setInterval(function () {
    let buscarMensagem = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    buscarMensagem.then(msgSucesso);
    buscarMensagem.catch(msgFail);}
    , 3000);

function atualizarChat(msgs){
    const elemento = document.querySelector('.mensagens');
    elemento.innerHTML = "";
    //Encontra todas as mensagens:
    msgs.forEach(msg => {
        if (msg.type==="status") 
            elemento.innerHTML += `<div class="mbox status">
            <span class="horamsg">${msg.time}</span>
            <span class="pessoa remetente">${msg.from}</span>
            <span class="mensagem">${msg.text}</span>
        </div>`
        else if (msg.type==="message") {
            elemento.innerHTML += `<div class="mbox">
            <span class="horamsg">${msg.time}</span>
            <span class="pessoa remetente">${msg.from}</span>
            <span>para</span>
            <span class="pessoa destinatario">${msg.to}:</span>
            <span class="mensagem">${msg.text}</span>
        </div>`
        }
        //FALTA ADICIONAR CONDIÇÕES DENTRO DA MENSAGEM PRIVADA
        else if (msg.type==="private_message") {
            elemento.innerHTML += `<div class="mbox reservado">
            <span class="horamsg">${msg.time}</span>
            <span class="pessoa remetente">${msg.from}</span>
            <span>reservadamente para</span>
            <span class="pessoa destinatario">${msg.to}:</span>
            <span></span>
            <span class="mensagem">${msg.text}</span>
        </div>`
        }
        elemento.lastChild.scrollIntoView();
    });    
}
