//Função que pega o nome do usuário
function login(){     
    const nome = prompt("Insira seu nome para o login:");
    objUser={
        name:nome
    }; 
    //Envia ao server
    const requisicao = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants',objUser);
    requisicao.then(loginSuccess);
    requisicao.catch(loginFail);       
}
//Funções que ocorrem após login, periodicamente
function loginSuccess(requisicao){
    console.log('Logado!');
    console.log(objUser);
    //Checa usuário a cada 5 segundos
    setInterval(function () {
    let verificacao = axios.post('https://mock-api.driven.com.br/api/v6/uol/status',objUser);
    verificacao.catch(desconectado);}
    , 5000);
    //Solicita ao servidor msgs a cada 3 segundos.
    setInterval(buscarMensagens, 3000);    
}

function buscarMensagens(){
    let requisicao = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    requisicao.then(msgSucesso);
    requisicao.catch(msgFail);
}

function loginFail(requisicao){
    alert('Este nome não está disponível, por favor, tente novamente.');    
    console.log(requisicao.response);
    login(); //recursividade no login!
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
//Funções que seguem após verificação de 5 segundos
function desconectado(requisicao){
    alert('Você foi desconectado! A página irá atualizar automaticamente.');   
    console.log(requisicao.response);
    window.location.reload();
}
//Objeto que deve ser enviado ao servidor
let objUser = {};
login();
const enter = document.querySelector('input');
    enter.addEventListener("keydown", function(e){
        if (e.code === "Enter") {  //Funciona também se apertar enter
            enviarMensagem();
        }
    });

function atualizarChat(msgs){
    const elemento = document.querySelector('.mensagens');
    elemento.innerHTML = "";
    //Encontra todas as mensagens:
    msgs.forEach(msg => {
        if (msg.type ==="status") 
            elemento.innerHTML += `<div data-test="message" class="mbox status">
            <span class="horamsg">${msg.time}</span>
            <span class="pessoa remetente">${msg.from}</span>
            <span class="mensagem">${msg.text}</span>
        </div>`
        else if (msg.type ==="message") {
            elemento.innerHTML += `<div data-test="message" class="mbox">
            <span class="horamsg">${msg.time}</span>
            <span class="pessoa remetente">${msg.from}</span>
            <span>para</span>
            <span class="pessoa destinatario">${msg.to}:</span>
            <span class="mensagem">${msg.text}</span>
        </div>`
        }
        //FALTA ADICIONAR CONDIÇÕES DENTRO DA MENSAGEM PRIVADA
        else if (msg.type ==="private_message") {
            elemento.innerHTML += `<div data-test="message" class="mbox reservado">
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

function enviarMensagem(){
    const mensagem = document.querySelector('input').value;
    const objMsg = {
        from: `${objUser.name}`,
        to: "Todos",
        text: `${mensagem}`,
        type: "message"
    };
    const requisicao = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages',objMsg);
    requisicao.then(envioSuccess);
    requisicao.catch(envioFail);
}

function envioSuccess(){
    //Realiza uma única instância de busca de mensagens
    buscarMensagens();
}

function envioFail(requisicao){
    alert('Você foi desconectado e sua mensagem não foi entregue! A página irá atualizar automaticamente.');   
    console.log(requisicao.response);
    window.location.reload();
}
