//Função que pega o nome do usuário
function login(){     
    const nome = document.querySelector('.login-texto').value;
    document.querySelector('.login-conteudo').classList.add('escondido');
    document.querySelector('.login-carregando').classList.remove('escondido');
    console.log(nome);
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
    setTimeout(function () {
        document.querySelector('.login').classList.add('escondido'); }
    ,3000)
    console.log('Logado!');
    console.log(objUser);   
    buscarParticipantes();
    //Checa usuário a cada 5 segundos
    setInterval(function () {
    let verificacao = axios.post('https://mock-api.driven.com.br/api/v6/uol/status',objUser);
    verificacao.catch(desconectado);}
    , 5000);    
    //Solicita ao servidor msgs a cada 3 segundos; busca participantes a cada 10s.
    setInterval(buscarMensagens, 3000);
    setInterval(buscarParticipantes, 10000);    
}

function buscarMensagens(){
    let requisicao = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    requisicao.then(msgSucesso);
    requisicao.catch(msgFail);
}

function loginFail(requisicao){
    alert('Este nome não está disponível, por favor, tente novamente.');
    document.querySelector('.login-conteudo').classList.remove('escondido');
    document.querySelector('.login-carregando').classList.add('escondido');    
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
//Funções que seguem após verificação de 5 segundos
function desconectado(requisicao){
    alert('Você foi desconectado! A página irá atualizar automaticamente.');   
    console.log(requisicao.response);
    window.location.reload();
}
function atualizarChat(msgs){
    const elemento = document.querySelector('.mensagens');
    elemento.innerHTML = "";
    //Encontra todas as mensagens:
    msgs.forEach(msg => {
        if (msg.type === "status") 
            elemento.innerHTML += `<div data-test="message" class="mbox status">
            <span class="horamsg">${msg.time}</span>
            <span class="pessoa remetente">${msg.from}</span>
            <span class="mensagem">${msg.text}</span>
        </div>`
        else if (msg.type === "message") {
            elemento.innerHTML += `<div data-test="message" class="mbox">
            <span class="horamsg">${msg.time}</span>
            <span class="pessoa remetente">${msg.from}</span>
            <span>para</span>
            <span class="pessoa destinatario">${msg.to}:</span>
            <span class="mensagem">${msg.text}</span>
        </div>`
        }        
        else if (msg.type === "private_message" && (objUser.name === msg.from || objUser.name === msg.to)) {
            elemento.innerHTML += `<div data-test="message" class="mbox reservado">
            <span class="horamsg">${msg.time}</span>
            <span class="pessoa remetente">${msg.from}</span>
            <span>reservadamente para</span>
            <span class="pessoa destinatario">${msg.to}:</span>
            <span></span>
            <span class="mensagem">${msg.text}</span>
        </div>`
        }                  
    });
    //O timer garante que o navegador não ficará preso na último objeto    
    const idIntervalScrollDown = setInterval(elemento.lastChild.scrollIntoView.bind(elemento.lastChild), 1000);
     /**Essa função vai apenas puxar pra última mensagem se o usuário estiver olhando pra ela.
         * Sem isso, ficaria preso embaixo a cada 3s!
         */
    elemento.innerHTML+=`<div></div>`;
     window.onscroll = function() {
        if (((window.innerHeight + window.scrollY) >= document.body.offsetHeight)) {
            idIntervalScrollDown;
        }
        else{
            clearInterval(idIntervalScrollDown);
        }        
    }
    //Se for a primeira vez, joga pro fim do chat
    if(previous==false){        
        elemento.lastChild.scrollIntoView();
        previous=true;
    }    
}

function enviarMensagem(){
    const mensagem = document.querySelector('#texto').value;
    const destinatario = document.querySelector('.paraDestinatario .destino').innerHTML;
    let tipoMsg = document.querySelector('.paraDestinatario .reservadamente').innerHTML;
    //Se tipoMsg estiver vazio, a mensagem é pública; se tiver algo, é privada
    tipoMsg == "" ? tipoMsg="message" : tipoMsg="private_message";
    const objMsg = {
        from: `${objUser.name}`,
        to: `${destinatario}`,
        text: `${mensagem}`,
        type: `${tipoMsg}`
    };
    document.querySelector('input').value = "";
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

//Seção dos participantes
function toggleParticipantes(){
    const fundo = document.querySelector(".fundo");
    const sidebar = document.querySelector(".participantes")
    fundo.classList.toggle('escondido');
    sidebar.classList.toggle('escondido');
}

//Seção dos participantes
function selecionaParticipante(elemento){
    document.querySelector(".contatos .check").classList.remove("check");
    elemento.querySelector("ion-icon[name='checkmark']").classList.add("check");
    const destino = document.querySelector('.paraDestinatario .destino');
    destino.innerHTML = elemento.querySelector('p').innerHTML;
}

function selecionaVisibilidade(elemento){
    document.querySelector(".visibilidade .check").classList.remove("check");
    elemento.querySelector("ion-icon[name='checkmark']").classList.add("check");
    const msgTipo = elemento.querySelector('p').innerHTML;
    const reservadamente = document.querySelector('.paraDestinatario .reservadamente');
    if(msgTipo === 'Público'){
        reservadamente.innerHTML = "";
    }
    else{
        reservadamente.innerHTML = "(reservadamente)";
    }
}

function buscarParticipantes(){
    console.log("Atualizou!");
    let requisicao = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    const elemento = document.querySelector('.contatos ul');
    //A cada 10s o elemento VAI resetar, e Todos estará checado como padrão novamente.
    //no entanto, não vai mudar a pessoa selecionada na msg, então nao tem muito problema.
    elemento.innerHTML = `<li data-test="all" onclick="selecionaParticipante(this);">
                <ion-icon name="people"></ion-icon>
                <p>Todos</p>
                <ion-icon data-test="check" class="check" name="checkmark"></ion-icon>
                </li>`
    //É necessário tratar erros de participantes?
    requisicao.then((participantesRecebidos) =>{
        const nomeParticipantes = participantesRecebidos.data;
        nomeParticipantes.forEach(participante => {
            elemento.innerHTML+=`<li data-test="participant" onclick="selecionaParticipante(this);">
                                <ion-icon name="person-circle"></ion-icon>
                                <p>${participante.name}</p>
                                <ion-icon data-test="check" name="checkmark"></ion-icon>
                                </li>
                                `;
        });
    });
}

//Objeto que deve ser enviado ao servidor
let objUser = {};
//Objeto para checar se é a primeira atualização de msg
let previous = false;
const enter = document.querySelector('input');
    enter.addEventListener("keydown", function(e){
        if (e.code === "Enter") {  //Funciona também se apertar enter
            enviarMensagem();
        }
    });
